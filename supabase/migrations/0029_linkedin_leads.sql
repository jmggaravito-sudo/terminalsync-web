-- LinkedIn leads: individual people found via public LinkedIn profile search
-- (Apify actor, no login/cookies), each analyzed and drafted into a
-- personalized outreach message by Anthropic. Ports the standalone
-- lead-hunter/ prototype (Express + lowdb + in-memory jobs) into this
-- Next.js/Supabase app so it lives alongside the rest of the admin panel.
--
-- Separate from `business_leads` on purpose: business_leads targets local
-- businesses scraped from Google Maps (phone/address/rating, WhatsApp-first
-- outreach); this targets individual LinkedIn profiles by job title
-- (headline/company/recent posts, DM-first outreach via a drafted message).
-- Different source, different shape, different pipeline states.

create type linkedin_lead_status as enum (
  'nuevo',              -- just found + drafted, nobody looked at it yet
  'contactado',         -- outreach message sent on LinkedIn
  'respondio',          -- they replied
  'reunion_agendada'    -- booked a call/meeting
);

create type linkedin_job_status as enum (
  'running',
  'done',
  'error'
);

-- Search jobs: Vercel serverless functions are stateless between
-- invocations, so (unlike lead-hunter's in-memory Map) job progress has to
-- be persisted here. The search POST route runs the Apify call + per-lead
-- Anthropic drafting synchronously within the request and writes progress
-- to this row after each lead, so a GET status-poll route can report live
-- progress while the function is still running.
create table if not exists linkedin_search_jobs (
  id            uuid primary key default gen_random_uuid(),
  filters       jsonb not null,        -- SearchFilters snapshot: keyword, target_titles, country, state, city, count
  status        linkedin_job_status not null default 'running',
  total         integer not null default 0,
  done          integer not null default 0,
  error         text,
  started_at    timestamptz not null default now(),
  finished_at   timestamptz
);

create table if not exists linkedin_leads (
  id                  uuid primary key default gen_random_uuid(),
  job_id              uuid references linkedin_search_jobs (id) on delete set null,

  -- search filters that produced this lead (kept per-row, not just on the
  -- job, so the lead survives/queries independently of job history)
  keyword             text,
  target_titles       jsonb,           -- text[] of job titles searched for
  country             text,
  state               text,
  city                text,

  -- profile fields, as scraped from the Apify actor (harvestapi/linkedin-profile-search)
  full_name           text not null,
  headline            text,            -- current title/headline
  company             text,
  location            text,
  profile_url         text,
  photo_url            text,
  recent_posts        jsonb,           -- array of strings, most recent public posts

  -- AI output (Anthropic): analysis + drafted outreach message
  analysis_summary    text,
  drafted_message     text,

  -- pipeline state
  status              linkedin_lead_status not null default 'nuevo',
  notes               text,

  discovered_at       timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Hot path: kanban board reads by status ordered by discovered_at desc.
create index if not exists idx_linkedin_leads_status_discovered
  on linkedin_leads (status, discovered_at desc);

create index if not exists idx_linkedin_leads_job
  on linkedin_leads (job_id);

-- Settings for the Anthropic drafting prompt (sender name, company, offer,
-- language). Single-row table, upserted with a fixed id — mirrors the
-- lead-hunter Settings shape 1:1 so the prompt content ports unchanged.
create table if not exists linkedin_settings (
  id                  integer primary key default 1,
  sender_name         text not null default '',
  company_name        text not null default '',
  offer_description   text not null default '',
  language            text not null default 'es' check (language in ('es', 'en')),
  updated_at          timestamptz not null default now(),

  constraint linkedin_settings_singleton check (id = 1)
);

insert into linkedin_settings (id) values (1)
  on conflict (id) do nothing;
