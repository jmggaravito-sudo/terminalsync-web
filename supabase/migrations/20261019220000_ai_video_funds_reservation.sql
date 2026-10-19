-- Reserva de saldo para los trabajos de video: el permiso de envío ya no es
-- solo evidencia, ahora también es dinero.
--
-- Hasta aquí `record_ai_video_evidence('reserve', ...)` verificaba la sesión y
-- registraba un permiso único, pero NO miraba el saldo ni recibía el importe:
-- una cuenta sin fondos podía llegar a WaveSpeed y gastar el saldo del
-- proveedor. Esta migración cierra esa brecha sin tocar la 0057 ya aplicada.
--
-- `reserve_ai_video_funds` hace, en UNA transacción serializada por la fila de
-- la cuenta (`for update`):
--   1. rechaza un permiso repetido (un solo permiso por cotización y por job);
--   2. si el débito de la app ya llegó (misma clave `design-video:vq_...`),
--      lo acepta solo si cubre el precio y no tiene sobregiro;
--   3. si no llegó, descuenta el precio AQUÍ con esa misma clave y exige saldo
--      suficiente (nunca sobregira);
--   4. registra el permiso `reserved`.
--
-- Como el débito del servidor usa la clave original, cuando la app sincronice
-- su propio débito `record_ai_credit_debit` lo encuentra y devuelve
-- `applied = false`: no se cobra dos veces, llegue primero la app o el
-- servidor. El importe sale de una tabla de precios del servidor
-- (`src/lib/videoPricing.ts`) a partir del modelo y la duración de la
-- cotización que registra el orquestador; nunca del `creditCostUsd` ni de un
-- importe enviado por el cliente.
--
-- El metadato `overdraft_micros = 0` hace que `record_ai_credit_refund` pueda
-- devolver el importe completo si el proveedor confirma el fallo.

create or replace function public.reserve_ai_video_funds(
  p_user_id uuid,
  p_key text,
  p_job_id text,
  p_price_micros bigint
) returns table (out_balance_micros bigint, out_debited boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_balance bigint;
  v_debit public.ai_credit_ledger%rowtype;
  v_overdraft bigint;
begin
  if p_user_id is null then
    raise exception 'video account required';
  end if;
  if p_price_micros is null or p_price_micros <= 0 then
    raise exception 'video price must be positive';
  end if;
  if p_key is null or p_key !~ '^design-video:vq_[a-f0-9]{32}$' then
    raise exception 'invalid video debit key';
  end if;
  if p_job_id is null or p_job_id !~ '^vj_[a-f0-9]{32}$' then
    raise exception 'invalid video job';
  end if;

  insert into public.ai_credit_accounts (user_id)
  values (p_user_id)
  on conflict (user_id) do nothing;

  -- Serializa cualquier reserva, débito o reembolso de esta cuenta.
  select a.balance_micros
    into v_balance
    from public.ai_credit_accounts a
   where a.user_id = p_user_id
   for update;

  -- Un permiso para enviar, no uno repetible para volver a llamar al proveedor.
  if exists (
    select 1
      from public.ai_credit_video_evidence e
     where e.job_id = p_job_id
        or (e.user_id = p_user_id and e.original_idempotency_key = p_key)
  ) then
    raise exception 'video reserve already used';
  end if;

  select * into v_debit
    from public.ai_credit_ledger l
   where l.user_id = p_user_id
     and l.idempotency_key = p_key;

  if found then
    -- La app ya reportó su gasto. Solo vale si es un débito sin sobregiro que
    -- cubre el precio del servidor.
    begin
      v_overdraft := (v_debit.metadata ->> 'overdraft_micros')::bigint;
    exception when others then
      raise exception 'video debit mismatch';
    end;
    if v_debit.kind <> 'debit'
       or v_overdraft is null or v_overdraft <> 0
       or -v_debit.amount_micros < p_price_micros then
      raise exception 'video debit mismatch';
    end if;
    out_debited := false;
  else
    if v_balance < p_price_micros then
      raise exception 'insufficient video funds';
    end if;
    v_balance := v_balance - p_price_micros;
    insert into public.ai_credit_ledger
      (user_id, kind, amount_micros, balance_after_micros, idempotency_key, metadata)
    values
      (p_user_id, 'debit', -p_price_micros, v_balance, p_key,
       jsonb_build_object(
         'overdraft_micros', 0,
         'source', 'video_reserve',
         'job_id', p_job_id
       ));
    update public.ai_credit_accounts
       set balance_micros = v_balance,
           updated_at = now()
     where user_id = p_user_id;
    out_debited := true;
  end if;

  insert into public.ai_credit_video_evidence
    (job_id, user_id, original_idempotency_key, status)
  values
    (p_job_id, p_user_id, p_key, 'reserved');

  out_balance_micros := v_balance;
  return next;
end;
$$;

revoke all on function public.reserve_ai_video_funds(uuid, text, text, bigint)
  from public, anon, authenticated;
grant execute on function public.reserve_ai_video_funds(uuid, text, text, bigint)
  to service_role;

-- `record_ai_video_evidence('reserve', ...)` deja de existir como camino para
-- obtener un permiso sin fondos. Los eventos `submitted` y `terminal` quedan
-- exactamente como en la 0057.
create or replace function public.record_ai_video_evidence(
  p_event text, p_user_id uuid, p_key text, p_job_id text,
  p_prediction_id text default null, p_status text default null
) returns boolean language plpgsql security definer set search_path = '' as $$
declare v public.ai_credit_video_evidence%rowtype;
begin
  if p_event = 'reserve' then
    raise exception 'video reserve requires funds reservation';
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
