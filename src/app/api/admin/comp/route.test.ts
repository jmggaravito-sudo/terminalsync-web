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
      subscriptions: [
        { data: { stripe_customer_id: null }, error: null },
        { error: null },
      ],
    });
    mocks.getSupabaseAdmin.mockReturnValue(sb);

    const { POST } = await import("./route");
    const response = await POST(request("POST", { email: "person@example.com", plan: "pro" }));

    expect(response.status).toBe(200);
    expect(mocks.grantIncludedAi).toHaveBeenCalledWith({ userId: "user-1" });
    const upsert = sb.queries.subscriptions[1].upsert;
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

  it("allows a Team comp only as a pending pre-grant for a new account", async () => {
    const sb = supabaseFor({
      profiles: { data: null, error: null },
      comp_grants: { error: null },
    });
    mocks.getSupabaseAdmin.mockReturnValue(sb);

    const { POST } = await import("./route");
    const response = await POST(request("POST", { email: "NEW@EXAMPLE.COM", plan: "team" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ ok: true, pending: true, email: "new@example.com", plan: "team" });
    expect(sb.queries.comp_grants[0].upsert).toHaveBeenCalledWith(
      expect.objectContaining({ email: "new@example.com", plan: "team" }),
      { onConflict: "email" },
    );
    expect(mocks.grantIncludedAi).not.toHaveBeenCalled();
  });

  it("refuses to turn an existing account into Team from the comp page", async () => {
    const sb = supabaseFor({
      profiles: { data: { id: "user-1", email: "person@example.com" }, error: null },
    });
    mocks.getSupabaseAdmin.mockReturnValue(sb);

    const { POST } = await import("./route");
    const response = await POST(request("POST", { email: "person@example.com", plan: "team" }));

    expect(response.status).toBe(409);
    expect(sb.queries.subscriptions).toBeUndefined();
    expect(sb.queries.comp_grants).toBeUndefined();
    expect(mocks.grantIncludedAi).not.toHaveBeenCalled();
  });

  it("fails closed when profile lookup fails instead of creating a pre-grant", async () => {
    const sb = supabaseFor({
      profiles: { data: null, error: { message: "database unavailable" } },
    });
    mocks.getSupabaseAdmin.mockReturnValue(sb);

    const { POST } = await import("./route");
    const response = await POST(request("POST", { email: "new@example.com", plan: "team" }));

    expect(response.status).toBe(503);
    expect(sb.queries.comp_grants).toBeUndefined();
  });

  it("refuses to replace an existing paid subscription", async () => {
    const sb = supabaseFor({
      profiles: { data: { id: "user-1", email: "person@example.com" }, error: null },
      subscriptions: { data: { stripe_customer_id: "cus_paid" }, error: null },
    });
    mocks.getSupabaseAdmin.mockReturnValue(sb);

    const { POST } = await import("./route");
    const response = await POST(request("POST", { email: "person@example.com", plan: "pro" }));

    expect(response.status).toBe(409);
    expect(sb.queries.subscriptions[0].upsert).not.toHaveBeenCalled();
    expect(mocks.grantIncludedAi).not.toHaveBeenCalled();
  });

  it("refuses to replace a paid subscription from another provider", async () => {
    const sb = supabaseFor({
      profiles: { data: { id: "user-1", email: "person@example.com" }, error: null },
      subscriptions: {
        data: {
          stripe_customer_id: null,
          provider_customer_id: "mp_customer",
          provider_subscription_id: "mp_subscription",
        },
        error: null,
      },
    });
    mocks.getSupabaseAdmin.mockReturnValue(sb);

    const { POST } = await import("./route");
    const response = await POST(request("POST", { email: "person@example.com", plan: "max" }));

    expect(response.status).toBe(409);
    expect(sb.queries.subscriptions[0].upsert).not.toHaveBeenCalled();
    expect(mocks.grantIncludedAi).not.toHaveBeenCalled();
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

describe("Team comp schema and admin UI", () => {
  it("extends only the plan constraints and rank; it does not add a payment or sharing switch", () => {
    const migration = readFileSync(
      resolve(process.cwd(), "supabase/migrations/0034_team_comp_grants.sql"),
      "utf8",
    ).toLowerCase().replace(/\s+/g, " ");

    expect(migration).toContain("'free', 'pro', 'max', 'team', 'dev', 'done_for_you'");
    expect(migration).toContain("'pro', 'max', 'team'");
    expect(migration).toContain("when 'team' then 3");
    expect(migration).toContain("when 'done_for_you' then 4");
    expect(migration).not.toContain("create table");
    expect(migration).not.toContain("team_roster");
  });

  it("shows Team in the comp selector with its pre-grant-only boundary", () => {
    const client = readFileSync(
      resolve(process.cwd(), "src/app/[lang]/admin/comp/CompClient.tsx"),
      "utf8",
    );

    expect(client).toContain('<option value="team">Team</option>');
    expect(client).toContain("Team se pre-otorga solo antes del registro");
  });
});
