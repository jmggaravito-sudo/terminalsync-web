-- Bundle Curator — proposal-based bundle creation flow.
--
-- Until now bundles were authored by hand in the admin editor. This was
-- the bottleneck: JM had to write the name, tagline, description, setup
-- guide, and pick the items. None of those are things he wants to spend
-- weekly time on.
--
-- New flow:
--   n8n + Claude propose bundles weekly (persona-driven, mixed pillars,
--   plain Spanish/English copy, sample prompts included) → land in this
--   table as `pending` → JM reviews + clicks Publish → row is promoted
--   into a real `bundles` + `bundle_listings` set and `status` flips to
--   `approved`.
--
-- We keep proposals in a separate staging table (not the `bundles` table
-- with an extra status) for two reasons:
--   1. The audit trail of rejections + reviewer notes lives separately
--      from the real-product table.
--   2. Slug uniqueness only matters on approval — we want Claude to be
--      able to propose competing slugs ("sales-stack" vs "sales-stack-v2")
--      and let the reviewer pick one without insert collisions.
--
-- Migration is fully idempotent (`if not exists` everywhere) so re-runs
-- are safe during local dev.

-- ─── A. bundle_proposals staging table ────────────────────────────────
create table if not exists bundle_proposals (
  id                  uuid primary key default gen_random_uuid(),
  -- Persona this bundle targets — short kebab-case for grouping in the
  -- queue UI. Free-form on insert so Claude can introduce new personas
  -- without a schema change; the reviewer can re-categorize later.
  persona             text not null,
  -- Human-readable label for the persona. "Vendedor que vive en CRM e
  -- inbox", "Founder no-tech", etc.
  persona_label       text not null,
  -- Concrete pain point the bundle solves. "Pierdo deals porque no
  -- respondo a tiempo".
  pain_point          text not null,
  -- Proposed bundle fields — same shape as the `bundles` table so
  -- approval is a straight copy. Slug uniqueness is NOT enforced here
  -- (only on approval) so Claude can re-propose with the same slug
  -- after a rejection without insert errors.
  name                text not null,
  slug                text not null,
  tagline             text not null,
  description_md      text not null,
  setup_md            text not null,
  -- 3 sample prompts the user can paste into their AI chat to feel the
  -- value immediately. Stored as an array of strings; rendered on the
  -- public detail page above "what's included".
  sample_prompts      text[] not null default '{}',
  -- The proposed items — array of {kind, slug, sort_order, why_it_helps}.
  -- Stored as JSON so we can roundtrip Claude's structured output
  -- without normalizing to a child table that nobody else queries.
  proposed_items      jsonb not null,
  -- Pricing (overridable at approval time via PATCH if needed). Defaults
  -- match the existing $19 Stack Pack price.
  price_cents         integer not null default 1900,
  currency            text not null default 'usd',
  -- Lifecycle.
  status              text not null default 'pending'
                       check (status in ('pending', 'approved', 'rejected', 'superseded')),
  -- When approved, points back at the resulting bundles row so we can
  -- jump from the audit log to the live product.
  published_bundle_id uuid references bundles(id) on delete set null,
  -- Audit: who proposed (claude vs human curator) + reviewer notes.
  proposed_by         text not null default 'claude',
  reviewer_notes      text,
  reviewed_at         timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Queue index: the admin page reads pending proposals newest-first.
create index if not exists idx_bundle_proposals_status_created
  on bundle_proposals (status, created_at desc);

-- updated_at auto-stamp. The function from 0002 is idempotent
-- (create or replace) so it's safe to leave the trigger create here.
do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'bundle_proposals_updated'
  ) then
    create trigger bundle_proposals_updated
      before update on bundle_proposals
      for each row execute function bump_updated_at();
  end if;
end $$;

-- RLS: server-only access via the service role. Same pattern as the
-- discovery_* staging tables — no user-level policies needed because
-- the admin pages call the API server-side with the admin key, not
-- the Supabase client SDK as a logged-in user.
alter table bundle_proposals enable row level security;

-- ─── B. Add sample_prompts to the live bundles table ──────────────────
-- Proposed prompts persist when approval creates the real bundle so the
-- public detail page can render them above "what's included".
alter table bundles
  add column if not exists sample_prompts text[] not null default '{}';
