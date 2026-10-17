import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";

const migration0045 = readFileSync(join(process.cwd(), "supabase/migrations/0045_team_paid_roster.sql"), "utf8");
const migration0046 = readFileSync(join(process.cwd(), "supabase/migrations/0046_team_paid_roster_api.sql"), "utf8");
const owner = "00000000-0000-0000-0000-000000000001";
const employee1 = "00000000-0000-0000-0000-000000000002";
const employee2 = "00000000-0000-0000-0000-000000000003";

describe("paid Team roster API migration", () => {
  it("returns only the live paid roster with capacity eligibility and service-only access", async () => {
    const db = new PGlite();
    try {
      await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
        CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid PRIMARY KEY);
        CREATE TABLE public.team_memberships(user_id uuid,status text,source text,starts_at timestamptz,expires_at timestamptz);
        CREATE TABLE public.team_billing_subscriptions(stripe_subscription_id text PRIMARY KEY,user_id uuid,status text,seat_count bigint,current_period_start timestamptz,current_period_end timestamptz);
        CREATE TABLE public.team_trial_entitlements(user_id uuid,starts_at timestamptz,expires_at timestamptz);
        CREATE FUNCTION public.team_shared_spaces_eligible(uuid) RETURNS boolean LANGUAGE sql AS $$ SELECT false $$;
        INSERT INTO auth.users VALUES ('${owner}'),('${employee1}'),('${employee2}');
        INSERT INTO public.team_billing_subscriptions VALUES ('sub1','${owner}','active',2,NULL,NULL);`);
      await db.exec(migration0045);
      await db.exec(migration0046);
      await db.query(`SELECT public.assign_team_paid_employee($1::uuid,$2::uuid)`, [owner, employee1]);
      const snapshot = (await db.query<{ list_team_paid_roster: any }>(`SELECT public.list_team_paid_roster($1::uuid)`, [owner])).rows[0].list_team_paid_roster;
      expect(snapshot).toMatchObject({ has_active_team: true, seat_limit: 2, assigned_count: 1, occupied_seats: 2, available_slots: 0 });
      expect(snapshot.roster).toHaveLength(1);
      expect(snapshot.roster[0]).toMatchObject({ employee_user_id: employee1, eligible: true });
      await db.exec(`UPDATE public.team_billing_subscriptions SET seat_count=1 WHERE stripe_subscription_id='sub1'`);
      const reduced = (await db.query<{ list_team_paid_roster: any }>(`SELECT public.list_team_paid_roster($1::uuid)`, [owner])).rows[0].list_team_paid_roster;
      expect(reduced).toMatchObject({ seat_limit: 1, assigned_count: 1, occupied_seats: 1, available_slots: 0 });
      expect(reduced.roster[0].eligible).toBe(false);
      await db.exec(`UPDATE public.team_billing_subscriptions SET status='past_due' WHERE stripe_subscription_id='sub1'`);
      const inactive = (await db.query<{ list_team_paid_roster: any }>(`SELECT public.list_team_paid_roster($1::uuid)`, [owner])).rows[0].list_team_paid_roster;
      expect(inactive).toMatchObject({ has_active_team: false, roster: [] });
      expect((await db.query<{ ok: boolean }>(`SELECT has_function_privilege('authenticated','public.list_team_paid_roster(uuid)','EXECUTE') AS ok`)).rows[0].ok).toBe(false);
      expect((await db.query<{ ok: boolean }>(`SELECT has_function_privilege('service_role','public.list_team_paid_roster(uuid)','EXECUTE') AS ok`)).rows[0].ok).toBe(true);
      expect(migration0046.toLowerCase()).toContain("security definer set search_path = ''");
    } finally { await db.close(); }
  }, 20_000);
});
