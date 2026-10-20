import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";

const root = process.cwd();
const owner = "11111111-1111-4111-8111-111111111111";
const migrations = [
  "0038_team_stripe_billing.sql",
  "0049_team_checkout_intents.sql",
  "0050_team_checkout_intent_single_active_guard.sql",
  "0051_team_checkout_atomic_billing_lifecycle.sql",
  "20261019192526_team_seat_ceiling_64.sql",
  "20261019230000_team_checkout_provider_attempt_guard.sql",
  "20261019235959_team_checkout_completed_lifecycle.sql",
];

async function database() {
  const db = new PGlite();
  await db.exec(`
    CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
    CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid PRIMARY KEY);
    INSERT INTO auth.users VALUES ('${owner}');
    CREATE TABLE public.team_memberships(user_id uuid,status text,source text,starts_at timestamptz,expires_at timestamptz);
    CREATE TABLE public.team_trial_entitlements(user_id uuid,starts_at timestamptz,expires_at timestamptz);
    CREATE TABLE public.team_paid_roster_members(owner_user_id uuid,employee_user_id uuid,created_at timestamptz DEFAULT now());
    CREATE TABLE public.subscriptions(user_id uuid PRIMARY KEY,plan text);
  `);
  for (const name of migrations) {
    await db.exec(readFileSync(join(root, "supabase/migrations", name), "utf8"));
  }
  return db;
}

async function reserveAndBind(db: PGlite, requestId: string, sessionId: string) {
  const intent = (await db.query<any>(
    `SELECT * FROM public.reserve_team_checkout_intent($1::uuid,$2::uuid,'price_team123',3,'subscription')`,
    [owner, requestId],
  )).rows[0];
  await db.query(
    `SELECT * FROM public.begin_team_checkout_provider_attempt($1::uuid,$2::text)`,
    [intent.id, intent.idempotency_key],
  );
  await db.query(
    `SELECT public.bind_team_checkout_session($1::uuid,$2::text,$3::text)`,
    [intent.id, intent.idempotency_key, sessionId],
  );
  return intent;
}

function metadata(intent: any, sessionId: string, customerId: string, subscriptionId: string) {
  return {
    team_checkout_intent_id: intent.id,
    team_checkout_session_id: sessionId,
    team_checkout_owner_user_id: owner,
    team_checkout_request_id: intent.request_id,
    team_checkout_price_id: "price_team123",
    team_checkout_seats: "3",
    team_checkout_mode: "subscription",
    team_checkout_idempotency_key: intent.idempotency_key,
    team_checkout_customer_id: customerId,
    team_checkout_subscription_id: subscriptionId,
  };
}

type FinalizeInput = {
  eventId: string;
  eventType: "customer.subscription.created" | "customer.subscription.updated" | "customer.subscription.deleted";
  eventCreatedAt: string;
  status: string;
  cancelAtPeriodEnd?: boolean;
  sessionId?: string;
  customerId?: string;
  subscriptionId?: string;
  priceId?: string;
  seats?: number;
  metadata?: Record<string, string>;
};

async function finalize(db: PGlite, intent: any, input: FinalizeInput) {
  const sessionId = input.sessionId ?? "cs_exact";
  const customerId = input.customerId ?? "cus_exact";
  const subscriptionId = input.subscriptionId ?? "sub_exact";
  const result = await db.query<{ state: string }>(`
    SELECT public.apply_team_checkout_billing_and_finalize(
      $1::uuid,$2,$3::uuid,$4,$5,$6,$7,$8,$9::timestamptz,$10::timestamptz,
      $11,$12,$13,$14::timestamptz,$15::jsonb
    ) AS state
  `, [
    intent.id,
    sessionId,
    owner,
    customerId,
    subscriptionId,
    input.priceId ?? "price_team123",
    input.seats ?? 3,
    input.status,
    "2026-10-19T00:00:00.000Z",
    "2026-11-19T00:00:00.000Z",
    input.cancelAtPeriodEnd ?? false,
    input.eventId,
    input.eventType,
    input.eventCreatedAt,
    JSON.stringify(input.metadata ?? metadata(intent, sessionId, customerId, subscriptionId)),
  ]);
  return result.rows[0].state;
}

