-- Stack Packs / Bundles — curated bundles of connectors that JM sells
-- as one-time-payment products separate from the Pro/Dev subscriptions.
--
-- Strategy: each bundle is a small set of high-utility connectors
-- pre-configured for a use case (Sales Stack, Operations Stack, etc).
-- Bundles are TerminalSync's first directly-monetizable offering — the
-- 458 auto-curated listings under "TerminalSync Curated" are all free,
-- so this is the first revenue stream that doesn't depend on third-party
-- publishers signing up.
--
-- Buyers don't subscribe — they pay once, get the connectors installed
-- via TerminalSync app, and become qualified leads for TS Pro upsell.
-- The webhook (charge.refunded handler in stripe webhook route) already
-- knows how to mark connector_installs as 'uninstalled' on refund;
-- we extend it to handle bundle_purchases the same way.

create type bundle_status as enum ('draft', 'active', 'archived');

create table bundles (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  name            text not null,
  -- One-line tagline shown on the /stacks index card. ~60 chars.
  tagline         text not null,
  -- Markdown body for the bundle detail page. Includes "what's included",
  -- "outcomes you get", "how it works", FAQ.
  description_md  text not null,
  -- One-line under the title on the detail page. ~140 chars.
  hero_subtitle   text,
  -- Hero image for the detail page (full-width banner). Optional;
  -- falls back to a gradient when null.
  hero_image_url  text,
  -- One-time price in cents. Ex: 1900 for $19.00 USD. We bill in USD
  -- like the rest of the app.
  price_cents     integer not null check (price_cents > 0),
  currency        text not null default 'usd',
  -- Status gate so we can stage drafts in the admin without showing
  -- them publicly.
  status          bundle_status not null default 'draft',
  -- Lazy-created Stripe Product + Price, mirroring the
  -- connector_listings pattern. ensureBundlePrice() in lib creates
  -- them on first publish and persists.
  stripe_product_id text,
  stripe_price_id   text,
  -- Display ordering on the /stacks page. Lower = shown first.
  sort_order      integer not null default 0,
  -- Counters maintained by the webhook (best-effort, not atomic).
  purchase_count  integer not null default 0,
  -- Timestamps
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_bundles_status_sort on bundles (status, sort_order)
  where status = 'active';

-- Many-to-many: which connector_listings are included in each bundle.
-- Listings stay independent products in the catalog — being in a bundle
-- doesn't lock them out of being installed individually.
create table bundle_listings (
  bundle_id    uuid not null references bundles(id) on delete cascade,
  listing_id   uuid not null references connector_listings(id) on delete cascade,
  -- Sort within the bundle's "What's included" section.
  sort_order   integer not null default 0,
  primary key (bundle_id, listing_id)
);

create index idx_bundle_listings_bundle on bundle_listings (bundle_id, sort_order);

-- One purchase row per (user, bundle) pair. We dedupe on insert so a
-- replay of the webhook doesn't grant the bundle twice. If the user
-- buys the same bundle again (e.g. after a refund), the existing row
-- gets updated to 'active' instead of inserting a duplicate.
create type bundle_purchase_status as enum ('active', 'refunded');

create table bundle_purchases (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  bundle_id         uuid not null references bundles(id) on delete cascade,
  stripe_charge_id  text,
  stripe_session_id text,
  amount_paid_cents integer not null,
  currency          text not null default 'usd',
  status            bundle_purchase_status not null default 'active',
  purchased_at      timestamptz not null default now(),
  refunded_at       timestamptz,
  unique (user_id, bundle_id)
);

create index idx_bundle_purchases_user on bundle_purchases (user_id, purchased_at desc);
create index idx_bundle_purchases_charge on bundle_purchases (stripe_charge_id)
  where stripe_charge_id is not null;

-- Auto-stamp updated_at on bundles updates, same pattern as the rest
-- of the marketplace tables.
create trigger bundles_updated before update on bundles
  for each row execute function bump_updated_at();

-- RLS: server-side only. Admin endpoints write via the service-role
-- client; the public read endpoint also goes through service-role and
-- filters by status='active'.
alter table bundles            enable row level security;
alter table bundle_listings    enable row level security;
alter table bundle_purchases   enable row level security;
