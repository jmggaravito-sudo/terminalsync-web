-- Registra en el servidor las devoluciones de créditos que la app ya aplicó
-- localmente, cuando un video falla o no llega el archivo.
--
-- Sin esto, un equipo nuevo reconstruye el saldo con el gasto (0033) pero sin su
-- devolución, y el cliente queda cobrado por un video que nunca recibió.
--
-- Una devolución siempre se refiere a un gasto ya registrado, y es idempotente:
-- su clave es 'refund:' || <clave del gasto>, así que reenviarla no devuelve dos
-- veces. Nunca devuelve más de lo que ese gasto descontó de verdad: si el gasto
-- tuvo sobregiro (metadata.overdraft_micros), ese exceso no se descontó y por lo
-- tanto no se devuelve.

create or replace function public.record_ai_credit_refund(
  p_user_id uuid,
  p_original_idempotency_key text,
  p_amount_micros bigint,
  p_metadata jsonb default '{}'::jsonb
)
returns table (out_balance_micros bigint, out_applied boolean, out_refunded_micros bigint)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_balance bigint;
  v_existing bigint;
  v_existing_amount bigint;
  v_debit_amount bigint;
  v_debit_meta jsonb;
  v_refundable bigint;
  v_refund bigint;
  v_refund_key text;
begin
  if p_amount_micros is null or p_amount_micros <= 0 then
    raise exception 'refund amount must be positive';
  end if;
  if nullif(trim(p_original_idempotency_key), '') is null then
    raise exception 'original idempotency key is required';
  end if;
  v_refund_key := 'refund:' || p_original_idempotency_key;

  insert into public.ai_credit_accounts (user_id)
  values (p_user_id)
  on conflict (user_id) do nothing;

  select a.balance_micros
    into v_balance
    from public.ai_credit_accounts a
   where a.user_id = p_user_id
   for update;

  select l.balance_after_micros, l.amount_micros
    into v_existing, v_existing_amount
    from public.ai_credit_ledger l
   where l.user_id = p_user_id
     and l.idempotency_key = v_refund_key;
  if found then
    return query select v_existing, false, v_existing_amount;
    return;
  end if;

  select l.amount_micros, l.metadata
    into v_debit_amount, v_debit_meta
    from public.ai_credit_ledger l
   where l.user_id = p_user_id
     and l.idempotency_key = p_original_idempotency_key
     and l.kind = 'debit';
  if not found then
    raise exception 'original debit not found';
  end if;

  v_refundable := (-v_debit_amount)
    - coalesce(nullif(v_debit_meta ->> 'overdraft_micros', '')::bigint, 0);
  v_refund := least(p_amount_micros, v_refundable);
  if v_refund <= 0 then
    return query select v_balance, false, 0::bigint;
    return;
  end if;

  insert into public.ai_credit_ledger
    (user_id, kind, amount_micros, balance_after_micros, idempotency_key, metadata)
  values
    (p_user_id, 'refund', v_refund, v_balance + v_refund, v_refund_key,
     coalesce(p_metadata, '{}'::jsonb)
       || jsonb_build_object('original_idempotency_key', p_original_idempotency_key));

  update public.ai_credit_accounts
     set balance_micros = v_balance + v_refund,
         updated_at = now()
   where user_id = p_user_id;

  return query select v_balance + v_refund, true, v_refund;
end;
$$;

revoke all on function public.record_ai_credit_refund(uuid, text, bigint, jsonb)
  from public, anon, authenticated;
grant execute on function public.record_ai_credit_refund(uuid, text, bigint, jsonb)
  to service_role;
