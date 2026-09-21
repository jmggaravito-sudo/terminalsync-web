import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const mocks = vi.hoisted(() => ({
  authenticate: vi.fn(),
  isAdmin: vi.fn(),
  getSupabaseAdmin: vi.fn(),
  grantIncludedAi: vi.fn(),
  revokeIncludedAiForUser: vi.fn(),
}));

vi.mock("@/lib/marketplace/auth", () => ({
  authenticate: mocks.authenticate,
  isAdmin: mocks.isAdmin,
}));
vi.mock("@/lib/supabaseAdmin", () => ({
  getSupabaseAdmin: mocks.getSupabaseAdmin,
}));
vi.mock("@/lib/subscriptionState", () => ({
  grantIncludedAi: mocks.grantIncludedAi,
  revokeIncludedAiForUser: mocks.revokeIncludedAiForUser,
}));

type QueryResult = { data?: unknown; error?: { message: string } | null };

/** A small thenable Supabase query double that supports the fluent methods
 * used by the comp route while keeping each test focused on the write. */
function query(result: QueryResult) {
  const q: Record<string, unknown> = {};
  for (const method of [
    "select",
    "ilike",
    "limit",
    "maybeSingle",
    "upsert",
    "delete",
    "eq",
  ]) {
    q[method] = vi.fn(() => q);
  }
  q.then = (resolve: (value: QueryResult) => unknown) =>
    Promise.resolve(result).then(resolve);
  return q;
}

function supabaseFor(resultsByTable: Record<string, QueryResult | QueryResult[]>) {
  const queries: Record<string, Array<Record<string, any>>> = {};
  const from = vi.fn((table: string) => {
    const configured = resultsByTable[table];
    if (Array.isArray(configured)) {
      const next = configured.shift();
      if (!next) throw new Error(`No configured result left for ${table}`);
      const q = query(next) as Record<string, any>;
      (queries[table] ??= []).push(q);
      return q;
    }
    if (!configured) throw new Error(`No configured result for ${table}`);
    const q = query(configured) as Record<string, any>;
    (queries[table] ??= []).push(q);
    return q;
  });
  return { from, queries };
}

function request(method: "POST" | "DELETE", body: Record<string, unknown>) {
  return new Request("https://terminalsync.ai/api/admin/comp", {
    method,
    headers: { Authorization: "Bearer admin-token", "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.authenticate.mockResolvedValue({ id: "admin-1", email: "admin@terminalsync.ai" });
  mocks.isAdmin.mockReturnValue(true);
  mocks.grantIncludedAi.mockResolvedValue(true);
  mocks.revokeIncludedAiForUser.mockResolvedValue(true);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("admin comp included-AI entitlement", () => {
  it("marks an existing-user subscription as included AI and grants the entitlement", async () => {
    const sb = supabaseFor({
      profiles: { data: { id: "user-1", email: "person@example.com" }, error: null },
      subscriptions: { error: null },
    });
    mocks.getSupabaseAdmin.mockReturnValue(sb);

    const { POST } = await import("./route");
    const response = await POST(request("POST", { email: "person@example.com", plan: "pro" }));

    expect(response.status).toBe(200);
    expect(mocks.grantIncludedAi).toHaveBeenCalledWith({ userId: "user-1" });
    const upsert = sb.queries.subscriptions[0].upsert;
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: "user-1", plan: "pro", ai_included: true }),
      { onConflict: "user_id" },
    );
  });

  it("keeps pre-grants pending for the handle_new_user entitlement trigger", async () => {
    const sb = supabaseFor({
      profiles: { data: null, error: null },
      comp_grants: { error: null },
    });
    mocks.getSupabaseAdmin.mockReturnValue(sb);

    const { POST } = await import("./route");
    const response = await POST(request("POST", { email: "new@example.com", plan: "max", months: 6 }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ ok: true, pending: true, plan: "max", months: 6 });
    expect(mocks.grantIncludedAi).not.toHaveBeenCalled();

    const migration = readFileSync(
      resolve(process.cwd(), "supabase/migrations/0032_comp_included_ai.sql"),
      "utf8",
    );
    expect(migration).toContain("ai_included            = true");
    expect(migration).toContain("INSERT INTO public.courtesy_entitlement");
    expect(migration).toContain("'included_ai'");
  });

  it("revokes the included-AI entitlement when a comp is revoked", async () => {
    const sb = supabaseFor({
      comp_grants: { error: null },
      profiles: { data: { id: "user-1", email: "person@example.com" }, error: null },
      subscriptions: [
        { data: { stripe_customer_id: "comp" }, error: null },
        { error: null },
      ],
    });
    mocks.getSupabaseAdmin.mockReturnValue(sb);

    const { DELETE } = await import("./route");
    const response = await DELETE(request("DELETE", { email: "person@example.com" }));

    expect(response.status).toBe(200);
    expect(mocks.revokeIncludedAiForUser).toHaveBeenCalledWith("user-1");
    expect(sb.queries.subscriptions[1].upsert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: "user-1", plan: "free", ai_included: false }),
      { onConflict: "user_id" },
    );
  });
});
