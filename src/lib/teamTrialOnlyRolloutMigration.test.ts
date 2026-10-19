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

async function productionLikeBase() {
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
});
