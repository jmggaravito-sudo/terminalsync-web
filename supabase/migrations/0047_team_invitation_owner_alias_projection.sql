-- Invitee-only metadata projection. Alias is public only when explicitly claimed.
CREATE OR REPLACE FUNCTION public.list_team_invitations_v2(p_user_id uuid)
RETURNS TABLE(id uuid,space_id uuid,space_name text,owner_alias text,role text,status text,created_at timestamptz,responded_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
 SELECT i.id,i.space_id,s.name,a.alias,'invitee'::text,i.status,i.created_at,i.responded_at
 FROM public.team_space_invitations i
 JOIN public.team_shared_spaces s ON s.id=i.space_id
 LEFT JOIN public.team_aliases a ON a.user_id=s.owner_user_id
 WHERE p_user_id IS NOT NULL
   AND coalesce((SELECT e.eligible FROM public.get_team_entitlement(p_user_id) e LIMIT 1),false)
   AND i.invitee_user_id=p_user_id
 ORDER BY i.created_at DESC
$$;
REVOKE ALL ON FUNCTION public.list_team_invitations_v2(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.list_team_invitations_v2(uuid) TO service_role;
