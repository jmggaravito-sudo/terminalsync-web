-- Durable, server-owned checkout intents. A request is permanently bound to
-- account + request id + package + issuer + destination before Stripe is
-- called. Any uncertain provider outcome is reconciled, never recreated.

create table video_funding_private.video_exclusive_checkout_intents (
  account_id uuid not null references auth.users(id) on delete restrict,
  request_id uuid not null,
  amount_cents integer not null check (amount_cents in (1000, 2000)),
  amount_micros bigint not null check (
    (amount_cents = 1000 and amount_micros = 10000000) or
    (amount_cents = 2000 and amount_micros = 20000000)
  ),
  issuer_id text not null references video_funding_private.video_funding_issuers(issuer_id),
  destination text not null check (destination ~ '^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$'),
  idempotency_key text not null unique,
  state text not null check (state in ('creating', 'created', 'ambiguous')),
  stripe_session_id text unique,
  stripe_session_url text,
  created_at timestamptz,
  requested_at timestamptz not null default clock_timestamp(),
  primary key (account_id, request_id),
  check ((state = 'created') = (stripe_session_id is not null and stripe_session_url is not null and created_at is not null)),
  check (state <> 'ambiguous' or stripe_session_id is null)
);

alter table video_funding_private.video_exclusive_checkout_intents enable row level security;
revoke all on table video_funding_private.video_exclusive_checkout_intents from public, anon, authenticated, service_role;

create or replace function video_funding_private.reserve_video_exclusive_checkout(
  p_account_id uuid,
  p_request_id uuid,
  p_amount_cents integer,
  p_issuer_id text,
  p_destination text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_enabled boolean;
  v_configured_destination text;
  v_purpose text;
  v_issuer_enabled boolean;
  v_intent video_funding_private.video_exclusive_checkout_intents%rowtype;
  v_amount_micros bigint;
  v_key text;
begin
  if p_account_id is null or p_request_id is null
     or p_issuer_id is null or p_issuer_id !~ '^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$'
     or p_destination is null or p_destination !~ '^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$'
     or p_amount_cents not in (1000, 2000) then
    raise exception 'invalid checkout intent terms';
  end if;
  v_amount_micros := p_amount_cents::bigint * 10000;

  -- Serialize with operator pin/enable changes before any Stripe request.
  select enabled, destination, purpose
    into v_enabled, v_configured_destination, v_purpose
    from video_funding_private.video_funding_settings
   where singleton = true for share;
  if not found or v_enabled is not true or v_purpose is distinct from 'video-exclusive'
     or v_configured_destination is distinct from p_destination then
    raise exception 'checkout authority is disabled or destination pin differs';
  end if;
  select enabled into v_issuer_enabled
    from video_funding_private.video_funding_issuers
   where issuer_id = p_issuer_id for share;
  if not found or v_issuer_enabled is not true then
    raise exception 'checkout issuer is not enabled';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(
    'video-checkout:' || p_account_id::text || ':' || p_request_id::text, 0
  ));
  select * into v_intent
    from video_funding_private.video_exclusive_checkout_intents
   where account_id = p_account_id and request_id = p_request_id;
  if found then
    if v_intent.amount_cents is distinct from p_amount_cents
       or v_intent.amount_micros is distinct from v_amount_micros
       or v_intent.issuer_id is distinct from p_issuer_id
       or v_intent.destination is distinct from p_destination then
      raise exception 'checkout request replay terms differ';
    end if;
    if v_intent.state = 'created' then
      return jsonb_build_object(
        'status', 'created', 'checkoutId', v_intent.stripe_session_id,
        'url', v_intent.stripe_session_url
      );
    end if;
    -- A row in creating may represent a crash/timeout after Stripe accepted
    -- the request. Do not rely on provider idempotency TTL to recreate it.
    return jsonb_build_object('status', 'reconcile_required');
  end if;

  v_key := 'video-exclusive:' || pg_catalog.md5(p_account_id::text || ':' || p_request_id::text);
  insert into video_funding_private.video_exclusive_checkout_intents (
    account_id, request_id, amount_cents, amount_micros, issuer_id,
    destination, idempotency_key, state
  ) values (
    p_account_id, p_request_id, p_amount_cents, v_amount_micros, p_issuer_id,
    p_destination, v_key, 'creating'
  );
  return jsonb_build_object('status', 'create', 'idempotencyKey', v_key);
end;
$$;

