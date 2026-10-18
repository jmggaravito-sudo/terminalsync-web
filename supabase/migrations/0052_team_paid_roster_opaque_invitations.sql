-- Paid Team roster assignment uses an opaque, one-time capability rather than
-- a browser-supplied employee identifier. The raw capability never reaches
-- this table: server code hashes it before calling these service-only RPCs.
-- A pending invitation reserves a seat for seven days, then expires lazily
-- under the same owner advisory lock used by all roster mutations.
CREATE TABLE public.team_paid_roster_invitations (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  owner_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE CHECK (token_hash ~ '^[0-9a-f]{64}$'),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','accepted','revoked','expired')),
  created_at timestamptz NOT NULL DEFAULT pg_catalog.now(),
  expires_at timestamptz NOT NULL DEFAULT (pg_catalog.now() + interval '7 days'),
  accepted_by_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  responded_at timestamptz,
  CHECK (expires_at > created_at),
  CHECK (
    (status='pending' AND accepted_by_user_id IS NULL AND responded_at IS NULL)
    OR (status='accepted' AND accepted_by_user_id IS NOT NULL AND responded_at IS NOT NULL)
    OR (status IN ('revoked','expired') AND accepted_by_user_id IS NULL AND responded_at IS NOT NULL)
  )
);
CREATE INDEX team_paid_roster_invites_owner_pending_idx
  ON public.team_paid_roster_invitations(owner_user_id, expires_at)
  WHERE status='pending';
ALTER TABLE public.team_paid_roster_invitations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.team_paid_roster_invitations FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.team_paid_roster_invitations TO service_role;

CREATE OR REPLACE FUNCTION public.create_team_paid_roster_invitation(
  p_owner_user_id uuid,
  p_token_hash text
)
RETURNS TABLE(expires_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE billing public.team_billing_subscriptions%rowtype;
        new_expires_at timestamptz;
BEGIN
  IF p_owner_user_id IS NULL OR p_token_hash IS NULL OR p_token_hash !~ '^[0-9a-f]{64}$' THEN
    RAISE EXCEPTION 'invalid roster invitation';
  END IF;

  -- Every mutation which can reserve or consume an owner seat takes this lock.
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_owner_user_id::text,0));
  UPDATE public.team_paid_roster_invitations AS invitation
     SET status='expired', responded_at=pg_catalog.now()
   WHERE invitation.owner_user_id=p_owner_user_id AND invitation.status='pending'
     AND invitation.expires_at<=pg_catalog.now();

  SELECT * INTO billing
    FROM public.team_billing_subscriptions b
   WHERE b.user_id=p_owner_user_id AND b.status IN ('active','trialing')
     AND (b.current_period_end IS NULL OR b.current_period_end>pg_catalog.now())
     AND (b.current_period_start IS NULL OR b.current_period_start<=pg_catalog.now())
   ORDER BY b.seat_count DESC,b.current_period_end DESC NULLS FIRST,b.stripe_subscription_id ASC
   LIMIT 1 FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'active paid Team required'; END IF;

  -- Owner consumes one seat. Existing members and pending opaque invitations
  -- both reserve capacity, so a later acceptance can never over-allocate.
  IF 1
     + (SELECT count(*) FROM public.team_paid_roster_members r WHERE r.owner_user_id=p_owner_user_id)
     + (SELECT count(*) FROM public.team_paid_roster_invitations i
          WHERE i.owner_user_id=p_owner_user_id AND i.status='pending' AND i.expires_at>pg_catalog.now())
     >= billing.seat_count THEN
    RAISE EXCEPTION 'paid Team seat capacity reached';
  END IF;

  INSERT INTO public.team_paid_roster_invitations(owner_user_id,token_hash)
  VALUES(p_owner_user_id,p_token_hash)
  RETURNING team_paid_roster_invitations.expires_at INTO new_expires_at;
  RETURN QUERY SELECT new_expires_at;
END; $$;

