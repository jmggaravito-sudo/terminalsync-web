# Team checkout and rollout readiness

Team is a separate add-on planned at **US$59 per employee/seat/month**. It
must coexist with the customer's Pro or Max base plan: it must never replace
`subscriptions.plan`, downgrade Pro/Max, or make a base-plan change as a side
effect of Team access.

## Current source contract

- **Trial:** migrations `0040` and `0044` implement one separate Team
  entitlement per account: exactly **168 hours**, no card, no automatic charge.
  New signups receive it through a database trigger; an existing authenticated
  account can claim the same one-time entitlement through `/api/team/trial`.
  Trial capacity is deliberately one owner seat.
- **Collaboration:** migrations `0039`, `0042`–`0043`, and `0053`–`0055`
  implement shared-space metadata, invitations, approval prompts, two-way
  conversation requests, relationship binding that can represent `revoked`,
  count-only pre-approval metadata, and safe recipient-visible space names. The
  current source does **not** expose an owner-facing revoke RPC/API/UI yet.
  They do not store, import, decrypt, or deliver document/context payloads.
  Migration `0056` adds the private reviewed-text store, and
  `0058_team_owner_approved_text_delivery.sql` makes its public
  writer source-owner-only: the owner of the exact source space must accept a
  member-originated turn before sending bounded text (64 KiB maximum; 24-hour
  unsent approval window; 7-day recipient access, then plaintext+digest
  erasure). A reverse text leg uses the other participant's own source space;
  a non-owner cannot reuse another owner's relationship as a delivery channel.
  Payload-free audit metadata remains separately retained without a scheduled
  cleanup in this slice. The purge endpoint is present, but no Vercel cron
  schedule is included until `CRON_SECRET` and hourly-cron capability are
  verified in a later rollout step. It does not add file delivery or automatic
  AI generation; the browser gets only a server-derived text-composer grant,
  and delivery receipt/text read are separate authenticated APIs. The default-off
  Team gate remains required.
- **Browser boundary:** Team APIs derive identity from a verified Supabase
  bearer token, fail closed, and use `Cache-Control: no-store`. The UI keeps
  received spaces separate from owned spaces and requires an explicit approval
  response before any future delivery channel can run.

## Current runtime boundary

The source implementation is **not** a production-schema certification.
Production migration history must be checked separately before authenticated
Team flows are claimed as live.

`TEAM_FEATURE_ENABLED` is a server-only availability gate and defaults to off.
Keep it off while the production schema is behind the reviewed Team chain. It
returns a cache-safe `503` for Team APIs and shows an unavailable state at the
Team page; it never changes Pro/Max or opens any paid checkout.

The `.env.example` defaults are source intent, not production evidence. Before a
controlled smoke, record sanitized deployed flag evidence: `TEAM_FEATURE_ENABLED=1`
only for the bounded attempt and `TEAM_PAID_CHECKOUT_ENABLED=0`. Include a
negative smoke assertion that no paid-roster/checkout UI is exposed, the Team
checkout handler remains `503`, and no Stripe action is attempted.

The legacy generic `/api/checkout` path intentionally refuses `plan: "team"`
with `503` before any Stripe call. It remains unsuitable for Team because it
accepts a caller-provided user ID and uses the generic success flow. A separate,
authenticated `/api/team/checkout` source scaffold exists, but it is **default
off**: it requires both `TEAM_FEATURE_ENABLED=1` and the new explicit
`TEAM_PAID_CHECKOUT_ENABLED=1`; `.env.example` sets both to `0`. While the paid
gate is off, that handler does not authenticate, query Supabase, inspect a
Stripe Price, retrieve a Checkout Session, or call Stripe.

