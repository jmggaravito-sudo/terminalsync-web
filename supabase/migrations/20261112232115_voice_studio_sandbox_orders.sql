-- Sandbox fulfillment only. Never write to the live production queue.
create table public.voice_studio_sandbox_orders (
  quote_id uuid primary key references public.voice_studio_quote_requests(id),
  stripe_session_id text not null unique check (stripe_session_id ~ '^cs_test_[a-zA-Z0-9]{1,200}$'),
  total_cents integer not null check (total_cents between 50 and 99999999),
  currency text not null check (currency = 'usd'),
  client_email_preview jsonb not null check (jsonb_typeof(client_email_preview) = 'object'),
  team_email_preview jsonb not null check (jsonb_typeof(team_email_preview) = 'object'),
  created_at timestamptz not null default now()
);

alter table public.voice_studio_sandbox_orders enable row level security;
revoke all on public.voice_studio_sandbox_orders from public, anon, authenticated, service_role;
grant select, insert on public.voice_studio_sandbox_orders to service_role;
