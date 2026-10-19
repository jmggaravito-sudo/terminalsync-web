# Team production migration runbook (operator reference)

**Status:** Team remains feature-gated. This document is operational guidance only; this PR applies no migration and creates no Stripe objects or charges.

## Scope and expected state

The verified remote baseline is migrations **0037** and **0038** only for Team, plus the five public billing/compensation tables: `team_billing_subscriptions`, `team_billing_events`, `team_comp_entitlements`, `team_comp_consumptions`, and `team_comp_refunds`. Do not infer readiness from local files or a dashboard screenshot; capture the remote metadata-only baseline immediately before any proposed apply.

The reviewed source sequence is `0039` through `0056` in order, followed by `20261019192526_team_seat_ceiling_64.sql` (timestamped Team seat-cap migration). `0057` is outside this Team sequence. Confirm the checked-out commit and exact migration filenames before execution; stop on any version/name/content mismatch.

## Read-only preflight (metadata only)

Use an independently authorized operator session and read-only metadata queries to record (1) names of public tables and (2) migration-history version/name rows. Never query or export application/user rows, billing records, emails, aliases, content, tokens, or payloads. Do not place credentials or connection strings in this document, shell history, logs, or PR. Compare the result against the expected baseline above and the exact source sequence. Any extra/missing object, unexpected migration, or unknown history is an abort pending investigation.

## Data preconditions to verify before approval

Review each migration's guards and expected transformations before scheduling:

- **0041:** aliases must already be normalized and unique; its guard rejects invalid/duplicate aliases.
- **0043:** request lifecycle fields must be consistent; non-pending rows need `responded_at`, while pending rows must not have it.
- **0054:** legacy conversation metadata and space display names are normalized/sanitized; review the exact update scope and resulting constraints.
- **0055:** legacy request metadata is reduced to the allowed count-only shape and space names are sanitized; review affected-row counts and ensure no unexpected data-loss or constraint conflict.

Do not inspect user data to “make it pass.” If constraints/guards fail or expected changes are unclear, stop and request a separately reviewed remediation plan.

## Decision and authorization gates — mandatory before any apply

1. Attach the metadata-only preflight evidence, source commit/hash, ordered migration list, planned window, operator, rollback/abort plan, and precondition assessment to a change record.
2. Obtain explicit written approval from the designated production owner and database operator for this exact migration set and target. Approval to investigate, review, or prepare is not approval to apply.
3. Confirm a current backup/recovery plan and that the feature-gate remains closed throughout migration and verification.
4. Re-run metadata-only preflight immediately before the window. Any drift invalidates approval; stop and re-approve. Apply only through the separately authorized production procedure, never from this PR or an unreviewed local shell.

## Abort and rollback

Abort before execution for baseline/source mismatch, failed data preconditions, missing approval, unavailable recovery path, unexpected table/migration, or any request to widen scope. During execution, stop on first SQL error, unexpected row/constraint effects, timeout/lock impact outside the approved plan, or loss of observability. Do not blindly retry or skip a migration. Because this sequence includes forward-only sanitization/hardening, do not promise transactional rollback or reverse SQL; use the pre-approved database recovery procedure and preserve evidence. Keep Team feature-gated until an owner explicitly accepts the post-apply evidence.

## Post-apply boundary

After an independently authorized apply, verify only migration-history rows, expected table/constraint/function metadata, and approved service health checks that do not access user content or create billing activity. Any application smoke must use a separately approved non-production/test identity and must not create Stripe objects, charges, subscriptions, or user data. Do not enable the Team feature gate as part of this runbook. Report apply status, exact versions, metadata checks, exceptions, and remaining gates separately. This PR performs none of these production actions.
