-- Metadata-only request/owner approval lifecycle. Approval records consent
-- metadata only; it never grants access to document/context contents.
ALTER TABLE public.team_space_requests
  ADD COLUMN request_kind text NOT NULL DEFAULT 'document'
    CHECK (request_kind IN ('document','context')),
  ADD COLUMN metadata jsonb NOT NULL DEFAULT '{}'::jsonb
    CHECK (jsonb_typeof(metadata)='object' AND pg_catalog.octet_length(metadata::text)<=2048),
  ADD COLUMN responded_at timestamptz;
UPDATE public.team_space_requests SET responded_at=updated_at WHERE status<>'pending' AND responded_at IS NULL;
ALTER TABLE public.team_space_requests ADD CONSTRAINT team_space_requests_status_time_check CHECK
  ((status='pending' AND responded_at IS NULL) OR (status<>'pending' AND responded_at IS NOT NULL));
CREATE UNIQUE INDEX team_space_requests_one_pending_idx
  ON public.team_space_requests(space_id,requester_user_id) WHERE status='pending';
REVOKE ALL ON public.team_space_requests FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.team_space_requests TO service_role;

CREATE OR REPLACE FUNCTION public.create_team_space_request(
 p_user_id uuid,p_space_id uuid,p_request_kind text,p_manifest_hash text,p_metadata jsonb DEFAULT '{}'::jsonb)
