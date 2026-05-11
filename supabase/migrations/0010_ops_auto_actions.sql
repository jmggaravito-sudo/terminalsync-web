-- Track what the daily ops-error-review cron did about each failure.
--
-- Two kinds of rows:
--   kind = 'retry'    → the cron called POST /executions/{id}/retry on n8n
--                       because Claude classified the error as transient.
--                       result_status records what happened.
--   kind = 'proposal' → Claude read the workflow JSON and proposed a patch.
--                       proposed_patch holds the FULL replacement workflow
--                       body (so we can PUT it back when JM clicks Apply).
--                       original_snapshot holds the workflow as it was when
--                       the proposal was made, for rollback.
--
-- This table is admin-only data — RLS off, only the service-role key
-- writes/reads it from the cron + dashboard endpoints.

CREATE TABLE IF NOT EXISTS ops_auto_actions (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  kind             text        NOT NULL CHECK (kind IN ('retry', 'proposal')),

  workflow_id      text        NOT NULL,
  workflow_name    text,
  execution_id     text,
  failed_node      text,
  raw_error        text,

  classification   text,                -- transient | logic_bug | auth | upstream | unknown
  confidence       numeric(3, 2),       -- 0.00–1.00
  reasoning        text,                -- Claude's one-paragraph why

  -- Retry-only
  retry_execution_id  text,             -- n8n id of the retry attempt
  retry_status        text,             -- success | error | running | unknown

  -- Proposal-only — full workflow body, NOT a diff. Lets the apply step
  -- be a single PUT. original_snapshot supports rollback after a bad
  -- apply.
  proposed_patch      jsonb,
  original_snapshot   jsonb,
  proposal_summary    text,             -- 1-line Claude summary of what changed

  -- Lifecycle
  status              text        NOT NULL DEFAULT 'pending'
                         CHECK (status IN ('pending', 'applied', 'dismissed', 'failed')),
  applied_at          timestamptz,
  applied_by          text,
  apply_error         text,

  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ops_auto_actions_status
  ON ops_auto_actions (status, kind, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ops_auto_actions_workflow
  ON ops_auto_actions (workflow_id, created_at DESC);

-- Idempotency: never write two retry rows for the same execution. The
-- cron may scan an error twice (across days the row still appears in
-- the last-24h window). Unique-when-set on retry's execution_id keeps
-- it sane while letting proposals share workflow_id with retries.
CREATE UNIQUE INDEX IF NOT EXISTS uniq_ops_auto_actions_retry_per_exec
  ON ops_auto_actions (execution_id)
  WHERE kind = 'retry';

-- Touch updated_at on edits — keeps the dashboard sort stable.
CREATE OR REPLACE FUNCTION ops_auto_actions_touch_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ops_auto_actions_touch_updated_at ON ops_auto_actions;
CREATE TRIGGER ops_auto_actions_touch_updated_at
  BEFORE UPDATE ON ops_auto_actions
  FOR EACH ROW EXECUTE FUNCTION ops_auto_actions_touch_updated_at();
