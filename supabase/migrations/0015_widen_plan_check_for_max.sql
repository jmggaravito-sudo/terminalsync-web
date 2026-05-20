-- 0015 — Allow the new "max" plan value alongside legacy "dev".
--
-- Strategy: widen the CHECK constraint, do NOT rewrite existing data.
--
-- Why not rewrite? Older Tauri builds in the wild hardcode the old enum
-- as PLAN_LIMITS = { free, pro, dev, done_for_you } and crash with
-- "undefined is not an object" when the `me` view returns "max". So we
-- keep DB rows as "dev" until every shipped client has the new code
-- with normalizePlan() that maps "dev" → "max" on read.
--
-- Forward path (after the matching Tauri release goes out):
--   1. New Tauri binary ships. The Stripe webhook + checkout will start
--      writing "max" for new subscriptions.
--   2. After we're confident every active client is on the new build,
--      a follow-up migration runs `UPDATE … SET plan='max' WHERE plan='dev'`
--      and drops "dev" from the CHECK list.
--
-- Until then both values are valid. The product surfaces only the "Max"
-- label because normalizePlan() in account.ts folds "dev" → "max" before
-- any UI lookup.

alter table public.subscriptions
  drop constraint if exists subscriptions_plan_check;

alter table public.subscriptions
  add constraint subscriptions_plan_check
  check (plan in ('free', 'pro', 'max', 'dev', 'done_for_you'));
