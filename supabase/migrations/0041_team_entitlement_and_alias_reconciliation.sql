-- Reconcile aliases and entitlement sources without adding shared content or
-- changing the canonical metadata-only 0039/0040 protocol.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM public.team_aliases WHERE (alias <> lower(btrim(alias)) OR alias !~ '^[a-z0-9][a-z0-9._-]{1,28}[a-z0-9]$' OR alias LIKE '%..%')) THEN
    RAISE EXCEPTION 'team_aliases contains invalid aliases; resolve manually before migration';
  END IF;
  IF EXISTS (SELECT 1 FROM public.team_aliases GROUP BY alias HAVING count(*) > 1) THEN
    RAISE EXCEPTION 'team_aliases contains duplicate aliases; resolve manually before migration';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.team_aliases'::regclass AND conname='team_aliases_alias_format_check') THEN
    ALTER TABLE public.team_aliases ADD CONSTRAINT team_aliases_alias_format_check
      CHECK (alias = lower(btrim(alias)) AND alias ~ '^[a-z0-9][a-z0-9._-]{1,28}[a-z0-9]$' AND alias NOT LIKE '%..%');
  END IF;
END $$;
CREATE UNIQUE INDEX IF NOT EXISTS team_aliases_alias_unique_idx ON public.team_aliases(alias);

CREATE OR REPLACE FUNCTION public.get_team_entitlement(p_user_id uuid)
RETURNS TABLE(eligible boolean, seat_limit bigint, source text, expires_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  WITH sources AS (
    SELECT m.source, 1::bigint AS seat_limit, m.expires_at
      FROM public.team_memberships m
      WHERE m.user_id=p_user_id AND m.status='active'
        AND m.source IN ('admin_comp','paid') AND m.starts_at <= pg_catalog.now()
        AND (m.expires_at IS NULL OR m.expires_at > pg_catalog.now())
    UNION ALL
    SELECT 'paid'::text, b.seat_count, b.current_period_end
      FROM public.team_billing_subscriptions b
      WHERE b.user_id=p_user_id AND b.status IN ('active','trialing')
        AND (b.current_period_end IS NULL OR b.current_period_end > pg_catalog.now())
    UNION ALL
    SELECT 'universal_trial'::text, 1::bigint, t.expires_at
      FROM public.team_trial_entitlements t
      WHERE t.user_id=p_user_id AND t.starts_at <= pg_catalog.now()
        AND t.expires_at > pg_catalog.now()
  )
  SELECT EXISTS(SELECT 1 FROM sources),
         coalesce((SELECT max(s.seat_limit) FROM sources s), 1),
         (SELECT s.source FROM sources s ORDER BY CASE s.source
           WHEN 'paid' THEN 1 WHEN 'admin_comp' THEN 2 ELSE 3 END LIMIT 1),
         (SELECT s.expires_at FROM sources s ORDER BY CASE WHEN s.expires_at IS NULL THEN 0 ELSE 1 END,
           s.expires_at DESC LIMIT 1)
$$;

CREATE OR REPLACE FUNCTION public.team_shared_spaces_eligible(p_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT p_user_id IS NOT NULL AND coalesce((SELECT e.eligible
    FROM public.get_team_entitlement(p_user_id) e LIMIT 1), false)
$$;
ALTER TABLE public.team_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_shared_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_space_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_space_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_space_proposals ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.team_aliases, public.team_shared_spaces, public.team_space_invitations,
  public.team_space_requests, public.team_space_proposals FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.team_aliases, public.team_shared_spaces, public.team_space_invitations,
  public.team_space_requests, public.team_space_proposals TO service_role;
REVOKE ALL ON FUNCTION public.team_shared_spaces_eligible(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.team_shared_spaces_eligible(uuid) TO service_role;
REVOKE ALL ON FUNCTION public.get_team_entitlement(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_team_entitlement(uuid) TO service_role;
