-- Forward-only hardening for the Team text-only delivery slice.
--
-- A shared-space relationship is a source boundary: only the owner of that
-- exact source space may accept a member-originated turn and send reviewed
-- plaintext to that member.  The reverse conversational direction remains
-- available through the other participant's own shared space/relationship;
-- it must never reuse this source space as a general member-to-owner payload
-- channel.  This migration does not add file, artifact, locator, URL, bytea,
-- or provider-object delivery support.

-- Project the browser-safe turn shape with a server-derived send affordance.
-- It locks/revalidates the same accepted relation as the v3 paths so the UI
-- hint is scoped to one exact relationship, thread, turn, owner and requester.
CREATE OR REPLACE FUNCTION public._team_project_conversation_turn_v4(
  p_user_id uuid,
  p_thread_id uuid,
  p_turn_id uuid
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
  can_respond boolean,
  can_deliver boolean
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
  v_owner_user_id uuid;
BEGIN
  IF p_user_id IS NULL OR p_thread_id IS NULL OR p_turn_id IS NULL
     OR NOT coalesce((SELECT e.eligible FROM public.get_team_entitlement(p_user_id) AS e LIMIT 1), false) THEN
    RETURN;
  END IF;

  SELECT th.relationship_id INTO v_relationship_id
  FROM public.team_space_conversation_threads AS th
  WHERE th.id=p_thread_id;
  IF NOT FOUND OR v_relationship_id IS NULL THEN
    RETURN;
  END IF;
  SELECT * INTO v_relationship
  FROM public.team_space_invitations AS i
  WHERE i.id=v_relationship_id AND i.status='accepted'
  FOR UPDATE;
  IF NOT FOUND THEN
    RETURN;
  END IF;
  SELECT * INTO v_thread
  FROM public.team_space_conversation_threads AS th
  WHERE th.id=p_thread_id AND th.relationship_id=v_relationship.id
  FOR UPDATE;
  IF NOT FOUND THEN
    RETURN;
  END IF;
  SELECT * INTO v_turn
  FROM public.team_space_conversation_turns AS t
  WHERE t.id=p_turn_id AND t.thread_id=v_thread.id
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
     OR v_thread.participant_user_id=v_owner_user_id
     OR (p_user_id<>v_owner_user_id AND p_user_id<>v_thread.participant_user_id)
     OR (v_turn.initiator_user_id<>v_owner_user_id AND v_turn.initiator_user_id<>v_thread.participant_user_id)
     OR (v_turn.recipient_user_id<>v_owner_user_id AND v_turn.recipient_user_id<>v_thread.participant_user_id)
     OR v_turn.initiator_user_id=v_turn.recipient_user_id
     OR NOT coalesce((SELECT e.eligible FROM public.get_team_entitlement(v_owner_user_id) AS e LIMIT 1), false)
     OR NOT coalesce((SELECT e.eligible FROM public.get_team_entitlement(v_thread.participant_user_id) AS e LIMIT 1), false)
  THEN
    RETURN;
  END IF;

  RETURN QUERY SELECT
    v_turn.thread_id,
    v_turn.id,
    v_turn.status,
    v_turn.request_kind,
    v_turn.metadata,
    v_turn.created_at,
    v_turn.responded_at,
    CASE WHEN v_turn.initiator_user_id=p_user_id THEN 'outbound'::text ELSE 'inbound'::text END,
    (v_turn.recipient_user_id=p_user_id AND v_turn.status='pending'),
    (
      v_turn.status='accepted'
      AND v_owner_user_id=p_user_id
      AND v_turn.recipient_user_id=p_user_id
      AND v_turn.initiator_user_id=v_thread.participant_user_id
      AND v_turn.responded_at IS NOT NULL
      AND v_turn.responded_at BETWEEN pg_catalog.now()-interval '24 hours' AND pg_catalog.now()
    );
END;
$$;

-- Keep v3 APIs intact for compatibility.  New browser routes use v4 so they
-- cannot infer ownership from a client-provided identifier and only receive a
-- boolean affordance after the exact relation is rechecked server-side.
CREATE OR REPLACE FUNCTION public.create_team_space_conversation_turn_v4(
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
  can_respond boolean,
  can_deliver boolean
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT projected.*
  FROM public.create_team_space_conversation_turn_v3($1,$2,$3,$4,$5,$6,$7) AS base
  CROSS JOIN LATERAL public._team_project_conversation_turn_v4($1,base.thread_id,base.id) AS projected
$$;

CREATE OR REPLACE FUNCTION public.create_team_conversation_turn_v4(
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
  can_respond boolean,
  can_deliver boolean
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT projected.*
  FROM public.create_team_conversation_turn_v3($1,$2,$3,$4,$5,$6) AS base
  CROSS JOIN LATERAL public._team_project_conversation_turn_v4($1,base.thread_id,base.id) AS projected
$$;

CREATE OR REPLACE FUNCTION public.respond_team_conversation_turn_v4(
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
  can_respond boolean,
  can_deliver boolean
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT projected.*
  FROM public.respond_team_conversation_turn_v3($1,$2,$3,$4) AS base
  CROSS JOIN LATERAL public._team_project_conversation_turn_v4($1,base.thread_id,base.id) AS projected
$$;

CREATE OR REPLACE FUNCTION public.list_team_conversation_turns_v4(
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
  can_respond boolean,
  can_deliver boolean
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT projected.*
  FROM public.list_team_conversation_turns_v3($1,$2,$3,$4,$5) AS base
  CROSS JOIN LATERAL public._team_project_conversation_turn_v4($1,base.thread_id,base.id) AS projected
  ORDER BY base.created_at DESC,base.id DESC
$$;

-- This authorizer is deliberately separate from the old private writer: the
-- public service-only wrapper invokes it while its relationship/thread/turn
-- locks remain held for the subsequent write.  Thus a revoked relationship or
-- changed approval cannot win between authorization and insertion.
CREATE OR REPLACE FUNCTION team_delivery_private.owner_approved_text_delivery_v2(
  p_user_id uuid,
  p_thread_id uuid,
  p_turn_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_relationship_id uuid;
  v_relationship public.team_space_invitations%ROWTYPE;
  v_thread public.team_space_conversation_threads%ROWTYPE;
  v_turn public.team_space_conversation_turns%ROWTYPE;
  v_owner_user_id uuid;
BEGIN
  IF p_user_id IS NULL OR p_thread_id IS NULL OR p_turn_id IS NULL
     OR NOT coalesce((SELECT e.eligible FROM public.get_team_entitlement(p_user_id) AS e LIMIT 1), false) THEN
    RETURN false;
  END IF;

  SELECT th.relationship_id INTO v_relationship_id
  FROM public.team_space_conversation_threads AS th
  WHERE th.id=p_thread_id;
  IF NOT FOUND OR v_relationship_id IS NULL THEN
    RETURN false;
  END IF;
  SELECT * INTO v_relationship
  FROM public.team_space_invitations AS i
  WHERE i.id=v_relationship_id AND i.status='accepted'
  FOR UPDATE;
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  SELECT * INTO v_thread
  FROM public.team_space_conversation_threads AS th
  WHERE th.id=p_thread_id AND th.relationship_id=v_relationship.id
  FOR UPDATE;
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  SELECT * INTO v_turn
  FROM public.team_space_conversation_turns AS t
  WHERE t.id=p_turn_id AND t.thread_id=v_thread.id
  FOR UPDATE;
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  SELECT s.owner_user_id INTO v_owner_user_id
  FROM public.team_shared_spaces AS s
  WHERE s.id=v_thread.space_id;

  RETURN coalesce(
    v_owner_user_id IS NOT NULL
    AND v_relationship.space_id IS NOT DISTINCT FROM v_thread.space_id
    AND v_relationship.inviter_user_id IS NOT DISTINCT FROM v_owner_user_id
    AND v_relationship.invitee_user_id IS NOT DISTINCT FROM v_thread.participant_user_id
    AND v_thread.participant_user_id<>v_owner_user_id
    AND p_user_id=v_owner_user_id
    AND v_turn.status='accepted'
    AND v_turn.responded_at BETWEEN pg_catalog.now()-interval '24 hours' AND pg_catalog.now()
    AND v_turn.initiator_user_id=v_thread.participant_user_id
    AND v_turn.recipient_user_id=v_owner_user_id
    AND coalesce((SELECT e.eligible FROM public.get_team_entitlement(v_thread.participant_user_id) AS e LIMIT 1), false)
    AND coalesce((SELECT e.eligible FROM public.get_team_entitlement(v_owner_user_id) AS e LIMIT 1), false),
    false
  );
END;
$$;

-- Existing rows are not rewritten or erased by this forward-only hardening.
-- Instead, read/list independently revalidate the same source-owner direction
-- as create. Any old reverse-direction row therefore remains opaque and
-- inaccessible unless a separate, explicitly approved data-retention change is
-- made later. This keeps the application-level change reversible without
-- treating a private plaintext row as a document/artifact transport.
CREATE OR REPLACE FUNCTION team_delivery_private.read_text_delivery(p_user_id uuid,p_delivery_id uuid)
RETURNS TABLE(id uuid,content text,created_at timestamptz,expires_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_delivery team_delivery_private.text_deliveries%ROWTYPE;
  v_invite public.team_space_invitations%ROWTYPE;
  v_thread public.team_space_conversation_threads%ROWTYPE;
  v_turn public.team_space_conversation_turns%ROWTYPE;
  v_owner uuid;
  v_count integer;
BEGIN
  IF p_user_id IS NULL OR p_delivery_id IS NULL THEN RETURN; END IF;
  -- Discover immutable foreign keys without locking first, then acquire locks
  -- in the same relationship -> thread -> turn -> delivery order as create.
  SELECT * INTO v_delivery FROM team_delivery_private.text_deliveries d
    WHERE d.id=p_delivery_id;
  IF NOT FOUND OR p_user_id IS DISTINCT FROM v_delivery.recipient_user_id
     OR NOT coalesce((SELECT e.eligible FROM public.get_team_entitlement(p_user_id) e LIMIT 1), false) THEN RETURN; END IF;
  SELECT * INTO v_invite FROM public.team_space_invitations i
    WHERE i.id=v_delivery.relationship_id AND i.status='accepted' FOR UPDATE;
  IF NOT FOUND THEN RETURN; END IF;
  SELECT * INTO v_thread FROM public.team_space_conversation_threads th
    WHERE th.id=v_delivery.thread_id AND th.relationship_id=v_invite.id FOR UPDATE;
  IF NOT FOUND THEN RETURN; END IF;
  SELECT * INTO v_turn FROM public.team_space_conversation_turns t
    WHERE t.id=v_delivery.turn_id AND t.thread_id=v_thread.id FOR UPDATE;
  IF NOT FOUND THEN RETURN; END IF;
  SELECT s.owner_user_id INTO v_owner FROM public.team_shared_spaces s WHERE s.id=v_thread.space_id;
  IF v_owner IS NULL
     OR v_invite.space_id IS DISTINCT FROM v_thread.space_id
     OR v_invite.inviter_user_id IS DISTINCT FROM v_owner
     OR v_invite.invitee_user_id IS DISTINCT FROM v_thread.participant_user_id
     OR v_thread.participant_user_id=v_owner
     OR v_delivery.sender_user_id IS DISTINCT FROM v_owner
     OR v_delivery.recipient_user_id IS DISTINCT FROM v_thread.participant_user_id
     OR p_user_id IS DISTINCT FROM v_thread.participant_user_id
     OR v_turn.status<>'accepted' OR v_turn.responded_at IS NULL
     OR v_turn.initiator_user_id IS DISTINCT FROM v_thread.participant_user_id
     OR v_turn.recipient_user_id IS DISTINCT FROM v_owner
     OR NOT coalesce((SELECT e.eligible FROM public.get_team_entitlement(v_owner) e LIMIT 1), false)
     OR NOT coalesce((SELECT e.eligible FROM public.get_team_entitlement(v_thread.participant_user_id) e LIMIT 1), false)
  THEN RETURN; END IF;
  -- Serialize recipient reads before locking the delivery row so create/read
  -- operations share one canonical lock order and enforce the read budget.
  PERFORM 1 FROM auth.users u WHERE u.id=p_user_id FOR UPDATE;
  IF NOT FOUND THEN RETURN; END IF;
  SELECT * INTO v_delivery FROM team_delivery_private.text_deliveries d
    WHERE d.id=p_delivery_id AND d.relationship_id=v_invite.id
      AND d.thread_id=v_thread.id AND d.turn_id=v_turn.id FOR UPDATE;
  IF NOT FOUND THEN RETURN; END IF;
  IF v_delivery.expires_at<=pg_catalog.now() OR v_delivery.deleted_at IS NOT NULL THEN
    IF v_delivery.content IS NOT NULL THEN
      UPDATE team_delivery_private.text_deliveries d
         SET content=NULL,content_sha256=NULL,deleted_at=pg_catalog.now() WHERE d.id=v_delivery.id;
      INSERT INTO team_delivery_private.text_delivery_events(delivery_id,event,actor_user_id)
        VALUES(v_delivery.id,'expired',NULL);
    END IF;
    RETURN;
  END IF;
  SELECT pg_catalog.count(*)::integer INTO v_count
    FROM team_delivery_private.text_delivery_events e
   WHERE e.actor_user_id=p_user_id AND e.event='viewed'
     AND e.occurred_at>pg_catalog.now()-interval '1 minute';
  IF v_count>=60 THEN RAISE EXCEPTION 'delivery rate limited'; END IF;
  INSERT INTO team_delivery_private.text_delivery_events(delivery_id,event,actor_user_id)
    VALUES(v_delivery.id,'viewed',p_user_id);
  RETURN QUERY SELECT v_delivery.id,v_delivery.content,v_delivery.created_at,v_delivery.expires_at;
END;
$$;

CREATE OR REPLACE FUNCTION team_delivery_private.list_text_deliveries(
  p_user_id uuid,p_thread_id uuid,p_limit integer DEFAULT 50,
  p_before_created_at timestamptz DEFAULT NULL,p_before_delivery_id uuid DEFAULT NULL
)
RETURNS TABLE(id uuid,turn_id uuid,created_at timestamptz,expires_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_relationship_id uuid;
  v_thread public.team_space_conversation_threads%ROWTYPE;
  v_invite public.team_space_invitations%ROWTYPE;
  v_owner uuid;
BEGIN
  IF p_user_id IS NULL OR p_thread_id IS NULL OR p_limit IS NULL OR p_limit NOT BETWEEN 1 AND 50
     OR (p_before_created_at IS NULL)<>(p_before_delivery_id IS NULL) THEN RETURN; END IF;
  -- Share the same relationship -> thread lock order as revoke/send/read so a
  -- concurrent revocation either wins before this projection or waits until
  -- the current authorized metadata query has completed.
  SELECT th.relationship_id INTO v_relationship_id FROM public.team_space_conversation_threads th WHERE th.id=p_thread_id;
  IF NOT FOUND OR v_relationship_id IS NULL THEN RETURN; END IF;
  SELECT * INTO v_invite FROM public.team_space_invitations i
    WHERE i.id=v_relationship_id AND i.status='accepted' FOR UPDATE;
  IF NOT FOUND THEN RETURN; END IF;
  SELECT * INTO v_thread FROM public.team_space_conversation_threads th
    WHERE th.id=p_thread_id AND th.relationship_id=v_invite.id FOR UPDATE;
  IF NOT FOUND THEN RETURN; END IF;
  SELECT s.owner_user_id INTO v_owner FROM public.team_shared_spaces s WHERE s.id=v_thread.space_id;
  IF v_owner IS NULL
     OR v_invite.space_id IS DISTINCT FROM v_thread.space_id
     OR v_invite.inviter_user_id IS DISTINCT FROM v_owner
     OR v_invite.invitee_user_id IS DISTINCT FROM v_thread.participant_user_id
     OR v_thread.participant_user_id=v_owner
     OR p_user_id IS DISTINCT FROM v_thread.participant_user_id
     OR NOT coalesce((SELECT e.eligible FROM public.get_team_entitlement(p_user_id) e LIMIT 1), false)
     OR NOT coalesce((SELECT e.eligible FROM public.get_team_entitlement(v_owner) e LIMIT 1), false)
     OR NOT coalesce((SELECT e.eligible FROM public.get_team_entitlement(v_thread.participant_user_id) e LIMIT 1), false)
  THEN RETURN; END IF;
  RETURN QUERY SELECT d.id,d.turn_id,d.created_at,d.expires_at
    FROM team_delivery_private.text_deliveries d
    JOIN public.team_space_conversation_turns t
      ON t.id=d.turn_id
     AND t.thread_id=v_thread.id
     AND t.status='accepted'
     AND t.responded_at IS NOT NULL
     AND t.initiator_user_id=v_thread.participant_user_id
     AND t.recipient_user_id=v_owner
   WHERE d.thread_id=v_thread.id AND d.relationship_id=v_invite.id
     AND d.sender_user_id=v_owner
     AND d.recipient_user_id=v_thread.participant_user_id
     AND d.recipient_user_id=p_user_id
     AND d.content IS NOT NULL AND d.deleted_at IS NULL
     AND d.expires_at>pg_catalog.now()
     AND (p_before_created_at IS NULL OR (d.created_at,d.id)<(p_before_created_at,p_before_delivery_id))
   ORDER BY d.created_at DESC,d.id DESC LIMIT p_limit;
END;
$$;

-- Preserve the existing public RPC name so callers cannot select an older,
-- bidirectional variant.  The only public writer now validates owner approval
-- first, then delegates to the existing bounded plaintext writer in the same
-- transaction and lock scope.
CREATE OR REPLACE FUNCTION public.create_team_text_delivery_v1(
  p_user_id uuid,
  p_thread_id uuid,
  p_turn_id uuid,
  p_operation_id uuid,
  p_content text,
  p_content_sha256 text
)
RETURNS TABLE(id uuid, recipient_user_id uuid, created_at timestamptz, expires_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT coalesce(team_delivery_private.owner_approved_text_delivery_v2($1,$2,$3), false) THEN
    RETURN;
  END IF;
  RETURN QUERY SELECT * FROM team_delivery_private.create_text_delivery($1,$2,$3,$4,$5,$6);
END;
$$;

REVOKE ALL ON FUNCTION public._team_project_conversation_turn_v4(uuid,uuid,uuid),
  team_delivery_private.owner_approved_text_delivery_v2(uuid,uuid,uuid)
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.create_team_space_conversation_turn_v4(uuid,uuid,uuid,text,text,jsonb,uuid),
  public.create_team_conversation_turn_v4(uuid,uuid,text,text,jsonb,uuid),
  public.respond_team_conversation_turn_v4(uuid,uuid,text,uuid),
  public.list_team_conversation_turns_v4(uuid,uuid,integer,timestamptz,uuid),
  public.create_team_text_delivery_v1(uuid,uuid,uuid,uuid,text,text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_team_space_conversation_turn_v4(uuid,uuid,uuid,text,text,jsonb,uuid),
  public.create_team_conversation_turn_v4(uuid,uuid,text,text,jsonb,uuid),
  public.respond_team_conversation_turn_v4(uuid,uuid,text,uuid),
  public.list_team_conversation_turns_v4(uuid,uuid,integer,timestamptz,uuid),
  public.create_team_text_delivery_v1(uuid,uuid,uuid,uuid,text,text)
  TO service_role;
