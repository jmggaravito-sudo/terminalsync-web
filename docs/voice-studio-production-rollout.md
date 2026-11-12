# Voice Studio production dashboard rollout

Stripe is the payment source. The new tables are the source for order production
and credit balances. Previous orders in Frappe stay visible to clients as CRM
history; they are not duplicated or automatically counted as unpaid usage.

## Before merging or publishing

1. Confirm the web deployment and webhook use the intended Supabase project and
   server-only service role. Set `VOICE_STUDIO_OPS_EMAILS` to the small, approved
   team list; if unset the API uses the existing `ADMIN_EMAILS`. Staff must use a
   confirmed account. Check that the OAuth callback accepts the operations URL.
2. Confirm the live Stripe endpoint receives `checkout.session.completed`,
   `checkout.session.async_payment_succeeded`, and `invoice.paid`, and that the
   configured live Pack 4/8 prices match the paid invoice lines. One-time
   purchases grant one credit; the voice setup alone does not grant production
   credits. Monthly packs grant from the first paid invoice and subsequent paid
   billing cycles, not from checkout or prorated plan changes.
3. Take the project's normal backup and apply
   `20261110155236_voice_studio_production_orders.sql` to the intended database
   **before** deploying the webhook and dashboard. Verify a browser-level
   Supabase role cannot read, insert, update, or execute either production RPC.
4. Reconcile existing buyers before switching intake. For each still-valid paid
   order or billing cycle, match the confirmed checkout email and the actual
   Stripe `cs_…` or `in_…` source ID, then initialize the corresponding
   entitlement and consumed counts from verified prior CRM work. Do not infer a
   plan from a login, a CRM lead, or a client-entered email, or reset existing
   usage when retrying. Reconcile events paid during the changeover separately.
5. Assign ownership for manually reconciling refunds, chargebacks, payment plan
   changes, and cancellations. A normal cancellation does not invalidate an
   already-paid cycle. Refunded or disputed credits are not automatically revoked
   by this change; operators must suspend the affected entitlement in the
   database and review existing queued work before starting it. Confirm intended
   handling of any 100%-discounted pack before accepting one.
6. Set the team alert destination with `VOICE_STUDIO_ORDERS_NOTIFY_EMAIL` if
   different from `hola@terminalsync.ai`. Verify Resend delivery. The email is a
   best-effort nudge, not a durable notification queue; the operations queue is
   authoritative. Configure Stripe webhook failure alerts and watch for retries.

## Verify in an isolated environment first

Use a separate test database and mocked Stripe events, not a live charge.

- Paid subscription invoice → one plan with the right period and credit totals.
  Replay the invoice and verify that neither the plan nor credits are duplicated.
- Signed-in customer with a matching confirmed email → see the plan, submit an
  original YouTube link, choose a Short timestamp, and see both balances drop.
  Repeating the same submission request ID after a network error must not use
  more credits. A different customer, expired plan, or insufficient balance must
  not be able to enqueue it.
- Staff in `/admin/voice-studio/production` → see the source, plan and Short
  instructions; verify actual duration before starting and reserve extra video
  units for long source material. A client account must not see or modify the
  operations queue. For a short-included order, delivery requires both links.
- Use HTTPS file links restricted to the customer's email, and verify access
  with that customer before marking delivered. The dashboard does not manage
  permissions on third-party storage. Draft links stay hidden from clients.
- Confirm old signed order links still render and old Frappe orders are shown
  as history. Verify that legacy work is accounted for during backfill.

If disabling the feature, roll back the web deployment first. Do not drop the
tables or delete accepted orders; reconcile any work accepted by either version
during the rollback.

## Per-minute quote intake (separate from plan checkout)

This path starts unpaid and does not activate the legacy Stripe SKUs. It is off by default.

1. Review and publish the final service agreement at a version-specific HTTPS URL. See [draft and review checklist](./voice-studio-service-agreement-draft.md). Do not reuse the voice-clone consent page or a draft.
2. In an isolated database, validate the new migration with `node scripts/test-voice-studio-quote-intake-sql.mjs`. Verify authenticated and anonymous browser roles cannot read or write either table.
3. Before enabling, apply the new migration using the project's normal deployment procedure; configure `VOICE_STUDIO_SERVICE_AGREEMENT_VERSION`, `VOICE_STUDIO_SERVICE_AGREEMENT_URL`, then `VOICE_STUDIO_QUOTE_INTAKE_ENABLED=true` on the server. Set `VOICE_STUDIO_OPS_EMAILS` to the approved staff list. Keep the flag off if the agreement, deployment or operating procedure is not approved.
4. Verify sign-in returns to the cart, unsigned accounts cannot submit without accepting, the current agreement is accepted once per account, each submission confirms footage rights, a replay does not create a second request, and staff see the request under `/admin/voice-studio/quotes`. Perform no live charge in the smoke.
5. Review every request before offering payment. Automatic per-minute checkout is **not implemented**; the existing legacy payment and credit flow is unchanged. Disable the intake flag to pause new submissions without deleting any evidence or requests.
