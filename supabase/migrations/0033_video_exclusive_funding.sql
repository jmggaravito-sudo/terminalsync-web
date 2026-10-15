-- Video funding is a separate, exclusive source. This migration deliberately
-- does not read, copy, or convert any existing ai_credit_accounts balance.
-- Allocation is disabled until an operator explicitly enables the private
-- setting AND enrolls a verified issuer; neither table is seeded here.

create schema if not exists video_funding_private;
grant usage on schema video_funding_private to service_role;

create table video_funding_private.video_funding_settings (
  singleton boolean primary key default true check (singleton),
  enabled boolean not null default false,
  -- Exact receiving namespace / ledger-deployment pin, not the product purpose.
  -- It remains NULL until the destination owner supplies the trusted value.
  destination text,
  purpose text not null default 'video-exclusive'
    check (purpose = 'video-exclusive')
);
insert into video_funding_private.video_funding_settings (singleton, enabled)
values (true, false)
on conflict (singleton) do nothing;

create table video_funding_private.video_funding_issuers (
  issuer_id text primary key check (length(trim(issuer_id)) between 1 and 160),
  enabled boolean not null default false,
  created_at timestamptz not null default now()
);

-- This is a NEW-payment cross-destination fence. Historical rows are checked
-- in-place by the RPC; they are not backfilled into this table.
create table video_funding_private.credit_payment_claims (
  rail text not null check (rail in ('stripe', 'mercadopago')),
  provider_payment_id text not null check (length(trim(provider_payment_id)) > 0),
  purpose text not null check (purpose in ('general', 'video-exclusive')),
  destination text,
  account_id uuid not null references auth.users(id) on delete restrict,
  allocation_id uuid,
  source_event_id text,
  created_at timestamptz not null default now(),
  primary key (rail, provider_payment_id),
  unique (rail, source_event_id),
  check ((purpose = 'video-exclusive') = (allocation_id is not null)),
  check ((purpose = 'video-exclusive') = (destination is not null))
);

create table video_funding_private.video_funding_allocations (
  allocation_id uuid primary key default gen_random_uuid(),
  rail text not null check (rail = 'stripe'),
  provider_payment_id text not null,
  source_event_id text not null unique,
  account_id uuid not null references auth.users(id) on delete restrict,
  issuer_id text not null references video_funding_private.video_funding_issuers(issuer_id),
  purpose text not null check (purpose = 'video-exclusive'),
  destination text not null,
  currency text not null check (currency = 'USD'),
  amount_micros bigint not null check (
    amount_micros > 0 and amount_micros <= 9007199254740991
  ),
  state text not null default 'committed_exclusive'
    check (state = 'committed_exclusive'),
  created_at timestamptz not null default now(),
  unique (rail, provider_payment_id)
);

-- The outbox payload is the stable receipt. A webhook retry finds the existing
-- allocation and cannot create a second allocation or a second outbox row.
create table video_funding_private.video_funding_outbox (
  allocation_id uuid primary key
    references video_funding_private.video_funding_allocations(allocation_id) on delete restrict,
  payload jsonb not null,
  attempts integer not null default 0 check (attempts >= 0),
  created_at timestamptz not null default now(),
  delivered_at timestamptz
);

alter table video_funding_private.video_funding_settings enable row level security;
alter table video_funding_private.video_funding_issuers enable row level security;
alter table video_funding_private.credit_payment_claims enable row level security;
alter table video_funding_private.video_funding_allocations enable row level security;
alter table video_funding_private.video_funding_outbox enable row level security;
revoke all on table video_funding_private.video_funding_settings from public, anon, authenticated, service_role;
revoke all on table video_funding_private.video_funding_issuers from public, anon, authenticated, service_role;
revoke all on table video_funding_private.credit_payment_claims from public, anon, authenticated, service_role;
revoke all on table video_funding_private.video_funding_allocations from public, anon, authenticated, service_role;
revoke all on table video_funding_private.video_funding_outbox from public, anon, authenticated, service_role;

