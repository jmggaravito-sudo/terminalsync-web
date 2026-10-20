import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";

const deliveryMigration = readFileSync(join(process.cwd(), "supabase/migrations/0056_team_text_deliveries.sql"), "utf8");
const hardeningMigration = readFileSync(join(process.cwd(), "supabase/migrations/0058_team_owner_approved_text_delivery.sql"), "utf8");

const owner = "00000000-0000-4000-8000-000000000101";
const member = "00000000-0000-4000-8000-000000000102";
const outsider = "00000000-0000-4000-8000-000000000103";
const space = "00000000-0000-4000-8000-000000000104";
const relationship = "00000000-0000-4000-8000-000000000105";
const thread = "00000000-0000-4000-8000-000000000106";
const turn = "00000000-0000-4000-8000-000000000107";
const operation = "00000000-0000-4000-8000-000000000108";
const roleExecutionOperation = "00000000-0000-4000-8000-000000000109";
const digest = "a".repeat(64);
const databases: PGlite[] = [];

type ApiRole = "anon" | "authenticated" | "service_role";

type PublicWrapperCall = {
  name: string;
  sql: string;
  params: unknown[];
};

// These are the API-visible Team wrappers after 0058. The private authorizer
// and projector deliberately remain uncallable, including by service_role.
const publicWrapperCalls: PublicWrapperCall[] = [
  {
    name: "create_team_space_conversation_turn_v4",
    sql: "SELECT * FROM public.create_team_space_conversation_turn_v4($1,$2,$3,'context','manifest','{}'::jsonb,$4)",
    params: [owner, space, relationship, roleExecutionOperation],
  },
  {
    name: "create_team_conversation_turn_v4",
    sql: "SELECT * FROM public.create_team_conversation_turn_v4($1,$2,'context','manifest','{}'::jsonb,$3)",
    params: [owner, thread, roleExecutionOperation],
  },
  {
    name: "respond_team_conversation_turn_v4",
    sql: "SELECT * FROM public.respond_team_conversation_turn_v4($1,$2,'accept',$3)",
    params: [owner, turn, roleExecutionOperation],
  },
  {
    name: "list_team_conversation_turns_v4",
    sql: "SELECT * FROM public.list_team_conversation_turns_v4($1,$2,50,NULL,NULL)",
    params: [owner, thread],
  },
  {
    name: "create_team_text_delivery_v1",
    sql: "SELECT * FROM public.create_team_text_delivery_v1($1,$2,$3,$4,$5,$6)",
    params: [owner, thread, turn, roleExecutionOperation, "service role execution", "b".repeat(64)],
  },
  {
    name: "read_team_text_delivery_v1",
    sql: "SELECT * FROM public.read_team_text_delivery_v1($1,$2)",
    params: [member, "00000000-0000-4000-8000-000000000110"],
  },
  {
    name: "list_team_text_deliveries_v1",
    sql: "SELECT * FROM public.list_team_text_deliveries_v1($1,$2,50,NULL,NULL)",
    params: [member, thread],
  },
  {
    name: "purge_expired_team_text_deliveries",
    sql: "SELECT public.purge_expired_team_text_deliveries(1)",
    params: [],
  },
];

async function asApiRole<T>(db: PGlite, role: ApiRole, run: () => Promise<T>): Promise<T> {
  // Roles are created by the fixture itself and this executes the real SQL
  // permission checks rather than only inspecting catalog privileges.
  await db.exec(`SET ROLE ${role}`);
  try {
    return await run();
  } finally {
    await db.exec("RESET ROLE");
  }
}

