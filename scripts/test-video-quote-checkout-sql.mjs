// Synthetic PGlite migration test only: no network, provider, users, or money.
import { PGlite } from '@electric-sql/pglite';
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url)).replace(/\/$/,'');
const db=new PGlite();
const q=async(sql,args=[]) => (await db.query(sql,args)).rows;
const a='11111111-1111-4111-8111-111111111111';
const hash='a'.repeat(64), quote='provider:quote/opaque_1';
await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role; CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid primary key); CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$SELECT NULL::uuid$$; INSERT INTO auth.users VALUES('${a}');`);
for (const migration of ['0027_ai_credits.sql','0034_video_exclusive_funding.sql','0035_video_exclusive_checkout_intents.sql','0036_video_quote_checkout_forward_only.sql']) await db.exec(readFileSync(`${root}/supabase/migrations/${migration}`,'utf8'));
await db.exec("UPDATE video_funding_private.video_funding_settings SET enabled=true,destination='synthetic-ledger'; INSERT INTO video_funding_private.video_funding_issuers(issuer_id,enabled) VALUES('test-source',true);");
const reserve=async(amount=60,h=hash)=>(await q('SELECT public.reserve_video_exclusive_checkout($1::uuid,$2,$3,$4::int,$5,$6) AS intent',[a,quote,h,amount,'test-source','synthetic-ledger']))[0].intent;
const meta=(amount=60,h=hash)=>({source:'terminalsync_credits',credit_funding_purpose:'video-exclusive',supabase_user_id:a,video_exclusive_checkout_quote_id:quote,video_exclusive_checkout_request_hash:h,video_funding_issuer_id:'test-source',video_funding_destination:'synthetic-ledger',credit_amount_cents:String(amount),credit_amount_micros:String(amount*10000),rail:'stripe'});
const intent=await reserve();
assert.equal(intent.status,'create'); assert.match(intent.idempotencyKey,/^video-quote:[a-f0-9]{32}$/);
await assert.rejects(reserve(49),/invalid quote checkout terms/);
await assert.rejects(reserve(60,'b'.repeat(64)),/replay terms differ/);
await assert.rejects(reserve(60,'not-a-hash'),/invalid quote checkout terms/);
assert.equal((await q('SELECT public.complete_video_exclusive_checkout($1::uuid,$2,$3,$4,$5,$6) AS ok',[a,quote,hash,intent.idempotencyKey,'cs_quote','https://checkout.stripe.test/quote']))[0].ok,true);
assert.equal((await q('SELECT public.reconcile_video_exclusive_checkout($1::uuid,$2,$3,$4,$5,$6,$7,$8::int,$9::bigint,$10,$11,$12::boolean,$13,$14::jsonb) AS ok',[a,quote,hash,'cs_quote','https://checkout.stripe.test/quote','test-source','synthetic-ledger',60,600000,'usd','payment',true,'paid',JSON.stringify(meta())]))[0].ok,true);
const receipt=(await q('SELECT public.allocate_video_exclusive_funding_pinned(true,true,$1,$2,$3::uuid,$4,$5,$6,$7,$8,$9,$10,$11::bigint) AS receipt',['evt_quote','pi_quote',a,'test-source','synthetic-ledger',quote,hash,'cs_quote','video-exclusive','USD',600000]))[0].receipt;
assert.equal(receipt.amountMicros,600000); assert.equal(receipt.destination,'synthetic-ledger');
assert.equal((await q('SELECT count(*)::int AS n FROM video_funding_private.video_funding_outbox'))[0].n,1);
await db.exec('SET ROLE authenticated');
try { await assert.rejects(q('SELECT public.reserve_video_exclusive_checkout($1::uuid,$2,$3,60,$4,$5)',[a,quote,hash,'test-source','synthetic-ledger']),/permission denied/); } finally { await db.exec('RESET ROLE'); }
await db.close(); console.log('PASS video quote checkout forward-only PGlite migration');
