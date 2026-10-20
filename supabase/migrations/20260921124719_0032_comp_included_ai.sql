CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  grant_row public.comp_grants%rowtype;
BEGIN
  -- Keep the existing signup behavior from the comp-grants trigger.
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  );
  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (new.id, 'free', 'active');
  INSERT INTO public.audit_log (user_id, event, metadata)
  VALUES (new.id, 'signup', jsonb_build_object('provider', new.raw_app_meta_data->>'provider'));

  SELECT * INTO grant_row
  FROM public.comp_grants
  WHERE email = new.email AND claimed_at IS NULL
  LIMIT 1;

  IF FOUND THEN
    UPDATE public.subscriptions
    SET plan                   = grant_row.plan,
        status                 = 'active',
        stripe_customer_id     = 'comp',
        stripe_subscription_id = 'comp_' || left(new.id::text, 8),
        ai_included            = true,
        current_period_start   = now(),
        current_period_end     = now() + make_interval(months => grant_row.months),
        cancel_at_period_end   = false,
        updated_at             = now()
    WHERE user_id = new.id;

    UPDATE public.comp_grants
    SET claimed_at = now(), claimed_user_id = new.id, updated_at = now()
    WHERE email = grant_row.email;

    INSERT INTO public.courtesy_entitlement (user_id, tier, updated_at)
    VALUES (new.id::text, 'included_ai', now())
    ON CONFLICT (user_id) DO UPDATE SET
      tier = EXCLUDED.tier,
      updated_at = now();

    INSERT INTO public.audit_log (user_id, event, metadata)
    VALUES (new.id, 'plan_changed',
            jsonb_build_object('source', 'comp_pre_grant', 'plan', grant_row.plan));
  END IF;

  RETURN new;
END;
$$;