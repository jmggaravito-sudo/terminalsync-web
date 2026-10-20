create or replace function public.courtesy_tier(p_user_id text)
returns text
language sql
security definer
set search_path = public
as $$
  select case
    when exists (
      select 1
      from courtesy_entitlement
      where user_id = p_user_id
        and tier = 'included_ai'
    ) then 'included_ai'
    when exists (
      select 1
      from public.subscriptions s
      cross join lateral (select to_jsonb(s) as payload) row_json
      where s.user_id::text = p_user_id
        and s.status in ('active', 'trialing')
        and (
          lower(coalesce(row_json.payload->>'included_ai', '')) in ('true', '1', 'yes', 'included_ai')
          or lower(coalesce(row_json.payload->>'ai_included', '')) in ('true', '1', 'yes', 'included_ai')
          or lower(coalesce(row_json.payload->>'includes_ai', '')) in ('true', '1', 'yes', 'included_ai')
          or lower(coalesce(row_json.payload->'metadata'->>'included_ai', '')) in ('true', '1', 'yes', 'included_ai')
          or lower(coalesce(row_json.payload->>'add_ons', row_json.payload->>'addOns', row_json.payload->'metadata'->>'add_ons', '')) ~ '(^|[,;|[:space:]])included[_ -]?ai([,;|[:space:]]|$)'
          or lower(coalesce(row_json.payload->>'sku', row_json.payload->>'subscription_sku', row_json.payload->>'plan_sku', row_json.payload->>'price_id', row_json.payload->>'priceId', row_json.payload->>'provider_price_id', row_json.payload->>'plan', row_json.payload->'metadata'->>'sku', '')) ~ '(included[_ -]?ai|((pro|max)[_+ -]?ai)|(ai[_+ -]?(pro|max))|((pro|max)[_+ -]?ia)|(ia[_+ -]?(pro|max)))'
        )
    ) then 'included_ai'
    else 'courtesy'
  end;
$$;