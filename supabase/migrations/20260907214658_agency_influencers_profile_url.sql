alter table agency_influencers
  add column if not exists profile_url text;

update agency_influencers
  set profile_url = source_url
  where profile_url is null;

create index if not exists idx_agency_influencers_op_status_subscribers
  on agency_influencers (op_status, subscribers desc nulls last);
