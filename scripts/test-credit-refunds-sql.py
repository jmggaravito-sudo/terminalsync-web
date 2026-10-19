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
a='11111111-1111-4111-8111-111111111111';b='22222222-2222-4222-8222-222222222222';c='33333333-3333-4333-8333-333333333333';d='44444444-4444-4444-8444-444444444444'
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
 def reserve(n,price=300000,owner=a,jid=None):return q(f"SELECT * FROM reserve_ai_video_funds('{owner}','{key(n)}','{jid or job(n)}',{price})")
 def event(n,e,status=None,owner=a,pred=None):
  if e=='reserve':return reserve(n,300000,owner)
  if e=='seed':
   # A permit issued BEFORE the funds gate existed (legacy overdrawn debits). Only the refund tests need it.
   return q(f"INSERT INTO ai_credit_video_evidence(job_id,user_id,original_idempotency_key,status) VALUES('{job(n)}','{owner}','{key(n)}','reserved')")
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
  q(f"INSERT INTO auth.users VALUES('{a}'),('{b}'),('{c}'),('{d}');")
  for name in ['0027_ai_credits.sql','0033_ai_credit_debits.sql','0057_ai_credit_refunds.sql','20261019220000_ai_video_funds_reservation.sql']:
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
  test('reserved permit cannot be issued twice',lambda:reject(f"SELECT * FROM reserve_ai_video_funds('{a}','{key(2)}','{job(2)}',300000)",'video reserve already used'))
  test('provider binding cannot be replaced',lambda:reject(f"SELECT record_ai_video_evidence('submitted','{a}','{key(2)}','{job(2)}','other_prediction')",'binding mismatch'))
  test('cross-account terminal rejected',lambda:reject(f"SELECT record_ai_video_evidence('terminal','{b}','{key(2)}','{job(2)}','prediction_2','failed')",'binding mismatch'))
  test('client timeout is not terminal evidence',lambda:reject(f"SELECT record_ai_video_evidence('terminal','{a}','{key(2)}','{job(2)}','prediction_2','timeout')",'invalid terminal evidence'))
  charge(5);fail(5)
  test('large client amount capped to actual debit',lambda:eq(refund(5,999999999),'t|300000'))
  q(f"SELECT grant_ai_credits('{b}',100000,'stripe','synthetic-overdraft','synthetic-checkout','top-up','{{}}');");charge(6,300000,b)
  for e,status in [('seed',None),('submitted',None),('terminal','failed')]:event(6,e,status,b)
  test('overdraft never credited',lambda:eq(refund(6,999999,b),'t|100000'))
  charge(7,300000,b)
  for e,status in [('seed',None),('submitted',None),('terminal','failed')]:event(7,e,status,b)
  eq(refund(7,300000,b),'t|100000') # prior refund supplied only100000 before debit7
  charge(8,300000,b)
  for e,status in [('seed',None),('submitted',None),('terminal','failed')]:event(8,e,status,b)
  # prior refund again supplied100000. A fully overdrawn debit is made next.
  charge(9,300000,b)
  for e,status in [('seed',None),('submitted',None),('terminal','failed')]:event(9,e,status,b)
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
  test('only service role can execute the three RPCs',lambda:eq(q("SELECT bool_and(has_function_privilege('service_role',oid,'EXECUTE') AND NOT has_function_privilege('anon',oid,'EXECUTE') AND NOT has_function_privilege('authenticated',oid,'EXECUTE')) FROM pg_proc WHERE proname IN ('record_ai_video_evidence','record_ai_credit_refund','reserve_ai_video_funds')"),'t'))

  # ---- Reserva de saldo: el permiso de envío también es dinero ----
  def balance(owner):return int(q(f"SELECT coalesce((SELECT balance_micros FROM ai_credit_accounts WHERE user_id='{owner}'),0)"))
  def rows(n):return int(q(f"SELECT count(*) FROM ai_credit_ledger WHERE idempotency_key='{key(n)}'"))
  def permits(n):return int(q(f"SELECT count(*) FROM ai_credit_video_evidence WHERE original_idempotency_key='{key(n)}'"))
  def attempt(fn):
   try:return 'ok:'+fn()
   except RuntimeError as e:return 'err:'+str(e)
  q(f"SELECT grant_ai_credits('{c}',1000000,'stripe','synthetic-c','synthetic-checkout','topup-c','{{}}');")
  test('legacy reserve event can no longer mint a permit without funds',lambda:reject(f"SELECT record_ai_video_evidence('reserve','{c}','{key(30)}','{job(30)}')",'video reserve requires funds reservation'))
  def poor_user_blocked():
   reject(f"SELECT * FROM reserve_ai_video_funds('{c}','{key(31)}','{job(31)}',1000001)",'insufficient video funds')
   eq(balance(c),1000000);eq(rows(31),0);eq(permits(31),0)
  test('insufficient balance blocks the permit and moves no money',poor_user_blocked)
  def account_without_row_blocked():
   reject(f"SELECT * FROM reserve_ai_video_funds('{d}','{key(32)}','{job(32)}',300000)",'insufficient video funds')
   eq(permits(32),0);eq(balance(d),0)
  test('account with no balance cannot obtain a permit',account_without_row_blocked)
  def reserve_debits_server_price():
   eq(reserve(33,300000,c),'700000|t');eq(balance(c),700000);eq(rows(33),1);eq(permits(33),1)
   eq(q(f"SELECT amount_micros||'|'||balance_after_micros||'|'||(metadata->>'overdraft_micros')||'|'||(metadata->>'source') FROM ai_credit_ledger WHERE idempotency_key='{key(33)}'"),'-300000|700000|0|video_reserve')
  test('reserve debits exactly the server price under the original key',reserve_debits_server_price)
  def late_app_debit_not_double_charged():
   eq(q(f"SELECT out_applied FROM record_ai_credit_debit('{c}',300000,'{key(33)}','{{}}')"),'f')
   eq(q(f"SELECT out_applied FROM record_ai_credit_debit('{c}',999999,'{key(33)}','{{}}')"),'f')
   eq(balance(c),700000);eq(rows(33),1)
  test('the app syncing its own debit afterwards charges nothing more',late_app_debit_not_double_charged)
  def app_debit_first_then_reserve():
   charge(34,300000,c);eq(balance(c),400000)
   eq(reserve(34,300000,c),'400000|f');eq(balance(c),400000);eq(rows(34),1);eq(permits(34),1)
  test('app debit arriving first is accepted and not charged again',app_debit_first_then_reserve)
  def short_debit_rejected():
   charge(35,100000,c);before=balance(c)
   reject(f"SELECT * FROM reserve_ai_video_funds('{c}','{key(35)}','{job(35)}',300000)",'video debit mismatch')
   eq(balance(c),before);eq(permits(35),0)
  test('an app debit below the server price cannot buy a permit',short_debit_rejected)
  def overdrawn_debit_rejected():
   q(f"SELECT grant_ai_credits('{d}',100000,'stripe','synthetic-d','synthetic-checkout','topup-d','{{}}');")
   charge(36,300000,d)
   reject(f"SELECT * FROM reserve_ai_video_funds('{d}','{key(36)}','{job(36)}',300000)",'video debit mismatch')
   eq(permits(36),0)
  test('an overdrawn app debit cannot buy a permit',overdrawn_debit_rejected)
  def replay_cannot_charge_twice():
   before=balance(c)
   reject(f"SELECT * FROM reserve_ai_video_funds('{c}','{key(33)}','{job(33)}',300000)",'video reserve already used')
   reject(f"SELECT * FROM reserve_ai_video_funds('{c}','{key(33)}','vj_{'e'*32}',300000)",'video reserve already used')
   eq(balance(c),before);eq(rows(33),1);eq(permits(33),1)
  test('replaying a reserve (same or new job id) neither charges nor permits again',replay_cannot_charge_twice)
  test('invalid price or key is rejected',lambda:(reject(f"SELECT * FROM reserve_ai_video_funds('{c}','{key(37)}','{job(37)}',0)",'video price must be positive'),reject(f"SELECT * FROM reserve_ai_video_funds('{c}','design-video:x','{job(37)}',100)",'invalid video debit key')))
  def refund_after_provider_failure():
   q(f"SELECT grant_ai_credits('{c}',5000000,'stripe','synthetic-c2','synthetic-checkout','topup-c2','{{}}');")
   before=balance(c);eq(reserve(38,1000000,c),f'{before-1000000}|t')
   event(38,'submitted',owner=c);event(38,'terminal','failed',c)
   eq(refund(38,1,c),'t|1000000');eq(balance(c),before)
  test('provider-confirmed failure returns the full reserved price',refund_after_provider_failure)
  def no_refund_without_provider_failure():
   reserve(39,300000,c);before=balance(c)
   reject(f"SELECT * FROM record_ai_credit_refund('{c}','{key(39)}',300000)",'verified video failure required')
   eq(balance(c),before)
  test('a reserved but never-submitted job is not refundable by client request',no_refund_without_provider_failure)
  def concurrent_distinct_jobs_cannot_overspend():
   q(f"SELECT grant_ai_credits('{d}',3000000,'stripe','synthetic-d2','synthetic-checkout','topup-d2','{{}}');")
   start=balance(d);price=start//3 if start%3==0 else None
   if price is None:
    price=1000000;q(f"UPDATE ai_credit_accounts SET balance_micros=3000000 WHERE user_id='{d}'");start=3000000
   with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
    out=list(pool.map(lambda i:attempt(lambda:reserve(50+i,price,d)),range(8)))
   oks=[o for o in out if o.startswith('ok:')];errs=[o for o in out if o.startswith('err:')]
   eq(len(oks),3);eq(len(errs),5);assert all('insufficient video funds' in e for e in errs),errs
   eq(balance(d),0);eq(int(q(f"SELECT count(*) FROM ai_credit_video_evidence WHERE user_id='{d}' AND original_idempotency_key IN ({','.join(repr(key(50+i)) for i in range(8))})")),3)
  test('eight real concurrent reserves can spend the balance only once',concurrent_distinct_jobs_cannot_overspend)
  def concurrent_same_key_single_charge():
   q(f"SELECT grant_ai_credits('{b}',2000000,'stripe','synthetic-b3','synthetic-checkout','topup-b3','{{}}');")
   before=balance(b)
   with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
    out=list(pool.map(lambda _:attempt(lambda:reserve(60,500000,b)),range(8)))
   eq(len([o for o in out if o.startswith('ok:')]),1);assert all('already used' in o for o in out if o.startswith('err:')),out
   eq(balance(b),before-500000);eq(rows(60),1);eq(permits(60),1)
  test('eight concurrent reserves of the same quote charge and permit once',concurrent_same_key_single_charge)
  def app_debit_and_reserve_race():
   before=balance(b)
   def worker(i):
    return attempt(lambda:reserve(61,500000,b)) if i%2==0 else attempt(lambda:charge(61,500000,b))
   with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
    out=list(pool.map(worker,range(8)))
   assert not [o for o in out if o.startswith('err:') and 'already used' not in o],out
   eq(balance(b),before-500000);eq(rows(61),1);eq(permits(61),1)
  test('app debit racing the reserve for one quote is charged exactly once',app_debit_and_reserve_race)
  test('ledger sums to the balance for an account with no overdraft history',lambda:eq(q("SELECT count(*) FROM ai_credit_accounts a WHERE a.balance_micros <> coalesce((SELECT sum(amount_micros) FROM ai_credit_ledger l WHERE l.user_id=a.user_id AND l.kind<>'adjustment'),0) AND a.user_id='"+c+"'"),'0'))
  print(json.dumps({'passed':len(checks),'postgres':q('SELECT version()'),'production_access':False}))
 finally:
  subprocess.run([str(pg/'pg_ctl'),'-D',str(cluster),'-m','fast','-w','stop'],env=env,check=True,stdout=subprocess.DEVNULL)
