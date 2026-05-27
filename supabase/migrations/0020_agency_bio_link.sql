-- Bio links (Linktree, bio.link, beacons.ai, linkin.bio, stan.store,
-- carrd.co, about.me, etc.) are higher-value DM channels than a random
-- website — the creator already pre-curated all their contact channels
-- there. Surface as its own column so the dashboard can render a
-- dedicated 🔗 chip and outreach can prioritize creators with one.
alter table agency_influencers
  add column if not exists bio_link_url text;
