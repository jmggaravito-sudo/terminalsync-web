-- 'comp' is a shared non-Stripe sentinel used by both the admin API and
-- handle_new_user. Preserve uniqueness for every real customer identifier,
-- while allowing multiple complimentary accounts. No rows are changed.
CREATE UNIQUE INDEX subscriptions_real_customer_id_unique
  ON public.subscriptions (stripe_customer_id)
  WHERE stripe_customer_id IS DISTINCT FROM 'comp';

ALTER TABLE public.subscriptions
  DROP CONSTRAINT subscriptions_stripe_customer_id_key;
