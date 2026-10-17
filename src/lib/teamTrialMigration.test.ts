import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";

const migration = readFileSync(join(process.cwd(), "supabase/migrations/0040_team_universal_trial.sql"), "utf8");
const signupMigration = readFileSync(join(process.cwd(), "supabase/migrations/0044_team_trial_on_signup.sql"), "utf8");
const sql = migration.toLowerCase().replace(/\s+/g, " ");

describe("universal Team trial migration", () => {
  it("stores one fixed seven-day claim per account without touching base plans", () => {
    expect(sql).toContain("user_id uuid primary key references auth.users(id)");
    expect(sql).toContain("check (expires_at = starts_at + interval '168 hours')");
    expect(sql).toContain("values (p_user_id, started, started + interval '168 hours')");
    expect(sql).toContain("on conflict (user_id) do nothing");
    expect(sql).toContain("clock_timestamp()");
    expect(sql).toContain("create or replace function public.team_shared_spaces_eligible");
    expect(sql).toContain("from public, anon, authenticated");
    expect(sql).not.toMatch(/\b(insert|update|delete)\s+into\s+public\.subscriptions\b/);
    expect(sql).not.toMatch(/\b(insert|update|delete)\s+into\s+public\.team_memberships\b/);
  });

  it("combines sources and grants a conservative owner-only trial seat", async () => {
    const db = new PGlite();
    try {
      await db.exec(`
        CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
        CREATE SCHEMA auth;
        CREATE TABLE auth.users(id uuid PRIMARY KEY);
        INSERT INTO auth.users VALUES ('00000000-0000-0000-0000-000000000001'), ('00000000-0000-0000-0000-000000000002');
        CREATE TABLE public.team_memberships(user_id uuid, status text, source text, expires_at timestamptz);
        CREATE TABLE public.team_billing_subscriptions(user_id uuid, status text, seat_count bigint, current_period_end timestamptz, cancel_at_period_end boolean);
        CREATE FUNCTION public.team_shared_spaces_eligible(uuid) RETURNS boolean LANGUAGE sql AS $$ SELECT false $$;
      `);
      await db.exec(migration);
      const first = await db.query<{ result: string; starts_at: string; expires_at: string }>(
        `SELECT * FROM public.start_team_universal_trial('00000000-0000-0000-0000-000000000001')`,
      );
      expect(first.rows[0].result).toBe("started");
      expect(Date.parse(first.rows[0].expires_at) - Date.parse(first.rows[0].starts_at)).toBe(7 * 86400000);
      const second = await db.query<{ result: string; starts_at: string; expires_at: string }>(
        `SELECT * FROM public.start_team_universal_trial('00000000-0000-0000-0000-000000000001')`,
      );
      expect(second.rows[0]).toEqual({ ...first.rows[0], result: "already_claimed" });
      const entitlement = await db.query<{ eligible: boolean; seat_limit: number; source: string }>(
        `SELECT eligible, seat_limit, source FROM public.get_team_entitlement('00000000-0000-0000-0000-000000000001')`,
      );
      expect(entitlement.rows[0]).toEqual({ eligible: true, seat_limit: 1, source: "universal_trial" });
      const none = await db.query<{ eligible: boolean }>(
        `SELECT eligible FROM public.get_team_entitlement('00000000-0000-0000-0000-000000000002')`,
      );
      expect(none.rows[0].eligible).toBe(false);
    } finally { await db.close(); }
  }, 15_000);

  it("automatically grants new signups exactly 168 hours, idempotently, without subscription writes", async () => {
    const db = new PGlite();
    try {
      await db.exec(`
        CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
        CREATE SCHEMA auth;
        CREATE TABLE auth.users(id uuid PRIMARY KEY);
        CREATE TABLE public.team_memberships(user_id uuid, status text, source text, expires_at timestamptz);
        CREATE TABLE public.team_billing_subscriptions(user_id uuid, status text, seat_count bigint, current_period_end timestamptz, cancel_at_period_end boolean);
        CREATE TABLE public.subscriptions(user_id uuid PRIMARY KEY, plan text, status text);
        CREATE FUNCTION public.team_shared_spaces_eligible(uuid) RETURNS boolean LANGUAGE sql AS $$ SELECT false $$;
      `);
      await db.exec(migration);
      const preexistingUserId = "00000000-0000-0000-0000-000000000010";
      const existingStart = "2026-10-01T00:00:00.000Z";
      const existingExpiry = "2026-10-08T00:00:00.000Z";
      await db.exec(`INSERT INTO auth.users VALUES ('${preexistingUserId}')`);
      await db.exec(`INSERT INTO public.team_trial_entitlements(user_id, starts_at, expires_at)
        VALUES ('${preexistingUserId}', '${existingStart}', '${existingExpiry}')`);
      await db.exec(signupMigration);
      const acl = await db.query<{ can_execute: boolean }>(
        `SELECT has_function_privilege('authenticated', 'public.grant_team_trial_on_signup()', 'EXECUTE') AS can_execute`,
      );
      expect(acl.rows[0].can_execute).toBe(false);
      const before = await db.query<{ at: string }>(`SELECT clock_timestamp() AS at`);
      const startFloor = Date.parse(before.rows[0].at);
      const entitlement = await db.query<{ starts_at: string; expires_at: string }>(
        `SELECT starts_at, expires_at FROM public.team_trial_entitlements WHERE user_id='${preexistingUserId}'`,
      );
      expect(entitlement.rows).toHaveLength(1);
      expect(Date.parse(entitlement.rows[0].starts_at)).toBe(Date.parse(existingStart));
      expect(Date.parse(entitlement.rows[0].expires_at)).toBe(Date.parse(existingExpiry));
      const frozen = entitlement.rows[0];
      const newUserId = "00000000-0000-0000-0000-000000000011";
      await db.exec(`CREATE TRIGGER grant_team_trial_on_signup_duplicate_test AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.grant_team_trial_on_signup();
        INSERT INTO auth.users VALUES ('${newUserId}')`);
      const newEntitlement = await db.query<{ starts_at: string; expires_at: string }>(
        `SELECT starts_at, expires_at FROM public.team_trial_entitlements WHERE user_id='${newUserId}'`,
      );
      expect(newEntitlement.rows).toHaveLength(1);
      expect(Date.parse(newEntitlement.rows[0].starts_at)).toBeGreaterThanOrEqual(startFloor);
      expect(Date.parse(newEntitlement.rows[0].expires_at) - Date.parse(newEntitlement.rows[0].starts_at)).toBe(168 * 60 * 60 * 1000);
      await db.exec(`INSERT INTO auth.users VALUES ('00000000-0000-0000-0000-000000000012')`);
      const afterDuplicate = await db.query<{ starts_at: string; expires_at: string }>(
        `SELECT starts_at, expires_at FROM public.team_trial_entitlements WHERE user_id='${preexistingUserId}'`,
      );
      expect(afterDuplicate.rows).toEqual([frozen]);
      expect((await db.query(`SELECT * FROM public.subscriptions`)).rows).toEqual([]);
      expect(signupMigration.toLowerCase()).not.toMatch(/\b(insert|update|delete)\s+into\s+public\.subscriptions\b/);
    } finally { await db.close(); }
  }, 15_000);
});
