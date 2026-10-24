-- 20261023204420 — Owner-only accounting tenant/entity identity registry.
-- Applied to production 2026-10-23 after verifying version 0033 was already
-- occupied by another migration. No ledger data or customer-facing accounting
-- command is exposed by this migration.

CREATE TABLE IF NOT EXISTS public.accounting_tenants (
  id uuid PRIMARY KEY,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT pg_catalog.now()
);

CREATE TABLE IF NOT EXISTS public.accounting_entities (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES public.accounting_tenants(id) ON DELETE RESTRICT,
  country_code text NOT NULL CHECK (country_code ~ '^[A-Z]{2}$'),
  functional_currency text NOT NULL CHECK (functional_currency ~ '^[A-Z]{3}$'),
  created_at timestamptz NOT NULL DEFAULT pg_catalog.now()
);

CREATE INDEX IF NOT EXISTS accounting_tenants_owner_idx
  ON public.accounting_tenants(owner_id, id);
CREATE INDEX IF NOT EXISTS accounting_entities_tenant_idx
  ON public.accounting_entities(tenant_id, id);

ALTER TABLE public.accounting_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounting_entities ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.accounting_tenants, public.accounting_entities
  FROM PUBLIC, anon, authenticated;

CREATE SCHEMA IF NOT EXISTS private;
CREATE OR REPLACE FUNCTION private.accounting_permanent_user()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user uuid := auth.uid();
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'authentication_required' USING ERRCODE = '28000';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM auth.users u
    WHERE u.id = v_user AND NOT coalesce(u.is_anonymous, false)
  ) THEN
    RAISE EXCEPTION 'permanent_account_required' USING ERRCODE = '28000';
  END IF;
  RETURN v_user;
END $$;
REVOKE ALL ON FUNCTION private.accounting_permanent_user()
  FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.accounting_create_tenant(p_tenant_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_owner uuid := private.accounting_permanent_user();
  v_existing_owner uuid;
BEGIN
  IF p_tenant_id IS NULL THEN
    RAISE EXCEPTION 'invalid_accounting_tenant' USING ERRCODE = '22023';
  END IF;
  INSERT INTO public.accounting_tenants(id, owner_id)
  VALUES (p_tenant_id, v_owner)
  ON CONFLICT (id) DO NOTHING;
  SELECT t.owner_id INTO v_existing_owner
    FROM public.accounting_tenants t WHERE t.id = p_tenant_id;
  IF v_existing_owner IS DISTINCT FROM v_owner THEN
    RAISE EXCEPTION 'accounting_idempotency_conflict' USING ERRCODE = '23505';
  END IF;
  RETURN p_tenant_id;
END $$;

CREATE OR REPLACE FUNCTION public.accounting_create_entity(
  p_entity_id uuid,
  p_tenant_id uuid,
  p_country_code text,
  p_functional_currency text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_owner uuid := private.accounting_permanent_user();
  v_existing record;
BEGIN
  IF p_entity_id IS NULL THEN
    RAISE EXCEPTION 'invalid_accounting_entity' USING ERRCODE = '22023';
  END IF;
  IF p_tenant_id IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.accounting_tenants t
    WHERE t.id = p_tenant_id AND t.owner_id = v_owner
  ) THEN
    RAISE EXCEPTION 'accounting_tenant_not_found' USING ERRCODE = 'P0002';
  END IF;
  IF p_country_code IS NULL OR p_country_code !~ '^[A-Z]{2}$'
     OR p_functional_currency IS NULL
     OR p_functional_currency !~ '^[A-Z]{3}$' THEN
    RAISE EXCEPTION 'invalid_accounting_entity' USING ERRCODE = '22023';
  END IF;
  INSERT INTO public.accounting_entities(id, tenant_id, country_code, functional_currency)
  VALUES (p_entity_id, p_tenant_id, p_country_code, p_functional_currency)
  ON CONFLICT (id) DO NOTHING;
  SELECT e.tenant_id, e.country_code, e.functional_currency
    INTO v_existing
    FROM public.accounting_entities e
    JOIN public.accounting_tenants t ON t.id = e.tenant_id
    WHERE e.id = p_entity_id AND t.owner_id = v_owner;
  IF NOT FOUND OR v_existing.tenant_id IS DISTINCT FROM p_tenant_id
     OR v_existing.country_code IS DISTINCT FROM p_country_code
     OR v_existing.functional_currency IS DISTINCT FROM p_functional_currency THEN
    RAISE EXCEPTION 'accounting_idempotency_conflict' USING ERRCODE = '23505';
  END IF;
  RETURN p_entity_id;
END $$;

CREATE OR REPLACE FUNCTION public.accounting_list_entities()
RETURNS TABLE (
  tenant_id uuid,
  entity_id uuid,
  country_code text,
  functional_currency text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_owner uuid := private.accounting_permanent_user();
BEGIN
  RETURN QUERY
    SELECT t.id, e.id, e.country_code, e.functional_currency
    FROM public.accounting_tenants t
    JOIN public.accounting_entities e ON e.tenant_id = t.id
    WHERE t.owner_id = v_owner
    ORDER BY t.id, e.id;
END $$;

-- Narrow authorization check for a future desktop adapter. This does not
-- open or authorize any local SQLite path by itself.
CREATE OR REPLACE FUNCTION public.accounting_authorize_scope(
  p_tenant_id uuid,
  p_entity_id uuid
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_owner uuid := private.accounting_permanent_user();
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.accounting_tenants t
    JOIN public.accounting_entities e ON e.tenant_id = t.id
    WHERE t.owner_id = v_owner
      AND t.id = p_tenant_id
      AND e.id = p_entity_id
  );
END $$;

REVOKE ALL ON FUNCTION public.accounting_create_tenant(uuid)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.accounting_create_entity(uuid, uuid, text, text)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.accounting_list_entities()
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.accounting_authorize_scope(uuid, uuid)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.accounting_create_tenant(uuid)
  TO authenticated;
GRANT EXECUTE ON FUNCTION public.accounting_create_entity(uuid, uuid, text, text)
  TO authenticated;
GRANT EXECUTE ON FUNCTION public.accounting_list_entities()
  TO authenticated;
GRANT EXECUTE ON FUNCTION public.accounting_authorize_scope(uuid, uuid)
  TO authenticated;
