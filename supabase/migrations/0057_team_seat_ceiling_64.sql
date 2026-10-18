-- Team seat capacity is capped at 64. Fail without rewriting any existing
-- rows if historical data violates the new bound; operators must reconcile
-- such rows before applying this forward-only migration.
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM public.team_billing_subscriptions
    WHERE seat_count < 1 OR seat_count > 64
  ) THEN
    RAISE EXCEPTION 'team_billing_subscriptions contains seat counts outside 1..64; reconcile before migration';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.team_checkout_intents
    WHERE seats < 1 OR seats > 64
  ) THEN
    RAISE EXCEPTION 'team_checkout_intents contains seat counts outside 1..64; reconcile before migration';
  END IF;
END $$;

ALTER TABLE public.team_billing_subscriptions
  ADD CONSTRAINT team_billing_subscriptions_seat_count_64_check
  CHECK (seat_count BETWEEN 1 AND 64);

ALTER TABLE public.team_checkout_intents
  ADD CONSTRAINT team_checkout_intents_seats_64_check
  CHECK (seats BETWEEN 1 AND 64);

-- The service-role billing and checkout-intent RPCs write these constrained
-- tables, so the same cap applies to webhook ingestion, intent reservation,
-- reconciliation, and all owner-roster assignment capacity calculations.
-- No access is granted or feature flag changed here.
