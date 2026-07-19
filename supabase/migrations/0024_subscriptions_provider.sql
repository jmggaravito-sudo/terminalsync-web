-- 0024 — Make `subscriptions` provider-agnostic (Stripe + Mercado Pago).
--
-- Until now the table was Stripe-shaped: `stripe_customer_id` /
-- `stripe_subscription_id` and an implicit "everything here is Stripe"
-- assumption. To offer Mercado Pago as a PARALLEL payment rail for the same
-- Terminal Sync subscription, one row must be able to describe either
-- provider. A user still has exactly ONE subscription (conflict key stays
-- `user_id`) — they pay through one provider at a time.
--
-- Strategy (mirrors 0015's additive, no-rewrite posture):
--   1. Add a `provider` discriminator, default 'stripe' so every existing row
--      is correct without a data rewrite.
--   2. Add generic `provider_customer_id` / `provider_subscription_id` columns
--      and backfill them from the Stripe columns. The provider-neutral upsert
--      (src/lib/subscriptionState.ts) writes these for BOTH providers, and
--      keeps the legacy `stripe_*` columns populated for Stripe rows so any
--      reader still selecting them keeps working during the transition.
--
-- The legacy `stripe_customer_id` / `stripe_subscription_id` columns are NOT
-- dropped here — a follow-up migration can retire them once nothing reads them.

alter table public.subscriptions
  add column if not exists provider text not null default 'stripe';

alter table public.subscriptions
  drop constraint if exists subscriptions_provider_check;
alter table public.subscriptions
  add constraint subscriptions_provider_check
  check (provider in ('stripe', 'mercadopago'));

alter table public.subscriptions
  add column if not exists provider_customer_id text;
alter table public.subscriptions
  add column if not exists provider_subscription_id text;

-- Backfill the generic columns from the Stripe columns so no existing row
-- loses its provider linkage.
update public.subscriptions
  set provider_customer_id = coalesce(provider_customer_id, stripe_customer_id),
      provider_subscription_id = coalesce(provider_subscription_id, stripe_subscription_id)
  where provider_customer_id is null
     or provider_subscription_id is null;

-- Look up a subscription by its provider subscription id regardless of rail.
create index if not exists subscriptions_provider_subscription_id_idx
  on public.subscriptions (provider_subscription_id);
