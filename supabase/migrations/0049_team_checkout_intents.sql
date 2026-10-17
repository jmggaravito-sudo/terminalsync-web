-- Durable, owner-bound preparation for a future authenticated Team checkout
-- route. Intents are not entitlements and deliberately contain no customer
-- data, checkout URLs, payment data, webhook payloads, or arbitrary metadata.
CREATE TABLE public.team_checkout_intents (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  owner_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_id uuid NOT NULL,
  stripe_price_id text NOT NULL CHECK (stripe_price_id ~ '^price_[A-Za-z0-9]+$'),
  seats bigint NOT NULL CHECK (seats > 0 AND seats <= 9007199254740991),
  mode text NOT NULL CHECK (mode = 'subscription'),
  state text NOT NULL DEFAULT 'reserved'
    CHECK (state IN ('reserved', 'checkout_created', 'ambiguous', 'completed', 'expired', 'canceled')),
  idempotency_key text NOT NULL UNIQUE,
  stripe_session_id text UNIQUE,
  stripe_subscription_id text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT pg_catalog.now(),
  updated_at timestamptz NOT NULL DEFAULT pg_catalog.now(),
  UNIQUE (owner_user_id, request_id),
  CHECK (
    (state = 'reserved' AND stripe_session_id IS NULL AND stripe_subscription_id IS NULL)
    OR (state = 'checkout_created' AND stripe_session_id IS NOT NULL AND stripe_subscription_id IS NULL)
    OR (state = 'ambiguous' AND stripe_subscription_id IS NULL)
    OR (state = 'completed' AND stripe_session_id IS NOT NULL AND stripe_subscription_id IS NOT NULL)
    OR (state IN ('expired', 'canceled') AND stripe_session_id IS NOT NULL AND stripe_subscription_id IS NULL)
  )
);
ALTER TABLE public.team_checkout_intents ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.team_checkout_intents FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.team_checkout_intents TO service_role;

-- A request UUID is scoped to the authenticated owner and immutable checkout
-- terms. The only owner argument is safe because this SECURITY DEFINER RPC is
-- service-role-only; the future application route must supply its verified
-- Supabase user, never a body-provided owner.
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
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_owner_user_id::text || ':' || p_request_id::text, 0));
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
  INSERT INTO public.team_checkout_intents
    (owner_user_id, request_id, stripe_price_id, seats, mode, idempotency_key)
    VALUES (p_owner_user_id, p_request_id, p_stripe_price_id, p_seats, p_mode,
      'team-checkout:' || pg_catalog.gen_random_uuid()::text)
    RETURNING * INTO result;
  RETURN result;
END; $$;

-- A caller that cannot prove whether the provider created a session must
-- durably quarantine the intent. Replaying reserve will then fail closed.
CREATE OR REPLACE FUNCTION public.mark_team_checkout_intent_ambiguous(
  p_intent_id uuid, p_idempotency_key text
) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE intent public.team_checkout_intents%rowtype;
BEGIN
  IF p_intent_id IS NULL OR nullif(pg_catalog.btrim(p_idempotency_key), '') IS NULL THEN
    RAISE EXCEPTION 'invalid Team checkout intent ambiguity marker';
  END IF;
  SELECT * INTO intent FROM public.team_checkout_intents WHERE id = p_intent_id FOR UPDATE;
  IF NOT FOUND OR intent.idempotency_key IS DISTINCT FROM p_idempotency_key THEN
    RAISE EXCEPTION 'Team checkout intent key mismatch';
  END IF;
  IF intent.state = 'ambiguous' THEN RETURN 'ambiguous'; END IF;
  IF intent.state NOT IN ('reserved', 'checkout_created') THEN
    RAISE EXCEPTION 'Team checkout intent state conflict';
  END IF;
  UPDATE public.team_checkout_intents SET state = 'ambiguous', updated_at = pg_catalog.now()
    WHERE id = p_intent_id;
  RETURN 'ambiguous';
END; $$;