CREATE OR REPLACE FUNCTION public.accept_team_paid_roster_invitation(
  p_user_id uuid,
  p_token_hash text
)
RETURNS TABLE(result text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE invitation public.team_paid_roster_invitations%rowtype;
        owner_id uuid;
        billing public.team_billing_subscriptions%rowtype;
BEGIN
  IF p_user_id IS NULL OR p_token_hash IS NULL OR p_token_hash !~ '^[0-9a-f]{64}$' THEN
    RAISE EXCEPTION 'invalid roster invitation';
  END IF;

  -- Read owner before taking the owner lock, then lock/re-read the row. This
  -- keeps the lock order consistent with creation and avoids a row/owner-lock
  -- deadlock while revealing no lookup result to callers.
  SELECT i.owner_user_id INTO owner_id
    FROM public.team_paid_roster_invitations i WHERE i.token_hash=p_token_hash;
  IF owner_id IS NULL THEN RETURN QUERY SELECT 'unavailable'::text; RETURN; END IF;
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(owner_id::text,0));
  SELECT * INTO invitation
    FROM public.team_paid_roster_invitations i WHERE i.token_hash=p_token_hash FOR UPDATE;
  IF NOT FOUND OR invitation.status<>'pending' OR invitation.owner_user_id=p_user_id THEN
    RETURN QUERY SELECT 'unavailable'::text; RETURN;
  END IF;
  IF invitation.expires_at<=pg_catalog.now() THEN
    UPDATE public.team_paid_roster_invitations SET status='expired',responded_at=pg_catalog.now()
     WHERE id=invitation.id AND status='pending';
    RETURN QUERY SELECT 'unavailable'::text; RETURN;
  END IF;

  UPDATE public.team_paid_roster_invitations
     SET status='expired', responded_at=pg_catalog.now()
   WHERE owner_user_id=owner_id AND status='pending' AND expires_at<=pg_catalog.now();

  SELECT * INTO billing
    FROM public.team_billing_subscriptions b
   WHERE b.user_id=owner_id AND b.status IN ('active','trialing')
     AND (b.current_period_end IS NULL OR b.current_period_end>pg_catalog.now())
     AND (b.current_period_start IS NULL OR b.current_period_start<=pg_catalog.now())
   ORDER BY b.seat_count DESC,b.current_period_end DESC NULLS FIRST,b.stripe_subscription_id ASC
   LIMIT 1 FOR UPDATE;
  IF NOT FOUND THEN RETURN QUERY SELECT 'unavailable'::text; RETURN; END IF;

  -- A retry for a user already assigned by this owner resolves this particular
  -- invitation without consuming another seat.
  IF EXISTS(SELECT 1 FROM public.team_paid_roster_members r
            WHERE r.owner_user_id=owner_id AND r.employee_user_id=p_user_id) THEN
    UPDATE public.team_paid_roster_invitations
       SET status='accepted',accepted_by_user_id=p_user_id,responded_at=pg_catalog.now()
     WHERE id=invitation.id;
    RETURN QUERY SELECT 'accepted'::text; RETURN;
  END IF;

  -- Include this still-pending invitation in the capacity check. A seat-count
  -- reduction therefore fails closed instead of letting a stale link overbook.
  IF 1
     + (SELECT count(*) FROM public.team_paid_roster_members r WHERE r.owner_user_id=owner_id)
     + (SELECT count(*) FROM public.team_paid_roster_invitations i
          WHERE i.owner_user_id=owner_id AND i.status='pending' AND i.expires_at>pg_catalog.now())
     > billing.seat_count THEN
    RETURN QUERY SELECT 'unavailable'::text; RETURN;
  END IF;

  INSERT INTO public.team_paid_roster_members(owner_user_id,employee_user_id)
  VALUES(owner_id,p_user_id);
  UPDATE public.team_paid_roster_invitations
     SET status='accepted',accepted_by_user_id=p_user_id,responded_at=pg_catalog.now()
   WHERE id=invitation.id;
  RETURN QUERY SELECT 'accepted'::text;
END; $$;

CREATE OR REPLACE FUNCTION public.revoke_team_paid_roster_invitation(
  p_owner_user_id uuid,
  p_token_hash text
)
RETURNS TABLE(result text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE invitation public.team_paid_roster_invitations%rowtype;
BEGIN
  IF p_owner_user_id IS NULL OR p_token_hash IS NULL OR p_token_hash !~ '^[0-9a-f]{64}$' THEN
    RAISE EXCEPTION 'invalid roster invitation';
  END IF;
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_owner_user_id::text,0));
  SELECT * INTO invitation
    FROM public.team_paid_roster_invitations i
   WHERE i.owner_user_id=p_owner_user_id AND i.token_hash=p_token_hash FOR UPDATE;
  IF NOT FOUND OR invitation.status<>'pending' THEN RETURN QUERY SELECT 'unavailable'::text; RETURN; END IF;
  UPDATE public.team_paid_roster_invitations
     SET status=CASE WHEN invitation.expires_at<=pg_catalog.now() THEN 'expired' ELSE 'revoked' END,
         responded_at=pg_catalog.now()
   WHERE id=invitation.id;
  RETURN QUERY SELECT CASE WHEN invitation.expires_at<=pg_catalog.now() THEN 'unavailable' ELSE 'revoked' END::text;
