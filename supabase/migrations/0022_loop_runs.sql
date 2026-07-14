-- Operational history for the manual connectors Loop.
-- Minimal v1: one row per completed run, shown in /admin/loop-runs.

create table if not exists public.loop_runs (
  id uuid primary key default gen_random_uuid(),
  ran_at timestamptz not null default now(),
  connectors_found integer not null default 0 check (connectors_found >= 0),
  connectors_skipped integer not null default 0 check (connectors_skipped >= 0),
  pr_url text,
  created_at timestamptz not null default now()
);

create index if not exists loop_runs_ran_at_idx
  on public.loop_runs (ran_at desc);

alter table public.loop_runs enable row level security;

-- Read-only from authenticated clients. There are intentionally no
-- insert/update/delete policies; writes go through a server-side route with
-- SUPABASE_SERVICE_ROLE_KEY after checking LOOP_RUNS_WRITE_TOKEN.
drop policy if exists "authenticated can read loop runs" on public.loop_runs;
create policy "authenticated can read loop runs"
  on public.loop_runs
  for select
  to authenticated
  using (true);
