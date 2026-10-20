# Team production schema rollout (operator runbook)

**Status: source history recovered / production not applied.** This document is
a controlled plan, not an authorization to change production. On 2026-10-20 a
read-only Supabase Management API check for project `zwyeqqxiwiogmtqwfnby`
confirmed the current migration-history rows and recovered the original SQL for
the ten timestamped rows that were previously remote-only. Their exact local
source files and offline SHA-256 guard are tracked in
`supabase/migration-history/production-history-manifest.json`; the separately
reviewable `npm run verify:supabase-history-remote` command must recheck those
responses via GET immediately before rollout. This is source recovery, not a
`repair`, replay, or remote mutation. The current history still
has `0037_team_comp_entitlements` and `0038_team_stripe_billing`, while Team
migrations `0039`–`0058` are not recorded. Re-check immediately before any
rollout; history and schema may have changed. No Team migration execution,
feature-flag activation, Team comp grant, or schema mutation was performed by
this source recovery.

## Scope and migration set

This rollout is for no-card Team trial and shared-space, invitation, approval,
and conversation behavior. The current API/UI uses the v4 conversation RPCs
from `0058_team_owner_approved_text_delivery.sql` and the delivery table/RPCs
from `0056_team_text_deliveries.sql`; consequently **both are mandatory** for
an authenticated Team conversation smoke. `0058` makes the source-space owner
the only permitted sender for that source relationship. Neither migration
enables paid Team checkout or creates Stripe objects. Pro/Max remain unchanged.

Apply missing migrations individually, in dependency order, after reviewing the
SQL and confirming the expected preconditions/effects:

1. Core and automatic trial: `0039 → 0040 → 0041 → 0042 → 0043 → 0044`.
2. Current v2 UI projections: `0047 → 0048`.
3. Approval and text delivery: `0053 → 0054 → 0055 → 0056 → 0058`.

`0058` preserves two-way metadata conversation but allows a plaintext leg only
when the owner of that exact source space accepts a member-originated turn and
then sends to that member. It does not erase legacy rows; public read/list deny
old reverse-direction rows that fail this source-owner rule. The source PR adds
a purge endpoint but intentionally no Vercel schedule: automatic physical
cleanup cannot be claimed until a later explicit deployment configures the
hourly schedule after `CRON_SECRET` and Vercel hourly-cron capability are
verified. This slice does not enable files/AI generation.

## Read-only shared-space compatibility preflight (before `0041 → 0042`)

After confirming that `0039` is recorded and its tables exist, run this
**read-only** preflight against the intended database before applying `0041` or
`0042`. This query is documentation only; this change did not execute it
remotely. A missing relation is a stop condition, not permission to skip a
prerequisite.

```sql
SELECT to_regclass('public.team_aliases') AS aliases_table,
       to_regclass('public.team_space_invitations') AS invitations_table;

-- Run the remaining checks only after both relation checks above are non-NULL.
-- Each query below must return zero rows.
SELECT user_id, alias
  FROM public.team_aliases
 WHERE alias <> lower(btrim(alias))
    OR alias !~ '^[a-z0-9][a-z0-9._-]{1,28}[a-z0-9]$'
    OR alias LIKE '%..%'
 ORDER BY user_id;

SELECT alias, count(*) AS duplicate_rows
  FROM public.team_aliases
 GROUP BY alias
HAVING count(*) > 1
 ORDER BY alias;

-- Mirror 0042's partial unique index. NULL invitees do not collide in that
-- PostgreSQL unique index, so they are intentionally excluded here.
SELECT space_id, invitee_user_id, count(*) AS duplicate_pending_rows
  FROM public.team_space_invitations
 WHERE status = 'pending'
   AND invitee_user_id IS NOT NULL
 GROUP BY space_id, invitee_user_id
HAVING count(*) > 1
 ORDER BY space_id, invitee_user_id;
```

