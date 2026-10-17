-- Serialize checkout reservations across all request IDs for an owner. This
-- prevents parallel checkout sessions and avoids selling a second subscription
-- until a dedicated seat-change flow exists.
CREATE OR REPLACE FUNCTION public.reserve_team_checkout_intent(
  p_owner_user_id uuid, p_request_id uuid, p_stripe_price_id text,
  p_seats bigint, p_mode text
) RETURNS public.team_checkout_intents
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE result public.team_checkout_intents%rowtype;
BEGIN
  IF p_owner_user_id IS NULL OR p_request_id IS NULL
    OR p_stripe_price_id IS NULL OR p_stripe_price_id !~ '^price_[A-Za-z0-9]+$'
    OR p_seats IS NULL OR p_seats <= 0 OR p_seats > 9007199254740991
    OR p_mode IS DISTINCT FROM 'subscription' THEN
    RAISE EXCEPTION 'invalid Team checkout intent';
  END IF;

  -- An owner-wide lock is required before both replay lookup and owner-level
  -- guards: locking only (owner, request) permits concurrent distinct requests.
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_owner_user_id::text, 0));

  SELECT * INTO result FROM public.team_checkout_intents i
    WHERE i.owner_user_id = p_owner_user_id AND i.request_id = p_request_id;
  IF FOUND THEN
    IF result.stripe_price_id IS DISTINCT FROM p_stripe_price_id
      OR result.seats IS DISTINCT FROM p_seats OR result.mode IS DISTINCT FROM p_mode THEN
      RAISE EXCEPTION 'Team checkout intent terms conflict';
    END IF;
    IF result.state = 'ambiguous' THEN
      RAISE EXCEPTION 'Team checkout intent is ambiguous; reconciliation required';
    END IF;
    RETURN result;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.team_checkout_intents i
    WHERE i.owner_user_id = p_owner_user_id
      AND i.state IN ('reserved', 'checkout_created', 'ambiguous')
  ) THEN
    RAISE EXCEPTION 'Team checkout already in flight; reconciliation required';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.team_billing_subscriptions b
    WHERE b.user_id = p_owner_user_id
      AND b.status IN ('active', 'trialing')
      AND (b.current_period_start IS NULL OR b.current_period_start <= pg_catalog.now())
      AND b.current_period_end IS NOT NULL
      AND b.current_period_end > pg_catalog.now()
  ) THEN
    RAISE EXCEPTION 'active paid Team subscription already exists';
  END IF;

  INSERT INTO public.team_checkout_intents
    (owner_user_id, request_id, stripe_price_id, seats, mode, idempotency_key)
    VALUES (p_owner_user_id, p_request_id, p_stripe_price_id, p_seats, p_mode,
      'team-checkout:' || pg_catalog.gen_random_uuid()::text)
    RETURNING * INTO result;
  RETURN result;
END; $$;

REVOKE ALL ON FUNCTION public.reserve_team_checkout_intent(uuid,uuid,text,bigint,text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_team_checkout_intent(uuid,uuid,text,bigint,text)
  TO service_role;
