-- Forward-only Video checkout terms.  Quote IDs are opaque executor-issued
-- strings (not UUIDs); request_hash binds the exact rendered request.  The
-- legacy intent table/functions remain as historical evidence only.  New
-- checkouts use this table and cannot alter the stable allocation/outbox RPC.

create table video_funding_private.video_exclusive_quote_checkout_intents (
  account_id uuid not null references auth.users(id) on delete restrict,
  quote_id text not null check (length(quote_id) between 1 and 500 and quote_id = btrim(quote_id) and quote_id !~ '[[:cntrl:]]'),
  request_hash text not null check (request_hash ~ '^[A-Fa-f0-9]{64}$'),
  amount_cents integer not null check (amount_cents >= 50),
  amount_micros bigint not null check (amount_micros = amount_cents::bigint * 10000),
  issuer_id text not null references video_funding_private.video_funding_issuers(issuer_id),
  destination text not null check (destination ~ '^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$'),
  idempotency_key text not null unique,
  state text not null check (state in ('creating', 'created', 'ambiguous', 'paid')),
  stripe_session_id text unique,
  stripe_session_url text,
  created_at timestamptz,
  requested_at timestamptz not null default clock_timestamp(),
  primary key (account_id, quote_id),
  check (
    (state in ('creating', 'ambiguous') and stripe_session_id is null and stripe_session_url is null and created_at is null)
    or (state = 'created' and stripe_session_id is not null and stripe_session_url is not null and created_at is not null)
    or (state = 'paid' and stripe_session_id is not null and created_at is not null)
  )
);
alter table video_funding_private.video_exclusive_quote_checkout_intents enable row level security;
revoke all on table video_funding_private.video_exclusive_quote_checkout_intents from public, anon, authenticated, service_role;

create or replace function video_funding_private.reserve_video_exclusive_checkout(
  p_account_id uuid, p_quote_id text, p_request_hash text, p_amount_cents integer,
  p_issuer_id text, p_destination text
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_enabled boolean; v_configured_destination text; v_purpose text; v_issuer_enabled boolean;
  v_intent video_funding_private.video_exclusive_quote_checkout_intents%rowtype; v_amount_micros bigint; v_key text;
begin
  if p_account_id is null or nullif(btrim(p_quote_id), '') is null or length(p_quote_id) > 500 or p_quote_id ~ '[[:cntrl:]]'
     or p_quote_id <> btrim(p_quote_id) or p_request_hash !~ '^[A-Fa-f0-9]{64}$'
     or p_amount_cents is null or p_amount_cents < 50
     or p_issuer_id is null or p_issuer_id !~ '^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$'
     or p_destination is null or p_destination !~ '^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$' then
    raise exception 'invalid quote checkout terms';
  end if;
  v_amount_micros := p_amount_cents::bigint * 10000;
  select enabled, destination, purpose into v_enabled, v_configured_destination, v_purpose
    from video_funding_private.video_funding_settings where singleton = true for share;
  if not found or v_enabled is not true or v_purpose is distinct from 'video-exclusive' or v_configured_destination is distinct from p_destination then
    raise exception 'checkout authority is disabled or destination pin differs';
  end if;
  select enabled into v_issuer_enabled from video_funding_private.video_funding_issuers where issuer_id = p_issuer_id for share;
  if not found or v_issuer_enabled is not true then raise exception 'checkout issuer is not enabled'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('video-quote-checkout:' || p_account_id::text || ':' || p_quote_id, 0));
  select * into v_intent from video_funding_private.video_exclusive_quote_checkout_intents where account_id=p_account_id and quote_id=p_quote_id;
  if found then
    if v_intent.request_hash is distinct from p_request_hash or v_intent.amount_cents is distinct from p_amount_cents
       or v_intent.amount_micros is distinct from v_amount_micros or v_intent.issuer_id is distinct from p_issuer_id or v_intent.destination is distinct from p_destination then
      raise exception 'quote checkout replay terms differ';
    end if;
    if v_intent.state='created' then return jsonb_build_object('status','created','checkoutId',v_intent.stripe_session_id,'url',v_intent.stripe_session_url); end if;
    if v_intent.state='paid' then return jsonb_build_object('status','paid'); end if;
    return jsonb_build_object('status','reconcile_required');
  end if;
  v_key := 'video-quote:' || pg_catalog.md5(p_account_id::text || ':' || p_quote_id || ':' || p_request_hash);
  insert into video_funding_private.video_exclusive_quote_checkout_intents(account_id,quote_id,request_hash,amount_cents,amount_micros,issuer_id,destination,idempotency_key,state)
  values(p_account_id,p_quote_id,p_request_hash,p_amount_cents,v_amount_micros,p_issuer_id,p_destination,v_key,'creating');
  return jsonb_build_object('status','create','idempotencyKey',v_key);