-- Existing general-credit grants and new video allocations share the same
-- transaction-scoped payment lock and claim table. No payment can mint both.
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
  v_existing_payment_id text;
  v_existing_amount bigint;
  v_claim video_funding_private.credit_payment_claims%rowtype;
begin
  if p_amount_micros is null or p_amount_micros <= 0
     or p_amount_micros > 9007199254740991 then
    raise exception 'credit top-up amount must be positive';
  end if;
  if p_rail is null or p_rail not in ('stripe', 'mercadopago') then
    raise exception 'unsupported credit rail';
  end if;
  if nullif(trim(p_idempotency_key), '') is null then
    raise exception 'idempotency key is required';
  end if;
  if p_rail = 'stripe' and nullif(trim(p_provider_payment_id), '') is null then
    raise exception 'Stripe payment id is required';
  end if;

  if nullif(trim(p_provider_payment_id), '') is not null then
    perform pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended('credit-payment:' || p_rail || ':' || p_provider_payment_id, 0)
    );
    select * into v_claim
      from video_funding_private.credit_payment_claims
     where rail = p_rail and provider_payment_id = p_provider_payment_id;
    if found then
      if v_claim.purpose <> 'general' or v_claim.account_id <> p_user_id then
        raise exception 'payment already claimed for a different destination';
      end if;
      select balance_after_micros, amount_micros
        into v_existing, v_existing_amount
        from public.ai_credit_ledger
       where rail = p_rail and provider_payment_id = p_provider_payment_id;
      if found then
        if v_existing_amount <> p_amount_micros then
          raise exception 'payment replay amount differs from original grant';
        end if;
        return v_existing;
      end if;
      raise exception 'general payment claim has no matching ledger entry';
    end if;

    -- Preserve idempotency for pre-migration general grants without migrating
    -- their history into the new claim table.
    select balance_after_micros, amount_micros
      into v_existing, v_existing_amount
      from public.ai_credit_ledger
     where rail = p_rail and provider_payment_id = p_provider_payment_id;
    if found then
      if not exists (
        select 1 from public.ai_credit_ledger
         where rail = p_rail and provider_payment_id = p_provider_payment_id
           and user_id = p_user_id
      ) then raise exception 'payment belongs to a different account'; end if;
      if v_existing_amount is distinct from p_amount_micros then
        raise exception 'payment replay amount differs from original grant';
      end if;
      return v_existing;
    end if;
    if exists (
      select 1 from video_funding_private.video_funding_allocations
       where rail = p_rail and provider_payment_id = p_provider_payment_id
    ) then raise exception 'payment already allocated to video'; end if;
  end if;

  insert into public.ai_credit_accounts (user_id)
  values (p_user_id)
  on conflict (user_id) do nothing;

  select balance_micros into v_balance
    from public.ai_credit_accounts
   where user_id = p_user_id
   for update;

  select balance_after_micros, provider_payment_id, amount_micros
    into v_existing, v_existing_payment_id, v_existing_amount
    from public.ai_credit_ledger
   where user_id = p_user_id and idempotency_key = p_idempotency_key;
  if found then
    if p_rail = 'stripe' and v_existing_payment_id is distinct from p_provider_payment_id then
      raise exception 'idempotency key belongs to a different Stripe payment';
    end if;
    if v_existing_amount <> p_amount_micros then
      raise exception 'idempotency key replay amount differs from original grant';
    end if;
    return v_existing;
  end if;

  v_balance := v_balance + p_amount_micros;
  insert into public.ai_credit_ledger (
    user_id, kind, amount_micros, balance_after_micros, rail,
    provider_payment_id, checkout_id, idempotency_key, metadata
  ) values (
    p_user_id, 'top_up', p_amount_micros, v_balance, p_rail,
    p_provider_payment_id, p_checkout_id, p_idempotency_key,
    coalesce(p_metadata, '{}'::jsonb)
  );

  if nullif(trim(p_provider_payment_id), '') is not null then
    insert into video_funding_private.credit_payment_claims (
      rail, provider_payment_id, purpose, destination, account_id
    ) values (p_rail, p_provider_payment_id, 'general', null, p_user_id);
  end if;

  update public.ai_credit_accounts
     set balance_micros = v_balance, updated_at = now()
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

