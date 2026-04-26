-- Marketplace v1 — publishers, listings, installs, payouts.
--
-- Decisions baked in:
--   • Take-rate: 10%, with 0% waiver for the first 50 approved publishers
--     during their first 6 months (enforced in src/lib/marketplace/pricing.ts).
--   • Pricing: one-time only in MVP (no monthly).
--   • Stripe Connect: Express accounts, payouts via transfer_data.destination.
--   • Moderation: manual review with status='pending' → 'approved' | 'rejected'.

-- ─── publishers ───────────────────────────────────────────────────────
create table if not exists public.publishers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text not null,
  slug text not null unique,
  bio text,
  website text,
  -- Stripe Connect Express account id. Null until the publisher completes
  -- onboarding. Once set, payout_enabled tracks whether Stripe has cleared
  -- the account for live transfers.
  stripe_account_id text unique,
  payout_enabled boolean not null default false,
  -- Counts toward the "first 50 publishers" 0% take-rate waiver. Set to
  -- now() the first time a listing is approved; null until then.
  approved_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists publishers_user_id_idx on public.publishers(user_id);

-- ─── connector_listings ───────────────────────────────────────────────
create type listing_status as enum ('draft', 'pending', 'approved', 'rejected');
create type listing_pricing as enum ('free', 'one_time');
create type listing_category as enum (
  'productivity', 'database', 'automation',
  'storage', 'messaging', 'dev'
);

create table if not exists public.connector_listings (
  id uuid primary key default gen_random_uuid(),
  publisher_id uuid not null references public.publishers(id) on delete cascade,
  slug text not null unique,
  name text not null,
  tagline text not null,
  category listing_category not null,
  logo_url text not null,
  screenshots text[] not null default '{}',
  description_md text not null,
  setup_md text not null,
  status listing_status not null default 'draft',
  pricing_type listing_pricing not null default 'free',
  -- Cents in USD (stripe minor unit). Null when pricing_type='free'.
  -- MVP range enforced at the app layer: $5–$29 (500–2900 cents).
  price_cents integer,
  currency text not null default 'usd',
  -- Stripe Product/Price IDs created lazily on first approval. Reused on
  -- subsequent installs. Null until Stripe is touched.
  stripe_product_id text,
  stripe_price_id text,
  install_count integer not null default 0,
  rating_avg numeric(2,1),
  rating_count integer not null default 0,
  review_notes text,  -- internal admin notes (rejection reason, etc.)
  approved_at timestamptz,
  rejected_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint listing_price_when_paid check (
    (pricing_type = 'free' and price_cents is null)
    or (pricing_type = 'one_time' and price_cents between 500 and 2900)
  )
);

create index if not exists listings_status_idx on public.connector_listings(status);
create index if not exists listings_publisher_idx on public.connector_listings(publisher_id);

-- ─── connector_versions ───────────────────────────────────────────────
-- Manifests are versioned so installs can pin a known-good version and
-- publishers can roll forward without breaking old installs.
create table if not exists public.connector_versions (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.connector_listings(id) on delete cascade,
  version text not null,  -- semver: "1.0.0"
  manifest_json jsonb not null,  -- MCP server config (validated app-side)
  changelog_md text,
  checksum text not null,  -- sha256 of canonical manifest_json
  created_at timestamptz not null default now(),
  unique (listing_id, version)
);

create index if not exists versions_listing_idx on public.connector_versions(listing_id);

-- ─── connector_installs ───────────────────────────────────────────────
-- One row per user × listing. Re-installs UPSERT and bump version_id.
-- For paid listings, install is created on charge.succeeded webhook; for
-- free listings, on POST /api/marketplace/install.
create type install_status as enum ('active', 'uninstalled', 'pending_payment');

create table if not exists public.connector_installs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  listing_id uuid not null references public.connector_listings(id) on delete cascade,
  version_id uuid references public.connector_versions(id) on delete set null,
  status install_status not null default 'active',
  -- Stripe charge id for paid installs (null for free). Used for refunds.
  stripe_charge_id text,
  amount_paid_cents integer,
  installed_at timestamptz not null default now(),
  last_used_at timestamptz,
  uninstalled_at timestamptz,
  unique (user_id, listing_id)
);

create index if not exists installs_user_idx on public.connector_installs(user_id);
create index if not exists installs_listing_idx on public.connector_installs(listing_id);

