-- Keep checkout pending until its matching Team billing event is durably applied.
ALTER TABLE public.team_checkout_intents
  ADD COLUMN billing_sync_status text NOT NULL DEFAULT 'pending'
    CHECK (billing_sync_status IN ('pending', 'applied', 'released'));

-- A legacy completed intent cannot be assumed to have a verified ledger entry.
-- It therefore remains pending and is still covered by the owner-wide guard.
CREATE OR REPLACE FUNCTION public.reserve_team_checkout_intent(
  p_owner_user_id uuid, p_request_id uuid, p_stripe_price_id text,
  p_seats bigint, p_mode text
) RETURNS public.team_checkout_intents
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE result public.team_checkout_intents%rowtype;
BEGIN
  IF p_owner_user_id IS NULL OR p_request_id IS NULL OR p_stripe_price_id IS NULL
    OR p_stripe_price_id !~ '^price_[A-Za-z0-9]+$' OR p_seats IS NULL OR p_seats <= 0
    OR p_seats > 9007199254740991 OR p_mode IS DISTINCT FROM 'subscription' THEN
    RAISE EXCEPTION 'invalid Team checkout intent';
  END IF;
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_owner_user_id::text, 0));
  SELECT * INTO result FROM public.team_checkout_intents i
    WHERE i.owner_user_id=p_owner_user_id AND i.request_id=p_request_id;
  IF FOUND THEN
    IF result.stripe_price_id IS DISTINCT FROM p_stripe_price_id OR result.seats IS DISTINCT FROM p_seats
      OR result.mode IS DISTINCT FROM p_mode THEN RAISE EXCEPTION 'Team checkout intent terms conflict'; END IF;
    IF result.state='ambiguous' THEN RAISE EXCEPTION 'Team checkout intent is ambiguous; reconciliation required'; END IF;
    RETURN result;
  END IF;
  IF EXISTS (SELECT 1 FROM public.team_checkout_intents i WHERE i.owner_user_id=p_owner_user_id
    AND (i.state IN ('reserved','checkout_created','ambiguous') OR (i.state='completed' AND i.billing_sync_status<>'applied'))) THEN
    RAISE EXCEPTION 'Team checkout already in flight; reconciliation required';
  END IF;
  IF EXISTS (SELECT 1 FROM public.team_billing_subscriptions b WHERE b.user_id=p_owner_user_id
    AND b.status IN ('incomplete','active','trialing','past_due','unpaid','paused','reconciliation_required')) THEN
    RAISE EXCEPTION 'nonterminal paid Team subscription already exists';
  END IF;
  INSERT INTO public.team_checkout_intents(owner_user_id,request_id,stripe_price_id,seats,mode,idempotency_key)
    VALUES(p_owner_user_id,p_request_id,p_stripe_price_id,p_seats,p_mode,'team-checkout:'||pg_catalog.gen_random_uuid()::text)
    RETURNING * INTO result;
  RETURN result;
END; $$;

-- Session-completed is only a pending marker; it never finalizes entitlement.
CREATE OR REPLACE FUNCTION public.mark_team_checkout_session_pending(
  p_intent_id uuid, p_stripe_session_id text
) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE i public.team_checkout_intents%rowtype;
BEGIN
  SELECT * INTO i FROM public.team_checkout_intents WHERE id=p_intent_id FOR UPDATE;
  IF NOT FOUND OR nullif(pg_catalog.btrim(p_stripe_session_id),'') IS NULL
    OR i.stripe_session_id IS DISTINCT FROM p_stripe_session_id THEN RAISE EXCEPTION 'Team checkout session mismatch'; END IF;
  IF i.state='completed' THEN RETURN 'completed'; END IF;
  IF i.state NOT IN ('checkout_created','ambiguous') THEN RAISE EXCEPTION 'Team checkout intent state conflict'; END IF;
  UPDATE public.team_checkout_intents SET billing_sync_status='pending',updated_at=pg_catalog.now() WHERE id=i.id;
  RETURN 'pending_billing_sync';
END; $$;

