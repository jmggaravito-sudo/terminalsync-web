-- Add URL + source columns to connector_listings so the public detail
-- page can render a working CTA + link back to the upstream repo/demo.
--
-- Background: connector_listings was originally designed for first-party
-- curation where the CTA URL lived in markdown files. When the auto-
-- publish pipeline started promoting items from discovery_connectors
-- (5 May 2026, 458 rows), the source URL got dropped — only "Source: <url>"
-- inside setup_md survived. That broke every marketplace card on
-- /connectors. This migration restores the missing surface and lets the
-- auto-promote routine carry the URLs forward.
--
-- All columns nullable + idempotent so it can run cleanly on an existing
-- DB and re-run safely.

ALTER TABLE connector_listings
  ADD COLUMN IF NOT EXISTS cta_url    text,
  ADD COLUMN IF NOT EXISTS source_url text,
  ADD COLUMN IF NOT EXISTS repo_url   text,
  ADD COLUMN IF NOT EXISTS demo_url   text;

-- Reverse lookup so the auto-promote job can detect existing items by
-- repo_url and skip them.
CREATE INDEX IF NOT EXISTS idx_connector_listings_repo_url
  ON connector_listings (repo_url)
  WHERE repo_url IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_connector_listings_source_url
  ON connector_listings (source_url)
  WHERE source_url IS NOT NULL;