-- Call only after the webhook has verified a Stripe signature with the live
-- endpoint secret AND independently validated event.livemode, paid status,
-- exact USD amount, account binding, and an issuer configured by an operator.
create or replace function public.allocate_video_exclusive_funding(
  p_signature_verified_live boolean,
  p_event_livemode boolean,
  p_source_event_id text,
  p_provider_payment_id text,
  p_account_id uuid,
  p_issuer_id text,
  p_purpose text,
  p_currency text,
  p_amount_micros bigint
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_allocation video_funding_private.video_funding_allocations%rowtype;
  v_claim video_funding_private.credit_payment_claims%rowtype;
  v_enabled boolean;
  v_destination text;
  v_purpose text;
  v_receipt jsonb;
begin
  if p_signature_verified_live is distinct from true
     or p_event_livemode is distinct from true then
    raise exception 'live signed payment evidence required';
  end if;
  if nullif(trim(p_source_event_id), '') is null
     or nullif(trim(p_provider_payment_id), '') is null then
    raise exception 'Stripe event and payment ids are required';
  end if;
  if p_account_id is null or p_amount_micros is null or p_amount_micros <= 0
     or p_amount_micros > 9007199254740991
     or p_purpose is distinct from 'video-exclusive'
     or upper(coalesce(p_currency, '')) <> 'USD' then
    raise exception 'invalid exclusive funding terms';
  end if;

  -- SHARE locks serialize allocations against operator disable/pin changes.
  -- A transaction that already holds both SHARE locks may finish; a disable
  -- waits for in-flight allocations, and transactions starting after it commit
  -- observe the disabled state and fail closed.
  select enabled, destination, purpose
    into v_enabled, v_destination, v_purpose
    from video_funding_private.video_funding_settings where singleton = true
    for share;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('credit-payment:stripe:' || p_provider_payment_id, 0)
  );

  select * into v_claim from video_funding_private.credit_payment_claims
   where rail = 'stripe' and provider_payment_id = p_provider_payment_id;
  if found then
    if v_claim.purpose <> 'video-exclusive'
       or v_claim.account_id <> p_account_id then
      raise exception 'payment already claimed for a different destination or identity';
    end if;
    select * into v_allocation from video_funding_private.video_funding_allocations
     where allocation_id = v_claim.allocation_id;
    if not found then raise exception 'video payment claim is incomplete'; end if;
    if v_allocation.issuer_id is distinct from p_issuer_id
       or v_allocation.purpose is distinct from p_purpose
       or v_allocation.destination is distinct from v_destination
       or v_allocation.currency is distinct from upper(p_currency)
       or v_allocation.amount_micros is distinct from p_amount_micros then
      raise exception 'payment replay terms differ from committed allocation';
    end if;
    return jsonb_build_object(
      'version', 1, 'accountId', v_allocation.account_id,
      'allocationId', v_allocation.allocation_id, 'issuerId', v_allocation.issuer_id,
      'destination', v_allocation.destination, 'currency', v_allocation.currency,
      'amountMicros', v_allocation.amount_micros, 'state', v_allocation.state
    );
  end if;

  -- Only a new allocation depends on the active gates and current issuer
  -- enrollment. Replays of an already committed immutable allocation can
  -- return its original receipt while paused, without minting anything new.
  if coalesce(v_enabled, false) is not true
     or nullif(trim(v_destination), '') is null
     or v_purpose is distinct from p_purpose then
    raise exception 'video exclusive funding is disabled';
  end if;
  perform 1 from video_funding_private.video_funding_issuers
   where issuer_id = p_issuer_id and enabled = true
   for share;
  if not found then raise exception 'funding issuer is not enabled'; end if;

  -- Legacy balances remain untouched. If this payment already has a general
  -- ledger entry, reject instead of converting or adding a second balance.
  if exists (
    select 1 from public.ai_credit_ledger
     where rail = 'stripe' and provider_payment_id = p_provider_payment_id
  ) then raise exception 'payment already granted as general credits'; end if;

  insert into video_funding_private.video_funding_allocations (
    rail, provider_payment_id, source_event_id, account_id, issuer_id, purpose,
    destination, currency, amount_micros
  ) values (
    'stripe', p_provider_payment_id, p_source_event_id, p_account_id, p_issuer_id,
    p_purpose, v_destination, 'USD', p_amount_micros
  ) returning * into v_allocation;

  insert into video_funding_private.credit_payment_claims (
    rail, provider_payment_id, purpose, destination, account_id, allocation_id, source_event_id
  ) values (
    'stripe', p_provider_payment_id, p_purpose, v_destination, p_account_id,
    v_allocation.allocation_id, p_source_event_id
  );

  v_receipt := jsonb_build_object(
    'version', 1, 'accountId', v_allocation.account_id,
    'allocationId', v_allocation.allocation_id, 'issuerId', v_allocation.issuer_id,
    'destination', v_allocation.destination, 'currency', v_allocation.currency,
    'amountMicros', v_allocation.amount_micros, 'state', v_allocation.state
  );
  insert into video_funding_private.video_funding_outbox (allocation_id, payload)
  values (v_allocation.allocation_id, v_receipt);
  return v_receipt;
