-- Owner-facing read model for the paid roster. The caller is server code using
-- service_role; the API derives owner_user_id from a verified Supabase JWT.
CREATE OR REPLACE FUNCTION public.list_team_paid_roster(p_owner_user_id uuid)
RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  WITH billing AS (
    SELECT b.seat_count
      FROM public.team_billing_subscriptions b
      WHERE b.user_id = p_owner_user_id
        AND b.status IN ('active', 'trialing')
        AND (b.current_period_end IS NULL OR b.current_period_end > pg_catalog.now())
        AND (b.current_period_start IS NULL OR b.current_period_start <= pg_catalog.now())
      ORDER BY b.seat_count DESC, b.current_period_end DESC NULLS FIRST,
               b.stripe_subscription_id ASC
      LIMIT 1
  ), ranked AS (
    SELECT r.employee_user_id, r.created_at,
           pg_catalog.row_number() OVER (ORDER BY r.created_at, r.employee_user_id) AS roster_rank
      FROM public.team_paid_roster_members r
      WHERE r.owner_user_id = p_owner_user_id
  ), snapshot AS (
    SELECT billing.seat_count,
           (SELECT pg_catalog.count(*) FROM ranked) AS assigned_count,
           COALESCE((SELECT pg_catalog.jsonb_agg(
             pg_catalog.jsonb_build_object(
               'employee_user_id', ranked.employee_user_id,
               'created_at', ranked.created_at,
               'eligible', ranked.roster_rank < billing.seat_count
             ) ORDER BY ranked.created_at, ranked.employee_user_id
           ) FROM ranked), '[]'::jsonb) AS roster,
           COALESCE((SELECT pg_catalog.count(*) FROM ranked WHERE ranked.roster_rank < billing.seat_count), 0) AS eligible_count
      FROM billing
  )
  SELECT CASE WHEN EXISTS(SELECT 1 FROM billing) THEN
    pg_catalog.jsonb_build_object(
      'has_active_team', true,
      'seat_limit', snapshot.seat_count,
      'assigned_count', snapshot.assigned_count,
      'occupied_seats', 1 + snapshot.eligible_count,
      'available_slots', GREATEST(snapshot.seat_count - 1 - snapshot.eligible_count, 0::bigint),
      'roster', snapshot.roster
    )
    ELSE pg_catalog.jsonb_build_object(
      'has_active_team', false, 'seat_limit', 0, 'assigned_count', 0,
      'occupied_seats', 0, 'available_slots', 0, 'roster', '[]'::jsonb
    ) END
    FROM (SELECT 1) AS singleton
    LEFT JOIN snapshot ON true
$$;
REVOKE ALL ON FUNCTION public.list_team_paid_roster(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.list_team_paid_roster(uuid) TO service_role;
