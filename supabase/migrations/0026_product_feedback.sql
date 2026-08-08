-- Product feedback / suggestions inbox for TerminalSync Ops.
--
-- n8n flow `TSync · Feedback (Sugerencias)` should insert one row per
-- suggestion/bug/request here. The Admin Ops feedback inbox reads this table
-- server-side with SUPABASE_SERVICE_ROLE_KEY, so no public RLS policy is needed.

create table if not exists public.product_feedback (
  id uuid primary key default gen_random_uuid(),

  -- where it came from: app widget, landing form, email import, n8n manual, etc.
  source text not null default 'unknown',
  page_url text,

  -- operator triage
  category text not null default 'suggestion'
    check (category in ('suggestion', 'bug', 'feature', 'sales_signal', 'complaint', 'other')),
  status text not null default 'new'
    check (status in ('new', 'reviewing', 'planned', 'done', 'dismissed')),
  priority text not null default 'normal'
    check (priority in ('low', 'normal', 'high', 'urgent')),

  -- user/customer context when available
  user_id uuid,
  name text,
  email text,

  -- the actual feedback
  title text,
  message text not null,
  metadata jsonb not null default '{}'::jsonb,

  -- optional follow-through once JM converts it into work
  converted_to_task_url text,
  reviewed_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_product_feedback_status_created
  on public.product_feedback (status, created_at desc);

create index if not exists idx_product_feedback_category_created
  on public.product_feedback (category, created_at desc);

create index if not exists idx_product_feedback_priority_created
  on public.product_feedback (priority, created_at desc);

alter table public.product_feedback enable row level security;

-- No anon/authenticated policies on purpose. Reads/writes go through trusted
-- server-side code or n8n using the service-role key. This keeps customer
-- feedback private even if the table is exposed through the Supabase Data API.

create or replace function public.product_feedback_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists product_feedback_touch_updated_at on public.product_feedback;
create trigger product_feedback_touch_updated_at
  before update on public.product_feedback
  for each row execute function public.product_feedback_touch_updated_at();
