// Synthetic SQL execution only. No network, real users, balances or provider calls.
import { PGlite } from '@electric-sql/pglite';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const root=fileURLToPath(new URL('../',import.meta.url)).replace(/\/$/,'');
const sql=readFileSync(root+'/supabase/migrations/0033_video_exclusive_funding.sql','utf8');
const sql34=readFileSync(root+'/supabase/migrations/0034_video_exclusive_checkout_intents.sql','utf8');
console.log('SQL SHA256 0033',createHash('sha256').update(sql).digest('hex'));
console.log('SQL SHA256 0034',createHash('sha256').update(sql34).digest('hex'));
const db=new PGlite();let fails=0;
const test=async(name,f)=>{try{await f();console.log('PASS',name)}catch(e){fails++;console.log('FAIL',name,e.message)}};
const a='11111111-1111-4111-8111-111111111111';
const b='22222222-2222-4222-8222-222222222222';
await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role; CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid primary key); CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$SELECT NULL::uuid$$; INSERT INTO auth.users VALUES('${a}'),('${b}'); CREATE SCHEMA private; CREATE TABLE private.unrelated(id int); GRANT SELECT ON private.unrelated TO service_role;`);
await db.exec(readFileSync(root+'/supabase/migrations/0027_ai_credits.sql','utf8'));
await db.exec(sql);
await db.exec(sql34);
const q=async(s,p=[]) => (await db.query(s,p)).rows;
const alloc=async(payment='pi_one',event='evt_one',amount=300000,account=a,issuer='test-source') => (await q('SELECT public.allocate_video_exclusive_funding(true,true,$1,$2,$3::uuid,$4,$5,$6,$7::bigint) AS receipt',[event,payment,account,issuer,'video-exclusive','USD',amount]))[0].receipt;
const grant=async(payment='pi_one',amount=300000,account=a,key='general-one')=>(await q("SELECT public.grant_ai_credits($1::uuid,$2::bigint,'stripe',$3,'cs_synthetic',$4,'{}'::jsonb) AS balance",[account,amount,payment,key]))[0].balance;
await test('unrelated private privilege survives',async()=>assert.equal((await q("SELECT has_table_privilege('service_role','private.unrelated','SELECT') AS ok"))[0].ok,true));
await test('default disabled',async()=>await assert.rejects(alloc(),/disabled/));
const reserve=async(account=a,request='33333333-3333-4333-8333-333333333333',amount=1000,issuer='test-source',destination='synthetic-ledger')=>(await q('SELECT public.reserve_video_exclusive_checkout($1::uuid,$2::uuid,$3::int,$4,$5) AS intent',[account,request,amount,issuer,destination]))[0].intent;
await test('checkout intent cannot be reserved while authority is disabled',async()=>await assert.rejects(reserve(),/disabled/));
const settings=await q("SELECT column_name FROM information_schema.columns WHERE table_schema='video_funding_private' AND table_name='video_funding_settings'");
await db.exec(`UPDATE video_funding_private.video_funding_settings SET enabled=true${settings.some(x=>x.column_name==='destination')?", destination='synthetic-ledger'":''}; INSERT INTO video_funding_private.video_funding_issuers(issuer_id,enabled) VALUES('test-source',true),('other-source',true);`);
await test('issuer IDs reject whitespace and overlong consumer-incompatible values',async()=>{
 await assert.rejects(db.exec("INSERT INTO video_funding_private.video_funding_issuers(issuer_id) VALUES('bad source')"));
 await assert.rejects(db.exec(`INSERT INTO video_funding_private.video_funding_issuers(issuer_id) VALUES('${'x'.repeat(129)}')`));
});
await test('configured destination rejects consumer-incompatible values',async()=>{
 await assert.rejects(db.exec("UPDATE video_funding_private.video_funding_settings SET destination='bad destination'"));
 await assert.rejects(db.exec(`UPDATE video_funding_private.video_funding_settings SET destination='${'x'.repeat(129)}'`));
});
await test('allocation RPC validates issuer ID before insert',async()=>await assert.rejects(alloc('pi_bad_issuer','evt_bad_issuer',300000,a,'bad issuer'),/invalid exclusive funding terms/));
let checkoutIntent;
const checkoutRequest='33333333-3333-4333-8333-333333333333';
await test('first checkout intent pins verified server terms before Stripe',async()=>{
 checkoutIntent=await reserve(a,checkoutRequest,1000,'test-source','synthetic-ledger');
 assert.equal(checkoutIntent.status,'create');
 assert.match(checkoutIntent.idempotencyKey,/^video-exclusive:[a-f0-9]{32}$/);
});
await test('same request while provider outcome is unresolved never creates again',async()=>assert.deepEqual(await reserve(a,checkoutRequest),{status:'reconcile_required'}));
await test('checkout request cannot mutate package/issuer/destination terms',async()=>{
 await assert.rejects(reserve(a,checkoutRequest,2000,'test-source','synthetic-ledger'),/terms differ/);
 await assert.rejects(reserve(a,checkoutRequest,1000,'other-source','synthetic-ledger'),/terms differ/);
 await assert.rejects(reserve(a,checkoutRequest,1000,'test-source','other-ledger'),/authority|pin differs/);
});
await test('changing SQL authority after reservation cannot reroute the pinned intent',async()=>{
 await db.exec("UPDATE video_funding_private.video_funding_settings SET destination='changed-ledger'");
 await assert.rejects(reserve(a,checkoutRequest,1000,'test-source','synthetic-ledger'),/pin differs/);
 await assert.rejects(reserve(a,checkoutRequest,1000,'test-source','changed-ledger'),/terms differ/);
 assert.equal((await q('SELECT destination FROM video_funding_private.video_exclusive_checkout_intents WHERE account_id=$1::uuid AND request_id=$2::uuid',[a,checkoutRequest]))[0].destination,'synthetic-ledger');
 await db.exec("UPDATE video_funding_private.video_funding_settings SET destination='synthetic-ledger'");
});
await test('completed intent replay returns exact stored session after provider TTL',async()=>{
 assert.equal((await q('SELECT public.complete_video_exclusive_checkout($1::uuid,$2::uuid,$3,$4,$5) AS ok',[a,checkoutRequest,checkoutIntent.idempotencyKey,'cs_durable','https://checkout.stripe.test/durable']))[0].ok,true);
 assert.deepEqual(await reserve(a,checkoutRequest),{status:'created',checkoutId:'cs_durable',url:'https://checkout.stripe.test/durable'});
 assert.equal((await q('SELECT count(*)::int AS n FROM video_funding_private.video_exclusive_checkout_intents WHERE account_id=$1::uuid AND request_id=$2::uuid',[a,checkoutRequest]))[0].n,1);
});
await test('ambiguous request stays reconcile-only even after a fresh reservation attempt',async()=>{
 const request='55555555-5555-4555-8555-555555555555';
 const intent=await reserve(b,request,2000,'test-source','synthetic-ledger');
 assert.equal((await q('SELECT public.mark_video_exclusive_checkout_ambiguous($1::uuid,$2::uuid,$3) AS ok',[b,request,intent.idempotencyKey]))[0].ok,true);
 assert.deepEqual(await reserve(b,request,2000,'test-source','synthetic-ledger'),{status:'reconcile_required'});
});
await test('pinned webhook allocation requires matching durable intent and SQL destination',async()=>{
 await db.exec('BEGIN');
 try {
  const request='66666666-6666-4666-8666-666666666666';
  const intent=await reserve(a,request,1000,'test-source','synthetic-ledger');
  await q('SELECT public.complete_video_exclusive_checkout($1::uuid,$2::uuid,$3,$4,$5)',[a,request,intent.idempotencyKey,'cs_pinned','https://checkout.stripe.test/pinned']);
  const args=[true,true,'evt_pinned','pi_pinned',a,'test-source','synthetic-ledger',request,'cs_pinned','video-exclusive','USD',10000000];
  await db.exec('SAVEPOINT wrong_destination');
  await assert.rejects(q('SELECT public.allocate_video_exclusive_funding_pinned($1,$2,$3,$4,$5::uuid,$6,$7,$8::uuid,$9,$10,$11,$12::bigint)',[...args.slice(0,6),'wrong-ledger',...args.slice(7)]),/destination pin/);
  await db.exec('ROLLBACK TO SAVEPOINT wrong_destination');
  await db.exec('SAVEPOINT wrong_session');
  await assert.rejects(q('SELECT public.allocate_video_exclusive_funding_pinned($1,$2,$3,$4,$5::uuid,$6,$7,$8::uuid,$9,$10,$11,$12::bigint)',[...args.slice(0,8),'cs_other',...args.slice(9)]),/durable intent/);
  await db.exec('ROLLBACK TO SAVEPOINT wrong_session');
  const pinned=(await q('SELECT public.allocate_video_exclusive_funding_pinned($1,$2,$3,$4,$5::uuid,$6,$7,$8::uuid,$9,$10,$11,$12::bigint) AS receipt',args))[0].receipt;
  assert.equal(pinned.destination,'synthetic-ledger');
 } finally { await db.exec('ROLLBACK'); }
});
let receipt;
await test('new exclusive allocation',async()=>{receipt=await alloc();assert.equal(receipt.state,'committed_exclusive');assert.equal(receipt.amountMicros,300000)});
await test('receipt strict wire currency and destination',async()=>{assert.deepEqual(Object.keys(receipt).sort(),['version','accountId','allocationId','issuerId','destination','currency','amountMicros','state'].sort());assert.equal(receipt.currency,'USD');assert.equal(receipt.destination,'synthetic-ledger')});
await test('allocation table rejects invalid destination even on direct privileged insert',async()=>{
 await assert.rejects(db.exec(`INSERT INTO video_funding_private.video_funding_allocations(rail,provider_payment_id,source_event_id,account_id,issuer_id,purpose,destination,currency,amount_micros) VALUES('stripe','pi_bad_destination','evt_bad_destination','${a}','test-source','video-exclusive','bad destination','USD',1)`));
});
await test('same-payment replay same receipt',async()=>assert.deepEqual(await alloc(),receipt));
await test('different event same payment same receipt',async()=>assert.deepEqual(await alloc('pi_one','evt_two'),receipt));
await test('changed amount rejected',async()=>await assert.rejects(alloc('pi_one','evt_one',400000)));
await test('changed issuer rejected',async()=>await assert.rejects(alloc('pi_one','evt_one',300000,a,'other-source')));
await test('cross account rejected',async()=>await assert.rejects(alloc('pi_one','evt_one',300000,b)));
await test('exclusive cannot also grant general',async()=>await assert.rejects(grant()));
await test('general grant works',async()=>assert.equal(Number(await grant('pi_general',500000,a,'general-two')),500000));
await test('general cannot also allocate video',async()=>await assert.rejects(alloc('pi_general','evt_general',500000)));
await test('one outbox for one allocation',async()=>assert.equal((await q('SELECT count(*)::int AS n FROM video_funding_private.video_funding_outbox'))[0].n,1));
await test('unsafe JS integer rejected',async()=>await assert.rejects(alloc('pi_large','evt_large','9007199254740992')));
await test('authenticated cannot allocate',async()=>{await db.exec('SET ROLE authenticated');try{await assert.rejects(alloc('pi_denied','evt_denied'),/permission denied/)}finally{await db.exec('RESET ROLE')}});
await test('read receipt is exact while funding is paused',async()=>{
 await db.exec('UPDATE video_funding_private.video_funding_settings SET enabled=false');
 const rows=await q('SELECT public.get_video_exclusive_funding($1::uuid,$2::uuid,$3) AS receipt',[a,receipt.allocationId,'synthetic-ledger']);
 assert.deepEqual(rows[0].receipt,receipt);
});
await test('read wrong account or namespace returns null',async()=>{
 for(const [account,destination] of [[b,'synthetic-ledger'],[a,'different-ledger']])
  assert.equal((await q('SELECT public.get_video_exclusive_funding($1::uuid,$2::uuid,$3) AS receipt',[account,receipt.allocationId,destination]))[0].receipt,null);
});
await test('anonymous and signed-in cannot read funding RPC',async()=>{
 for(const role of ['anon','authenticated']){
  await db.exec('SET ROLE '+role);
  try{
   await assert.rejects(q('SELECT public.get_video_exclusive_funding($1::uuid,$2::uuid,$3)',[a,receipt.allocationId,'synthetic-ledger']),/permission denied/);
   await assert.rejects(q('SELECT * FROM public.claim_video_funding_outbox($1,1,30)',['synthetic-ledger']),/permission denied/);
   await assert.rejects(q('SELECT public.ack_video_funding_outbox($1::uuid,$2::uuid,$3,$4::uuid)',[a,receipt.allocationId,'synthetic-ledger','44444444-4444-4444-8444-444444444444']),/permission denied/);
   await assert.rejects(q('SELECT public.reserve_video_exclusive_checkout($1::uuid,$2::uuid,1000,$3,$4)',[a,'77777777-7777-4777-8777-777777777777','test-source','synthetic-ledger']),/permission denied/);
   await assert.rejects(q('SELECT public.complete_video_exclusive_checkout($1::uuid,$2::uuid,$3,$4,$5)',[a,'33333333-3333-4333-8333-333333333333','key','cs_fake','https://checkout.stripe.test/fake']),/permission denied/);
   await assert.rejects(q('SELECT public.mark_video_exclusive_checkout_ambiguous($1::uuid,$2::uuid,$3)',[a,'33333333-3333-4333-8333-333333333333','key']),/permission denied/);
   await assert.rejects(q('SELECT public.allocate_video_exclusive_funding_pinned(true,true,$1,$2,$3::uuid,$4,$5,$6::uuid,$7,$8,$9,$10::bigint)',[
    'evt_denied','pi_denied',a,'test-source','synthetic-ledger','33333333-3333-4333-8333-333333333333','cs_fake','video-exclusive','USD',10000000
   ]),/permission denied/);
  }finally{await db.exec('RESET ROLE')}
 }
});
await test('service role can read immutable receipt',async()=>{
 await db.exec('SET ROLE service_role');
 try{assert.deepEqual((await q('SELECT public.get_video_exclusive_funding($1::uuid,$2::uuid,$3) AS receipt',[a,receipt.allocationId,'synthetic-ledger']))[0].receipt,receipt)}finally{await db.exec('RESET ROLE')}
});
await test('service role alone can reserve a server-owned checkout intent',async()=>{
 await db.exec('UPDATE video_funding_private.video_funding_settings SET enabled=true');
 await db.exec('SET ROLE service_role');
 try{
  const intent=await reserve(a,'77777777-7777-4777-8777-777777777777',1000,'test-source','synthetic-ledger');
  assert.equal(intent.status,'create');
  assert.equal((await q("SELECT has_table_privilege('service_role','video_funding_private.video_exclusive_checkout_intents','SELECT') AS ok"))[0].ok,false);
 }finally{await db.exec('RESET ROLE');await db.exec('UPDATE video_funding_private.video_funding_settings SET enabled=false')}
});
let firstClaim, secondClaim;
await test('outbox delivery remains disabled by default',async()=>{
 assert.equal((await q('SELECT * FROM public.claim_video_funding_outbox($1,1,30)',['synthetic-ledger'])).length,0);
 await assert.rejects(q('SELECT * FROM public.claim_video_funding_outbox($1,101,30)',['synthetic-ledger']),/invalid outbox claim arguments/);
});
await db.exec('UPDATE video_funding_private.video_funding_settings SET outbox_delivery_enabled=true');
await test('service role claims only the configured destination with the same receipt',async()=>{
 await db.exec('SET ROLE service_role');
 try{
  const rows=await q('SELECT * FROM public.claim_video_funding_outbox($1,1,30)',['synthetic-ledger']);
  assert.equal(rows.length,1); firstClaim=rows[0];
  assert.equal(firstClaim.allocationId,receipt.allocationId);
  assert.equal(firstClaim.accountId,a); assert.equal(firstClaim.destination,'synthetic-ledger');
  assert.deepEqual(firstClaim.receipt,receipt); assert.ok(firstClaim.claimToken);
 }finally{await db.exec('RESET ROLE')}
});
await test('ack rejects account/destination mismatch without delivering',async()=>{
 for(const [account,destination] of [[b,'synthetic-ledger'],[a,'wrong-ledger']])
  assert.equal((await q('SELECT public.ack_video_funding_outbox($1::uuid,$2::uuid,$3,$4::uuid) AS ok',[account,firstClaim.allocationId,destination,firstClaim.claimToken]))[0].ok,false);
 assert.equal((await q('SELECT delivered_at FROM video_funding_private.video_funding_outbox WHERE allocation_id=$1::uuid',[firstClaim.allocationId]))[0].delivered_at,null);
});
await db.exec(`UPDATE video_funding_private.video_funding_outbox SET lease_expires_at=clock_timestamp()-interval '1 second' WHERE allocation_id='${receipt.allocationId}'`);
await test('expired lease reclaims same allocation with a fresh fencing token',async()=>{
 await db.exec('SET ROLE service_role');
 try{
  const rows=await q('SELECT * FROM public.claim_video_funding_outbox($1,1,30)',['synthetic-ledger']);
  assert.equal(rows.length,1); secondClaim=rows[0];
  assert.equal(secondClaim.allocationId,firstClaim.allocationId);
  assert.deepEqual(secondClaim.receipt,firstClaim.receipt);
  assert.notEqual(secondClaim.claimToken,firstClaim.claimToken);
 }finally{await db.exec('RESET ROLE')}
});
await test('stale lease cannot ack a re-claimed allocation',async()=>{
 assert.equal((await q('SELECT public.ack_video_funding_outbox($1::uuid,$2::uuid,$3,$4::uuid) AS ok',[a,firstClaim.allocationId,'synthetic-ledger',firstClaim.claimToken]))[0].ok,false);
});
await test('ack is idempotent only for delivered lease identity',async()=>{
 await db.exec('SET ROLE service_role');
 try{
  assert.equal((await q('SELECT public.ack_video_funding_outbox($1::uuid,$2::uuid,$3,$4::uuid) AS ok',[a,secondClaim.allocationId,'synthetic-ledger',secondClaim.claimToken]))[0].ok,true);
  assert.equal((await q('SELECT public.ack_video_funding_outbox($1::uuid,$2::uuid,$3,$4::uuid) AS ok',[a,secondClaim.allocationId,'synthetic-ledger',secondClaim.claimToken]))[0].ok,true);
  assert.equal((await q('SELECT public.ack_video_funding_outbox($1::uuid,$2::uuid,$3,$4::uuid) AS ok',[a,secondClaim.allocationId,'synthetic-ledger',firstClaim.claimToken]))[0].ok,false);
 }finally{await db.exec('RESET ROLE')}
});
await test('delivery timeout and ack never change or reassign credit balances',async()=>{
 assert.equal(Number((await q('SELECT balance_micros FROM public.ai_credit_accounts WHERE user_id=$1::uuid',[a]))[0].balance_micros),500000);
 assert.equal((await q('SELECT attempts FROM video_funding_private.video_funding_outbox WHERE allocation_id=$1::uuid',[receipt.allocationId]))[0].attempts,2);
 assert.equal((await q('SELECT * FROM public.claim_video_funding_outbox($1,1,30)',['synthetic-ledger'])).length,0);
});
await test('final balances conserve one general grant and one exclusive allocation',async()=>{
 assert.equal(Number((await q('SELECT balance_micros FROM public.ai_credit_accounts WHERE user_id=$1::uuid',[a]))[0].balance_micros),500000);
 assert.equal((await q('SELECT count(*)::int AS n FROM video_funding_private.video_funding_outbox'))[0].n,1);
 assert.equal((await q('SELECT count(*)::int AS n FROM video_funding_private.video_funding_allocations'))[0].n,1);
});
await db.close();console.log('LIMIT: embedded single-session Postgres; no concurrent-process lock certification, no provider/real money.');process.exitCode=fails?1:0;