RETURNS TABLE(id uuid,status text,request_kind text,manifest_hash text,metadata jsonb,created_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE existing public.team_space_requests%rowtype; owner_id uuid;
BEGIN
 IF p_user_id IS NULL OR p_space_id IS NULL OR p_request_kind IS NULL OR p_request_kind NOT IN ('document','context') OR
    p_manifest_hash IS NULL OR p_manifest_hash !~ '^[0-9a-f]{64}$' OR p_metadata IS NULL OR jsonb_typeof(p_metadata)<>'object' OR octet_length(p_metadata::text)>2048 OR
    EXISTS(SELECT 1 FROM jsonb_each(p_metadata) e WHERE e.key NOT IN ('label','category','itemCount') OR
      (e.key IN ('label','category') AND (jsonb_typeof(e.value)<>'string' OR char_length(e.value#>>'{}')>120)) OR
      (e.key='itemCount' AND jsonb_typeof(e.value)<>'number')) THEN
   RAISE EXCEPTION 'invalid request metadata';
 END IF;
 IF NOT coalesce((SELECT e.eligible FROM public.get_team_entitlement(p_user_id) e LIMIT 1),false) THEN RAISE EXCEPTION 'team entitlement required'; END IF;
 SELECT s.owner_user_id INTO owner_id FROM public.team_shared_spaces s WHERE s.id=p_space_id;
 IF owner_id IS NULL OR NOT coalesce((SELECT e.eligible FROM public.get_team_entitlement(owner_id) e LIMIT 1),false) OR owner_id=p_user_id THEN
   RETURN; -- do not disclose unrelated/ineligible space existence
 END IF;
 -- Explicit relationship: requester must have accepted the owner's invitation.
 IF NOT EXISTS(SELECT 1 FROM public.team_space_invitations i WHERE i.space_id=p_space_id AND i.invitee_user_id=p_user_id AND i.status='accepted') THEN RETURN; END IF;
 SELECT r.* INTO existing FROM public.team_space_requests r WHERE r.space_id=p_space_id AND r.requester_user_id=p_user_id;
 IF FOUND THEN
   IF existing.manifest_hash<>p_manifest_hash OR existing.request_kind<>p_request_kind OR existing.metadata<>p_metadata THEN RAISE EXCEPTION 'request already exists with different metadata'; END IF;
   RETURN QUERY SELECT existing.id,existing.status,existing.request_kind,existing.manifest_hash,existing.metadata,existing.created_at; RETURN;
 END IF;
 RETURN QUERY INSERT INTO public.team_space_requests(space_id,requester_user_id,status,manifest_hash,request_kind,metadata)
 VALUES(p_space_id,p_user_id,'pending',p_manifest_hash,p_request_kind,p_metadata)
 RETURNING team_space_requests.id,team_space_requests.status,team_space_requests.request_kind,team_space_requests.manifest_hash,team_space_requests.metadata,team_space_requests.created_at;
END; $$;

CREATE OR REPLACE FUNCTION public.respond_team_space_request(p_user_id uuid,p_request_id uuid,p_accept boolean)
RETURNS TABLE(id uuid,status text,request_kind text,manifest_hash text,metadata jsonb,responded_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE r public.team_space_requests%rowtype; owner_id uuid;
BEGIN
 IF p_user_id IS NULL OR p_request_id IS NULL OR p_accept IS NULL THEN RAISE EXCEPTION 'invalid response'; END IF;
 IF NOT coalesce((SELECT e.eligible FROM public.get_team_entitlement(p_user_id) e LIMIT 1),false) THEN RAISE EXCEPTION 'team entitlement required'; END IF;
 SELECT q.* INTO r FROM public.team_space_requests q WHERE q.id=p_request_id FOR UPDATE;
 IF NOT FOUND THEN RETURN; END IF;
 SELECT s.owner_user_id INTO owner_id FROM public.team_shared_spaces s WHERE s.id=r.space_id;
 IF owner_id IS DISTINCT FROM p_user_id OR NOT coalesce((SELECT e.eligible FROM public.get_team_entitlement(owner_id) e LIMIT 1),false) OR
    NOT coalesce((SELECT e.eligible FROM public.get_team_entitlement(r.requester_user_id) e LIMIT 1),false) THEN RETURN; END IF;
 IF r.status='pending' THEN
   UPDATE public.team_space_requests SET status=CASE WHEN p_accept THEN 'accepted' ELSE 'declined' END,updated_at=pg_catalog.now(),responded_at=pg_catalog.now() WHERE team_space_requests.id=r.id RETURNING * INTO r;
 ELSIF r.status<>(CASE WHEN p_accept THEN 'accepted' ELSE 'declined' END) THEN
   RAISE EXCEPTION 'request is terminal';
 END IF;
 RETURN QUERY SELECT r.id,r.status,r.request_kind,r.manifest_hash,r.metadata,r.responded_at;
END; $$;

CREATE OR REPLACE FUNCTION public.list_team_space_requests(p_user_id uuid)
RETURNS TABLE(id uuid,space_id uuid,space_name text,requester_user_id uuid,status text,request_kind text,manifest_hash text,metadata jsonb,created_at timestamptz,responded_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
 SELECT r.id,r.space_id,s.name,r.requester_user_id,r.status,r.request_kind,r.manifest_hash,r.metadata,r.created_at,r.responded_at
 FROM public.team_space_requests r JOIN public.team_shared_spaces s ON s.id=r.space_id
 WHERE p_user_id IS NOT NULL AND coalesce((SELECT e.eligible FROM public.get_team_entitlement(p_user_id) e LIMIT 1),false)
 AND coalesce((SELECT e.eligible FROM public.get_team_entitlement(r.requester_user_id) e LIMIT 1),false)
 AND coalesce((SELECT e.eligible FROM public.get_team_entitlement(s.owner_user_id) e LIMIT 1),false)
 AND (r.requester_user_id=p_user_id OR s.owner_user_id=p_user_id)
 ORDER BY r.created_at DESC
$$;
DO $$ DECLARE fn text; BEGIN
 FOREACH fn IN ARRAY ARRAY['create_team_space_request(uuid,uuid,text,text,jsonb)','respond_team_space_request(uuid,uuid,boolean)','list_team_space_requests(uuid)'] LOOP
  EXECUTE 'REVOKE ALL ON FUNCTION public.'||fn||' FROM PUBLIC, anon, authenticated';
  EXECUTE 'GRANT EXECUTE ON FUNCTION public.'||fn||' TO service_role';
 END LOOP;
END $$;
