#!/usr/bin/env python3
"""Execute exact SQL in a NEW disposable local PostgreSQL cluster; no DSN accepted.
Set REFUND_TEST_PG_BIN to a directory with initdb/pg_ctl/postgres. No TCP listener.
"""
import concurrent.futures, hashlib, json, os, pathlib, shutil, subprocess, tempfile
root=pathlib.Path(__file__).resolve().parents[1]
env={k:v for k,v in os.environ.items() if not k.startswith('PG')}
binpath=os.environ.get('REFUND_TEST_PG_BIN')
if not binpath:
 binpath=subprocess.check_output(['pg_config','--bindir'],text=True).strip()
pg=pathlib.Path(binpath)
for binary in ['initdb','pg_ctl','postgres']:
 if not (pg/binary).is_file():raise SystemExit('Isolated PostgreSQL server binaries required: '+str(pg/binary))
a='11111111-1111-4111-8111-111111111111';b='22222222-2222-4222-8222-222222222222'
with tempfile.TemporaryDirectory(prefix='ts-refund-') as directory:
 temp=pathlib.Path(directory); cluster=temp/'data'; socket=temp/'socket';socket.mkdir()
 psql=[shutil.which('psql') or str(pg/'psql'),'-X','-v','ON_ERROR_STOP=1','-h',str(socket),'-p','56457','-U','refund_test','-d','postgres','-At']
 def q(s):
  p=subprocess.run(psql+['-c',s],env=env,text=True,capture_output=True)
  if p.returncode:raise RuntimeError(p.stderr.strip())
  return p.stdout.strip()
 def reject(s,match):
  try:q(s)
  except RuntimeError as e:assert match in str(e),str(e);return
  raise AssertionError('Unexpectedly accepted: '+s)
 def key(n):return 'design-video:vq_'+str(n).zfill(32)
 def job(n):return 'vj_'+str(n).zfill(32)
 def event(n,e,status=None,owner=a,pred=None):
  return q(f"SELECT record_ai_video_evidence('{e}','{owner}','{key(n)}','{job(n)}',{repr(pred or 'prediction_'+str(n)) if e!='reserve' else 'NULL'},{repr(status) if status else 'NULL'})")
 def charge(n,amount=300000,owner=a):return q(f"SELECT * FROM record_ai_credit_debit('{owner}',{amount},'{key(n)}','{{}}')")
 def refund(n,amount=300000,owner=a):return q(f"SELECT out_applied,out_refunded_micros FROM record_ai_credit_refund('{owner}','{key(n)}',{amount},'{{\"reason\":\"client says failed\"}}')")
 def fail(n):event(n,'reserve');event(n,'submitted');event(n,'terminal','failed')
 checks=[]
 def test(name,fn):fn();checks.append(name);print('PASS',name,flush=True)
 def eq(actual,expected):assert actual==expected,(actual,expected)
 subprocess.run([str(pg/'initdb'),'-D',str(cluster),'-A','trust','-U','refund_test','--no-locale'],env=env,check=True,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
 subprocess.run([str(pg/'pg_ctl'),'-D',str(cluster),'-l',str(temp/'server.log'),'-o',f"-c listen_addresses='' -c unix_socket_directories='{socket}' -p 56457",'-w','start'],env=env,check=True,stdout=subprocess.DEVNULL)
 try:
  q("CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role; CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid primary key); CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$SELECT NULL::uuid$$;")
  q(f"INSERT INTO auth.users VALUES('{a}'),('{b}');")
  for name in ['0027_ai_credits.sql','0033_ai_credit_debits.sql','0057_ai_credit_refunds.sql']:
   raw=(root/'supabase/migrations'/name).read_bytes();print('EXECUTED',name,'SHA256',hashlib.sha256(raw).hexdigest());q(raw.decode())
  q(f"SELECT grant_ai_credits('{a}',5000000,'stripe','synthetic-payment','synthetic-checkout','synthetic-topup','{{}}');")
  charge(1);event(1,'reserve');event(1,'submitted');event(1,'terminal','completed')
  test('completed provider job rejected',lambda:reject(f"SELECT * FROM record_ai_credit_refund('{a}','{key(1)}',300000)",'verified video failure required'))
  charge(2);event(2,'reserve');event(2,'submitted')
  test('in-flight provider job rejected',lambda:reject(f"SELECT * FROM record_ai_credit_refund('{a}','{key(2)}',300000)",'verified video failure required'))
  charge(3)
  test('client failure and unknown historical job are not evidence',lambda:reject(f"SELECT * FROM record_ai_credit_refund('{a}','{key(3)}',300000,'{{\"failed\":true}}')",'verified video failure required'))
  test('missing evidence cannot be forged as terminal',lambda:reject(f"SELECT record_ai_video_evidence('terminal','{a}','{key(3)}','{job(3)}','prediction_3','failed')",'binding mismatch'))
  charge(4);fail(4)
  test('foreign account cannot refund',lambda:reject(f"SELECT * FROM record_ai_credit_refund('{b}','{key(4)}',300000)",'original debit not found'))
  test('provider-confirmed failure refunds full actual debit despite client asking one micro',lambda:eq(refund(4,1),'t|300000'))
  test('duplicate with different amount cannot mint again',lambda:eq(refund(4,999999),'f|300000'))
  test('completed evidence cannot become failed',lambda:reject(f"SELECT record_ai_video_evidence('terminal','{a}','{key(1)}','{job(1)}','prediction_1','failed')",'terminal evidence conflict'))
  test('failed evidence cannot become completed',lambda:reject(f"SELECT record_ai_video_evidence('terminal','{a}','{key(4)}','{job(4)}','prediction_4','completed')",'terminal evidence conflict'))
  test('reserved permit cannot be issued twice',lambda:reject(f"SELECT record_ai_video_evidence('reserve','{a}','{key(2)}','{job(2)}')",'duplicate key'))
  test('provider binding cannot be replaced',lambda:reject(f"SELECT record_ai_video_evidence('submitted','{a}','{key(2)}','{job(2)}','other_prediction')",'binding mismatch'))
  test('cross-account terminal rejected',lambda:reject(f"SELECT record_ai_video_evidence('terminal','{b}','{key(2)}','{job(2)}','prediction_2','failed')",'binding mismatch'))
  test('client timeout is not terminal evidence',lambda:reject(f"SELECT record_ai_video_evidence('terminal','{a}','{key(2)}','{job(2)}','prediction_2','timeout')",'invalid terminal evidence'))
  charge(5);fail(5)
  test('large client amount capped to actual debit',lambda:eq(refund(5,999999999),'t|300000'))
  q(f"SELECT grant_ai_credits('{b}',100000,'stripe','synthetic-overdraft','synthetic-checkout','top-up','{{}}');");charge(6,300000,b)
  for e,status in [('reserve',None),('submitted',None),('terminal','failed')]:event(6,e,status,b)
  test('overdraft never credited',lambda:eq(refund(6,999999,b),'t|100000'))
  charge(7,300000,b)
  for e,status in [('reserve',None),('submitted',None),('terminal','failed')]:event(7,e,status,b)
  eq(refund(7,300000,b),'t|100000') # prior refund supplied only100000 before debit7
  charge(8,300000,b)
  for e,status in [('reserve',None),('submitted',None),('terminal','failed')]:event(8,e,status,b)
  # prior refund again supplied100000. A fully overdrawn debit is made next.
  charge(9,300000,b)
  for e,status in [('reserve',None),('submitted',None),('terminal','failed')]:event(9,e,status,b)
  test('entirely overdrawn debit credits zero',lambda:eq(refund(9,300000,b),'f|0'))
  charge(10);fail(10)
  def simultaneous_refunds():
   with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:values=list(pool.map(lambda _:refund(10),range(8)))
   eq(values.count('t|300000'),1);eq(q(f"SELECT count(*) FROM ai_credit_ledger WHERE idempotency_key='refund:{key(10)}'"),'1')
  test('eight real concurrent database connections credit once',simultaneous_refunds)
  test('verified refund linked to immutable evidence',lambda:eq(q(f"SELECT verified_video_job_id FROM ai_credit_ledger WHERE idempotency_key='refund:{key(10)}'"),job(10)))
  test('anon and authenticated cannot attest or refund',lambda:eq(q("SELECT has_function_privilege('authenticated','record_ai_credit_refund(uuid,text,bigint,jsonb)','EXECUTE'),has_function_privilege('anon','record_ai_video_evidence(text,uuid,text,text,text,text)','EXECUTE'),has_table_privilege('authenticated','ai_credit_video_evidence','INSERT')"),'f|f|f'))
  test('RLS enabled on evidence',lambda:eq(q("SELECT relrowsecurity FROM pg_class WHERE oid='ai_credit_video_evidence'::regclass"),'t'))
  charge(11);fail(11)
  q(f"UPDATE ai_credit_ledger SET metadata='{{}}' WHERE idempotency_key='{key(11)}'")
  test('legacy debit without server overdraft stays pending',lambda:reject(f"SELECT * FROM record_ai_credit_refund('{a}','{key(11)}',300000)",'requires reconciliation'))
  charge(12);fail(12)
  q(f"UPDATE ai_credit_ledger SET metadata='{{\"overdraft_micros\":\"broken\"}}' WHERE idempotency_key='{key(12)}'")
  test('malformed historical overdraft stays pending',lambda:reject(f"SELECT * FROM record_ai_credit_refund('{a}','{key(12)}',300000)",'requires reconciliation'))
  charge(13);fail(13)
  q(f"INSERT INTO ai_credit_ledger(user_id,kind,amount_micros,balance_after_micros,idempotency_key) VALUES('{a}','refund',300000,0,'refund:{key(13)}')")
  test('legacy refund cannot be adopted as trusted evidence',lambda:reject(f"SELECT * FROM record_ai_credit_refund('{a}','{key(13)}',300000)",'requires reconciliation'))
  test('ordinary role cannot invoke evidence writer',lambda:reject(f"SET ROLE authenticated; SELECT record_ai_video_evidence('reserve','{a}','{key(99)}','{job(99)}')",'permission denied'))
  test('null owner cannot modify prediction binding',lambda:reject(f"SELECT record_ai_video_evidence('submitted',NULL,'{key(2)}','{job(2)}','prediction_2')",'binding mismatch'))
  test('only service role can execute both RPCs',lambda:eq(q("SELECT bool_and(has_function_privilege('service_role',oid,'EXECUTE') AND NOT has_function_privilege('anon',oid,'EXECUTE') AND NOT has_function_privilege('authenticated',oid,'EXECUTE')) FROM pg_proc WHERE proname IN ('record_ai_video_evidence','record_ai_credit_refund')"),'t'))
  print(json.dumps({'passed':len(checks),'postgres':q('SELECT version()'),'production_access':False}))
 finally:
  subprocess.run([str(pg/'pg_ctl'),'-D',str(cluster),'-m','fast','-w','stop'],env=env,check=True,stdout=subprocess.DEVNULL)
