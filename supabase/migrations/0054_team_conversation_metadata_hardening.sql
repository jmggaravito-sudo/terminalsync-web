-- Forward-only hardening for v3 conversation turns.
-- A turn is an approval request, not a payload channel.  Keep only an optional
-- numeric count in metadata; request_kind and the internal commitment hash
-- provide all remaining non-content classification.

CREATE OR REPLACE FUNCTION public._team_is_safe_conversation_metadata_v3(
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

-- Remove legacy free-form values before enforcing the final column contract.
-- Preserve an existing valid count, but never retain any other key.
UPDATE public.team_space_conversation_turns
SET metadata = CASE
  WHEN public._team_is_safe_conversation_metadata_v3(
    pg_catalog.jsonb_build_object('itemCount', metadata -> 'itemCount')
  ) THEN pg_catalog.jsonb_build_object('itemCount', metadata -> 'itemCount')
  ELSE '{}'::jsonb
END
WHERE NOT public._team_is_safe_conversation_metadata_v3(metadata);

ALTER TABLE public.team_space_conversation_turns
  ADD CONSTRAINT team_space_conversation_turns_metadata_safe_v3
  CHECK (public._team_is_safe_conversation_metadata_v3(metadata));

-- Rebuild the private assertion so all RPC writes and direct service-role
-- writes use the same closed metadata taxonomy.
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
     OR p_metadata IS NULL
     OR NOT coalesce(public._team_is_safe_conversation_metadata_v3(p_metadata), false)
  THEN
    RAISE EXCEPTION 'invalid conversation turn metadata';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public._team_is_safe_conversation_metadata_v3(jsonb)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public._team_is_safe_conversation_metadata_v3(jsonb)
  TO service_role;
