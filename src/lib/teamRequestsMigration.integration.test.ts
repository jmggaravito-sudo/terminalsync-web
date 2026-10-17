import {readFileSync} from "node:fs"; import {join} from "node:path"; import {describe,expect,it} from "vitest"; import {PGlite} from "@electric-sql/pglite";
const sql=readFileSync(join(process.cwd(),"supabase/migrations/0043_team_metadata_requests.sql"),"utf8");
const owner="00000000-0000-0000-0000-000000000001",member="00000000-0000-0000-0000-000000000002",outsider="00000000-0000-0000-0000-000000000003",hash="a".repeat(64);
describe("Team metadata request migration 0043",()=>it("executes, enforces accepted-invite entitlement and owner-only terminal approval without access grants",async()=>{
 const db=new PGlite(); try {
  await db.exec(`CREATE ROLE anon;CREATE ROLE authenticated;CREATE ROLE service_role;CREATE SCHEMA auth;CREATE TABLE auth.users(id uuid primary key);INSERT INTO auth.users VALUES('${owner}'),('${member}'),('${outsider}');
   CREATE TABLE public.elig(user_id uuid primary key,eligible boolean);INSERT INTO public.elig VALUES('${owner}',true),('${member}',true),('${outsider}',true);
   CREATE FUNCTION public.get_team_entitlement(p_user_id uuid) RETURNS TABLE(eligible boolean) LANGUAGE sql STABLE AS $$SELECT eligible FROM public.elig WHERE user_id=p_user_id$$;
   CREATE TABLE public.team_shared_spaces(id uuid primary key default gen_random_uuid(),owner_user_id uuid not null,name text not null);
   CREATE TABLE public.team_space_invitations(id uuid primary key default gen_random_uuid(),space_id uuid,inviter_user_id uuid,invitee_user_id uuid,status text);
   CREATE TABLE public.team_space_requests(id uuid primary key default gen_random_uuid(),space_id uuid not null references public.team_shared_spaces(id),requester_user_id uuid not null,status text not null default 'pending',manifest_hash text,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),unique(space_id,requester_user_id));
   INSERT INTO public.team_shared_spaces(owner_user_id,name) VALUES('${owner}','Private');
   INSERT INTO public.team_space_invitations(space_id,inviter_user_id,invitee_user_id,status) SELECT id,'${owner}','${member}','accepted' FROM public.team_shared_spaces;`);
  await db.exec(sql);
  const sid=(await db.query<{id:string}>(`SELECT id FROM public.team_shared_spaces`)).rows[0].id;
  await db.query(`UPDATE public.team_space_invitations SET inviter_user_id=$1`,[outsider]);
  expect((await db.query(`SELECT * FROM public.create_team_space_request($1,$2,'document',$3,'{}')`,[member,sid,hash])).rows).toHaveLength(0);
  await db.query(`UPDATE public.team_space_invitations SET inviter_user_id=$1`,[owner]);
  const concurrent=await Promise.all([1,2].map(()=>db.query<{status:string;request_kind:string;manifest_hash:string}>(`SELECT * FROM public.create_team_space_request($1,$2,'document',$3,'{"label":"Annual index"}')`,[member,sid,hash])));
  expect(concurrent.map(x=>x.rows[0])).toEqual([expect.objectContaining({status:"pending",request_kind:"document",manifest_hash:hash}),expect.objectContaining({status:"pending",request_kind:"document",manifest_hash:hash})]);
  expect((await db.query(`SELECT * FROM public.create_team_space_request($1,$2,'document',$3,'{"label":"Annual index"}')`,[member,sid,hash])).rows).toHaveLength(1);
  await expect(db.query(`SELECT * FROM public.create_team_space_request($1,$2,'document',$3,'{"label":"Different index"}')`,[member,sid,hash])).rejects.toThrow();
  for (const invalid of ['{"itemCount":-1}','{"itemCount":1.5}','{"itemCount":1000001}']) await expect(db.query(`SELECT * FROM public.create_team_space_request($1,$2,'document',$3,$4::jsonb)`,[member,sid,hash,invalid])).rejects.toThrow();
  expect((await db.query(`SELECT * FROM public.create_team_space_request($1,$2,'context',$3,'{}')`,[outsider,sid,hash])).rows).toHaveLength(0);
  const rid=(await db.query<{id:string}>(`SELECT id FROM public.team_space_requests`)).rows[0].id;
  expect((await db.query(`SELECT * FROM public.respond_team_space_request($1,$2,true)`,[member,rid])).rows).toHaveLength(0);
  await db.query(`UPDATE public.elig SET eligible=false WHERE user_id=$1`,[member]);
  expect((await db.query(`SELECT * FROM public.respond_team_space_request($1,$2,true)`,[owner,rid])).rows).toHaveLength(0);
  await db.query(`UPDATE public.elig SET eligible=true WHERE user_id=$1`,[member]);
  expect((await db.query<{status:string}>(`SELECT * FROM public.respond_team_space_request($1,$2,true)`,[owner,rid])).rows[0].status).toBe("accepted");
  expect((await db.query<{status:string}>(`SELECT * FROM public.respond_team_space_request($1,$2,true)`,[owner,rid])).rows[0].status).toBe("accepted");
  await expect(db.query(`SELECT * FROM public.respond_team_space_request($1,$2,false)`,[owner,rid])).rejects.toThrow();
  expect((await db.query<{n:number}>(`SELECT count(*)::int n FROM information_schema.columns WHERE table_name='team_space_requests' AND column_name IN ('content','payload','ciphertext','decrypted_content')`)).rows[0].n).toBe(0);
  for (const op of ["SELECT","INSERT","UPDATE","DELETE"]) expect((await db.query<{x:boolean}>(`SELECT has_table_privilege('authenticated','public.team_space_requests',$1) AS x`,[op])).rows[0].x).toBe(false);
  expect((await db.query<{x:boolean}>(`SELECT has_function_privilege('authenticated','public.respond_team_space_request(uuid,uuid,boolean)','EXECUTE') AS x`)).rows[0].x).toBe(false);
 } finally {await db.close();}
},15000));
