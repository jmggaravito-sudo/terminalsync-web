-- The Outreach Queue feature (#96, #232, #236, #239) shipped code that
-- reads/writes an `op_*` operating-state on `agency_influencers` — plus
-- niche/track/source_keyword/profile_url used by the queue UI — but no
-- migration ever created these columns. GET /api/outreach/queue has been
-- selecting columns that don't exist, so Supabase returns a "column does
-- not exist" error and the endpoint 500s on every request. This migration
-- catches the schema up to what the app has assumed since #96.
--
-- op_status is intentionally text + check (not an enum like `status`)
-- because src/lib/outreach/types.ts already re-validates against
-- OP_STATUSES at the API boundary; a check constraint here is the
-- belt-and-suspenders the original PR description promised
-- ("además del CHECK constraint del handoff") but never added.

alter table agency_influencers
  add column if not exists niche          text,
  add column if not exists track          text,
  add column if not exists source_keyword text,
  add column if not exists profile_url    text,
  add column if not exists op_status         text not null default 'pendiente',
  add column if not exists op_hook           text,
  add column if not exists op_notes          text,
  add column if not exists op_last_message   text,
  add column if not exists op_contacted_at   timestamptz,
  add column if not exists op_responded_at   timestamptz,
  add column if not exists op_discarded_at   timestamptz;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'agency_influencers_op_status_check'
  ) then
    alter table agency_influencers
      add constraint agency_influencers_op_status_check
      check (op_status in ('pendiente', 'enviado', 'respondio', 'descartado'));
  end if;
end $$;

-- profile_url and source_url are the same "link to the creator" concept
-- (see 0018); backfill so existing rows don't lose their "open profile"
-- action in the queue UI just because the column is new.
update agency_influencers
  set profile_url = source_url
  where profile_url is null;

-- Hot path: GET /api/outreach/queue filters by op_status, orders by
-- subscribers desc.
create index if not exists idx_agency_influencers_op_status_subscribers
  on agency_influencers (op_status, subscribers desc nulls last);