end; $$;

create or replace function video_funding_private.complete_video_exclusive_checkout(
  p_account_id uuid,p_quote_id text,p_request_hash text,p_idempotency_key text,p_stripe_session_id text,p_stripe_session_url text
) returns boolean language plpgsql security definer set search_path = '' as $$
declare v_intent video_funding_private.video_exclusive_quote_checkout_intents%rowtype;
begin
  if p_account_id is null or nullif(btrim(p_quote_id),'') is null or p_request_hash !~ '^[A-Fa-f0-9]{64}$' or nullif(btrim(p_idempotency_key),'') is null or nullif(btrim(p_stripe_session_id),'') is null or nullif(btrim(p_stripe_session_url),'') is null then raise exception 'invalid checkout completion'; end if;
  update video_funding_private.video_exclusive_quote_checkout_intents set state='created',stripe_session_id=p_stripe_session_id,stripe_session_url=p_stripe_session_url,created_at=clock_timestamp()
   where account_id=p_account_id and quote_id=p_quote_id and request_hash=p_request_hash and idempotency_key=p_idempotency_key and state='creating';
  if found then return true; end if;
  select * into v_intent from video_funding_private.video_exclusive_quote_checkout_intents where account_id=p_account_id and quote_id=p_quote_id;
  return found and v_intent.request_hash=p_request_hash and v_intent.state in ('created','paid') and v_intent.idempotency_key=p_idempotency_key and v_intent.stripe_session_id=p_stripe_session_id and (v_intent.state='paid' or v_intent.stripe_session_url=p_stripe_session_url);
end; $$;

create or replace function video_funding_private.mark_video_exclusive_checkout_ambiguous(
  p_account_id uuid,p_quote_id text,p_request_hash text,p_idempotency_key text
) returns boolean language sql security definer set search_path = '' as $$
  update video_funding_private.video_exclusive_quote_checkout_intents set state='ambiguous' where account_id=p_account_id and quote_id=p_quote_id and request_hash=p_request_hash and idempotency_key=p_idempotency_key and state='creating' returning true;
$$;

create or replace function video_funding_private.reconcile_video_exclusive_checkout(
  p_account_id uuid,p_quote_id text,p_request_hash text,p_stripe_session_id text,p_stripe_session_url text,p_issuer_id text,p_destination text,p_amount_cents integer,p_amount_micros bigint,p_currency text,p_mode text,p_livemode boolean,p_payment_status text,p_metadata jsonb
) returns boolean language plpgsql security definer set search_path = '' as $$
declare v_enabled boolean; v_destination text; v_issuer_enabled boolean; v_intent video_funding_private.video_exclusive_quote_checkout_intents%rowtype;
begin
  if p_account_id is null or nullif(btrim(p_quote_id),'') is null or p_request_hash !~ '^[A-Fa-f0-9]{64}$' or nullif(btrim(p_stripe_session_id),'') is null or p_issuer_id is null or p_destination is null or p_amount_cents < 50 or p_amount_micros <> p_amount_cents::bigint*10000 or lower(coalesce(p_currency,''))<>'usd' or p_mode is distinct from 'payment' or p_livemode is distinct from true or p_payment_status is distinct from 'paid' or p_metadata is null then raise exception 'invalid provider session reconciliation'; end if;
  select enabled,destination into v_enabled,v_destination from video_funding_private.video_funding_settings where singleton=true for share;
  if not found or v_enabled is not true or v_destination is distinct from p_destination then raise exception 'reconciliation destination authority mismatch'; end if;
  select enabled into v_issuer_enabled from video_funding_private.video_funding_issuers where issuer_id=p_issuer_id for share;
  if not found or v_issuer_enabled is not true then raise exception 'reconciliation issuer is not enabled'; end if;
  select * into v_intent from video_funding_private.video_exclusive_quote_checkout_intents where account_id=p_account_id and quote_id=p_quote_id for update;
  if not found or v_intent.request_hash is distinct from p_request_hash or v_intent.amount_cents is distinct from p_amount_cents or v_intent.amount_micros is distinct from p_amount_micros or v_intent.issuer_id is distinct from p_issuer_id or v_intent.destination is distinct from p_destination or p_metadata->>'source' is distinct from 'terminalsync_credits' or p_metadata->>'credit_funding_purpose' is distinct from 'video-exclusive' or p_metadata->>'supabase_user_id' is distinct from p_account_id::text or p_metadata->>'video_exclusive_checkout_quote_id' is distinct from p_quote_id or p_metadata->>'video_exclusive_checkout_request_hash' is distinct from p_request_hash or p_metadata->>'video_funding_issuer_id' is distinct from p_issuer_id or p_metadata->>'video_funding_destination' is distinct from p_destination or p_metadata->>'credit_amount_cents' is distinct from p_amount_cents::text or p_metadata->>'credit_amount_micros' is distinct from p_amount_micros::text or p_metadata->>'rail' is distinct from 'stripe' then raise exception 'provider session does not match durable quote checkout intent'; end if;
  if v_intent.state='paid' then
    if v_intent.stripe_session_id is distinct from p_stripe_session_id or (nullif(btrim(p_stripe_session_url),'') is not null and v_intent.stripe_session_url is not null and v_intent.stripe_session_url is distinct from nullif(btrim(p_stripe_session_url),'')) then return false; end if;
    update video_funding_private.video_exclusive_quote_checkout_intents set stripe_session_url=coalesce(stripe_session_url,nullif(btrim(p_stripe_session_url),'')) where account_id=p_account_id and quote_id=p_quote_id; return found;
  end if;
  if v_intent.state='created' then
    if v_intent.stripe_session_id is distinct from p_stripe_session_id or (nullif(btrim(p_stripe_session_url),'') is not null and v_intent.stripe_session_url is distinct from nullif(btrim(p_stripe_session_url),'')) then return false; end if;
    update video_funding_private.video_exclusive_quote_checkout_intents set state='paid',stripe_session_url=coalesce(stripe_session_url,nullif(btrim(p_stripe_session_url),'')) where account_id=p_account_id and quote_id=p_quote_id; return found;
  end if;
  if v_intent.state not in ('creating','ambiguous') then return false; end if;
  update video_funding_private.video_exclusive_quote_checkout_intents set state='paid',stripe_session_id=p_stripe_session_id,stripe_session_url=nullif(btrim(p_stripe_session_url),''),created_at=clock_timestamp() where account_id=p_account_id and quote_id=p_quote_id; return found;
