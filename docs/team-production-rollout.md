# Team production schema rollout (operator runbook)

**Status: blocked / not applied.** This document is a controlled plan, not an
authorization to change production. The last read-only Supabase Management API
migration-history check for project `zwyeqqxiwiogmtqwfnby` (2026-10-18) showed
`0037_team_comp_entitlements` and `0038_team_stripe_billing` present; migrations
`0039`–`0055` absent. That snapshot predates `0056` and `0057` and is historical,
not a current production claim. Re-check immediately before any rollout; history
may have changed. No migration execution or schema mutation was performed for
this runbook.

## Scope and migration set

This rollout is for no-card Team trial and shared-space, invitation, approval,
and conversation behavior. The base migration chain stays metadata-only;
optional `0056` adds only reviewed text delivery after approval. It does not
enable paid Team checkout or create Stripe objects. Pro/Max remain unchanged.

Apply missing migrations individually, in dependency order, after reviewing the
SQL and confirming the expected preconditions/effects:

1. Core: `0039 → 0040 → 0041 → 0042 → 0043`.
2. Current v2 UI projections: `0047 → 0048`.
3. Approval-first conversation hardening: `0053 → 0054 → 0055`.
4. Optional post-approval **text-only** delivery: `0056`, after step 3 and
   after reviewing the private-store RPCs. The source PR adds a purge endpoint
   but intentionally no Vercel schedule: configure the hourly schedule only
   as a later explicit rollout step after `CRON_SECRET` and Vercel hourly-cron
   capability are verified. This adds a separate send path for the accepted
   turn's recipient/approver in either direction; it does not change the
   metadata-only turn projection or enable files/AI generation.

`0044_team_trial_on_signup.sql` is **optional** and only needed if newly
created accounts should receive the same 168-hour, no-card trial automatically.
Existing accounts retain the explicit authenticated trial-claim flow from
`0040`. Decide separately whether automatic signup granting is wanted before
including `0044`; it is not required for those existing accounts. **Applying
`0044` starts the 168-hour clock at account creation immediately**, regardless
of `TEAM_FEATURE_ENABLED`. If the Team page/API is still unavailable, new
accounts can consume the trial while unable to use it. Therefore do not apply
`0044` early during schema staging: complete the read-only preflights and
restorability checks first, then apply it only inside the approved Team
availability window when the remaining approved migrations and gate activation
can proceed promptly. If that window slips or a check blocks progress, stop
before `0044`; do not let signups consume trials while the feature is
unavailable. Existing accounts' manual claim remains available only after the
Team gate is enabled.

Do **not** include paid-roster or paid-checkout migrations in this rollout:
`0045`, `0046`, `0052`, and `0049`–`0051`. `0037`/`0038` are already recorded as
present in the last check, but verify before rollout and do not replay them.

`0057_team_seat_ceiling_64.sql` is a separate, forward-only capacity-hardening
migration, not a prerequisite for the no-card trial. It constrains existing
Team billing and checkout-intent rows to 1–64 seats without changing their
values. It requires both `public.team_billing_subscriptions` (from `0038`) and
`public.team_checkout_intents` (from `0049`); this runbook's trial-only scope
deliberately excludes `0049`, so **do not apply `0057` in that narrow rollout**.
If a separately approved Team schema rollout includes `0049`, apply `0057` only
after its prerequisites and all earlier migrations selected for that rollout
have been applied and verified, in repository migration order. For the
contiguous Team chain, that means applying it after `0056`; do not jump from
`0049` directly to `0057` while omitting intervening migrations. `0057` does not
enable the Team gate or paid checkout. Its migration itself aborts before adding
constraints if stored billing or intent quantities are outside 1–64; it does
not silently repair, delete, or rewrite rows.

## Hard safety gates

- Obtain explicit production change approval and schedule a change window;
  this runbook or JM's prior approval of code/PRs is not database approval.
- Before beginning **any** production migration in this sequence, take a fresh
  backup and verify that it is restorable. Record the backup identifier and
  restore-check evidence in the change record; do not place backup data in this
  repository. Several migrations mutate existing rows: `0043` backfills
  `responded_at`, `0054` normalizes existing conversation-turn metadata, and
  `0055` sanitizes legacy shared-space names and approval/request metadata.
  Review those data effects and confirm the verified backup remains available
  before applying them.
