-- Track the actual marketplace item slugs found/promoted by each loop run so
-- /admin/ops/loop-runs can link to landing pages, not just implementation PRs.
alter table public.loop_runs
  add column if not exists item_slugs text[] not null default '{}';
