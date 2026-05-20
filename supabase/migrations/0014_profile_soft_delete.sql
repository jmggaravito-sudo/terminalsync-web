-- 0013 — Soft-delete columns for self-service account deletion.
--
-- The "Eliminar cuenta" flow in the desktop app sets `deleted_at` (and an
-- optional `deletion_reason`) instead of immediately purging the auth row.
-- A scheduled job purges rows where `deleted_at < now() - interval '30 days'`,
-- giving the user a grace window to undo by signing back in.
--
-- When `deleted_at` is non-null, the app treats the account as terminated
-- for product purposes but Stripe / Supabase Auth rows still exist so undo
-- is a single UPDATE.

alter table public.profiles
  add column if not exists deleted_at timestamptz,
  add column if not exists deletion_reason text;

create index if not exists profiles_deleted_at_idx
  on public.profiles (deleted_at)
  where deleted_at is not null;
