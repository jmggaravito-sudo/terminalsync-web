-- Add a `kind` column to loop_runs so the /admin/loop-runs panel can
-- distinguish which Loop produced a run: the Connector Curation Loop, the
-- Plugin Curation Loop, the Skills loop, etc.
--
-- Backward-compatible: existing rows AND any writer that omits `kind` default
-- to 'connectors', so the current Connector Loop recording keeps working
-- unchanged. (The route + record_loop_run.mjs gain an optional `kind`.)
--
-- APPLY THIS MIGRATION BEFORE deploying the route change that writes `kind`,
-- or the insert will fail on a missing column.

alter table public.loop_runs
  add column if not exists kind text not null default 'connectors';

create index if not exists loop_runs_kind_idx on public.loop_runs (kind);
