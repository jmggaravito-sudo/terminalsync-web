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

type SessionRow = {
  session_id: string;
  first_turn_at: string;
  last_turn_at: string;
  turn_count: number;
  has_escalation: boolean;
  escalation_reasons: string[] | null;
  has_unknown_gap: boolean;
  channel: string;
  locale: string | null;
  plan: string | null;
  topic: string | null;
};

interface RecordedCalls {
  eq: Array<[string, unknown]>;
  ilike: Array<[string, unknown]>;
  range: Array<[number, number]>;
  order: Array<[string, unknown]>;
}

function newCalls(): RecordedCalls {
  return { eq: [], ilike: [], range: [], order: [] };
}

/** Minimal PostgREST query-builder stub scoped to
 *  `support_conversation_sessions`, mirroring the pattern in
 *  src/app/api/credits/ledger/route.test.ts: every chained method returns
 *  the same builder (so any call order works) and records what the route
 *  actually sent, and the builder itself is the thenable that resolves to
 *  `{ data, error, count }`. */
function makeSupabaseStub(
  config: { rows?: SessionRow[]; error?: { message: string } | null; count?: number | null },
  calls: RecordedCalls,
): SupabaseClient {
  return {
    from(table: string) {
      if (table !== "support_conversation_sessions") {
        throw new Error(`unexpected table in test stub: ${table}`);
      }
      const builder: Record<string, unknown> = {
        select(_cols: string, _opts?: unknown) {
          return builder;
        },
        order(col: string, opts: unknown) {
          calls.order.push([col, opts]);
          return builder;
        },
        eq(col: string, val: unknown) {
          calls.eq.push([col, val]);
          return builder;
        },
        ilike(col: string, val: unknown) {
          calls.ilike.push([col, val]);
          return builder;
        },
        range(a: number, b: number) {
          calls.range.push([a, b]);
          return builder;
        },
        then(resolve: (v: { data: unknown; error: unknown; count: unknown }) => unknown) {
          return resolve({
            data: config.rows ?? [],
            error: config.error ?? null,
            count: config.count ?? (config.rows ?? []).length,
          });
        },
      };
      return builder;
    },
  } as unknown as SupabaseClient;
}

function request(query = ""): Request {
  return new Request(`https://terminalsync.ai/api/admin/soporte/conversations${query}`, {
    method: "GET",
    headers: { Authorization: "Bearer admin-token" },
  });
}

const SESSION_A: SessionRow = {
  session_id: "sess-a",
  first_turn_at: "2026-08-01T00:00:00Z",
  last_turn_at: "2026-08-01T00:05:00Z",
  turn_count: 3,
  has_escalation: true,
  escalation_reasons: ["billing"],
  has_unknown_gap: false,
  channel: "app",
  locale: "es",
  plan: "pro",
  topic: "facturacion",
};

const SESSION_B: SessionRow = {
  session_id: "sess-b",
  first_turn_at: "2026-08-02T00:00:00Z",
  last_turn_at: "2026-08-02T00:02:00Z",
  turn_count: 1,
  has_escalation: false,
  escalation_reasons: [],
  has_unknown_gap: true,
  channel: "web",
  locale: "en",
  plan: null,
  topic: null,
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.authenticate.mockResolvedValue({ id: "admin-1", email: "jm@terminalsync.ai" });
  mocks.isAdmin.mockReturnValue(true);
});