create or replace function video_funding_private.complete_video_exclusive_checkout(
  p_account_id uuid,
  p_request_id uuid,
  p_idempotency_key text,
  p_stripe_session_id text,
  p_stripe_session_url text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_intent video_funding_private.video_exclusive_checkout_intents%rowtype;
begin
  if p_account_id is null or p_request_id is null
     or nullif(trim(p_idempotency_key), '') is null
     or nullif(trim(p_stripe_session_id), '') is null
     or nullif(trim(p_stripe_session_url), '') is null then
    raise exception 'invalid checkout completion';
  end if;
  update video_funding_private.video_exclusive_checkout_intents
     set state = 'created', stripe_session_id = p_stripe_session_id,
         stripe_session_url = p_stripe_session_url, created_at = clock_timestamp()
   where account_id = p_account_id and request_id = p_request_id
     and idempotency_key = p_idempotency_key and state = 'creating';
  if found then return true; end if;
  select * into v_intent from video_funding_private.video_exclusive_checkout_intents
   where account_id = p_account_id and request_id = p_request_id;
  return found and v_intent.state = 'created'
     and v_intent.idempotency_key = p_idempotency_key
     and v_intent.stripe_session_id = p_stripe_session_id
     and v_intent.stripe_session_url = p_stripe_session_url;
end;
$$;

create or replace function video_funding_private.mark_video_exclusive_checkout_ambiguous(
  p_account_id uuid, p_request_id uuid, p_idempotency_key text
)
returns boolean
language sql
security definer
set search_path = ''
as $$
  update video_funding_private.video_exclusive_checkout_intents
     set state = 'ambiguous'
   where account_id = p_account_id and request_id = p_request_id
     and idempotency_key = p_idempotency_key and state = 'creating'
  returning true;
$$;

-- The webhook must prove that the signed Checkout metadata matches a durable,
-- completed intent AND the current SQL issuer/destination authority before
-- invoking the existing atomic, global-payment-id allocation RPC.
create or replace function public.allocate_video_exclusive_funding_pinned(
  p_signature_verified_live boolean,
  p_event_livemode boolean,
  p_source_event_id text,
  p_provider_payment_id text,
  p_account_id uuid,
  p_issuer_id text,
  p_destination text,
  p_request_id uuid,
  p_checkout_session_id text,
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
  v_enabled boolean;
  v_destination text;
  v_intent video_funding_private.video_exclusive_checkout_intents%rowtype;
begin
  select enabled, destination into v_enabled, v_destination
    from video_funding_private.video_funding_settings
   where singleton = true for share;
  if not found or v_enabled is not true or v_destination is distinct from p_destination then
    raise exception 'exclusive checkout destination pin is not active';
  end if;
  select * into v_intent
    from video_funding_private.video_exclusive_checkout_intents
   where account_id = p_account_id and request_id = p_request_id and state = 'created'
   for share;
  if not found or v_intent.issuer_id is distinct from p_issuer_id
     or v_intent.destination is distinct from p_destination
     or v_intent.amount_micros is distinct from p_amount_micros
     or v_intent.stripe_session_id is distinct from p_checkout_session_id
     or nullif(trim(p_checkout_session_id), '') is null
     or p_purpose is distinct from 'video-exclusive'
     or upper(coalesce(p_currency, '')) is distinct from 'USD' then
    raise exception 'signed checkout does not match pinned durable intent';
  end if;
  return public.allocate_video_exclusive_funding(
    p_signature_verified_live, p_event_livemode, p_source_event_id,
    p_provider_payment_id, p_account_id, p_issuer_id, p_purpose,
    p_currency, p_amount_micros
  );
end;
$$;

-- PostgREST wrappers: service_role only. Private implementation/schema and
-- all intent rows remain inaccessible to anon/authenticated clients.
create or replace function public.reserve_video_exclusive_checkout(
  p_account_id uuid, p_request_id uuid, p_amount_cents integer,
  p_issuer_id text, p_destination text
)
returns jsonb language sql security invoker set search_path = '' as $$
  select video_funding_private.reserve_video_exclusive_checkout(
    p_account_id, p_request_id, p_amount_cents, p_issuer_id, p_destination
  );
$$;
create or replace function public.complete_video_exclusive_checkout(
  p_account_id uuid, p_request_id uuid, p_idempotency_key text,
  p_stripe_session_id text, p_stripe_session_url text
)
returns boolean language sql security invoker set search_path = '' as $$
  select video_funding_private.complete_video_exclusive_checkout(
    p_account_id, p_request_id, p_idempotency_key, p_stripe_session_id, p_stripe_session_url
  );
$$;
create or replace function public.mark_video_exclusive_checkout_ambiguous(
  p_account_id uuid, p_request_id uuid, p_idempotency_key text
)
returns boolean language sql security invoker set search_path = '' as $$
  select video_funding_private.mark_video_exclusive_checkout_ambiguous(
    p_account_id, p_request_id, p_idempotency_key
  );
$$;

revoke all on function video_funding_private.reserve_video_exclusive_checkout(uuid,uuid,integer,text,text) from public, anon, authenticated;
revoke all on function video_funding_private.complete_video_exclusive_checkout(uuid,uuid,text,text,text) from public, anon, authenticated;
revoke all on function video_funding_private.mark_video_exclusive_checkout_ambiguous(uuid,uuid,text) from public, anon, authenticated;
grant execute on function video_funding_private.reserve_video_exclusive_checkout(uuid,uuid,integer,text,text) to service_role;
grant execute on function video_funding_private.complete_video_exclusive_checkout(uuid,uuid,text,text,text) to service_role;
grant execute on function video_funding_private.mark_video_exclusive_checkout_ambiguous(uuid,uuid,text) to service_role;

revoke all on function public.reserve_video_exclusive_checkout(uuid,uuid,integer,text,text) from public, anon, authenticated;
revoke all on function public.complete_video_exclusive_checkout(uuid,uuid,text,text,text) from public, anon, authenticated;
revoke all on function public.mark_video_exclusive_checkout_ambiguous(uuid,uuid,text) from public, anon, authenticated;
revoke all on function public.allocate_video_exclusive_funding_pinned(boolean,boolean,text,text,uuid,text,text,uuid,text,text,text,bigint) from public, anon, authenticated;
grant execute on function public.reserve_video_exclusive_checkout(uuid,uuid,integer,text,text) to service_role;
grant execute on function public.complete_video_exclusive_checkout(uuid,uuid,text,text,text) to service_role;
grant execute on function public.mark_video_exclusive_checkout_ambiguous(uuid,uuid,text) to service_role;
grant execute on function public.allocate_video_exclusive_funding_pinned(boolean,boolean,text,text,uuid,text,text,uuid,text,text,text,bigint) to service_role;
