-- Agency influencers: creators (YT / X / etc.) whose audience are
-- marketing/SaaS/growth agency owners. Captured by the daily n8n
-- workflow (7ooGFm2XvT8SLdde) AFTER a Gemini pass classifies each
-- candidate's channel description as agency-targeted vs not.
--
-- Lives in its own table (not `discovery_connectors`) because the
-- shape and review flow are different — these are sales leads we want
-- to outreach, with the AI judgment + reasoning preserved so JM can
-- spot-check why the classifier kept a row.

create type agency_influencer_status as enum (
  'pending',   -- just captured + classified yes, awaiting human review
  'qualified', -- JM approved for outreach
  'contacted', -- VIP invitation sent
  'replied',   -- they wrote back
  'rejected'   -- not a fit
);

create table if not exists agency_influencers (
  id                       uuid primary key default gen_random_uuid(),

  -- discovery context
  platform                 text not null check (platform in ('YouTube', 'X', 'manual')),
  source_url               text not null,
  handle                   text not null,
  name                     text,
  -- the channel/handle id as the platform reports it (YT channel id,
  -- X numeric id when available) — used as the dedup key together
  -- with platform so the same creator can't land twice.
  platform_handle_id       text not null,

  -- person + reach
  subscribers              integer,
  country                  text,
  description              text,

  -- contact channels — extracted by the n8n filter step from the
  -- channel description / linked bio. Email is the high-value one;
  -- the rest are kept for personalization at outreach time.
  email                    text,
  twitter_handle           text,
  instagram_handle         text,
  linkedin_url             text,
  tiktok_handle            text,
  website_url              text,

  -- Gemini classification. `score` is 0-1, `reason` is a one-line
  -- justification so JM (and future-Claude) can audit why this row
  -- made it through.
  is_agency_targeted       boolean not null default true,
  classification_score     numeric(3, 2) check (classification_score between 0 and 1),
  classification_reason    text,
  -- The audience tag Gemini settled on: 'marketing-agencies',
  -- 'saas-agencies', 'growth-agencies', 'consulting-agencies',
  -- 'mixed' (when several apply). Free-form intentionally — the
  -- classifier can introduce new tags without a schema change.
  target_audience          text,

  -- pipeline state
  status                   agency_influencer_status not null default 'pending',
  review_notes             text,
  reviewed_at              timestamptz,

  -- outreach state
  contacted_at             timestamptz,
  replied_at               timestamptz,

  -- timestamps
  discovered_at            timestamptz not null default now(),
  updated_at               timestamptz not null default now(),

  unique (platform, platform_handle_id)
);

-- Hot path: dashboard list ordered by discovered_at desc, filtered by
-- status. The composite covers both at once.
create index if not exists idx_agency_influencers_status_discovered
  on agency_influencers (status, discovered_at desc);

-- Looking up a candidate before re-scoring (skip work on dups).
create index if not exists idx_agency_influencers_handle
  on agency_influencers (platform, handle);

-- Optional follow-up filter — high-signal vs low-signal candidates.
create index if not exists idx_agency_influencers_score
  on agency_influencers (classification_score desc nulls last)
  where is_agency_targeted = true;