describe("GET /api/admin/soporte/conversations", () => {
  it("rejects unauthenticated requests", async () => {
    mocks.authenticate.mockResolvedValue(null);
    const res = await GET(request());
    expect(res.status).toBe(401);
    expect(mocks.getSupabaseAdmin).not.toHaveBeenCalled();
  });

  it("rejects non-admin requests", async () => {
    mocks.isAdmin.mockReturnValue(false);
    const res = await GET(request());
    expect(res.status).toBe(403);
  });

  it("fails closed when Supabase is not configured", async () => {
    mocks.getSupabaseAdmin.mockReturnValue(null);
    const res = await GET(request());
    expect(res.status).toBe(503);
  });

  it("maps rows to camelCase sessions, most-recent-first, with pagination metadata", async () => {
    const calls = newCalls();
    mocks.getSupabaseAdmin.mockReturnValue(
      makeSupabaseStub({ rows: [SESSION_A, SESSION_B], count: 2 }, calls),
    );

    const res = await GET(request());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.total).toBe(2);
    expect(body.page).toBe(1);
    expect(body.hasMore).toBe(false);
    expect(body.sessions).toEqual([
      {
        sessionId: "sess-a",
        firstTurnAt: "2026-08-01T00:00:00Z",
        lastTurnAt: "2026-08-01T00:05:00Z",
        turnCount: 3,
        channel: "app",
        locale: "es",
        plan: "pro",
        topic: "facturacion",
        hasEscalation: true,
        escalationReasons: ["billing"],
        hasUnknownGap: false,
      },
      {
        sessionId: "sess-b",
        firstTurnAt: "2026-08-02T00:00:00Z",
        lastTurnAt: "2026-08-02T00:02:00Z",
        turnCount: 1,
        channel: "web",
        locale: "en",
        plan: null,
        topic: null,
        hasEscalation: false,
        escalationReasons: [],
        hasUnknownGap: true,
      },
    ]);
    expect(calls.order).toContainEqual(["last_turn_at", { ascending: false }]);
    expect(calls.range).toContainEqual([0, 24]);
  });

  it("filters escalated sessions with ?filter=escalated", async () => {
    const calls = newCalls();
    mocks.getSupabaseAdmin.mockReturnValue(makeSupabaseStub({ rows: [SESSION_A] }, calls));

    await GET(request("?filter=escalated"));
    expect(calls.eq).toContainEqual(["has_escalation", true]);
    expect(calls.eq).not.toContainEqual(["has_unknown_gap", true]);
  });

  it('filters "the bot didn\'t know" sessions with ?filter=unknown', async () => {
    const calls = newCalls();
    mocks.getSupabaseAdmin.mockReturnValue(makeSupabaseStub({ rows: [SESSION_B] }, calls));

    await GET(request("?filter=unknown"));
    expect(calls.eq).toContainEqual(["has_unknown_gap", true]);
  });

  it("ignores an invalid ?filter= instead of failing the request", async () => {
    const calls = newCalls();
    mocks.getSupabaseAdmin.mockReturnValue(makeSupabaseStub({ rows: [] }, calls));

    const res = await GET(request("?filter=bogus"));
    expect(res.status).toBe(200);
    expect(calls.eq).toEqual([]);
  });

  it("searches question/answer text server-side via ilike on search_blob", async () => {
    const calls = newCalls();
    mocks.getSupabaseAdmin.mockReturnValue(makeSupabaseStub({ rows: [] }, calls));

    await GET(request("?q=reembolso"));
    expect(calls.ilike).toContainEqual(["search_blob", "%reembolso%"]);
  });

  it("escapes % and _ in the search term so it can't act as a wildcard", async () => {
    const calls = newCalls();
    mocks.getSupabaseAdmin.mockReturnValue(makeSupabaseStub({ rows: [] }, calls));

    await GET(request(`?q=${encodeURIComponent("100%_off")}`));
    expect(calls.ilike).toContainEqual(["search_blob", "%100\\%\\_off%"]);
  });

  it("paginates with ?page=2 using a 25-row window", async () => {
    const calls = newCalls();
    mocks.getSupabaseAdmin.mockReturnValue(makeSupabaseStub({ rows: [], count: 30 }, calls));

    const res = await GET(request("?page=2"));
    expect(calls.range).toContainEqual([25, 49]);
    const body = await res.json();
    expect(body.page).toBe(2);
  });

  it("returns 500 when the Supabase query fails", async () => {
    const calls = newCalls();
    mocks.getSupabaseAdmin.mockReturnValue(
      makeSupabaseStub({ error: { message: "connection reset" } }, calls),
    );

    const res = await GET(request());
    expect(res.status).toBe(500);
  });
});
