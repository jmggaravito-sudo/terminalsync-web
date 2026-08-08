-- Add the Integration Supervision Loop to the operational loop-runs history.
-- It does not discover marketplace items; it records landing↔app parity checks.

alter table public.loop_runs
  drop constraint if exists loop_runs_kind_check;

alter table public.loop_runs
  add constraint loop_runs_kind_check
  check (kind in ('connectors', 'plugins', 'kits', 'skills', 'supervision'));
