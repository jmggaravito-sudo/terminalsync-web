-- Forward-only private delivery for explicitly reviewed Team text responses.
-- Turns remain metadata-only; this creates a separate, narrowly scoped channel.
-- No direct table/API grants are made. Only service-role RPCs can access payload.

CREATE SCHEMA IF NOT EXISTS team_delivery_private;
REVOKE ALL ON SCHEMA team_delivery_private FROM PUBLIC, anon, authenticated, service_role;

CREATE TABLE team_delivery_private.text_deliveries (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.team_space_conversation_threads(id) ON DELETE CASCADE,
  turn_id uuid NOT NULL UNIQUE REFERENCES public.team_space_conversation_turns(id) ON DELETE CASCADE,
  relationship_id uuid NOT NULL REFERENCES public.team_space_invitations(id) ON DELETE CASCADE,
  sender_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  operation_id uuid NOT NULL,
  content_sha256 text CHECK (content_sha256 ~ '^[0-9a-f]{64}$'),
  content text,
  created_at timestamptz NOT NULL DEFAULT pg_catalog.now(),
  expires_at timestamptz NOT NULL DEFAULT (pg_catalog.now() + interval '7 days'),
  deleted_at timestamptz,
  CHECK (sender_user_id <> recipient_user_id),
  CHECK ((content IS NOT NULL AND deleted_at IS NULL AND content_sha256 IS NOT NULL
          AND pg_catalog.octet_length(content) BETWEEN 1 AND 65536)
      OR (content IS NULL AND deleted_at IS NOT NULL AND content_sha256 IS NULL))
);
CREATE UNIQUE INDEX team_delivery_private_text_deliveries_sender_operation_idx
  ON team_delivery_private.text_deliveries(sender_user_id, operation_id);
CREATE INDEX team_delivery_private_text_deliveries_expiry_idx
  ON team_delivery_private.text_deliveries(expires_at, id)
  WHERE deleted_at IS NULL;

CREATE TABLE team_delivery_private.text_delivery_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  delivery_id uuid NOT NULL,
  event text NOT NULL CHECK (event IN ('created','viewed','expired')),
  actor_user_id uuid,
  occurred_at timestamptz NOT NULL DEFAULT pg_catalog.now()
);
CREATE INDEX team_delivery_private_text_delivery_events_delivery_idx
  ON team_delivery_private.text_delivery_events(delivery_id, occurred_at, id);

ALTER TABLE team_delivery_private.text_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_delivery_private.text_delivery_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE team_delivery_private.text_deliveries,
  team_delivery_private.text_delivery_events FROM PUBLIC, anon, authenticated, service_role;

