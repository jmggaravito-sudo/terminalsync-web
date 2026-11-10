-- These records are only accessed by the server after it authenticates the
-- customer (or operator). No browser role should be able to read or write them.
create table public.voice_studio_entitlements (
  id uuid primary key default gen_random_uuid(),
  email text not null check (email = lower(btrim(email)) and length(email) between 3 and 320 and position('@' in email) > 1),
  source_id text not null unique check (length(btrim(source_id)) between 1 and 256),
  sku text not null check (sku in ('trial', 'single', 'pack4', 'pack8')),
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  video_total smallint not null,
  short_total smallint not null,
  video_used smallint not null default 0 check (video_used between 0 and video_total),
  short_used smallint not null default 0 check (short_used between 0 and short_total),
  constraint voice_studio_entitlements_owner_key unique (id, email),
  constraint voice_studio_entitlements_period check (ends_at is null or ends_at > starts_at),
  constraint voice_studio_entitlements_plan_capacity check (
    (sku in ('trial', 'single') and video_total = 1 and short_total = 0)
    or (sku = 'pack4' and video_total = 4 and short_total = 4 and ends_at is not null)
    or (sku = 'pack8' and video_total = 8 and short_total = 8 and ends_at is not null)
  )
);

create index voice_studio_entitlements_by_email on public.voice_studio_entitlements (email, starts_at desc);

create table public.voice_studio_production_orders (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  entitlement_id uuid not null,
  request_id uuid not null,
  request_item smallint not null check (request_item between 1 and 16),
  request_fingerprint text not null check (length(request_fingerprint) = 64),
  source_url text not null check (length(source_url) between 1 and 2048),
  notes text not null default '' check (length(notes) <= 2000),
  video_units smallint not null default 1 check (video_units between 1 and 3),
  short_mode text not null check (short_mode in ('none', 'best_moment', 'timestamp')),
  short_timestamp text,
  status text not null default 'queued' check (status in ('queued', 'in_progress', 'delivered')),
  video_url text check (length(video_url) <= 4096 and video_url ~ '^https://[^[:space:]/?#]+([/?#][^[:space:]]*)?$'),
  short_url text check (length(short_url) <= 4096 and short_url ~ '^https://[^[:space:]/?#]+([/?#][^[:space:]]*)?$'),
  created_at timestamptz not null default now(),
  constraint voice_studio_orders_owner_fk foreign key (entitlement_id, email)
    references public.voice_studio_entitlements (id, email),
  constraint voice_studio_orders_request_item_key unique (email, request_id, request_item),
  constraint voice_studio_orders_short_timestamp check (
    (short_mode = 'timestamp' and short_timestamp is not null
      and short_timestamp ~ '^([0-9]{1,3}:[0-5][0-9]|[0-9]{1,2}:[0-5][0-9]:[0-5][0-9])$')
    or (short_mode <> 'timestamp' and short_timestamp is null)
  ),
  constraint voice_studio_orders_no_extra_short check (short_mode <> 'none' or short_url is null),
  constraint voice_studio_orders_complete_delivery check (
    status <> 'delivered' or (video_url is not null and (short_mode = 'none' or short_url is not null))
  )
);

create index voice_studio_orders_by_client on public.voice_studio_production_orders (email, created_at desc);
create index voice_studio_orders_by_entitlement on public.voice_studio_production_orders (entitlement_id, email);
create index voice_studio_orders_by_status on public.voice_studio_production_orders (status, created_at desc);

alter table public.voice_studio_entitlements enable row level security;
alter table public.voice_studio_production_orders enable row level security;
revoke all on table public.voice_studio_entitlements, public.voice_studio_production_orders from public, anon, authenticated, service_role;
grant select, insert, update on table public.voice_studio_entitlements, public.voice_studio_production_orders to service_role;

create function public.voice_studio_submit_orders(
  p_email text,
  p_entitlement_id uuid,
  p_request_id uuid,
  p_orders jsonb
)
returns setof public.voice_studio_production_orders
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_email text := lower(btrim(p_email));
  v_fingerprint text;
  v_existing_fingerprint text;
  v_plan public.voice_studio_entitlements%rowtype;
  v_count integer;
  v_short_count integer;
  v_item jsonb;
  v_short_mode text;
  v_short_timestamp text;
  v_i integer := 0;
  v_url text;
  v_notes text;
  v_now timestamptz;