-- Only a verified exact session expiration releases a pending checkout. Async payment failure is deliberately non-terminal.
CREATE OR REPLACE FUNCTION public.release_team_checkout_expired_session(p_intent_id uuid,p_stripe_session_id text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE i public.team_checkout_intents%rowtype;
BEGIN
  SELECT * INTO i FROM public.team_checkout_intents WHERE id=p_intent_id FOR UPDATE;
  IF NOT FOUND OR i.stripe_session_id IS DISTINCT FROM p_stripe_session_id THEN RAISE EXCEPTION 'Team checkout session mismatch'; END IF;
  IF i.state IN ('expired','canceled') THEN RETURN i.state; END IF;
  IF i.state NOT IN ('checkout_created','ambiguous') OR i.billing_sync_status='applied' THEN
    RAISE EXCEPTION 'Team checkout intent state conflict';
  END IF;
  UPDATE public.team_checkout_intents SET state='expired',billing_sync_status='released',updated_at=pg_catalog.now() WHERE id=i.id;
  RETURN 'expired';
END; $$;

CREATE OR REPLACE FUNCTION public.mark_team_checkout_async_failed(p_intent_id uuid,p_stripe_session_id text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE i public.team_checkout_intents%rowtype;
BEGIN
  SELECT * INTO i FROM public.team_checkout_intents WHERE id=p_intent_id FOR UPDATE;
  IF NOT FOUND OR i.stripe_session_id IS DISTINCT FROM p_stripe_session_id THEN RAISE EXCEPTION 'Team checkout session mismatch'; END IF;
  IF i.state='completed' THEN RETURN 'completed'; END IF;
  IF i.state NOT IN ('checkout_created','ambiguous') THEN RAISE EXCEPTION 'Team checkout intent state conflict'; END IF;
  UPDATE public.team_checkout_intents SET billing_sync_status='pending',updated_at=pg_catalog.now() WHERE id=i.id;
  RETURN 'pending_billing_sync';
END; $$;

-- Reconciliation may record non-entitling terminal outcomes, but can no longer
-- complete an intent outside the atomic ledger wrapper below.
CREATE OR REPLACE FUNCTION public.reconcile_team_checkout_intent(
  p_intent_id uuid, p_owner_user_id uuid, p_stripe_price_id text, p_seats bigint,
  p_mode text, p_idempotency_key text, p_stripe_session_id text,
  p_stripe_subscription_id text, p_outcome text
) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE i public.team_checkout_intents%rowtype;
BEGIN
  IF p_outcome='completed' THEN RAISE EXCEPTION 'completed Team checkout requires verified billing ledger'; END IF;
  IF p_intent_id IS NULL OR p_owner_user_id IS NULL OR p_stripe_price_id IS NULL
    OR p_seats IS NULL OR p_mode IS DISTINCT FROM 'subscription'
    OR nullif(pg_catalog.btrim(p_idempotency_key),'') IS NULL
    OR nullif(pg_catalog.btrim(p_stripe_session_id),'') IS NULL
    OR p_outcome NOT IN ('expired','canceled') OR p_stripe_subscription_id IS NOT NULL THEN
    RAISE EXCEPTION 'invalid Team checkout reconciliation';
  END IF;
  SELECT * INTO i FROM public.team_checkout_intents WHERE id=p_intent_id FOR UPDATE;
  IF FOUND AND i.state=p_outcome AND i.owner_user_id IS NOT DISTINCT FROM p_owner_user_id
    AND i.stripe_price_id IS NOT DISTINCT FROM p_stripe_price_id AND i.seats IS NOT DISTINCT FROM p_seats
    AND i.mode IS NOT DISTINCT FROM p_mode AND i.idempotency_key IS NOT DISTINCT FROM p_idempotency_key
    AND i.stripe_session_id IS NOT DISTINCT FROM p_stripe_session_id AND i.stripe_subscription_id IS NULL THEN
    RETURN i.state;
  END IF;
  IF NOT FOUND OR i.owner_user_id IS DISTINCT FROM p_owner_user_id OR i.stripe_price_id IS DISTINCT FROM p_stripe_price_id
    OR i.seats IS DISTINCT FROM p_seats OR i.mode IS DISTINCT FROM p_mode OR i.idempotency_key IS DISTINCT FROM p_idempotency_key
    OR (i.stripe_session_id IS NOT NULL AND i.stripe_session_id IS DISTINCT FROM p_stripe_session_id)
    OR i.state NOT IN ('checkout_created','ambiguous') THEN RAISE EXCEPTION 'Team checkout reconciliation does not match intent'; END IF;
  UPDATE public.team_checkout_intents SET state=p_outcome,stripe_session_id=p_stripe_session_id,
    billing_sync_status='released',updated_at=pg_catalog.now() WHERE id=i.id;
  RETURN p_outcome;
END; $$;

-- Atomic ledger application, exact durable read-back, then intent finalization.
CREATE OR REPLACE FUNCTION public.apply_team_checkout_billing_and_finalize(
  p_intent_id uuid, p_stripe_session_id text, p_user_id uuid,
  p_stripe_customer_id text, p_stripe_subscription_id text, p_stripe_price_id text,
  p_seat_count bigint, p_status text, p_current_period_start timestamptz,
  p_current_period_end timestamptz, p_cancel_at_period_end boolean,
  p_event_id text, p_event_type text, p_event_created_at timestamptz, p_metadata jsonb
) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE i public.team_checkout_intents%rowtype; applied text;
BEGIN
  SELECT * INTO i FROM public.team_checkout_intents WHERE id=p_intent_id FOR UPDATE;
  IF NOT FOUND OR i.state NOT IN ('checkout_created','ambiguous','completed')
    OR (i.stripe_session_id IS NOT NULL AND i.stripe_session_id IS DISTINCT FROM p_stripe_session_id)
    OR i.owner_user_id IS DISTINCT FROM p_user_id OR i.stripe_price_id IS DISTINCT FROM p_stripe_price_id
    OR i.seats IS DISTINCT FROM p_seat_count OR i.mode IS DISTINCT FROM 'subscription'
    OR p_metadata->>'team_checkout_intent_id' IS DISTINCT FROM i.id::text
    OR p_metadata->>'team_checkout_session_id' IS DISTINCT FROM p_stripe_session_id
    OR p_metadata->>'team_checkout_owner_user_id' IS DISTINCT FROM i.owner_user_id::text
    OR p_metadata->>'team_checkout_request_id' IS DISTINCT FROM i.request_id::text
    OR p_metadata->>'team_checkout_price_id' IS DISTINCT FROM i.stripe_price_id
    OR p_metadata->>'team_checkout_seats' IS DISTINCT FROM i.seats::text
    OR p_metadata->>'team_checkout_mode' IS DISTINCT FROM i.mode
    OR p_metadata->>'team_checkout_idempotency_key' IS DISTINCT FROM i.idempotency_key
    OR p_metadata->>'team_checkout_customer_id' IS DISTINCT FROM p_stripe_customer_id
    OR p_metadata->>'team_checkout_subscription_id' IS DISTINCT FROM p_stripe_subscription_id THEN
    RAISE EXCEPTION 'Team checkout billing does not match intent/session metadata';
  END IF;
  IF i.state='completed' THEN
    IF i.stripe_session_id IS DISTINCT FROM p_stripe_session_id OR i.stripe_subscription_id IS DISTINCT FROM p_stripe_subscription_id OR i.billing_sync_status<>'applied' THEN
      RAISE EXCEPTION 'completed Team checkout cannot be downgraded or rebound';
    END IF;
    RETURN 'completed';
  END IF;
  applied := public.apply_team_stripe_subscription_event(p_user_id,p_stripe_customer_id,
    p_stripe_subscription_id,p_stripe_price_id,p_seat_count,p_status,p_current_period_start,
    p_current_period_end,p_cancel_at_period_end,p_event_id,p_event_type,p_event_created_at,p_metadata);
  IF applied='reconciliation_required' THEN
    UPDATE public.team_checkout_intents SET billing_sync_status='pending',updated_at=pg_catalog.now() WHERE id=i.id;
    RETURN 'pending_reconciliation';
  END IF;
  IF applied NOT IN ('applied','duplicate') THEN RAISE EXCEPTION 'Team billing event requires reconciliation'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.team_billing_processed_events e
      WHERE e.stripe_event_id=p_event_id AND e.user_id=p_user_id
        AND e.stripe_subscription_id=p_stripe_subscription_id AND e.event_type=p_event_type
        AND e.event_created_at=p_event_created_at
        AND e.billing_state->>'stripe_customer_id'=p_stripe_customer_id
        AND e.billing_state->>'stripe_price_id'=p_stripe_price_id
        AND (e.billing_state->>'seat_count')::bigint=p_seat_count
        AND e.billing_state->'metadata'=p_metadata)
    OR NOT EXISTS (SELECT 1 FROM public.team_billing_subscriptions b
      WHERE b.stripe_subscription_id=p_stripe_subscription_id AND b.user_id=p_user_id
        AND b.stripe_customer_id=p_stripe_customer_id AND b.stripe_price_id=p_stripe_price_id
        AND b.seat_count=p_seat_count AND b.status<>'reconciliation_required'
        AND b.latest_event_id=p_event_id) THEN
    RAISE EXCEPTION 'Team billing ledger verification failed';
  END IF;
  UPDATE public.team_checkout_intents SET state='completed',stripe_session_id=p_stripe_session_id,stripe_subscription_id=p_stripe_subscription_id,
    billing_sync_status='applied',updated_at=pg_catalog.now() WHERE id=i.id;
  RETURN 'completed';
END; $$;

REVOKE ALL ON FUNCTION public.mark_team_checkout_session_pending(uuid,text),
 public.release_team_checkout_expired_session(uuid,text), public.mark_team_checkout_async_failed(uuid,text),
 public.apply_team_checkout_billing_and_finalize(uuid,text,uuid,text,text,text,bigint,text,timestamptz,timestamptz,boolean,text,text,timestamptz,jsonb)
 FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.mark_team_checkout_session_pending(uuid,text),
 public.release_team_checkout_expired_session(uuid,text), public.mark_team_checkout_async_failed(uuid,text),
 public.apply_team_checkout_billing_and_finalize(uuid,text,uuid,text,text,text,bigint,text,timestamptz,timestamptz,boolean,text,text,timestamptz,jsonb)
 TO service_role;
