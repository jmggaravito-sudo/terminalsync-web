import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";

const root = process.cwd();
const owner = "11111111-1111-4111-8111-111111111111";
const otherOwner = "22222222-2222-4222-8222-222222222222";
const migrations = [
  "0038_team_stripe_billing.sql",
  "0049_team_checkout_intents.sql",
  "0050_team_checkout_intent_single_active_guard.sql",
  "0051_team_checkout_atomic_billing_lifecycle.sql",
  "20261019192526_team_seat_ceiling_64.sql",
  "20261019230000_team_checkout_provider_attempt_guard.sql",
];

async function database() {
  const db = new PGlite();
  await db.exec(`
    CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
    CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid PRIMARY KEY);
    INSERT INTO auth.users VALUES ('${owner}'), ('${otherOwner}');
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

async function reserve(db: PGlite, requestId: string, ownerId = owner) {
  return (await db.query<any>(
    `SELECT * FROM public.reserve_team_checkout_intent($1::uuid,$2::uuid,'price_team123',3,'subscription')`,
    [ownerId, requestId],
  )).rows[0];
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

describe("Team checkout durable provider-attempt migration", () => {
  it("persists creating before a provider call and blocks every replay until reconciliation", async () => {
    const db = await database();
    try {
      const intent = await reserve(db, "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa");
      expect(intent.state).toBe("reserved");

      const creating = (await db.query<any>(
        `SELECT * FROM public.begin_team_checkout_provider_attempt($1::uuid,$2::text)`,
        [intent.id, intent.idempotency_key],
      )).rows[0];
      expect(creating).toMatchObject({ id: intent.id, state: "creating", stripe_session_id: null, stripe_subscription_id: null });

      // A retry cannot receive new authorization to invoke the provider.
      await expect(db.query(
        `SELECT * FROM public.begin_team_checkout_provider_attempt($1::uuid,$2::text)`,
        [intent.id, intent.idempotency_key],
      )).rejects.toThrow(/requires reconciliation/);
      await expect(reserve(db, "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa")).rejects.toThrow(/requires reconciliation/);
      await expect(reserve(db, "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb")).rejects.toThrow(/already in flight/);

      // The transition itself stores no checkout URL, payment data, or caller identity beyond the existing owner binding.
      const columns = (await db.query<{ column_name: string }>(`
        SELECT column_name FROM information_schema.columns
        WHERE table_schema='public' AND table_name='team_checkout_intents'
      `)).rows.map((row) => row.column_name);
      for (const forbidden of ["checkout_url", "payment_data", "webhook_payload", "metadata", "secret"]) {
        expect(columns).not.toContain(forbidden);
      }
    } finally {
      await db.close();
    }
  }, 20_000);

  it("allows a session binding only after the durable attempt and quarantines unknown outcomes", async () => {
    const db = await database();
    try {
      const direct = await reserve(db, "cccccccc-cccc-4ccc-8ccc-cccccccccccc");
      await expect(db.query(
        `SELECT public.bind_team_checkout_session($1::uuid,$2::text,'cs_direct')`,
        [direct.id, direct.idempotency_key],
      )).rejects.toThrow(/state conflict/);
      await expect(db.query(
        `SELECT public.mark_team_checkout_intent_ambiguous($1::uuid,$2::text)`,
        [direct.id, direct.idempotency_key],
      )).rejects.toThrow(/state conflict/);

      await db.query(`SELECT * FROM public.begin_team_checkout_provider_attempt($1::uuid,$2::text)`, [direct.id, direct.idempotency_key]);
      expect((await db.query<any>(
        `SELECT public.mark_team_checkout_intent_ambiguous($1::uuid,$2::text) AS state`,
        [direct.id, direct.idempotency_key],
      )).rows[0].state).toBe("ambiguous");
      await expect(reserve(db, "cccccccc-cccc-4ccc-8ccc-cccccccccccc")).rejects.toThrow(/requires reconciliation/);

      // A separately verified provider result may recover the quarantined
      // row by binding exactly one session; it never reopens create authority.
      expect((await db.query<any>(
        `SELECT public.bind_team_checkout_session($1::uuid,$2::text,'cs_verified_recovery') AS state`,
        [direct.id, direct.idempotency_key],
      )).rows[0].state).toBe("checkout_created");

      // Use another authenticated owner for an isolated normal binding case:
      // the first owner's active row must continue blocking new reservations.
      const bindable = await reserve(db, "dddddddd-dddd-4ddd-8ddd-dddddddddddd", otherOwner);
      await db.query(`SELECT * FROM public.begin_team_checkout_provider_attempt($1::uuid,$2::text)`, [bindable.id, bindable.idempotency_key]);
      expect((await db.query<any>(
        `SELECT public.bind_team_checkout_session($1::uuid,$2::text,'cs_bound') AS state`,
        [bindable.id, bindable.idempotency_key],
      )).rows[0].state).toBe("checkout_created");
      expect((await db.query<any>(
        `SELECT public.bind_team_checkout_session($1::uuid,$2::text,'cs_bound') AS state`,
        [bindable.id, bindable.idempotency_key],
      )).rows[0].state).toBe("checkout_created");
      await expect(db.query(
        `SELECT public.bind_team_checkout_session($1::uuid,$2::text,'cs_other')`,
        [bindable.id, bindable.idempotency_key],
      )).rejects.toThrow(/state conflict/);
    } finally {
      await db.close();
    }
  }, 20_000);

  it("permits only a fully verified billing finalizer to recover a crashed creating attempt", async () => {
    const db = await database();
    try {
      const intent = await reserve(db, "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee");
      await db.query(`SELECT * FROM public.begin_team_checkout_provider_attempt($1::uuid,$2::text)`, [intent.id, intent.idempotency_key]);

      const sessionId = "cs_recovered";
      const customerId = "cus_recovered";
      const subscriptionId = "sub_recovered";
      const result = await db.query<any>(`
        SELECT public.apply_team_checkout_billing_and_finalize(
          $1::uuid,$2,$3::uuid,$4,$5,$6,$7,$8,$9::timestamptz,$10::timestamptz,
          $11,$12,$13,$14::timestamptz,$15::jsonb
        ) AS state
      `, [
        intent.id, sessionId, owner, customerId, subscriptionId, "price_team123", 3, "active",
        "2026-10-19T00:00:00.000Z", "2026-11-19T00:00:00.000Z", false,
        "evt_recovered", "customer.subscription.created", "2026-10-19T00:00:01.000Z",
        JSON.stringify(metadata(intent, sessionId, customerId, subscriptionId)),
      ]);

      expect(result.rows[0].state).toBe("completed");
      expect((await db.query<any>(
        `SELECT state,billing_sync_status,stripe_session_id,stripe_subscription_id FROM public.team_checkout_intents WHERE id=$1::uuid`,
        [intent.id],
      )).rows[0]).toEqual({
        state: "completed", billing_sync_status: "applied", stripe_session_id: sessionId, stripe_subscription_id: subscriptionId,
      });
      expect((await db.query(`SELECT * FROM public.team_memberships`)).rows).toEqual([]);
      expect((await db.query(`SELECT * FROM public.team_paid_roster_members`)).rows).toEqual([]);
      expect((await db.query(`SELECT * FROM public.subscriptions`)).rows).toEqual([]);
    } finally {
      await db.close();
    }
  }, 20_000);

  it("keeps provider-attempt RPCs service-role-only", async () => {
    const db = await database();
    try {
      const signature = "public.begin_team_checkout_provider_attempt(uuid,text)";
      expect((await db.query<{ ok: boolean }>(
        `SELECT has_function_privilege('authenticated',$1,'EXECUTE') AS ok`, [signature],
      )).rows[0].ok).toBe(false);
      expect((await db.query<{ ok: boolean }>(
        `SELECT has_function_privilege('service_role',$1,'EXECUTE') AS ok`, [signature],
      )).rows[0].ok).toBe(true);
    } finally {
      await db.close();
    }
  }, 20_000);
});