describe("completed Team checkout lifecycle forward migration", () => {
  it("atomically applies later exact updated/deleted events, tolerates delivery order, and never changes Pro/Max state", async () => {
    const db = await database();
    try {
      const intent = await reserveAndBind(db, "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", "cs_exact");
      const canonical = metadata(intent, "cs_exact", "cus_exact", "sub_exact");

      expect(await finalize(db, intent, {
        eventId: "evt_created", eventType: "customer.subscription.created",
        eventCreatedAt: "2026-10-19T00:00:01.000Z", status: "active",
      })).toBe("completed");

      expect(await finalize(db, intent, {
        eventId: "evt_updated", eventType: "customer.subscription.updated",
        eventCreatedAt: "2026-10-19T00:01:00.000Z", status: "past_due",
        cancelAtPeriodEnd: true,
      })).toBe("completed");
      expect((await db.query<any>(`
        SELECT status,cancel_at_period_end,latest_event_id,metadata
        FROM public.team_billing_subscriptions WHERE stripe_subscription_id='sub_exact'
      `)).rows[0]).toEqual({
        status: "past_due",
        cancel_at_period_end: true,
        latest_event_id: "evt_updated",
        metadata: canonical,
      });

      expect(await finalize(db, intent, {
        eventId: "evt_deleted", eventType: "customer.subscription.deleted",
        eventCreatedAt: "2026-10-19T00:02:00.000Z", status: "canceled",
      })).toBe("completed");
      expect((await db.query<any>(`
        SELECT status,latest_event_id,metadata FROM public.team_billing_subscriptions
        WHERE stripe_subscription_id='sub_exact'
      `)).rows[0]).toEqual({
        status: "canceled",
        latest_event_id: "evt_deleted",
        metadata: canonical,
      });
      expect((await db.query<any>(`
        SELECT state,billing_sync_status,stripe_session_id,stripe_subscription_id
        FROM public.team_checkout_intents WHERE id=$1::uuid
      `, [intent.id])).rows[0]).toEqual({
        state: "completed",
        billing_sync_status: "applied",
        stripe_session_id: "cs_exact",
        stripe_subscription_id: "sub_exact",
      });

      // Replays and stale events must never rewind a delivered cancellation.
      expect(await finalize(db, intent, {
        eventId: "evt_deleted", eventType: "customer.subscription.deleted",
        eventCreatedAt: "2026-10-19T00:02:00.000Z", status: "canceled",
      })).toBe("completed");
      expect(await finalize(db, intent, {
        eventId: "evt_late_stale", eventType: "customer.subscription.updated",
        eventCreatedAt: "2026-10-19T00:00:30.000Z", status: "active",
      })).toBe("completed");
      expect((await db.query<any>(`
        SELECT status,latest_event_id FROM public.team_billing_subscriptions
        WHERE stripe_subscription_id='sub_exact'
      `)).rows[0]).toEqual({ status: "canceled", latest_event_id: "evt_deleted" });
      expect((await db.query<any>(`
        SELECT count(*)::int AS count FROM public.team_billing_processed_events
        WHERE stripe_subscription_id='sub_exact'
      `)).rows[0].count).toBe(4);

      // The separate Team ledger path never mutates the legacy base-plan table.
      expect((await db.query(`SELECT * FROM public.subscriptions`)).rows).toEqual([]);
    } finally {
      await db.close();
    }
  }, 20_000);

  it("rejects rebinding or malformed canonical metadata before any completed-intent ledger write", async () => {
    const db = await database();
    try {
      const intent = await reserveAndBind(db, "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb", "cs_exact");
      await finalize(db, intent, {
        eventId: "evt_created", eventType: "customer.subscription.created",
        eventCreatedAt: "2026-10-19T00:00:01.000Z", status: "active",
      });
      const before = {
        intent: (await db.query<any>(`
          SELECT state,billing_sync_status,stripe_session_id,stripe_subscription_id
          FROM public.team_checkout_intents WHERE id=$1::uuid
        `, [intent.id])).rows[0],
        ledger: (await db.query<any>(`
          SELECT status,latest_event_id,metadata FROM public.team_billing_subscriptions
          WHERE stripe_subscription_id='sub_exact'
        `)).rows[0],
        events: (await db.query<any>(`
          SELECT count(*)::int AS count FROM public.team_billing_processed_events
        `)).rows[0].count,
      };

      await expect(finalize(db, intent, {
        eventId: "evt_wrong_session", eventType: "customer.subscription.updated",
        eventCreatedAt: "2026-10-19T00:01:00.000Z", status: "past_due",
        sessionId: "cs_wrong",
      })).rejects.toThrow(/does not match|cannot be downgraded/);
      await expect(finalize(db, intent, {
        eventId: "evt_wrong_subscription", eventType: "customer.subscription.updated",
        eventCreatedAt: "2026-10-19T00:01:01.000Z", status: "past_due",
        subscriptionId: "sub_wrong",
      })).rejects.toThrow(/does not match|cannot be downgraded/);
      await expect(finalize(db, intent, {
        eventId: "evt_wrong_metadata", eventType: "customer.subscription.deleted",
        eventCreatedAt: "2026-10-19T00:01:02.000Z", status: "canceled",
        metadata: {
          ...metadata(intent, "cs_exact", "cus_exact", "sub_exact"),
          team_checkout_owner_user_id: "22222222-2222-4222-8222-222222222222",
        },
      })).rejects.toThrow(/does not match/);
      await expect(finalize(db, intent, {
        eventId: "evt_extra_metadata", eventType: "customer.subscription.updated",
        eventCreatedAt: "2026-10-19T00:01:03.000Z", status: "past_due",
        metadata: {
          ...metadata(intent, "cs_exact", "cus_exact", "sub_exact"),
          unreviewed_extra_key: "must-not-reach-ledger",
        },
      })).rejects.toThrow(/does not match/);

      expect((await db.query<any>(`
        SELECT state,billing_sync_status,stripe_session_id,stripe_subscription_id
        FROM public.team_checkout_intents WHERE id=$1::uuid
      `, [intent.id])).rows[0]).toEqual(before.intent);
      expect((await db.query<any>(`
        SELECT status,latest_event_id,metadata FROM public.team_billing_subscriptions
        WHERE stripe_subscription_id='sub_exact'
      `)).rows[0]).toEqual(before.ledger);
      expect((await db.query<any>(`
        SELECT count(*)::int AS count FROM public.team_billing_processed_events
      `)).rows[0].count).toBe(before.events);
    } finally {
      await db.close();
    }
  }, 20_000);

  it("keeps same-timestamp conflicts fail-closed and preserves the service-role boundary", async () => {
    const db = await database();
    try {
      const intent = await reserveAndBind(db, "cccccccc-cccc-4ccc-8ccc-cccccccccccc", "cs_exact");
      await finalize(db, intent, {
        eventId: "evt_created", eventType: "customer.subscription.created",
        eventCreatedAt: "2026-10-19T00:00:01.000Z", status: "active",
      });
      expect(await finalize(db, intent, {
        eventId: "evt_first_update", eventType: "customer.subscription.updated",
        eventCreatedAt: "2026-10-19T00:01:00.000Z", status: "active",
      })).toBe("completed");
      expect(await finalize(db, intent, {
        eventId: "evt_conflicting_update", eventType: "customer.subscription.updated",
        eventCreatedAt: "2026-10-19T00:01:00.000Z", status: "past_due",
      })).toBe("pending_reconciliation");

      expect((await db.query<any>(`
        SELECT status FROM public.team_billing_subscriptions WHERE stripe_subscription_id='sub_exact'
      `)).rows[0].status).toBe("reconciliation_required");
      expect((await db.query<any>(`
        SELECT billing_sync_status FROM public.team_checkout_intents WHERE id=$1::uuid
      `, [intent.id])).rows[0].billing_sync_status).toBe("pending");
      await expect(finalize(db, intent, {
        eventId: "evt_after_reconciliation", eventType: "customer.subscription.deleted",
        eventCreatedAt: "2026-10-19T00:02:00.000Z", status: "canceled",
      })).rejects.toThrow(/cannot be downgraded/);

      const signature = "public.apply_team_checkout_billing_and_finalize(uuid,text,uuid,text,text,text,bigint,text,timestamptz,timestamptz,boolean,text,text,timestamptz,jsonb)";
      expect((await db.query<{ allowed: boolean }>(
        `SELECT has_function_privilege('authenticated',$1,'EXECUTE') AS allowed`, [signature],
      )).rows[0].allowed).toBe(false);
      expect((await db.query<{ allowed: boolean }>(
        `SELECT has_function_privilege('service_role',$1,'EXECUTE') AS allowed`, [signature],
      )).rows[0].allowed).toBe(true);
    } finally {
      await db.close();
    }
  }, 20_000);
});