end;
$$;

revoke all on function public.allocate_video_exclusive_funding(
  boolean, boolean, text, text, uuid, text, text, text, bigint
) from public, anon, authenticated;
grant execute on function public.allocate_video_exclusive_funding(
  boolean, boolean, text, text, uuid, text, text, text, bigint
) to service_role;

-- Private, read-only source lookup for a server-side consumer. This dedicated
-- schema is not exposed through PostgREST by default; no public HTTP route is
-- introduced. An absent result is not a refund, cancellation, or delivery signal.
create or replace function video_funding_private.get_video_exclusive_funding(
  p_account_id uuid,
  p_allocation_id uuid,
  p_destination text
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_allocation video_funding_private.video_funding_allocations%rowtype;
begin
  if p_account_id is null or p_allocation_id is null
     or nullif(trim(p_destination), '') is null then
    raise exception 'account, allocation, and destination are required';
  end if;

  select * into v_allocation
    from video_funding_private.video_funding_allocations
   where allocation_id = p_allocation_id
     and account_id = p_account_id
     and destination = p_destination;

  if not found then
    return null;
  end if;

  return jsonb_build_object(
    'version', 1, 'accountId', v_allocation.account_id,
    'allocationId', v_allocation.allocation_id,
    'issuerId', v_allocation.issuer_id,
    'destination', v_allocation.destination,
    'currency', v_allocation.currency,
    'amountMicros', v_allocation.amount_micros,
    'state', v_allocation.state
  );
end;
$$;

revoke all on function video_funding_private.get_video_exclusive_funding(uuid, uuid, text)
  from public, anon, authenticated;
grant execute on function video_funding_private.get_video_exclusive_funding(uuid, uuid, text)
  to service_role;

-- Supabase/PostgREST entry point for the private APP server credential. The
-- public schema wrapper is callable only by service_role; it exposes no table
-- access and performs no writes. Client/anon roles cannot execute it.
create or replace function public.get_video_exclusive_funding(
  p_account_id uuid,
  p_allocation_id uuid,
  p_destination text
)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select video_funding_private.get_video_exclusive_funding(
    p_account_id, p_allocation_id, p_destination
  );
$$;

revoke all on function public.get_video_exclusive_funding(uuid, uuid, text)
  from public, anon, authenticated;
grant execute on function public.get_video_exclusive_funding(uuid, uuid, text)
  to service_role;
