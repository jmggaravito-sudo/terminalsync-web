import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";

const migration = readFileSync(join(process.cwd(), "supabase/migrations/0041_team_entitlement_and_alias_reconciliation.sql"), "utf8");
const baseline = readFileSync(join(process.cwd(), "supabase/migrations/0039_team_shared_spaces_metadata.sql"), "utf8").toLowerCase().replace(/^--.*$/gm, "");
const sql = migration.toLowerCase();
const uid = "00000000-0000-0000-0000-000000000001";

async function dbWithBaselineRows(aliases: Array<[string, string]> = []) {
  const db = new PGlite();
  await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role; CREATE SCHEMA auth;
    CREATE TABLE auth.users(id uuid PRIMARY KEY);
    INSERT INTO auth.users VALUES ('${uid}'), ('00000000-0000-0000-0000-000000000002');
    CREATE TABLE public.team_aliases(user_id uuid PRIMARY KEY, alias text NOT NULL, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());
    CREATE TABLE public.team_shared_spaces(id uuid); CREATE TABLE public.team_space_invitations(id uuid);
    CREATE TABLE public.team_space_requests(id uuid); CREATE TABLE public.team_space_proposals(id uuid);
    CREATE TABLE public.team_memberships(user_id uuid, status text, source text, starts_at timestamptz, expires_at timestamptz);
    CREATE TABLE public.team_billing_subscriptions(user_id uuid, status text, seat_count bigint, current_period_end timestamptz);
    CREATE TABLE public.team_trial_entitlements(user_id uuid, starts_at timestamptz, expires_at timestamptz);
    INSERT INTO public.team_aliases(user_id, alias) VALUES ${aliases.length ? aliases.map(([id, alias]) => `('${id}', '${alias}')`).join(",") : `('${uid}', 'valid.alias_7')`};
  `);
  return db;
}

describe("Team schema reconciliation migration", () => {
  it("keeps 0039 metadata-only and does not add delivery, decryption, import, or ciphertext state", () => {
    expect(baseline).not.toMatch(/\bciphertext\s+(?:column|field|table)/);
    expect(baseline).not.toMatch(/status\s+in\s*\([^)]*\b(delivered|approved|imported)\b/);
    expect(sql).not.toMatch(/ciphertext|decrypt|\bimport(ed)?\b|\b(delivered|approved)\b/);
    expect(sql).not.toMatch(/\b(insert|update|delete)\s+into\s+public\.subscriptions\b/);
  });

  it("preflights invalid and duplicate aliases and accepts the qualified alias contract", async () => {
    for (const rows of [
      [[uid, "BadAlias"], ["00000000-0000-0000-0000-000000000002", "other.alias"]] as Array<[string,string]>,
      [[uid, "duplicate"], ["00000000-0000-0000-0000-000000000002", "duplicate"]] as Array<[string,string]>,
      [[uid, "two..dots"], ["00000000-0000-0000-0000-000000000002", "other.alias"]] as Array<[string,string]>,
    ]) {
      const db = await dbWithBaselineRows(rows);
      await expect(db.exec(migration)).rejects.toThrow();
      await db.close();
    }
    const db = await dbWithBaselineRows();
    await db.exec(migration);
    await expect(db.query(`INSERT INTO public.team_aliases(user_id, alias) VALUES ('00000000-0000-0000-0000-000000000002', 'valid.alias_7')`)).rejects.toThrow();
    await db.exec(`INSERT INTO public.team_aliases(user_id, alias) VALUES ('00000000-0000-0000-0000-000000000002', 'a.b-c_d9')`);
    await db.close();
  }, 30_000);

  it("allows only started, unexpired active membership sources and valid Stripe/trial sources", async () => {
    const db = await dbWithBaselineRows();
    await db.exec(migration);
    await db.exec(`
      INSERT INTO public.team_memberships VALUES
       ('${uid}','active','admin_comp',now()-interval '1 day',now()+interval '1 day');
    `);
    const entitlement = async () => (await db.query<{eligible:boolean;seat_limit:number;source:string|null;expires_at:string|null}>(`SELECT * FROM public.get_team_entitlement('${uid}')`)).rows[0];
    const eligible = async () => (await entitlement()).eligible;
    const admin = await entitlement();
    expect(admin).toMatchObject({ eligible: true, seat_limit: 1, source: "admin_comp" });
    const adminExpiry = (await db.query<{expires_at:string}>(`SELECT expires_at FROM public.team_memberships WHERE user_id='${uid}'`)).rows[0].expires_at;
    expect(Date.parse(admin.expires_at!)).toBe(Date.parse(adminExpiry));
    await db.exec(`INSERT INTO public.team_billing_subscriptions VALUES ('${uid}','trialing',4,now()+interval '3 days');
      INSERT INTO public.team_trial_entitlements VALUES ('${uid}',now()-interval '1 hour',now()+interval '2 days');`);
    const combined = await entitlement();
    expect(combined).toMatchObject({ eligible: true, seat_limit: 4, source: "paid" });
    const longestExpiry = (await db.query<{current_period_end:string}>(`SELECT current_period_end FROM public.team_billing_subscriptions WHERE user_id='${uid}'`)).rows[0].current_period_end;
    expect(Date.parse(combined.expires_at!)).toBe(Date.parse(longestExpiry));
    await db.exec(`DELETE FROM public.team_memberships; DELETE FROM public.team_trial_entitlements; DELETE FROM public.team_billing_subscriptions;
      INSERT INTO public.team_memberships VALUES ('${uid}','active','paid',now()+interval '1 day',now()+interval '2 days');`);
    expect(await eligible()).toBe(false);
    await db.exec(`UPDATE public.team_memberships SET starts_at=now()-interval '2 days', expires_at=now()-interval '1 second';`);
    expect(await eligible()).toBe(false);
    await db.exec(`UPDATE public.team_memberships SET status='revoked', expires_at=NULL;`);
    expect(await eligible()).toBe(false);
    await db.exec(`DELETE FROM public.team_memberships;
      INSERT INTO public.team_billing_subscriptions VALUES ('${uid}','active',4,now()+interval '1 day');`);
    const paid = await entitlement();
    expect(paid).toMatchObject({ eligible: true, seat_limit: 4, source: "paid" });
    const paidExpiry = (await db.query<{current_period_end:string}>(`SELECT current_period_end FROM public.team_billing_subscriptions WHERE user_id='${uid}'`)).rows[0].current_period_end;
    expect(Date.parse(paid.expires_at!)).toBe(Date.parse(paidExpiry));
    await db.exec(`DELETE FROM public.team_billing_subscriptions;
      INSERT INTO public.team_trial_entitlements VALUES ('${uid}',now()-interval '1 hour',now()+interval '6 days');`);
    const trial = await entitlement();
    expect(trial).toMatchObject({ eligible: true, seat_limit: 1, source: "universal_trial" });
    const trialExpiry = (await db.query<{expires_at:string}>(`SELECT expires_at FROM public.team_trial_entitlements WHERE user_id='${uid}'`)).rows[0].expires_at;
    expect(Date.parse(trial.expires_at!)).toBe(Date.parse(trialExpiry));
    await db.exec(`UPDATE public.team_trial_entitlements SET starts_at=now()+interval '1 hour';`);
    expect(await eligible()).toBe(false);
    await db.close();
  }, 30_000);

  it("reasserts RLS and service_role-only table and RPC access", async () => {
    const db = await dbWithBaselineRows(); await db.exec(migration);
    const rls = await db.query<{tablename:string, rowsecurity:boolean}>(`SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname='public' AND tablename LIKE 'team_%'`);
    for (const table of ["team_aliases", "team_shared_spaces", "team_space_invitations", "team_space_requests", "team_space_proposals"]) {
      expect(rls.rows.find(row => row.tablename === table)?.rowsecurity).toBe(true);
      const tableGrants = await db.query<{grantee:string, privilege_type:string}>(`SELECT grantee, privilege_type FROM information_schema.table_privileges WHERE table_schema='public' AND table_name='${table}'`);
      expect(tableGrants.rows.some(row => ["PUBLIC", "anon", "authenticated"].includes(row.grantee))).toBe(false);
      expect(tableGrants.rows.some(row => row.grantee === "service_role")).toBe(true);
    }
    for (const fn of ["get_team_entitlement", "team_shared_spaces_eligible"]) {
      const grants = await db.query<{grantee:string, privilege_type:string}>(`SELECT grantee, privilege_type FROM information_schema.routine_privileges WHERE routine_name='${fn}'`);
      expect(grants.rows.some(row => ["PUBLIC", "anon", "authenticated"].includes(row.grantee) && row.privilege_type === "EXECUTE")).toBe(false);
      expect(grants.rows.some(row => row.grantee === "service_role" && row.privilege_type === "EXECUTE")).toBe(true);
    }
    await db.close();
  }, 30_000);
});
