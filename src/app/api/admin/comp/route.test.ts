import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const mocks = vi.hoisted(() => ({
  authenticate: vi.fn(),
  isAdmin: vi.fn(),
  getSupabaseAdmin: vi.fn(),
  rpc: vi.fn(),
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
    "update",
    "delete",
    "eq",
    "is",
    "order",
    "in",
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
  return { from, queries, rpc: mocks.rpc };
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
  mocks.rpc.mockResolvedValue({ data: "ok", error: null });
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

  it("stores a new-user Team grant separately from base-plan comp grants", async () => {
    const sb = supabaseFor({
      profiles: { data: null, error: null },
      team_comp_grants: { error: null },
    });
    mocks.getSupabaseAdmin.mockReturnValue(sb);

    const { POST } = await import("./route");
    const response = await POST(request("POST", { email: "NEW@EXAMPLE.COM", plan: "team" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ ok: true, pending: true, email: "new@example.com", plan: "team" });
    expect(sb.queries.team_comp_grants[0].upsert).toHaveBeenCalledWith(
      expect.objectContaining({ email: "new@example.com", months: 12 }),
      { onConflict: "email" },
    );
    expect(sb.queries.comp_grants).toBeUndefined();
    expect(mocks.grantIncludedAi).not.toHaveBeenCalled();
  });

  it("returns failure when the Team pre-grant insert fails", async () => {
    const sb = supabaseFor({ profiles: { data: null, error: null }, team_comp_grants: { error: { message: "write failed" } } });
    mocks.getSupabaseAdmin.mockReturnValue(sb);
    const { POST } = await import("./route");
    const response = await POST(request("POST", { email: "new@example.com", plan: "team" }));
    expect(response.status).toBe(500);
  });

  it("grants existing users additive Team membership without changing Pro/Max subscription", async () => {
    const sb = supabaseFor({
      profiles: { data: { id: "user-1", email: "person@example.com" }, error: null },
    });
    mocks.getSupabaseAdmin.mockReturnValue(sb);

    const { POST } = await import("./route");
    const response = await POST(request("POST", { email: "person@example.com", plan: "team" }));

    expect(response.status).toBe(200);
    expect(mocks.rpc).toHaveBeenCalledWith("admin_grant_team_comp", expect.objectContaining({ p_user_id: "user-1" }));
    expect(sb.queries.subscriptions).toBeUndefined();
    expect(sb.queries.comp_grants).toBeUndefined();
    expect(mocks.grantIncludedAi).not.toHaveBeenCalled();
  });

  it("does not overwrite an existing paid Team membership", async () => {
    const sb = supabaseFor({
      profiles: { data: { id: "user-1", email: "person@example.com" }, error: null },
    });
    mocks.rpc.mockResolvedValueOnce({ data: "paid_membership", error: null });
    mocks.getSupabaseAdmin.mockReturnValue(sb);

    const { POST } = await import("./route");
    const response = await POST(request("POST", { email: "person@example.com", plan: "team" }));

    expect(response.status).toBe(409);
    expect(mocks.rpc).toHaveBeenCalledWith("admin_grant_team_comp", expect.any(Object));
    expect(sb.queries.subscriptions).toBeUndefined();
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
    });
    mocks.rpc.mockResolvedValueOnce({ data: [{ result: "ok", revoked_user_id: "user-1" }], error: null });
    mocks.getSupabaseAdmin.mockReturnValue(sb);

    const { DELETE } = await import("./route");
    const response = await DELETE(request("DELETE", { email: "person@example.com" }));

    expect(response.status).toBe(200);
    expect(mocks.rpc).toHaveBeenCalledWith("admin_revoke_comp", { p_email: "person@example.com" });
  });

  it("does not partially revoke Team when base subscription validation fails", async () => {
    const sb = supabaseFor({
    });
    mocks.rpc.mockResolvedValueOnce({ data: [{ result: "paid_subscription", revoked_user_id: "user-1" }], error: null });
    mocks.getSupabaseAdmin.mockReturnValue(sb);

    const { DELETE } = await import("./route");
    const response = await DELETE(request("DELETE", { email: "person@example.com" }));

    expect(response.status).toBe(409);
    expect(mocks.rpc).toHaveBeenCalledWith("admin_revoke_comp", { p_email: "person@example.com" });
  });
});

describe("Team comp schema and admin UI", () => {
  it("stores Team as an additive membership without rewriting subscription plans", () => {
    const migration = readFileSync(resolve(process.cwd(), "supabase/migrations/0037_team_comp_entitlements.sql"), "utf8").toLowerCase().replace(/\s+/g, " ");
    const migrations = readdirSync(resolve(process.cwd(), "supabase/migrations"));
    expect(migrations.filter((name) => name.startsWith("0037_")).length).toBe(1);
    expect(migration).toContain("create table public.team_memberships");
    expect(migration).toContain("create table public.team_comp_grants");
    expect(migration).toContain("insert into public.team_memberships");
    expect(migration).not.toContain("set plan='team'");
    expect(migration).toContain("where public.team_memberships.source = 'admin_comp'");
    expect(migration).toContain("create or replace function public.admin_grant_team_comp");
    expect(migration).toContain("on conflict (user_id) do update set status='active', source='admin_comp'");
    expect(migration).toContain("where public.team_memberships.source='admin_comp'");
    expect(migration).toContain("create or replace function public.admin_revoke_comp");
    expect(migration).toContain("delete from public.courtesy_entitlement");
    expect(migration).toContain("for update");
  });

  it("shows Team in the comp selector with its additive-membership boundary", () => {
    const client = readFileSync(
      resolve(process.cwd(), "src/app/[lang]/admin/comp/CompClient.tsx"),
      "utf8",
    );

    expect(client).toContain('<option value="team">Team</option>');
    expect(client).toContain("Team no reemplaza el plan base");
  });
});
