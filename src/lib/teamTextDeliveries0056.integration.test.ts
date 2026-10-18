import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";

const migration = readFileSync(join(process.cwd(), "supabase/migrations/0056_team_text_deliveries.sql"), "utf8");
const owner = "00000000-0000-4000-8000-000000000001";
const member = "00000000-0000-4000-8000-000000000002";
const outsider = "00000000-0000-4000-8000-000000000003";
const space = "00000000-0000-4000-8000-000000000004";
const relationship = "00000000-0000-4000-8000-000000000005";
const thread = "00000000-0000-4000-8000-000000000006";
const turn = "00000000-0000-4000-8000-000000000007";
const operation = "00000000-0000-4000-8000-000000000008";
const digest = "a".repeat(64);
const databases: PGlite[] = [];

async function fixture() {
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
      status text NOT NULL, responded_at timestamptz
    );
    INSERT INTO public.team_shared_spaces VALUES ('${space}','${owner}','Proyecto');
    INSERT INTO public.team_space_invitations VALUES ('${relationship}','${space}','${owner}','${member}','accepted');
    INSERT INTO public.team_space_conversation_threads VALUES ('${thread}','${space}','${member}','${relationship}');
    INSERT INTO public.team_space_conversation_turns VALUES ('${turn}','${thread}','${member}','${owner}','accepted',now());
  `);
  await db.exec(migration);
  return db;
}

afterEach(async () => {
  await Promise.all(databases.splice(0).map((db) => db.close()));
});

describe("Team private text delivery migration 0056", () => {
  it("keeps payload tables inaccessible and exposes only service-role RPCs", async () => {
    const db = await fixture();
    expect((await db.query<{ ok: boolean }>(`
      SELECT NOT has_table_privilege('anon','team_delivery_private.text_deliveries','SELECT')
       AND NOT has_table_privilege('authenticated','team_delivery_private.text_deliveries','SELECT')
       AND NOT has_table_privilege('service_role','team_delivery_private.text_deliveries','SELECT')
       AND NOT has_function_privilege('anon','public.read_team_text_delivery_v1(uuid,uuid)','EXECUTE')
       AND NOT has_function_privilege('authenticated','public.list_team_text_deliveries_v1(uuid,uuid,integer,timestamp with time zone,uuid)','EXECUTE')
       AND has_function_privilege('service_role','public.create_team_text_delivery_v1(uuid,uuid,uuid,uuid,text,text)','EXECUTE')
       AND has_function_privilege('service_role','public.list_team_text_deliveries_v1(uuid,uuid,integer,timestamp with time zone,uuid)','EXECUTE')
       AND has_function_privilege('service_role','public.purge_expired_team_text_deliveries(integer)','EXECUTE') AS ok
    `)).rows[0].ok).toBe(true);
  }, 15_000);

  it("serializes opaque inbox projection with revocation using relationship-before-thread locks", async () => {
    const db = await fixture();
    const fn = (await db.query<{ source: string; volatility: string }>(`
      SELECT prosrc AS source, provolatile AS volatility FROM pg_proc
       WHERE proname='list_text_deliveries' AND pronamespace='team_delivery_private'::regnamespace
    `)).rows[0];
    expect(fn.volatility).toBe("v");
    const relationshipLock = fn.source.indexOf("WHERE i.id=v_relationship_id AND i.status='accepted' FOR UPDATE");
    const threadLock = fn.source.indexOf("WHERE th.id=p_thread_id AND th.relationship_id=v_invite.id FOR UPDATE");
    const projection = fn.source.indexOf("RETURN QUERY SELECT d.id,d.turn_id,d.created_at,d.expires_at");
    expect(relationshipLock).toBeGreaterThanOrEqual(0);
    expect(threadLock).toBeGreaterThan(relationshipLock);
    expect(projection).toBeGreaterThan(threadLock);
    await db.query(`UPDATE public.team_space_invitations SET status='revoked' WHERE id=$1`, [relationship]);
    expect((await db.query(`SELECT * FROM public.list_team_text_deliveries_v1($1,$2,50,NULL,NULL)`, [member, thread])).rows).toEqual([]);
  }, 15_000);

  it("creates one bounded owner-approved delivery idempotently, never returns payload in the receipt", async () => {
    const db = await fixture();
    const text = "Reviewed answer, sent explicitly by the owner.";
    const call = () => db.query<{ id: string; recipient_user_id: string; created_at: string; expires_at: string }>(`SELECT * FROM public.create_team_text_delivery_v1($1,$2,$3,$4,$5,$6)`, [owner, thread, turn, operation, text, digest]);
    expect((await db.query(`SELECT * FROM public.create_team_text_delivery_v1($1,$2,$3,$4,$5,$6)`, [member, thread, turn, operation, text, digest])).rows).toEqual([]);
    const first = (await call()).rows[0];
    const retry = (await call()).rows[0];
    expect(retry).toEqual(first);
    expect(first).not.toHaveProperty("content");
    expect((await db.query<{ n: number }>(`SELECT count(*)::int AS n FROM team_delivery_private.text_delivery_events WHERE event='created'`)).rows[0].n).toBe(1);
    await expect(db.query(`SELECT * FROM public.create_team_text_delivery_v1($1,$2,$3,$4,$5,$6)`, [owner, thread, turn, operation, `${text}!`, digest])).rejects.toThrow();
    const inbox = await db.query<{ id: string; turn_id: string }>(`SELECT id,turn_id FROM public.list_team_text_deliveries_v1($1,$2,50,NULL,NULL)`, [member, thread]);
    expect(inbox.rows).toEqual([{ id: first.id, turn_id: turn }]);
    expect(JSON.stringify(inbox.rows)).not.toContain(text);
    const read = await db.query<{ content: string }>(`SELECT content FROM public.read_team_text_delivery_v1($1,$2)`, [member, first.id]);
    expect(read.rows).toEqual([{ content: text }]);
  }, 15_000);

  it("allows the accepted recipient to send back in the reverse conversation direction without changing ownership", async () => {
    const db = await fixture();
    await db.query(`UPDATE public.team_space_conversation_turns SET initiator_user_id=$1,recipient_user_id=$2 WHERE id=$3`, [owner, member, turn]);
    const receipt = (await db.query<{ id: string; recipient_user_id: string }>(
      `SELECT * FROM public.create_team_text_delivery_v1($1,$2,$3,$4,$5,$6)`,
      [member, thread, turn, operation, "Member's reviewed answer", digest],
    )).rows[0];
    expect(receipt.recipient_user_id).toBe(owner);
    expect((await db.query(`SELECT * FROM public.list_team_text_deliveries_v1($1,$2,50,NULL,NULL)`, [member, thread])).rows).toEqual([]);
    expect((await db.query(`SELECT id FROM public.list_team_text_deliveries_v1($1,$2,50,NULL,NULL)`, [owner, thread])).rows).toEqual([{ id: receipt.id }]);
    expect((await db.query(`SELECT content FROM public.read_team_text_delivery_v1($1,$2)`, [member, receipt.id])).rows).toEqual([]);
    expect((await db.query(`SELECT content FROM public.read_team_text_delivery_v1($1,$2)`, [owner, receipt.id])).rows).toEqual([{ content: "Member's reviewed answer" }]);
    const ownership = (await db.query<{ owner_user_id: string; participant_user_id: string }>(
      `SELECT s.owner_user_id,t.participant_user_id FROM public.team_shared_spaces s CROSS JOIN public.team_space_conversation_threads t WHERE s.id=$1 AND t.id=$2`, [space, thread],
    )).rows[0];
    expect(ownership).toEqual({ owner_user_id: owner, participant_user_id: member });
  }, 15_000);

  it("fails closed for wrong sender, pending/old approval, revoked relation, or lost entitlement", async () => {
    const db = await fixture();
    const send = () => db.query(`SELECT * FROM public.create_team_text_delivery_v1($1,$2,$3,$4,$5,$6)`, [owner, thread, turn, operation, "text", digest]);
    expect((await db.query(`SELECT * FROM public.create_team_text_delivery_v1($1,$2,$3,$4,$5,$6)`, [outsider, thread, turn, operation, "text", digest])).rows).toEqual([]);
    expect((await db.query(`SELECT * FROM public.create_team_text_delivery_v1($1,$2,$3,$4,$5,$6)`, [member, thread, turn, operation, "text", digest])).rows).toEqual([]);
    await db.query(`UPDATE public.team_space_conversation_turns SET responded_at=now()+interval '1 minute' WHERE id=$1`, [turn]);
    expect((await send()).rows).toEqual([]);
    await db.query(`UPDATE public.team_space_conversation_turns SET responded_at=now()-interval '25 hours' WHERE id=$1`, [turn]);
    expect((await send()).rows).toEqual([]);
    await db.query(`UPDATE public.team_space_conversation_turns SET responded_at=now(),status='pending' WHERE id=$1`, [turn]);
    expect((await send()).rows).toEqual([]);
    await db.query(`UPDATE public.team_space_conversation_turns SET status='accepted' WHERE id=$1`, [turn]);
    await db.query(`UPDATE public.team_space_invitations SET status='revoked' WHERE id=$1`, [relationship]);
    expect((await send()).rows).toEqual([]);
    await db.query(`UPDATE public.team_space_invitations SET status='accepted' WHERE id=$1`, [relationship]);
    await db.query(`UPDATE public.elig SET eligible=false WHERE user_id=$1`, [member]);
    expect((await send()).rows).toEqual([]);
  }, 15_000);

  it("rechecks recipient authorization and deletes expired text while keeping payload-free audit", async () => {
    const db = await fixture();
    const receipt = (await db.query<{ id: string }>(`SELECT * FROM public.create_team_text_delivery_v1($1,$2,$3,$4,$5,$6)`, [owner, thread, turn, operation, "private sentinel", digest])).rows[0];
    expect((await db.query(`SELECT * FROM public.read_team_text_delivery_v1($1,$2)`, [outsider, receipt.id])).rows).toEqual([]);
    await db.query(`UPDATE team_delivery_private.text_deliveries SET expires_at=now()-interval '1 second' WHERE id=$1`, [receipt.id]);
    expect((await db.query(`SELECT * FROM public.read_team_text_delivery_v1($1,$2)`, [member, receipt.id])).rows).toEqual([]);
    expect((await db.query(`SELECT content,content_sha256,deleted_at FROM team_delivery_private.text_deliveries WHERE id=$1`, [receipt.id])).rows[0]).toMatchObject({ content: null, content_sha256: null });
    expect((await db.query<{ n: number }>(`SELECT count(*)::int AS n FROM team_delivery_private.text_delivery_events WHERE delivery_id=$1 AND event='expired'`, [receipt.id])).rows[0].n).toBe(1);
    const audit = await db.query<{ event: string; actor_user_id: string | null }>(`SELECT event,actor_user_id FROM team_delivery_private.text_delivery_events WHERE delivery_id=$1 ORDER BY id`, [receipt.id]);
    expect(audit.rows.map((row) => row.event)).toEqual(["created", "expired"]);
    expect(JSON.stringify(audit.rows)).not.toContain("private sentinel");
  }, 15_000);

  it("bounds authenticated recipient reads per minute", async () => {
    const db = await fixture();
    const receipt = (await db.query<{ id: string }>(`SELECT * FROM public.create_team_text_delivery_v1($1,$2,$3,$4,$5,$6)`, [owner, thread, turn, operation, "private", digest])).rows[0];
    for (let i = 0; i < 60; i++) {
      expect((await db.query(`SELECT * FROM public.read_team_text_delivery_v1($1,$2)`, [member, receipt.id])).rows).toHaveLength(1);
    }
    await expect(db.query(`SELECT * FROM public.read_team_text_delivery_v1($1,$2)`, [member, receipt.id])).rejects.toThrow("delivery rate limited");
  }, 15_000);

  it("stops reads immediately when the bound relationship is revoked", async () => {
    const db = await fixture();
    const receipt = (await db.query<{ id: string }>(`SELECT * FROM public.create_team_text_delivery_v1($1,$2,$3,$4,$5,$6)`, [owner, thread, turn, operation, "private", digest])).rows[0];
    await db.query(`UPDATE public.team_space_invitations SET status='revoked' WHERE id=$1`, [relationship]);
    expect((await db.query(`SELECT * FROM public.read_team_text_delivery_v1($1,$2)`, [member, receipt.id])).rows).toEqual([]);
    expect((await db.query(`SELECT * FROM public.list_team_text_deliveries_v1($1,$2,50,NULL,NULL)`, [member, thread])).rows).toEqual([]);
    expect((await db.query<{ n: number }>(`SELECT count(*)::int AS n FROM team_delivery_private.text_delivery_events WHERE delivery_id=$1 AND event='viewed'`, [receipt.id])).rows[0].n).toBe(0);
  }, 15_000);

  it("purges only expired payloads in bounded batches", async () => {
    const db = await fixture();
    const receipt = (await db.query(`SELECT * FROM public.create_team_text_delivery_v1($1,$2,$3,$4,$5,$6)`, [owner, thread, turn, operation, "private", digest])).rows[0] as { id: string };
    await db.query(`UPDATE team_delivery_private.text_deliveries SET expires_at=now()-interval '1 second' WHERE id=$1`, [receipt.id]);
    expect((await db.query<{ n: number }>(`SELECT public.purge_expired_team_text_deliveries(1) AS n`)).rows[0].n).toBe(1);
    expect((await db.query(`SELECT content,content_sha256,deleted_at FROM team_delivery_private.text_deliveries WHERE id=$1`, [receipt.id])).rows[0]).toMatchObject({ content: null, content_sha256: null });
  }, 15_000);
});