If either relation is missing or any check returns a row, **STOP** before
`0041`/`0042`: do not edit, delete, merge, or otherwise repair live data as
part of this rollout. Reconcile the drift only under separate explicit
authorization with a fresh recoverable backup, then rerun this read-only
preflight. These checks surface the exact blockers that `0041` (alias
constraint/index) and `0042` (one-pending-invitation index) would otherwise
encounter during the approved migration sequence.

`0044_team_trial_on_signup.sql` is **required for the Team launch**: every
newly created account receives the same 168-hour, no-card Team trial
automatically, while its base Pro/Max/free subscription remains unchanged.
Existing accounts retain the explicit authenticated trial-claim flow from
`0040`. **Applying `0044` starts the 168-hour clock at account creation
immediately**, regardless of `TEAM_FEATURE_ENABLED`. If the Team page/API is
still unavailable, new accounts can consume the trial while unable to use it.
Therefore do not apply `0044` early during schema staging: complete the
read-only preflights and recoverability gates first, document a
signup-monitoring/abort plan, then apply it only inside the approved Team
availability window when the remaining approved migrations and gate activation
can proceed promptly. If that window slips or a later target fails, leave the
flag off, record possible grants made during the window, and stop; do not
reset/edit entitlements without separately approved remediation. Existing
accounts' manual claim remains available only after the Team gate is enabled.

Only the dependency chain above is allowed in this no-card rollout. In
particular, do **not** include paid-roster, paid-checkout, seat-cap, or excluded
AI-credit migrations: `0045`, `0046`, `0049`, `0050`, `0051`, `0052`, `0057`,
`20261019192526`, `20261019230000`, or `20261019235959`. `0037`/`0038` are
already recorded as present in the last check, but verify before rollout and do
not replay them.

`20261019192526_team_seat_ceiling_64.sql` is a separate, forward-only
capacity-hardening migration, not a prerequisite for the no-card trial. It
constrains existing Team billing and checkout-intent rows to 1–64 seats without
changing their values. It requires both `public.team_billing_subscriptions`
(from `0038`) and `public.team_checkout_intents` (from `0049`); this runbook's
trial-only scope deliberately excludes `0049`, so **do not apply the seat-cap
migration in that narrow rollout**. If a separately approved Team schema
rollout includes `0049`, apply the seat-cap migration only after its
prerequisites and all earlier migrations selected for that rollout have been
applied and verified, in repository migration order. For the Team delivery
slice, `0058` remains a distinct hardening step after `0056`; do not skip the
intervening approved migrations. The seat-cap migration does not enable the
Team gate or paid checkout. It aborts before adding constraints if stored
billing or intent quantities are outside 1–64; it does not silently repair,
delete, or rewrite rows.

## Hard safety gates

- Obtain explicit production change approval and schedule a change window;
  this runbook or JM's prior approval of code/PRs is not database approval.
- Before beginning **each** production target in this sequence, record the
  provider-reported physical backup identifier, timestamp, retention, and the
  known recovery procedure/permissions in the change record; do not place
  backup data in this repository. Do **not** perform a destructive production
  restore merely to satisfy this gate. If no prior restore drill exists, record
  that drill as **NOT VERIFIED** and require explicit acceptance in the change
  record. Several migrations mutate existing rows: `0043` backfills
  `responded_at`, `0054` normalizes existing conversation-turn metadata, and
  `0055` sanitizes legacy shared-space names and approval/request metadata.
  Review those data effects and confirm that the provider still reports the
  backup available before applying them.
- For any approved rollout that includes `20261019192526_team_seat_ceiling_64.sql`, the backup/restorability check
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

  Both `violating_rows` counts must be zero before applying the seat-cap migration. Review the
  migration-history order immediately beforehand as well. If a count is
  nonzero, stop: do not edit/delete data or bypass the migration preflight under
  this runbook. Reconcile separately with explicit authorization and a fresh
  recoverable backup, then rerun the read-only check.
