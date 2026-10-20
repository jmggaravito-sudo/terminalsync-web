create table if not exists public.connector_requests (
  id            bigserial primary key,
  user_ref      text not null,
  requested     text not null check (char_length(requested) between 1 and 80),
  note          text check (note is null or char_length(note) <= 200),
  source        text not null check (source in ('chat', 'explorer')),
  lang          text not null check (lang in ('es', 'en')),
  terminal_ref  text not null check (terminal_ref ~ '^[0-9a-fA-F]{16}$'),
  app_version   text not null check (char_length(app_version) between 1 and 64),
  created_at    timestamptz not null,
  received_at   timestamptz not null default now()
);
create index if not exists connector_requests_dedupe_idx
  on public.connector_requests (user_ref, requested, source, received_at desc);
create index if not exists connector_requests_received_idx
  on public.connector_requests (received_at desc);
alter table public.connector_requests enable row level security;
revoke all on public.connector_requests from public, anon, authenticated;
create or replace function public.connector_request_record(
  p_user_ref     text,
  p_requested    text,
  p_note         text,
  p_source       text,
  p_lang         text,
  p_terminal_ref text,
  p_app_version  text,
  p_created_at   timestamptz
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_user_ref is null or p_user_ref = '' then
    raise exception 'user_ref is required';
  end if;
  if p_requested is null or char_length(p_requested) not between 1 and 80 then
    raise exception 'requested is invalid';
  end if;
  if p_source not in ('chat', 'explorer') then
    raise exception 'source is invalid';
  end if;
  if p_lang not in ('es', 'en') then
    raise exception 'lang is invalid';
  end if;
  if p_terminal_ref is null or p_terminal_ref !~ '^[0-9a-fA-F]{16}$' then
    raise exception 'terminal_ref is invalid';
  end if;
  perform pg_advisory_xact_lock(
    hashtextextended(p_user_ref || chr(0) || p_requested || chr(0) || p_source, 0)
  );
  if exists (
    select 1
    from public.connector_requests
    where user_ref = p_user_ref
      and requested = p_requested
      and source = p_source
      and received_at >= now() - interval '24 hours'
  ) then
    return false;
  end if;
  insert into public.connector_requests (
    user_ref, requested, note, source, lang, terminal_ref, app_version,
    created_at, received_at
  ) values (
    p_user_ref, p_requested, p_note, p_source, p_lang, lower(p_terminal_ref),
    p_app_version, p_created_at, now()
  );
  return true;
end;
$$;
revoke all on function public.connector_request_record(
  text, text, text, text, text, text, text, timestamptz
) from public, anon, authenticated;
grant execute on function public.connector_request_record(
  text, text, text, text, text, text, text, timestamptz
) to service_role;
create or replace view public.connector_requests_weekly as
select
  requested,
  count(*)::bigint as pedidos,
  count(distinct user_ref)::bigint as personas_distintas,
  max(received_at) as ultimo_pedido
from public.connector_requests
where received_at >= now() - interval '7 days'
group by requested
order by pedidos desc, ultimo_pedido desc;
revoke all on public.connector_requests_weekly from public, anon, authenticated;
grant select on public.connector_requests_weekly to service_role;