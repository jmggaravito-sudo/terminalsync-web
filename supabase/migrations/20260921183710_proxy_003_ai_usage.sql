create table if not exists public.ai_usage (
  id                 bigserial primary key,
  req_id             text not null unique,
  user_id            text not null,
  terminal_ref       text,
  surface            text not null check (surface in ('chat', 'image', 'video', 'automation')),
  provider           text not null,
  connection_mode    text,
  requested_model    text,
  effective_model    text,
  input_tokens       int not null default 0,
  output_tokens      int not null default 0,
  cache_read_tokens  int not null default 0,
  cache_write_tokens int not null default 0,
  retries            int not null default 0,
  tool_calls         int not null default 0,
  cost_usd           numeric(12,6) not null default 0,
  tier               text,
  ai_advanced_mode   boolean,
  created_at         timestamptz not null default now()
);
create index if not exists ai_usage_user_created_idx on public.ai_usage (user_id, created_at);
alter table public.ai_usage enable row level security;
drop policy if exists ai_usage_self_read on public.ai_usage;
create policy ai_usage_self_read on public.ai_usage
  for select using (auth.uid()::text = user_id);
create or replace function public.ai_usage_record(
  p_req_id             text,
  p_user_id            text,
  p_surface            text,
  p_provider           text,
  p_terminal_ref       text default null,
  p_connection_mode    text default null,
  p_requested_model    text default null,
  p_effective_model    text default null,
  p_input_tokens       int default 0,
  p_output_tokens      int default 0,
  p_cache_read_tokens  int default 0,
  p_cache_write_tokens int default 0,
  p_retries            int default 0,
  p_tool_calls         int default 0,
  p_cost_usd           numeric default 0,
  p_tier               text default null,
  p_ai_advanced_mode   boolean default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into ai_usage as u (
    req_id, user_id, terminal_ref, surface, provider, connection_mode,
    requested_model, effective_model, input_tokens, output_tokens,
    cache_read_tokens, cache_write_tokens, retries, tool_calls, cost_usd,
    tier, ai_advanced_mode
  )
  values (
    p_req_id, p_user_id, p_terminal_ref, p_surface, p_provider, p_connection_mode,
    p_requested_model, p_effective_model,
    greatest(coalesce(p_input_tokens, 0), 0),
    greatest(coalesce(p_output_tokens, 0), 0),
    greatest(coalesce(p_cache_read_tokens, 0), 0),
    greatest(coalesce(p_cache_write_tokens, 0), 0),
    greatest(coalesce(p_retries, 0), 0),
    greatest(coalesce(p_tool_calls, 0), 0),
    greatest(coalesce(p_cost_usd, 0), 0),
    p_tier, p_ai_advanced_mode
  )
  on conflict (req_id) do nothing;
end;
$$;
create or replace function public.ai_usage_monthly(p_user_id text, p_month text)
returns table(
  surface text,
  provider text,
  turns bigint,
  input_tokens bigint,
  output_tokens bigint,
  cost_usd numeric
)
language sql
security definer
set search_path = public
as $$
  select
    surface,
    provider,
    count(*) as turns,
    coalesce(sum(input_tokens), 0) as input_tokens,
    coalesce(sum(output_tokens), 0) as output_tokens,
    coalesce(sum(cost_usd), 0) as cost_usd
  from ai_usage
  where user_id = p_user_id
    and to_char(created_at at time zone 'utc', 'YYYY-MM') = p_month
  group by surface, provider
  order by surface, provider;
$$;
revoke all on function public.ai_usage_record(
  text, text, text, text, text, text, text, text, int, int, int, int, int, int, numeric, text, boolean
) from public, anon, authenticated;
revoke all on function public.ai_usage_monthly(text, text) from public, anon, authenticated;
grant execute on function public.ai_usage_record(
  text, text, text, text, text, text, text, text, int, int, int, int, int, int, numeric, text, boolean
) to service_role;
grant execute on function public.ai_usage_monthly(text, text) to service_role;