begin
  if v_email is null or length(v_email) not between 3 and 320 or position('@' in v_email) <= 1
    or p_request_id is null or p_entitlement_id is null or jsonb_typeof(p_orders) is distinct from 'array'
  then
    raise exception 'VOICE_STUDIO_INVALID_ORDER';
  end if;

  v_count := jsonb_array_length(p_orders);
  if v_count not between 1 and 16 or octet_length(p_orders::text) > 100000 then
    raise exception 'VOICE_STUDIO_INVALID_ORDER';
  end if;

  -- Serializes submissions for a customer even before any request row exists.
  -- Admin changes acquire the same lock first, then lock the entitlement.
  perform pg_advisory_xact_lock(hashtextextended('voice-studio:' || v_email, 0));
  v_fingerprint := encode(sha256(convert_to(
    jsonb_build_array(p_entitlement_id, p_orders)::text, 'UTF8'
  )), 'hex');

  select o.request_fingerprint into v_existing_fingerprint
    from public.voice_studio_production_orders o
    where o.email = v_email and o.request_id = p_request_id and o.request_item = 1;
  if found then
    if v_existing_fingerprint <> v_fingerprint then
      raise exception 'VOICE_STUDIO_IDEMPOTENCY_CONFLICT';
    end if;
    return query select o.*
      from public.voice_studio_production_orders o
      where o.email = v_email and o.request_id = p_request_id
      order by o.request_item;
    return;
  end if;

  select e.* into v_plan from public.voice_studio_entitlements e
    where e.id = p_entitlement_id and e.email = v_email for update;
  v_now := clock_timestamp();
  if not found or v_plan.starts_at > v_now or (v_plan.ends_at is not null and v_plan.ends_at <= v_now) then
    raise exception 'VOICE_STUDIO_NO_ACTIVE_PLAN';
  end if;

  v_short_count := case when v_plan.short_total > 0 then v_count else 0 end;
  if v_plan.video_total - v_plan.video_used < v_count or
    v_plan.short_total - v_plan.short_used < v_short_count
  then
    raise exception 'VOICE_STUDIO_INSUFFICIENT_CREDITS';
  end if;

  for v_item in select value from jsonb_array_elements(p_orders) loop
    if jsonb_typeof(v_item) is distinct from 'object' then
      raise exception 'VOICE_STUDIO_INVALID_ORDER';
    end if;
    if v_item - array['source_url', 'notes', 'short_mode', 'short_timestamp'] <> '{}'::jsonb
      or jsonb_typeof(v_item->'source_url') is distinct from 'string'
      or coalesce(jsonb_typeof(v_item->'notes'), 'null') not in ('string', 'null')
      or coalesce(jsonb_typeof(v_item->'short_mode'), 'null') not in ('string', 'null')
      or coalesce(jsonb_typeof(v_item->'short_timestamp'), 'null') not in ('string', 'null')
    then
      raise exception 'VOICE_STUDIO_INVALID_ORDER';
    end if;
    v_url := btrim(v_item->>'source_url');
    v_notes := btrim(coalesce(v_item->>'notes', ''));
    v_short_mode := coalesce(nullif(btrim(v_item->>'short_mode'), ''), 'none');
    v_short_timestamp := nullif(btrim(v_item->>'short_timestamp'), '');
    if length(v_url) > 2048 or v_url !~* '^(https?://)?((www[.]|m[.])?youtube[.]com|youtu[.]be)/[^[:space:]]+$'
      or length(v_notes) > 2000 or v_short_mode not in ('none', 'best_moment', 'timestamp')
      or (v_short_mode = 'timestamp' and (v_short_timestamp is null
        or v_short_timestamp !~ '^([0-9]{1,3}:[0-5][0-9]|[0-9]{1,2}:[0-5][0-9]:[0-5][0-9])$'))
      or (v_short_mode <> 'timestamp' and v_short_timestamp is not null)
    then
      raise exception 'VOICE_STUDIO_INVALID_ORDER';
    end if;
    if v_short_count = 0 and v_short_mode <> 'none' then
      raise exception 'VOICE_STUDIO_SHORT_NOT_INCLUDED';
    end if;
    if v_short_count > 0 and v_short_mode = 'none' then
      v_short_mode := 'best_moment';
    end if;

    v_i := v_i + 1;
    insert into public.voice_studio_production_orders
      (email, entitlement_id, request_id, request_item, request_fingerprint, source_url, notes, short_mode, short_timestamp)
      values (v_email, v_plan.id, p_request_id, v_i, v_fingerprint, v_url, v_notes, v_short_mode, v_short_timestamp);
  end loop;

  update public.voice_studio_entitlements
    set video_used = video_used + v_count, short_used = short_used + v_short_count
    where id = v_plan.id;

  return query select o.*
    from public.voice_studio_production_orders o
    where o.email = v_email and o.request_id = p_request_id
    order by o.request_item;
