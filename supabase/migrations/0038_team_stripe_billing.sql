-- Team paid billing is deliberately separate from public.subscriptions.plan.
-- Entitlement evaluation must combine this table with admin_comp membership;
-- this webhook RPC never edits team_memberships or restores/clears comp state.
CREATE TABLE public.team_billing_subscriptions (
  stripe_subscription_id text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id text NOT NULL,
  stripe_price_id text NOT NULL,
  seat_count bigint NOT NULL CHECK (seat_count > 0),
  status text NOT NULL CHECK (status IN (
    'incomplete', 'incomplete_expired', 'trialing', 'active',
    'past_due', 'canceled', 'unpaid', 'paused', 'reconciliation_required'
  )),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  latest_event_id text NOT NULL,
  latest_event_created_at timestamptz NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (current_period_end IS NULL OR current_period_start IS NULL OR current_period_end >= current_period_start)
);
CREATE INDEX team_billing_subscriptions_user_status_idx
  ON public.team_billing_subscriptions(user_id, status);

-- One Stripe customer may own several subscriptions, but may never be rebound
-- to another TerminalSync user. This binding is created atomically by the RPC.
CREATE TABLE public.team_stripe_customer_owners (
  stripe_customer_id text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- A compact billing-state snapshot is retained for idempotency/reconciliation;
-- full webhook payloads and Stripe payment details are never stored here.
CREATE TABLE public.team_billing_processed_events (
  stripe_event_id text PRIMARY KEY,
  stripe_subscription_id text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  event_created_at timestamptz NOT NULL,
  billing_state jsonb NOT NULL CHECK (jsonb_typeof(billing_state) = 'object'),
  received_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX team_billing_events_user_idx
  ON public.team_billing_processed_events(user_id, received_at DESC);

ALTER TABLE public.team_billing_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_stripe_customer_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_billing_processed_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.team_billing_subscriptions, public.team_stripe_customer_owners, public.team_billing_processed_events FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.team_billing_subscriptions, public.team_stripe_customer_owners, public.team_billing_processed_events TO service_role;

-- Idempotent, monotonic webhook write. The caller must verify the Stripe
-- signature and resolve user/price before invoking this database boundary.
-- Non-current subscriptions remain as history; cancel/past_due states stay
-- explicit, allowing entitlement policy to fail closed without deleting rows.
-- `reconciliation_required` is an internal fail-closed state, not a Stripe status;
-- consumers must not grant paid Team access for it.
CREATE OR REPLACE FUNCTION public.apply_team_stripe_subscription_event(
  p_user_id uuid,
  p_stripe_customer_id text,
  p_stripe_subscription_id text,
  p_stripe_price_id text,
  p_seat_count bigint,
  p_status text,
  p_current_period_start timestamptz,
  p_current_period_end timestamptz,
  p_cancel_at_period_end boolean,
  p_event_id text,
  p_event_type text,
  p_event_created_at timestamptz,
  p_metadata jsonb DEFAULT '{}'::jsonb
) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE inserted_event_id text;
        updated_subscription_id text;
        event_state jsonb;
        existing_event public.team_billing_processed_events%rowtype;
        existing_subscription public.team_billing_subscriptions%rowtype;
BEGIN
  IF p_user_id IS NULL OR nullif(btrim(p_stripe_customer_id), '') IS NULL
    OR nullif(btrim(p_stripe_subscription_id), '') IS NULL
    OR nullif(btrim(p_stripe_price_id), '') IS NULL
    OR p_seat_count IS NULL OR p_seat_count <= 0
    OR p_status IS NULL OR p_status NOT IN ('incomplete', 'incomplete_expired', 'trialing', 'active',
      'past_due', 'canceled', 'unpaid', 'paused')
    OR nullif(btrim(p_event_id), '') IS NULL
    OR nullif(btrim(p_event_type), '') IS NULL OR p_event_created_at IS NULL
    OR p_metadata IS NULL OR jsonb_typeof(p_metadata) <> 'object'
    OR pg_catalog.octet_length(p_metadata::text) > 4096 THEN
    RAISE EXCEPTION 'invalid Team billing event';
  END IF;

  event_state := jsonb_build_object(
    'user_id', p_user_id, 'stripe_customer_id', p_stripe_customer_id,
    'stripe_subscription_id', p_stripe_subscription_id, 'stripe_price_id', p_stripe_price_id,
    'seat_count', p_seat_count, 'status', p_status,
    'current_period_start', p_current_period_start, 'current_period_end', p_current_period_end,
    'cancel_at_period_end', p_cancel_at_period_end, 'metadata', p_metadata
  );

  INSERT INTO public.team_billing_processed_events (
    stripe_event_id, stripe_subscription_id, user_id, event_type, event_created_at, billing_state
  ) VALUES (p_event_id, p_stripe_subscription_id, p_user_id, p_event_type, p_event_created_at, event_state)
  ON CONFLICT (stripe_event_id) DO NOTHING
  RETURNING stripe_event_id INTO inserted_event_id;
  IF inserted_event_id IS NULL THEN
    SELECT * INTO existing_event FROM public.team_billing_processed_events
      WHERE stripe_event_id = p_event_id;
    IF existing_event.user_id IS DISTINCT FROM p_user_id
      OR existing_event.stripe_subscription_id IS DISTINCT FROM p_stripe_subscription_id
      OR existing_event.event_type IS DISTINCT FROM p_event_type
      OR existing_event.event_created_at IS DISTINCT FROM p_event_created_at
      OR existing_event.billing_state IS DISTINCT FROM event_state THEN
      RAISE EXCEPTION 'Team billing event ID payload conflict';
    END IF;
    RETURN 'duplicate';
  END IF;

  INSERT INTO public.team_stripe_customer_owners (stripe_customer_id, user_id)
  VALUES (p_stripe_customer_id, p_user_id)
  ON CONFLICT (stripe_customer_id) DO NOTHING;
  IF EXISTS (SELECT 1 FROM public.team_stripe_customer_owners
    WHERE stripe_customer_id = p_stripe_customer_id AND user_id <> p_user_id) THEN
    RAISE EXCEPTION 'Team Stripe customer owner conflict';
  END IF;

  INSERT INTO public.team_billing_subscriptions (
    stripe_subscription_id, user_id, stripe_customer_id, stripe_price_id,
    seat_count, status, current_period_start, current_period_end,
    cancel_at_period_end, latest_event_id, latest_event_created_at, metadata
  ) VALUES (
    p_stripe_subscription_id, p_user_id, p_stripe_customer_id, p_stripe_price_id,
    p_seat_count, p_status, p_current_period_start, p_current_period_end,
    p_cancel_at_period_end, p_event_id, p_event_created_at, p_metadata
  )
  ON CONFLICT (stripe_subscription_id) DO UPDATE SET
    stripe_customer_id = EXCLUDED.stripe_customer_id,
    stripe_price_id = EXCLUDED.stripe_price_id,
    seat_count = EXCLUDED.seat_count,
    status = EXCLUDED.status,
    current_period_start = EXCLUDED.current_period_start,
    current_period_end = EXCLUDED.current_period_end,
    cancel_at_period_end = EXCLUDED.cancel_at_period_end,
    latest_event_id = EXCLUDED.latest_event_id,
    latest_event_created_at = EXCLUDED.latest_event_created_at,
    metadata = EXCLUDED.metadata,
    updated_at = now()
  WHERE public.team_billing_subscriptions.user_id = EXCLUDED.user_id
    AND public.team_billing_subscriptions.stripe_customer_id = EXCLUDED.stripe_customer_id
    AND public.team_billing_subscriptions.latest_event_created_at < EXCLUDED.latest_event_created_at
  RETURNING stripe_subscription_id INTO updated_subscription_id;

  IF updated_subscription_id IS NOT NULL THEN RETURN 'applied'; END IF;
  -- Abort identity conflicts so the event ledger insert rolls back and a
  -- corrected mapping can retry the same event safely.
  IF EXISTS (
    SELECT 1 FROM public.team_billing_subscriptions
    WHERE stripe_subscription_id = p_stripe_subscription_id
      AND (user_id <> p_user_id OR stripe_customer_id <> p_stripe_customer_id)
  ) THEN
    -- Abort so the processed-event insert rolls back and a corrected mapping
    -- can safely retry this same Stripe event.
    RAISE EXCEPTION 'Team billing subscription owner conflict';
  END IF;

  SELECT * INTO existing_subscription FROM public.team_billing_subscriptions
    WHERE stripe_subscription_id = p_stripe_subscription_id FOR UPDATE;
  IF existing_subscription.latest_event_created_at = p_event_created_at THEN
    -- Stripe's `created` has second precision. If distinct events for the same
    -- second disagree on billing state, neither is provably newer. Persist a
    -- non-entitled status instead of leaving an earlier active state in place.
    IF existing_subscription.status = 'reconciliation_required' THEN
      UPDATE public.team_billing_subscriptions SET latest_event_id = p_event_id, updated_at = now()
        WHERE stripe_subscription_id = p_stripe_subscription_id;
      RETURN 'reconciliation_required';
    END IF;
    IF existing_subscription.stripe_price_id IS DISTINCT FROM p_stripe_price_id
      OR existing_subscription.seat_count IS DISTINCT FROM p_seat_count
      OR existing_subscription.status IS DISTINCT FROM p_status
      OR existing_subscription.current_period_start IS DISTINCT FROM p_current_period_start
      OR existing_subscription.current_period_end IS DISTINCT FROM p_current_period_end
      OR existing_subscription.cancel_at_period_end IS DISTINCT FROM p_cancel_at_period_end
      OR existing_subscription.metadata IS DISTINCT FROM p_metadata THEN
      UPDATE public.team_billing_subscriptions SET
        status = 'reconciliation_required', latest_event_id = p_event_id, updated_at = now()
        WHERE stripe_subscription_id = p_stripe_subscription_id;
      RETURN 'reconciliation_required';
    END IF;
  END IF;
  -- Older events and identical state at the same timestamp are harmless no-ops.
  RETURN 'stale';
END;
$$;

REVOKE ALL ON FUNCTION public.apply_team_stripe_subscription_event(
  uuid,text,text,text,bigint,text,timestamptz,timestamptz,boolean,text,text,timestamptz,jsonb
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_team_stripe_subscription_event(
  uuid,text,text,text,bigint,text,timestamptz,timestamptz,boolean,text,text,timestamptz,jsonb
) TO service_role;
