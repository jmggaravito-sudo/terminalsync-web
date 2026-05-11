-- Discovery + listing tables for CLI Tools — the third pillar of the
-- marketplace alongside Connectors (MCP) and Skills.
--
-- Today the n8n discovery workflow only emits type=connectors|skills.
-- This migration adds the storage layer so we can extend that classifier
-- to emit type=cli without further schema work. CLI rows differ from
-- connectors in two important ways:
--   1) They have a real shell binary (gh, supabase, vercel…) which is
--      globally unique — there's only one canonical `gh` for everyone.
--   2) They have an install command (brew install gh, npm i -g …) which
--      acts as a quality signal: if we can't tell people how to install
--      it, it shouldn't auto-promote.
--
-- We mirror the discovery_connectors / connector_listings shape so the
-- existing auto-promote machinery has minimal surface to learn.

-- ─── enum: cli_listing_category ───────────────────────────────────────
-- listing_category from 0001 uses connector-flavored buckets
-- (messaging, storage, automation…) which don't fit CLI tools. CLIs
-- live in a different space: dev tooling, deploy, db, payments, infra,
-- productivity. Dedicated enum keeps the marketplace filters honest.
do $$
begin
  if not exists (select 1 from pg_type where typname = 'cli_listing_category') then
    create type cli_listing_category as enum (
      'dev', 'deploy', 'database', 'payments', 'infra', 'productivity'
    );
  end if;
end $$;

-- ─── discovery_cli_tools ──────────────────────────────────────────────
-- Mirror of discovery_connectors with the CLI-specific signals tacked on.
create table if not exists discovery_cli_tools (
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
  marketplace_category text
    check (marketplace_category in ('dev', 'deploy', 'database', 'payments', 'infra', 'productivity')),
  -- CLI-specific signals
  binary          text,
  install_command text,
  auth_command    text,
  vendor          text,
  homepage        text,
  -- review
  review_status   discovery_review_status not null default 'pending',
  review_notes    text,
  reviewed_by     uuid references auth.users(id),
  reviewed_at     timestamptz,
  -- timestamps
  discovered_at   timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  -- dedup: binary is the strongest identity ("there's only one `gh`"),
  -- fall back to slug, then repo_url like the connectors table.
  unique (repo_url),
  unique (product_slug)
);

-- Admin queue index (filter by status, sort by recency)
create index if not exists idx_discovery_cli_tools_status_discovered
  on discovery_cli_tools (review_status, discovered_at desc);

-- High-signal-first sort
create index if not exists idx_discovery_cli_tools_confidence
  on discovery_cli_tools (classification_confidence desc nulls last);

-- Lookup-by-binary for the auto-promote dedup check
create index if not exists idx_discovery_cli_tools_binary
  on discovery_cli_tools (binary) where binary is not null;

-- updated_at trigger reuses the function defined in 0002_discovery.sql
create trigger discovery_cli_tools_updated before update on discovery_cli_tools
  for each row execute function bump_updated_at();

-- Service-role only, like the other discovery tables.
alter table discovery_cli_tools enable row level security;

-- ─── cli_tool_listings ────────────────────────────────────────────────
-- Public catalog table. Sister of connector_listings, but the CTA is an
-- install command rather than a manifest. Versioning + reviews not
-- needed in MVP — CLIs are installed by their own package manager.
create table if not exists public.cli_tool_listings (
  id uuid primary key default gen_random_uuid(),
  publisher_id uuid not null references public.publishers(id) on delete cascade,
  slug text not null unique,
  name text not null,
  tagline text not null,
  category cli_listing_category not null,
  logo_url text not null,
  screenshots text[] not null default '{}',
  description_md text not null,
  setup_md text not null,
  status listing_status not null default 'draft',
  pricing_type listing_pricing not null default 'free',
  price_cents integer,
  currency text not null default 'usd',
  stripe_product_id text,
  stripe_price_id text,
  install_count integer not null default 0,
  rating_avg numeric(2,1),
  rating_count integer not null default 0,
  review_notes text,
  approved_at timestamptz,
  rejected_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- CLI-specific surface that the public detail page actually renders
  binary text not null,
  install_command text not null,
  auth_command text,
  vendor text,
  homepage text,
  repo_url text,
  cta_url text,
  source_url text,
  constraint cli_listing_price_when_paid check (
    (pricing_type = 'free' and price_cents is null)
    or (pricing_type = 'one_time' and price_cents between 500 and 2900)
  ),
  -- Binaries are globally unique ("there's only one `gh`"). Enforced so
  -- the auto-promote job can't ship two cards that fight for the same
  -- shell command.
  unique (binary)
);

create index if not exists cli_listings_status_idx
  on public.cli_tool_listings (status);
create index if not exists cli_listings_publisher_idx
  on public.cli_tool_listings (publisher_id);
create index if not exists cli_listings_binary_idx
  on public.cli_tool_listings (binary);
create index if not exists cli_listings_repo_url_idx
  on public.cli_tool_listings (repo_url) where repo_url is not null;

-- updated_at trigger reuses touch_updated_at() from 0001_marketplace.sql
drop trigger if exists cli_listings_touch_updated on public.cli_tool_listings;
create trigger cli_listings_touch_updated
  before update on public.cli_tool_listings
  for each row execute function public.touch_updated_at();

-- ─── RLS ──────────────────────────────────────────────────────────────
-- Mirror connector_listings policies: anyone reads approved rows;
-- publishers see + edit their own drafts/pending; admins use service_role.
alter table public.cli_tool_listings enable row level security;

create policy cli_listings_public_read_approved on public.cli_tool_listings
  for select using (status = 'approved');

create policy cli_listings_owner_read on public.cli_tool_listings
  for select using (
    publisher_id in (select id from public.publishers where user_id = auth.uid())
  );

create policy cli_listings_owner_write on public.cli_tool_listings
  for insert with check (
    publisher_id in (select id from public.publishers where user_id = auth.uid())
  );

create policy cli_listings_owner_update on public.cli_tool_listings
  for update using (
    publisher_id in (select id from public.publishers where user_id = auth.uid())
    -- Publishers can't self-approve. Status flips to approved/rejected
    -- only via service_role through the admin endpoint.
    and status in ('draft', 'pending')
  );
