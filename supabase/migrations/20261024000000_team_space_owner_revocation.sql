-- Owner-controlled revocation for metadata-only Team shared spaces.
-- This is forward-only. It does not read, move, or delete any shared content.

CREATE OR REPLACE FUNCTION public.list_team_owned_space_invitations_v3(p_user_id uuid)
RETURNS TABLE(
  id uuid,
  space_id uuid,
  space_name text,
  invitee_alias text,
  status text,
  created_at timestamptz,
  responded_at timestamptz
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT i.id, i.space_id, s.name, a.alias, i.status, i.created_at, i.responded_at
  FROM public.team_space_invitations i
  JOIN public.team_shared_spaces s ON s.id = i.space_id
  LEFT JOIN public.team_aliases a ON a.user_id = i.invitee_user_id
  WHERE p_user_id IS NOT NULL
    AND coalesce((SELECT e.eligible FROM public.get_team_entitlement(p_user_id) e LIMIT 1), false)
    AND s.owner_user_id = p_user_id
    AND i.status IN ('pending', 'accepted')
  ORDER BY i.created_at DESC
$$;

CREATE OR REPLACE FUNCTION public.revoke_team_space_invitation(p_user_id uuid, p_invitation_id uuid)
RETURNS TABLE(result text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE invitation public.team_space_invitations%ROWTYPE;
BEGIN
  IF p_user_id IS NULL
     OR NOT coalesce((SELECT e.eligible FROM public.get_team_entitlement(p_user_id) e LIMIT 1), false) THEN
    RAISE EXCEPTION 'team entitlement required';
  END IF;

  SELECT i.* INTO invitation
  FROM public.team_space_invitations i
  JOIN public.team_shared_spaces s ON s.id = i.space_id
  WHERE i.id = p_invitation_id AND s.owner_user_id = p_user_id
  FOR UPDATE OF i;

  IF NOT FOUND OR invitation.status NOT IN ('pending', 'accepted') THEN
    RETURN QUERY SELECT 'unavailable'::text;
    RETURN;
  END IF;

  UPDATE public.team_space_invitations
  SET status = 'revoked', responded_at = pg_catalog.now()
  WHERE id = invitation.id;

  RETURN QUERY SELECT 'revoked'::text;
END;
$$;

REVOKE ALL ON FUNCTION public.list_team_owned_space_invitations_v3(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.revoke_team_space_invitation(uuid, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.list_team_owned_space_invitations_v3(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.revoke_team_space_invitation(uuid, uuid) TO service_role;
