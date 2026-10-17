-- Participant-safe request listing for the UI. The legacy v1 function remains
-- unchanged for compatibility; this projection never exposes requester IDs or
-- manifest hashes and marks only pending owner rows as actionable.
CREATE OR REPLACE FUNCTION public.list_team_space_requests_v2(p_user_id uuid)
RETURNS TABLE(
  id uuid,
  space_id uuid,
  space_name text,
  role text,
  can_respond boolean,
  status text,
  request_kind text,
  metadata jsonb,
  created_at timestamptz,
  responded_at timestamptz
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT r.id,r.space_id,s.name,
         CASE WHEN s.owner_user_id=p_user_id THEN 'owner'::text ELSE 'requester'::text END,
         (s.owner_user_id=p_user_id AND r.status='pending'),
         r.status,r.request_kind,r.metadata,r.created_at,r.responded_at
  FROM public.team_space_requests r
  JOIN public.team_shared_spaces s ON s.id=r.space_id
  WHERE p_user_id IS NOT NULL
    AND coalesce((SELECT e.eligible FROM public.get_team_entitlement(p_user_id) e LIMIT 1),false)
    AND coalesce((SELECT e.eligible FROM public.get_team_entitlement(r.requester_user_id) e LIMIT 1),false)
    AND coalesce((SELECT e.eligible FROM public.get_team_entitlement(s.owner_user_id) e LIMIT 1),false)
    AND (r.requester_user_id=p_user_id OR s.owner_user_id=p_user_id)
  ORDER BY r.created_at DESC
$$;

REVOKE ALL ON FUNCTION public.list_team_space_requests_v2(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.list_team_space_requests_v2(uuid) TO service_role;
