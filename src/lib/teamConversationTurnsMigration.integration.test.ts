import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";

const migration = readFileSync(
  join(process.cwd(), "supabase/migrations/0053_team_conversation_turns.sql"),
  "utf8",
);

const owner = "00000000-0000-0000-0000-000000000001";
const member = "00000000-0000-0000-0000-000000000002";
const memberTwo = "00000000-0000-0000-0000-000000000003";
const outsider = "00000000-0000-0000-0000-000000000004";
const disabled = "00000000-0000-0000-0000-000000000005";
const hash = (letter: string) => letter.repeat(64);
const operation = (tail: string) => `10000000-0000-4000-8000-${tail}`;

type Turn = {
  thread_id: string;
  id: string;
  status: "pending" | "accepted" | "declined";
  request_kind: "document" | "context";
  metadata: Record<string, unknown>;
  created_at: string;
  responded_at: string | null;
  direction: "inbound" | "outbound";
  can_respond: boolean;
};

type Target = {
  relationship_id: string;
  space_id: string;
  space_name: string;
  counterparty_alias: string | null;
};

async function fixture() {
  const db = new PGlite();
  await db.exec(`
    CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
    CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid PRIMARY KEY);
    INSERT INTO auth.users VALUES
      ('${owner}'), ('${member}'), ('${memberTwo}'), ('${outsider}'), ('${disabled}');
    CREATE TABLE public.team_entitlement_fixture(user_id uuid PRIMARY KEY, eligible boolean NOT NULL);
    INSERT INTO public.team_entitlement_fixture VALUES
      ('${owner}',true), ('${member}',true), ('${memberTwo}',true), ('${outsider}',true), ('${disabled}',false);
    CREATE FUNCTION public.get_team_entitlement(p_user_id uuid)
    RETURNS TABLE(eligible boolean)
    LANGUAGE sql STABLE AS $$
      SELECT f.eligible FROM public.team_entitlement_fixture AS f WHERE f.user_id=p_user_id
    $$;
    CREATE TABLE public.team_aliases(
      user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      alias text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    INSERT INTO public.team_aliases(user_id,alias) VALUES
      ('${member}','member-one'), ('${memberTwo}','member-two');
    CREATE TABLE public.team_shared_spaces(
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      owner_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      name text NOT NULL,
      description text,
      external_ref text,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TABLE public.team_space_invitations(
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      space_id uuid NOT NULL REFERENCES public.team_shared_spaces(id) ON DELETE CASCADE,
      inviter_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      invitee_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
      invitee_email_hash text,
      status text NOT NULL DEFAULT 'pending',
      created_at timestamptz NOT NULL DEFAULT now(),
      responded_at timestamptz
    );
    INSERT INTO public.team_shared_spaces(owner_user_id,name,external_ref)
      VALUES ('${owner}','Pair space','never-project-this') ;
    INSERT INTO public.team_space_invitations(space_id,inviter_user_id,invitee_user_id,status)
      SELECT id,'${owner}','${member}','accepted' FROM public.team_shared_spaces;
    INSERT INTO public.team_space_invitations(space_id,inviter_user_id,invitee_user_id,status)
      SELECT id,'${owner}','${memberTwo}','accepted' FROM public.team_shared_spaces;
    INSERT INTO public.team_space_invitations(space_id,inviter_user_id,invitee_user_id,status)
      SELECT id,'${owner}','${outsider}','pending' FROM public.team_shared_spaces;
  `);
  await db.exec(migration);
  return db;
}

function createInitial(
  db: PGlite,
  userId: string,
  spaceId: string,
  relationshipId: string | null,
  kind: "document" | "context",
  manifestHash: string,
  metadata: Record<string, unknown>,
  clientOperationId: string,
) {
  return db.query<Turn>(
    `SELECT * FROM public.create_team_space_conversation_turn_v3(
      $1::uuid,$2::uuid,$3::uuid,$4,$5,$6::jsonb,$7::uuid
    )`,
    [userId, spaceId, relationshipId, kind, manifestHash, JSON.stringify(metadata), clientOperationId],
  );
}

