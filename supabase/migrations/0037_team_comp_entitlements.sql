-- Team is an additive membership, never a replacement subscription plan.
CREATE TABLE public.team_memberships (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
  source text NOT NULL CHECK (source IN ('admin_comp', 'paid')),
  starts_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  granted_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.team_comp_grants (
  email citext PRIMARY KEY,
  months integer NOT NULL CHECK (months BETWEEN 1 AND 36),
  granted_by text NOT NULL,
  claimed_at timestamptz,
  claimed_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.team_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_comp_grants ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.team_memberships, public.team_comp_grants FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.team_memberships, public.team_comp_grants TO service_role;

-- Serialize Team comp grants with paid membership creation and make revocation
-- of Team + base comp + included-AI one transaction. SECURITY DEFINER is
-- restricted to service_role; callers must not split these mutations.
CREATE OR REPLACE FUNCTION public.admin_grant_team_comp(
  p_user_id uuid, p_starts_at timestamptz, p_expires_at timestamptz, p_granted_by text
) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE current_source text;
BEGIN
  INSERT INTO public.team_memberships (user_id,status,source,starts_at,expires_at,granted_by)
  VALUES (p_user_id,'active','admin_comp',p_starts_at,p_expires_at,p_granted_by)
  ON CONFLICT (user_id) DO UPDATE SET status='active', source='admin_comp',
    starts_at=EXCLUDED.starts_at, expires_at=EXCLUDED.expires_at,
    granted_by=EXCLUDED.granted_by, updated_at=now()
  WHERE public.team_memberships.source='admin_comp';
  IF NOT FOUND THEN RETURN 'paid_membership'; END IF;
  RETURN 'ok';
END; $$;

CREATE OR REPLACE FUNCTION public.admin_revoke_comp(p_email citext)
RETURNS TABLE(result text, revoked_user_id uuid)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE target_id uuid; sub public.subscriptions%rowtype;
BEGIN
  SELECT p.id INTO target_id FROM public.profiles p WHERE lower(p.email)=lower(p_email) FOR UPDATE;
  IF target_id IS NULL THEN
    DELETE FROM public.team_comp_grants WHERE email=p_email;
    DELETE FROM public.comp_grants WHERE email=p_email;
    RETURN QUERY SELECT 'not_found', NULL::uuid; RETURN;
  END IF;
  SELECT * INTO sub FROM public.subscriptions WHERE user_id=target_id FOR UPDATE;
  IF FOUND AND ((sub.stripe_customer_id IS NOT NULL AND sub.stripe_customer_id <> 'comp')
    OR sub.provider_customer_id IS NOT NULL OR sub.provider_subscription_id IS NOT NULL) THEN
    RETURN QUERY SELECT 'paid_subscription', target_id; RETURN;
  END IF;
  DELETE FROM public.team_comp_grants WHERE email=p_email;
  DELETE FROM public.comp_grants WHERE email=p_email;
  UPDATE public.team_memberships SET status='revoked', updated_at=now()
    WHERE user_id=target_id AND source='admin_comp' AND status='active';
  -- Only a row carrying both admin-comp sentinels is owned by this endpoint.
  -- A free/trial/Pro/Max/provider row (or absent row) remains untouched.
  UPDATE public.subscriptions SET plan='free',status='canceled',ai_included=false,
    cancel_at_period_end=false,updated_at=now()
    WHERE user_id=target_id AND stripe_customer_id='comp'
      AND stripe_subscription_id='comp_' || left(target_id::text,8);
  IF FOUND THEN
    DELETE FROM public.courtesy_entitlement WHERE user_id=target_id::text AND tier='included_ai';
    RETURN QUERY SELECT 'ok',target_id; RETURN;
  END IF;
  RETURN QUERY SELECT 'ok_no_base_comp',target_id;
END; $$;
REVOKE ALL ON FUNCTION public.admin_grant_team_comp(uuid,timestamptz,timestamptz,text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.admin_revoke_comp(citext) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_grant_team_comp(uuid,timestamptz,timestamptz,text) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_revoke_comp(citext) TO service_role;

-- Preserve signup's existing base-plan comp behavior, then claim the separate
-- Team grant without modifying subscriptions.plan.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE grant_row public.comp_grants%rowtype; team_grant public.team_comp_grants%rowtype;
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (new.id, new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url');
  INSERT INTO public.subscriptions (user_id, plan, status) VALUES (new.id, 'free', 'active');
  INSERT INTO public.audit_log (user_id, event, metadata)
  VALUES (new.id, 'signup', jsonb_build_object('provider', new.raw_app_meta_data->>'provider'));

  SELECT * INTO grant_row FROM public.comp_grants
    WHERE email = new.email AND claimed_at IS NULL LIMIT 1;
  IF FOUND THEN
    UPDATE public.subscriptions SET plan=grant_row.plan, status='active',
      stripe_customer_id='comp', stripe_subscription_id='comp_' || left(new.id::text, 8),
      ai_included=true, current_period_start=now(),
      current_period_end=now()+make_interval(months => grant_row.months),
      cancel_at_period_end=false, updated_at=now() WHERE user_id=new.id;
    UPDATE public.comp_grants SET claimed_at=now(), claimed_user_id=new.id, updated_at=now()
      WHERE email=grant_row.email;
    INSERT INTO public.courtesy_entitlement (user_id, tier, updated_at)
      VALUES (new.id::text, 'included_ai', now())
      ON CONFLICT (user_id) DO UPDATE SET tier=EXCLUDED.tier, updated_at=now();
    INSERT INTO public.audit_log (user_id, event, metadata)
      VALUES (new.id, 'plan_changed', jsonb_build_object('source','comp_pre_grant','plan',grant_row.plan));
  END IF;

  SELECT * INTO team_grant FROM public.team_comp_grants
    WHERE email=new.email AND claimed_at IS NULL FOR UPDATE;
  IF FOUND THEN
    INSERT INTO public.team_memberships (user_id,status,source,starts_at,expires_at,granted_by)
    VALUES (new.id,'active','admin_comp',now(),now()+make_interval(months => team_grant.months),team_grant.granted_by)
    ON CONFLICT (user_id) DO UPDATE SET status='active', source='admin_comp', starts_at=now(),
      expires_at=EXCLUDED.expires_at, granted_by=EXCLUDED.granted_by, updated_at=now()
      WHERE public.team_memberships.source = 'admin_comp';
    UPDATE public.team_comp_grants SET claimed_at=now(), claimed_user_id=new.id, updated_at=now()
      WHERE email=team_grant.email;
  END IF;
  RETURN new;
END; $$;
