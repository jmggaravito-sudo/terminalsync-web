BEGIN;
CREATE TEMP TABLE comp_test_subscriptions (
  id integer PRIMARY KEY,
  stripe_customer_id text UNIQUE
);
CREATE UNIQUE INDEX real_customer_unique ON comp_test_subscriptions(stripe_customer_id)
  WHERE stripe_customer_id IS DISTINCT FROM 'comp';
ALTER TABLE comp_test_subscriptions DROP CONSTRAINT comp_test_subscriptions_stripe_customer_id_key;
INSERT INTO comp_test_subscriptions VALUES (1,'comp'),(2,'comp'),(3,NULL),(4,NULL),(5,'cus_real');
DO $$ BEGIN
  BEGIN
    INSERT INTO comp_test_subscriptions VALUES (6,'cus_real');
    RAISE EXCEPTION 'Duplicate real Stripe customer was accepted';
  EXCEPTION WHEN unique_violation THEN NULL;
  END;
  IF (SELECT count(*) FROM comp_test_subscriptions WHERE stripe_customer_id='comp') <> 2 THEN
    RAISE EXCEPTION 'Multiple comp accounts were not retained';
  END IF;
END $$;
ROLLBACK;
