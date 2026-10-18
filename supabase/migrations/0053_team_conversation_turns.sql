-- Forward-only v3 conversation turns for accepted Team shared-space pairs.
-- This intentionally leaves the legacy one-request table and v1/v2 RPCs
-- untouched. A turn records only bounded request metadata plus a commitment
-- hash; it never stores, delivers, imports, decrypts, or grants access to a
-- document/context payload.

CREATE TABLE public.team_space_conversation_threads (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  space_id uuid NOT NULL REFERENCES public.team_shared_spaces(id) ON DELETE CASCADE,
  participant_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- A thread is bound to the exact accepted invitation that authorized it.
  -- A later duplicate invitation must never reactivate this relationship.
  relationship_id uuid NOT NULL REFERENCES public.team_space_invitations(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT pg_catalog.now(),
  last_activity_at timestamptz NOT NULL DEFAULT pg_catalog.now(),
  UNIQUE (relationship_id)
);
CREATE INDEX team_space_conversation_threads_activity_idx
  ON public.team_space_conversation_threads(last_activity_at DESC, id DESC);
CREATE INDEX team_space_conversation_threads_pair_idx
  ON public.team_space_conversation_threads(space_id, participant_user_id);

CREATE TABLE public.team_space_conversation_turns (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.team_space_conversation_threads(id) ON DELETE CASCADE,
  initiator_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_operation_id uuid NOT NULL,
  request_kind text NOT NULL CHECK (request_kind IN ('document','context')),
  manifest_hash text NOT NULL CHECK (manifest_hash ~ '^[0-9a-f]{64}$'),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
    CHECK (pg_catalog.jsonb_typeof(metadata)='object' AND pg_catalog.octet_length(metadata::text)<=2048),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined')),
  created_at timestamptz NOT NULL DEFAULT pg_catalog.now(),
  updated_at timestamptz NOT NULL DEFAULT pg_catalog.now(),
  responded_at timestamptz,
  response_operation_id uuid,
  CHECK (initiator_user_id <> recipient_user_id),
  CHECK (
    (status='pending' AND responded_at IS NULL AND response_operation_id IS NULL)
    OR (status IN ('accepted','declined') AND responded_at IS NOT NULL AND response_operation_id IS NOT NULL)
  ),
  UNIQUE (initiator_user_id, client_operation_id)
);
CREATE UNIQUE INDEX team_space_conversation_turn_response_operation_idx
  ON public.team_space_conversation_turns(recipient_user_id, response_operation_id)
  WHERE response_operation_id IS NOT NULL;
CREATE INDEX team_space_conversation_turns_thread_created_idx
  ON public.team_space_conversation_turns(thread_id, created_at DESC, id DESC);

ALTER TABLE public.team_space_conversation_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_space_conversation_turns ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.team_space_conversation_threads, public.team_space_conversation_turns
  FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.team_space_conversation_threads, public.team_space_conversation_turns TO service_role;

-- This is intentionally private. It validates the exact bounded metadata
-- contract before either caller can create an empty conversation thread.
CREATE OR REPLACE FUNCTION public._team_assert_conversation_turn_input_v3(
  p_request_kind text,
  p_manifest_hash text,
  p_metadata jsonb,
  p_client_operation_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF p_client_operation_id IS NULL
     OR p_request_kind IS NULL OR p_request_kind NOT IN ('document','context')
     OR p_manifest_hash IS NULL OR p_manifest_hash !~ '^[0-9a-f]{64}$'
     OR p_metadata IS NULL OR pg_catalog.jsonb_typeof(p_metadata) <> 'object'
     OR pg_catalog.octet_length(p_metadata::text) > 2048
     OR EXISTS (
       SELECT 1
       FROM pg_catalog.jsonb_each(p_metadata) AS e(key, value)
       WHERE e.key NOT IN ('label','category','itemCount')
          OR (e.key IN ('label','category')
              AND (pg_catalog.jsonb_typeof(e.value) <> 'string'
                   OR pg_catalog.char_length(e.value #>> '{}') > 120))
          OR (e.key='itemCount'
              AND (pg_catalog.jsonb_typeof(e.value) <> 'number'
                   OR (e.value #>> '{}')::numeric < 0
                   OR (e.value #>> '{}')::numeric > 1000000
                   OR pg_catalog.trunc((e.value #>> '{}')::numeric) <> (e.value #>> '{}')::numeric))
     )
  THEN
    RAISE EXCEPTION 'invalid conversation turn metadata';
  END IF;
END;
$$;

-- Internal insertion is shared by initial and follow-up turn RPCs. It checks
-- the current accepted invitation and both live entitlements every time, so a
-- revoked/expired relationship cannot replay a stale browser operation.
CREATE OR REPLACE FUNCTION public._team_create_conversation_turn_for_thread_v3(
  p_user_id uuid,
  p_thread_id uuid,
  p_request_kind text,
  p_manifest_hash text,
  p_metadata jsonb,
  p_client_operation_id uuid
)
RETURNS TABLE(
  thread_id uuid,
  id uuid,
  status text,
  request_kind text,
  metadata jsonb,
  created_at timestamptz,
  responded_at timestamptz,
  direction text,
  can_respond boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_relationship_id uuid;
  v_relationship public.team_space_invitations%ROWTYPE;
  v_thread public.team_space_conversation_threads%ROWTYPE;
  v_turn public.team_space_conversation_turns%ROWTYPE;
  v_existing public.team_space_conversation_turns%ROWTYPE;
  v_owner_user_id uuid;
  v_recipient_user_id uuid;
BEGIN
  IF p_user_id IS NULL OR p_thread_id IS NULL THEN
    RAISE EXCEPTION 'invalid conversation turn';
  END IF;
  PERFORM public._team_assert_conversation_turn_input_v3(
    p_request_kind, p_manifest_hash, p_metadata, p_client_operation_id
  );
  IF NOT coalesce((SELECT e.eligible FROM public.get_team_entitlement(p_user_id) AS e LIMIT 1), false) THEN
    RAISE EXCEPTION 'team entitlement required';
  END IF;

  -- Read the opaque binding without locking, then lock the exact invitation
  -- before the thread or a turn. If revocation wins first, the status filter
  -- sees it; if this wins, revocation waits until this mutation is complete.
  SELECT th.relationship_id INTO v_relationship_id
  FROM public.team_space_conversation_threads AS th
  WHERE th.id=p_thread_id;
  IF NOT FOUND OR v_relationship_id IS NULL THEN
    RETURN;
  END IF;
  SELECT * INTO v_relationship
  FROM public.team_space_invitations AS i
  WHERE i.id=v_relationship_id
    AND i.status='accepted'
  FOR UPDATE;
  IF NOT FOUND THEN
    RETURN;
  END IF;

  SELECT * INTO v_thread
  FROM public.team_space_conversation_threads AS th
  WHERE th.id=p_thread_id
    AND th.relationship_id=v_relationship.id
  FOR UPDATE;
  IF NOT FOUND THEN
    RETURN;
  END IF;

  SELECT s.owner_user_id INTO v_owner_user_id
  FROM public.team_shared_spaces AS s
  WHERE s.id=v_thread.space_id;
  IF v_owner_user_id IS NULL
     OR v_relationship.space_id IS DISTINCT FROM v_thread.space_id
     OR v_relationship.inviter_user_id IS DISTINCT FROM v_owner_user_id
     OR v_relationship.invitee_user_id IS DISTINCT FROM v_thread.participant_user_id
     OR v_thread.participant_user_id=v_owner_user_id THEN
    RETURN;
  END IF;
  IF p_user_id=v_owner_user_id THEN
    v_recipient_user_id := v_thread.participant_user_id;
  ELSIF p_user_id=v_thread.participant_user_id THEN
    v_recipient_user_id := v_owner_user_id;
  ELSE
    RETURN;
  END IF;
  IF NOT coalesce((SELECT e.eligible FROM public.get_team_entitlement(v_recipient_user_id) AS e LIMIT 1), false) THEN
    RETURN;
  END IF;

  INSERT INTO public.team_space_conversation_turns(
    thread_id, initiator_user_id, recipient_user_id, client_operation_id,
    request_kind, manifest_hash, metadata
  ) VALUES (
    v_thread.id, p_user_id, v_recipient_user_id, p_client_operation_id,
    p_request_kind, p_manifest_hash, p_metadata
  )
  ON CONFLICT (initiator_user_id, client_operation_id) DO NOTHING
  RETURNING * INTO v_turn;

  IF NOT FOUND THEN
    SELECT * INTO v_existing
    FROM public.team_space_conversation_turns AS t
    WHERE t.initiator_user_id=p_user_id
      AND t.client_operation_id=p_client_operation_id
    FOR UPDATE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'conversation operation unavailable';
    END IF;
    IF v_existing.thread_id IS DISTINCT FROM v_thread.id
       OR v_existing.recipient_user_id IS DISTINCT FROM v_recipient_user_id
       OR v_existing.request_kind IS DISTINCT FROM p_request_kind
       OR v_existing.manifest_hash IS DISTINCT FROM p_manifest_hash
       OR v_existing.metadata IS DISTINCT FROM p_metadata THEN
      RAISE EXCEPTION 'conversation operation conflicts with existing turn';
    END IF;
    v_turn := v_existing;
  ELSE
    UPDATE public.team_space_conversation_threads
       SET last_activity_at=v_turn.created_at
     WHERE team_space_conversation_threads.id=v_thread.id;
  END IF;

  RETURN QUERY SELECT
    v_turn.thread_id,
    v_turn.id,
    v_turn.status,
    v_turn.request_kind,
    v_turn.metadata,
    v_turn.created_at,
    v_turn.responded_at,
    'outbound'::text,
    false;
END;
$$;

-- Initial turn creation is atomic: an invitee derives the owner from their
-- accepted invitation, while an owner must use an opaque accepted invitation
-- relationship handle. It never accepts an arbitrary user UUID, email, or
-- alias as a conversation target.
CREATE OR REPLACE FUNCTION public.create_team_space_conversation_turn_v3(
  p_user_id uuid,
  p_space_id uuid,
  p_relationship_id uuid,
  p_request_kind text,
  p_manifest_hash text,
  p_metadata jsonb DEFAULT '{}'::jsonb,
  p_client_operation_id uuid DEFAULT NULL
)
RETURNS TABLE(
  thread_id uuid,
  id uuid,
  status text,
  request_kind text,
  metadata jsonb,
  created_at timestamptz,
  responded_at timestamptz,
  direction text,
  can_respond boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_owner_user_id uuid;
  v_relationship public.team_space_invitations%ROWTYPE;
  v_thread_id uuid;
BEGIN
  IF p_user_id IS NULL OR p_space_id IS NULL THEN
    RAISE EXCEPTION 'invalid conversation turn';
  END IF;
  PERFORM public._team_assert_conversation_turn_input_v3(
    p_request_kind, p_manifest_hash, p_metadata, p_client_operation_id
  );
  IF NOT coalesce((SELECT e.eligible FROM public.get_team_entitlement(p_user_id) AS e LIMIT 1), false) THEN
    RAISE EXCEPTION 'team entitlement required';
  END IF;

  SELECT s.owner_user_id INTO v_owner_user_id
  FROM public.team_shared_spaces AS s
  WHERE s.id=p_space_id;
  IF v_owner_user_id IS NULL
     OR NOT coalesce((SELECT e.eligible FROM public.get_team_entitlement(v_owner_user_id) AS e LIMIT 1), false) THEN
    RETURN;
  END IF;

  -- Lock the exact authorization relation before any thread/turn write. Owner
  -- callers select only an opaque relationship handle; participant callers
  -- derive their newest accepted relation server-side and cannot probe peers.
  IF p_user_id=v_owner_user_id THEN
    IF p_relationship_id IS NULL THEN
      RETURN;
    END IF;
    SELECT * INTO v_relationship
    FROM public.team_space_invitations AS i
    WHERE i.id=p_relationship_id
      AND i.space_id=p_space_id
      AND i.inviter_user_id=v_owner_user_id
      AND i.status='accepted'
    FOR UPDATE;
  ELSE
    IF p_relationship_id IS NOT NULL THEN
      RETURN;
    END IF;
    SELECT * INTO v_relationship
    FROM public.team_space_invitations AS i
    WHERE i.space_id=p_space_id
      AND i.inviter_user_id=v_owner_user_id
      AND i.invitee_user_id=p_user_id
      AND i.status='accepted'
    ORDER BY i.created_at DESC, i.id DESC
    LIMIT 1
    FOR UPDATE;
  END IF;
  IF NOT FOUND
     OR v_relationship.invitee_user_id IS NULL
     OR v_relationship.invitee_user_id=v_owner_user_id
     OR NOT coalesce((SELECT e.eligible FROM public.get_team_entitlement(v_relationship.invitee_user_id) AS e LIMIT 1), false) THEN
    RETURN;
  END IF;

  -- The relationship lock serializes first-turn creation with revocation.
  -- A re-invite gets a new thread rather than reactivating a revoked one.
  SELECT th.id INTO v_thread_id
  FROM public.team_space_conversation_threads AS th
  WHERE th.relationship_id=v_relationship.id
  FOR UPDATE;
  IF NOT FOUND THEN
    INSERT INTO public.team_space_conversation_threads(
      space_id, participant_user_id, relationship_id
    ) VALUES (
      p_space_id, v_relationship.invitee_user_id, v_relationship.id
    )
    RETURNING team_space_conversation_threads.id INTO v_thread_id;
  END IF;

  RETURN QUERY SELECT * FROM public._team_create_conversation_turn_for_thread_v3(
    p_user_id, v_thread_id, p_request_kind, p_manifest_hash, p_metadata, p_client_operation_id
  );
END;
$$;

-- Follow-up turns reuse the opaque thread handle. The helper locks and
-- revalidates that thread's exact accepted relationship instead of trusting
-- a handle created in an older session.
CREATE OR REPLACE FUNCTION public.create_team_conversation_turn_v3(
  p_user_id uuid,
  p_thread_id uuid,
  p_request_kind text,
  p_manifest_hash text,
  p_metadata jsonb DEFAULT '{}'::jsonb,
  p_client_operation_id uuid DEFAULT NULL
)
RETURNS TABLE(
  thread_id uuid,
  id uuid,
  status text,
  request_kind text,
  metadata jsonb,
  created_at timestamptz,
  responded_at timestamptz,
  direction text,
  can_respond boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY SELECT * FROM public._team_create_conversation_turn_for_thread_v3(
    p_user_id, p_thread_id, p_request_kind, p_manifest_hash, p_metadata, p_client_operation_id
  );
END;
$$;

-- Only the exact recipient can accept or decline a pending turn. A retry must
-- supply the same response operation UUID and decision; every other terminal
-- action fails closed rather than reporting a misleading success.
CREATE OR REPLACE FUNCTION public.respond_team_conversation_turn_v3(
  p_user_id uuid,
  p_turn_id uuid,
  p_decision text,
  p_client_operation_id uuid
)
RETURNS TABLE(
  thread_id uuid,
  id uuid,
  status text,
  request_kind text,
  metadata jsonb,
  created_at timestamptz,
  responded_at timestamptz,
  direction text,
  can_respond boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_thread_id uuid;
  v_relationship_id uuid;
  v_relationship public.team_space_invitations%ROWTYPE;
  v_turn public.team_space_conversation_turns%ROWTYPE;
  v_thread public.team_space_conversation_threads%ROWTYPE;
  v_owner_user_id uuid;
  v_existing_turn_id uuid;
BEGIN
  IF p_user_id IS NULL OR p_turn_id IS NULL OR p_client_operation_id IS NULL
     OR p_decision IS NULL OR p_decision NOT IN ('accepted','declined') THEN
    RAISE EXCEPTION 'invalid conversation response';
  END IF;
  IF NOT coalesce((SELECT e.eligible FROM public.get_team_entitlement(p_user_id) AS e LIMIT 1), false) THEN
    RAISE EXCEPTION 'team entitlement required';
  END IF;

  -- Establish the immutable relation binding before taking mutable row locks.
  -- Then lock in relation -> thread -> turn order so revocation cannot win
  -- after authorization but before the terminal update.
  SELECT t.thread_id INTO v_thread_id
  FROM public.team_space_conversation_turns AS t
  WHERE t.id=p_turn_id;
  IF NOT FOUND THEN
    RETURN;
  END IF;
  SELECT th.relationship_id INTO v_relationship_id
  FROM public.team_space_conversation_threads AS th
  WHERE th.id=v_thread_id;
  IF NOT FOUND OR v_relationship_id IS NULL THEN
    RETURN;
  END IF;
  SELECT * INTO v_relationship
  FROM public.team_space_invitations AS i
  WHERE i.id=v_relationship_id
    AND i.status='accepted'
  FOR UPDATE;
  IF NOT FOUND THEN
    RETURN;
  END IF;
  SELECT * INTO v_thread
  FROM public.team_space_conversation_threads AS th
  WHERE th.id=v_thread_id
    AND th.relationship_id=v_relationship.id
  FOR UPDATE;
  IF NOT FOUND THEN
    RETURN;
  END IF;
  SELECT * INTO v_turn
  FROM public.team_space_conversation_turns AS t
  WHERE t.id=p_turn_id
    AND t.thread_id=v_thread.id
  FOR UPDATE;
  IF NOT FOUND OR v_turn.recipient_user_id<>p_user_id THEN
    RETURN;
  END IF;

  SELECT s.owner_user_id INTO v_owner_user_id
  FROM public.team_shared_spaces AS s
  WHERE s.id=v_thread.space_id;
  IF v_owner_user_id IS NULL
     OR v_relationship.space_id IS DISTINCT FROM v_thread.space_id
     OR v_relationship.inviter_user_id IS DISTINCT FROM v_owner_user_id
     OR v_relationship.invitee_user_id IS DISTINCT FROM v_thread.participant_user_id
     OR v_thread.participant_user_id=v_owner_user_id
     OR NOT coalesce((SELECT e.eligible FROM public.get_team_entitlement(v_turn.initiator_user_id) AS e LIMIT 1), false)
     OR (v_owner_user_id<>v_turn.initiator_user_id AND v_owner_user_id<>v_turn.recipient_user_id)
     OR (v_thread.participant_user_id<>v_turn.initiator_user_id AND v_thread.participant_user_id<>v_turn.recipient_user_id) THEN
    RETURN;
  END IF;

  IF v_turn.status='pending' THEN
    SELECT t.id INTO v_existing_turn_id
    FROM public.team_space_conversation_turns AS t
    WHERE t.recipient_user_id=p_user_id
      AND t.response_operation_id=p_client_operation_id
    FOR UPDATE;
    IF FOUND AND v_existing_turn_id<>v_turn.id THEN
      RAISE EXCEPTION 'conversation response operation conflicts with existing turn';
    END IF;
    BEGIN
      UPDATE public.team_space_conversation_turns
         SET status=p_decision,
             updated_at=pg_catalog.now(),
             responded_at=pg_catalog.now(),
             response_operation_id=p_client_operation_id
       WHERE team_space_conversation_turns.id=v_turn.id
      RETURNING * INTO v_turn;
    EXCEPTION WHEN unique_violation THEN
      RAISE EXCEPTION 'conversation response operation conflicts with existing turn';
    END;
  ELSIF v_turn.status<>p_decision OR v_turn.response_operation_id IS DISTINCT FROM p_client_operation_id THEN
    RAISE EXCEPTION 'conversation turn is terminal';
  END IF;

  RETURN QUERY SELECT
    v_turn.thread_id,
    v_turn.id,
    v_turn.status,
    v_turn.request_kind,
    v_turn.metadata,
    v_turn.created_at,
    v_turn.responded_at,
    'inbound'::text,
    false;
END;
$$;

-- An owner can enumerate opaque accepted relationship handles for their own
-- space. Each returned handle identifies the exact accepted relation chosen
-- for a new thread. A claimed alias is intentionally public metadata; user
-- IDs, email, external refs, and hashes never leave this projection.
CREATE OR REPLACE FUNCTION public.list_team_conversation_targets_v3(
  p_user_id uuid,
  p_space_id uuid DEFAULT NULL
)
RETURNS TABLE(
  relationship_id uuid,
  space_id uuid,
  space_name text,
  counterparty_alias text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT DISTINCT ON (i.space_id, i.invitee_user_id)
    i.id AS relationship_id,
    s.id AS space_id,
    s.name AS space_name,
    a.alias AS counterparty_alias
  FROM public.team_space_invitations AS i
  JOIN public.team_shared_spaces AS s ON s.id=i.space_id
  LEFT JOIN public.team_aliases AS a ON a.user_id=i.invitee_user_id
  WHERE p_user_id IS NOT NULL
    AND coalesce((SELECT e.eligible FROM public.get_team_entitlement(p_user_id) AS e LIMIT 1), false)
    AND s.owner_user_id=p_user_id
    AND i.inviter_user_id=s.owner_user_id
    AND i.status='accepted'
    AND (p_space_id IS NULL OR i.space_id=p_space_id)
    AND coalesce((SELECT e.eligible FROM public.get_team_entitlement(i.invitee_user_id) AS e LIMIT 1), false)
  ORDER BY i.space_id, i.invitee_user_id, i.created_at DESC, i.id DESC
$$;

-- Thread pagination is cursor based so a client never has to ask for a raw
-- member identifier. A thread exists only after its first metadata-only turn.
CREATE OR REPLACE FUNCTION public.list_team_conversation_threads_v3(
  p_user_id uuid,
  p_limit integer DEFAULT 50,
  p_before_activity_at timestamptz DEFAULT NULL,
  p_before_thread_id uuid DEFAULT NULL
)
RETURNS TABLE(
  thread_id uuid,
  space_id uuid,
  space_name text,
  last_activity_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF p_user_id IS NULL OR p_limit IS NULL OR p_limit NOT BETWEEN 1 AND 50
     OR (p_before_activity_at IS NULL) <> (p_before_thread_id IS NULL) THEN
    RAISE EXCEPTION 'invalid conversation cursor';
  END IF;
  IF NOT coalesce((SELECT e.eligible FROM public.get_team_entitlement(p_user_id) AS e LIMIT 1), false) THEN
    RAISE EXCEPTION 'team entitlement required';
  END IF;
  RETURN QUERY
  SELECT th.id, s.id, s.name, th.last_activity_at
  FROM public.team_space_conversation_threads AS th
  JOIN public.team_shared_spaces AS s ON s.id=th.space_id
  JOIN public.team_space_invitations AS i
    ON i.id=th.relationship_id
   AND i.space_id=th.space_id
   AND i.inviter_user_id=s.owner_user_id
   AND i.invitee_user_id=th.participant_user_id
   AND i.status='accepted'
  WHERE (s.owner_user_id=p_user_id OR th.participant_user_id=p_user_id)
    AND coalesce((SELECT e.eligible FROM public.get_team_entitlement(th.participant_user_id) AS e LIMIT 1), false)
    AND coalesce((SELECT e.eligible FROM public.get_team_entitlement(s.owner_user_id) AS e LIMIT 1), false)
    AND (p_before_activity_at IS NULL OR (th.last_activity_at, th.id) < (p_before_activity_at, p_before_thread_id))
  ORDER BY th.last_activity_at DESC, th.id DESC
  LIMIT p_limit;
END;
$$;

-- Turns are projected as inbound/outbound metadata only. Hashes, operation
-- UUIDs, relationship handles, and participant identifiers remain server-side.
CREATE OR REPLACE FUNCTION public.list_team_conversation_turns_v3(
  p_user_id uuid,
  p_thread_id uuid,
  p_limit integer DEFAULT 50,
  p_before_created_at timestamptz DEFAULT NULL,
  p_before_turn_id uuid DEFAULT NULL
)
RETURNS TABLE(
  thread_id uuid,
  id uuid,
  status text,
  request_kind text,
  metadata jsonb,
  created_at timestamptz,
  responded_at timestamptz,
  direction text,
  can_respond boolean
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_thread public.team_space_conversation_threads%ROWTYPE;
  v_owner_user_id uuid;
BEGIN
  IF p_user_id IS NULL OR p_thread_id IS NULL OR p_limit IS NULL OR p_limit NOT BETWEEN 1 AND 50
     OR (p_before_created_at IS NULL) <> (p_before_turn_id IS NULL) THEN
    RAISE EXCEPTION 'invalid conversation cursor';
  END IF;
  IF NOT coalesce((SELECT e.eligible FROM public.get_team_entitlement(p_user_id) AS e LIMIT 1), false) THEN
    RAISE EXCEPTION 'team entitlement required';
  END IF;
  SELECT * INTO v_thread
  FROM public.team_space_conversation_threads AS th
  WHERE th.id=p_thread_id;
  IF NOT FOUND THEN
    RETURN;
  END IF;
  SELECT s.owner_user_id INTO v_owner_user_id
  FROM public.team_shared_spaces AS s
  WHERE s.id=v_thread.space_id;
  IF v_owner_user_id IS NULL
     OR (p_user_id<>v_owner_user_id AND p_user_id<>v_thread.participant_user_id)
     OR NOT coalesce((SELECT e.eligible FROM public.get_team_entitlement(v_owner_user_id) AS e LIMIT 1), false)
     OR NOT coalesce((SELECT e.eligible FROM public.get_team_entitlement(v_thread.participant_user_id) AS e LIMIT 1), false)
     OR NOT EXISTS (
       SELECT 1
       FROM public.team_space_invitations AS i
       WHERE i.id=v_thread.relationship_id
         AND i.space_id=v_thread.space_id
         AND i.inviter_user_id=v_owner_user_id
         AND i.invitee_user_id=v_thread.participant_user_id
         AND i.status='accepted'
     ) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    t.thread_id,
    t.id,
    t.status,
    t.request_kind,
    t.metadata,
    t.created_at,
    t.responded_at,
    CASE WHEN t.initiator_user_id=p_user_id THEN 'outbound'::text ELSE 'inbound'::text END,
    (t.recipient_user_id=p_user_id AND t.status='pending')
  FROM public.team_space_conversation_turns AS t
  WHERE t.thread_id=v_thread.id
    AND (p_before_created_at IS NULL OR (t.created_at, t.id) < (p_before_created_at, p_before_turn_id))
  ORDER BY t.created_at DESC, t.id DESC
  LIMIT p_limit;
END;
$$;

DO $$
DECLARE fn text;
BEGIN
  FOREACH fn IN ARRAY ARRAY[
    '_team_assert_conversation_turn_input_v3(text,text,jsonb,uuid)',
    '_team_create_conversation_turn_for_thread_v3(uuid,uuid,text,text,jsonb,uuid)',
    'create_team_space_conversation_turn_v3(uuid,uuid,uuid,text,text,jsonb,uuid)',
    'create_team_conversation_turn_v3(uuid,uuid,text,text,jsonb,uuid)',
    'respond_team_conversation_turn_v3(uuid,uuid,text,uuid)',
    'list_team_conversation_targets_v3(uuid,uuid)',
    'list_team_conversation_threads_v3(uuid,integer,timestamptz,uuid)',
    'list_team_conversation_turns_v3(uuid,uuid,integer,timestamptz,uuid)'
  ]
  LOOP
    EXECUTE 'REVOKE ALL ON FUNCTION public.' || fn || ' FROM PUBLIC, anon, authenticated';
  END LOOP;
  FOREACH fn IN ARRAY ARRAY[
    'create_team_space_conversation_turn_v3(uuid,uuid,uuid,text,text,jsonb,uuid)',
    'create_team_conversation_turn_v3(uuid,uuid,text,text,jsonb,uuid)',
    'respond_team_conversation_turn_v3(uuid,uuid,text,uuid)',
    'list_team_conversation_targets_v3(uuid,uuid)',
    'list_team_conversation_threads_v3(uuid,integer,timestamptz,uuid)',
    'list_team_conversation_turns_v3(uuid,uuid,integer,timestamptz,uuid)'
  ]
  LOOP
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.' || fn || ' TO service_role';
  END LOOP;
END;
$$;
