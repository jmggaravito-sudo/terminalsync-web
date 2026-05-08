-- Add 'education' to the trend_signals.signal_type check constraint.
-- Educational institutions (universities, bootcamps, online courses)
-- teaching Claude Code / AI tools surface from YouTube searches and
-- need their own classification so the dashboard can filter on
-- "education" alone — that's the bucket JM wants for partnership
-- outreach.

alter table trend_signals
  drop constraint if exists trend_signals_signal_type_check;

alter table trend_signals
  add constraint trend_signals_signal_type_check
  check (signal_type in (
    'product', 'tool', 'topic', 'creator', 'meta', 'education', 'unknown'
  ));
