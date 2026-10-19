import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { citext } from "@electric-sql/pglite/contrib/citext";

// The database projection necessarily contains member UUIDs so it can resolve
// entitlements.  This guard exercises the actual server-side projection over
// the PGlite chain, without ever connecting to Supabase, to make sure 0052
// cannot reintroduce them into the owner-facing payload.
const { getSupabaseAdmin } = vi.hoisted(() => ({ getSupabaseAdmin: vi.fn() }));
vi.mock("@/lib/supabaseAdmin", () => ({ getSupabaseAdmin }));
import { listPaidTeamRoster } from "./teamPaidRoster";

const teamMigrationNames: Record<number, string> = {
  37: "team_comp_entitlements",
  38: "team_stripe_billing",
  39: "team_shared_spaces_metadata",
  40: "team_universal_trial",
  41: "team_entitlement_and_alias_reconciliation",
  42: "team_metadata_invites",
  43: "team_metadata_requests",
  44: "team_trial_on_signup",
  45: "team_paid_roster",
  46: "team_paid_roster_api",
  47: "team_invitation_owner_alias_projection",
  48: "team_request_participant_projection",
  49: "team_checkout_intents",
  50: "team_checkout_intent_single_active_guard",
  51: "team_checkout_atomic_billing_lifecycle",
  52: "team_paid_roster_opaque_invitations",
  53: "team_conversation_turns",
  54: "team_conversation_metadata_hardening",
  55: "team_legacy_approval_hardening",
  56: "team_text_deliveries",
};
const timestampedTeamMigrationFile = "20261019192526_team_seat_ceiling_64.sql";

const teamMigrationNumbers = Object.keys(teamMigrationNames).map(Number);
const migrationFile = (n: number) => `${String(n).padStart(4, "0")}_${teamMigrationNames[n]}.sql`;
const migration = (n: number) => readFileSync(join(process.cwd(), "supabase/migrations", migrationFile(n)), "utf8");

