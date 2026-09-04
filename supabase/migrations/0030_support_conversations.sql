-- Support conversations: every turn (question + answer) the in-app support
-- bot has with a customer, written by the n8n "Sync-AI" workflow behind
-- /api/agent (see src/app/api/agent/route.ts) after each reply. This is the
-- raw material for the admin "Soporte" panel — real conversations, not just
-- the static FAQ knowledge base in src/lib/supportKnowledge.ts.
--
-- Column contract is fixed by the coordinator (S2/S3 split): the admin panel
-- (this train, S2) reads this table; a separate train (S3) adds
-- `support_corrections` on top of it for the "fix a bad answer → open a PR
-- against the knowledge base" flow. Do not rename/retype these columns
-- without checking both trains.
--
-- The CANONICAL DDL for this table lives in the terminal-sync repo at
-- `agent/n8n/support-conversations.sql` (alongside `support_corrections` and
-- the retention job) — this file must match it, since both run
-- `CREATE TABLE IF NOT EXISTS` against the same Supabase project and
-- whichever runs first fixes the shape. Change a column here → change it
-- there too.
--
-- `session_id` is a stable per-installation/browser thread id (not a DB id),
-- assigned client-side so turns from the same conversation group together
-- even though each turn is its own row. It is nullable on purpose (reserved
-- for a future session-less channel). `channel`/`reason` are deliberately
-- unconstrained by CHECK: this table is a fire-and-forget insert target for
-- n8n, and a row must never be lost because a new channel or reason value
-- doesn't match a CHECK written before it existed — value validation lives
-- in the TS layer instead (see `isSupportChannel/isSupportReason` in
-- src/lib/supportConversations/types.ts), which is where it's meant to be.

create table if not exists public.support_conversations (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),

  session_id      text,
  channel         text not null default 'app',
  locale          text,
  plan            text,

  question        text not null,
  answer          text not null,

  -- true when this turn handed off to a human (ticket/email/escalation
  -- webhook in n8n). `reason` is set independently of `escalated`: a turn
  -- can be reason='unknown' (the bot didn't know the answer) without being
  -- escalated, which is exactly the "gap" signal the admin panel filters on.
  escalated       boolean not null default false,
  reason          text,

  topic           text,
  prompt_version  text
);

-- Hot path: thread view reads all turns for one session_id in order.
create index if not exists idx_support_conversations_session
  on public.support_conversations (session_id, created_at);

-- Hot path: queue list orders/filters across all sessions by recency.
create index if not exists idx_support_conversations_created
  on public.support_conversations (created_at desc);

alter table public.support_conversations enable row level security;

-- No anon/authenticated policies on purpose — same pattern as
-- product_feedback (0026) and business_leads (0028). n8n writes with the
-- service-role key; the admin API routes read with the service-role key.
-- This keeps customer support transcripts private even if the table is
-- exposed through the Supabase Data API.

-- One row per session_id, aggregated for the queue list: last/first turn
-- timestamps, turn count, whether any turn escalated (and with which
-- reasons), whether any turn hit the "bot didn't know" gap, plus the most
-- recent turn's channel/locale/plan/topic (a session can span a plan
-- upgrade or a locale switch; the queue list shows where it stands now).
-- `search_blob` backs the server-side ilike search in the admin API without
-- a second round-trip per session — it is never selected back to the client.
-- Rows with session_id NULL drop out of `join last_turn using (session_id)`
-- below — intentional, not a bug: a session-less turn has no thread to
-- group into, so it has nothing to show in a queue grouped by session_id.
create or replace view public.support_conversation_sessions as
with agg as (
  select
    session_id,
    min(created_at) as first_turn_at,
    max(created_at) as last_turn_at,
    count(*) as turn_count,
    bool_or(escalated) as has_escalation,
    array_remove(array_agg(distinct reason) filter (where escalated), null) as escalation_reasons,
    bool_or(reason = 'unknown') as has_unknown_gap,
    string_agg(coalesce(question, '') || ' ' || coalesce(answer, ''), ' ' order by created_at) as search_blob
  from public.support_conversations
  group by session_id
),
last_turn as (
  select distinct on (session_id)
    session_id, channel, locale, plan, topic
  from public.support_conversations
  order by session_id, created_at desc
)
select
  agg.session_id,
  agg.first_turn_at,
  agg.last_turn_at,
  agg.turn_count,
  agg.has_escalation,
  agg.escalation_reasons,
  agg.has_unknown_gap,
  agg.search_blob,
  last_turn.channel,
  last_turn.locale,
  last_turn.plan,
  last_turn.topic
from agg
join last_turn using (session_id);
