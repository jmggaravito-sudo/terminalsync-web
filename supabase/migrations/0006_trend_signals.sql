-- Trend signals: free-tier replacement for the Exploding Topics API.
-- Daily n8n workflows (one per source) pull "what's hot right now"
-- from public APIs, classify with Gemini, and dump rows here. JM reviews
-- via /[lang]/admin/trends — items appearing in 2+ sources get a
-- "cross-source" badge so the radar surfaces real momentum, not just
-- a single subreddit blip.
--
-- Sources covered (all free, no auth or anon-keyed):
--   - github      → trending repos via GitHub Search API
--   - product_hunt→ daily top posts via PH GraphQL (anon)
--   - hackernews  → top stories via Firebase API
--   - reddit      → top posts of {programming, ML, ClaudeAI, LocalLLaMA, SaaS}
--   - youtube     → recent videos for AI/dev keywords via YouTube Data API
--
-- Type taxonomy is intentionally loose at insert-time; Gemini fills
-- `signal_type` ('product', 'tool', 'topic', 'creator', 'meta') so we
-- can filter the dashboard without forcing each source to mint its own
-- enum. Keep it as text + check constraint for the same reason.

create type trend_review_status as enum ('pending', 'kept', 'archived', 'promoted');

create table trend_signals (
  id              uuid primary key default gen_random_uuid(),

  -- where it came from
  source          text not null check (source in (
    'github', 'product_hunt', 'hackernews', 'reddit', 'youtube', 'manual'
  )),
  source_url      text not null,
  source_id       text,                          -- e.g. HN story id, PH post id
  source_subtype  text,                          -- subreddit name, repo language, video channel

  -- the thing itself
  title           text not null,
  summary         text,                          -- raw description / readme blurb
  raw_payload     jsonb,                         -- full source response, kept for debug

  -- normalized score the source already exposes (HN points, PH votes,
  -- Reddit upvotes, GH stars-this-week, YT view count). Stored as a
  -- single number so the dashboard can sort cross-source — different
  -- sources scale differently, but within-source ranking is correct.
  score           numeric(12, 0) default 0,
  score_velocity  numeric(12, 2),                -- delta vs previous capture, when known

  -- Gemini classification
  signal_type     text check (signal_type in (
    'product', 'tool', 'topic', 'creator', 'meta', 'unknown'
  )) default 'unknown',
  signal_confidence numeric(3, 2) check (signal_confidence between 0 and 1),
  gemini_summary  text,
  tags            text[] default '{}',

  -- review state
  review_status   trend_review_status not null default 'pending',
  review_notes    text,
  reviewed_by     uuid references auth.users(id),
  reviewed_at     timestamptz,

  -- timestamps
  captured_at     timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  -- dedup: same canonical url shouldn't land twice in the same day.
  -- The hash lets us key off (source, normalized_url) cheaply without
  -- relying on the URL being byte-identical (utm params, trailing /).
  dedup_hash      text not null,

  unique (source, dedup_hash)
);

-- Hot paths:
-- 1. Dashboard list: order by captured_at desc, filter by source/status
-- 2. Cross-source promotion: find titles that appear in 2+ sources today
-- 3. Velocity charts: time-series per source

create index trend_signals_captured_idx
  on trend_signals (captured_at desc);

create index trend_signals_source_status_idx
  on trend_signals (source, review_status, captured_at desc);

create index trend_signals_signal_type_idx
  on trend_signals (signal_type, captured_at desc);

-- For the cross-source detector. We lowercase + trim the title server-side
-- before insert; the index lets the dashboard run a fast group-by.
create index trend_signals_title_lower_idx
  on trend_signals (lower(title));

-- A view the dashboard can query directly: "things that appeared in 2+
-- sources in the last 7 days". Avoids forcing every page render to do
-- the cross-join in JS.
create or replace view trend_cross_source_signals as
  select
    lower(title)                                  as title_normalized,
    array_agg(distinct source order by source)    as sources,
    count(distinct source)                        as source_count,
    sum(score)                                    as total_score,
    max(captured_at)                              as last_seen_at,
    min(captured_at)                              as first_seen_at,
    array_agg(distinct id)                        as signal_ids
  from trend_signals
  where captured_at > now() - interval '7 days'
  group by lower(title)
  having count(distinct source) >= 2
  order by source_count desc, total_score desc;

-- updated_at trigger — same pattern as marketplace tables
create or replace function set_trend_signals_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trend_signals_updated_at
  before update on trend_signals
  for each row execute function set_trend_signals_updated_at();

-- RLS: service-role only. Dashboard reads via the admin API route that
-- already uses the service-role client (same pattern as discovery).
alter table trend_signals enable row level security;

-- No policies → no row is visible to anon/authenticated. Service-role
-- bypasses RLS as usual.
