-- New jobs only. Never infer evidence for historical debits or migrate balances.
-- Writer: the credentialed video orchestrator. Reserve additionally requires a
-- Supabase-verified user at the API boundary, before submitting to WaveSpeed.
create table public.ai_credit_video_evidence (
  job_id text primary key check (job_id ~ '^vj_[a-f0-9]{32}$'),
  user_id uuid not null references auth.users(id),
  original_idempotency_key text not null unique
    check (original_idempotency_key ~ '^design-video:vq_[a-f0-9]{32}$'),
  prediction_id text unique,
  status text not null check (status in ('reserved','submitted','failed','completed')),
  observed_at timestamptz not null default now(),
  unique(user_id, original_idempotency_key)
);
alter table public.ai_credit_ledger add column verified_video_job_id text references public.ai_credit_video_evidence(job_id);
alter table public.ai_credit_video_evidence enable row level security;
revoke all on table public.ai_credit_video_evidence from public, anon, authenticated;
grant select, insert, update on table public.ai_credit_video_evidence to service_role;

create or replace function public.record_ai_video_evidence(
  p_event text, p_user_id uuid, p_key text, p_job_id text,
  p_prediction_id text default null, p_status text default null
) returns boolean language plpgsql security definer set search_path = '' as $$
declare v public.ai_credit_video_evidence%rowtype;
begin
  if p_event = 'reserve' then
    -- One permit to submit, not a replayable permit to call the provider again.
    insert into public.ai_credit_video_evidence(job_id,user_id,original_idempotency_key,status)
      values(p_job_id,p_user_id,p_key,'reserved');
    return true;
  end if;
  select * into v from public.ai_credit_video_evidence where job_id=p_job_id for update;
  if not found or v.user_id is distinct from p_user_id or v.original_idempotency_key is distinct from p_key then
    raise exception 'video evidence binding mismatch';
  end if;
  if p_prediction_id is null or p_prediction_id !~ '^[A-Za-z0-9_-]{1,200}$' then
    raise exception 'invalid provider prediction';
  end if;
  if p_event='submitted' then
    if v.status<>'reserved' then
      if v.prediction_id=p_prediction_id then return false; end if;
      raise exception 'video evidence binding mismatch';
    end if;
    update public.ai_credit_video_evidence set prediction_id=p_prediction_id,
      status='submitted',observed_at=now() where job_id=p_job_id;
    return true;
  end if;
  if p_event is null or p_event<>'terminal' or p_status is null or p_status not in ('failed','completed')
     or v.prediction_id is distinct from p_prediction_id then
    raise exception 'invalid terminal evidence';
  end if;
  if v.status=p_status then return false; end if;
  if v.status<>'submitted' then raise exception 'terminal evidence conflict'; end if;
  update public.ai_credit_video_evidence set status=p_status,observed_at=now() where job_id=p_job_id;
  return true;
end $$;
revoke all on function public.record_ai_video_evidence(text,uuid,text,text,text,text) from public,anon,authenticated;
grant execute on function public.record_ai_video_evidence(text,uuid,text,text,text,text) to service_role;

-- amount/metadata remain wire-compatible hints, never evidence or authority.
create or replace function public.record_ai_credit_refund(
  p_user_id uuid, p_original_idempotency_key text, p_amount_micros bigint,
  p_metadata jsonb default '{}'::jsonb
) returns table(out_balance_micros bigint,out_applied boolean,out_refunded_micros bigint)
language plpgsql security definer set search_path = '' as $$
declare
  v_balance bigint; v_debit public.ai_credit_ledger%rowtype;
  v_job public.ai_credit_video_evidence%rowtype;
  v_existing public.ai_credit_ledger%rowtype; v_overdraft bigint; v_refund bigint;
begin
  if p_amount_micros is null or p_amount_micros<=0 then raise exception 'refund amount must be positive'; end if;
  if nullif(trim(p_original_idempotency_key),'') is null then raise exception 'original idempotency key is required'; end if;
  select balance_micros into v_balance from public.ai_credit_accounts
    where user_id=p_user_id for update;
  select * into v_debit from public.ai_credit_ledger where user_id=p_user_id
    and idempotency_key=p_original_idempotency_key and kind='debit';
  if not found then raise exception 'original debit not found'; end if;
  select * into v_job from public.ai_credit_video_evidence where user_id=p_user_id
    and original_idempotency_key=p_original_idempotency_key for update;
  if not found or v_job.prediction_id is null or v_job.status<>'failed' then
    raise exception 'verified video failure required';
  end if;
  -- Validate evidence even on duplicate requests. Legacy refunds aren't proof.
  select * into v_existing from public.ai_credit_ledger where user_id=p_user_id
    and idempotency_key='refund:'||p_original_idempotency_key;
  if found then
    if v_existing.kind<>'refund' or v_existing.verified_video_job_id is distinct from v_job.job_id then
      raise exception 'legacy refund requires reconciliation';
    end if;
    return query select v_balance,false,v_existing.amount_micros; return;
  end if;
  -- Only the debit RPC's server-computed overdraft is used. Malformed legacy
  -- metadata is pending reconciliation, never silently treated as zero.
  begin
    v_overdraft := (v_debit.metadata->>'overdraft_micros')::bigint;
  exception when others then raise exception 'debit requires reconciliation'; end;
  if v_debit.amount_micros>=0 or v_overdraft is null or v_overdraft<0
    or v_overdraft>(-v_debit.amount_micros) then raise exception 'debit requires reconciliation'; end if;
  v_refund := (-v_debit.amount_micros)-v_overdraft;
  if v_refund=0 then return query select v_balance,false,0::bigint; return; end if;
  insert into public.ai_credit_ledger(user_id,kind,amount_micros,balance_after_micros,idempotency_key,metadata,verified_video_job_id)
    values(p_user_id,'refund',v_refund,v_balance+v_refund,'refund:'||p_original_idempotency_key,
      jsonb_build_object('original_idempotency_key',p_original_idempotency_key,
        'verified_job_id',v_job.job_id,'source','video_provider_failure'),v_job.job_id);
  update public.ai_credit_accounts set balance_micros=v_balance+v_refund,updated_at=now() where user_id=p_user_id;
  return query select v_balance+v_refund,true,v_refund;
end $$;
revoke all on function public.record_ai_credit_refund(uuid,text,bigint,jsonb) from public,anon,authenticated;
grant execute on function public.record_ai_credit_refund(uuid,text,bigint,jsonb) to service_role;
