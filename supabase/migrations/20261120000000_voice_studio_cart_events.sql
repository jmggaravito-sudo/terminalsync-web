-- Anonymous funnel metrics for the quote cart: one row per successful
-- cart-preview resolve (a link made it into a visitor's cart). No PII —
-- video id and duration only. The resolve route writes best-effort with
-- service_role; the ops panel reads totals, never the browser.
create table public.voice_studio_cart_events (
  id bigint generated always as identity primary key,
  kind text not null check (kind = 'link_added'),
  video_id text check (video_id ~ '^youtube-[A-Za-z0-9_-]{11}$'),
  seconds integer check (seconds between 1 and 14400),
  created_at timestamptz not null default now()
);

create index voice_studio_cart_events_created on public.voice_studio_cart_events (created_at desc);

alter table public.voice_studio_cart_events enable row level security;
revoke all on table public.voice_studio_cart_events from public, anon, authenticated, service_role;
grant select, insert on table public.voice_studio_cart_events to service_role;
