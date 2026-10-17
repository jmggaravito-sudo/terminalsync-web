import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";

const migration = readFileSync(
  join(process.cwd(), "supabase/migrations/0038_team_stripe_billing.sql"),
  "utf8",
);
const sql = migration.toLowerCase().replace(/\s+/g, " ");

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
    expect(sql).toContain("'past_due', 'canceled', 'unpaid', 'paused', 'reconciliation_required'");
    expect(sql).toContain("create table public.team_stripe_customer_owners");
  });

  it("makes webhook writes atomic, idempotent, monotonic, and service-role-only", () => {
    expect(sql).toContain("create table public.team_billing_processed_events");
    expect(sql).toContain("on conflict (stripe_event_id) do nothing");
    expect(sql).toContain("if inserted_event_id is null then");
    expect(sql).toContain("return 'duplicate'");
    expect(sql).toContain("team billing event id payload conflict");
    expect(sql).toContain("latest_event_created_at < excluded.latest_event_created_at");
    expect(sql).toContain("team billing subscription owner conflict");
    expect(sql).toContain("team stripe customer owner conflict");
    expect(sql).toContain("stripe_customer_id = excluded.stripe_customer_id");
    expect(sql).toContain("status = 'reconciliation_required'");
    expect(sql).toContain("return 'reconciliation_required'");
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

describe("Team Stripe billing RPC event ordering", () => {
  async function database() {
    const db = new PGlite();
    await db.exec(`
      CREATE ROLE anon;
      CREATE ROLE authenticated;
      CREATE ROLE service_role;
      CREATE SCHEMA auth;
      CREATE TABLE auth.users(id uuid PRIMARY KEY);
      INSERT INTO auth.users VALUES
        ('00000000-0000-0000-0000-000000000001'),
        ('00000000-0000-0000-0000-000000000002');
    `);
    await db.exec(migration);
    return db;
  }

  async function event(
    db: PGlite,
    {
      userId = "00000000-0000-0000-0000-000000000001",
      customerId = "cus_owner_1",
      subscriptionId = "sub_1",
      priceId = "price_team",
      seats = 2,
      status = "active",
      eventId,
      createdAt = "2026-10-17T08:00:00Z",
    }: {
      userId?: string;
      customerId?: string;
      subscriptionId?: string;
      priceId?: string;
      seats?: number;
      status?: string;
      eventId: string;
      createdAt?: string;
    },
  ) {
    const result = await db.query<{ result: string }>(
      `SELECT public.apply_team_stripe_subscription_event(
        $1::uuid, $2::text, $3::text, $4::text, $5::bigint, $6::text,
        NULL::timestamptz, NULL::timestamptz, false,
        $7::text, 'customer.subscription.updated'::text, $8::timestamptz, '{}'::jsonb
      ) AS result`,
      [userId, customerId, subscriptionId, priceId, seats, status, eventId, createdAt],
    );
    return result.rows[0].result;
  }

  // This test applies the real migration in PGlite and can exceed Vitest's
  // 5s default while the full suite runs in parallel on constrained hosts.
  it("fails closed on conflicting events in the same Stripe timestamp second", async () => {
    const db = await database();
    try {
      expect(await event(db, { eventId: "evt_active" })).toBe("applied");
      expect(await event(db, { eventId: "evt_active_same_state" })).toBe("stale");
      expect(await event(db, { eventId: "evt_canceled", status: "canceled" })).toBe("reconciliation_required");
      expect((await db.query<{ status: string }>(
        "SELECT status FROM public.team_billing_subscriptions WHERE stripe_subscription_id = 'sub_1'",
      )).rows[0].status).toBe("reconciliation_required");

      // A retry of the same Stripe event is an idempotent no-op; a third
      // same-second delivery cannot clear the fail-closed status either.
      expect(await event(db, { eventId: "evt_canceled", status: "canceled" })).toBe("duplicate");
      expect(await event(db, { eventId: "evt_active_2" })).toBe("reconciliation_required");
      expect((await db.query<{ status: string }>(
        "SELECT status FROM public.team_billing_subscriptions WHERE stripe_subscription_id = 'sub_1'",
      )).rows[0].status).toBe("reconciliation_required");

      // A strictly newer signed event resolves the ambiguous state; older
      // events remain no-ops and cannot restore an obsolete status.
      expect(await event(db, { eventId: "evt_newer", createdAt: "2026-10-17T08:00:01Z" })).toBe("applied");
      expect(await event(db, { eventId: "evt_older", status: "canceled", createdAt: "2026-10-17T07:59:59Z" })).toBe("stale");
      expect((await db.query<{ status: string }>(
        "SELECT status FROM public.team_billing_subscriptions WHERE stripe_subscription_id = 'sub_1'",
      )).rows[0].status).toBe("active");
    } finally {
      await db.close();
    }
  }, 15_000);

  it("binds each Stripe customer to one user and rolls back conflicting event IDs", async () => {
    const db = await database();
    try {
      expect(await event(db, { eventId: "evt_owner" })).toBe("applied");
      await expect(event(db, {
        userId: "00000000-0000-0000-0000-000000000002",
        subscriptionId: "sub_other",
        eventId: "evt_wrong_owner",
      })).rejects.toThrow("Team Stripe customer owner conflict");
      expect((await db.query<{ count: number }>(
        "SELECT count(*)::int AS count FROM public.team_billing_processed_events WHERE stripe_event_id = 'evt_wrong_owner'",
      )).rows[0].count).toBe(0);

      expect(await event(db, { eventId: "evt_second_subscription", subscriptionId: "sub_2" })).toBe("applied");
      await expect(event(db, { eventId: "evt_owner", status: "canceled" })).rejects.toThrow("Team billing event ID payload conflict");
    } finally {
      await db.close();
    }
  });
});
