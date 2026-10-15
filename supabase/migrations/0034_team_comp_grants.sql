-- 0034 — Allow Team only as an explicit plan value for the existing comp flow.
--
-- Prerequisite: the app-schema 0016 comp-grants migration is already applied.
-- It owns public.comp_grants (CITEXT email + plan CHECK) and the
-- public.handle_new_user trigger that consumes pending grants. That trigger
-- assigns grant_row.plan generically, so it needs no Team-specific delivery,
-- roster, invitation, or approval behavior here.
--
-- This is intentionally not a checkout migration. It neither creates a
-- Stripe price nor enables Team sharing; those remain separately gated.

-- Keep legacy `dev` rows valid while accepting Team for a comp subscription.
ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_plan_check;
ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_plan_check
  CHECK (plan IN ('free', 'pro', 'max', 'team', 'dev', 'done_for_you'));

-- The canonical comp-grants schema originally allowed only Pro and Max.
ALTER TABLE public.comp_grants
  DROP CONSTRAINT IF EXISTS comp_grants_plan_check;
ALTER TABLE public.comp_grants
  ADD CONSTRAINT comp_grants_plan_check
  CHECK (plan IN ('pro', 'max', 'team'));

-- Match the client-side tier order: Free < Pro < Max < Team < Done-for-you.
CREATE OR REPLACE FUNCTION public.plan_rank(plan_name text)
RETURNS integer
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE plan_name
    WHEN 'free'         THEN 0
    WHEN 'pro'          THEN 1
    WHEN 'max'          THEN 2
    WHEN 'dev'          THEN 2
    WHEN 'team'         THEN 3
    WHEN 'done_for_you' THEN 4
    ELSE 0
  END;
$$;
