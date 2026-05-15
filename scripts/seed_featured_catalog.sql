-- ─── seed_featured_catalog.sql ────────────────────────────────────────
-- Run this ONCE after migration 0013_featured_catalog.sql has been
-- applied. Idempotent — re-running is a no-op.
--
-- Sets `is_featured = true` on the connector_listings rows that the
-- Bundle Curator AI is allowed to sample from. Target size: ~25–30
-- rows covering the 6 personas the curator writes for:
--   Founder, Vendedor, Marketer, Operations, Real Estate, Coach.
--
-- USAGE
--   psql "$DATABASE_URL" -f scripts/seed_featured_catalog.sql
--   # or, in Supabase SQL editor: paste this file and Run.
--
-- HOW IT FAILS GRACEFULLY
--   Each UPDATE is wrapped in `where exists (...)`, so if a slug
--   was never auto-promoted into connector_listings yet (e.g. a
--   missing Calendly MCP), that one row is silently skipped and
--   the rest of the script still runs. Gaps are listed at the
--   bottom for visibility.
--
-- HOW TO EXTEND
--   Add the new slug to the relevant pillar UPDATE below. Keep
--   pillars human-grouped so this file stays auditable.
-- ─────────────────────────────────────────────────────────────────────

begin;

-- ─── Productivity / docs ──────────────────────────────────────────────
update public.connector_listings
  set is_featured = true
  where slug in (
    'makenotion-notion-mcp',           -- Notion (official)
    'jerhadf-linear-mcp',              -- Linear issues / sprints
    'delorenj-mcp-trello',             -- Trello boards
    'henilcalagiya-google-sheets-mcp', -- Google Sheets (25 tools)
    'domdomegg-airtable-mcp-server',   -- Airtable
    'sbroenne-mcp-server-excel'        -- Excel (173 ops)
  );

-- ─── Email / inbox ────────────────────────────────────────────────────
update public.connector_listings
  set is_featured = true
  where slug in (
    'gongrzhe-gmail-mcp',              -- Gmail
    'softeria-ms-365-mcp-server'       -- Outlook + MS365
  );

-- ─── Comm / messaging ─────────────────────────────────────────────────
update public.connector_listings
  set is_featured = true
  where slug in (
    'korotovsky-slack-mcp-server',     -- Slack
    'lharries-whatsapp-mcp'            -- WhatsApp personal
  );

-- ─── CRM ──────────────────────────────────────────────────────────────
update public.connector_listings
  set is_featured = true
  where slug in (
    'salesforcecli-mcp',               -- Salesforce (official CLI)
    'lkm1developer-hubspot-mcp'        -- HubSpot CRM
  );

-- ─── Calendar / scheduling ────────────────────────────────────────────
update public.connector_listings
  set is_featured = true
  where slug in (
    'danielpeter-99-calcom-mcp'        -- Cal.com bookings
  );

-- ─── Web / content / scraping ─────────────────────────────────────────
update public.connector_listings
  set is_featured = true
  where slug in (
    'firecrawl-mcp-server',            -- Firecrawl web scrape
    'zcaceres-markdownify-mcp',        -- Anything → markdown
    'softvoyagers-ogforge-api',        -- OG image generation
    'narasimhaponnada-mermaid-mcp'     -- Mermaid diagrams
  );

-- ─── Dev tooling ──────────────────────────────────────────────────────
update public.connector_listings
  set is_featured = true
  where slug in (
    'ryan0204-github-repo-mcp',           -- GitHub repos / issues / PRs
    'javimaligno-postgres-mcp',           -- Postgres (14 tools)
    'supabase-community-supabase-mcp',    -- Supabase (official)
    'vercel-next-devtools-mcp',           -- Next.js / Vercel devtools
    'cloudflare-mcp-server-cloudflare',   -- Cloudflare Workers/KV/R2
    'playwright-mcp-server'               -- Playwright browser auto
  );

-- ─── Files / storage ──────────────────────────────────────────────────
update public.connector_listings
  set is_featured = true
  where slug in (
    'isaacphi-mcp-gdrive'              -- Google Drive read/write
  );

-- ─── Data exploration ─────────────────────────────────────────────────
update public.connector_listings
  set is_featured = true
  where slug in (
    'reading-plus-ai-mcp-server-data-exploration' -- CSV data exploration
  );

-- ─── Payments ─────────────────────────────────────────────────────────
update public.connector_listings
  set is_featured = true
  where slug in (
    'atharvagupta2003-mcp-stripe'      -- Stripe read + refunds
  );

commit;

-- ─── Verification ─────────────────────────────────────────────────────
-- Show the resulting featured set so the operator can eyeball it.
select slug, name, tagline
  from public.connector_listings
 where is_featured = true
 order by category, slug;

-- ─── Known gaps (slugs we wanted but the DB didn't have) ──────────────
-- At time of writing (2026-05-15), no auto-promoted connector existed
-- for these vendors. If/when they show up in connector_listings, add
-- them to the appropriate pillar above and re-run this file.
--
--   - Pipedrive (CRM)
--   - Calendly (calendar — only Cal.com made it in)
--   - Google Calendar (calendar)
--   - Dedicated Outlook MCP (only ms-365 omnibus is in)
--   - Discord (low ROI for the SMB personas we target, skipped on purpose)
--   - Stripe official (only third-party atharvagupta2003 is in)
-- ─────────────────────────────────────────────────────────────────────
