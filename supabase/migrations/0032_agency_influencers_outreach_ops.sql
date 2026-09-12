-- GET /api/outreach/queue selects `profile_url` from agency_influencers,
-- but that column never existed — confirmed against the live project via
-- the Supabase MCP (project zwyeqqxiwiogmtqwfnby): every other op_* /
-- niche / track / source_keyword column the route reads was already
-- present (added directly against the DB at some point, outside any
-- committed migration — op_status even already has its
-- `op_status_check` CHECK constraint). `profile_url` alone was missing,
-- and reproducing the queue's exact SELECT against prod confirmed it:
-- "ERROR: 42703: column \"profile_url\" does not exist". That's the 500.
--
-- This migration adds only the missing column, backfills it from
-- source_url (same "link to the creator" concept per 0018's schema —
-- keeps the queue UI's "Open profile" button working for existing rows),
-- and adds the (op_status, subscribers) index the queue's
-- filter+sort already assumes, which didn't exist either.

alter table agency_influencers
  add column if not exists profile_url text;

update agency_influencers
  set profile_url = source_url
  where profile_url is null;

create index if not exists idx_agency_influencers_op_status_subscribers
  on agency_influencers (op_status, subscribers desc nulls last);
