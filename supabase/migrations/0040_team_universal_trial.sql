-- Runs after 0039_team_shared_spaces_metadata.sql. One universal, no-card
-- Team trial per authenticated user. This is an
-- additive entitlement: it never writes subscriptions.plan or Stripe data.
CREATE TABLE public.team_trial_entitlements (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  starts_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (expires_at = starts_at + interval '168 hours')
);

ALTER TABLE public.team_trial_entitlements ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.team_trial_entitlements FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.team_trial_entitlements TO service_role;

-- Service-role only, atomic insert. There is intentionally no duration,
-- timestamp, or user input parameter: the database clock and unique key are
-- authoritative, making retries idempotent and reactivation impossible.
CREATE OR REPLACE FUNCTION public.start_team_universal_trial(p_user_id uuid)
RETURNS TABLE(result text, starts_at timestamptz, expires_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE existing public.team_trial_entitlements%rowtype;
        started timestamptz := pg_catalog.clock_timestamp();
BEGIN
  IF p_user_id IS NULL THEN RAISE EXCEPTION 'user required'; END IF;
  INSERT INTO public.team_trial_entitlements(user_id, starts_at, expires_at)
  VALUES (p_user_id, started, started + interval '168 hours')
  ON CONFLICT (user_id) DO NOTHING;
  IF FOUND THEN
    RETURN QUERY SELECT 'started'::text, started, started + interval '168 hours';
    RETURN;
  END IF;
  SELECT t.* INTO existing FROM public.team_trial_entitlements t WHERE t.user_id=p_user_id;
  RETURN QUERY SELECT 'already_claimed'::text, existing.starts_at, existing.expires_at;
END; $$;

-- Consolidated Team entitlement. Paid Stripe seats and admin-comp membership
-- remain independent of trial state; all non-expired sources are additive.
CREATE OR REPLACE FUNCTION public.get_team_entitlement(p_user_id uuid)
RETURNS TABLE(eligible boolean, seat_limit bigint, source text, expires_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  WITH sources AS (
    SELECT 'admin_comp'::text AS source, NULL::bigint AS seat_limit, m.expires_at
      FROM public.team_memberships m
      WHERE m.user_id=p_user_id AND m.status='active'
        AND m.source='admin_comp' AND (m.expires_at IS NULL OR m.expires_at > pg_catalog.now())
    UNION ALL
    SELECT 'paid'::text, b.seat_count, b.current_period_end
      FROM public.team_billing_subscriptions b
      WHERE b.user_id=p_user_id AND b.status IN ('active','trialing')
        AND (b.current_period_end IS NULL OR b.current_period_end > pg_catalog.now())
    UNION ALL
    -- One owner seat only until a paid seat quantity is provisioned.
    SELECT 'universal_trial'::text, 1::bigint, t.expires_at
      FROM public.team_trial_entitlements t
      WHERE t.user_id=p_user_id AND t.expires_at > pg_catalog.now()
  )
  SELECT EXISTS(SELECT 1 FROM sources),
         coalesce((SELECT max(s.seat_limit) FROM sources s), 1),
         (SELECT s.source FROM sources s ORDER BY CASE s.source
           WHEN 'paid' THEN 1 WHEN 'admin_comp' THEN 2 ELSE 3 END LIMIT 1),
         (SELECT s.expires_at FROM sources s ORDER BY CASE WHEN s.expires_at IS NULL THEN 0 ELSE 1 END,
           s.expires_at DESC LIMIT 1)
$$;

-- 0039's service-only shared-space gate now includes the combined Team
-- entitlement, so the no-card trial actually authorizes Team capabilities.
CREATE OR REPLACE FUNCTION public.team_shared_spaces_eligible(p_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT coalesce((SELECT e.eligible FROM public.get_team_entitlement(p_user_id) e LIMIT 1), false)
$$;
REVOKE ALL ON FUNCTION public.team_shared_spaces_eligible(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.team_shared_spaces_eligible(uuid) TO service_role;

REVOKE ALL ON FUNCTION public.start_team_universal_trial(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_team_entitlement(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.start_team_universal_trial(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_team_entitlement(uuid) TO service_role;