END; $$;

-- Retire the old service-only UUID assignment escape hatch. No browser route
-- may turn a pasted employee UUID into a Team membership; only an accepted
-- opaque invitation can insert a new roster member after this migration.
CREATE OR REPLACE FUNCTION public.assign_team_paid_employee(p_owner_user_id uuid,p_employee_user_id uuid)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  RAISE EXCEPTION 'direct Team roster assignment is disabled; use an accepted invitation';
END; $$;

-- Owner snapshots subtract unaccepted, unexpired invitations from available
-- capacity while keeping invitee identities out of the read model.
CREATE OR REPLACE FUNCTION public.list_team_paid_roster(p_owner_user_id uuid)
RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  WITH billing AS (
    SELECT b.seat_count
      FROM public.team_billing_subscriptions b
      WHERE b.user_id = p_owner_user_id
        AND b.status IN ('active', 'trialing')
        AND (b.current_period_end IS NULL OR b.current_period_end > pg_catalog.now())
        AND (b.current_period_start IS NULL OR b.current_period_start <= pg_catalog.now())
      ORDER BY b.seat_count DESC, b.current_period_end DESC NULLS FIRST,
               b.stripe_subscription_id ASC
      LIMIT 1
  ), ranked AS (
    SELECT r.employee_user_id, r.created_at,
           pg_catalog.row_number() OVER (ORDER BY r.created_at, r.employee_user_id) AS roster_rank
      FROM public.team_paid_roster_members r
      WHERE r.owner_user_id = p_owner_user_id
  ), pending AS (
    SELECT pg_catalog.count(*) AS pending_invites
      FROM public.team_paid_roster_invitations i
      WHERE i.owner_user_id=p_owner_user_id AND i.status='pending' AND i.expires_at>pg_catalog.now()
  ), snapshot AS (
    SELECT billing.seat_count,
           (SELECT pg_catalog.count(*) FROM ranked) AS assigned_count,
           (SELECT pending_invites FROM pending) AS pending_invites,
           COALESCE((SELECT pg_catalog.jsonb_agg(
             pg_catalog.jsonb_build_object(
               'employee_user_id', ranked.employee_user_id,
               'created_at', ranked.created_at,
               'eligible', ranked.roster_rank < billing.seat_count
             ) ORDER BY ranked.created_at, ranked.employee_user_id
           ) FROM ranked), '[]'::jsonb) AS roster,
           COALESCE((SELECT pg_catalog.count(*) FROM ranked WHERE ranked.roster_rank < billing.seat_count), 0) AS eligible_count
      FROM billing
  )
  SELECT CASE WHEN EXISTS(SELECT 1 FROM billing) THEN
    pg_catalog.jsonb_build_object(
      'has_active_team', true,
      'seat_limit', snapshot.seat_count,
      'assigned_count', snapshot.assigned_count,
      'pending_invites', snapshot.pending_invites,
      'occupied_seats', 1 + snapshot.eligible_count + snapshot.pending_invites,
      'available_slots', GREATEST(snapshot.seat_count - 1 - snapshot.eligible_count - snapshot.pending_invites, 0::bigint),
      'roster', snapshot.roster
    )
    ELSE pg_catalog.jsonb_build_object(
      'has_active_team', false, 'seat_limit', 0, 'assigned_count', 0,
      'pending_invites', 0, 'occupied_seats', 0, 'available_slots', 0, 'roster', '[]'::jsonb
    ) END
    FROM (SELECT 1) AS singleton
    LEFT JOIN snapshot ON true
$$;

DO $$ DECLARE fn text; BEGIN
  FOREACH fn IN ARRAY ARRAY[
    'create_team_paid_roster_invitation(uuid,text)',
    'accept_team_paid_roster_invitation(uuid,text)',
    'revoke_team_paid_roster_invitation(uuid,text)',
    'assign_team_paid_employee(uuid,uuid)',
    'list_team_paid_roster(uuid)'
  ] LOOP
    EXECUTE 'REVOKE ALL ON FUNCTION public.'||fn||' FROM PUBLIC, anon, authenticated';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.'||fn||' TO service_role';
  END LOOP;
END $$;
