-- Account-scoped prepaid AI credits.
--
-- Payment providers never write these tables directly. Signed webhooks call
-- `grant_ai_credits` through the Supabase service-role client after confirming
-- that Stripe/Mercado Pago reports the payment as paid/approved. The function
-- serializes on the account row and deduplicates provider retries.

create table public.ai_credit_accounts (
  user_id         uuid primary key references auth.users(id) on delete cascade,
  balance_micros  bigint not null default 0 check (balance_micros >= 0),
  currency        text not null default 'USD' check (currency = 'USD'),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table public.ai_credit_ledger (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users(id) on delete cascade,
  kind                  text not null check (kind in ('top_up', 'debit', 'refund', 'adjustment')),
  amount_micros         bigint not null check (amount_micros <> 0),
  balance_after_micros  bigint not null check (balance_after_micros >= 0),
  rail                  text check (rail in ('stripe', 'mercadopago')),
  provider_payment_id   text,
  checkout_id           text,
  idempotency_key       text not null,
  metadata              jsonb not null default '{}'::jsonb,
  created_at            timestamptz not null default now(),
  unique (user_id, idempotency_key)
);

create index ai_credit_ledger_user_time_idx
  on public.ai_credit_ledger (user_id, created_at desc);
create unique index ai_credit_ledger_provider_payment_idx
  on public.ai_credit_ledger (rail, provider_payment_id)
  where provider_payment_id is not null;

alter table public.ai_credit_accounts enable row level security;
alter table public.ai_credit_ledger enable row level security;

create policy ai_credit_accounts_self_read on public.ai_credit_accounts
  for select using (auth.uid() = user_id);
create policy ai_credit_ledger_self_read on public.ai_credit_ledger
  for select using (auth.uid() = user_id);

create or replace function public.grant_ai_credits(
  p_user_id uuid,
  p_amount_micros bigint,
  p_rail text,
  p_provider_payment_id text,
  p_checkout_id text,
  p_idempotency_key text,
  p_metadata jsonb default '{}'::jsonb
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_balance bigint;
  v_existing bigint;
begin
  if p_amount_micros <= 0 then
    raise exception 'credit top-up amount must be positive';
  end if;
  if p_rail not in ('stripe', 'mercadopago') then
    raise exception 'unsupported credit rail';
  end if;
  if nullif(trim(p_idempotency_key), '') is null then
    raise exception 'idempotency key is required';
  end if;

  insert into public.ai_credit_accounts (user_id)
  values (p_user_id)
  on conflict (user_id) do nothing;

  select balance_micros
    into v_balance
    from public.ai_credit_accounts
   where user_id = p_user_id
   for update;

  select balance_after_micros
    into v_existing
    from public.ai_credit_ledger
   where user_id = p_user_id
     and idempotency_key = p_idempotency_key;
  if found then
    return v_existing;
  end if;

  v_balance := v_balance + p_amount_micros;
  insert into public.ai_credit_ledger (
    user_id,
    kind,
    amount_micros,
    balance_after_micros,
    rail,
    provider_payment_id,
    checkout_id,
    idempotency_key,
    metadata
  ) values (
    p_user_id,
    'top_up',
    p_amount_micros,
    v_balance,
    p_rail,
    p_provider_payment_id,
    p_checkout_id,
    p_idempotency_key,
    coalesce(p_metadata, '{}'::jsonb)
  );

  update public.ai_credit_accounts
     set balance_micros = v_balance,
         updated_at = now()
   where user_id = p_user_id;

  return v_balance;
end;
$$;

revoke all on function public.grant_ai_credits(
  uuid, bigint, text, text, text, text, jsonb
) from public, anon, authenticated;
grant execute on function public.grant_ai_credits(
  uuid, bigint, text, text, text, text, jsonb
) to service_role;
