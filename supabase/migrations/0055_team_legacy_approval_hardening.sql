-- Forward-only hardening for the remaining legacy Team request and shared-space
-- surfaces. These records remain metadata-only: neither display names nor
-- approval metadata may become a URL/path/content transport channel.

-- A recipient-visible shared-space name supports the intended "<nombre> de
-- Alex" presentation while keeping the alphabet deliberately small and
-- human-readable. Legacy originals are retained privately when a row cannot
-- be represented safely.
CREATE OR REPLACE FUNCTION public._team_is_safe_space_display_name_v3(
  p_name text
)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
STRICT
SET search_path = ''
AS $$
  SELECT
    pg_catalog.char_length(p_name) BETWEEN 1 AND 120
    AND p_name = pg_catalog.btrim(p_name)
    AND p_name NOT LIKE '%' || pg_catalog.chr(10) || '%'
    AND p_name NOT LIKE '%' || pg_catalog.chr(13) || '%'
    AND p_name ~ '^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 -]+$'
$$;

ALTER TABLE public.team_shared_spaces
  ADD COLUMN IF NOT EXISTS legacy_name text;

-- Keep a pre-hardening name only in a service-role-only legacy column. Names
-- that become safe after ordinary outer-space trimming retain that normalized
-- display form; all other legacy values use a bounded neutral fallback.
UPDATE public.team_shared_spaces
SET
  legacy_name = coalesce(legacy_name, name),
  name = CASE
    WHEN public._team_is_safe_space_display_name_v3(pg_catalog.btrim(name))
      THEN pg_catalog.btrim(name)
    ELSE 'Espacio compartido'
  END
WHERE NOT coalesce(public._team_is_safe_space_display_name_v3(name), false);

ALTER TABLE public.team_shared_spaces
  ADD CONSTRAINT team_shared_spaces_display_name_safe_v3
  CHECK (public._team_is_safe_space_display_name_v3(name));

-- Legacy description/external_ref values stay private in their existing table
-- columns for audit/reconciliation. New Team spaces may carry only the safe
-- display name; preserve the original RPC signature so old callers fail
-- explicitly rather than silently creating hidden metadata.
CREATE OR REPLACE FUNCTION public.register_team_space(
  p_user_id uuid,
  p_name text,
  p_description text DEFAULT NULL,
  p_external_ref text DEFAULT NULL
)
RETURNS SETOF public.team_shared_spaces
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF p_user_id IS NULL
     OR p_description IS NOT NULL
     OR p_external_ref IS NOT NULL
     OR NOT coalesce(public._team_is_safe_space_display_name_v3(p_name), false)
  THEN
    RAISE EXCEPTION 'invalid metadata';
  END IF;
  IF NOT coalesce((SELECT e.eligible FROM public.get_team_entitlement(p_user_id) e LIMIT 1), false) THEN
    RAISE EXCEPTION 'team entitlement required';
  END IF;
  RETURN QUERY
    INSERT INTO public.team_shared_spaces(owner_user_id, name)
    VALUES (p_user_id, p_name)
    RETURNING *;
END;
$$;

-- A legacy request is still a consent prompt. Keep only an optional numeric
-- item count; request_kind and the server-private commitment hash provide the
-- remaining classification. This mirrors the v3 conversation metadata boundary.
CREATE OR REPLACE FUNCTION public._team_is_safe_legacy_request_metadata_v3(
  p_metadata jsonb
)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
STRICT
SET search_path = ''
AS $$
  SELECT
    pg_catalog.jsonb_typeof(p_metadata) = 'object'
    AND pg_catalog.octet_length(p_metadata::text) <= 64
    AND (
      p_metadata = '{}'::jsonb
      OR (
        p_metadata ? 'itemCount'
        AND p_metadata - 'itemCount' = '{}'::jsonb
        AND pg_catalog.jsonb_typeof(p_metadata -> 'itemCount') = 'number'
        AND (p_metadata ->> 'itemCount')::numeric BETWEEN 0 AND 1000000
        AND pg_catalog.trunc((p_metadata ->> 'itemCount')::numeric) = (p_metadata ->> 'itemCount')::numeric
      )
    )
$$;

-- Sanitize pre-existing free-form legacy request metadata before the durable
-- column constraint is installed. Preserve a valid numeric count, never text.
UPDATE public.team_space_requests
SET metadata = CASE
  WHEN public._team_is_safe_legacy_request_metadata_v3(
    pg_catalog.jsonb_build_object('itemCount', metadata -> 'itemCount')
  ) THEN pg_catalog.jsonb_build_object('itemCount', metadata -> 'itemCount')
  ELSE '{}'::jsonb
END
WHERE NOT coalesce(public._team_is_safe_legacy_request_metadata_v3(metadata), false);

ALTER TABLE public.team_space_requests
  ADD CONSTRAINT team_space_requests_metadata_safe_v3
  CHECK (public._team_is_safe_legacy_request_metadata_v3(metadata));

