-- New per-minute quote intake, independent of legacy voice-clone consent and prepaid plans.
create table public.voice_studio_service_acceptances (
  account_id uuid not null,
  agreement_version text not null check (agreement_version ~ '^[a-zA-Z0-9][a-zA-Z0-9._-]{0,63}$'),
  agreement_url text not null check (length(agreement_url) between 9 and 2048 and agreement_url like 'https://%'),
  accepted_at timestamptz not null default now(),
  primary key (account_id, agreement_version)
);

create table public.voice_studio_quote_requests (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null,
  email text not null check (length(email) between 3 and 320 and email = lower(btrim(email))),
  request_id uuid not null,
  request_fingerprint text not null check (request_fingerprint ~ '^[0-9a-f]{64}$'),
  agreement_version text not null,
  rights_confirmed boolean not null check (rights_confirmed),
  items jsonb not null check (case when jsonb_typeof(items) = 'array' then jsonb_array_length(items) between 1 and 10 else false end),
  estimated_cents integer not null check (estimated_cents > 0),
  status text not null default 'submitted' check (status in ('submitted', 'reviewed', 'declined')),
  created_at timestamptz not null default now(),
  unique (account_id, request_id),
  foreign key (account_id, agreement_version)
    references public.voice_studio_service_acceptances (account_id, agreement_version)
);

create index voice_studio_quote_requests_queue on public.voice_studio_quote_requests (status, created_at desc, id);
create index voice_studio_quote_requests_agreement on public.voice_studio_quote_requests (account_id, agreement_version);

alter table public.voice_studio_service_acceptances enable row level security;
alter table public.voice_studio_quote_requests enable row level security;
revoke all on public.voice_studio_service_acceptances, public.voice_studio_quote_requests from public, anon, authenticated, service_role;
grant select, insert on public.voice_studio_service_acceptances, public.voice_studio_quote_requests to service_role;
grant update (status) on public.voice_studio_quote_requests to service_role;