-- Bind exactly one provider session to the reserved intent. Repeating the
-- same binding is harmless; different keys or session IDs fail closed.
CREATE OR REPLACE FUNCTION public.bind_team_checkout_session(
  p_intent_id uuid, p_idempotency_key text, p_stripe_session_id text
) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE intent public.team_checkout_intents%rowtype;
BEGIN
  IF p_intent_id IS NULL OR nullif(pg_catalog.btrim(p_idempotency_key), '') IS NULL
    OR nullif(pg_catalog.btrim(p_stripe_session_id), '') IS NULL THEN
    RAISE EXCEPTION 'invalid Team checkout session binding';
  END IF;
  SELECT * INTO intent FROM public.team_checkout_intents WHERE id = p_intent_id FOR UPDATE;
  IF NOT FOUND OR intent.idempotency_key IS DISTINCT FROM p_idempotency_key THEN
    RAISE EXCEPTION 'Team checkout intent key mismatch';
  END IF;
  IF intent.state = 'checkout_created' AND intent.stripe_session_id = p_stripe_session_id THEN RETURN intent.state; END IF;
  IF intent.state <> 'reserved' OR intent.stripe_session_id IS NOT NULL THEN
    RAISE EXCEPTION 'Team checkout intent state conflict';
  END IF;
  UPDATE public.team_checkout_intents SET state = 'checkout_created',
    stripe_session_id = p_stripe_session_id, updated_at = pg_catalog.now() WHERE id = p_intent_id;
  RETURN 'checkout_created';
END; $$;

-- Reconciliation receives owner and immutable checkout terms from a trusted
-- server-side verifier. For an ambiguous intent with no known session ID, it
-- atomically binds the verified session while applying the terminal outcome.
-- It never creates subscriptions, entitlements, roster rows, or Stripe resources.
CREATE OR REPLACE FUNCTION public.reconcile_team_checkout_intent(
  p_intent_id uuid, p_owner_user_id uuid, p_stripe_price_id text, p_seats bigint,
  p_mode text, p_idempotency_key text, p_stripe_session_id text,
  p_stripe_subscription_id text, p_outcome text
) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE intent public.team_checkout_intents%rowtype;
BEGIN
  IF p_intent_id IS NULL OR p_owner_user_id IS NULL
    OR p_stripe_price_id IS NULL OR p_stripe_price_id !~ '^price_[A-Za-z0-9]+$'
    OR p_seats IS NULL OR p_seats <= 0 OR p_seats > 9007199254740991
    OR p_mode IS DISTINCT FROM 'subscription'
    OR nullif(pg_catalog.btrim(p_idempotency_key), '') IS NULL
    OR nullif(pg_catalog.btrim(p_stripe_session_id), '') IS NULL
    OR p_outcome IS NULL OR p_outcome NOT IN ('completed', 'expired', 'canceled')
    OR (p_outcome = 'completed' AND nullif(pg_catalog.btrim(p_stripe_subscription_id), '') IS NULL)
    OR (p_outcome <> 'completed' AND p_stripe_subscription_id IS NOT NULL) THEN
    RAISE EXCEPTION 'invalid Team checkout reconciliation';
  END IF;
  SELECT * INTO intent FROM public.team_checkout_intents WHERE id = p_intent_id FOR UPDATE;
  IF NOT FOUND OR intent.idempotency_key IS DISTINCT FROM p_idempotency_key
    OR intent.owner_user_id IS DISTINCT FROM p_owner_user_id
    OR intent.stripe_price_id IS DISTINCT FROM p_stripe_price_id
    OR intent.seats IS DISTINCT FROM p_seats
    OR intent.mode IS DISTINCT FROM p_mode
    OR (intent.stripe_session_id IS NOT NULL AND intent.stripe_session_id IS DISTINCT FROM p_stripe_session_id) THEN
    RAISE EXCEPTION 'Team checkout reconciliation does not match intent';
  END IF;
  IF intent.state = p_outcome AND intent.stripe_subscription_id IS NOT DISTINCT FROM p_stripe_subscription_id THEN
    RETURN intent.state;
  END IF;
  IF intent.state NOT IN ('checkout_created', 'ambiguous') THEN RAISE EXCEPTION 'Team checkout intent state conflict'; END IF;
  UPDATE public.team_checkout_intents SET state = p_outcome,
    stripe_session_id = p_stripe_session_id,
    stripe_subscription_id = p_stripe_subscription_id, updated_at = pg_catalog.now() WHERE id = p_intent_id;
  RETURN p_outcome;
