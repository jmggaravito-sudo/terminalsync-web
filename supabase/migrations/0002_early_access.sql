-- Windows early access waitlist.
--
-- Captures emails from non-supported-platform visitors (today: Windows,
-- once we ship Linux this will swap to Windows-only) so we can blast
-- them when the signed installer is ready. JM can pull a CSV via:
--
--   select email, locale, ip_country, created_at
--   from public.early_access where platform = 'windows'
--   order by created_at;
--
-- and feed it to Resend Audiences for the launch email.

create table if not exists public.early_access (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  -- 'windows' | 'linux' | 'other' — drives which "we'll email when X
  -- is ready" template the user sees.
  platform text not null,
  locale text,
  -- Best-effort country from Vercel's x-vercel-ip-country header. Used
  -- to segment the launch email (US/EU vs LATAM cadence).
  ip_country text,
  -- Free-form referrer/source so we can attribute Meta Ads / organic.
  source text,
  notified_at timestamptz,
  created_at timestamptz not null default now()
);

-- Unique on (email, platform) so resubmits update created_at without
-- creating duplicates. Same email could legitimately sign up for both
-- Windows + Linux waitlists, hence not unique on email alone.
create unique index if not exists early_access_email_platform_idx
  on public.early_access (lower(email), platform);

create index if not exists early_access_platform_idx
  on public.early_access (platform, created_at desc);

-- RLS: nobody reads this table from the browser. Inserts go through the
-- service-role client in /api/early-access.
alter table public.early_access enable row level security;

-- (No policies = deny-all from anon/authenticated. Service role bypasses
-- RLS automatically.)
