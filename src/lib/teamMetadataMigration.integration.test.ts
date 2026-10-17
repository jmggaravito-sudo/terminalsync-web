import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";

const migration=readFileSync(join(process.cwd(),"supabase/migrations/0042_team_metadata_invites.sql"),"utf8");
const projectionMigration=readFileSync(join(process.cwd(),"supabase/migrations/0047_team_invitation_owner_alias_projection.sql"),"utf8");
const owner="00000000-0000-0000-0000-000000000001", invitee="00000000-0000-0000-0000-000000000002", noEnt="00000000-0000-0000-0000-000000000003", other="00000000-0000-0000-0000-000000000004";

describe("Team metadata 0042 integration",()=>{
 it("executes against the 0039-0041 schema contract and enforces ownership, privacy, and entitlement",async()=>{
  const db=new PGlite();
  try {
   await db.exec(`
    CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role; CREATE SCHEMA auth;
    CREATE TABLE auth.users(id uuid PRIMARY KEY);
    INSERT INTO auth.users VALUES ('${owner}'),('${invitee}'),('${noEnt}'),('${other}');
    CREATE TABLE public.test_entitlements(user_id uuid PRIMARY KEY,eligible boolean NOT NULL);
    INSERT INTO public.test_entitlements VALUES ('${owner}',true),('${invitee}',true),('${noEnt}',false),('${other}',true);
    CREATE FUNCTION public.get_team_entitlement(p_user_id uuid) RETURNS TABLE(eligible boolean,seat_limit bigint,source text,expires_at timestamptz)
      LANGUAGE sql STABLE AS $$ SELECT e.eligible,1::bigint,'universal_trial'::text,NULL::timestamptz FROM public.test_entitlements e WHERE e.user_id=p_user_id $$;
    CREATE TABLE public.team_aliases(user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,alias text NOT NULL CHECK(alias=lower(btrim(alias)) AND alias ~ '^[a-z0-9][a-z0-9._-]{1,28}[a-z0-9]$' AND alias NOT LIKE '%..%'),created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now());
    CREATE UNIQUE INDEX team_aliases_alias_unique_idx ON public.team_aliases(alias);
    CREATE TABLE public.team_shared_spaces(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),owner_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,name text NOT NULL CHECK(char_length(name) BETWEEN 1 AND 120),description text CHECK(description IS NULL OR char_length(description)<=500),external_ref text CHECK(external_ref IS NULL OR char_length(external_ref)<=256),created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now());
    CREATE TABLE public.team_space_invitations(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),space_id uuid NOT NULL REFERENCES public.team_shared_spaces(id) ON DELETE CASCADE,inviter_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,invitee_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,invitee_email_hash text,status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','accepted','declined','revoked')),created_at timestamptz NOT NULL DEFAULT now(),responded_at timestamptz,CHECK((invitee_user_id IS NOT NULL) <> (invitee_email_hash IS NOT NULL)),CHECK((status='pending' AND responded_at IS NULL) OR (status<>'pending' AND responded_at IS NOT NULL)));
    CREATE TABLE public.team_space_requests(id uuid PRIMARY KEY DEFAULT gen_random_uuid());
    CREATE TABLE public.team_space_proposals(id uuid PRIMARY KEY DEFAULT gen_random_uuid());
    REVOKE ALL ON public.team_aliases,public.team_shared_spaces,public.team_space_invitations,public.team_space_requests,public.team_space_proposals FROM PUBLIC,anon,authenticated;
   `);
   await db.exec(migration);
   await db.exec(projectionMigration);
   await db.query(`SELECT * FROM public.claim_team_alias($1,'owner-alias')`,[owner]);
   await db.query(`SELECT * FROM public.claim_team_alias($1,'invitee-alias')`,[invitee]);
   await db.query(`SELECT * FROM public.claim_team_alias($1,'disabled-user')`,[noEnt]).catch(()=>undefined);
   const space=await db.query<{id:string}>(`INSERT INTO public.team_shared_spaces(owner_user_id,name) VALUES($1,'Private metadata') RETURNING id`,[owner]);
   const sid=space.rows[0].id;
   const invited=await db.query<{result:string}>(`SELECT * FROM public.invite_team_alias($1,$2,'invitee-alias')`,[owner,sid]);
   expect(invited.rows[0].result).toBe("submitted");
   for(const alias of ["missing-alias","owner-alias","disabled-user"]) {
    const result=await db.query<{result:string}>(`SELECT * FROM public.invite_team_alias($1,$2,$3)`,[owner,sid,alias]);
    expect(result.rows[0].result).toBe("submitted");
   }
   const dup=await db.query<{n:number}>(`SELECT count(*)::int AS n FROM public.team_space_invitations WHERE space_id=$1`,[sid]);
   expect(dup.rows[0].n).toBe(1);
   await expect(db.query(`SELECT * FROM public.invite_team_alias($1,$2,'invitee-alias')`,[other,sid])).rejects.toThrow();
   const pendingOwner=await db.query(`SELECT * FROM public.list_team_invitations($1)`,[owner]);
   expect(pendingOwner.rows).toHaveLength(0);
   const pendingRecipient=await db.query<{status:string;role:string}>(`SELECT * FROM public.list_team_invitations($1)`,[invitee]);
   expect(pendingRecipient.rows).toHaveLength(1); expect(pendingRecipient.rows[0]).toMatchObject({status:"pending",role:"invitee"});
   const projection=await db.query<{id:string;space_id:string;space_name:string;owner_alias:string|null;role:string;status:string}>(`SELECT * FROM public.list_team_invitations_v2($1)`,[invitee]);
   expect(projection.rows).toHaveLength(1); expect(projection.rows[0]).toMatchObject({id:expect.any(String),space_id:sid,space_name:"Private metadata",owner_alias:"owner-alias",role:"invitee",status:"pending"});
   expect(Object.keys(projection.rows[0])).not.toContain("owner_user_id");
   const ownerProjection=await db.query(`SELECT * FROM public.list_team_invitations_v2($1)`,[owner]); expect(ownerProjection.rows).toHaveLength(0);
   await db.query(`UPDATE public.test_entitlements SET eligible=false WHERE user_id=$1`,[owner]);
   const failClosed=await db.query<{result:string}>(`SELECT * FROM public.respond_team_invitation($1,(SELECT id FROM public.team_space_invitations WHERE space_id=$2),true)`,[invitee,sid]);
   expect(failClosed.rows[0].result).toBe("unavailable");
   for(const table of ["team_aliases","team_shared_spaces","team_space_invitations","team_space_requests","team_space_proposals"]) for(const role of ["anon","authenticated"]) for(const op of ["SELECT","INSERT","UPDATE","DELETE"]){
    const grant=await db.query<{allowed:boolean}>(`SELECT has_table_privilege($1,$2,$3) AS allowed`,[role,`public.${table}`,op]);
    expect(grant.rows[0].allowed).toBe(false);
   }
  } finally { await db.close(); }
 },15000);
});
