-- Shared Team spaces are metadata-only. This migration deliberately has no
-- content/ciphertext columns and no approval state that enables content access.
CREATE TABLE public.team_aliases (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  alias text NOT NULL CHECK (char_length(alias) BETWEEN 1 AND 64),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.team_shared_spaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
  description text CHECK (description IS NULL OR char_length(description) <= 500),
  external_ref text CHECK (external_ref IS NULL OR char_length(external_ref) <= 256),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX team_shared_spaces_owner_idx ON public.team_shared_spaces(owner_user_id);

CREATE TABLE public.team_space_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id uuid NOT NULL REFERENCES public.team_shared_spaces(id) ON DELETE CASCADE,
  inviter_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_email_hash text CHECK (invitee_email_hash IS NULL OR invitee_email_hash ~ '^[0-9a-f]{64}$'),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined','revoked')),
  created_at timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz,
  CHECK ((invitee_user_id IS NOT NULL) <> (invitee_email_hash IS NOT NULL)),
  CHECK ((status = 'pending' AND responded_at IS NULL) OR (status <> 'pending' AND responded_at IS NOT NULL))
);
CREATE INDEX team_space_invitations_invitee_idx ON public.team_space_invitations(invitee_user_id, status);

CREATE TABLE public.team_space_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id uuid NOT NULL REFERENCES public.team_shared_spaces(id) ON DELETE CASCADE,
  requester_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined','withdrawn')),
  manifest_hash text CHECK (manifest_hash IS NULL OR manifest_hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (space_id, requester_user_id)
);

CREATE TABLE public.team_space_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id uuid NOT NULL REFERENCES public.team_shared_spaces(id) ON DELETE CASCADE,
  proposer_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  proposal_hash text NOT NULL CHECK (proposal_hash ~ '^[0-9a-f]{64}$'),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined','withdrawn')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.team_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_shared_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_space_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_space_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_space_proposals ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.team_aliases, public.team_shared_spaces, public.team_space_invitations,
  public.team_space_requests, public.team_space_proposals FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.team_aliases, public.team_shared_spaces, public.team_space_invitations,
  public.team_space_requests, public.team_space_proposals TO service_role;

-- A single, service-role-only authorization gate. No client callable RPC is
-- provided until content delivery/import has a separately reviewed protocol.
CREATE OR REPLACE FUNCTION public.team_shared_spaces_eligible(p_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT p_user_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.team_memberships m
    WHERE m.user_id = p_user_id AND m.status = 'active'
      AND (m.expires_at IS NULL OR m.expires_at > now())
  )
$$;
REVOKE ALL ON FUNCTION public.team_shared_spaces_eligible(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.team_shared_spaces_eligible(uuid) TO service_role;