function createFollowUp(
  db: PGlite,
  userId: string,
  threadId: string,
  kind: "document" | "context",
  manifestHash: string,
  metadata: Record<string, unknown>,
  clientOperationId: string,
) {
  return db.query<Turn>(
    `SELECT * FROM public.create_team_conversation_turn_v3(
      $1::uuid,$2::uuid,$3,$4,$5::jsonb,$6::uuid
    )`,
    [userId, threadId, kind, manifestHash, JSON.stringify(metadata), clientOperationId],
  );
}

function respond(
  db: PGlite,
  userId: string,
  turnId: string,
  decision: "accepted" | "declined",
  clientOperationId: string,
) {
  return db.query<Turn>(
    "SELECT * FROM public.respond_team_conversation_turn_v3($1::uuid,$2::uuid,$3,$4::uuid)",
    [userId, turnId, decision, clientOperationId],
  );
}

describe("Team conversation turn migration 0053", () => {
  it("keeps recurring bidirectional turns approval-gated, metadata-only, and idempotent", async () => {
    const db = await fixture();
    try {
      const spaceId = (await db.query<{ id: string }>(
        "SELECT id FROM public.team_shared_spaces",
      )).rows[0].id;
      const targets = (await db.query<Target>(
        "SELECT * FROM public.list_team_conversation_targets_v3($1::uuid,$2::uuid)", [owner, spaceId],
      )).rows;
      expect(targets).toHaveLength(2);
      expect(targets.map((target) => target.counterparty_alias).sort()).toEqual(["member-one", "member-two"]);
      expect(Object.keys(targets[0]).sort()).toEqual([
        "counterparty_alias", "relationship_id", "space_id", "space_name",
      ]);
      expect((await db.query(
        "SELECT * FROM public.list_team_conversation_targets_v3($1::uuid,$2::uuid)", [member, spaceId],
      )).rows).toHaveLength(0);
      const serializedTargets = JSON.stringify(targets);
      for (const privateValue of [owner, member, memberTwo, outsider, "never-project-this"]) {
        expect(serializedTargets).not.toContain(privateValue);
      }
      const memberRelationship = targets.find((target) => target.counterparty_alias === "member-one")!.relationship_id;
      const memberTwoRelationship = targets.find((target) => target.counterparty_alias === "member-two")!.relationship_id;

      // A recipient can begin a thread without selecting a user; the accepted
      // invitation pair is derived on the server.
      const first = await createInitial(
        db, member, spaceId, null, "document", hash("a"),
        { label: "Quarterly packet", itemCount: 2 }, operation("000000000001"),
      );
      expect(first.rows).toHaveLength(1);
      const initial = first.rows[0];
      expect(initial).toMatchObject({
        status: "pending", request_kind: "document", direction: "outbound", can_respond: false,
        metadata: { label: "Quarterly packet", itemCount: 2 },
      });
      await expect(createFollowUp(
        db, member, initial.thread_id, "document", hash("z"),
        { body: "must never become a document payload" }, operation("000000000030"),
      )).rejects.toThrow(/invalid conversation turn metadata/);

      // Retrying the exact same operation is canonical, while changing its
      // declared metadata must fail instead of silently replaying another turn.
      const concurrent = await Promise.all([1, 2].map(() => createInitial(
        db, member, spaceId, null, "document", hash("a"),
        { label: "Quarterly packet", itemCount: 2 }, operation("000000000001"),
      )));
      expect(concurrent.map((result) => result.rows[0].id)).toEqual([initial.id, initial.id]);
      await expect(createInitial(
        db, member, spaceId, null, "document", hash("a"),
        { label: "Different packet" }, operation("000000000001"),
      )).rejects.toThrow(/conflicts with existing turn/);

      // The owner must use an opaque accepted relationship handle; an invitee
      // may not probe other relationships or select a counterparty at all.
      expect((await createInitial(
        db, owner, spaceId, null, "context", hash("b"), {}, operation("000000000002"),
      )).rows).toHaveLength(0);
      expect((await createInitial(
        db, owner, spaceId, "00000000-0000-4000-8000-000000000099", "context", hash("b"), {}, operation("000000000002"),
      )).rows).toHaveLength(0);
      expect((await createInitial(
        db, member, spaceId, memberTwoRelationship, "context", hash("b"), {}, operation("000000000002"),
      )).rows).toHaveLength(0);
      const ownerToSecond = await createInitial(
        db, owner, spaceId, memberTwoRelationship, "context", hash("b"),
        { category: "Research" }, operation("000000000003"),
      );
      expect(ownerToSecond.rows[0]).toMatchObject({ direction: "outbound", status: "pending", request_kind: "context" });
      // A create operation UUID is actor-global, not merely thread-local. It
      // cannot be replayed by the same actor to create a turn on another pair.
      await expect(createFollowUp(
        db, owner, initial.thread_id, "context", hash("b"),
        { category: "Research" }, operation("000000000003"),
      )).rejects.toThrow(/conflicts with existing turn/);

      // Only the exact recipient approves a turn. The response operation UUID
      // gives retries exact idempotency and rejects changed terminal actions.
      expect((await respond(db, member, initial.id, "accepted", operation("000000000010"))).rows).toHaveLength(0);
      const accepted = await respond(db, owner, initial.id, "accepted", operation("000000000010"));
      expect(accepted.rows[0]).toMatchObject({ id: initial.id, status: "accepted", direction: "inbound", can_respond: false });
      const acceptedRetry = await respond(db, owner, initial.id, "accepted", operation("000000000010"));
      expect(acceptedRetry.rows[0].id).toBe(initial.id);
      await expect(respond(db, owner, initial.id, "declined", operation("000000000011"))).rejects.toThrow(/terminal/);

      // Both sides can add later turns to the same pair, so the old one-request
      // uniqueness constraint cannot block an ongoing conversation.
      const memberFollowUp = await createFollowUp(
        db, member, initial.thread_id, "context", hash("c"),
        { category: "Clarification" }, operation("000000000020"),
      );
      const ownerFollowUp = await createFollowUp(
        db, owner, initial.thread_id, "document", hash("d"),
        { label: "Owner response" }, operation("000000000021"),
      );
      expect(memberFollowUp.rows[0]).toMatchObject({ direction: "outbound", status: "pending" });
      expect(ownerFollowUp.rows[0]).toMatchObject({ direction: "outbound", status: "pending" });

      const memberTurnsBeforeResponse = (await db.query<Turn>(
        "SELECT * FROM public.list_team_conversation_turns_v3($1::uuid,$2::uuid,50,NULL,NULL)",
        [member, initial.thread_id],
      )).rows;
      expect(memberTurnsBeforeResponse).toHaveLength(3);
      expect(memberTurnsBeforeResponse.find((turn) => turn.id === ownerFollowUp.rows[0].id)).toMatchObject({
        direction: "inbound", can_respond: true, status: "pending",
      });
      const serializedTurns = JSON.stringify(memberTurnsBeforeResponse);
      for (const privateValue of [
        owner, member, memberTwo, outsider, hash("a"), hash("b"), hash("c"), hash("d"),
        operation("000000000001"), operation("000000000010"), operation("000000000020"),
      ]) {
        expect(serializedTurns).not.toContain(privateValue);
      }
      expect(Object.keys(memberTurnsBeforeResponse[0]).sort()).toEqual([
        "can_respond", "created_at", "direction", "id", "metadata", "request_kind", "responded_at", "status", "thread_id",
      ]);

      const declined = await respond(db, member, ownerFollowUp.rows[0].id, "declined", operation("000000000022"));
      expect(declined.rows[0]).toMatchObject({ status: "declined", direction: "inbound" });
      const anotherMemberTurn = await createFollowUp(
        db, member, initial.thread_id, "document", hash("e"),
        { label: "Another request" }, operation("000000000023"),
      );
      await expect(respond(db, owner, anotherMemberTurn.rows[0].id, "accepted", operation("000000000010"))).rejects.toThrow(/response operation conflicts/);
      expect((await respond(db, owner, anotherMemberTurn.rows[0].id, "accepted", operation("000000000024"))).rows[0].status).toBe("accepted");

      const threads = (await db.query<{
        thread_id: string; space_id: string; space_name: string; last_activity_at: string;
      }>(
        "SELECT * FROM public.list_team_conversation_threads_v3($1::uuid,50,NULL,NULL)", [member],
      )).rows;
      expect(threads).toHaveLength(1);
      expect(threads[0]).toMatchObject({ thread_id: initial.thread_id, space_id: spaceId, space_name: "Pair space" });
      expect(Object.keys(threads[0]).sort()).toEqual(["last_activity_at", "space_id", "space_name", "thread_id"]);
      const firstPage = (await db.query<Turn>(
        "SELECT * FROM public.list_team_conversation_turns_v3($1::uuid,$2::uuid,1,NULL,NULL)",
        [member, initial.thread_id],
      )).rows;
      const secondPage = (await db.query<Turn>(
        "SELECT * FROM public.list_team_conversation_turns_v3($1::uuid,$2::uuid,1,$3::timestamptz,$4::uuid)",
        [member, initial.thread_id, firstPage[0].created_at, firstPage[0].id],
      )).rows;
      expect(secondPage).toHaveLength(1);
      expect(secondPage[0].id).not.toBe(firstPage[0].id);
      await expect(db.query(
        "SELECT * FROM public.list_team_conversation_turns_v3($1::uuid,$2::uuid,1,$3::timestamptz,NULL)",
        [member, initial.thread_id, firstPage[0].created_at],
      )).rejects.toThrow(/cursor/);

      // Relationship revocation and a midflow entitlement loss both fail
      // closed: no new turn, no approval, and no metadata projection.
      await db.query(
        "UPDATE public.team_space_invitations SET status='revoked' WHERE id=$1::uuid", [memberRelationship],
      );
      expect((await createFollowUp(
        db, member, initial.thread_id, "context", hash("f"), {}, operation("000000000025"),
      )).rows).toHaveLength(0);
      expect((await respond(db, owner, memberFollowUp.rows[0].id, "accepted", operation("000000000026"))).rows).toHaveLength(0);
      expect((await db.query(
        "SELECT * FROM public.list_team_conversation_turns_v3($1::uuid,$2::uuid,50,NULL,NULL)", [member, initial.thread_id],
      )).rows).toHaveLength(0);
      await db.query(
        "UPDATE public.team_space_invitations SET status='accepted' WHERE id=$1::uuid", [memberRelationship],
      );
      await db.query("UPDATE public.team_entitlement_fixture SET eligible=false WHERE user_id=$1::uuid", [member]);
      expect((await respond(db, owner, memberFollowUp.rows[0].id, "accepted", operation("000000000027"))).rows).toHaveLength(0);
      await expect(createFollowUp(
        db, member, initial.thread_id, "context", hash("f"), {}, operation("000000000028"),
      )).rejects.toThrow(/entitlement required/);
      await db.query("UPDATE public.team_entitlement_fixture SET eligible=true WHERE user_id=$1::uuid", [member]);
      await db.query("UPDATE public.team_entitlement_fixture SET eligible=false WHERE user_id=$1::uuid", [owner]);
      expect((await db.query(
        "SELECT * FROM public.list_team_conversation_turns_v3($1::uuid,$2::uuid,50,NULL,NULL)", [member, initial.thread_id],
      )).rows).toHaveLength(0);
      expect((await createInitial(
        db, outsider, spaceId, null, "document", hash("f"), {}, operation("000000000029"),
      )).rows).toHaveLength(0);
    } finally {
      await db.close();
    }
  }, 30_000);

  it("binds each thread to one invitation and keeps a revoked relation fail-closed", async () => {
    const db = await fixture();
    try {
      const spaceId = (await db.query<{ id: string }>(
        "SELECT id FROM public.team_shared_spaces",
      )).rows[0].id;
      const relationshipA = (await db.query<{ id: string }>(`
        SELECT id FROM public.team_space_invitations
        WHERE space_id=$1::uuid AND invitee_user_id=$2::uuid AND status='accepted'
      `, [spaceId, member])).rows[0].id;

      // The first thread is authorized by A. A later accepted invite B for the
      // same pair must not become an implicit fallback for that old thread.
      const first = await createInitial(
        db, member, spaceId, null, "document", hash("a"),
        { label: "Bound to A" }, operation("000000000040"),
      );
      const oldThread = first.rows[0];
      expect((await db.query<{ relationship_id: string }>(
        "SELECT relationship_id FROM public.team_space_conversation_threads WHERE id=$1::uuid", [oldThread.thread_id],
      )).rows[0].relationship_id).toBe(relationshipA);
      const relationshipB = (await db.query<{ id: string }>(`
        INSERT INTO public.team_space_invitations(
          space_id,inviter_user_id,invitee_user_id,status,responded_at
        ) VALUES ($1::uuid,$2::uuid,$3::uuid,'accepted',now())
        RETURNING id
      `, [spaceId, owner, member])).rows[0].id;
      expect(relationshipB).not.toBe(relationshipA);

      await db.query(
        "UPDATE public.team_space_invitations SET status='revoked' WHERE id=$1::uuid", [relationshipA],
      );
      expect((await db.query<{ status: string }>(
        "SELECT status FROM public.team_space_invitations WHERE id=$1::uuid", [relationshipB],
      )).rows[0].status).toBe("accepted");

      // Relation A is revoked, but B remains accepted. Every old-thread path
      // must still hide/block A rather than authorizing through B.
      const targets = (await db.query<Target>(
        "SELECT * FROM public.list_team_conversation_targets_v3($1::uuid,$2::uuid)", [owner, spaceId],
      )).rows;
      expect(targets.find((target) => target.counterparty_alias === "member-one")?.relationship_id).toBe(relationshipB);
      expect((await db.query(
        "SELECT * FROM public.list_team_conversation_threads_v3($1::uuid,50,NULL,NULL)", [owner],
      )).rows).toHaveLength(0);
      expect((await db.query(
        "SELECT * FROM public.list_team_conversation_turns_v3($1::uuid,$2::uuid,50,NULL,NULL)",
        [member, oldThread.thread_id],
      )).rows).toHaveLength(0);
      expect((await createFollowUp(
        db, member, oldThread.thread_id, "context", hash("b"),
        { category: "Blocked by A revocation" }, operation("000000000041"),
      )).rows).toHaveLength(0);
      expect((await respond(
        db, owner, oldThread.id, "accepted", operation("000000000042"),
      )).rows).toHaveLength(0);
      expect((await db.query<{ status: string }>(
        "SELECT status FROM public.team_space_conversation_turns WHERE id=$1::uuid", [oldThread.id],
      )).rows[0].status).toBe("pending");

      // A fresh thread may be started only through B; it must neither reuse A
      // nor reveal or reactivate A's old turn history.
      const replacement = await createInitial(
        db, member, spaceId, null, "context", hash("c"),
        { category: "Bound to B" }, operation("000000000043"),
      );
      expect(replacement.rows[0].thread_id).not.toBe(oldThread.thread_id);
      expect((await db.query<{ relationship_id: string }>(
        "SELECT relationship_id FROM public.team_space_conversation_threads WHERE id=$1::uuid", [replacement.rows[0].thread_id],
      )).rows[0].relationship_id).toBe(relationshipB);
      const visibleThreads = (await db.query<{ thread_id: string }>(
        "SELECT * FROM public.list_team_conversation_threads_v3($1::uuid,50,NULL,NULL)", [member],
      )).rows;
      expect(visibleThreads.map((thread) => thread.thread_id)).toEqual([replacement.rows[0].thread_id]);

      // PGlite has one in-process query queue rather than independent server
      // sessions. Pin the actual stored lock order that PostgreSQL uses for
      // write/race serialization: invitation -> thread -> turn.
      const definition = async (signature: string) => (
        await db.query<{ definition: string }>(
          "SELECT pg_get_functiondef($1::regprocedure) AS definition", [signature],
        )
      ).rows[0].definition.replace(/\s+/g, "").toLowerCase();
      const initialDefinition = await definition(
        "public.create_team_space_conversation_turn_v3(uuid,uuid,uuid,text,text,jsonb,uuid)",
      );
      const followUpDefinition = await definition(
        "public._team_create_conversation_turn_for_thread_v3(uuid,uuid,text,text,jsonb,uuid)",
      );
      const responseDefinition = await definition(
        "public.respond_team_conversation_turn_v3(uuid,uuid,text,uuid)",
      );
      expect(initialDefinition).toContain(
        "frompublic.team_space_invitationsasiwherei.id=p_relationship_idandi.space_id=p_space_idandi.inviter_user_id=v_owner_user_idandi.status='accepted'forupdate",
      );
      expect(initialDefinition).toContain("limit1forupdate");
      expect(initialDefinition.indexOf("frompublic.team_space_invitationsasi")).toBeLessThan(
        initialDefinition.indexOf("frompublic.team_space_conversation_threadsasthwhereth.relationship_id=v_relationship.idforupdate"),
      );
      expect(followUpDefinition).toContain(
        "frompublic.team_space_invitationsasiwherei.id=v_relationship_idandi.status='accepted'forupdate",
      );
      expect(followUpDefinition.indexOf("frompublic.team_space_invitationsasi")).toBeLessThan(
        followUpDefinition.indexOf("frompublic.team_space_conversation_threadsasthwhereth.id=p_thread_idandth.relationship_id=v_relationship.idforupdate"),
      );
      expect(responseDefinition).toContain(
        "frompublic.team_space_invitationsasiwherei.id=v_relationship_idandi.status='accepted'forupdate",
      );
      expect(responseDefinition.indexOf("frompublic.team_space_invitationsasi")).toBeLessThan(
        responseDefinition.indexOf("frompublic.team_space_conversation_threadsasthwhereth.id=v_thread_idandth.relationship_id=v_relationship.idforupdate"),
      );
      expect(responseDefinition.indexOf("frompublic.team_space_conversation_threadsasthwhereth.id=v_thread_idandth.relationship_id=v_relationship.idforupdate")).toBeLessThan(
        responseDefinition.indexOf("frompublic.team_space_conversation_turnsastwheret.id=p_turn_idandt.thread_id=v_thread.idforupdate"),
      );
    } finally {
      await db.close();
    }
  }, 30_000);

  it("keeps tables/RPCs private and does not add a content-delivery schema", async () => {
    const db = await fixture();
    try {
      const columnNames = (await db.query<{ table_name: string; column_name: string }>(`
        SELECT table_name,column_name
        FROM information_schema.columns
        WHERE table_schema='public'
          AND table_name IN ('team_space_conversation_threads','team_space_conversation_turns')
      `)).rows;
      const serializedColumns = JSON.stringify(columnNames).toLowerCase();
      for (const forbidden of ["content", "payload", "ciphertext", "delivery", "import", "decrypt"]) {
        expect(serializedColumns).not.toContain(forbidden);
      }
      expect(serializedColumns).toContain("manifest_hash");

      for (const table of ["team_space_conversation_threads", "team_space_conversation_turns"]) {
        expect((await db.query<{ rowsecurity: boolean }>(
          "SELECT rowsecurity FROM pg_tables WHERE schemaname='public' AND tablename=$1", [table],
        )).rows[0].rowsecurity).toBe(true);
        for (const role of ["anon", "authenticated"]) {
          for (const privilege of ["SELECT", "INSERT", "UPDATE", "DELETE"]) {
            expect((await db.query<{ allowed: boolean }>(
              "SELECT has_table_privilege($1,$2,$3) AS allowed", [role, `public.${table}`, privilege],
            )).rows[0].allowed).toBe(false);
          }
        }
      }
      for (const signature of [
        "public.create_team_space_conversation_turn_v3(uuid,uuid,uuid,text,text,jsonb,uuid)",
        "public.create_team_conversation_turn_v3(uuid,uuid,text,text,jsonb,uuid)",
        "public.respond_team_conversation_turn_v3(uuid,uuid,text,uuid)",
        "public.list_team_conversation_targets_v3(uuid,uuid)",
        "public.list_team_conversation_threads_v3(uuid,integer,timestamp with time zone,uuid)",
        "public.list_team_conversation_turns_v3(uuid,uuid,integer,timestamp with time zone,uuid)",
      ]) {
        expect((await db.query<{ allowed: boolean }>(
          "SELECT has_function_privilege('authenticated',$1,'EXECUTE') AS allowed", [signature],
        )).rows[0].allowed).toBe(false);
        expect((await db.query<{ allowed: boolean }>(
          "SELECT has_function_privilege('service_role',$1,'EXECUTE') AS allowed", [signature],
        )).rows[0].allowed).toBe(true);
      }
      for (const signature of [
        "public._team_assert_conversation_turn_input_v3(text,text,jsonb,uuid)",
        "public._team_create_conversation_turn_for_thread_v3(uuid,uuid,text,text,jsonb,uuid)",
      ]) {
        expect((await db.query<{ allowed: boolean }>(
          "SELECT has_function_privilege('service_role',$1,'EXECUTE') AS allowed", [signature],
        )).rows[0].allowed).toBe(false);
      }
    } finally {
      await db.close();
    }
  }, 30_000);
});
