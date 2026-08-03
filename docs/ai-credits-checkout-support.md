# AI credits checkout — support and rollout

## What the customer sees

- Terminal Sync offers fixed prepaid packages of **US$10** and **US$20**.
- In Colombia, the UI and Mercado Pago checkout show the same published COP
  package values: **COP 41,000** and **COP 82,000**.
- Elsewhere, Stripe Checkout charges the USD package amount.
- A canceled or failed checkout does not add credits and must not change the
  previous balance.

## Safe rollout order

1. Apply `supabase/migrations/0027_ai_credits.sql`.
2. Confirm existing server variables are present in the deployment environment:
   `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`,
   `STRIPE_WEBHOOK_SECRET`, `MERCADOPAGO_ACCESS_TOKEN`, and
   `MERCADOPAGO_WEBHOOK_SECRET`. Confirm `NEXT_PUBLIC_SITE_URL` resolves to the
   canonical HTTPS site. Do not put secret values in Git.
3. Deploy `terminalsync-web` and verify:
   - `OPTIONS /api/credits/checkout` returns 204 with Tauri CORS headers;
   - unauthenticated `POST /api/credits/checkout` returns 401 JSON;
   - Stripe sends `checkout.session.completed` and
     `checkout.session.async_payment_succeeded` to the signed webhook;
   - signed Stripe/MP webhook replays are idempotent in `ai_credit_ledger`.
4. Only then ship the desktop build that points to this endpoint.

The checkout route trusts the verified Supabase Bearer token, not email or user
IDs supplied by the desktop body. Only the published $10/$20 packages are
accepted. Provider webhook metadata is revalidated against the package amount
before the service-role RPC grants balance.

## Support responses

| Customer report | What support should say/do |
| --- | --- |
| “The payment page did not open” | No charge was made. Ask them to retry once and check their connection. If it repeats, collect app build, country, and timestamp. |
| “I canceled” | Confirm that cancellation does not charge or change the previous balance. |
| “Mercado Pago says pending” | Credits are added only after MP reports `approved`; ask the customer to wait for provider confirmation. |
| “I paid but the balance did not update” | Collect the provider receipt/payment ID and account email. Check for the idempotency key `stripe:<session>` or `mercadopago:<payment>` in `ai_credit_ledger`; never add balance twice. |
| “I see a technical error” | Capture build + screenshot. The desktop should show localized retry/sign-in/service-unavailable copy, never raw `Load failed`, HTTP codes, or internal IDs. |

## Current boundary

This backend creates hosted one-time checkouts and records confirmed top-ups in
the account-scoped cloud ledger. Debit/refund of provider actions remains a
separate authorization path; do not turn a provider action into an unlimited or
free promise merely because checkout is available. The current desktop wallet
is still local, so **do not enable a live customer launch** until a follow-up
makes the cloud balance authoritative for desktop status, debit, and refund.
The post-build smoke for this recovery must stop before payment.
