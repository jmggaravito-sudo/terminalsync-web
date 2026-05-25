-- 2026-05-25 — Hide all auto-promoted connectors from the public catalog.
--
-- Context: 525 rows in connector_listings (521 approved + 4 other-status)
-- were promoted by the daily cron from discovery_connectors with
-- publisher_id = terminalsync-curated. None has been sold. None has its
-- original author or license recorded. We hide them (not delete) until
-- each item gets a proper attribution + license backfill, which a future
-- migration will tackle.
--
-- Companion changes shipped with this migration:
--   - vercel.json no longer schedules /api/cron/promote-connectors.
--   - The route file returns 410 Gone defensively in case anyone calls
--     it by hand.
--   - listMarketplaceConnectors / getMarketplaceConnector filter on
--     hidden_at IS NULL so the catalog page sees zero marketplace items
--     until we re-curate them.
--
-- Reversible: clearing hidden_at on a row brings it back into the catalog.

BEGIN;

-- 1. Add the hide flag (idempotent).
ALTER TABLE public.connector_listings
  ADD COLUMN IF NOT EXISTS hidden_at timestamptz;

-- Partial index so the public catalog query stays cheap once the
-- table grows back. Only the visible rows get indexed.
CREATE INDEX IF NOT EXISTS idx_connector_listings_visible
  ON public.connector_listings (status, install_count DESC)
  WHERE hidden_at IS NULL;

-- 2. Hide every row created by the auto-promote pipeline.
--    Identifier: publisher_id of the synthetic "terminalsync-curated"
--    publisher. Today that covers 100% of the table (525 rows). The
--    UPDATE is idempotent (WHERE hidden_at IS NULL skips already-hidden
--    rows on re-run).
UPDATE public.connector_listings
   SET hidden_at = now()
 WHERE hidden_at IS NULL
   AND publisher_id = (
     SELECT id FROM public.publishers WHERE slug = 'terminalsync-curated'
   );

COMMIT;
