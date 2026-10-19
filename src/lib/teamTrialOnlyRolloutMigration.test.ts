import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { citext } from "@electric-sql/pglite/contrib/citext";

const migration = (file: string) =>
  readFileSync(join(process.cwd(), "supabase/migrations", file), "utf8");

// This is deliberately a non-contiguous list.  The production runbook applies
// it one migration at a time because Supabase's normal directory replay would
// also include paid checkout/roster migrations that are not part of the
// no-card Team availability rollout.
const trialOnlyMigrationFiles = [
  "0039_team_shared_spaces_metadata.sql",
  "0040_team_universal_trial.sql",
  "0041_team_entitlement_and_alias_reconciliation.sql",
  "0042_team_metadata_invites.sql",
  "0043_team_metadata_requests.sql",
  "0044_team_trial_on_signup.sql",
  "0047_team_invitation_owner_alias_projection.sql",
  "0048_team_request_participant_projection.sql",
  "0053_team_conversation_turns.sql",
  "0054_team_conversation_metadata_hardening.sql",
  "0055_team_legacy_approval_hardening.sql",
] as const;

const excludedFromTrialOnlyRollout = [
  "0045_team_paid_roster.sql",
  "0046_team_paid_roster_api.sql",
  "0049_team_checkout_intents.sql",
  "0050_team_checkout_intent_single_active_guard.sql",
  "0051_team_checkout_atomic_billing_lifecycle.sql",
  "0052_team_paid_roster_opaque_invitations.sql",
  "0056_team_text_deliveries.sql",
  "0057_team_seat_ceiling_64.sql",
] as const;

const ownerId = "00000000-0000-0000-0000-000000000701";
const inviteeId = "00000000-0000-0000-0000-000000000702";

async function productionLikeBase(beforeTrialOnlyRollout?: (db: PGlite) => Promise<void>) {
  const db = new PGlite({ extensions: { citext } });
  await db.exec(`
    CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
    CREATE EXTENSION IF NOT EXISTS citext;
    CREATE SCHEMA auth;
    CREATE TABLE auth.users(
      id uuid PRIMARY KEY,
      email text,
      raw_user_meta_data jsonb DEFAULT '{}'::jsonb,
      raw_app_meta_data jsonb DEFAULT '{}'::jsonb
    );
    CREATE TABLE public.profiles(id uuid PRIMARY KEY,email text,full_name text,avatar_url text);
    CREATE TABLE public.subscriptions(
      user_id uuid PRIMARY KEY,plan text,status text,stripe_customer_id text,
      stripe_subscription_id text,provider_customer_id text,provider_subscription_id text,
      ai_included boolean DEFAULT false,current_period_start timestamptz,current_period_end timestamptz,
      cancel_at_period_end boolean DEFAULT false,updated_at timestamptz DEFAULT now()
    );
    CREATE TABLE public.audit_log(user_id uuid,event text,metadata jsonb);
    CREATE TABLE public.comp_grants(
      email citext PRIMARY KEY,plan text,months int,claimed_at timestamptz,
      claimed_user_id uuid,updated_at timestamptz
    );
    CREATE TABLE public.courtesy_entitlement(user_id text PRIMARY KEY,tier text,updated_at timestamptz);
    CREATE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RETURN NEW; END $$;
    CREATE TRIGGER auth_user_signup AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  `);

  // Production already has these two foundations.  Applying the selected
  // trial-only subset after them is what the operator runbook intends.
  await db.exec(migration("0037_team_comp_entitlements.sql"));
  await db.exec(migration("0038_team_stripe_billing.sql"));
  await beforeTrialOnlyRollout?.(db);
  for (const file of trialOnlyMigrationFiles) await db.exec(migration(file));
  return db;
}

