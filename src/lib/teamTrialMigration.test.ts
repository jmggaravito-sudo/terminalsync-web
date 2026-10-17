import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";

const migration = readFileSync(join(process.cwd(), "supabase/migrations/0040_team_universal_trial.sql"), "utf8");
const sql = migration.toLowerCase().replace(/\s+/g, " ");

describe("universal Team trial migration", () => {
  it("stores one fixed seven-day claim per account without touching base plans", () => {
    expect(sql).toContain("user_id uuid primary key references auth.users(id)");
    expect(sql).toContain("check (expires_at = starts_at + interval '7 days')");
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
});
