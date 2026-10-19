import {beforeEach,afterEach,describe,it,expect,vi} from 'vitest';
const m=vi.hoisted(()=>({auth:vi.fn(),sb:vi.fn(),rpc:vi.fn()}));
vi.mock('@/lib/marketplace/auth',()=>({authenticate:m.auth}));
vi.mock('@/lib/supabaseAdmin',()=>({getSupabaseAdmin:m.sb}));
import {POST} from './route';
const account='11111111-1111-4111-8111-111111111111';
const secret='isolated-test-only-not-a-real-secret-0000';
const body={event:'reserve',accountId:account,jobId:'vj_'+'a'.repeat(32),originalIdempotencyKey:'design-video:vq_'+'b'.repeat(32),modelId:'wan-2.6-text-to-video',durationSeconds:5};
const req=(data:unknown=body,key=secret)=>new Request('https://example.test/api/credits/video-evidence',{method:'POST',headers:{'x-ts-video-evidence':key,Authorization:'Bearer synthetic-user'},body:JSON.stringify(data)});
beforeEach(()=>{vi.resetAllMocks();vi.stubEnv('VIDEO_REFUND_EVIDENCE_SECRET',secret);m.sb.mockReturnValue({rpc:m.rpc});m.auth.mockResolvedValue({id:account});m.rpc.mockResolvedValue({data:true,error:null});});
afterEach(()=>vi.unstubAllEnvs());
describe('private video evidence',()=>{
 it('no configuration fails closed',async()=>{vi.stubEnv('VIDEO_REFUND_EVIDENCE_SECRET','');expect((await POST(req())).status).toBe(503);expect(m.rpc).not.toHaveBeenCalled();});
 it('ordinary authenticated client cannot attest',async()=>{expect((await POST(req({...body,event:'terminal',status:'failed',predictionId:'p'},''))).status).toBe(401);expect(m.rpc).not.toHaveBeenCalled();});
 it('invalid service credential denied',async()=>{expect((await POST(req(body,'x'.repeat(secret.length)))).status).toBe(401);});
 it('service credential alone cannot bind an owner',async()=>{m.auth.mockResolvedValue(null);expect((await POST(req())).status).toBe(401);expect(m.rpc).not.toHaveBeenCalled();});
 it('another user cannot bind a quote to account',async()=>{m.auth.mockResolvedValue({id:'22222222-2222-4222-8222-222222222222'});expect((await POST(req())).status).toBe(401);});
 it('authenticated owner plus service reserves funds at the server price',async()=>{
  m.rpc.mockResolvedValue({data:[{out_balance_micros:4000000,out_debited:true}],error:null});
  const r=await POST(req({...body,amountMicros:1,creditCostUsd:0.01,priceMicros:1}));
  expect(r.status).toBe(200);expect(await r.json()).toEqual({ok:true,applied:true,debited:true});
  expect(m.rpc).toHaveBeenCalledTimes(1);
  expect(m.rpc).toHaveBeenCalledWith('reserve_ai_video_funds',{p_user_id:account,p_key:body.originalIdempotencyKey,p_job_id:body.jobId,p_price_micros:1000000});
 });
 it('never prices from a client-supplied amount',async()=>{
  m.rpc.mockResolvedValue({data:[{out_balance_micros:0,out_debited:false}],error:null});
  await POST(req({...body,modelId:'ltx-2.3-text-to-video',durationSeconds:10,amountMicros:1,creditCostUsd:0.001}));
  expect(m.rpc).toHaveBeenCalledWith('reserve_ai_video_funds',expect.objectContaining({p_price_micros:600000}));
 });
 it('reserve is never routed through the evidence-only writer',async()=>{await POST(req());expect(m.rpc).not.toHaveBeenCalledWith('record_ai_video_evidence',expect.anything());});
 it.each([['no model',{modelId:undefined}],['no duration',{durationSeconds:undefined}],['unknown model',{modelId:'made-up'}],['unlisted duration',{durationSeconds:7}],['string duration',{durationSeconds:'5'}]])('unpriced job (%s) is refused before any money moves',async(_n,patch)=>{
  const r=await POST(req({...body,...patch}));expect(r.status).toBe(400);expect((await r.json()).error).toBe('video_not_priced');expect(m.rpc).not.toHaveBeenCalled();
 });
 it('insufficient server balance answers 402 and does not expose details',async()=>{
  m.rpc.mockResolvedValue({data:null,error:{message:'insufficient video funds'}});
  const r=await POST(req());expect(r.status).toBe(402);expect(await r.json()).toEqual({error:'insufficient_funds'});
 });
 it('app debit that is short or overdrawn answers 409 video_debit_mismatch',async()=>{
  m.rpc.mockResolvedValue({data:null,error:{message:'video debit mismatch'}});
  const r=await POST(req());expect(r.status).toBe(409);expect(await r.json()).toEqual({error:'video_debit_mismatch'});
 });
 it('replayed reserve fails closed as a conflict',async()=>{
  m.rpc.mockResolvedValue({data:null,error:{message:'video reserve already used'}});
  const r=await POST(req());expect(r.status).toBe(409);expect(await r.json()).toEqual({error:'evidence_conflict'});
 });
 it('submitted evidence still uses the evidence writer and needs no price',async()=>{
  expect((await POST(req({event:'submitted',accountId:account,jobId:body.jobId,originalIdempotencyKey:body.originalIdempotencyKey,predictionId:'p'}))).status).toBe(200);
  expect(m.rpc).toHaveBeenCalledWith('record_ai_video_evidence',expect.objectContaining({p_event:'submitted',p_prediction_id:'p'}));
 });
 it('confirmed provider terminal accepted only on private channel',async()=>{expect((await POST(req({...body,event:'terminal',status:'failed',predictionId:'p'}))).status).toBe(200);expect(m.auth).not.toHaveBeenCalled();});
 it.each(['timeout','cancelled','unknown','processing'])('does not treat %s as definitive provider failure',async status=>{expect((await POST(req({...body,event:'terminal',status,predictionId:'p'}))).status).toBe(400);expect(m.rpc).not.toHaveBeenCalled();});
 it('DB binding conflict fails closed without exposing details',async()=>{m.rpc.mockResolvedValue({error:{message:'private data'},data:null});const r=await POST(req());expect(r.status).toBe(409);expect(await r.text()).not.toContain('private data');});
});
