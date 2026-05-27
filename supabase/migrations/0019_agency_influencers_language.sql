-- Add language detection to agency_influencers so we can stratify
-- outreach copy (no email goes out in EN to a Brazilian creator's
-- inbox). Gemini detects this in the same classifier pass; we keep it
-- nullable for back-fill of the existing rows.
alter table agency_influencers
  add column if not exists language text;

-- Tight index for the outreach query: "give me agency-targeted rows in
-- language X, pending, scored above N".
create index if not exists idx_agency_influencers_lang_status
  on agency_influencers (language, status, classification_score desc nulls last)
  where is_agency_targeted = true;