The dedicated route derives the owner only from a verified bearer token and
rejects `userId`/`supabaseUserId` request fields. It accepts only a request UUID,
locale, and **1–64** seats. Its server configuration selects
`STRIPE_PRICE_TEAM` only for an `sk_live_` key and `STRIPE_PRICE_TEAM_TEST` only
for an `sk_test_` key; it validates an active matching **USD 5900/month** Price
before it can attempt a Checkout Session. It is Stripe-only and does not change
Pro/Max or create a Stripe trial: the separate 168-hour no-card Team entitlement
remains independent.

### Durable provider-attempt recovery policy

Before a Team Checkout Session create, the source migration records the intent
as `creating`. That durable state is the one-shot provider-attempt record:
`reserved → creating` authorizes one call, but a replay of `creating`,
`ambiguous`, or any other in-flight state never authorizes another call. A
network failure, process crash, invalid create response, or failed session bind
after that transition is quarantined as `creating`/`ambiguous` and returns a
reconciliation-required result—there is **no timer, automatic retry, or
best-effort second Stripe create**.

Recovery is deliberately external to this slice: only a separately verified
exact Stripe Session/subscription result whose stored Team metadata, owner,
price, seat count, and idempotency key all match may bind, reconcile, or call
the existing atomic billing finalizer. An operator-reviewed recovery workflow
must use that same verified evidence; a missing result is not proof that Stripe
did nothing. This costs manual/audited recovery for a crash before or after the
provider call, rather than risking a duplicate subscription.

This is **not activation-ready**. Source now contains a dedicated signed Team
Checkout dispatcher, but it remains behind the same default-off
`TEAM_FEATURE_ENABLED=1` + `TEAM_PAID_CHECKOUT_ENABLED=1` pair. For a live event
it requires the proven live signing secret, exact configured mode/price/seat
terms, a trusted intent, and full route metadata before it can invoke the
service-role-only atomic finalizer. It routes all four Checkout Session events
through marker RPCs; an unbound recovery intent may be bound only by its own
signed Session event, never from a subscription payload. Later route-bound
subscription updates/deletions re-read the exact durable Session and use the
atomic finalizer rather than the legacy Team mapper. Test-mode events make no
writes. If local mode-specific Team terms are unavailable or have the wrong
live/test mode, the dispatcher returns a retryable server error before any
provider or database action rather than acknowledging that delivery. If the
terms are well-formed but their current Price differs from the exact durable
intent, it makes only the intent read needed to validate the signed binding,
then returns a retryable error before provider, ledger, or legacy side effects.
This source
change does not enable the flags, deploy, apply a migration,
create a Stripe Product/Price/Customer/subscription, or charge anyone. Do not
set `TEAM_PAID_CHECKOUT_ENABLED=1` until this dispatcher and its database
migration have been reviewed and explicitly approved for a separate rollout.

The public Team card therefore remains informational: it may describe the
future $59 price and no-card trial, but it must not expose a Team checkout
button until the paid lifecycle below is approved.

## Controlled production rollout (separate approval required)

The production migration inventory, precise forward-only migration groups,
backup/restore gate, two-account smoke matrix, and feature activation order are
maintained in [`team-production-rollout.md`](team-production-rollout.md). That
runbook reflects a read-only history check and must be revalidated before any
change. Do not infer production readiness from this source document or a green
PR. In particular, do not run `supabase db push --include-all` from the
repository root. The narrowly reviewed Team migration exception is documented
in `team-production-rollout.md`: a fresh, source-locked, one-target staging
directory with a dry-run that lists exactly one approved migration. It does not
authorize paid checkout or a broad migration replay.

Keep paid Team checkout disabled until a separate explicit business approval
covers a real Stripe-only Product/Price, paid subscription/webhook lifecycle,
seat reconciliation, and a dedicated post-checkout verification. That paid
work is outside the migration runbook.

## Evidence boundaries

Passing source tests, a GitHub PR, or a Vercel deployment does **not** apply a
Supabase migration or prove an authenticated two-user flow. Report these as
separate facts: source/PR, merge, deployment, production schema, and user
smoke.