async function fixture({ legacyReverseDelivery = false }: { legacyReverseDelivery?: boolean } = {}) {
  const db = new PGlite();
  databases.push(db);
  await db.exec(`
    CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
    CREATE SCHEMA auth;
    CREATE TABLE auth.users(id uuid PRIMARY KEY);
    INSERT INTO auth.users VALUES ('${owner}'),('${member}'),('${outsider}');
    CREATE TABLE public.elig(user_id uuid PRIMARY KEY, eligible boolean NOT NULL);
    INSERT INTO public.elig VALUES ('${owner}',true),('${member}',true),('${outsider}',true);
    CREATE FUNCTION public.get_team_entitlement(p_user_id uuid)
      RETURNS TABLE(eligible boolean) LANGUAGE sql STABLE AS $$
      SELECT eligible FROM public.elig WHERE user_id=p_user_id
    $$;
    CREATE TABLE public.team_shared_spaces(
      id uuid PRIMARY KEY, owner_user_id uuid NOT NULL REFERENCES auth.users(id), name text NOT NULL
    );
    CREATE TABLE public.team_space_invitations(
      id uuid PRIMARY KEY, space_id uuid NOT NULL REFERENCES public.team_shared_spaces(id),
      inviter_user_id uuid NOT NULL REFERENCES auth.users(id),
      invitee_user_id uuid NOT NULL REFERENCES auth.users(id), status text NOT NULL
    );
    CREATE TABLE public.team_space_conversation_threads(
      id uuid PRIMARY KEY, space_id uuid NOT NULL REFERENCES public.team_shared_spaces(id),
      participant_user_id uuid NOT NULL REFERENCES auth.users(id),
      relationship_id uuid NOT NULL REFERENCES public.team_space_invitations(id)
    );
    CREATE TABLE public.team_space_conversation_turns(
      id uuid PRIMARY KEY, thread_id uuid NOT NULL REFERENCES public.team_space_conversation_threads(id),
      initiator_user_id uuid NOT NULL REFERENCES auth.users(id),
      recipient_user_id uuid NOT NULL REFERENCES auth.users(id),
      status text NOT NULL, request_kind text NOT NULL DEFAULT 'context', metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
      created_at timestamptz NOT NULL DEFAULT now(), responded_at timestamptz
    );
    INSERT INTO public.team_shared_spaces VALUES ('${space}','${owner}','Proyecto');
    INSERT INTO public.team_space_invitations VALUES ('${relationship}','${space}','${owner}','${member}','accepted');
    INSERT INTO public.team_space_conversation_threads VALUES ('${thread}','${space}','${member}','${relationship}');
    -- The member requested a response from the owner. Only the owner is the
    -- source-space owner and approved recipient of this accepted turn.
    INSERT INTO public.team_space_conversation_turns(id,thread_id,initiator_user_id,recipient_user_id,status,responded_at)
      VALUES ('${turn}','${thread}','${member}','${owner}','accepted',now());

    -- The forward-only v4 wrappers delegate to v3. These minimal signatures
    -- make migration parse/definition validation exercise the real SQL while
    -- direct projector calls below isolate the new source-owner contract.
    CREATE FUNCTION public.create_team_space_conversation_turn_v3(uuid,uuid,uuid,text,text,jsonb,uuid)
      RETURNS TABLE(thread_id uuid,id uuid,status text,request_kind text,metadata jsonb,created_at timestamptz,responded_at timestamptz,direction text,can_respond boolean)
      LANGUAGE sql AS $$ SELECT NULL::uuid,NULL::uuid,NULL::text,NULL::text,NULL::jsonb,NULL::timestamptz,NULL::timestamptz,NULL::text,NULL::boolean WHERE false $$;
    CREATE FUNCTION public.create_team_conversation_turn_v3(uuid,uuid,text,text,jsonb,uuid)
      RETURNS TABLE(thread_id uuid,id uuid,status text,request_kind text,metadata jsonb,created_at timestamptz,responded_at timestamptz,direction text,can_respond boolean)
      LANGUAGE sql AS $$ SELECT NULL::uuid,NULL::uuid,NULL::text,NULL::text,NULL::jsonb,NULL::timestamptz,NULL::timestamptz,NULL::text,NULL::boolean WHERE false $$;
    CREATE FUNCTION public.respond_team_conversation_turn_v3(uuid,uuid,text,uuid)
      RETURNS TABLE(thread_id uuid,id uuid,status text,request_kind text,metadata jsonb,created_at timestamptz,responded_at timestamptz,direction text,can_respond boolean)
      LANGUAGE sql AS $$ SELECT NULL::uuid,NULL::uuid,NULL::text,NULL::text,NULL::jsonb,NULL::timestamptz,NULL::timestamptz,NULL::text,NULL::boolean WHERE false $$;
    CREATE FUNCTION public.list_team_conversation_turns_v3(p_user_id uuid,p_thread_id uuid,p_limit integer,p_before_created_at timestamptz,p_before_turn_id uuid)
      RETURNS TABLE(thread_id uuid,id uuid,status text,request_kind text,metadata jsonb,created_at timestamptz,responded_at timestamptz,direction text,can_respond boolean)
      LANGUAGE sql AS $$
        SELECT t.thread_id,t.id,t.status,t.request_kind,t.metadata,t.created_at,t.responded_at,
          CASE WHEN t.initiator_user_id=p_user_id THEN 'outbound'::text ELSE 'inbound'::text END,
          (t.recipient_user_id=p_user_id AND t.status='pending')
        FROM public.team_space_conversation_turns t
        WHERE t.thread_id=p_thread_id
      $$;
  `);
  await db.exec(deliveryMigration);
  let legacyReverseDeliveryId: string | undefined;
  if (legacyReverseDelivery) {
    // Prove the hardening is forward-only at the application boundary: this
    // fixture creates the old, now-forbidden reverse row before v4 exists.
    await db.query(
      `UPDATE public.team_space_conversation_turns SET initiator_user_id=$1,recipient_user_id=$2 WHERE id=$3`,
      [owner, member, turn],
    );
    legacyReverseDeliveryId = (await db.query<{ id: string }>(
      `SELECT * FROM public.create_team_text_delivery_v1($1,$2,$3,$4,$5,$6)`,
      [member, thread, turn, operation, "legacy reverse plaintext", digest],
    )).rows[0].id;
  }
  await db.exec(hardeningMigration);
  return { db, legacyReverseDeliveryId };
}

