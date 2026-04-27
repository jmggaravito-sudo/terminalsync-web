-- Outreach pipeline tracking. Populated by the n8n flow that scrapes
-- YouTube + X and sends personalized DMs. The n8n side is the system of
-- record for "what got sent"; this table is the web side's mirror so we
-- can attribute conversions and dedupe across runs.

create table if not exists public.outreach_leads (
  id uuid primary key default gen_random_uuid(),

  platform text not null check (platform in ('x', 'youtube', 'email', 'linkedin')),
  handle text not null,
  profile_url text not null,
  display_name text,
  bio text,
  followers integer,

  tier smallint check (tier between 1 and 3),
  dm_version text check (dm_version in ('a', 'b', 'c')),
  keywords_matched text[],
  recent_quote text,

  -- Lifecycle stamps. n8n hits the endpoint on send; reply / convert can be
  -- backfilled later via a separate endpoint or manual update.
  sent_at timestamptz not null default now(),
  responded_at timestamptz,
  converted_at timestamptz,

  -- Free-form metadata bag for anything the n8n flow wants to attach
  -- (campaign name, tier rationale, etc.) without schema churn.
  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now()
);

-- Dedup index — the n8n flow checks (platform, handle) before contacting.
create unique index if not exists outreach_leads_platform_handle_idx
  on public.outreach_leads (platform, handle);

create index if not exists outreach_leads_sent_at_idx
  on public.outreach_leads (sent_at desc);

create index if not exists outreach_leads_tier_idx
  on public.outreach_leads (tier);

-- RLS off — this table is service-role only. The endpoint that writes uses
-- the admin client; nobody hits it from the browser.
alter table public.outreach_leads enable row level security;
-- No policies = no access for authenticated/anon. Service role bypasses RLS.
