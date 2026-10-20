-- Managed search usage (SearchApi behind /search/v1/* on the GLM Courtesy
-- Proxy Worker). Additive migration ON TOP of schema.sql ... 005. Never
-- touches the existing tables. Source: services/glm-courtesy-proxy/sql/006_search_usage.sql
-- at 21fee549 (PR #2422).
--
-- One row per (user, month, capability) with a counter of provider calls
-- charged to the user's monthly allowance. Cache hits are never recorded.
-- NEVER stores the search text, the location, the place, the video, the page
-- token or any result -- only counts and an estimated cost for metrics.

create table if not exists public.search_usage (
  user_id        text not null,
  period         text not null check (period ~ '^[0-9]{4}-[0-9]{2}$'),
  capability     text not null check (capability ~ '^[a-z_]{1,40}$'),
  units          int not null default 0 check (units >= 0),
  cost_microusd  bigint not null default 0 check (cost_microusd >= 0),
  updated_at     timestamptz not null default now(),
  primary key (user_id, period, capability)
);

alter table public.search_usage enable row level security;

drop policy if exists search_usage_self_read on public.search_usage;
create policy search_usage_self_read on public.search_usage
  for select using ((select auth.uid())::text = user_id);

create or replace function public.search_usage_month(p_user_id text, p_period text)
returns int
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(sum(units), 0)::int
  from search_usage
  where user_id = p_user_id
    and period = p_period;
$$;

create or replace function public.search_usage_try_consume(
  p_user_id        text,
  p_period         text,
  p_capability     text,
  p_limit          int,
  p_cost_microusd  bigint default 0
)
returns table(allowed boolean, used int, "limit" int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_used  int;
  v_limit int := greatest(coalesce(p_limit, 0), 0);
begin
  perform pg_advisory_xact_lock(hashtext('search_usage'), hashtext(p_user_id || ':' || p_period));

  select coalesce(sum(s.units), 0)::int into v_used
  from search_usage s
  where s.user_id = p_user_id
    and s.period = p_period;

  if v_used >= v_limit then
    return query select false, v_used, v_limit;
    return;
  end if;

  insert into search_usage as s (user_id, period, capability, units, cost_microusd, updated_at)
  values (p_user_id, p_period, p_capability, 1, greatest(coalesce(p_cost_microusd, 0), 0), now())
  on conflict (user_id, period, capability) do update
    set units         = s.units + 1,
        cost_microusd = s.cost_microusd + excluded.cost_microusd,
        updated_at    = now();

  return query select true, v_used + 1, v_limit;
end;
$$;

create or replace function public.search_usage_refund(
  p_user_id        text,
  p_period         text,
  p_capability     text,
  p_cost_microusd  bigint default 0
)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total int;
begin
  perform pg_advisory_xact_lock(hashtext('search_usage'), hashtext(p_user_id || ':' || p_period));

  update search_usage s
     set units         = greatest(s.units - 1, 0),
         cost_microusd = greatest(s.cost_microusd - greatest(coalesce(p_cost_microusd, 0), 0), 0),
         updated_at    = now()
   where s.user_id = p_user_id
     and s.period = p_period
     and s.capability = p_capability;

  select coalesce(sum(s.units), 0)::int into v_total
  from search_usage s
  where s.user_id = p_user_id
    and s.period = p_period;

  return v_total;
end;
$$;

revoke all on function public.search_usage_month(text, text) from public, anon, authenticated;
revoke all on function public.search_usage_try_consume(text, text, text, int, bigint) from public, anon, authenticated;
revoke all on function public.search_usage_refund(text, text, text, bigint) from public, anon, authenticated;
grant execute on function public.search_usage_month(text, text) to service_role;
grant execute on function public.search_usage_try_consume(text, text, text, int, bigint) to service_role;
grant execute on function public.search_usage_refund(text, text, text, bigint) to service_role;