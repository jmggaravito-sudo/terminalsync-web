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
  conversation requests, revocation-safe relationship binding, count-only
  pre-approval metadata, and safe recipient-visible space names. They do not
  store, import, decrypt, or deliver document/context payloads.
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

Team paid checkout is intentionally disabled in both checkout paths. A request
for `plan: "team"` returns `503` before a Stripe Checkout Session is created.
No Team Stripe Product, Price, Customer, subscription, or charge is created by
this repository or by the safe smoke process. When paid Team is explicitly
enabled later, it will be **Stripe-only**; Mercado Pago is not a Team payment
rail. `STRIPE_PRICE_TEAM` remains a future server-side configuration key, not
proof that a remote Stripe Price exists.

The public Team card therefore remains informational: it may describe the
future $59 price and no-card trial, but it must not expose a Team checkout
button until the paid lifecycle below is approved.

## Controlled production rollout (separate approval required)

1. Take a backup and inspect the remote Supabase migration history. This repo
   has historical duplicate numeric prefixes (`0010`, `0026`, and `0033`), so
   **never** run `supabase db push --include-all` and never replay the whole
   folder blindly.
2. Compare the remote schema to the Team chain and apply only the missing,
   reviewed forward migrations in dependency order (`0037` through `0055` as
   applicable). Do not mark a migration applied without verifying its schema
   effect; do not print service-role keys or other secrets in the process.
3. With two test accounts, run an authenticated smoke: signup/claim trial,
   one-seat limit, invite/accept, separate received-space rendering, both
   directions of a metadata request, accept/decline, and invitation revocation.
   Confirm that no document or context payload is delivered.
4. Only after the migrations and authenticated smoke pass, explicitly set
   `TEAM_FEATURE_ENABLED=1` and verify the same smoke against the deployed
   build. Do not treat this availability gate as a billing switch.
5. Keep paid Team checkout disabled until an explicit business approval covers
   a real Stripe-only Product/Price, the paid subscription/webhook lifecycle,
   seat reconciliation, and a post-checkout smoke that stops before payment.

## Evidence boundaries

Passing source tests, a GitHub PR, or a Vercel deployment does **not** apply a
Supabase migration or prove an authenticated two-user flow. Report these as
separate facts: source/PR, merge, deployment, production schema, and user
smoke.