describe("Team migrations 0037-0057 compatibility contract", () => {
  it("keeps the shared-space, approval, trial, roster, and billing prerequisites in source order", () => {
    const expectedFiles = [...teamMigrationNumbers.map(migrationFile), timestampedTeamMigrationFile];
    const actualFiles = readdirSync(join(process.cwd(), "supabase/migrations"))
      .filter((file) => /^00(?:3[7-9]|4[0-9]|5[0-6])_team_.*\.sql$/.test(file) || file === timestampedTeamMigrationFile)
      .sort();

    expect(actualFiles).toEqual(expectedFiles);

    for (const [prerequisite, dependent] of [
      [37, 39], // membership gate before shared spaces
      [38, 40], // billing source before the unified entitlement resolver
      [39, 40], // the trial replaces the shared-space eligibility gate
      [40, 42], // invite RPCs depend on entitlement resolution
      [42, 43], // requests require accepted space invitations
      [40, 44], // signup trial grant requires trial storage
      [38, 45], // roster seats derive from paid billing
      [45, 46], // read-only roster projection depends on roster storage
      [42, 47], // invitation projection depends on invitation RPCs
      [43, 48], // request projection depends on request RPCs
      [49, 50], // single-active guard replaces the checkout reservation RPC
      [38, 51], // atomic finalization writes the billing ledger
      [49, 51], // atomic finalization binds a checkout intent
      [50, 51], // atomic finalization preserves the latest reservation guard
      [38, 52], // opaque reservations require the paid billing ledger
      [45, 52], // an accepted opaque invitation writes the roster membership
      [46, 52], // opaque reservations replace the read-only roster snapshot
      [39, 53], // conversation threads belong to metadata-only shared spaces
      [40, 53], // every conversation operation checks the live entitlement
      [42, 53], // accepted invitations prove the two-way conversation pair
      [53, 54], // hardening closes the final v3 metadata taxonomy
      [43, 55], // legacy requests exist before their count-only hardening
      [48, 55], // v2 request projection is replaced by the hardened contract
      [54, 55], // all approval metadata surfaces close in source order
      [53, 56], // private text delivery requires accepted conversation turns
      [55, 56], // text delivery builds on the hardened approval chain
    ]) {
      const prerequisiteIndex = teamMigrationNumbers.indexOf(prerequisite);
      const dependentIndex = teamMigrationNumbers.indexOf(dependent);
      expect(prerequisiteIndex).toBeGreaterThanOrEqual(0);
      expect(dependentIndex).toBeGreaterThanOrEqual(0);
      expect(prerequisiteIndex).toBeLessThan(dependentIndex);
    }
  });

  it("applies the real ordered chain and preserves signup, shared-space, approval, and roster contracts", async () => {
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
      // Re-fire the real trigger function with the same NEW.id on a minimal
      // probe table to prove ON CONFLICT leaves the original grant unchanged.
      await db.exec(`CREATE TABLE public.duplicate_signup_probe(id uuid);
        CREATE TRIGGER duplicate_signup_test AFTER INSERT ON public.duplicate_signup_probe
        FOR EACH ROW EXECUTE FUNCTION public.grant_team_trial_on_signup();
        INSERT INTO public.duplicate_signup_probe(id) VALUES ('${newId}')`);
      expect((await db.query(`SELECT starts_at,expires_at FROM public.team_trial_entitlements WHERE user_id=$1::uuid`,[newId])).rows).toEqual([original]);
      expect((await db.query<{ can_exec: boolean }>(`SELECT has_function_privilege('authenticated','public.grant_team_trial_on_signup()','EXECUTE') AS can_exec`)).rows[0].can_exec).toBe(false);
      expect((await db.query<{ n: number }>(`SELECT count(*)::int AS n FROM public.team_trial_entitlements`)).rows[0].n).toBe(1);

      // Later Team migrations must compose with this exact earlier schema, not
      // just pass when applied alone against hand-written table substitutes.
      for (const n of [45, 46]) await db.exec(migration(n));
      const employeeId = "00000000-0000-0000-0000-000000000046";
      await db.exec(`INSERT INTO auth.users(id,email) VALUES ('${employeeId}','employee@example.test')`);
      await db.exec(`INSERT INTO public.team_billing_subscriptions
        (stripe_subscription_id,user_id,stripe_customer_id,stripe_price_id,seat_count,status,
         latest_event_id,latest_event_created_at)
        VALUES ('sub-contract','${newId}','cus-contract','price-team',2,'active','evt-contract',now())`);
      expect((await db.query<{ assign_team_paid_employee: string }>(
        `SELECT public.assign_team_paid_employee($1::uuid,$2::uuid)`, [newId, employeeId]
      )).rows[0].assign_team_paid_employee).toBe("assigned");
      expect((await db.query<{ eligible: boolean; source: string }>(
        `SELECT eligible,source FROM public.get_team_entitlement($1::uuid)`, [employeeId]
      )).rows[0]).toEqual({ eligible: true, source: "paid" });
      const snapshot = (await db.query<{ roster: any }>(
        `SELECT public.list_team_paid_roster($1::uuid) AS roster`, [newId]
      )).rows[0].roster;
      expect(snapshot).toMatchObject({ has_active_team: true, seat_limit: 2, assigned_count: 1, occupied_seats: 2, available_slots: 0 });
      expect(snapshot.roster).toHaveLength(1);
      expect(snapshot.roster[0]).toMatchObject({ employee_user_id: employeeId, eligible: true });
      expect((await db.query<{ ok: boolean }>(
        `SELECT has_function_privilege('authenticated','public.list_team_paid_roster(uuid)','EXECUTE') AS ok`
      )).rows[0].ok).toBe(false);
      expect((await db.query<{ ok: boolean }>(
        `SELECT has_function_privilege('service_role','public.list_team_paid_roster(uuid)','EXECUTE') AS ok`
      )).rows[0].ok).toBe(true);
      for (const signature of [
        "public.assign_team_paid_employee(uuid,uuid)",
        "public.revoke_team_paid_employee(uuid,uuid)",
        "public.get_team_entitlement(uuid)",
      ]) {
        expect((await db.query<{ ok: boolean }>(
          `SELECT has_function_privilege('authenticated',$1,'EXECUTE') AS ok`, [signature]
        )).rows[0].ok).toBe(false);
      }
      expect((await db.query<{ ok: boolean }>(
        `SELECT has_table_privilege('authenticated','public.team_paid_roster_members','SELECT') AS ok`
      )).rows[0].ok).toBe(false);

      // Exercise the metadata invitation and owner-approval path across the
      // ordered migrations, ensuring migration application leaves callable
      // functions and the acceptance relationship expected by requests.
      await db.query(`SELECT * FROM public.claim_team_alias($1::uuid,'contract-owner')`, [newId]);
      await db.query(`SELECT * FROM public.claim_team_alias($1::uuid,'contract-employee')`, [employeeId]);
      const space = (await db.query<{ id: string }>(
        `SELECT id FROM public.register_team_space($1::uuid,'Contract space',NULL,NULL)`, [newId]
      )).rows[0]?.id;
      expect(space).toBeTruthy();
      expect((await db.query<{ result: string }>(
        `SELECT result FROM public.invite_team_alias($1::uuid,$2::uuid,'contract-employee')`, [newId, space]
      )).rows[0].result).toBe("submitted");
      const invitationId = (await db.query<{ id: string }>(
        `SELECT id FROM public.team_space_invitations WHERE space_id=$1::uuid`, [space]
      )).rows[0].id;
      expect((await db.query<{ result: string }>(
        `SELECT result FROM public.respond_team_invitation($1::uuid,$2::uuid,true)`, [employeeId, invitationId]
      )).rows[0].result).toBe("accepted");
      const request = (await db.query<{ id: string; status: string }>(
        `SELECT id,status FROM public.create_team_space_request($1::uuid,$2::uuid,'document',$3::text,$4::jsonb)`,
        [employeeId, space, "a".repeat(64), JSON.stringify({ label: "contract metadata", itemCount: 1 })]
      )).rows[0];
      expect(request.status).toBe("pending");
      expect((await db.query<{ status: string }>(
        `SELECT status FROM public.respond_team_space_request($1::uuid,$2::uuid,true)`, [newId, request.id]
      )).rows[0].status).toBe("accepted");
      expect((await db.query<{ ok: boolean }>(
        `SELECT has_function_privilege('authenticated','public.respond_team_space_request(uuid,uuid,boolean)','EXECUTE') AS ok`
      )).rows[0].ok).toBe(false);

      // Migration 0047 is additive: the legacy v1 invitation contract must
      // remain byte-for-byte equivalent while v2 adds only the claimed public
      // owner alias to an invitee-only projection.
      const legacyBefore = (await db.query(
        `SELECT * FROM public.list_team_invitations($1::uuid)`, [employeeId]
      )).rows;
      const legacyDefinitionBefore = (await db.query<{ definition: string }>(
        `SELECT pg_get_functiondef('public.list_team_invitations(uuid)'::regprocedure) AS definition`
      )).rows[0].definition;
      await db.exec(migration(47));
      const aliasProjection = (await db.query<{
        id: string; space_id: string; space_name: string; owner_alias: string | null;
        role: string; status: string; created_at: string; responded_at: string | null;
      }>(
        `SELECT * FROM public.list_team_invitations_v2($1::uuid)`, [employeeId]
      )).rows;
      expect(aliasProjection).toHaveLength(1);
      expect(aliasProjection[0]).toMatchObject({
        id: invitationId,
        space_id: space,
        space_name: "Contract space",
        owner_alias: "contract-owner",
        role: "invitee",
        status: "accepted",
      });
      expect(Object.keys(aliasProjection[0]).sort()).toEqual([
        "created_at", "id", "owner_alias", "responded_at", "role", "space_id", "space_name", "status",
      ]);
      const serializedProjection = JSON.stringify(aliasProjection);
      for (const privateValue of [newId, employeeId, "new@example.test", "employee@example.test"]) {
        expect(serializedProjection).not.toContain(privateValue);
      }
      expect((await db.query(
        `SELECT * FROM public.list_team_invitations_v2($1::uuid)`, [newId]
      )).rows).toHaveLength(0);
      expect((await db.query(
        `SELECT * FROM public.list_team_invitations($1::uuid)`, [employeeId]
      )).rows).toEqual(legacyBefore);
      expect((await db.query<{ definition: string }>(
        `SELECT pg_get_functiondef('public.list_team_invitations(uuid)'::regprocedure) AS definition`
      )).rows[0].definition).toBe(legacyDefinitionBefore);
      expect((await db.query<{ ok: boolean }>(
        `SELECT has_function_privilege('service_role','public.list_team_invitations_v2(uuid)','EXECUTE') AS ok`
      )).rows[0].ok).toBe(true);
      // The SQL PUBLIC pseudo-role is reflected through effective privileges
      // of ordinary roles; PostgreSQL does not accept it as a role name here.
      for (const role of ["anon", "authenticated"]) {
        expect((await db.query<{ ok: boolean }>(
          `SELECT has_function_privilege($1,'public.list_team_invitations_v2(uuid)','EXECUTE') AS ok`, [role]
        )).rows[0].ok).toBe(false);
      }
      const legacyRequestDefinition = (await db.query<{ definition: string }>(
        `SELECT pg_get_functiondef('public.list_team_space_requests(uuid)'::regprocedure) AS definition`
      )).rows[0].definition;
      await db.exec(migration(48));
      const requesterProjection = (await db.query<{id:string;space_id:string;space_name:string;role:string;can_respond:boolean;status:string;request_kind:string;metadata:Record<string,unknown>;created_at:string;responded_at:string|null}>(
        `SELECT * FROM public.list_team_space_requests_v2($1::uuid)`, [employeeId]
      )).rows;
      expect(requesterProjection).toHaveLength(1);
      expect(requesterProjection[0]).toMatchObject({ role: "requester", can_respond: false, status: "accepted" });
      const ownerProjection = (await db.query<{id:string;space_id:string;space_name:string;role:string;can_respond:boolean;status:string;request_kind:string;metadata:Record<string,unknown>;created_at:string;responded_at:string|null}>(
        `SELECT * FROM public.list_team_space_requests_v2($1::uuid)`, [newId]
      )).rows;
      expect(ownerProjection).toHaveLength(1);
      expect(ownerProjection[0]).toMatchObject({ role: "owner", can_respond: false, status: "accepted" });
      expect((await db.query(`SELECT * FROM public.list_team_space_requests_v2($1::uuid)`, [oldId])).rows).toHaveLength(0);
      const projectedRequests = JSON.stringify([...requesterProjection, ...ownerProjection]);
      for (const privateValue of [newId, employeeId, "new@example.test", "employee@example.test", "a".repeat(64)]) {
        expect(projectedRequests).not.toContain(privateValue);
      }
      expect(Object.keys(ownerProjection[0]).sort()).toEqual([
        "can_respond", "created_at", "id", "metadata", "request_kind", "responded_at", "role", "space_id", "space_name", "status",
      ]);
      expect((await db.query<{ definition: string }>(
        `SELECT pg_get_functiondef('public.list_team_space_requests(uuid)'::regprocedure) AS definition`
      )).rows[0].definition).toBe(legacyRequestDefinition);
      expect((await db.query<{ ok: boolean }>(
        `SELECT has_function_privilege('service_role','public.list_team_space_requests_v2(uuid)','EXECUTE') AS ok`
      )).rows[0].ok).toBe(true);
      for (const role of ["anon", "authenticated"]) expect((await db.query<{ ok: boolean }>(
        `SELECT has_function_privilege($1,'public.list_team_space_requests_v2(uuid)','EXECUTE') AS ok`, [role]
      )).rows[0].ok).toBe(false);

      // The latest ordered migration extends the chain with private checkout
      // preparation and leaves existing entitlement/roster state untouched.
      await db.exec(`INSERT INTO public.team_billing_subscriptions
        (stripe_subscription_id,user_id,stripe_customer_id,stripe_price_id,seat_count,status,
         current_period_start,current_period_end,latest_event_id,latest_event_created_at)
        VALUES ('sub-smaller-later','${newId}','cus-contract','price-team',1,'active',now()-interval '1 day',now()+interval '9 days','evt-later',now())`);
      await db.exec(migration(49));
      await db.exec(migration(50));
      const canonicalOwner = (await db.query<{seat_limit:number;expires_at:string|null}>(
        `SELECT seat_limit,expires_at FROM public.get_team_entitlement($1::uuid)`, [newId]
      )).rows[0];
      const canonicalEmployee = (await db.query<{seat_limit:number;expires_at:string|null}>(
        `SELECT seat_limit,expires_at FROM public.get_team_entitlement($1::uuid)`, [employeeId]
      )).rows[0];
      expect(canonicalOwner).toEqual({ seat_limit: 2, expires_at: null });
      expect(canonicalEmployee).toEqual({ seat_limit: 2, expires_at: null });
      const canonicalRoster = (await db.query<{snapshot:any}>(
        `SELECT public.list_team_paid_roster($1::uuid) AS snapshot`, [newId]
      )).rows[0].snapshot;
      expect(canonicalRoster.seat_limit).toBe(2);
      expect((await db.query(`SELECT * FROM public.team_checkout_intents`)).rows).toEqual([]);

      // 0051 depends on both the checkout-intent chain and the billing ledger.
      // Applying it must not perturb the metadata-only shared-space and
      // approval projections, trial entitlement, or paid-roster capacity that
      // were already established by earlier migrations.
      const beforeAtomicBilling = {
        ownerEntitlement: canonicalOwner,
        employeeEntitlement: canonicalEmployee,
        roster: canonicalRoster,
        invitations: aliasProjection,
        requesterRequests: requesterProjection,
        ownerRequests: ownerProjection,
      };
      await db.exec(migration(51));

      expect((await db.query<{seat_limit:number;expires_at:string|null}>(
        `SELECT seat_limit,expires_at FROM public.get_team_entitlement($1::uuid)`, [newId]
      )).rows[0]).toEqual(beforeAtomicBilling.ownerEntitlement);
      expect((await db.query<{seat_limit:number;expires_at:string|null}>(
        `SELECT seat_limit,expires_at FROM public.get_team_entitlement($1::uuid)`, [employeeId]
      )).rows[0]).toEqual(beforeAtomicBilling.employeeEntitlement);
      expect((await db.query<{snapshot:any}>(
        `SELECT public.list_team_paid_roster($1::uuid) AS snapshot`, [newId]
      )).rows[0].snapshot).toEqual(beforeAtomicBilling.roster);
      expect((await db.query(
        `SELECT * FROM public.list_team_invitations_v2($1::uuid)`, [employeeId]
      )).rows).toEqual(beforeAtomicBilling.invitations);
      expect((await db.query(
        `SELECT * FROM public.list_team_space_requests_v2($1::uuid)`, [employeeId]
      )).rows).toEqual(beforeAtomicBilling.requesterRequests);
      expect((await db.query(
        `SELECT * FROM public.list_team_space_requests_v2($1::uuid)`, [newId]
      )).rows).toEqual(beforeAtomicBilling.ownerRequests);
      expect((await db.query(`SELECT * FROM public.team_checkout_intents`)).rows).toEqual([]);

      expect((await db.query<{column_default:string|null}>(`
        SELECT column_default FROM information_schema.columns
        WHERE table_schema='public' AND table_name='team_checkout_intents' AND column_name='billing_sync_status'
      `)).rows[0].column_default).toContain("pending");
      for (const signature of [
        "public.mark_team_checkout_session_pending(uuid,text)",
        "public.release_team_checkout_expired_session(uuid,text)",
        "public.mark_team_checkout_async_failed(uuid,text)",
        "public.apply_team_checkout_billing_and_finalize(uuid,text,uuid,text,text,text,bigint,text,timestamptz,timestamptz,boolean,text,text,timestamptz,jsonb)",
      ]) {
        expect((await db.query<{ok:boolean}>(
          `SELECT has_function_privilege('authenticated',$1,'EXECUTE') AS ok`, [signature]
        )).rows[0].ok).toBe(false);
        expect((await db.query<{ok:boolean}>(
          `SELECT has_function_privilege('service_role',$1,'EXECUTE') AS ok`, [signature]
        )).rows[0].ok).toBe(true);
      }

      // 0052 has to preserve all earlier Team capabilities while replacing the
      // paid-roster mutation path with opaque invitations.  Exercise the
      // browser-safe projection against this real PGlite chain rather than
      // merely comparing a hand-written JSON fixture.
      getSupabaseAdmin.mockReturnValue({
        rpc: async (procedure: string, args: { p_owner_user_id?: string }) => {
          if (procedure !== "list_team_paid_roster" || typeof args.p_owner_user_id !== "string") {
            return { data: null, error: { message: "unexpected roster rpc" } };
          }
          const result = await db.query<{ snapshot: unknown }>(
            `SELECT public.list_team_paid_roster($1::uuid) AS snapshot`, [args.p_owner_user_id],
          );
          return { data: result.rows[0]?.snapshot ?? null, error: null };
        },
      });
      const beforeOpaqueInvitations = {
        ownerEntitlement: (await db.query<{seat_limit:number;expires_at:string|null}>(
          `SELECT seat_limit,expires_at FROM public.get_team_entitlement($1::uuid)`, [newId],
        )).rows[0],
        employeeEntitlement: (await db.query<{seat_limit:number;expires_at:string|null}>(
          `SELECT seat_limit,expires_at FROM public.get_team_entitlement($1::uuid)`, [employeeId],
        )).rows[0],
        trial: (await db.query<{user_id:string;starts_at:string;expires_at:string}>(
          `SELECT user_id,starts_at,expires_at FROM public.team_trial_entitlements ORDER BY user_id`,
        )).rows,
        invitations: (await db.query(
          `SELECT * FROM public.list_team_invitations_v2($1::uuid)`, [employeeId],
        )).rows,
        requesterRequests: (await db.query(
          `SELECT * FROM public.list_team_space_requests_v2($1::uuid)`, [employeeId],
        )).rows,
        ownerRequests: (await db.query(
          `SELECT * FROM public.list_team_space_requests_v2($1::uuid)`, [newId],
        )).rows,
        ownerRoster: await listPaidTeamRoster(newId),
      };
      const serializedOwnerRosterBefore = JSON.stringify(beforeOpaqueInvitations.ownerRoster);
      for (const privateValue of [newId, employeeId]) {
        expect(serializedOwnerRosterBefore).not.toContain(privateValue);
      }

      await db.exec(migration(52));

      expect((await db.query<{seat_limit:number;expires_at:string|null}>(
        `SELECT seat_limit,expires_at FROM public.get_team_entitlement($1::uuid)`, [newId],
      )).rows[0]).toEqual(beforeOpaqueInvitations.ownerEntitlement);
      expect((await db.query<{seat_limit:number;expires_at:string|null}>(
        `SELECT seat_limit,expires_at FROM public.get_team_entitlement($1::uuid)`, [employeeId],
      )).rows[0]).toEqual(beforeOpaqueInvitations.employeeEntitlement);
      expect((await db.query<{user_id:string;starts_at:string;expires_at:string}>(
        `SELECT user_id,starts_at,expires_at FROM public.team_trial_entitlements ORDER BY user_id`,
      )).rows).toEqual(beforeOpaqueInvitations.trial);
      expect((await db.query(
        `SELECT * FROM public.list_team_invitations_v2($1::uuid)`, [employeeId],
      )).rows).toEqual(beforeOpaqueInvitations.invitations);
      expect((await db.query(
        `SELECT * FROM public.list_team_space_requests_v2($1::uuid)`, [employeeId],
      )).rows).toEqual(beforeOpaqueInvitations.requesterRequests);
      expect((await db.query(
        `SELECT * FROM public.list_team_space_requests_v2($1::uuid)`, [newId],
      )).rows).toEqual(beforeOpaqueInvitations.ownerRequests);
      expect(await listPaidTeamRoster(newId)).toEqual(beforeOpaqueInvitations.ownerRoster);

      // 0053 is additive: it cannot replace the legacy request/projection
      // contracts just because its v3 thread model lifts the old one-request
      // cardinality. Apply it to the real chain and create an owner-initiated
      // metadata-only turn through an opaque accepted relationship handle.
      const legacyRequestV1BeforeConversation = (await db.query<{ definition: string }>(
        `SELECT pg_get_functiondef('public.list_team_space_requests(uuid)'::regprocedure) AS definition`,
      )).rows[0].definition;
      const legacyRequestV2BeforeConversation = (await db.query<{ definition: string }>(
        `SELECT pg_get_functiondef('public.list_team_space_requests_v2(uuid)'::regprocedure) AS definition`,
      )).rows[0].definition;
      await db.exec(migration(53));
      expect((await db.query<{ definition: string }>(
        `SELECT pg_get_functiondef('public.list_team_space_requests(uuid)'::regprocedure) AS definition`,
      )).rows[0].definition).toBe(legacyRequestV1BeforeConversation);
      expect((await db.query<{ definition: string }>(
        `SELECT pg_get_functiondef('public.list_team_space_requests_v2(uuid)'::regprocedure) AS definition`,
      )).rows[0].definition).toBe(legacyRequestV2BeforeConversation);
      const conversationTarget = (await db.query<{ relationship_id: string }>(
        `SELECT * FROM public.list_team_conversation_targets_v3($1::uuid,$2::uuid)`, [newId, space],
      )).rows[0];
      expect(conversationTarget.relationship_id).toBeTruthy();
      const conversationTurn = (await db.query<{
        thread_id: string; id: string; status: string; direction: string; can_respond: boolean;
      }>(`
        SELECT * FROM public.create_team_space_conversation_turn_v3(
          $1::uuid,$2::uuid,$3::uuid,'context',$4::text,$5::jsonb,$6::uuid
        )
      `, [
        newId, space, conversationTarget.relationship_id, "c".repeat(64),
        JSON.stringify({ label: "follow-up context", itemCount: 1 }),
        "00000000-0000-4000-8000-000000000053",
      ])).rows[0];
      expect(conversationTurn).toMatchObject({ status: "pending", direction: "outbound", can_respond: false });
      const recipientTurns = (await db.query<{
        id: string; direction: string; can_respond: boolean; metadata: Record<string, unknown>;
      }>(`
        SELECT * FROM public.list_team_conversation_turns_v3($1::uuid,$2::uuid,50,NULL,NULL)
      `, [employeeId, conversationTurn.thread_id])).rows;
      expect(recipientTurns).toHaveLength(1);
      expect(recipientTurns[0]).toMatchObject({
        id: conversationTurn.id, direction: "inbound", can_respond: true,
        metadata: { label: "follow-up context", itemCount: 1 },
      });

      // 0054 is forward-only: it preserves the old row's count but removes
      // its free-form metadata before every v3 browser projection.
      await db.exec(migration(54));
      const hardenedRecipientTurns = (await db.query<{
        id: string; direction: string; can_respond: boolean; metadata: Record<string, unknown>;
      }>(`
        SELECT * FROM public.list_team_conversation_turns_v3($1::uuid,$2::uuid,50,NULL,NULL)
      `, [employeeId, conversationTurn.thread_id])).rows;
      expect(hardenedRecipientTurns).toHaveLength(1);
      expect(hardenedRecipientTurns[0]).toMatchObject({
        id: conversationTurn.id, direction: "inbound", can_respond: true,
        metadata: { itemCount: 1 },
      });
      for (const [metadata, operationId] of [
        [{ label: "https://private.example/document" }, "00000000-0000-4000-8000-000000000054"],
        [{ category: "/Users/private/document.pdf" }, "00000000-0000-4000-8000-000000000055"],
        [{ url: "https://private.example/document" }, "00000000-0000-4000-8000-000000000056"],
        [{ path: "C:\\private\\document.pdf" }, "00000000-0000-4000-8000-000000000057"],
        [{ content: "private context" }, "00000000-0000-4000-8000-000000000058"],
      ] as const) {
        await expect(db.query(`
          SELECT * FROM public.create_team_conversation_turn_v3(
            $1::uuid,$2::uuid,'context',$3::text,$4::jsonb,$5::uuid
          )
        `, [
          newId, conversationTurn.thread_id, "d".repeat(64), JSON.stringify(metadata), operationId,
        ])).rejects.toThrow(/invalid conversation turn metadata/);
      }
      await expect(db.query(`
        INSERT INTO public.team_space_conversation_turns(
          thread_id,initiator_user_id,recipient_user_id,client_operation_id,request_kind,manifest_hash,metadata
        ) VALUES ($1::uuid,$2::uuid,$3::uuid,$4::uuid,'context',$5::text,$6::jsonb)
      `, [
        conversationTurn.thread_id, newId, employeeId,
        "00000000-0000-4000-8000-000000000059", "e".repeat(64),
        JSON.stringify({ content: "direct insert must fail too" }),
      ])).rejects.toThrow(/team_space_conversation_turns_metadata_safe_v3/);
      const countOnlyTurn = (await db.query<{ metadata: Record<string, unknown> }>(`
        SELECT * FROM public.create_team_conversation_turn_v3(
          $1::uuid,$2::uuid,'context',$3::text,$4::jsonb,$5::uuid
        )
      `, [
        newId, conversationTurn.thread_id, "f".repeat(64), JSON.stringify({ itemCount: 2 }),
        "00000000-0000-4000-8000-000000000060",
      ])).rows[0];
      expect(countOnlyTurn.metadata).toEqual({ itemCount: 2 });
      expect((await db.query<{ ok: boolean }>(
        `SELECT has_function_privilege('authenticated','public._team_is_safe_conversation_metadata_v3(jsonb)','EXECUTE') AS ok`,
      )).rows[0].ok).toBe(false);

      // 0055 normalizes the existing shared-space name as well as the older
      // one-request approval surface. Simulate a pre-hardening legacy value
      // on a space that already has a v3 conversation thread so the final
      // migration proves it cannot strand that active conversation.
      await db.query(`
        UPDATE public.team_shared_spaces
        SET name='https://private.example/contract'
        WHERE id=$1::uuid
      `, [space]);
      await db.exec(migration(55));
      expect((await db.query<{ metadata: Record<string, unknown> }>(
        `SELECT metadata FROM public.team_space_requests WHERE id=$1::uuid`, [request.id],
      )).rows[0].metadata).toEqual({ itemCount: 1 });
      expect((await db.query<{ metadata: Record<string, unknown> }>(
        `SELECT metadata FROM public.list_team_space_requests_v2($1::uuid) WHERE id=$2::uuid`, [newId, request.id],
      )).rows[0].metadata).toEqual({ itemCount: 1 });
      await expect(db.query(`
        INSERT INTO public.team_space_requests(
          space_id,requester_user_id,status,manifest_hash,request_kind,metadata
        ) VALUES ($1::uuid,$2::uuid,'pending',$3::text,'document',$4::jsonb)
      `, [space, oldId, "f".repeat(64), JSON.stringify({ content: "direct legacy write" })])).rejects.toThrow(/team_space_requests_metadata_safe_v3/);
      await expect(db.query(`
        SELECT * FROM public.register_team_space($1::uuid,'Espacio de Álex','private description',NULL)
      `, [newId])).rejects.toThrow(/invalid metadata/);
      expect((await db.query<{ name: string }>(`
        SELECT * FROM public.register_team_space($1::uuid,'Espacio de Álex',NULL,NULL)
      `, [newId])).rows[0].name).toBe("Espacio de Álex");
      expect((await db.query<{ ok: boolean }>(
        `SELECT has_function_privilege('authenticated','public._team_is_safe_legacy_request_metadata_v3(jsonb)','EXECUTE') AS ok`,
      )).rows[0].ok).toBe(false);

      // 0056 must apply to the actual ordered 0037-0055 schema, not merely a
      // hand-written fixture. Deliver accepted text in both directions, then
      // prove revocation and expiry close the same private delivery surface.
      await db.exec(migration(56));
      for (const role of ["anon", "authenticated", "service_role"]) {
        expect((await db.query<{ ok: boolean }>(`
          SELECT NOT has_table_privilege($1,'team_delivery_private.text_deliveries','SELECT')
             AND NOT has_table_privilege($1,'team_delivery_private.text_delivery_events','SELECT') AS ok
        `, [role])).rows[0].ok).toBe(true);
      }
      expect((await db.query<{ ok: boolean }>(`
        SELECT has_function_privilege('service_role','public.create_team_text_delivery_v1(uuid,uuid,uuid,uuid,text,text)','EXECUTE')
           AND NOT has_function_privilege('authenticated','public.create_team_text_delivery_v1(uuid,uuid,uuid,uuid,text,text)','EXECUTE') AS ok
      `)).rows[0].ok).toBe(true);

      const acceptedOwnerTurnId = conversationTurn.id;
      expect((await db.query<{ status: string }>(`
        SELECT status FROM public.respond_team_conversation_turn_v3(
          $1::uuid,$2::uuid,'accepted',$3::uuid
        )
      `, [employeeId, acceptedOwnerTurnId, "00000000-0000-4000-8000-000000000056"])).rows[0].status).toBe("accepted");
      const ownerTurnDelivery = (await db.query<{ id: string; recipient_user_id: string }>(`
        SELECT * FROM public.create_team_text_delivery_v1(
          $1::uuid,$2::uuid,$3::uuid,$4::uuid,$5::text,$6::text
        )
      `, [employeeId, conversationTurn.thread_id, acceptedOwnerTurnId,
        "00000000-0000-4000-8000-000000000061", "Reply from the invited member", "1".repeat(64)])).rows[0];
      expect(ownerTurnDelivery.recipient_user_id).toBe(newId);
      expect((await db.query<{ content: string }>(
        `SELECT content FROM public.read_team_text_delivery_v1($1::uuid,$2::uuid)`, [newId, ownerTurnDelivery.id],
      )).rows).toEqual([{ content: "Reply from the invited member" }]);

      const memberTurn = (await db.query<{ id: string; status: string }>(`
        SELECT id,status FROM public.create_team_conversation_turn_v3(
          $1::uuid,$2::uuid,'context',$3::text,$4::jsonb,$5::uuid
        )
      `, [employeeId, conversationTurn.thread_id, "2".repeat(64), JSON.stringify({ itemCount: 1 }),
        "00000000-0000-4000-8000-000000000062"])).rows[0];
      expect(memberTurn.status).toBe("pending");
      expect((await db.query<{ status: string }>(`
        SELECT status FROM public.respond_team_conversation_turn_v3(
          $1::uuid,$2::uuid,'accepted',$3::uuid
        )
      `, [newId, memberTurn.id, "00000000-0000-4000-8000-000000000063"])).rows[0].status).toBe("accepted");
      const memberTurnDelivery = (await db.query<{ id: string; recipient_user_id: string }>(`
        SELECT * FROM public.create_team_text_delivery_v1(
          $1::uuid,$2::uuid,$3::uuid,$4::uuid,$5::text,$6::text
        )
      `, [newId, conversationTurn.thread_id, memberTurn.id,
        "00000000-0000-4000-8000-000000000064", "Reply from the owner", "3".repeat(64)])).rows[0];
      expect(memberTurnDelivery.recipient_user_id).toBe(employeeId);
      expect((await db.query<{ content: string }>(
        `SELECT content FROM public.read_team_text_delivery_v1($1::uuid,$2::uuid)`, [employeeId, memberTurnDelivery.id],
      )).rows).toEqual([{ content: "Reply from the owner" }]);

      // 0057 must also compose with the real full chain. Exercise the billing
      // RPC at the inclusive 64-seat boundary and prove 65 rolls back its
      // processed-event row instead of leaving partial durable state.
      await db.exec(readFileSync(join(process.cwd(), "supabase/migrations", timestampedTeamMigrationFile), "utf8"));
      const applyBilling = (seats: number, suffix: string) => db.query<{ result: string }>(`
        SELECT public.apply_team_stripe_subscription_event(
          $1::uuid,$2::text,$3::text,$4::text,$5::bigint,'active',NULL,NULL,false,
          $6::text,'customer.subscription.updated',pg_catalog.now(),'{}'::jsonb
        ) AS result
      `, [newId, `cus-seat-${suffix}`, `sub-seat-${suffix}`, "price-team", seats, `evt-seat-${suffix}`]);
      expect((await applyBilling(64, "64")).rows[0].result).toBe("applied");
      await expect(applyBilling(65, "65")).rejects.toThrow(/team_billing_subscriptions_seat_count_64_check/);
      expect((await db.query<{ count: number }>(`
        SELECT count(*)::int AS count FROM public.team_billing_processed_events WHERE stripe_event_id='evt-seat-65'
      `)).rows[0].count).toBe(0);

      await db.query(`UPDATE public.team_space_invitations SET status='revoked' WHERE id=$1::uuid`, [conversationTarget.relationship_id]);
      expect((await db.query(`SELECT * FROM public.read_team_text_delivery_v1($1::uuid,$2::uuid)`,
        [employeeId, memberTurnDelivery.id])).rows).toHaveLength(0);
      expect((await db.query(`SELECT * FROM public.list_team_text_deliveries_v1($1::uuid,$2::uuid,50,NULL,NULL)`,
        [employeeId, conversationTurn.thread_id])).rows).toHaveLength(0);
      await db.query(`UPDATE public.team_space_invitations SET status='accepted' WHERE id=$1::uuid`, [conversationTarget.relationship_id]);
      await db.query(`UPDATE team_delivery_private.text_deliveries SET expires_at=now()-interval '1 second' WHERE id=$1::uuid`,
        [ownerTurnDelivery.id]);
      expect((await db.query(`SELECT * FROM public.read_team_text_delivery_v1($1::uuid,$2::uuid)`,
        [newId, ownerTurnDelivery.id])).rows).toHaveLength(0);
      expect((await db.query<{ content: string | null; content_sha256: string | null; deleted_at: string | null }>(`
        SELECT content,content_sha256,deleted_at FROM team_delivery_private.text_deliveries WHERE id=$1::uuid
      `, [ownerTurnDelivery.id])).rows[0]).toMatchObject({ content: null, content_sha256: null });

      // The final hardening must preserve the active v3 conversation's
      // visibility while replacing the old unsafe display value. Targets and
      // threads both project the same legacy name, so a valid existing
      // relationship must remain reachable through either v3 entry point.
      const targetsAfterLegacyHardening = (await db.query<{
        relationship_id: string; space_id: string; space_name: string;
      }>(`
        SELECT * FROM public.list_team_conversation_targets_v3($1::uuid,$2::uuid)
      `, [newId, space])).rows;
      expect(targetsAfterLegacyHardening).toHaveLength(1);
      expect(targetsAfterLegacyHardening[0]).toMatchObject({
        relationship_id: conversationTarget.relationship_id,
        space_id: space,
        space_name: "Espacio compartido",
      });
      expect(JSON.stringify(targetsAfterLegacyHardening)).not.toContain("https://private.example/contract");
      const threadsAfterLegacyHardening = (await db.query<{
        thread_id: string; space_id: string; space_name: string;
      }>(`
        SELECT * FROM public.list_team_conversation_threads_v3($1::uuid,50,NULL,NULL)
      `, [employeeId])).rows;
      expect(threadsAfterLegacyHardening).toHaveLength(1);
      expect(threadsAfterLegacyHardening[0]).toMatchObject({
        thread_id: conversationTurn.thread_id,
        space_id: space,
        space_name: "Espacio compartido",
      });
      expect(JSON.stringify(threadsAfterLegacyHardening)).not.toContain("https://private.example/contract");
      const turnsAfterLegacyHardening = (await db.query<{
        id: string; metadata: Record<string, unknown>;
      }>(`
        SELECT * FROM public.list_team_conversation_turns_v3($1::uuid,$2::uuid,50,NULL,NULL)
      `, [employeeId, conversationTurn.thread_id])).rows;
      expect(turnsAfterLegacyHardening).toEqual(expect.arrayContaining([
        expect.objectContaining({ id: conversationTurn.id, metadata: { itemCount: 1 } }),
      ]));

      // A new opaque invitation can reserve and consume a seat without
      // exposing either the member UUID or the raw capability in the owner
      // projection, and legacy direct UUID assignment stays fail-closed.
      const opaqueOwnerId = "00000000-0000-0000-0000-000000000052";
      const opaqueEmployeeId = "00000000-0000-0000-0000-000000000053";
      const opaqueTokenHash = "b".repeat(64);
      await db.exec(`INSERT INTO auth.users(id,email) VALUES
        ('${opaqueOwnerId}','opaque-owner@example.test'),
        ('${opaqueEmployeeId}','opaque-employee@example.test');
        INSERT INTO public.team_billing_subscriptions
          (stripe_subscription_id,user_id,stripe_customer_id,stripe_price_id,seat_count,status,
           latest_event_id,latest_event_created_at)
        VALUES ('sub-opaque','${opaqueOwnerId}','cus-opaque','price-team',2,'active','evt-opaque',now());`);
      expect((await db.query<{expires_at:string}>(
        `SELECT * FROM public.create_team_paid_roster_invitation($1::uuid,$2)`, [opaqueOwnerId, opaqueTokenHash],
      )).rows[0].expires_at).toBeTruthy();
      const reservedOwnerRoster = await listPaidTeamRoster(opaqueOwnerId);
      expect(reservedOwnerRoster).toMatchObject({
        has_active_team: true, seat_limit: 2, assigned_count: 0, occupied_seats: 2, available_slots: 0, roster: [],
      });
      expect(JSON.stringify(reservedOwnerRoster)).not.toContain(opaqueTokenHash);
      expect(JSON.stringify(reservedOwnerRoster)).not.toContain(opaqueOwnerId);
      expect(JSON.stringify(reservedOwnerRoster)).not.toContain(opaqueEmployeeId);
      expect((await db.query<{result:string}>(
        `SELECT * FROM public.accept_team_paid_roster_invitation($1::uuid,$2)`, [opaqueEmployeeId, opaqueTokenHash],
      )).rows[0].result).toBe("accepted");
      const acceptedOwnerRoster = await listPaidTeamRoster(opaqueOwnerId);
      expect(acceptedOwnerRoster.roster).toHaveLength(1);
      expect(acceptedOwnerRoster.roster[0]).toMatchObject({ member_number: 1, eligible: true });
      for (const privateValue of [opaqueOwnerId, opaqueEmployeeId, opaqueTokenHash]) {
        expect(JSON.stringify(acceptedOwnerRoster)).not.toContain(privateValue);
      }
      await expect(db.query(
        `SELECT public.assign_team_paid_employee($1::uuid,$2::uuid)`, [opaqueOwnerId, employeeId],
      )).rejects.toThrow(/direct Team roster assignment is disabled/);
    } finally { await db.close(); }
  }, 30_000);
});
