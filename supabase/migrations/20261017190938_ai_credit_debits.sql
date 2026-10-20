create or replace function public.record_ai_credit_debit(
  p_user_id uuid,
  p_amount_micros bigint,
  p_idempotency_key text,
  p_metadata jsonb default '{}'::jsonb
)
returns table (out_balance_micros bigint, out_applied boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_balance bigint;
  v_existing bigint;
  v_new bigint;
  v_overdraft bigint := 0;
begin
  if p_amount_micros is null or p_amount_micros <= 0 then
    raise exception 'debit amount must be positive';
  end if;
  if nullif(trim(p_idempotency_key), '') is null then
    raise exception 'idempotency key is required';
  end if;

  insert into public.ai_credit_accounts (user_id)
  values (p_user_id)
  on conflict (user_id) do nothing;

  select a.balance_micros
    into v_balance
    from public.ai_credit_accounts a
   where a.user_id = p_user_id
   for update;

  select l.balance_after_micros
    into v_existing
    from public.ai_credit_ledger l
   where l.user_id = p_user_id
     and l.idempotency_key = p_idempotency_key;
  if found then
    return query select v_existing, false;
    return;
  end if;

  if p_amount_micros > v_balance then
    v_overdraft := p_amount_micros - v_balance;
    v_new := 0;
  else
    v_new := v_balance - p_amount_micros;
  end if;

  insert into public.ai_credit_ledger
    (user_id, kind, amount_micros, balance_after_micros, idempotency_key, metadata)
  values
    (p_user_id, 'debit', -p_amount_micros, v_new, p_idempotency_key,
     coalesce(p_metadata, '{}'::jsonb) || jsonb_build_object('overdraft_micros', v_overdraft));

  update public.ai_credit_accounts
     set balance_micros = v_new,
         updated_at = now()
   where user_id = p_user_id;

  return query select v_new, true;
end;
$$;

revoke all on function public.record_ai_credit_debit(uuid, bigint, text, jsonb)
  from public, anon, authenticated;
grant execute on function public.record_ai_credit_debit(uuid, bigint, text, jsonb)
  to service_role;