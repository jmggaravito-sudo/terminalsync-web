import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const sql = readFileSync(
  join(process.cwd(), "supabase/migrations/0038_team_stripe_billing.sql"),
  "utf8",
).toLowerCase().replace(/\s+/g, " ");

describe("Team Stripe billing migration contract", () => {
  it("stores paid Team billing separately with validated seats and normalized status", () => {
    expect(sql).toContain("create table public.team_billing_subscriptions");
    for (const field of [
      "stripe_subscription_id text primary key",
      "user_id uuid not null references auth.users(id)",
      "stripe_customer_id text not null",
      "stripe_price_id text not null",
      "seat_count bigint not null check (seat_count > 0)",
      "latest_event_id text not null",
      "latest_event_created_at timestamptz not null",
    ]) expect(sql).toContain(field);
    expect(sql).toContain("'incomplete', 'incomplete_expired', 'trialing', 'active'");
    expect(sql).toContain("'past_due', 'canceled', 'unpaid', 'paused'");
  });

  it("makes webhook writes atomic, idempotent, monotonic, and service-role-only", () => {
    expect(sql).toContain("create table public.team_billing_processed_events");
    expect(sql).toContain("on conflict (stripe_event_id) do nothing");
    expect(sql).toContain("if inserted_event_id is null then return 'duplicate'");
    expect(sql).toContain("latest_event_created_at < excluded.latest_event_created_at");
    expect(sql).toContain("team billing subscription owner conflict");
    expect(sql).toContain("stripe_customer_id = excluded.stripe_customer_id");
    expect(sql).toContain("return 'stale'");
    expect(sql).toContain("enable row level security");
    expect(sql).toContain("from public, anon, authenticated");
    expect(sql).toContain(") to service_role;");
  });

  it("never changes base-plan subscriptions or admin-comp membership state", () => {
    const body = sql.match(/create or replace function public\.apply_team_stripe_subscription_event\([\s\S]*?\$\$;/)?.[0];
    expect(body).toBeDefined();
    expect(body).not.toContain("public.subscriptions");
    expect(body).not.toContain("public.team_memberships");
    expect(body).not.toMatch(/\b(delete|update|insert)\s+into\s+public\.(subscriptions|team_memberships)\b/);
    expect(sql).toContain("-- team paid billing is deliberately separate from public.subscriptions.plan.");
    expect(sql).toContain("-- this webhook rpc never edits team_memberships or restores/clears comp state.");
  });
});
