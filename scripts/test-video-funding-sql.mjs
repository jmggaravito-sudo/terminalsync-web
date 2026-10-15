// Synthetic SQL execution only. No network, real users, balances or provider calls.
import { PGlite } from '@electric-sql/pglite';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const root=fileURLToPath(new URL('../',import.meta.url)).replace(/\/$/,'');
const sql=readFileSync(root+'/supabase/migrations/0033_video_exclusive_funding.sql','utf8');
console.log('SQL SHA256',createHash('sha256').update(sql).digest('hex'));
const db=new PGlite();let fails=0;
const test=async(name,f)=>{try{await f();console.log('PASS',name)}catch(e){fails++;console.log('FAIL',name,e.message)}};
const a='11111111-1111-4111-8111-111111111111';
const b='22222222-2222-4222-8222-222222222222';
await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role; CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid primary key); CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$SELECT NULL::uuid$$; INSERT INTO auth.users VALUES('${a}'),('${b}'); CREATE SCHEMA private; CREATE TABLE private.unrelated(id int); GRANT SELECT ON private.unrelated TO service_role;`);
await db.exec(readFileSync(root+'/supabase/migrations/0027_ai_credits.sql','utf8'));
await db.exec(sql);
const q=async(s,p=[]) => (await db.query(s,p)).rows;
const alloc=async(payment='pi_one',event='evt_one',amount=300000,account=a,issuer='test-source') => (await q('SELECT public.allocate_video_exclusive_funding(true,true,$1,$2,$3::uuid,$4,$5,$6,$7::bigint) AS receipt',[event,payment,account,issuer,'video-exclusive','USD',amount]))[0].receipt;
const grant=async(payment='pi_one',amount=300000,account=a,key='general-one')=>(await q("SELECT public.grant_ai_credits($1::uuid,$2::bigint,'stripe',$3,'cs_synthetic',$4,'{}'::jsonb) AS balance",[account,amount,payment,key]))[0].balance;
await test('unrelated private privilege survives',async()=>assert.equal((await q("SELECT has_table_privilege('service_role','private.unrelated','SELECT') AS ok"))[0].ok,true));
await test('default disabled',async()=>await assert.rejects(alloc(),/disabled/));
const settings=await q("SELECT column_name FROM information_schema.columns WHERE table_schema='video_funding_private' AND table_name='video_funding_settings'");
await db.exec(`UPDATE video_funding_private.video_funding_settings SET enabled=true${settings.some(x=>x.column_name==='destination')?", destination='synthetic-ledger'":''}; INSERT INTO video_funding_private.video_funding_issuers(issuer_id,enabled) VALUES('test-source',true),('other-source',true);`);
let receipt;
await test('new exclusive allocation',async()=>{receipt=await alloc();assert.equal(receipt.state,'committed_exclusive');assert.equal(receipt.amountMicros,300000)});
await test('receipt strict wire currency and destination',async()=>{assert.deepEqual(Object.keys(receipt).sort(),['version','accountId','allocationId','issuerId','destination','currency','amountMicros','state'].sort());assert.equal(receipt.currency,'USD');assert.equal(receipt.destination,'synthetic-ledger')});
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
  try{await assert.rejects(q('SELECT public.get_video_exclusive_funding($1::uuid,$2::uuid,$3)',[a,receipt.allocationId,'synthetic-ledger']),/permission denied/)}finally{await db.exec('RESET ROLE')}
 }
});
await test('service role can read immutable receipt',async()=>{
 await db.exec('SET ROLE service_role');
 try{assert.deepEqual((await q('SELECT public.get_video_exclusive_funding($1::uuid,$2::uuid,$3) AS receipt',[a,receipt.allocationId,'synthetic-ledger']))[0].receipt,receipt)}finally{await db.exec('RESET ROLE')}
});
await test('final balances conserve one general grant and one exclusive allocation',async()=>{
 assert.equal(Number((await q('SELECT balance_micros FROM public.ai_credit_accounts WHERE user_id=$1::uuid',[a]))[0].balance_micros),500000);
 assert.equal((await q('SELECT count(*)::int AS n FROM video_funding_private.video_funding_outbox'))[0].n,1);
 assert.equal((await q('SELECT count(*)::int AS n FROM video_funding_private.video_funding_allocations'))[0].n,1);
});
await db.close();console.log('LIMIT: embedded single-session Postgres; no concurrent-process lock certification, no provider/real money.');process.exitCode=fails?1:0;
