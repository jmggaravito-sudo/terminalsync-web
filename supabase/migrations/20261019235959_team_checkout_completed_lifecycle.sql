-- Extend the atomic Team Checkout finalizer for post-completion lifecycle
-- events.  This replaces the latest provider-attempt-aware definition (not the
-- original 0051 version), so recovery from a durable `creating` attempt
-- remains unchanged.
--
-- A completed intent is immutable with respect to its Checkout Session,
-- Subscription, owner, price, seat count, mode, and canonical ledger metadata.
-- Only a later signed subscription update/deletion with that exact binding may
-- reach the 0038 billing ledger, while the intent row lock is held.

CREATE OR REPLACE FUNCTION public.apply_team_checkout_billing_and_finalize(
  p_intent_id uuid, p_stripe_session_id text, p_user_id uuid,
  p_stripe_customer_id text, p_stripe_subscription_id text, p_stripe_price_id text,
  p_seat_count bigint, p_status text, p_current_period_start timestamptz,
  p_current_period_end timestamptz, p_cancel_at_period_end boolean,
  p_event_id text, p_event_type text, p_event_created_at timestamptz, p_metadata jsonb
) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE i public.team_checkout_intents%rowtype; applied text;
BEGIN
  IF p_event_type NOT IN (
    'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted'
  ) THEN
    RAISE EXCEPTION 'invalid Team checkout billing event type';
  END IF;

  SELECT * INTO i FROM public.team_checkout_intents WHERE id=p_intent_id FOR UPDATE;
  IF NOT FOUND OR i.state NOT IN ('creating','checkout_created','ambiguous','completed')
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
    OR p_metadata->>'team_checkout_subscription_id' IS DISTINCT FROM p_stripe_subscription_id
    -- The ledger metadata is a canonical identity object, not an extensible
    -- bag: exact JSONB equality rejects omitted, altered, and extra keys
    -- before 0038 can persist a different immutable route binding.
    OR p_metadata IS DISTINCT FROM pg_catalog.jsonb_build_object(
      'team_checkout_intent_id', i.id::text,
      'team_checkout_session_id', p_stripe_session_id,
      'team_checkout_owner_user_id', i.owner_user_id::text,
      'team_checkout_request_id', i.request_id::text,
      'team_checkout_price_id', i.stripe_price_id,
      'team_checkout_seats', i.seats::text,
      'team_checkout_mode', i.mode,
      'team_checkout_idempotency_key', i.idempotency_key,
      'team_checkout_customer_id', p_stripe_customer_id,
      'team_checkout_subscription_id', p_stripe_subscription_id
    ) THEN
    RAISE EXCEPTION 'Team checkout billing does not match intent/session metadata';
  END IF;

  IF i.state='completed' THEN
    IF i.stripe_session_id IS DISTINCT FROM p_stripe_session_id
      OR i.stripe_subscription_id IS DISTINCT FROM p_stripe_subscription_id
      OR i.billing_sync_status IS DISTINCT FROM 'applied' THEN
      RAISE EXCEPTION 'completed Team checkout cannot be downgraded or rebound';
    END IF;

    -- The original completion event was already atomically applied before the
    -- intent became completed.  Preserve its replay posture without allowing a
    -- delayed created event to overwrite a newer lifecycle state.
    IF p_event_type='customer.subscription.created' THEN
      RETURN 'completed';
    END IF;

    -- Keep the intent lock while 0038 appends the idempotency ledger and
    -- monotonic subscription state.  No generic legacy 0038 caller can enter
    -- this route-bound branch.
    applied := public.apply_team_stripe_subscription_event(p_user_id,p_stripe_customer_id,
      p_stripe_subscription_id,p_stripe_price_id,p_seat_count,p_status,p_current_period_start,
      p_current_period_end,p_cancel_at_period_end,p_event_id,p_event_type,p_event_created_at,p_metadata);

    IF applied='reconciliation_required' THEN
      UPDATE public.team_checkout_intents
        SET billing_sync_status='pending',updated_at=pg_catalog.now()
        WHERE id=i.id;
      RETURN 'pending_reconciliation';
    END IF;
    IF applied NOT IN ('applied','duplicate','stale') THEN
      RAISE EXCEPTION 'Team billing event requires reconciliation';
    END IF;

    -- Every accepted result must have persisted the exact signed event and
    -- retain the immutable checkout binding.  Only a newly applied event can
    -- be the ledger's latest event: duplicate/stale delivery must not be
    -- rejected simply because a newer safe lifecycle event already won.
    IF NOT EXISTS (SELECT 1 FROM public.team_billing_processed_events e
        WHERE e.stripe_event_id=p_event_id AND e.user_id=p_user_id
          AND e.stripe_subscription_id=p_stripe_subscription_id AND e.event_type=p_event_type
          AND e.event_created_at=p_event_created_at
          AND e.billing_state->>'stripe_customer_id'=p_stripe_customer_id
          AND e.billing_state->>'stripe_price_id'=p_stripe_price_id
          AND (e.billing_state->>'seat_count')::bigint=p_seat_count
          AND e.billing_state->'metadata'=p_metadata) THEN
      RAISE EXCEPTION 'Team billing ledger verification failed';
    END IF;

    IF applied='applied' THEN
      IF NOT EXISTS (SELECT 1 FROM public.team_billing_subscriptions b
          WHERE b.stripe_subscription_id=p_stripe_subscription_id AND b.user_id=p_user_id
            AND b.stripe_customer_id=p_stripe_customer_id AND b.stripe_price_id=p_stripe_price_id
            AND b.seat_count=p_seat_count AND b.status<>'reconciliation_required'
            AND b.latest_event_id=p_event_id AND b.status=p_status
            AND b.current_period_start IS NOT DISTINCT FROM p_current_period_start
            AND b.current_period_end IS NOT DISTINCT FROM p_current_period_end
            AND b.cancel_at_period_end IS NOT DISTINCT FROM p_cancel_at_period_end
            AND b.metadata=p_metadata) THEN
        RAISE EXCEPTION 'Team billing ledger verification failed';
      END IF;
    ELSIF NOT EXISTS (SELECT 1 FROM public.team_billing_subscriptions b
        WHERE b.stripe_subscription_id=p_stripe_subscription_id AND b.user_id=p_user_id
          AND b.stripe_customer_id=p_stripe_customer_id AND b.stripe_price_id=p_stripe_price_id
          AND b.seat_count=p_seat_count AND b.status<>'reconciliation_required'
          AND b.metadata=p_metadata) THEN
      RAISE EXCEPTION 'Team billing ledger verification failed';
    END IF;

    UPDATE public.team_checkout_intents
      SET billing_sync_status='applied',updated_at=pg_catalog.now()
      WHERE id=i.id;
    RETURN 'completed';
  END IF;

  -- Keep initial creating/checkout_created/ambiguous finalization semantics
  -- unchanged: only an applied/duplicate 0038 event may complete the intent.
  applied := public.apply_team_stripe_subscription_event(p_user_id,p_stripe_customer_id,
    p_stripe_subscription_id,p_stripe_price_id,p_seat_count,p_status,p_current_period_start,
    p_current_period_end,p_cancel_at_period_end,p_event_id,p_event_type,p_event_created_at,p_metadata);
  IF applied='reconciliation_required' THEN
    UPDATE public.team_checkout_intents
      SET billing_sync_status='pending',updated_at=pg_catalog.now()
      WHERE id=i.id;
    RETURN 'pending_reconciliation';
  END IF;
  IF applied NOT IN ('applied','duplicate') THEN
    RAISE EXCEPTION 'Team billing event requires reconciliation';
  END IF;
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
        AND b.latest_event_id=p_event_id AND b.status=p_status
        AND b.current_period_start IS NOT DISTINCT FROM p_current_period_start
        AND b.current_period_end IS NOT DISTINCT FROM p_current_period_end
        AND b.cancel_at_period_end IS NOT DISTINCT FROM p_cancel_at_period_end
        AND b.metadata=p_metadata) THEN
    RAISE EXCEPTION 'Team billing ledger verification failed';
  END IF;
  UPDATE public.team_checkout_intents
    SET state='completed',stripe_session_id=p_stripe_session_id,
      stripe_subscription_id=p_stripe_subscription_id,
      billing_sync_status='applied',updated_at=pg_catalog.now()
    WHERE id=i.id;
  RETURN 'completed';
END; $$;

REVOKE ALL ON FUNCTION public.apply_team_checkout_billing_and_finalize(
  uuid,text,uuid,text,text,text,bigint,text,timestamptz,timestamptz,boolean,text,text,timestamptz,jsonb
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_team_checkout_billing_and_finalize(
  uuid,text,uuid,text,text,text,bigint,text,timestamptz,timestamptz,boolean,text,text,timestamptz,jsonb
) TO service_role;
