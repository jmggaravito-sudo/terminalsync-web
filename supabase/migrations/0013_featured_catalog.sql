-- ─── 0013_featured_catalog ────────────────────────────────────────────
-- Adds an `is_featured` flag to connector_listings + cli_tool_listings.
--
-- WHY THIS EXISTS
-- ---------------
-- The Bundle Curator AI ("TSync · Bundle Curator", n8n workflow
-- KpqQvgr6H1C2O4Oa) used to sample from all 520 auto-promoted approved
-- connectors. Claude was being handed a wall of random scraped MCPs
-- and routinely invented bundles whose proposed_items couldn't actually
-- fulfill the promised functionality (e.g. promising "agendá reuniones"
-- with no calendar connector in the catalog).
--
-- The fix: a JM-curated subset of ~25–35 items that the curator AI
-- samples from instead. Featured items are vetted by hand for:
--   1. real, well-known vendor (Notion, Salesforce, GitHub…)
--   2. clean install path (no exotic auth, no half-broken forks)
--   3. covers a recognizable persona need (CRM, calendar, inbox, etc.)
--
-- Featured ≠ approved. `status = 'approved'` is "this passed promotion"
-- (auto-bot can flip it). `is_featured` is "I (JM) explicitly bless
-- this for the curator and home page surfaces."
--
-- The seed of which slugs to flip lives in
-- `scripts/seed_featured_catalog.sql` — run that after this migration.
-- ─────────────────────────────────────────────────────────────────────

alter table public.connector_listings
  add column if not exists is_featured boolean not null default false;

alter table public.cli_tool_listings
  add column if not exists is_featured boolean not null default false;

-- Partial indexes — featured set is tiny (~30 rows), the rest of the
-- table is 500+. A WHERE-filtered index keeps lookups cheap without
-- bloating the full index.
create index if not exists idx_connector_listings_featured
  on public.connector_listings (is_featured)
  where is_featured = true;

create index if not exists idx_cli_tool_listings_featured
  on public.cli_tool_listings (is_featured)
  where is_featured = true;

comment on column public.connector_listings.is_featured is
  'JM-curated subset the Bundle Curator AI samples from. NOT all auto-promoted items, to prevent Claude inventing items that do not deliver. See scripts/seed_featured_catalog.sql.';

comment on column public.cli_tool_listings.is_featured is
  'JM-curated subset the Bundle Curator AI samples from. NOT all auto-promoted items.';