END; $$;

REVOKE ALL ON FUNCTION public.reserve_team_checkout_intent(uuid,uuid,text,bigint,text),
  public.mark_team_checkout_intent_ambiguous(uuid,text),
  public.bind_team_checkout_session(uuid,text,text),
  public.reconcile_team_checkout_intent(uuid,uuid,text,bigint,text,text,text,text,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_team_checkout_intent(uuid,uuid,text,bigint,text),
  public.mark_team_checkout_intent_ambiguous(uuid,text),
  public.bind_team_checkout_session(uuid,text,text),
  public.reconcile_team_checkout_intent(uuid,uuid,text,bigint,text,text,text,text,text) TO service_role;

-- A single canonical paid subscription governs both owner and roster-member
-- paid capacity. Trial and compensation precedence/expiry behavior is unchanged.
CREATE OR REPLACE FUNCTION public.get_team_entitlement(p_user_id uuid)
RETURNS TABLE(eligible boolean, seat_limit bigint, source text, expires_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  WITH active_billing AS (
    SELECT b.*, pg_catalog.row_number() OVER (
      PARTITION BY b.user_id
      ORDER BY b.seat_count DESC, b.current_period_end DESC NULLS FIRST, b.stripe_subscription_id ASC
    ) AS canonical_rank
    FROM public.team_billing_subscriptions b
    WHERE b.status IN ('active','trialing')
      AND (b.current_period_end IS NULL OR b.current_period_end > pg_catalog.now())
      AND (b.current_period_start IS NULL OR b.current_period_start <= pg_catalog.now())
  ), direct_sources AS (
    SELECT m.source, 1::bigint AS seat_limit, m.expires_at FROM public.team_memberships m
      WHERE m.user_id=p_user_id AND m.status='active' AND m.source IN ('admin_comp','paid')
        AND m.starts_at <= pg_catalog.now() AND (m.expires_at IS NULL OR m.expires_at > pg_catalog.now())
    UNION ALL
    SELECT 'paid'::text, b.seat_count, b.current_period_end FROM active_billing b
      WHERE b.user_id=p_user_id AND b.canonical_rank=1
    UNION ALL
    SELECT 'universal_trial'::text, 1::bigint, t.expires_at FROM public.team_trial_entitlements t
      WHERE t.user_id=p_user_id AND t.starts_at <= pg_catalog.now() AND t.expires_at > pg_catalog.now()
  ), roster_sources AS (
    SELECT 'paid'::text AS source, b.seat_count AS seat_limit, b.current_period_end AS expires_at
      FROM public.team_paid_roster_members r JOIN active_billing b ON b.user_id=r.owner_user_id AND b.canonical_rank=1
      WHERE r.employee_user_id=p_user_id
        AND EXISTS (
          SELECT 1 FROM (
            SELECT r2.employee_user_id, pg_catalog.row_number() OVER (ORDER BY r2.created_at, r2.employee_user_id) AS roster_rank
              FROM public.team_paid_roster_members r2 WHERE r2.owner_user_id=r.owner_user_id
          ) ranked
          WHERE ranked.employee_user_id=r.employee_user_id AND ranked.roster_rank < b.seat_count
        )
  ), sources AS (SELECT * FROM direct_sources UNION ALL SELECT * FROM roster_sources)
  SELECT EXISTS(SELECT 1 FROM sources), coalesce((SELECT max(s.seat_limit) FROM sources s),1),
    (SELECT s.source FROM sources s ORDER BY CASE s.source WHEN 'paid' THEN 1 WHEN 'admin_comp' THEN 2 ELSE 3 END LIMIT 1),
    (SELECT s.expires_at FROM sources s ORDER BY CASE WHEN s.expires_at IS NULL THEN 0 ELSE 1 END,s.expires_at DESC LIMIT 1)
$$;
REVOKE ALL ON FUNCTION public.get_team_entitlement(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_team_entitlement(uuid) TO service_role;