end; $$;

create or replace function public.allocate_video_exclusive_funding_pinned(
  p_signature_verified_live boolean,p_event_livemode boolean,p_source_event_id text,p_provider_payment_id text,p_account_id uuid,p_issuer_id text,p_destination text,p_quote_id text,p_request_hash text,p_checkout_session_id text,p_purpose text,p_currency text,p_amount_micros bigint
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_enabled boolean; v_destination text; v_intent video_funding_private.video_exclusive_quote_checkout_intents%rowtype;
begin
 select enabled,destination into v_enabled,v_destination from video_funding_private.video_funding_settings where singleton=true for share;
 if not found or v_enabled is not true or v_destination is distinct from p_destination then raise exception 'exclusive checkout destination pin is not active'; end if;
 select * into v_intent from video_funding_private.video_exclusive_quote_checkout_intents where account_id=p_account_id and quote_id=p_quote_id and request_hash=p_request_hash and state in ('created','paid') for share;
 if not found or v_intent.issuer_id is distinct from p_issuer_id or v_intent.destination is distinct from p_destination or v_intent.amount_micros is distinct from p_amount_micros or v_intent.stripe_session_id is distinct from p_checkout_session_id or nullif(btrim(p_checkout_session_id),'') is null or p_purpose is distinct from 'video-exclusive' or upper(coalesce(p_currency,'')) is distinct from 'USD' then raise exception 'signed checkout does not match pinned durable quote intent'; end if;
 return public.allocate_video_exclusive_funding(p_signature_verified_live,p_event_livemode,p_source_event_id,p_provider_payment_id,p_account_id,p_issuer_id,p_purpose,p_currency,p_amount_micros);
end; $$;

create or replace function public.reserve_video_exclusive_checkout(p_account_id uuid,p_quote_id text,p_request_hash text,p_amount_cents integer,p_issuer_id text,p_destination text) returns jsonb language sql security invoker set search_path='' as $$ select video_funding_private.reserve_video_exclusive_checkout(p_account_id,p_quote_id,p_request_hash,p_amount_cents,p_issuer_id,p_destination); $$;
create or replace function public.complete_video_exclusive_checkout(p_account_id uuid,p_quote_id text,p_request_hash text,p_idempotency_key text,p_stripe_session_id text,p_stripe_session_url text) returns boolean language sql security invoker set search_path='' as $$ select video_funding_private.complete_video_exclusive_checkout(p_account_id,p_quote_id,p_request_hash,p_idempotency_key,p_stripe_session_id,p_stripe_session_url); $$;
create or replace function public.mark_video_exclusive_checkout_ambiguous(p_account_id uuid,p_quote_id text,p_request_hash text,p_idempotency_key text) returns boolean language sql security invoker set search_path='' as $$ select video_funding_private.mark_video_exclusive_checkout_ambiguous(p_account_id,p_quote_id,p_request_hash,p_idempotency_key); $$;
create or replace function public.reconcile_video_exclusive_checkout(p_account_id uuid,p_quote_id text,p_request_hash text,p_stripe_session_id text,p_stripe_session_url text,p_issuer_id text,p_destination text,p_amount_cents integer,p_amount_micros bigint,p_currency text,p_mode text,p_livemode boolean,p_payment_status text,p_metadata jsonb) returns boolean language sql security invoker set search_path='' as $$ select video_funding_private.reconcile_video_exclusive_checkout(p_account_id,p_quote_id,p_request_hash,p_stripe_session_id,p_stripe_session_url,p_issuer_id,p_destination,p_amount_cents,p_amount_micros,p_currency,p_mode,p_livemode,p_payment_status,p_metadata); $$;

-- Remove UUID/package APIs so no new caller can silently retain the old contract.
drop function public.reserve_video_exclusive_checkout(uuid,uuid,integer,text,text);
drop function public.complete_video_exclusive_checkout(uuid,uuid,text,text,text);
drop function public.mark_video_exclusive_checkout_ambiguous(uuid,uuid,text);
drop function public.reconcile_video_exclusive_checkout(uuid,uuid,text,text,text,text,integer,bigint,text,text,boolean,text,jsonb);
drop function public.allocate_video_exclusive_funding_pinned(boolean,boolean,text,text,uuid,text,text,uuid,text,text,text,bigint);
drop function video_funding_private.reserve_video_exclusive_checkout(uuid,uuid,integer,text,text);
drop function video_funding_private.complete_video_exclusive_checkout(uuid,uuid,text,text,text);
drop function video_funding_private.mark_video_exclusive_checkout_ambiguous(uuid,uuid,text);
drop function video_funding_private.reconcile_video_exclusive_checkout(uuid,uuid,text,text,text,text,integer,bigint,text,text,boolean,text,jsonb);

revoke all on function video_funding_private.reserve_video_exclusive_checkout(uuid,text,text,integer,text,text) from public,anon,authenticated;
revoke all on function video_funding_private.complete_video_exclusive_checkout(uuid,text,text,text,text,text) from public,anon,authenticated;
revoke all on function video_funding_private.mark_video_exclusive_checkout_ambiguous(uuid,text,text,text) from public,anon,authenticated;
revoke all on function video_funding_private.reconcile_video_exclusive_checkout(uuid,text,text,text,text,text,text,integer,bigint,text,text,boolean,text,jsonb) from public,anon,authenticated;
grant execute on function video_funding_private.reserve_video_exclusive_checkout(uuid,text,text,integer,text,text) to service_role;
grant execute on function video_funding_private.complete_video_exclusive_checkout(uuid,text,text,text,text,text) to service_role;
grant execute on function video_funding_private.mark_video_exclusive_checkout_ambiguous(uuid,text,text,text) to service_role;
grant execute on function video_funding_private.reconcile_video_exclusive_checkout(uuid,text,text,text,text,text,text,integer,bigint,text,text,boolean,text,jsonb) to service_role;
revoke all on function public.reserve_video_exclusive_checkout(uuid,text,text,integer,text,text) from public,anon,authenticated;
revoke all on function public.complete_video_exclusive_checkout(uuid,text,text,text,text,text) from public,anon,authenticated;
revoke all on function public.mark_video_exclusive_checkout_ambiguous(uuid,text,text,text) from public,anon,authenticated;
revoke all on function public.reconcile_video_exclusive_checkout(uuid,text,text,text,text,text,text,integer,bigint,text,text,boolean,text,jsonb) from public,anon,authenticated;
revoke all on function public.allocate_video_exclusive_funding_pinned(boolean,boolean,text,text,uuid,text,text,text,text,text,text,text,bigint) from public,anon,authenticated;
grant execute on function public.reserve_video_exclusive_checkout(uuid,text,text,integer,text,text) to service_role;
grant execute on function public.complete_video_exclusive_checkout(uuid,text,text,text,text,text) to service_role;
grant execute on function public.mark_video_exclusive_checkout_ambiguous(uuid,text,text,text) to service_role;
grant execute on function public.reconcile_video_exclusive_checkout(uuid,text,text,text,text,text,text,integer,bigint,text,text,boolean,text,jsonb) to service_role;
grant execute on function public.allocate_video_exclusive_funding_pinned(boolean,boolean,text,text,uuid,text,text,text,text,text,text,text,bigint) to service_role;
