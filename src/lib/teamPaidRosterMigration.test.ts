import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";

const migration = readFileSync(join(process.cwd(), "supabase/migrations/0045_team_paid_roster.sql"), "utf8");

describe("paid Team roster migration", () => {
  it("assigns only within paid capacity and derives employee entitlement live", async () => {
    const db = new PGlite();
    try {
      await db.exec(`
        CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
        CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid PRIMARY KEY);
        CREATE TABLE public.team_memberships(user_id uuid,status text,source text,starts_at timestamptz,expires_at timestamptz);
        CREATE TABLE public.team_billing_subscriptions(stripe_subscription_id text PRIMARY KEY,user_id uuid,status text,seat_count bigint,current_period_start timestamptz,current_period_end timestamptz);
        CREATE TABLE public.team_trial_entitlements(user_id uuid,starts_at timestamptz,expires_at timestamptz);
        CREATE FUNCTION public.team_shared_spaces_eligible(uuid) RETURNS boolean LANGUAGE sql AS $$ SELECT false $$;
        INSERT INTO auth.users VALUES
          ('00000000-0000-0000-0000-000000000001'),('00000000-0000-0000-0000-000000000002'),
          ('00000000-0000-0000-0000-000000000003'),('00000000-0000-0000-0000-000000000004');
        INSERT INTO public.team_billing_subscriptions VALUES
          ('sub1','00000000-0000-0000-0000-000000000001','active',3,NULL,NULL);
      `);
      await db.exec(migration);
      const call = async (owner: string, employee: string) => db.query<{ assign_team_paid_employee: string }>(
        `SELECT public.assign_team_paid_employee($1::uuid,$2::uuid)`, [owner, employee]);
      const owner = "00000000-0000-0000-0000-000000000001";
      const employee1 = "00000000-0000-0000-0000-000000000002";
      const employee2 = "00000000-0000-0000-0000-000000000003";
      const employee3 = "00000000-0000-0000-0000-000000000004";
      expect((await call(owner, employee1)).rows[0].assign_team_paid_employee).toBe("assigned");
      expect((await call(owner, employee1)).rows[0].assign_team_paid_employee).toBe("already_assigned");
      expect((await call(owner, employee2)).rows[0].assign_team_paid_employee).toBe("assigned");
      await expect(call(owner, employee3)).rejects.toThrow(/capacity reached/);
      let entitlement = await db.query<{ eligible: boolean; seat_limit: string; source: string }>(
        `SELECT eligible,seat_limit,source FROM public.get_team_entitlement($1::uuid)`, [employee1]);
      expect(entitlement.rows[0]).toEqual({ eligible: true, seat_limit: 3, source: "paid" });
      await db.exec(`UPDATE public.team_billing_subscriptions SET seat_count=2 WHERE stripe_subscription_id='sub1'`);
      entitlement = await db.query(`SELECT eligible,seat_limit,source FROM public.get_team_entitlement($1::uuid)`, [employee1]);
      expect(entitlement.rows[0].eligible).toBe(false);
      await db.exec(`UPDATE public.team_billing_subscriptions SET seat_count=3,current_period_end=now()-interval '1 second' WHERE stripe_subscription_id='sub1'`);
      entitlement = await db.query(`SELECT eligible FROM public.get_team_entitlement($1::uuid)`, [employee2]);
      expect(entitlement.rows[0].eligible).toBe(false);
      await expect(call(owner, employee3)).rejects.toThrow(/active paid Team required/);
      await db.exec(`UPDATE public.team_billing_subscriptions SET seat_count=3,status='past_due' WHERE stripe_subscription_id='sub1'`);
      entitlement = await db.query(`SELECT eligible FROM public.get_team_entitlement($1::uuid)`, [employee2]);
      expect(entitlement.rows[0].eligible).toBe(false);
      await expect(call(owner, employee3)).rejects.toThrow(/active paid Team required/);
      expect((await db.query(`SELECT * FROM public.team_memberships`)).rows).toEqual([]);
      expect((await db.query<{ can_exec: boolean }>(`SELECT has_function_privilege('authenticated','public.assign_team_paid_employee(uuid,uuid)','EXECUTE') AS can_exec`)).rows[0].can_exec).toBe(false);
      expect((await db.query<{ can_exec: boolean }>(`SELECT has_function_privilege('authenticated','public.revoke_team_paid_employee(uuid,uuid)','EXECUTE') AS can_exec`)).rows[0].can_exec).toBe(false);
      expect((await db.query<{ can_exec: boolean }>(`SELECT has_function_privilege('authenticated','public.get_team_entitlement(uuid)','EXECUTE') AS can_exec`)).rows[0].can_exec).toBe(false);
      await db.exec(`UPDATE public.team_billing_subscriptions SET status='active',seat_count=3 WHERE stripe_subscription_id='sub1'`);
      await db.query(`SELECT public.revoke_team_paid_employee($1::uuid,$2::uuid)`, [owner, employee1]);
      expect((await db.query<{ eligible: boolean }>(`SELECT eligible FROM public.get_team_entitlement($1::uuid)`, [employee1])).rows[0].eligible).toBe(false);
      const legacyPaidUser = "00000000-0000-0000-0000-000000000004";
      await db.exec(`INSERT INTO public.team_memberships(user_id,status,source,starts_at,expires_at)
        VALUES ('${legacyPaidUser}','active','paid',now()-interval '1 day',now()+interval '1 day')`);
      const legacyPaid = await db.query<{ eligible: boolean; source: string }>(
        `SELECT eligible,source FROM public.get_team_entitlement($1::uuid)`, [legacyPaidUser]);
      expect(legacyPaid.rows[0]).toEqual({ eligible: true, source: "paid" });
      await db.exec(`UPDATE public.team_memberships SET expires_at=now()-interval '1 second' WHERE user_id='${legacyPaidUser}'`);
      expect((await db.query<{ eligible: boolean }>(
        `SELECT eligible FROM public.get_team_entitlement($1::uuid)`, [legacyPaidUser])).rows[0].eligible).toBe(false);
      expect(migration.toLowerCase()).not.toMatch(/\b(insert|update|delete)\s+into\s+public\.team_memberships\b/);
    } finally { await db.close(); }
  }, 15_000);
});