-- ─── marketplace_payouts ──────────────────────────────────────────────
-- One row per Stripe transfer to a publisher. Populated by the
-- transfer.created webhook; used for publisher revenue dashboard.
create table if not exists public.marketplace_payouts (
  id uuid primary key default gen_random_uuid(),
  publisher_id uuid not null references public.publishers(id) on delete cascade,
  install_id uuid references public.connector_installs(id) on delete set null,
  gross_cents integer not null,        -- what the buyer paid
  ts_take_cents integer not null,      -- TerminalSync's cut (10% or 0% during waiver)
  publisher_cents integer not null,    -- what the publisher receives (gross - take - stripe fees)
  stripe_charge_id text,
  stripe_transfer_id text unique,
  status text not null default 'pending',  -- pending | paid | failed | refunded
  created_at timestamptz not null default now()
);

create index if not exists payouts_publisher_idx on public.marketplace_payouts(publisher_id);

-- ─── listing_reviews ──────────────────────────────────────────────────
-- User-facing reviews on a listing. One review per (listing, user).
create table if not exists public.listing_reviews (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.connector_listings(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  body text,
  created_at timestamptz not null default now(),
  unique (listing_id, user_id)
);

create index if not exists reviews_listing_idx on public.listing_reviews(listing_id);

-- ─── RLS ──────────────────────────────────────────────────────────────
alter table public.publishers enable row level security;
alter table public.connector_listings enable row level security;
alter table public.connector_versions enable row level security;
alter table public.connector_installs enable row level security;
alter table public.marketplace_payouts enable row level security;
alter table public.listing_reviews enable row level security;

-- publishers: a user can read/upsert their own row.
create policy publishers_self_read on public.publishers
  for select using (auth.uid() = user_id);
create policy publishers_self_write on public.publishers
  for insert with check (auth.uid() = user_id);
create policy publishers_self_update on public.publishers
  for update using (auth.uid() = user_id);

-- listings: anyone can read approved listings; publishers see/edit their own
-- drafts and pending; admins (service_role) bypass RLS entirely.
create policy listings_public_read_approved on public.connector_listings
  for select using (status = 'approved');
create policy listings_owner_read on public.connector_listings
  for select using (
    publisher_id in (select id from public.publishers where user_id = auth.uid())
  );
create policy listings_owner_write on public.connector_listings
  for insert with check (
    publisher_id in (select id from public.publishers where user_id = auth.uid())
  );
create policy listings_owner_update on public.connector_listings
  for update using (
    publisher_id in (select id from public.publishers where user_id = auth.uid())
    -- Never let publishers self-approve. Status transitions to 'approved' or
    -- 'rejected' must go through the service_role admin endpoint.
    and status in ('draft', 'pending')
  );

-- versions: same visibility as parent listing.
create policy versions_public_read on public.connector_versions
  for select using (
    listing_id in (select id from public.connector_listings where status = 'approved')
  );
create policy versions_owner_read on public.connector_versions
  for select using (
    listing_id in (
      select l.id from public.connector_listings l
      join public.publishers p on p.id = l.publisher_id
      where p.user_id = auth.uid()
    )
  );
create policy versions_owner_write on public.connector_versions
  for insert with check (
    listing_id in (
      select l.id from public.connector_listings l
      join public.publishers p on p.id = l.publisher_id
      where p.user_id = auth.uid()
    )
  );

-- installs: users see only their own rows.
create policy installs_self_read on public.connector_installs
  for select using (auth.uid() = user_id);
create policy installs_self_insert on public.connector_installs
  for insert with check (auth.uid() = user_id);
create policy installs_self_update on public.connector_installs
  for update using (auth.uid() = user_id);

-- payouts: publishers read their own; everyone else blind.
create policy payouts_publisher_read on public.marketplace_payouts
  for select using (
    publisher_id in (select id from public.publishers where user_id = auth.uid())
  );

-- reviews: anyone can read reviews on approved listings; users CRUD their own.
create policy reviews_public_read on public.listing_reviews
  for select using (
    listing_id in (select id from public.connector_listings where status = 'approved')
  );
create policy reviews_self_write on public.listing_reviews
  for insert with check (auth.uid() = user_id);
create policy reviews_self_update on public.listing_reviews
  for update using (auth.uid() = user_id);
create policy reviews_self_delete on public.listing_reviews
  for delete using (auth.uid() = user_id);

-- ─── triggers ─────────────────────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists listings_touch_updated on public.connector_listings;
create trigger listings_touch_updated
  before update on public.connector_listings
  for each row execute function public.touch_updated_at();