describe("Team no-card trial rollout compatibility", () => {
  it("keeps paid checkout, roster, delivery, and seat-cap migrations out of the selected rollout", () => {
    expect(trialOnlyMigrationFiles).toEqual([
      "0039_team_shared_spaces_metadata.sql",
      "0040_team_universal_trial.sql",
      "0041_team_entitlement_and_alias_reconciliation.sql",
      "0042_team_metadata_invites.sql",
      "0043_team_metadata_requests.sql",
      "0044_team_trial_on_signup.sql",
      "0047_team_invitation_owner_alias_projection.sql",
      "0048_team_request_participant_projection.sql",
      "0053_team_conversation_turns.sql",
      "0054_team_conversation_metadata_hardening.sql",
      "0055_team_legacy_approval_hardening.sql",
    ]);
    expect(excludedFromTrialOnlyRollout).not.toContain("0044_team_trial_on_signup.sql");
    expect(excludedFromTrialOnlyRollout).toContain("0056_team_text_deliveries.sql");
    expect(excludedFromTrialOnlyRollout).toContain("0057_team_seat_ceiling_64.sql");
    expect(migration("0040_team_universal_trial.sql")).not.toContain("public.subscriptions.plan");
  });

  it("starts and retries a 168-hour Team trial without changing existing active Pro or Max subscriptions", async () => {
    // These accounts predate 0044, so their trial can only begin through the
    // authenticated/manual 0040 RPC. That is the rollout path for an existing
    // paid subscriber, not the signup-trigger path for a new account.
    const proId = "00000000-0000-0000-0000-000000000703";
    const maxId = "00000000-0000-0000-0000-000000000704";
    const db = await productionLikeBase(async (base) => {
      await base.exec(`
        INSERT INTO auth.users(id,email) VALUES
          ('${proId}','pro-existing@example.test'),
          ('${maxId}','max-existing@example.test');
        UPDATE public.subscriptions
        SET plan='pro', status='active', stripe_customer_id='cus-pro-existing',
            stripe_subscription_id='sub-pro-existing', provider_customer_id='cus-pro-existing',
            provider_subscription_id='sub-pro-existing', ai_included=true,
            current_period_start='2026-10-01T00:00:00.000Z',
            current_period_end='2026-11-01T00:00:00.000Z', cancel_at_period_end=false,
            updated_at='2026-10-01T00:00:00.000Z'
        WHERE user_id='${proId}';
        UPDATE public.subscriptions
        SET plan='max', status='active', stripe_customer_id='cus-max-existing',
            stripe_subscription_id='sub-max-existing', provider_customer_id='cus-max-existing',
            provider_subscription_id='sub-max-existing', ai_included=true,
            current_period_start='2026-10-02T00:00:00.000Z',
            current_period_end='2026-11-02T00:00:00.000Z', cancel_at_period_end=true,
            updated_at='2026-10-02T00:00:00.000Z'
        WHERE user_id='${maxId}';
      `);
    });
    try {
      // A full serialized row snapshot makes this stronger than checking only
      // plan/status: provider IDs, periods, AI inclusion, cancellation state,
      // and updated_at must all remain byte-for-byte unchanged as well.
      const baseSnapshots = await db.query<{
        user_id: string;
        plan: string;
        status: string;
        snapshot: string;
      }>(`
        SELECT s.user_id,s.plan,s.status,row_to_json(s)::text AS snapshot
        FROM public.subscriptions s
        WHERE s.user_id IN ($1::uuid,$2::uuid)
        ORDER BY s.user_id
      `, [proId, maxId]);
      expect(baseSnapshots.rows.map(({ user_id, plan, status }) => ({ user_id, plan, status }))).toEqual([
        { user_id: proId, plan: "pro", status: "active" },
        { user_id: maxId, plan: "max", status: "active" },
      ]);

      const started: Array<{ user_id: string; starts_at: string; expires_at: string }> = [];
      for (const userId of [proId, maxId]) {
        const trial = (await db.query<{ result: string; starts_at: string; expires_at: string }>(
          "SELECT * FROM public.start_team_universal_trial($1::uuid)", [userId],
        )).rows[0];
        expect(trial.result).toBe("started");
        expect(Date.parse(trial.expires_at) - Date.parse(trial.starts_at)).toBe(168 * 60 * 60 * 1000);
        started.push({ user_id: userId, starts_at: trial.starts_at, expires_at: trial.expires_at });
      }

      const afterStart = await db.query<{ user_id: string; plan: string; status: string; snapshot: string }>(`
        SELECT s.user_id,s.plan,s.status,row_to_json(s)::text AS snapshot
        FROM public.subscriptions s
        WHERE s.user_id IN ($1::uuid,$2::uuid)
        ORDER BY s.user_id
      `, [proId, maxId]);
      expect(afterStart.rows).toEqual(baseSnapshots.rows);

      for (const firstTrial of started) {
        const retry = (await db.query<{ result: string; starts_at: string; expires_at: string }>(
          "SELECT * FROM public.start_team_universal_trial($1::uuid)", [firstTrial.user_id],
        )).rows[0];
        expect(retry).toEqual({
          starts_at: firstTrial.starts_at,
          expires_at: firstTrial.expires_at,
          result: "already_claimed",
        });
      }

      const afterRetry = await db.query<{ user_id: string; plan: string; status: string; snapshot: string }>(`
        SELECT s.user_id,s.plan,s.status,row_to_json(s)::text AS snapshot
        FROM public.subscriptions s
        WHERE s.user_id IN ($1::uuid,$2::uuid)
        ORDER BY s.user_id
      `, [proId, maxId]);
      expect(afterRetry.rows).toEqual(baseSnapshots.rows);
      expect((await db.query<{ count: number }>(
        "SELECT count(*)::int AS count FROM public.team_trial_entitlements WHERE user_id IN ($1::uuid,$2::uuid)",
        [proId, maxId],
      )).rows[0].count).toBe(2);
    } finally {
      await db.close();
    }
  }, 30_000);

  it("applies the automatic no-card trial and bidirectional approval subset to the 0037/0038 base", async () => {
    const db = await productionLikeBase();
    try {
      // 0044 is deliberately part of the launch subset: every new account
      // receives the 168-hour Team entitlement without changing its base plan.
      await db.exec(`
        INSERT INTO auth.users(id,email) VALUES
          ('${ownerId}','owner@example.test'),
          ('${inviteeId}','invitee@example.test');
      `);
      expect((await db.query<{ count: number }>(
        "SELECT count(*)::int AS count FROM public.team_trial_entitlements",
      )).rows[0].count).toBe(2);
      expect((await db.query<{ plan: string; status: string }>(
        "SELECT plan,status FROM public.subscriptions ORDER BY user_id",
      )).rows).toEqual([
        { plan: "free", status: "active" },
        { plan: "free", status: "active" },
      ]);

      const automaticEntitlements = (await db.query<{ user_id: string; starts_at: string; expires_at: string }>(
        "SELECT user_id,starts_at,expires_at FROM public.team_trial_entitlements ORDER BY user_id",
      )).rows;
      expect(automaticEntitlements.map((row) => row.user_id)).toEqual([ownerId, inviteeId]);
      for (const entitlement of automaticEntitlements) {
        expect(Date.parse(entitlement.expires_at) - Date.parse(entitlement.starts_at)).toBe(168 * 60 * 60 * 1000);
      }

      // Inserting a trial row is not enough: the production entitlement
      // resolver and the shared-space gate must immediately recognize the
      // automatic, single-seat trial for each newly-created account.
      for (const automaticEntitlement of automaticEntitlements) {
        const resolvedEntitlement = (await db.query<{
          eligible: boolean;
          seat_limit: number;
          source: string | null;
          expires_at: string | null;
        }>(
          "SELECT eligible,seat_limit,source,expires_at FROM public.get_team_entitlement($1::uuid)",
          [automaticEntitlement.user_id],
        )).rows[0];
        expect(resolvedEntitlement).toMatchObject({
          eligible: true,
          seat_limit: 1,
          source: "universal_trial",
        });
        expect(resolvedEntitlement.expires_at).not.toBeNull();
        expect(Date.parse(resolvedEntitlement.expires_at!)).toBe(Date.parse(automaticEntitlement.expires_at));
        expect((await db.query<{ eligible: boolean }>(
          "SELECT public.team_shared_spaces_eligible($1::uuid) AS eligible",
          [automaticEntitlement.user_id],
        )).rows[0].eligible).toBe(true);
      }

      // A manual retry must preserve the automatic window rather than creating
      // a second trial or moving either expiry.
      const ownerTrial = (await db.query<{ result: string; starts_at: string; expires_at: string }>(
        "SELECT * FROM public.start_team_universal_trial($1::uuid)", [ownerId],
      )).rows[0];
      expect(ownerTrial.result).toBe("already_claimed");
      expect(Date.parse(ownerTrial.starts_at)).toBe(Date.parse(automaticEntitlements[0].starts_at));
      expect(Date.parse(ownerTrial.expires_at)).toBe(Date.parse(automaticEntitlements[0].expires_at));
      expect((await db.query<{ result: string }>(
        "SELECT * FROM public.start_team_universal_trial($1::uuid)", [ownerId],
      )).rows[0].result).toBe("already_claimed");
      const inviteeTrial = (await db.query<{ result: string; starts_at: string; expires_at: string }>(
        "SELECT * FROM public.start_team_universal_trial($1::uuid)", [inviteeId],
      )).rows[0];
      expect(inviteeTrial.result).toBe("already_claimed");
      expect(Date.parse(inviteeTrial.starts_at)).toBe(Date.parse(automaticEntitlements[1].starts_at));
      expect(Date.parse(inviteeTrial.expires_at)).toBe(Date.parse(automaticEntitlements[1].expires_at));

      await db.query("SELECT * FROM public.claim_team_alias($1::uuid,'alex')", [ownerId]);
      await db.query("SELECT * FROM public.claim_team_alias($1::uuid,'bea')", [inviteeId]);
      const spaceId = (await db.query<{ id: string }>(
        "SELECT id FROM public.register_team_space($1::uuid,'Espacio de Alex',NULL,NULL)", [ownerId],
      )).rows[0].id;
      expect((await db.query<{ result: string }>(
        "SELECT * FROM public.invite_team_alias($1::uuid,$2::uuid,'bea')", [ownerId, spaceId],
      )).rows[0].result).toBe("submitted");
      const invitationId = (await db.query<{ id: string }>(
        "SELECT id FROM public.team_space_invitations WHERE space_id=$1::uuid", [spaceId],
      )).rows[0].id;
      expect((await db.query<{ result: string }>(
        "SELECT * FROM public.respond_team_invitation($1::uuid,$2::uuid,true)", [inviteeId, invitationId],
      )).rows[0].result).toBe("accepted");

      // The recipient sees the received space through the invitation projection,
      // not as an owned Team space.
      expect((await db.query(
        "SELECT * FROM public.list_team_spaces($1::uuid)", [inviteeId],
      )).rows).toHaveLength(0);
      expect((await db.query<{ owner_alias: string }>(
        "SELECT * FROM public.list_team_invitations_v2($1::uuid)", [inviteeId],
      )).rows).toEqual([expect.objectContaining({ owner_alias: "alex", space_id: spaceId })]);

      const target = (await db.query<{ relationship_id: string }>(
        "SELECT * FROM public.list_team_conversation_targets_v3($1::uuid,$2::uuid)", [ownerId, spaceId],
      )).rows[0];
      const turn = (await db.query<{ thread_id: string; id: string; status: string }>(`
        SELECT * FROM public.create_team_space_conversation_turn_v3(
          $1::uuid,$2::uuid,$3::uuid,'context',$4::text,$5::jsonb,$6::uuid
        )
      `, [
        ownerId, spaceId, target.relationship_id, "a".repeat(64),
        JSON.stringify({ itemCount: 2 }), "00000000-0000-4000-8000-000000000703",
      ])).rows[0];
      expect(turn.status).toBe("pending");
      expect((await db.query<{ status: string }>(
        "SELECT * FROM public.respond_team_conversation_turn_v3($1::uuid,$2::uuid,'accepted',$3::uuid)",
        [inviteeId, turn.id, "00000000-0000-4000-8000-000000000704"],
      )).rows[0].status).toBe("accepted");

      // The deliberately omitted paid/delivery schema stays absent.  This
      // proves the selected test does not accidentally exercise checkout or
      // send a response/document merely by approving a metadata turn.
      for (const relation of [
        "public.team_paid_roster_members",
        "public.team_checkout_intents",
        "team_delivery_private.text_deliveries",
      ]) {
        expect((await db.query<{ relation: string | null }>(
          "SELECT to_regclass($1)::text AS relation", [relation],
        )).rows[0].relation).toBeNull();
      }
      expect((await db.query<{ routine: string | null }>(
        "SELECT to_regprocedure('public.list_team_text_deliveries_v1(uuid,uuid,integer,timestamptz,uuid)')::text AS routine",
      )).rows[0].routine).toBeNull();
    } finally {
      await db.close();
    }
  }, 30_000);

  it("expires automatic trials without reopening their one-time Team entitlement", async () => {
    const db = await productionLikeBase();
    try {
      await db.exec(`
        INSERT INTO auth.users(id,email) VALUES
          ('${ownerId}','owner@example.test'),
          ('${inviteeId}','invitee@example.test');
      `);

      // Keep 0040's fixed-duration CHECK valid while moving the real automatic
      // signup grants just beyond their 168-hour expiry boundary.
      await db.exec(`
        UPDATE public.team_trial_entitlements
        SET starts_at = pg_catalog.now() - interval '168 hours 1 second',
            expires_at = pg_catalog.now() - interval '1 second';
      `);
      const expiredEntitlements = (await db.query<{
        user_id: string;
        starts_at: string;
        expires_at: string;
      }>("SELECT user_id,starts_at,expires_at FROM public.team_trial_entitlements ORDER BY user_id")).rows;

      expect(expiredEntitlements.map((row) => row.user_id)).toEqual([ownerId, inviteeId]);
      for (const expiredEntitlement of expiredEntitlements) {
        expect(Date.parse(expiredEntitlement.expires_at) - Date.parse(expiredEntitlement.starts_at))
          .toBe(168 * 60 * 60 * 1000);
        expect(Date.parse(expiredEntitlement.expires_at)).toBeLessThan(Date.now());

        expect((await db.query<{
          eligible: boolean;
          seat_limit: number;
          source: string | null;
          expires_at: string | null;
        }>(
          "SELECT eligible,seat_limit,source,expires_at FROM public.get_team_entitlement($1::uuid)",
          [expiredEntitlement.user_id],
        )).rows[0]).toEqual({
          eligible: false,
          seat_limit: 1,
          source: null,
          expires_at: null,
        });
        expect((await db.query<{ eligible: boolean }>(
          "SELECT public.team_shared_spaces_eligible($1::uuid) AS eligible",
          [expiredEntitlement.user_id],
        )).rows[0].eligible).toBe(false);

        // Retrying after expiry must return the original window, not create a
        // fresh 168-hour entitlement or reactivate the Team gate.
        const retry = (await db.query<{ result: string; starts_at: string; expires_at: string }>(
          "SELECT * FROM public.start_team_universal_trial($1::uuid)",
          [expiredEntitlement.user_id],
        )).rows[0];
        expect(retry.result).toBe("already_claimed");
        expect(Date.parse(retry.starts_at)).toBe(Date.parse(expiredEntitlement.starts_at));
        expect(Date.parse(retry.expires_at)).toBe(Date.parse(expiredEntitlement.expires_at));
        expect((await db.query<{ eligible: boolean }>(
          "SELECT public.team_shared_spaces_eligible($1::uuid) AS eligible",
          [expiredEntitlement.user_id],
        )).rows[0].eligible).toBe(false);
      }
    } finally {
      await db.close();
    }
  }, 30_000);
});
