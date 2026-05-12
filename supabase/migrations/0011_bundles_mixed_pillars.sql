-- Stack Packs / Bundles — mixed-pillar support.
--
-- Until now `bundle_listings` had a hard FK to `connector_listings(id)`,
-- which meant a Stack Pack could only contain connectors. JM wants to
-- bundle items from the 3 catalog pillars in a single pack:
--   1) Connectors — DB rows in `connector_listings` (slug unique).
--   2) Skills     — markdown only at `content/skills/<lang>/<slug>.md`
--                   (no DB table — we keep it that way intentionally).
--   3) CLI Tools  — DB rows in `cli_tool_listings` + markdown at
--                   `content/cli-tools/<lang>/<slug>.md`.
--
-- Because skills have no DB row, a UUID-keyed pivot doesn't work without
-- a much bigger migration to move skills into the database. Instead we
-- switch `bundle_listings` to a polymorphic shape keyed by (kind, slug):
--
--   kind       text  -- 'connector' | 'skill' | 'cli'
--   item_slug  text  -- slug within that kind's namespace
--
-- Soft validation lives in the API layer: when an item is added we look
-- up the row/file and reject obvious misses (warning, not error — the
-- public detail page silently skips items that don't resolve at render
-- time, so a deleted skill markdown never 500s a public page).
--
-- Migration is idempotent. If it errors halfway through the column
-- additions you can re-run it and only the missing steps execute.

-- ─── 1. Add the polymorphic columns with safe defaults ────────────────
alter table bundle_listings
  add column if not exists kind text default 'connector',
  add column if not exists item_slug text;

-- ─── 2. Backfill item_slug from the existing FK target ────────────────
-- Only do this for rows that still have the legacy listing_id column.
-- The column may already be gone if a previous run got this far.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'bundle_listings'
      and column_name = 'listing_id'
  ) then
    update bundle_listings bl
    set    item_slug = cl.slug,
           kind = coalesce(bl.kind, 'connector')
    from   connector_listings cl
    where  cl.id = bl.listing_id
      and  bl.item_slug is null;
  end if;
end $$;

-- ─── 3. Enforce shape: kind not-null + checked, item_slug not-null ────
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where table_schema = 'public'
      and table_name = 'bundle_listings'
      and constraint_name = 'bundle_listings_kind_check'
  ) then
    alter table bundle_listings
      add constraint bundle_listings_kind_check
      check (kind in ('connector', 'skill', 'cli'));
  end if;
end $$;

alter table bundle_listings alter column kind drop default;
alter table bundle_listings alter column kind set not null;

-- Only flip item_slug to NOT NULL if no nulls remain (defensive — a
-- broken backfill row would block the whole migration otherwise).
do $$
begin
  if not exists (select 1 from bundle_listings where item_slug is null) then
    alter table bundle_listings alter column item_slug set not null;
  end if;
end $$;

-- ─── 4. Drop the old listing_id FK + column ───────────────────────────
do $$
declare
  fk_name text;
begin
  select tc.constraint_name into fk_name
  from   information_schema.table_constraints tc
  where  tc.table_schema = 'public'
    and  tc.table_name = 'bundle_listings'
    and  tc.constraint_type = 'FOREIGN KEY'
    and  tc.constraint_name like 'bundle_listings_listing_id%';

  if fk_name is not null then
    execute format('alter table bundle_listings drop constraint %I', fk_name);
  end if;
end $$;

-- ─── 5. Swap the primary key from (bundle_id, listing_id) to
--        (bundle_id, kind, item_slug) ────────────────────────────────
do $$
declare
  pk_name text;
begin
  select tc.constraint_name into pk_name
  from   information_schema.table_constraints tc
  where  tc.table_schema = 'public'
    and  tc.table_name = 'bundle_listings'
    and  tc.constraint_type = 'PRIMARY KEY';

  if pk_name is not null then
    execute format('alter table bundle_listings drop constraint %I', pk_name);
  end if;
end $$;

alter table bundle_listings
  drop column if exists listing_id;

do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where table_schema = 'public'
      and table_name = 'bundle_listings'
      and constraint_type = 'PRIMARY KEY'
  ) then
    alter table bundle_listings
      add primary key (bundle_id, kind, item_slug);
  end if;
end $$;

-- ─── 6. Refresh the sort-order index to match the new shape ───────────
drop index if exists idx_bundle_listings_bundle;
create index if not exists idx_bundle_listings_bundle
  on bundle_listings (bundle_id, sort_order);
