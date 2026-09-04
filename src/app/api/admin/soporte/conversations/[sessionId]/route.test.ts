import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";

const mocks = vi.hoisted(() => ({
  authenticate: vi.fn(),
  isAdmin: vi.fn(),
  getSupabaseAdmin: vi.fn(),
}));

vi.mock("@/lib/marketplace/auth", () => ({
  authenticate: mocks.authenticate,
  isAdmin: mocks.isAdmin,
}));
vi.mock("@/lib/supabaseAdmin", () => ({ getSupabaseAdmin: mocks.getSupabaseAdmin }));

import { GET } from "./route";

type TurnRow = {
  id: string;
  created_at: string;
  channel: string;
  locale: string | null;
  plan: string | null;
  question: string;
  answer: string;
  escalated: boolean;
  reason: string | null;
  topic: string | null;
  prompt_version: string | null;
};

interface RecordedCalls {
  eq: Array<[string, unknown]>;
  order: Array<[string, unknown]>;
}

function newCalls(): RecordedCalls {
  return { eq: [], order: [] };
}

function makeSupabaseStub(
  config: { rows?: TurnRow[]; error?: { message: string } | null },
  calls: RecordedCalls,
): SupabaseClient {
  return {
    from(table: string) {
      if (table !== "support_conversations") {
        throw new Error(`unexpected table in test stub: ${table}`);
      }
      const builder: Record<string, unknown> = {
        select(_cols: string) {
          return builder;
        },
        eq(col: string, val: unknown) {
          calls.eq.push([col, val]);
          return builder;
        },
        order(col: string, opts: unknown) {
          calls.order.push([col, opts]);
          return builder;
        },
        then(resolve: (v: { data: unknown; error: unknown }) => unknown) {
          return resolve({ data: config.rows ?? [], error: config.error ?? null });
        },
      };
      return builder;
    },
  } as unknown as SupabaseClient;
}

function request(sessionId: string): Request {
  return new Request(
    `https://terminalsync.ai/api/admin/soporte/conversations/${encodeURIComponent(sessionId)}`,
    { method: "GET", headers: { Authorization: "Bearer admin-token" } },
  );
}

function ctx(sessionId: string) {
  return { params: Promise.resolve({ sessionId }) };
}

const TURN_1: TurnRow = {
  id: "turn-1",
  created_at: "2026-08-01T00:00:00Z",
  channel: "app",
  locale: "es",
  plan: "pro",
  question: "¿Cómo cancelo mi suscripción?",
  answer: "Desde Ajustes → Facturación → Cancelar.",
  escalated: false,
  reason: null,
  topic: "facturacion",
  prompt_version: "2026-07-01",
};

const TURN_2: TurnRow = {
  id: "turn-2",
  created_at: "2026-08-01T00:05:00Z",
  channel: "app",
  locale: "es",
  plan: "pro",
  question: "Pero me cobraron igual",
  answer: "Te derivo con un humano.",
  escalated: true,
  reason: "billing",
  topic: "facturacion",
  prompt_version: "2026-07-01",
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.authenticate.mockResolvedValue({ id: "admin-1", email: "jm@terminalsync.ai" });
  mocks.isAdmin.mockReturnValue(true);
});

describe("GET /api/admin/soporte/conversations/[sessionId]", () => {
  it("rejects unauthenticated requests", async () => {
    mocks.authenticate.mockResolvedValue(null);
    const res = await GET(request("sess-a"), ctx("sess-a"));
    expect(res.status).toBe(401);
    expect(mocks.getSupabaseAdmin).not.toHaveBeenCalled();
  });

  it("rejects non-admin requests", async () => {
    mocks.isAdmin.mockReturnValue(false);
    const res = await GET(request("sess-a"), ctx("sess-a"));
    expect(res.status).toBe(403);
  });

  it("fails closed when Supabase is not configured", async () => {
    mocks.getSupabaseAdmin.mockReturnValue(null);
    const res = await GET(request("sess-a"), ctx("sess-a"));
    expect(res.status).toBe(503);
  });

  it("returns every turn for the session, oldest first, mapped to camelCase", async () => {
    const calls = newCalls();
    mocks.getSupabaseAdmin.mockReturnValue(makeSupabaseStub({ rows: [TURN_1, TURN_2] }, calls));

    const res = await GET(request("sess-a"), ctx("sess-a"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.sessionId).toBe("sess-a");
    expect(body.turns).toEqual([
      {
        id: "turn-1",
        createdAt: "2026-08-01T00:00:00Z",
        channel: "app",
        locale: "es",
        plan: "pro",
        question: "¿Cómo cancelo mi suscripción?",
        answer: "Desde Ajustes → Facturación → Cancelar.",
        escalated: false,
        reason: null,
        topic: "facturacion",
        promptVersion: "2026-07-01",
      },
      {
        id: "turn-2",
        createdAt: "2026-08-01T00:05:00Z",
        channel: "app",
        locale: "es",
        plan: "pro",
        question: "Pero me cobraron igual",
        answer: "Te derivo con un humano.",
        escalated: true,
        reason: "billing",
        topic: "facturacion",
        promptVersion: "2026-07-01",
      },
    ]);
    expect(calls.eq).toContainEqual(["session_id", "sess-a"]);
    expect(calls.order).toContainEqual(["created_at", { ascending: true }]);
  });

  it("returns 404 for a session_id with no rows", async () => {
    const calls = newCalls();
    mocks.getSupabaseAdmin.mockReturnValue(makeSupabaseStub({ rows: [] }, calls));

    const res = await GET(request("nope"), ctx("nope"));
    expect(res.status).toBe(404);
  });

  it("returns 500 when the Supabase query fails", async () => {
    const calls = newCalls();
    mocks.getSupabaseAdmin.mockReturnValue(
      makeSupabaseStub({ error: { message: "connection reset" } }, calls),
    );

    const res = await GET(request("sess-a"), ctx("sess-a"));
    expect(res.status).toBe(500);
  });
});
