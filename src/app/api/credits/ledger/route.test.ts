import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";

const mocks = vi.hoisted(() => ({
  authenticate: vi.fn(),
  getSupabaseAdmin: vi.fn(),
}));

vi.mock("@/lib/marketplace/auth", () => ({ authenticate: mocks.authenticate }));
vi.mock("@/lib/supabaseAdmin", () => ({ getSupabaseAdmin: mocks.getSupabaseAdmin }));

import { GET, OPTIONS } from "./route";

interface AccountRow {
  balance_micros: number;
  currency: string;
  updated_at: string;
}

interface LedgerRow {
  id: string;
  amount_micros: number;
  rail: string | null;
  created_at: string;
}

interface RecordedCalls {
  accountEq: Array<[string, unknown]>;
  ledgerEq: Array<[string, unknown]>;
  ledgerGt: Array<[string, unknown]>;
}

function newCalls(): RecordedCalls {
  return { accountEq: [], ledgerEq: [], ledgerGt: [] };
}

/**
 * Minimal PostgREST query-builder stub, scoped to the two tables this route
 * touches. Mirrors the pattern in
 * src/app/api/marketplace/catalog/route.test.ts: methods return the same
 * builder so any chain shape works, and calls the route actually makes
 * (`eq`, `gt`) are recorded so tests can assert on the filters sent to
 * Supabase, not just the final response.
 */
function makeSupabaseStub(
  config: {
    account?: AccountRow | null;
    accountError?: { message: string } | null;
    ledgerRows?: LedgerRow[];
    ledgerError?: { message: string } | null;
  },
  calls: RecordedCalls,
): SupabaseClient {
  return {
    from(table: string) {
      if (table === "ai_credit_accounts") {
        const builder = {
          select(_cols: string) {
            return builder;
          },
          eq(col: string, val: unknown) {
            calls.accountEq.push([col, val]);
            return builder;
          },
          async maybeSingle() {
            return {
              data: config.account ?? null,
              error: config.accountError ?? null,
            };
          },
        };
        return builder;
      }
      if (table === "ai_credit_ledger") {
        const builder: Record<string, unknown> = {
          select(_cols: string) {
            return builder;
          },
          eq(col: string, val: unknown) {
            calls.ledgerEq.push([col, val]);
            return builder;
          },
          order(_col: string, _opts: unknown) {
            return builder;
          },
          limit(_n: number) {
            return builder;
          },
          gt(col: string, val: unknown) {
            calls.ledgerGt.push([col, val]);
            return builder;
          },
          then(resolve: (v: { data: unknown; error: unknown }) => unknown) {
            return resolve({
              data: config.ledgerRows ?? [],
              error: config.ledgerError ?? null,
            });
          },
        };
        return builder;
      }
      throw new Error(`unexpected table in test stub: ${table}`);
    },
  } as unknown as SupabaseClient;
}