-- The recipient/approver of the accepted turn is the only sender. This works
-- in either conversation direction, without changing the shared-space owner
-- or relationship binding. A send is permitted for 24 hours from approval;
-- retention starts at send time and lasts 7 days. Payload is explicitly
-- submitted text, never content inferred or fetched from a source.
CREATE OR REPLACE FUNCTION team_delivery_private.create_text_delivery(
  p_user_id uuid, p_thread_id uuid, p_turn_id uuid,
  p_operation_id uuid, p_content text, p_content_sha256 text
)
RETURNS TABLE(id uuid, recipient_user_id uuid, created_at timestamptz, expires_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_thread public.team_space_conversation_threads%ROWTYPE;
  v_turn public.team_space_conversation_turns%ROWTYPE;
  v_invite public.team_space_invitations%ROWTYPE;
  v_owner uuid;
  v_existing team_delivery_private.text_deliveries%ROWTYPE;
  v_id uuid;
  v_count integer;
BEGIN
  IF p_user_id IS NULL OR p_thread_id IS NULL OR p_turn_id IS NULL OR p_operation_id IS NULL
     OR p_content IS NULL OR pg_catalog.octet_length(p_content) NOT BETWEEN 1 AND 65536
     OR p_content_sha256 IS NULL OR p_content_sha256 !~ '^[0-9a-f]{64}$' THEN
    RAISE EXCEPTION 'invalid delivery';
  END IF;
  IF NOT coalesce((SELECT e.eligible FROM public.get_team_entitlement(p_user_id) e LIMIT 1), false) THEN RETURN; END IF;

  SELECT th.relationship_id INTO v_id
  FROM public.team_space_conversation_threads th WHERE th.id=p_thread_id;
  IF NOT FOUND OR v_id IS NULL THEN RETURN; END IF;
  SELECT * INTO v_invite FROM public.team_space_invitations i
   WHERE i.id=v_id AND i.status='accepted' FOR UPDATE;
  IF NOT FOUND THEN RETURN; END IF;
  SELECT * INTO v_thread FROM public.team_space_conversation_threads th
   WHERE th.id=p_thread_id AND th.relationship_id=v_invite.id FOR UPDATE;
  IF NOT FOUND THEN RETURN; END IF;
  SELECT * INTO v_turn FROM public.team_space_conversation_turns t
   WHERE t.id=p_turn_id AND t.thread_id=v_thread.id FOR UPDATE;
  IF NOT FOUND OR v_turn.status<>'accepted' OR v_turn.responded_at IS NULL
     OR v_turn.responded_at < pg_catalog.now() - interval '24 hours'
     OR v_turn.responded_at > pg_catalog.now()
     OR v_turn.recipient_user_id<>p_user_id THEN RETURN; END IF;

  SELECT s.owner_user_id INTO v_owner FROM public.team_shared_spaces s WHERE s.id=v_thread.space_id;
  IF v_owner IS NULL OR v_invite.space_id IS DISTINCT FROM v_thread.space_id
     OR v_invite.inviter_user_id IS DISTINCT FROM v_owner
     OR v_invite.invitee_user_id IS DISTINCT FROM v_thread.participant_user_id
     OR v_thread.participant_user_id=v_owner
     OR (p_user_id<>v_owner AND p_user_id<>v_thread.participant_user_id)
     OR (v_turn.initiator_user_id<>v_owner AND v_turn.initiator_user_id<>v_thread.participant_user_id)
     OR v_turn.initiator_user_id=p_user_id
     OR NOT coalesce((SELECT e.eligible FROM public.get_team_entitlement(v_owner) e LIMIT 1), false)
     OR NOT coalesce((SELECT e.eligible FROM public.get_team_entitlement(v_thread.participant_user_id) e LIMIT 1), false)
     OR NOT coalesce((SELECT e.eligible FROM public.get_team_entitlement(v_turn.initiator_user_id) e LIMIT 1), false) THEN RETURN; END IF;

  -- Serialize per sender so concurrent requests cannot bypass the bounded
  -- delivery rate. Lock order is relationship -> thread -> turn -> user -> delivery.
  PERFORM 1 FROM auth.users u WHERE u.id=p_user_id FOR UPDATE;
  IF NOT FOUND THEN RETURN; END IF;
  -- A caller may retry only the exact same operation, destination, turn and text.
  SELECT * INTO v_existing FROM team_delivery_private.text_deliveries d
   WHERE d.sender_user_id=p_user_id AND d.operation_id=p_operation_id FOR UPDATE;
  IF FOUND THEN
    IF v_existing.thread_id<>v_thread.id OR v_existing.turn_id<>v_turn.id
       OR v_existing.recipient_user_id<>v_turn.initiator_user_id
       OR v_existing.content_sha256<>p_content_sha256
       OR v_existing.content IS DISTINCT FROM p_content THEN
      RAISE EXCEPTION 'delivery operation conflict';
    END IF;
    RETURN QUERY SELECT v_existing.id,v_existing.recipient_user_id,v_existing.created_at,v_existing.expires_at;
    RETURN;
  END IF;
  IF EXISTS (SELECT 1 FROM team_delivery_private.text_deliveries d WHERE d.turn_id=v_turn.id) THEN
    RAISE EXCEPTION 'turn already delivered';
  END IF;
  SELECT pg_catalog.count(*)::integer INTO v_count
    FROM team_delivery_private.text_delivery_events e
   WHERE e.actor_user_id=p_user_id AND e.event='created'
     AND e.occurred_at>pg_catalog.now()-interval '1 hour';
  IF v_count>=20 THEN RAISE EXCEPTION 'delivery rate limited'; END IF;
  INSERT INTO team_delivery_private.text_deliveries(
    thread_id,turn_id,relationship_id,sender_user_id,recipient_user_id,
    operation_id,content_sha256,content,expires_at
  ) VALUES (
    v_thread.id,v_turn.id,v_invite.id,p_user_id,v_turn.initiator_user_id,
    p_operation_id,p_content_sha256,p_content,pg_catalog.now()+interval '7 days'
  ) RETURNING team_delivery_private.text_deliveries.id INTO v_id;
  INSERT INTO team_delivery_private.text_delivery_events(delivery_id,event,actor_user_id)
    VALUES(v_id,'created',p_user_id);
  RETURN QUERY SELECT d.id,d.recipient_user_id,d.created_at,d.expires_at
    FROM team_delivery_private.text_deliveries d WHERE d.id=v_id;
END;
$$;

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
  IF NOT FOUND THEN RETURN; END IF;
  IF p_user_id<>v_delivery.recipient_user_id
     OR NOT coalesce((SELECT e.eligible FROM public.get_team_entitlement(p_user_id) e LIMIT 1), false) THEN RETURN; END IF;
  SELECT * INTO v_invite FROM public.team_space_invitations i
    WHERE i.id=v_delivery.relationship_id AND i.status='accepted' FOR UPDATE;
  IF NOT FOUND THEN RETURN; END IF;
  SELECT * INTO v_thread FROM public.team_space_conversation_threads th
    WHERE th.id=v_delivery.thread_id AND th.relationship_id=v_invite.id FOR UPDATE;
  IF NOT FOUND THEN RETURN; END IF;
  SELECT * INTO v_turn FROM public.team_space_conversation_turns t
    WHERE t.id=v_delivery.turn_id AND t.thread_id=v_thread.id FOR UPDATE;
  IF NOT FOUND OR v_turn.status<>'accepted' OR v_turn.recipient_user_id<>v_delivery.sender_user_id
     OR v_turn.initiator_user_id<>v_delivery.recipient_user_id THEN RETURN; END IF;
  SELECT s.owner_user_id INTO v_owner FROM public.team_shared_spaces s WHERE s.id=v_thread.space_id;
  IF v_owner IS NULL OR v_invite.space_id<>v_thread.space_id
     OR v_invite.inviter_user_id<>v_owner
     OR v_invite.invitee_user_id<>v_thread.participant_user_id
     OR (v_delivery.sender_user_id<>v_owner AND v_delivery.sender_user_id<>v_thread.participant_user_id)
     OR (v_delivery.recipient_user_id<>v_owner AND v_delivery.recipient_user_id<>v_thread.participant_user_id)
     OR (p_user_id<>v_owner AND p_user_id<>v_thread.participant_user_id)
     OR NOT coalesce((SELECT e.eligible FROM public.get_team_entitlement(v_owner) e LIMIT 1), false)
     OR NOT coalesce((SELECT e.eligible FROM public.get_team_entitlement(v_thread.participant_user_id) e LIMIT 1), false)
     OR NOT coalesce((SELECT e.eligible FROM public.get_team_entitlement(v_delivery.sender_user_id) e LIMIT 1), false) THEN RETURN; END IF;
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

-- Recipient discovery exposes opaque metadata only; payload is still returned
-- exclusively by read_text_delivery after a separate authorization check.
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
  IF v_owner IS NULL OR v_invite.space_id<>v_thread.space_id
     OR v_invite.inviter_user_id<>v_owner
     OR v_invite.invitee_user_id<>v_thread.participant_user_id
     OR (p_user_id<>v_owner AND p_user_id<>v_thread.participant_user_id)
     OR NOT coalesce((SELECT e.eligible FROM public.get_team_entitlement(p_user_id) e LIMIT 1), false)
     OR NOT coalesce((SELECT e.eligible FROM public.get_team_entitlement(v_owner) e LIMIT 1), false)
     OR NOT coalesce((SELECT e.eligible FROM public.get_team_entitlement(v_thread.participant_user_id) e LIMIT 1), false) THEN RETURN; END IF;
  RETURN QUERY SELECT d.id,d.turn_id,d.created_at,d.expires_at
    FROM team_delivery_private.text_deliveries d
    JOIN public.team_space_conversation_turns t ON t.id=d.turn_id AND t.thread_id=v_thread.id AND t.status='accepted'
   WHERE d.thread_id=v_thread.id AND d.relationship_id=v_invite.id
     AND d.recipient_user_id=p_user_id AND d.content IS NOT NULL AND d.deleted_at IS NULL
     AND d.expires_at>pg_catalog.now()
     AND (p_before_created_at IS NULL OR (d.created_at,d.id)<(p_before_created_at,p_before_delivery_id))
   ORDER BY d.created_at DESC,d.id DESC LIMIT p_limit;
END;
$$;

-- Bounded purge deletion; expired payload is immediately inaccessible in the
-- read RPC even before the purge endpoint is configured or invoked.
CREATE OR REPLACE FUNCTION team_delivery_private.purge_expired_text_deliveries(p_limit integer DEFAULT 500)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_count integer;
BEGIN
  IF p_limit IS NULL OR p_limit NOT BETWEEN 1 AND 5000 THEN RAISE EXCEPTION 'invalid purge limit'; END IF;
  WITH expired AS (
    SELECT d.id FROM team_delivery_private.text_deliveries d
     WHERE d.expires_at<=pg_catalog.now() AND d.content IS NOT NULL
     ORDER BY d.expires_at,d.id FOR UPDATE SKIP LOCKED LIMIT p_limit
  ), wiped AS (
    UPDATE team_delivery_private.text_deliveries d SET content=NULL,content_sha256=NULL,deleted_at=pg_catalog.now()
      FROM expired e WHERE d.id=e.id RETURNING d.id
  ), events AS (
    INSERT INTO team_delivery_private.text_delivery_events(delivery_id,event,actor_user_id)
      SELECT id,'expired',NULL FROM wiped RETURNING id
  ) SELECT pg_catalog.count(*)::integer INTO v_count FROM wiped;
  RETURN v_count;
END;
$$;

-- Narrow public RPC wrappers. PostgREST can see only wrappers; table and private
-- schema remain outside the Data API allowlist and ungranted to all API roles.
CREATE OR REPLACE FUNCTION public.create_team_text_delivery_v1(
  p_user_id uuid,p_thread_id uuid,p_turn_id uuid,p_operation_id uuid,p_content text,p_content_sha256 text
) RETURNS TABLE(id uuid,recipient_user_id uuid,created_at timestamptz,expires_at timestamptz)
LANGUAGE sql SECURITY DEFINER SET search_path = '' AS $$
  SELECT * FROM team_delivery_private.create_text_delivery($1,$2,$3,$4,$5,$6)
$$;
CREATE OR REPLACE FUNCTION public.read_team_text_delivery_v1(p_user_id uuid,p_delivery_id uuid)
RETURNS TABLE(id uuid,content text,created_at timestamptz,expires_at timestamptz)
LANGUAGE sql SECURITY DEFINER SET search_path = '' AS $$
  SELECT * FROM team_delivery_private.read_text_delivery($1,$2)
$$;
CREATE OR REPLACE FUNCTION public.list_team_text_deliveries_v1(
  p_user_id uuid,p_thread_id uuid,p_limit integer DEFAULT 50,
  p_before_created_at timestamptz DEFAULT NULL,p_before_delivery_id uuid DEFAULT NULL
) RETURNS TABLE(id uuid,turn_id uuid,created_at timestamptz,expires_at timestamptz)
LANGUAGE sql SECURITY DEFINER SET search_path = '' AS $$
  SELECT * FROM team_delivery_private.list_text_deliveries($1,$2,$3,$4,$5)
$$;
CREATE OR REPLACE FUNCTION public.purge_expired_team_text_deliveries(p_limit integer DEFAULT 500)
RETURNS integer LANGUAGE sql SECURITY DEFINER SET search_path = '' AS $$
  SELECT team_delivery_private.purge_expired_text_deliveries($1)
$$;

REVOKE ALL ON FUNCTION team_delivery_private.create_text_delivery(uuid,uuid,uuid,uuid,text,text),
  team_delivery_private.read_text_delivery(uuid,uuid),
  team_delivery_private.list_text_deliveries(uuid,uuid,integer,timestamptz,uuid),
  team_delivery_private.purge_expired_text_deliveries(integer)
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.create_team_text_delivery_v1(uuid,uuid,uuid,uuid,text,text),
  public.read_team_text_delivery_v1(uuid,uuid),
  public.list_team_text_deliveries_v1(uuid,uuid,integer,timestamptz,uuid),
  public.purge_expired_team_text_deliveries(integer)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_team_text_delivery_v1(uuid,uuid,uuid,uuid,text,text),
  public.read_team_text_delivery_v1(uuid,uuid),
  public.list_team_text_deliveries_v1(uuid,uuid,integer,timestamptz,uuid),
  public.purge_expired_team_text_deliveries(integer)
  TO service_role;
