-- The "Corregir" loop (S3): admin submits how the support bot SHOULD have
-- answered a real conversation; POST /api/admin/soporte/corrections inserts
-- a row here (status 'pending') and opens a draft PR against
-- jmggaravito-sudo/terminal-sync teaching the bot the right answer, then
-- flips the row to 'pr_opened' (+ pr_url/pr_number) or 'error' (+
-- error_message) depending on how the GitHub round trip went.
--
-- `conversation_id` is a soft reference to `support_conversations.id` (S2's
-- table, built in a parallel PR against the same base branch) — no FK on
-- purpose, since these two migrations are independent and merge order isn't
-- guaranteed. question/bad_answer are snapshotted here at submission time
-- (not re-read from support_conversations later) so this row stays a
-- faithful audit record even if the source conversation is edited/purged.
--
-- This table itself holds real customer text (question/bad_answer) — it's
-- private Supabase data like support_conversations, NOT what ends up in the
-- GitHub PR. The PR only ever gets the scrubbed/rejected-if-secret version
-- built in src/lib/soporte/scrub.ts. See that file's doc comment for why
-- the two are different.

create table if not exists support_corrections (
  id                    uuid primary key default gen_random_uuid(),
  conversation_id       text,              -- soft ref to support_conversations.id, no FK (see above)

  question              text not null default '',
  bad_answer            text not null default '',
  corrected_answer_es   text not null,
  corrected_answer_en   text,
  locale                text,

  status                text not null default 'pending' check (status in ('pending', 'pr_opened', 'error')),
  branch                text,
  pr_url                text,
  pr_number             integer,
  error_message         text,

  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- Hot path: the /admin/soporte/correcciones queue reads the most recent 50.
create index if not exists idx_support_corrections_created
  on support_corrections (created_at desc);

create index if not exists idx_support_corrections_status
  on support_corrections (status);
