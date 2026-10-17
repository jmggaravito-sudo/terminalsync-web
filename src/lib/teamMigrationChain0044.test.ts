import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { citext } from "@electric-sql/pglite/contrib/citext";

const migration = (n: number) => readFileSync(join(process.cwd(), `supabase/migrations/${String(n).padStart(4, "0")}_${({37:"team_comp_entitlements",38:"team_stripe_billing",39:"team_shared_spaces_metadata",40:"team_universal_trial",41:"team_entitlement_and_alias_reconciliation",42:"team_metadata_invites",43:"team_metadata_requests",44:"team_trial_on_signup",45:"team_paid_roster",46:"team_paid_roster_api",47:"team_invitation_owner_alias_projection",48:"team_request_participant_projection",49:"team_checkout_intents"} as Record<number,string>)[n]}.sql`), "utf8");

describe("Team migrations 0037-0049 contract", () => {
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
    } finally { await db.close(); }
  }, 30_000);
});
