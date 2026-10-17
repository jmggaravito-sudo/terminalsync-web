import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";

const root=process.cwd(), owner="11111111-1111-4111-8111-111111111111";
const migrations=["0038_team_stripe_billing.sql","0049_team_checkout_intents.sql","0050_team_checkout_intent_single_active_guard.sql","0051_team_checkout_atomic_billing_lifecycle.sql"];
async function dbFixture(){
 const db=new PGlite(); await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role; CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid primary key); INSERT INTO auth.users VALUES('${owner}');
 CREATE TABLE public.team_memberships(user_id uuid,status text,source text,starts_at timestamptz,expires_at timestamptz);
 CREATE TABLE public.team_trial_entitlements(user_id uuid,starts_at timestamptz,expires_at timestamptz);
 CREATE TABLE public.team_paid_roster_members(owner_user_id uuid,employee_user_id uuid,created_at timestamptz default now());`);
 for(const f of migrations) await db.exec(readFileSync(join(root,"supabase/migrations",f),"utf8")); return db;
}
describe("Team checkout atomic lifecycle migration 0051",()=>{
 it("keeps session pending, blocks unsafe duplicate owners, rejects direct completion and only releases exact expiration",async()=>{
  const db=await dbFixture(); try {
   const reserve=async(req:string)=>(await db.query<any>(`select * from public.reserve_team_checkout_intent($1::uuid,$2::uuid,'price_abc',3,'subscription')`,[owner,req])).rows[0];
   const a=await reserve("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa");
   await db.query<any>(`select public.bind_team_checkout_session($1::uuid,$2,'cs_a')`,[a.id,a.idempotency_key]);
   await db.query<any>(`select public.mark_team_checkout_session_pending($1::uuid,'cs_a')`,[a.id]);
   await expect(reserve("bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb")).rejects.toThrow(/already in flight/);
   await expect(db.query<any>(`select public.reconcile_team_checkout_intent($1::uuid,$2::uuid,'price_abc',3,'subscription',$3,'cs_a','sub_a','completed')`,[a.id,owner,a.idempotency_key])).rejects.toThrow(/requires verified billing ledger/);
   await expect(db.query<any>(`select public.release_team_checkout_expired_session($1::uuid,'cs_wrong')`,[a.id])).rejects.toThrow(/session mismatch/);
   await db.query<any>(`select public.mark_team_checkout_async_failed($1::uuid,'cs_a')`,[a.id]);
   await expect(reserve("bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb")).rejects.toThrow(/already in flight/);
   expect((await db.query<any>(`select public.release_team_checkout_expired_session($1::uuid,'cs_a') as s`,[a.id])).rows[0].s).toBe("expired");
   expect((await db.query<any>(`select public.reconcile_team_checkout_intent($1::uuid,$2::uuid,'price_abc',3,'subscription',$3,'cs_a',null,'expired')`,[a.id,owner,a.idempotency_key])).rows[0].reconcile_team_checkout_intent).toBe("expired");
   await expect(db.query<any>(`select public.release_team_checkout_expired_session($1::uuid,'cs_other')`,[a.id])).rejects.toThrow(/session mismatch/);
   const b=await reserve("cccccccc-cccc-4ccc-8ccc-cccccccccccc"); expect(b.state).toBe("reserved");
   for(const status of ["incomplete","past_due","unpaid","paused","reconciliation_required"]){
    await db.exec(`delete from public.team_checkout_intents; delete from public.team_billing_subscriptions;`);
    await db.query<any>(`insert into public.team_billing_subscriptions(stripe_subscription_id,user_id,stripe_customer_id,stripe_price_id,seat_count,status,latest_event_id,latest_event_created_at) values($1,$2,'cus','price_abc',3,$3,'evt',now())`,[`sub_${status}`,owner,status]);
    await expect(reserve(`dddddddd-dddd-4ddd-8ddd-${status==='incomplete'?'dddddddddddd':status==='past_due'?'eeeeeeeeeeee':status==='unpaid'?'ffffffffffff':status==='paused'?'aaaaaaaaaaaa':'bbbbbbbbbbbb'}`)).rejects.toThrow(/nonterminal paid Team subscription/);
   }
  } finally {await db.close();}
 },20000);
 it("applies and reads back the exact ledger before completion; conflicts roll back and RPCs are private",async()=>{
  const db=await dbFixture(); try{
   const intent=(await db.query<any>(`select * from public.reserve_team_checkout_intent($1::uuid,$2::uuid,'price_abc',3,'subscription')`,[owner,"eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee"])).rows[0] as any;
   await db.query<any>(`select public.bind_team_checkout_session($1::uuid,$2,'cs_exact')`,[intent.id,intent.idempotency_key]);
   const m={team_checkout_intent_id:intent.id,team_checkout_session_id:"cs_exact",team_checkout_owner_user_id:owner,team_checkout_request_id:intent.request_id,team_checkout_price_id:"price_abc",team_checkout_seats:"3",team_checkout_mode:"subscription",team_checkout_idempotency_key:intent.idempotency_key,team_checkout_customer_id:"cus_exact",team_checkout_subscription_id:"sub_exact"};
   const f=`select public.apply_team_checkout_billing_and_finalize($1::uuid,$2,$3::uuid,$4,$5,$6,$7,$8,$9::timestamptz,$10::timestamptz,$11,$12,$13,$14::timestamptz,$15::jsonb) as state`;
   const args=[intent.id,"cs_exact",owner,"cus_exact","sub_exact","price_abc",3,"active",null,null,false,"evt_exact","customer.subscription.created","2026-01-01T00:00:00Z",JSON.stringify(m)];
   await expect(db.query<any>(f,[...args.slice(0,14),JSON.stringify({...m,team_checkout_session_id:"cs_wrong"})])).rejects.toThrow(/does not match/);
   expect((await db.query<any>(`select count(*)::int n from public.team_billing_processed_events`)).rows[0].n).toBe(0);
   expect((await db.query<any>(f,args)).rows[0].state).toBe("completed");
   await db.query<any>(`update public.team_billing_subscriptions set latest_event_id='evt_later',latest_event_created_at='2026-01-02T00:00:00Z' where stripe_subscription_id='sub_exact'`);
   expect((await db.query<any>(f,args)).rows[0].state).toBe("completed");
   expect((await db.query<any>(`select billing_sync_status from public.team_checkout_intents where id=$1`,[intent.id])).rows[0].billing_sync_status).toBe("applied");
   expect((await db.query<any>(`select count(*)::int n from public.team_memberships`)).rows[0].n).toBe(0);
   expect((await db.query<any>(`select count(*)::int n from public.team_paid_roster_members`)).rows[0].n).toBe(0);
   await db.exec("SET ROLE authenticated");
   await expect(db.query<any>(f,args)).rejects.toThrow(/permission denied/);
   await expect(db.query<any>(`select public.mark_team_checkout_async_failed($1::uuid,'cs_exact')`,[intent.id])).rejects.toThrow(/permission denied/);
  }finally{await db.close();}
 },20000);
});
