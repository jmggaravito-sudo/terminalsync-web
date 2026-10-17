-- Metadata-only employee roster for paid Team owners. Owner consumes one paid seat;
-- membership rows are independent of team_memberships/admin-comp state.
CREATE TABLE public.team_paid_roster_members (
  owner_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT pg_catalog.now(),
  PRIMARY KEY (owner_user_id, employee_user_id),
  CHECK (owner_user_id <> employee_user_id)
);
CREATE INDEX team_paid_roster_employee_idx ON public.team_paid_roster_members(employee_user_id);
ALTER TABLE public.team_paid_roster_members ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.team_paid_roster_members FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.team_paid_roster_members TO service_role;

-- Employee access is derived live from a currently paid owner. seat_count
-- includes owner; capacity reduction immediately disables excess employees.
CREATE OR REPLACE FUNCTION public.get_team_entitlement(p_user_id uuid)
RETURNS TABLE(eligible boolean, seat_limit bigint, source text, expires_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  WITH direct_sources AS (
    SELECT m.source, 1::bigint AS seat_limit, m.expires_at FROM public.team_memberships m
      WHERE m.user_id=p_user_id AND m.status='active' AND m.source='admin_comp'
        AND m.starts_at <= pg_catalog.now() AND (m.expires_at IS NULL OR m.expires_at > pg_catalog.now())
    UNION ALL
    SELECT 'paid'::text, b.seat_count, b.current_period_end FROM public.team_billing_subscriptions b
      WHERE b.user_id=p_user_id AND b.status IN ('active','trialing')
        AND (b.current_period_end IS NULL OR b.current_period_end > pg_catalog.now())
        AND (b.current_period_start IS NULL OR b.current_period_start <= pg_catalog.now())
    UNION ALL
    SELECT 'universal_trial'::text, 1::bigint, t.expires_at FROM public.team_trial_entitlements t
      WHERE t.user_id=p_user_id AND t.starts_at <= pg_catalog.now() AND t.expires_at > pg_catalog.now()
  ), roster_sources AS (
    SELECT 'paid'::text AS source, b.seat_count AS seat_limit, b.current_period_end AS expires_at
      FROM public.team_paid_roster_members r JOIN public.team_billing_subscriptions b ON b.user_id=r.owner_user_id
      WHERE r.employee_user_id=p_user_id AND b.status IN ('active','trialing')
        AND (b.current_period_end IS NULL OR b.current_period_end > pg_catalog.now())
        AND (b.current_period_start IS NULL OR b.current_period_start <= pg_catalog.now())
        AND (SELECT count(*) FROM public.team_paid_roster_members r2 WHERE r2.owner_user_id=r.owner_user_id) < b.seat_count
  ), sources AS (SELECT * FROM direct_sources UNION ALL SELECT * FROM roster_sources)
  SELECT EXISTS(SELECT 1 FROM sources), coalesce((SELECT max(s.seat_limit) FROM sources s),1),
    (SELECT s.source FROM sources s ORDER BY CASE s.source WHEN 'paid' THEN 1 WHEN 'admin_comp' THEN 2 ELSE 3 END LIMIT 1),
    (SELECT s.expires_at FROM sources s ORDER BY CASE WHEN s.expires_at IS NULL THEN 0 ELSE 1 END,s.expires_at DESC LIMIT 1)
$$;

-- Serialize mutations on the owner's billing row; seat_count includes owner.
CREATE OR REPLACE FUNCTION public.assign_team_paid_employee(p_owner_user_id uuid,p_employee_user_id uuid)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE billing public.team_billing_subscriptions%rowtype;
BEGIN
 IF p_owner_user_id IS NULL OR p_employee_user_id IS NULL OR p_owner_user_id=p_employee_user_id THEN RAISE EXCEPTION 'invalid roster member'; END IF;
 SELECT * INTO billing FROM public.team_billing_subscriptions b WHERE b.user_id=p_owner_user_id AND b.status IN ('active','trialing')
   AND (b.current_period_end IS NULL OR b.current_period_end>pg_catalog.now())
   AND (b.current_period_start IS NULL OR b.current_period_start<=pg_catalog.now())
   ORDER BY b.seat_count DESC,b.current_period_end DESC NULLS FIRST LIMIT 1 FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'active paid Team required'; END IF;
 IF EXISTS(SELECT 1 FROM public.team_paid_roster_members WHERE owner_user_id=p_owner_user_id AND employee_user_id=p_employee_user_id) THEN RETURN 'already_assigned'; END IF;
 IF (SELECT count(*) FROM public.team_paid_roster_members WHERE owner_user_id=p_owner_user_id)+1 >= billing.seat_count THEN RAISE EXCEPTION 'paid Team seat capacity reached'; END IF;
 INSERT INTO public.team_paid_roster_members(owner_user_id,employee_user_id) VALUES(p_owner_user_id,p_employee_user_id);
 RETURN 'assigned';
END; $$;

CREATE OR REPLACE FUNCTION public.revoke_team_paid_employee(p_owner_user_id uuid,p_employee_user_id uuid)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
 IF p_owner_user_id IS NULL OR p_employee_user_id IS NULL OR p_owner_user_id=p_employee_user_id THEN RAISE EXCEPTION 'invalid roster member'; END IF;
 DELETE FROM public.team_paid_roster_members WHERE owner_user_id=p_owner_user_id AND employee_user_id=p_employee_user_id;
 RETURN CASE WHEN FOUND THEN 'revoked' ELSE 'not_assigned' END;
END; $$;
ALTER TABLE public.team_paid_roster_members ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON FUNCTION public.assign_team_paid_employee(uuid,uuid),public.revoke_team_paid_employee(uuid,uuid),public.get_team_entitlement(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.assign_team_paid_employee(uuid,uuid),public.revoke_team_paid_employee(uuid,uuid),public.get_team_entitlement(uuid) TO service_role;
