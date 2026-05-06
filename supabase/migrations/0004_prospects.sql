-- Prospects pipeline — non-dev founders / project managers / operators who
-- show buying intent for AI tools. Captured by the n8n Thunderbit-powered
-- workflow (Reddit + IndieHackers + n8n forums + LinkedIn search results)
-- and triaged by Gemini before landing here.

create type prospect_status as enum (
  'pending',     -- just captured, awaiting human review
  'qualified',   -- approved for outreach
  'contacted',   -- outreach email sent
  'replied',     -- they wrote back
  'converted',   -- signed up for TS Pro
  'rejected'     -- not a fit
);

create table prospects_no_dev (
  id              uuid primary key default gen_random_uuid(),
  -- discovery context
  source_platform text not null check (source_platform in ('reddit', 'indiehackers', 'n8n_forum', 'make_forum', 'linkedin', 'manual')),
  source_url      text not null,
  source_post_id  text,
  -- person
  name            text,
  handle          text,
  email           text,
  title           text,
  company         text,
  company_size    text,
  location        text,
  language        text check (language in ('en', 'es', 'pt', 'other')) default 'en',
  profile_url     text,
  -- the post / context that surfaced them
  post_excerpt    text,             -- 200-500 chars of the original post/comment
  post_date       timestamptz,
  pain_point      text,             -- gemini summary of what they need
  ai_tools_mentioned text[],        -- ['claude', 'chatgpt', 'n8n', ...]
  -- classification
  intent_score    numeric(3, 2) check (intent_score between 0 and 1),
  is_non_dev      boolean,          -- gemini's signal
  gemini_summary  text,
  -- review + outreach
  status          prospect_status not null default 'pending',
  rejection_reason text,
  outreach_subject text,
  outreach_body   text,             -- generated email pre-personalized
  outreach_sent_at timestamptz,
  resend_message_id text,
  reply_received_at timestamptz,
  reply_excerpt   text,
  converted_at    timestamptz,
  -- timestamps
  discovered_at   timestamptz not null default now(),
  reviewed_at     timestamptz,
  updated_at      timestamptz not null default now(),
  -- dedupe
  unique (source_url),
  unique (email) deferrable initially deferred
);

create index idx_prospects_status_discovered on prospects_no_dev (status, discovered_at desc);
create index idx_prospects_intent on prospects_no_dev (intent_score desc nulls last) where status = 'pending';
create index idx_prospects_source on prospects_no_dev (source_platform, discovered_at desc);

create trigger prospects_no_dev_updated before update on prospects_no_dev
  for each row execute function bump_updated_at();

alter table prospects_no_dev enable row level security;
