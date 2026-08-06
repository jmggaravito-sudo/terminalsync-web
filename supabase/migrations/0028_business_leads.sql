-- Business leads: local businesses (dental clinics, real estate agencies,
-- schools, NGOs, service businesses) scraped from Google Maps by the n8n
-- "TS - Business Leads (Google Maps)" workflow, one search at a time
-- ("clínicas dentales en Montevideo"), triggered on-demand via the
-- prospector-empresas Claude Code skill or manually from the admin queue.
--
-- Separate from `agency_influencers` on purpose: influencers are a content
-- partnership pipeline (find a creator, get featured to their audience);
-- this is direct outbound to the business itself as a paying customer.
-- Different shape (no platform/subscribers, yes phone/address/rating),
-- different channel (WhatsApp first, not DM), different pipeline states.

create type business_lead_status as enum (
  'nuevo',       -- just captured, nobody looked at it yet
  'contactado',  -- outreach sent (WhatsApp/email)
  'agendado',    -- booked a call/demo
  'cliente',     -- converted
  'descartado'   -- not a fit / bad number / duplicate business
);

create table if not exists business_leads (
  id                uuid primary key default gen_random_uuid(),

  -- discovery context
  source            text not null default 'google_maps' check (source in ('google_maps', 'manual')),
  source_keyword    text,        -- search term used, e.g. "clínica dental"
  niche             text,        -- our sector taxonomy: salud, educacion, ongs, negocios_locales, gestion_empresarial
  city              text,
  country            text,

  -- business identity — place_id is Google's stable id, used for dedup so
  -- re-running the same search doesn't create duplicate rows.
  place_id          text,
  name              text not null,
  category          text,        -- Google Maps category as returned (e.g. "Dental clinic")
  address           text,
  phone             text,        -- as scraped, human-readable
  phone_e164        text,        -- normalized (+598...) for the wa.me link
  website_url       text,
  google_maps_url   text,
  rating            numeric(2, 1),
  reviews_count     integer,
  email             text,        -- rarely present from Maps; kept for manual enrichment

  -- pipeline state
  status            business_lead_status not null default 'nuevo',
  notes             text,
  contacted_at      timestamptz,

  -- timestamps
  discovered_at     timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  unique (source, place_id)
);

-- Hot path: dashboard list ordered by discovered_at desc, filtered by status.
create index if not exists idx_business_leads_status_discovered
  on business_leads (status, discovered_at desc);

-- Filtering by sector/city in the queue UI.
create index if not exists idx_business_leads_niche_city
  on business_leads (niche, city);
