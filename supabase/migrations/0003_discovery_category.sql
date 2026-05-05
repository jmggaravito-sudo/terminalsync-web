-- Auto-suggested marketplace category from the Gemini classifier.
-- Admin can override before approving. Same enum names as
-- connector_listings.category and the file-based skills frontmatter
-- so a one-click approval lands the item in the right section.

alter table discovery_connectors add column marketplace_category text
  check (marketplace_category in ('productivity', 'database', 'automation', 'storage', 'messaging', 'dev'));

alter table discovery_skills add column marketplace_category text
  check (marketplace_category in ('marketing', 'dev', 'productivity', 'research', 'design', 'finance'));
