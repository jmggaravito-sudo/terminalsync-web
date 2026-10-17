-- Automatically grant the existing no-card Team trial to accounts created
-- after this migration. Existing accounts are deliberately not backfilled;
-- they retain the authenticated manual claim flow through /api/team/trial.
-- This writes only the separate Team entitlement table, never subscriptions
-- or Stripe state.
CREATE OR REPLACE FUNCTION public.grant_team_trial_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE started timestamptz := pg_catalog.clock_timestamp();
BEGIN
  INSERT INTO public.team_trial_entitlements(user_id, starts_at, expires_at)
  VALUES (NEW.id, started, started + interval '168 hours')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.grant_team_trial_on_signup() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS grant_team_trial_on_signup ON auth.users;
CREATE TRIGGER grant_team_trial_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.grant_team_trial_on_signup();
