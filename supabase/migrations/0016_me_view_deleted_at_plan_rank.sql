-- 0016 — Expose profiles.deleted_at via `me` view + update plan_rank() for "max".
--
-- The desktop app reads from the `me` view; without deleted_at there it
-- can't show the "your account is scheduled for deletion" banner. Also
-- bumps plan_rank() so the new "max" plan ranks above "pro" (the rename
-- migration 0015 changed subscriptions.plan values but plan_rank still
-- maps "dev" → 2 and treats unknown "max" as 0, which would break
-- entitlement checks).

create or replace function public.plan_rank(plan_name text)
returns integer
language sql
immutable
as $$
  select case plan_name
    when 'free'         then 0
    when 'pro'          then 1
    when 'max'          then 2
    when 'dev'          then 2  -- legacy alias, in case any row survived 0015
    when 'done_for_you' then 3
    else 0
  end;
$$;

-- Postgres `create or replace view` requires existing columns to retain
-- their position. We append deleted_at at the end so the rewrite is legal.
create or replace view public.me as
  select
    p.id,
    p.email,
    p.full_name,
    p.avatar_url,
    p.locale,
    p.onboarded_at,
    p.email_marketing_opt_out,
    coalesce(s.plan, 'free'::text) as plan,
    plan_rank(coalesce(s.plan, 'free'::text)) as plan_rank,
    s.status as subscription_status,
    s.current_period_end,
    s.cancel_at_period_end,
    (select count(*) from storage_providers sp where sp.user_id = p.id) as storage_provider_count,
    (select count(*) from devices d where d.user_id = p.id) as device_count,
    p.deleted_at
  from profiles p
  left join subscriptions s
    on s.user_id = p.id
   and (s.status = any (array['active'::text, 'trialing'::text]))
  where p.id = auth.uid();
