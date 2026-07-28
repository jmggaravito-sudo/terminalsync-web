-- Extend loop run history from connector-only to all marketplace loops.
-- Back-compatible: existing rows become kind='connectors', and the old numeric
-- columns remain so older dashboards/scripts keep working during rollout.

alter table public.loop_runs
  add column if not exists kind text not null default 'connectors';

alter table public.loop_runs
  drop constraint if exists loop_runs_kind_check;

alter table public.loop_runs
  add constraint loop_runs_kind_check
  check (kind in ('connectors', 'plugins', 'kits', 'skills'));

create index if not exists loop_runs_kind_ran_at_idx
  on public.loop_runs (kind, ran_at desc);
