-- 0015 — Rename the "dev" plan to "max".
--
-- Why: "Dev" implied the plan was for developers and confused spa/restaurant
-- owners who looked at the pricing page. "Max" makes the tier ladder obvious
-- (Free → Pro → Max) and is industry-recognizable as "most complete".
--
-- Strategy: drop CHECK constraint → rewrite existing rows → re-add CHECK
-- with the new value. Done in a single transaction so the table never
-- sits in an inconsistent state. Idempotent: if no rows match, the
-- UPDATE is a no-op and the constraint swap is fine.

begin;

alter table public.subscriptions
  drop constraint if exists subscriptions_plan_check;

update public.subscriptions
  set plan = 'max', updated_at = now()
  where plan = 'dev';

alter table public.subscriptions
  add constraint subscriptions_plan_check
  check (plan in ('free', 'pro', 'max', 'done_for_you'));

commit;