- For any approved rollout that includes `0057`, the backup/restorability check
  and explicit production-change approval are mandatory even though the
  migration only adds constraints. First verify its prerequisites exist, then
  run the following **read-only preflight** against the intended database.
  This query is documentation only; this change did not execute it remotely.
  A missing relation is a stop condition, not permission to skip prerequisites.

  ```sql
  SELECT to_regclass('public.team_billing_subscriptions') AS billing_table,
         to_regclass('public.team_checkout_intents') AS intents_table;

  -- Run only after both relation checks above are non-NULL.
  SELECT 'team_billing_subscriptions' AS table_name,
         count(*) FILTER (WHERE seat_count IS NULL OR seat_count NOT BETWEEN 1 AND 64) AS violating_rows
    FROM public.team_billing_subscriptions
  UNION ALL
  SELECT 'team_checkout_intents' AS table_name,
         count(*) FILTER (WHERE seats IS NULL OR seats NOT BETWEEN 1 AND 64) AS violating_rows
    FROM public.team_checkout_intents;
  ```

  Both `violating_rows` counts must be zero before applying `0057`. Review the
  migration-history order immediately beforehand as well. If a count is
  nonzero, stop: do not edit/delete data or bypass the migration preflight under
  this runbook. Reconcile separately with explicit authorization and a fresh
  recoverable backup, then rerun the read-only check.
- Re-read remote migration history and inspect the live schema against each
  migration's preconditions. Apply only the specifically reviewed missing SQL,
  one migration at a time, using the approved Supabase change procedure. Verify
  resulting schema/RPC behavior after each migration before proceeding.
- Never run `supabase db push --include-all`, and never replay the migration
  directory blindly. This repository has duplicate historic numeric prefixes
  (`0010`, `0026`, `0033`), so broad ordering/replay is unsafe.
- Stop on any unexpected migration-history row, schema drift, failed statement,
  or failed post-migration check. Do not mark a migration applied manually to
  bypass verification. Do not echo credentials or secrets into commands/logs.
- Keep `TEAM_FEATURE_ENABLED` unset/off (`0`) throughout migration and smoke.
  Do not enable paid Team checkout, run payment tests, or alter Pro/Max.

## Authenticated two-account smoke (before enabling the feature)

Use two controlled test accounts, **A (space owner)** and **B (invitee)**. Keep
the gate off for migration. In a controlled test environment where the current
migration set is installed, verify these cases with authenticated sessions:

| Case | Action | Required result |
|---|---|---|
| Trial | A claims trial; repeat claim | First claim grants one 168-hour Team entitlement, no card; repeat does not grant a second entitlement. Pro/Max base plan is unchanged. |
| Capacity | A attempts to add another owner/seat during trial | Trial remains limited to one owner seat; no paid roster or checkout is created. |
| Invitation | A invites B; B views and accepts | B sees the received space separately, labeled as the owner's space (for example, “Espacio de A”); it is not listed among B's owned spaces. |
| Owner-to-member request | A requests context/document information from B | Only bounded request metadata is visible before B's decision; no document, context, path, URL, or payload is transferred. |
| Member-to-owner request | B initiates the reverse-direction request | Same metadata-only behavior; both parties can initiate, subject to the same approval rule. |
| Approval/decline | Recipient approves, then separately test decline | Approval alone transfers nothing. After applying `0056` in a controlled test environment, the accepted turn's recipient/approver must separately submit exact reviewed text to its initiator, in either direction; decline creates no delivery. |
| Text delivery | Accepted turn recipient/approver sends reviewed text back to initiator in either direction; initiator reads it | Delivery receipt contains no payload; only the bound recipient can read. Text is bounded to 64 KiB; at 7 days, read is denied and plaintext plus digest are erased on recipient read or purge invocation. The metadata row and payload-free audit (delivery ID, event, actor ID/null, timestamp) remain; this slice schedules no cron, so configure hourly cleanup only after verifying `CRON_SECRET` and Vercel capability. Unsent accepted turns cannot be sent after 24 hours. |
| Revocation | A revokes the invitation/relationship and both accounts retry relevant views/actions | Access/request actions and delivery reads fail closed; stale relationship cannot be used to communicate. |

Capture sanitized request/status evidence, never tokens or document contents.
Do not use real employee/customer context during this smoke. These checks do
not test billing or payment.

## Activation gate (separate from migration)

Only after the approved schema rollout is verified **and** every applicable
two-account smoke case passes, an operator may deliberately set the server-only
Vercel environment variable `TEAM_FEATURE_ENABLED=1` for the intended
environment. Then redeploy through the normal reviewed deployment process and
repeat the authenticated smoke against that deployed build. Keep it off if any
check fails. Enabling this availability flag does not enable paid checkout or
certify billing. Record separately: migration/schema evidence, source PR/merge,
deployment status, and authenticated smoke result.
