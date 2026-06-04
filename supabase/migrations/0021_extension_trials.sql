-- Extension v0.2: hosted 7-day trial.
--
-- The Chrome extension's popup needs an identity that survives across
-- restarts but is NOT a Google login (would force a manifest scope we
-- don't want during Web Store review). We mint a UUID v4 client-side
-- the first time the extension boots and persist it in
-- chrome.storage.local under `ts:userId`. That UUID is the primary key
-- of this table.
--
-- Each row tracks one extension install's trial lifecycle:
--   - 7 days from `trial_started_at` they get hosted access (we pay the
--     API). Default daily cap 50 prompts to bound the blast radius if
--     someone clones a UUID.
--   - After day 7, the chat endpoint returns 402 trial_expired. The
--     extension switches to BYOK and asks for the user's 3 keys.
--   - If the user later upgrades to Pro via Stripe + links via the
--     6-digit code flow (see /api/extension/link), we flip
--     `upgraded_to_pro` and `linked_supabase_user_id` so subsequent
--     hosted calls go through without checking the trial cap.
--
-- Soft-fingerprint columns (ip_first_seen + ua_first_seen) guard against
-- the obvious incognito-reset abuse: the chat endpoint checks them
-- before creating a fresh trial for the same browser+IP pair. We do NOT
-- index by these columns (privacy footprint) — we look them up by user
-- id and read the fields off the row.

create table if not exists extension_trials (
  user_id uuid primary key,
  trial_started_at timestamptz not null default now(),
  prompts_today int not null default 0,
  prompts_today_reset_at timestamptz not null default date_trunc('day', now()),
  upgraded_to_pro boolean not null default false,
  linked_supabase_user_id uuid,
  ip_first_seen inet,
  ua_first_seen text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Background sweepers and admin queries need cheap lookups by
-- trial_started_at (e.g. "find every trial that expired in the last
-- 24h to send a 'switch to BYOK' email" — feature not built yet but
-- this is the index it would use).
create index if not exists extension_trials_trial_started_at_idx
  on extension_trials (trial_started_at);

-- Reverse lookup: when a Stripe webhook fires and we already know
-- supabase_user_id, we may want to find the extension UUID(s) the
-- user already linked. There can be more than one if a user reinstalls
-- the extension on a second browser, so this is NOT unique.
create index if not exists extension_trials_linked_supabase_user_id_idx
  on extension_trials (linked_supabase_user_id)
  where linked_supabase_user_id is not null;

-- IP-based abuse guard (see /api/extension/chat: we cap new trials per
-- IP per hour). Cheaper to scan against an index than seqscan when
-- traffic ramps.
create index if not exists extension_trials_ip_created_idx
  on extension_trials (ip_first_seen, created_at)
  where ip_first_seen is not null;

-- Standard updated_at trigger pattern used by the rest of the schema.
-- If the project already has a shared trigger function we'd reuse it,
-- but each migration declares its own to stay self-contained.
create or replace function extension_trials_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_extension_trials_touch on extension_trials;
create trigger trg_extension_trials_touch
  before update on extension_trials
  for each row execute function extension_trials_touch_updated_at();

-- RLS: nobody touches this table from the browser. Only the service
-- role (our Edge functions) reads/writes. Lock it down.
alter table extension_trials enable row level security;

-- Defensive: no policies = nothing is allowed for non-service roles.
-- We don't add a "deny all" policy because absence of any permissive
-- policy already denies. Service role bypasses RLS by design.

comment on table extension_trials is
  'One row per Chrome extension install. Tracks the 7-day hosted trial counter and the eventual Pro upgrade link. Service-role-only; never queried from the browser.';

-- ────────────────────────────────────────────────────────────────────
-- Pro ↔ extension linking codes
-- ────────────────────────────────────────────────────────────────────
--
-- After a successful Stripe checkout, the success page mints a 6-digit
-- one-shot code and stores it here keyed by the Supabase auth.users.id
-- of the paying customer. The user opens the extension popup, pastes
-- the code into Options → "Already paid Pro", and the extension calls
-- /api/extension/link with { code, userId }. The endpoint atomically:
--   1. Looks up the code, asserts it isn't consumed and isn't expired
--   2. Flips extension_trials.upgraded_to_pro = true for that userId
--   3. Stores extension_trials.linked_supabase_user_id = <looked-up id>
--   4. Marks the code consumed
--
-- We bound the code's lifetime to 24h. If the user takes longer they
-- can hit the billing portal to re-issue (route TBD; for now a manual
-- DB tweak by JM is the fallback).

create table if not exists extension_link_codes (
  code text primary key,                       -- "123456" zero-padded
  supabase_user_id uuid not null,              -- who paid
  consumed_at timestamptz,                     -- null until claimed
  consumed_by_extension_user_id uuid,          -- extension UUID that claimed
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours')
);

create index if not exists extension_link_codes_supabase_user_id_idx
  on extension_link_codes (supabase_user_id);

create index if not exists extension_link_codes_unconsumed_idx
  on extension_link_codes (consumed_at)
  where consumed_at is null;

alter table extension_link_codes enable row level security;

comment on table extension_link_codes is
  '6-digit one-shot codes that bind an extension UUID to a paying Supabase user after Stripe checkout. Expire after 24h. Service-role-only.';