- Immediately before generating each target stage from a clean merged SHA, run
  `npm run verify:supabase-history-remote` through an authorized scoped,
  GET-only credential path for exactly `zwyeqqxiwiogmtqwfnby`, then re-read the
  remote migration ledger and inspect the target's live-schema preconditions.
  Record only the sanitized verifier result. Any changed remote row, failed
  source hash, or schema drift is a stop condition; regenerate rather than
  reusing a stage. Apply only the specifically reviewed missing SQL, one target
  at a time, and verify resulting schema/RPC behavior after each target before
  proceeding.
- Never run `supabase db push --include-all` from this repository root, and
  never replay the migration directory blindly. This repository has duplicate
  historic numeric prefixes (`0010`, `0026`, `0033`), so broad ordering/replay
  is unsafe. The only reviewed exception is a fresh, local-only, single-target
  stage created with `npm run prepare:team-migration-stage -- --target <version>`.
  That stage must contain every newly revalidated remote-history **version**
  exactly once, only the already-applied Team prefix plus one next reviewed
  target, and no **pending** excluded checkout/AI migration. The recovered
  timestamped source hashes remain verified by the separate history manifest;
  older already-applied files (including unrelated historic records) exist only
  for CLI version alignment and must not run.
  Immediately before the dry-run **and again immediately before the apply**,
  run `npm run verify:team-migration-stage -- --verify-stage <absolute-stage-path> --require-linked`
  from the reviewed source checkout. It must prove the pinned project ref, exact
  approved target/prefix/history versions, copied SQL hashes, and absence of
  missing, extra, or symlinked migration files. The dry-run must list exactly
  that one target before a separately approved apply. Run
  `supabase --workdir <absolute-stage-path> --profile supabase db push` only
  with `SUPABASE_DB_PASSWORD` supplied privately in a short `set +x` zsh
  subshell. Before every link/dry-run/apply invocation, explicitly unset
  `SUPABASE_DB_PASSWORD`, `SUPABASE_DB_POOLER_CONNECTION_STRING`,
  `SUPABASE_PROJECT_ID`, `PROJECT_ID`, `SUPABASE_PROFILE`, `SUPABASE_DEBUG`,
  `SUPABASE_ENV`, `SUPABASE_WORKDIR`, `SUPABASE_HOME`, and `SUPABASE_YES`; then prompt for a newly entered,
  nonempty password and export it only for that push. Never use `--debug`, run
  bare `db push --linked`, rely on the checkout CWD or inherited profile, or put
  the password in argv, an inline environment assignment, `.env`, history, or
  logs. Do not add
  `--include-seed` or `--include-roles`; omit `--yes` for the actual apply so
  the CLI retains its interactive confirmation. Do not batch targets, modify
  migration history, or reuse a stale stage. This exception was reviewed against
  Supabase CLI `v2.98.1`; stop and re-review if the installed CLI version
  changes.
- Before the non-concurrent index targets `0041`/`0042`, review active long
  transactions and expected table-size/lock impact for the approved change
  window; define an abort/escalation path rather than rewriting SQL to a
  concurrent index. Stop on any unexpected migration-history row, schema drift,
  failed statement, or failed post-migration check. Do not mark a migration
  applied manually to bypass verification. Do not echo credentials or secrets
  into commands/logs.
- Keep `TEAM_FEATURE_ENABLED` unset/off (`0`) throughout schema migration and
  read-only preflight. Do not enable paid Team checkout, run payment tests, or
  alter Pro/Max.

## Authenticated two-account smoke (after schema verification, with controlled gate activation)