afterEach(async () => {
  await Promise.all(databases.splice(0).map((db) => db.close()));
});

function send(db: PGlite, sender: string, content = "Reviewed answer") {
  return db.query<{ id: string; recipient_user_id: string }>(
    `SELECT * FROM public.create_team_text_delivery_v1($1,$2,$3,$4,$5,$6)`,
    [sender, thread, turn, operation, content, digest],
  );
}

describe("Team source-owner-approved text delivery v4", () => {
  it("requires the owner of the exact source space to have accepted the member-originated turn", async () => {
    const { db } = await fixture();

    expect((await send(db, member, "member must not deliver from owner's source")).rows).toEqual([]);
    expect((await send(db, outsider, "outsider must not deliver")).rows).toEqual([]);

    const receipt = (await send(db, owner)).rows[0];
    expect(receipt.recipient_user_id).toBe(member);
    expect((await db.query(`SELECT * FROM public.list_team_text_deliveries_v1($1,$2,50,NULL,NULL)`, [owner, thread])).rows).toEqual([]);
    expect((await db.query(`SELECT id FROM public.list_team_text_deliveries_v1($1,$2,50,NULL,NULL)`, [member, thread])).rows)
      .toEqual([{ id: receipt.id }]);
  }, 15_000);

  it("does not let a member turn the owner's relationship into a reverse plaintext channel", async () => {
    const { db } = await fixture();
    await db.query(
      `UPDATE public.team_space_conversation_turns SET initiator_user_id=$1,recipient_user_id=$2 WHERE id=$3`,
      [owner, member, turn],
    );

    // This was the v0056 gap: the accepted recipient/member could deliver back
    // to the owner using the owner's source relationship. V4 must fail closed.
    expect((await send(db, member, "member reverse payload")).rows).toEqual([]);
    // The owner also cannot use a turn they did not approve; a two-way reply
    // must be initiated through the other participant's own source space.
    expect((await send(db, owner, "owner cannot bypass approval")).rows).toEqual([]);
    expect((await db.query(`SELECT count(*)::int AS count FROM team_delivery_private.text_deliveries`)).rows)
      .toEqual([{ count: 0 }]);
  }, 15_000);

  it("projects the browser delivery affordance only to the owner approver, never to the other participant", async () => {
    const { db } = await fixture();
    const ownerProjection = (await db.query<{ direction: string; can_deliver: boolean }>(
      `SELECT direction,can_deliver FROM public._team_project_conversation_turn_v4($1,$2,$3)`, [owner, thread, turn],
    )).rows[0];
    // Exercise the public v4 list wrapper too: routes receive this exact
    // projection and cannot infer ownership from a browser-supplied actor.
    expect((await db.query(
      `SELECT direction,can_deliver FROM public.list_team_conversation_turns_v4($1,$2,50,NULL,NULL)`, [owner, thread],
    )).rows).toEqual([{ direction: "inbound", can_deliver: true }]);
    const memberProjection = (await db.query<{ direction: string; can_deliver: boolean }>(
      `SELECT direction,can_deliver FROM public._team_project_conversation_turn_v4($1,$2,$3)`, [member, thread, turn],
    )).rows[0];
    expect(ownerProjection).toEqual({ direction: "inbound", can_deliver: true });
    expect(memberProjection).toEqual({ direction: "outbound", can_deliver: false });

    await db.query(
      `UPDATE public.team_space_conversation_turns SET initiator_user_id=$1,recipient_user_id=$2 WHERE id=$3`,
      [owner, member, turn],
    );
    expect((await db.query(
      `SELECT direction,can_deliver FROM public._team_project_conversation_turn_v4($1,$2,$3)`, [member, thread, turn],
    )).rows).toEqual([{ direction: "inbound", can_deliver: false }]);
    expect((await db.query(
      `SELECT direction,can_deliver FROM public._team_project_conversation_turn_v4($1,$2,$3)`, [owner, thread, turn],
    )).rows).toEqual([{ direction: "outbound", can_deliver: false }]);
  }, 15_000);

  it("leaves pre-hardening reverse plaintext untouched but denies list/read by default", async () => {
    const { db, legacyReverseDeliveryId } = await fixture({ legacyReverseDelivery: true });
    expect(legacyReverseDeliveryId).toBeTruthy();
    // No retention repair runs in this forward-only migration: data stays
    // physically intact, but no public read/list path can expose it.
    expect((await db.query(
      `SELECT content,deleted_at FROM team_delivery_private.text_deliveries WHERE id=$1`, [legacyReverseDeliveryId],
    )).rows).toEqual([{ content: "legacy reverse plaintext", deleted_at: null }]);
    expect((await db.query(
      `SELECT * FROM public.list_team_text_deliveries_v1($1,$2,50,NULL,NULL)`, [owner, thread],
    )).rows).toEqual([]);
    expect((await db.query(
      `SELECT * FROM public.read_team_text_delivery_v1($1,$2)`, [owner, legacyReverseDeliveryId],
    )).rows).toEqual([]);
    expect((await db.query(
      `SELECT * FROM public.list_team_text_deliveries_v1($1,$2,50,NULL,NULL)`, [member, thread],
    )).rows).toEqual([]);
  }, 15_000);

  it("executes every public delivery/v4 wrapper as service_role and denies anon/authenticated at execution time", async () => {
    const { db } = await fixture();

    // Catalog checks alone would not catch a future PUBLIC grant, an inherited
    // role membership, or a SECURITY DEFINER wrapper that is callable despite
    // a stale revoke. Exercise each current API-facing wrapper as the actual
    // Postgres roles created by the fixture.
    for (const call of publicWrapperCalls) {
      await expect(asApiRole(db, "service_role", () => db.query(call.sql, call.params))).resolves.toBeDefined();
    }

    for (const role of ["anon", "authenticated"] as const) {
      for (const call of publicWrapperCalls) {
        await expect(asApiRole(db, role, () => db.query(call.sql, call.params)))
          .rejects.toThrow(/permission denied/i);
      }
    }

    // The exposed wrappers compose with the non-public primitives, but no API
    // role may invoke the primitives directly.
    for (const role of ["anon", "authenticated", "service_role"] as const) {
      await expect(asApiRole(db, role, () => db.query(
        "SELECT * FROM public._team_project_conversation_turn_v4($1,$2,$3)",
        [owner, thread, turn],
      ))).rejects.toThrow(/permission denied/i);
      await expect(asApiRole(db, role, () => db.query(
        "SELECT team_delivery_private.owner_approved_text_delivery_v2($1,$2,$3)",
        [owner, thread, turn],
      ))).rejects.toThrow(/permission denied/i);
    }
  }, 15_000);

  it("keeps delivery text-only and grants only service-role access to the public writer/v4 RPCs", async () => {
    const { db } = await fixture();
    expect((await db.query<{ ok: boolean }>(`
      SELECT NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='team_delivery_private' AND table_name='text_deliveries'
          AND (data_type='bytea' OR column_name ~* '(file|artifact|attachment|url|path|mime|provider)')
      )
      AND NOT has_table_privilege('service_role','team_delivery_private.text_deliveries','SELECT')
      AND has_function_privilege('service_role','public.create_team_text_delivery_v1(uuid,uuid,uuid,uuid,text,text)','EXECUTE')
      AND has_function_privilege('service_role','public.list_team_conversation_turns_v4(uuid,uuid,integer,timestamp with time zone,uuid)','EXECUTE')
      AND NOT has_function_privilege('authenticated','public.create_team_text_delivery_v1(uuid,uuid,uuid,uuid,text,text)','EXECUTE')
      AND NOT has_function_privilege('authenticated','public.list_team_conversation_turns_v4(uuid,uuid,integer,timestamp with time zone,uuid)','EXECUTE')
      AS ok
    `)).rows[0].ok).toBe(true);
  }, 15_000);
});
