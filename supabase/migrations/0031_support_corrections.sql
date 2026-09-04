-- The "Corregir" loop (S3): admin submits how the support bot SHOULD have
-- answered a real conversation; POST /api/admin/soporte/corrections inserts
-- a row here (status 'pending') and opens a draft PR against
-- jmggaravito-sudo/terminal-sync teaching the bot the right answer, then
-- flips the row to 'pr_opened' (+ branch/pr_url/pr_number) or 'error' (+
-- error_message) depending on how the GitHub round trip went.
--
-- El contrato canónico vive en terminal-sync agent/n8n/support-conversations.sql;
-- el coordinador lo está alineando a estas columnas — si se cambia una
-- columna hay que cambiar los DOS archivos. Esta tabla es el superset: trae
-- además `updated_at`, `locale`, `branch` y `pr_number` (auditoría/UX del
-- panel admin) que el contrato mínimo de terminal-sync no necesita.
--
-- `conversation_id` es una FK real a `support_conversations.id` (tabla de
-- S2, migración 0030 en este mismo directorio — corre antes que esta) con
-- ON DELETE SET NULL: support_conversations tiene retención de 90 días, así
-- que cuando la conversación original expira la corrección sobrevive con
-- conversation_id en NULL en vez de romperse — es historial de decisiones,
-- no se borra nunca.
--
-- This table itself holds real customer text (question/bad_answer) — it's
-- private Supabase data like support_conversations, NOT what ends up in the
-- GitHub PR. The PR only ever gets the scrubbed/rejected-if-secret version
-- built in src/lib/soporte/scrub.ts. See that file's doc comment for why
-- the two are different.

create table if not exists public.support_corrections (
  id                    uuid primary key default gen_random_uuid(),
  conversation_id       uuid references public.support_conversations(id) on delete set null,

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
  on public.support_corrections (created_at desc);

create index if not exists idx_support_corrections_status
  on public.support_corrections (status);

create index if not exists idx_support_corrections_conversation
  on public.support_corrections (conversation_id);

alter table public.support_corrections enable row level security;
-- No public policies — with RLS on and no policy, only the service-role
-- key (used by /api/admin/soporte/corrections via getSupabaseAdmin()) can
-- read or write this table; service-role bypasses RLS by Supabase design.
-- Same criterion as support_conversations (see 0030_support_conversations.sql).
