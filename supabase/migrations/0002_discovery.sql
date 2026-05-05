-- Discovery: connectors + skills surfaced by the n8n YT/X scraper.
-- Two tables (one per category) so the admin queue is naturally split
-- and we can iterate on schema independently.
--
-- The n8n workflow (see ~/projects/n8n exports) classifies each video/
-- tweet via Gemini and writes accepted items here. JM reviews via
-- /[lang]/admin/discovery — approving an item kicks off the curation
-- workflow (PR a markdown file for free items, outreach email for paid).

create type discovery_review_status as enum ('pending', 'approved', 'rejected', 'ignored');
create type discovery_pricing as enum ('free', 'paid', 'freemium', 'unknown');

create table discovery_connectors (
  id              uuid primary key default gen_random_uuid(),
  -- discovery metadata
  source_platform text   not null check (source_platform in ('youtube', 'x', 'manual')),
  source_url      text   not null,
  -- product details
  product_name    text   not null,
  product_slug    text   not null,
  repo_url        text,
  demo_url        text,
  pricing         discovery_pricing not null default 'unknown',
  price_amount_usd numeric(10, 2),
  -- creator details
  creator_handle  text,
  creator_email   text,
  creator_name    text,
  -- classification
  classification_confidence numeric(3, 2) check (classification_confidence between 0 and 1),
  gemini_summary  text,
  raw_title       text,
  raw_description text,
  -- review
  review_status   discovery_review_status not null default 'pending',
  review_notes    text,
  reviewed_by     uuid references auth.users(id),
  reviewed_at     timestamptz,
  -- timestamps
  discovered_at   timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  -- dedup: same repo can only land once. fall back to slug if no repo url.
  unique (repo_url),
  unique (product_slug)
);

create table discovery_skills (
  id              uuid primary key default gen_random_uuid(),
  source_platform text not null check (source_platform in ('youtube', 'x', 'manual')),
  source_url      text not null,
  product_name    text not null,
  product_slug    text not null,
  repo_url        text,
  demo_url        text,
  vendors         text[] not null default '{}',  -- ['claude', 'codex']
  pricing         discovery_pricing not null default 'unknown',
  price_amount_usd numeric(10, 2),
  creator_handle  text,
  creator_email   text,
  creator_name    text,
  classification_confidence numeric(3, 2) check (classification_confidence between 0 and 1),
  gemini_summary  text,
  raw_title       text,
  raw_description text,
  review_status   discovery_review_status not null default 'pending',
  review_notes    text,
  reviewed_by     uuid references auth.users(id),
  reviewed_at     timestamptz,
  discovered_at   timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (repo_url),
  unique (product_slug)
);

-- Indexes for the admin queue (filter by status + sort by discovered_at)
create index idx_discovery_connectors_status_discovered on discovery_connectors (review_status, discovered_at desc);
create index idx_discovery_skills_status_discovered    on discovery_skills    (review_status, discovered_at desc);

-- Confidence-sort for "show me high-signal items first"
create index idx_discovery_connectors_confidence on discovery_connectors (classification_confidence desc nulls last);
create index idx_discovery_skills_confidence    on discovery_skills    (classification_confidence desc nulls last);

-- updated_at auto-stamp
create or replace function bump_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger discovery_connectors_updated before update on discovery_connectors
  for each row execute function bump_updated_at();

create trigger discovery_skills_updated before update on discovery_skills
  for each row execute function bump_updated_at();

-- RLS: only service role (server) reads/writes. Admin UI uses the admin
-- API client server-side, so we don't need user-level policies here.
alter table discovery_connectors enable row level security;
alter table discovery_skills     enable row level security;
