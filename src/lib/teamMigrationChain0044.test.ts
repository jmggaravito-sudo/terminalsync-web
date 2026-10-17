import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { citext } from "@electric-sql/pglite/contrib/citext";

const migration = (n: number) => readFileSync(join(process.cwd(), `supabase/migrations/${String(n).padStart(4, "0")}_${({37:"team_comp_entitlements",38:"team_stripe_billing",39:"team_shared_spaces_metadata",40:"team_universal_trial",41:"team_entitlement_and_alias_reconciliation",42:"team_metadata_invites",43:"team_metadata_requests",44:"team_trial_on_signup"} as Record<number,string>)[n]}.sql`), "utf8");

describe("Team migrations 0037-0044 contract", () => {
  it("applies the real ordered chain and grants only new users an immutable 168-hour trial", async () => {
    const db = new PGlite({ extensions: { citext } });
    try {
      await db.exec(`
        CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
        CREATE EXTENSION IF NOT EXISTS citext;
        CREATE SCHEMA auth;
        CREATE TABLE auth.users(id uuid PRIMARY KEY,email text,raw_user_meta_data jsonb DEFAULT '{}'::jsonb,raw_app_meta_data jsonb DEFAULT '{}'::jsonb);
        CREATE TABLE public.profiles(id uuid PRIMARY KEY,email text,full_name text,avatar_url text);
        CREATE TABLE public.subscriptions(user_id uuid PRIMARY KEY,plan text,status text,stripe_customer_id text,stripe_subscription_id text,provider_customer_id text,provider_subscription_id text,ai_included boolean DEFAULT false,current_period_start timestamptz,current_period_end timestamptz,cancel_at_period_end boolean DEFAULT false,updated_at timestamptz DEFAULT now());
        CREATE TABLE public.audit_log(user_id uuid,event text,metadata jsonb);
        CREATE TABLE public.comp_grants(email citext PRIMARY KEY,plan text,months int,claimed_at timestamptz,claimed_user_id uuid,updated_at timestamptz);
        CREATE TABLE public.courtesy_entitlement(user_id text PRIMARY KEY,tier text,updated_at timestamptz);
        CREATE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RETURN NEW; END $$;
        CREATE TRIGGER auth_user_signup AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
      `);
      for (const n of [37, 38, 39, 40, 41, 42, 43]) await db.exec(migration(n));
      const oldId = "00000000-0000-0000-0000-000000000037";
      await db.exec(`INSERT INTO auth.users(id,email) VALUES ('${oldId}','old@example.test')`);
      await db.exec(migration(44));
      const frozen = await db.query<{ starts_at: string; expires_at: string }>(
        `SELECT starts_at,expires_at FROM public.team_trial_entitlements WHERE user_id=$1::uuid`, [oldId]);
      expect(frozen.rows).toHaveLength(0);
      const newId = "00000000-0000-0000-0000-000000000044";
      await db.exec(`INSERT INTO auth.users(id,email) VALUES ('${newId}','new@example.test')`);
      const grant = await db.query<{ starts_at: string; expires_at: string }>(
        `SELECT starts_at,expires_at FROM public.team_trial_entitlements WHERE user_id=$1::uuid`, [newId]);
      expect(grant.rows).toHaveLength(1);
      expect(Date.parse(grant.rows[0].expires_at)-Date.parse(grant.rows[0].starts_at)).toBe(168*60*60*1000);
      expect((await db.query(`SELECT plan,status FROM public.subscriptions WHERE user_id=$1::uuid`,[newId])).rows).toEqual([{plan:"free",status:"active"}]);
      const original = grant.rows[0];
      await db.exec(`CREATE TRIGGER duplicate_signup_test AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.grant_team_trial_on_signup()`);
      await db.exec(`INSERT INTO auth.users(id,email) VALUES ('00000000-0000-0000-0000-000000000045','later@example.test')`);
      expect((await db.query(`SELECT starts_at,expires_at FROM public.team_trial_entitlements WHERE user_id=$1::uuid`,[newId])).rows).toEqual([original]);
      expect((await db.query<{ can_exec: boolean }>(`SELECT has_function_privilege('authenticated','public.grant_team_trial_on_signup()','EXECUTE') AS can_exec`)).rows[0].can_exec).toBe(false);
      expect((await db.query<{ n: number }>(`SELECT count(*)::int AS n FROM public.team_trial_entitlements`)).rows[0].n).toBe(2);
    } finally { await db.close(); }
  }, 30_000);
});
