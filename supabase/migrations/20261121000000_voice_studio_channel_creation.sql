-- Channel-creation upsell for per-minute quote intake: ops sees the request
-- and adds the setup work to the final quote amount. Order-level (not per
-- video), so it lives as its own boolean column instead of inside items.
alter table public.voice_studio_quote_requests
  add column if not exists channel_creation boolean not null default false;
