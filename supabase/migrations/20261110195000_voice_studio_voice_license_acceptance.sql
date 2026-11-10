-- Verifiable acceptance, separate from CRM lead stage or Stripe payment.
create table public.voice_studio_voice_license_acceptances (
  email text not null check (email = lower(btrim(email)) and length(email) between 3 and 320),
  license_version text not null check (length(license_version) between 1 and 64),
  channel text not null check (length(channel) between 1 and 200),
  accepted_at timestamptz not null default now(),
  ip text check (length(ip) <= 64),
  user_agent text check (length(user_agent) <= 512),
  revoked_at timestamptz check (revoked_at >= accepted_at),
  primary key (email, license_version)
);

alter table public.voice_studio_voice_license_acceptances enable row level security;
revoke all on table public.voice_studio_voice_license_acceptances from public, anon, authenticated, service_role;
grant select, insert, update on table public.voice_studio_voice_license_acceptances to service_role;