With `TEAM_FEATURE_ENABLED=0`, middleware and `verifiedTeamUser` intentionally
return `503` before user RPCs run; that state can validate only schema/preflight,
not the product flow. `TEAM_FEATURE_ENABLED` is global: before setting it to
`1`, verify an enforced server-side allowlist that denies every account except
the two smoke accounts, **or** use an isolated deployment with an equivalent
DB. Without one of those controls, do not activate the global flag in
production or describe the smoke as limited to test accounts. After the exact
schema sequence above is verified and that isolation is evidenced, enable
`TEAM_FEATURE_ENABLED=1` only for the controlled smoke while keeping
`TEAM_PAID_CHECKOUT_ENABLED=0`. Use two controlled test accounts, **A (space
owner)** and **B (invitee)**. Turn `TEAM_FEATURE_ENABLED` back to `0`
immediately after **every** smoke attempt, passed or failed, until the separate
Availability gate and release approval pass. Do not call a smoke passed while
the gate remains off.

| Case | Action | Required result |
|---|---|---|
| Trial | A claims trial; repeat claim | If A is eligible, first claim grants one 168-hour Team entitlement with no card; repeat does not grant a second entitlement. If the controlled account already consumed the trial, record that state and use another eligible controlled account for the first-grant assertion. Pro/Max base plan is unchanged. |
| Capacity | A attempts to add another owner/seat during trial | Trial remains limited to one owner seat; no paid roster or checkout is created. |
| Invitation | A invites B; B views and accepts | B sees the received space separately, labeled as the owner's space (for example, “Espacio de A”); it is not listed among B's owned spaces. |
| Owner-to-member request | A requests context/document information from B | Only bounded request metadata is visible before B's decision; no document, context, path, URL, or payload is transferred. |
| Member-to-owner request | B initiates the reverse-direction request | Same metadata-only behavior; both parties can initiate, subject to the same approval rule. |
| Approval/decline | On A's source space, B requests and A accepts; separately test decline | Approval alone transfers nothing. After applying `0056` + `0058` in a controlled test environment, only A may separately submit reviewed text to B; decline creates no delivery. |
| Reverse isolation | A starts a metadata turn on A's source space; B accepts and tries to send | B can accept metadata but receives no composer/send authority on A's relationship; direct delivery is denied. B must use B's own source space for a B-to-A text leg. |
| Text delivery in both directions | Repeat the approved request/send flow on A's source (A→B), then B's source (B→A) | Each source-space owner is the approver and only permitted sender for that leg. Delivery receipt contains no payload; only the bound recipient can read. Text is bounded to 64 KiB; at 7 days, reads are denied and plaintext plus digest are erased on recipient read or a purge invocation. The metadata row and payload-free audit (delivery ID, event, actor ID/null, timestamp) remain. **Do not claim automatic physical deletion at 7 days** until an hourly purge schedule plus `CRON_SECRET` are deployed and smoked. Unsent accepted turns cannot be sent after 24 hours. |
| Revocation | **Not an authenticated product acceptance test yet.** | The current schema can represent `revoked`, but no owner RPC/API/UI exists to revoke an invitation/relationship. Do not simulate this with a direct SQL `UPDATE` or count it as a passing product smoke. A separate forward-only revoke feature and re-smoke are required before claiming this flow. |

Capture sanitized request/status evidence, never tokens or document contents.
Do not use real employee/customer context during this smoke. These checks do
not test billing or payment.

## Availability gate (separate from schema migration)

Controlled flag activation is required to perform the authenticated smoke above;
it may be called limited to the test accounts only when the documented
server-side allowlist or isolated deployment has been verified, and it must keep
paid checkout off. General Team availability may proceed only after the
approved schema rollout, applicable authenticated smoke, and the following
separate product gates are complete:

- the no-card UI does not fetch/render paid-roster controls that require excluded
  paid migrations (`0052`);
- an owner-facing revoke RPC/API/UI exists and passes the revocation smoke;
- if text delivery is marketed as physically purged at seven days, the hourly
  purge cron and `CRON_SECRET` are deployed and smoked.

Keep `TEAM_FEATURE_ENABLED` off if any check fails. Enabling availability does
not enable paid checkout or certify billing. Record separately: migration/schema
evidence, source PR/merge, deployment status, feature-flag state, and
authenticated smoke result.