end;
$$;

create function public.voice_studio_update_order(
  p_order_id uuid,
  p_status text,
  p_video_url text,
  p_short_url text,
  p_video_units integer
)
returns setof public.voice_studio_production_orders
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_email text;
  v_entitlement_id uuid;
  v_plan public.voice_studio_entitlements%rowtype;
  v_order public.voice_studio_production_orders%rowtype;
  v_delta integer;
  v_video_url text := nullif(btrim(p_video_url), '');
  v_short_url text := nullif(btrim(p_short_url), '');
begin
  if p_status is null or p_status not in ('queued', 'in_progress', 'delivered')
    or p_video_units is null or p_video_units not between 1 and 3
    or length(v_video_url) > 4096 or v_video_url !~ '^https://[^[:space:]/?#]+([/?#][^[:space:]]*)?$'
    or length(v_short_url) > 4096 or v_short_url !~ '^https://[^[:space:]/?#]+([/?#][^[:space:]]*)?$'
  then
    raise exception 'VOICE_STUDIO_INVALID_ORDER';
  end if;
  select o.email, o.entitlement_id into v_email, v_entitlement_id
    from public.voice_studio_production_orders o where o.id = p_order_id;
  if not found then
    raise exception 'VOICE_STUDIO_ORDER_NOT_FOUND';
  end if;
  perform pg_advisory_xact_lock(hashtextextended('voice-studio:' || v_email, 0));
  select e.* into v_plan from public.voice_studio_entitlements e
    where e.id = v_entitlement_id and e.email = v_email for update;
  select o.* into v_order from public.voice_studio_production_orders o
    where o.id = p_order_id for update;

  if (v_order.status = 'delivered' and (p_status <> 'delivered' or p_video_units <> v_order.video_units))
    or (v_order.status = 'in_progress' and p_status = 'queued')
  then
    raise exception 'VOICE_STUDIO_INVALID_TRANSITION';
  end if;
  if v_order.short_mode = 'none' and v_short_url is not null then
    raise exception 'VOICE_STUDIO_SHORT_NOT_INCLUDED';
  end if;
  if p_status = 'delivered' and (v_video_url is null or (v_order.short_mode <> 'none' and v_short_url is null)) then
    raise exception 'VOICE_STUDIO_MISSING_DELIVERABLE';
  end if;
  v_delta := p_video_units - v_order.video_units;
  if v_plan.video_used + v_delta > v_plan.video_total or v_plan.video_used + v_delta < 0 then
    raise exception 'VOICE_STUDIO_INSUFFICIENT_CREDITS';
  end if;
  if v_delta <> 0 then
    update public.voice_studio_entitlements set video_used = video_used + v_delta where id = v_plan.id;
  end if;
  return query update public.voice_studio_production_orders o
    set status = p_status, video_url = v_video_url, short_url = v_short_url, video_units = p_video_units
    where o.id = p_order_id returning o.*;
end;
$$;

revoke all on function public.voice_studio_submit_orders(text, uuid, uuid, jsonb) from public, anon, authenticated;
revoke all on function public.voice_studio_update_order(uuid, text, text, text, integer) from public, anon, authenticated;
grant execute on function public.voice_studio_submit_orders(text, uuid, uuid, jsonb) to service_role;
grant execute on function public.voice_studio_update_order(uuid, text, text, text, integer) to service_role;