CREATE OR REPLACE FUNCTION public.create_team_space_request(
  p_user_id uuid,
  p_space_id uuid,
  p_request_kind text,
  p_manifest_hash text,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS TABLE(
  id uuid,
  status text,
  request_kind text,
  manifest_hash text,
  metadata jsonb,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  existing public.team_space_requests%rowtype;
  owner_id uuid;
BEGIN
  IF p_user_id IS NULL
     OR p_space_id IS NULL
     OR p_request_kind IS NULL OR p_request_kind NOT IN ('document', 'context')
     OR p_manifest_hash IS NULL OR p_manifest_hash !~ '^[0-9a-f]{64}$'
     OR NOT coalesce(public._team_is_safe_legacy_request_metadata_v3(p_metadata), false)
  THEN
    RAISE EXCEPTION 'invalid request metadata';
  END IF;
  IF NOT coalesce((SELECT e.eligible FROM public.get_team_entitlement(p_user_id) e LIMIT 1), false) THEN
    RAISE EXCEPTION 'team entitlement required';
  END IF;
  SELECT s.owner_user_id INTO owner_id
  FROM public.team_shared_spaces s
  WHERE s.id = p_space_id;
  IF owner_id IS NULL
     OR NOT coalesce((SELECT e.eligible FROM public.get_team_entitlement(owner_id) e LIMIT 1), false)
     OR owner_id = p_user_id
  THEN
    RETURN;
  END IF;
  IF NOT EXISTS(
    SELECT 1
    FROM public.team_space_invitations i
    WHERE i.space_id = p_space_id
      AND i.inviter_user_id = owner_id
      AND i.invitee_user_id = p_user_id
      AND i.status = 'accepted'
  ) THEN
    RETURN;
  END IF;

  INSERT INTO public.team_space_requests(
    space_id, requester_user_id, status, manifest_hash, request_kind, metadata
  )
  VALUES (p_space_id, p_user_id, 'pending', p_manifest_hash, p_request_kind, p_metadata)
  ON CONFLICT (space_id, requester_user_id) DO NOTHING
  RETURNING * INTO existing;
  IF FOUND THEN
    RETURN QUERY
      SELECT existing.id, existing.status, existing.request_kind,
             existing.manifest_hash, existing.metadata, existing.created_at;
    RETURN;
  END IF;

  SELECT r.* INTO existing
  FROM public.team_space_requests r
  WHERE r.space_id = p_space_id AND r.requester_user_id = p_user_id
  FOR UPDATE;
  IF NOT FOUND
     OR existing.manifest_hash IS DISTINCT FROM p_manifest_hash
     OR existing.request_kind IS DISTINCT FROM p_request_kind
     OR existing.metadata IS DISTINCT FROM p_metadata
  THEN
    RAISE EXCEPTION 'request already exists with different metadata';
  END IF;
  RETURN QUERY
    SELECT existing.id, existing.status, existing.request_kind,
           existing.manifest_hash, existing.metadata, existing.created_at;
END;
$$;

CREATE OR REPLACE FUNCTION public.respond_team_space_request(
  p_user_id uuid,
  p_request_id uuid,
  p_accept boolean
)
RETURNS TABLE(
  id uuid,
  status text,
  request_kind text,
  manifest_hash text,
  metadata jsonb,
  responded_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  r public.team_space_requests%rowtype;
  owner_id uuid;
BEGIN
  IF p_user_id IS NULL OR p_request_id IS NULL OR p_accept IS NULL THEN
    RAISE EXCEPTION 'invalid response';
  END IF;
  IF NOT coalesce((SELECT e.eligible FROM public.get_team_entitlement(p_user_id) e LIMIT 1), false) THEN
    RAISE EXCEPTION 'team entitlement required';
  END IF;
  SELECT q.* INTO r
  FROM public.team_space_requests q
  WHERE q.id = p_request_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RETURN;
  END IF;
  SELECT s.owner_user_id INTO owner_id
  FROM public.team_shared_spaces s
  WHERE s.id = r.space_id;
  IF owner_id IS DISTINCT FROM p_user_id
     OR NOT coalesce((SELECT e.eligible FROM public.get_team_entitlement(owner_id) e LIMIT 1), false)
     OR NOT coalesce((SELECT e.eligible FROM public.get_team_entitlement(r.requester_user_id) e LIMIT 1), false)
  THEN
    RETURN;
  END IF;
  IF r.status = 'pending' THEN
    UPDATE public.team_space_requests
    SET status = CASE WHEN p_accept THEN 'accepted' ELSE 'declined' END,
        updated_at = pg_catalog.now(),
        responded_at = pg_catalog.now()
    WHERE team_space_requests.id = r.id
    RETURNING * INTO r;
  ELSIF r.status <> (CASE WHEN p_accept THEN 'accepted' ELSE 'declined' END) THEN
    RAISE EXCEPTION 'request is terminal';
  END IF;
  RETURN QUERY
    SELECT r.id, r.status, r.request_kind, r.manifest_hash, r.metadata, r.responded_at;
END;
$$;

-- The v1 list remains service-role-only for internal compatibility. It keeps
-- internal requester/hash fields private while still constructing a count-only
-- metadata value. The v2 browser projection never includes those internals.
CREATE OR REPLACE FUNCTION public.list_team_space_requests(
  p_user_id uuid
)
RETURNS TABLE(
  id uuid,
  space_id uuid,
  space_name text,
  requester_user_id uuid,
  status text,
  request_kind text,
  manifest_hash text,
  metadata jsonb,
  created_at timestamptz,
  responded_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    r.id,
    r.space_id,
    s.name,
    r.requester_user_id,
    r.status,
    r.request_kind,
    r.manifest_hash,
    CASE
      WHEN public._team_is_safe_legacy_request_metadata_v3(r.metadata) THEN r.metadata
      ELSE '{}'::jsonb
    END,
    r.created_at,
    r.responded_at
  FROM public.team_space_requests r
  JOIN public.team_shared_spaces s ON s.id = r.space_id
  WHERE p_user_id IS NOT NULL
    AND coalesce((SELECT e.eligible FROM public.get_team_entitlement(p_user_id) e LIMIT 1), false)
    AND coalesce((SELECT e.eligible FROM public.get_team_entitlement(r.requester_user_id) e LIMIT 1), false)
    AND coalesce((SELECT e.eligible FROM public.get_team_entitlement(s.owner_user_id) e LIMIT 1), false)
    AND public._team_is_safe_space_display_name_v3(s.name)
    AND (r.requester_user_id = p_user_id OR s.owner_user_id = p_user_id)
  ORDER BY r.created_at DESC
$$;

CREATE OR REPLACE FUNCTION public.list_team_space_requests_v2(
  p_user_id uuid
)
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
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    r.id,
    r.space_id,
    s.name,
    CASE WHEN s.owner_user_id = p_user_id THEN 'owner'::text ELSE 'requester'::text END,
    (s.owner_user_id = p_user_id AND r.status = 'pending'),
    r.status,
    r.request_kind,
    CASE
      WHEN public._team_is_safe_legacy_request_metadata_v3(r.metadata) THEN r.metadata
      ELSE '{}'::jsonb
    END,
    r.created_at,
    r.responded_at
  FROM public.team_space_requests r
  JOIN public.team_shared_spaces s ON s.id = r.space_id
  WHERE p_user_id IS NOT NULL
    AND coalesce((SELECT e.eligible FROM public.get_team_entitlement(p_user_id) e LIMIT 1), false)
    AND coalesce((SELECT e.eligible FROM public.get_team_entitlement(r.requester_user_id) e LIMIT 1), false)
    AND coalesce((SELECT e.eligible FROM public.get_team_entitlement(s.owner_user_id) e LIMIT 1), false)
    AND public._team_is_safe_space_display_name_v3(s.name)
    AND (r.requester_user_id = p_user_id OR s.owner_user_id = p_user_id)
  ORDER BY r.created_at DESC
$$;

-- Recreate invitation v2 as an explicit safe display-name projection. Legacy
-- description/external_ref columns are not selected here and are never browser
-- output fields.
CREATE OR REPLACE FUNCTION public.list_team_invitations_v2(
  p_user_id uuid
)
RETURNS TABLE(
  id uuid,
  space_id uuid,
  space_name text,
  owner_alias text,
  role text,
  status text,
  created_at timestamptz,
  responded_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    i.id,
    i.space_id,
    s.name,
    a.alias,
    'invitee'::text,
    i.status,
    i.created_at,
    i.responded_at
  FROM public.team_space_invitations i
  JOIN public.team_shared_spaces s ON s.id = i.space_id
  LEFT JOIN public.team_aliases a ON a.user_id = s.owner_user_id
  WHERE p_user_id IS NOT NULL
    AND coalesce((SELECT e.eligible FROM public.get_team_entitlement(p_user_id) e LIMIT 1), false)
    AND i.invitee_user_id = p_user_id
    AND public._team_is_safe_space_display_name_v3(s.name)
  ORDER BY i.created_at DESC
$$;

DO $$
DECLARE fn text;
BEGIN
  FOREACH fn IN ARRAY ARRAY[
    '_team_is_safe_space_display_name_v3(text)',
    '_team_is_safe_legacy_request_metadata_v3(jsonb)',
    'register_team_space(uuid,text,text,text)',
    'create_team_space_request(uuid,uuid,text,text,jsonb)',
    'respond_team_space_request(uuid,uuid,boolean)',
    'list_team_space_requests(uuid)',
    'list_team_space_requests_v2(uuid)',
    'list_team_invitations_v2(uuid)'
  ] LOOP
    EXECUTE 'REVOKE ALL ON FUNCTION public.' || fn || ' FROM PUBLIC, anon, authenticated';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.' || fn || ' TO service_role';
  END LOOP;
END
$$;