function request(query = ""): Request {
  return new Request(`https://terminalsync.ai/api/credits/ledger${query}`, {
    method: "GET",
    headers: {
      Authorization: "Bearer user-token",
      Origin: "tauri://localhost",
    },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.authenticate.mockResolvedValue({ id: "user-verified", email: "buyer@example.com" });
});

describe("GET /api/credits/ledger", () => {
  it("supports Tauri preflight with Authorization", async () => {
    const res = await OPTIONS(new Request("https://terminalsync.ai/api/credits/ledger", {
      method: "OPTIONS",
      headers: { Origin: "tauri://localhost" },
    }));
    expect(res.status).toBe(204);
    expect(res.headers.get("access-control-allow-origin")).toBe("tauri://localhost");
    expect(res.headers.get("access-control-allow-headers")).toContain("Authorization");
  });

  it("rejects unauthenticated requests", async () => {
    mocks.authenticate.mockResolvedValue(null);
    const res = await GET(request());
    expect(res.status).toBe(401);
    expect(await res.json()).toMatchObject({ code: "sign_in_required" });
    expect(mocks.getSupabaseAdmin).not.toHaveBeenCalled();
  });

  it("fails closed when Supabase is not configured", async () => {
    mocks.getSupabaseAdmin.mockReturnValue(null);
    const res = await GET(request());
    expect(res.status).toBe(503);
    expect(await res.json()).toMatchObject({ code: "not_configured" });
  });

  it("returns a zero balance and no top-ups for a user who never topped up", async () => {
    const calls = newCalls();
    mocks.getSupabaseAdmin.mockReturnValue(
      makeSupabaseStub({ account: null, ledgerRows: [] }, calls),
    );

    const res = await GET(request());
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      ok: true,
      balanceMicros: 0,
      currency: "USD",
      topUps: [],
      nextSince: null,
    });
  });

  it("returns the balance and maps top-up rows, with nextSince from the last row", async () => {
    const calls = newCalls();
    mocks.getSupabaseAdmin.mockReturnValue(
      makeSupabaseStub(
        {
          account: {
            balance_micros: 30_000_000,
            currency: "USD",
            updated_at: "2026-08-20T00:00:00Z",
          },
          ledgerRows: [
            {
              id: "ledger-1",
              amount_micros: 10_000_000,
              rail: "stripe",
              created_at: "2026-08-10T00:00:00Z",
            },
            {
              id: "ledger-2",
              amount_micros: 20_000_000,
              rail: "mercadopago",
              created_at: "2026-08-20T00:00:00Z",
            },
          ],
        },
        calls,
      ),
    );

    const res = await GET(request());
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      ok: true,
      balanceMicros: 30_000_000,
      currency: "USD",
      topUps: [
        {
          id: "ledger-1",
          amountMicros: 10_000_000,
          rail: "stripe",
          createdAt: "2026-08-10T00:00:00Z",
        },
        {
          id: "ledger-2",
          amountMicros: 20_000_000,
          rail: "mercadopago",
          createdAt: "2026-08-20T00:00:00Z",
        },
      ],
      nextSince: "2026-08-20T00:00:00Z",
    });
  });

  it("filters the ledger query with ?since=", async () => {
    const calls = newCalls();
    mocks.getSupabaseAdmin.mockReturnValue(
      makeSupabaseStub({ account: null, ledgerRows: [] }, calls),
    );

    const since = "2026-08-20T00:00:00Z";
    const res = await GET(request(`?since=${encodeURIComponent(since)}`));
    expect(res.status).toBe(200);
    expect(calls.ledgerGt).toContainEqual(["created_at", since]);
    // No new rows past `since` — the response should echo it back so the
    // app's next poll starts from the same cursor.
    expect((await res.clone().json()).nextSince).toBe(since);
  });

  it("ignores an unparseable ?since= instead of failing the request", async () => {
    const calls = newCalls();
    mocks.getSupabaseAdmin.mockReturnValue(
      makeSupabaseStub({ account: null, ledgerRows: [] }, calls),
    );

    const res = await GET(request("?since=not-a-date"));
    expect(res.status).toBe(200);
    expect(calls.ledgerGt).toEqual([]);
    expect((await res.json()).nextSince).toBeNull();
  });

  it("scopes both queries to the authenticated user and never leaks another user's rows", async () => {
    mocks.authenticate.mockResolvedValue({ id: "user-verified", email: "buyer@example.com" });
    const calls = newCalls();
    mocks.getSupabaseAdmin.mockReturnValue(
      makeSupabaseStub(
        {
          account: { balance_micros: 5_000_000, currency: "USD", updated_at: "2026-08-20T00:00:00Z" },
          ledgerRows: [
            {
              id: "ledger-1",
              amount_micros: 5_000_000,
              rail: "stripe",
              created_at: "2026-08-10T00:00:00Z",
            },
          ],
        },
        calls,
      ),
    );

    await GET(request());

    expect(calls.accountEq).toContainEqual(["user_id", "user-verified"]);
    expect(calls.ledgerEq).toContainEqual(["user_id", "user-verified"]);
    expect(calls.ledgerEq).toContainEqual(["kind", "top_up"]);
    // Nothing in the recorded filters should reference any other user id —
    // the stub itself is single-user, so this is a defensive re-check that
    // the route filters by the authenticated id rather than, say, a body
    // or query param a caller could forge.
    const allEqCalls = [...calls.accountEq, ...calls.ledgerEq].filter(
      ([col]) => col === "user_id",
    );
    for (const [, val] of allEqCalls) {
      expect(val).toBe("user-verified");
    }
  });

  it("returns storage_failed without leaking internal error details when the ledger query fails", async () => {
    const calls = newCalls();
    mocks.getSupabaseAdmin.mockReturnValue(
      makeSupabaseStub(
        { account: null, ledgerError: { message: "connection reset by peer at 10.0.0.4" } },
        calls,
      ),
    );

    const res = await GET(request());
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.code).toBe("storage_failed");
    expect(JSON.stringify(body)).not.toContain("10.0.0.4");
  });

  it("returns storage_failed when the account query fails", async () => {
    const calls = newCalls();
    mocks.getSupabaseAdmin.mockReturnValue(
      makeSupabaseStub(
        { accountError: { message: "boom" }, ledgerRows: [] },
        calls,
      ),
    );

    const res = await GET(request());
    expect(res.status).toBe(500);
    expect(await res.json()).toMatchObject({ code: "storage_failed" });
  });
});
