-- Metadata-only Team alias and space invitation API. No shared content is
-- stored, read, decrypted, imported, or delivered by this protocol.
CREATE OR REPLACE FUNCTION public.claim_team_alias(p_user_id uuid, p_alias text)
RETURNS TABLE(alias text) LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE normalized text := pg_catalog.lower(pg_catalog.btrim(p_alias));
BEGIN
  IF p_user_id IS NULL OR normalized IS NULL OR normalized !~ '^[a-z0-9][a-z0-9._-]{1,28}[a-z0-9]$' OR normalized LIKE '%..%' THEN RAISE EXCEPTION 'invalid alias'; END IF;
  IF NOT coalesce((SELECT e.eligible FROM public.get_team_entitlement(p_user_id) e LIMIT 1),false) THEN RAISE EXCEPTION 'team entitlement required'; END IF;
  INSERT INTO public.team_aliases(user_id,alias) VALUES(p_user_id,normalized)
  ON CONFLICT(user_id) DO UPDATE SET alias=excluded.alias,updated_at=pg_catalog.now();
  RETURN QUERY SELECT normalized;
EXCEPTION WHEN unique_violation THEN RAISE EXCEPTION 'alias unavailable';
END; $$;

CREATE OR REPLACE FUNCTION public.register_team_space(p_user_id uuid,p_name text,p_description text DEFAULT NULL,p_external_ref text DEFAULT NULL)
RETURNS SETOF public.team_shared_spaces LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
 IF p_user_id IS NULL OR p_name IS NULL OR pg_catalog.char_length(pg_catalog.btrim(p_name)) NOT BETWEEN 1 AND 120 OR pg_catalog.char_length(coalesce(p_description,''))>500 OR pg_catalog.char_length(coalesce(p_external_ref,''))>256 THEN RAISE EXCEPTION 'invalid metadata'; END IF;
 IF NOT coalesce((SELECT e.eligible FROM public.get_team_entitlement(p_user_id) e LIMIT 1),false) THEN RAISE EXCEPTION 'team entitlement required'; END IF;
 RETURN QUERY INSERT INTO public.team_shared_spaces(owner_user_id,name,description,external_ref) VALUES(p_user_id,pg_catalog.btrim(p_name),p_description,p_external_ref) RETURNING *;
END; $$;

CREATE OR REPLACE FUNCTION public.list_team_spaces(p_user_id uuid)
RETURNS SETOF public.team_shared_spaces LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
 SELECT s.* FROM public.team_shared_spaces s WHERE p_user_id IS NOT NULL AND coalesce((SELECT e.eligible FROM public.get_team_entitlement(p_user_id) e LIMIT 1),false) AND s.owner_user_id=p_user_id ORDER BY s.created_at DESC
$$;

CREATE OR REPLACE FUNCTION public.invite_team_alias(p_user_id uuid,p_space_id uuid,p_alias text)
RETURNS TABLE(result text) LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE target uuid;
BEGIN
 IF p_user_id IS NULL OR NOT coalesce((SELECT e.eligible FROM public.get_team_entitlement(p_user_id) e LIMIT 1),false) THEN RAISE EXCEPTION 'team entitlement required'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.team_shared_spaces s WHERE s.id=p_space_id AND s.owner_user_id=p_user_id) THEN RAISE EXCEPTION 'space unavailable'; END IF;
 SELECT a.user_id INTO target FROM public.team_aliases a WHERE a.alias=pg_catalog.lower(pg_catalog.btrim(p_alias));
 IF target IS NULL OR target=p_user_id OR NOT coalesce((SELECT e.eligible FROM public.get_team_entitlement(target) e LIMIT 1),false) THEN RETURN QUERY SELECT 'unavailable'::text; RETURN; END IF;
 INSERT INTO public.team_space_invitations(space_id,inviter_user_id,invitee_user_id) VALUES(p_space_id,p_user_id,target);
 RETURN QUERY SELECT 'invited'::text;
END; $$;

CREATE OR REPLACE FUNCTION public.respond_team_invitation(p_user_id uuid,p_invitation_id uuid,p_accept boolean)
RETURNS TABLE(result text) LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE inv public.team_space_invitations%rowtype;
BEGIN
 IF p_user_id IS NULL OR NOT coalesce((SELECT e.eligible FROM public.get_team_entitlement(p_user_id) e LIMIT 1),false) THEN RAISE EXCEPTION 'team entitlement required'; END IF;
 SELECT * INTO inv FROM public.team_space_invitations WHERE id=p_invitation_id AND invitee_user_id=p_user_id FOR UPDATE;
 IF NOT FOUND THEN RETURN QUERY SELECT 'unavailable'::text; RETURN; END IF;
 IF inv.status<>'pending' THEN RETURN QUERY SELECT inv.status; RETURN; END IF;
 UPDATE public.team_space_invitations SET status=CASE WHEN p_accept THEN 'accepted' ELSE 'declined' END,responded_at=pg_catalog.now() WHERE id=inv.id;
 RETURN QUERY SELECT CASE WHEN p_accept THEN 'accepted' ELSE 'declined' END::text;
END; $$;

CREATE OR REPLACE FUNCTION public.list_team_invitations(p_user_id uuid)
RETURNS TABLE(id uuid,space_id uuid,space_name text,role text,status text,created_at timestamptz,responded_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
 SELECT i.id,i.space_id,s.name,CASE WHEN i.invitee_user_id=p_user_id THEN 'invitee' ELSE 'inviter' END,i.status,i.created_at,i.responded_at FROM public.team_space_invitations i JOIN public.team_shared_spaces s ON s.id=i.space_id WHERE p_user_id IS NOT NULL AND coalesce((SELECT e.eligible FROM public.get_team_entitlement(p_user_id) e LIMIT 1),false) AND (i.invitee_user_id=p_user_id OR i.inviter_user_id=p_user_id) ORDER BY i.created_at DESC
$$;

DO $$ DECLARE fn text; BEGIN
 FOREACH fn IN ARRAY ARRAY['claim_team_alias(uuid,text)','register_team_space(uuid,text,text,text)','list_team_spaces(uuid)','invite_team_alias(uuid,uuid,text)','respond_team_invitation(uuid,uuid,boolean)','list_team_invitations(uuid)'] LOOP
  EXECUTE 'REVOKE ALL ON FUNCTION public.'||fn||' FROM PUBLIC, anon, authenticated';
  EXECUTE 'GRANT EXECUTE ON FUNCTION public.'||fn||' TO service_role';
 END LOOP;
END $$;
