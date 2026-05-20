# Stripe Customer Portal — config checklist

Setup steps you (JM) have to flip in the Stripe dashboard so the buttons
wired up by the Tauri app + `/api/billing/portal` actually do something.
None of this is in code — it lives in Stripe.

> Dashboard URL: https://dashboard.stripe.com/settings/billing/portal

## 1. Features to enable

| Section | Toggle | Setting |
|---|---|---|
| Customer information | Edit email + billing address | ON |
| Invoice history | Show invoices | ON |
| Payment methods | Allow customers to update | ON |
| Subscriptions → Cancel | Allow customers to cancel | **ON** |
| Subscriptions → Cancel | Cancellation behavior | **Cancel at end of billing period** |
| Subscriptions → Cancel | Ask reason on cancel | **ON** (multiple choice + free text) |
| Subscriptions → Switch plans | Allow switching | **ON** |
| Subscriptions → Switch plans | Products available | Pro (`price_PRO_MONTHLY`, `price_PRO_YEARLY`), Dev (`price_DEV_MONTHLY`, `price_DEV_YEARLY`) |
| Subscriptions → Switch plans | Proration | **Do not prorate** (downgrade applies next cycle) |

## 2. Cancellation reasons (suggested options)

Stripe surfaces these as a multiple-choice list when the user clicks Cancel.
They show up in `subscription.cancellation_details.feedback` and the webhook
forwards them to the cancellation email.

- Too expensive
- Missing features
- Switched to a competitor
- Don't use it enough
- Bug / unreliable
- Other (free text)

## 3. Branding

| Setting | Value |
|---|---|
| Logo | Same as marketing site |
| Brand color | `#0EA5E9` (Tailwind sky-500, matches landing accent) |
| Privacy policy URL | https://terminalsync.ai/es/legal/privacy |
| Terms of service URL | https://terminalsync.ai/es/legal/terms |

## 4. Return URL

The `/api/billing/portal` endpoint passes `return_url` per language:

- ES → `https://terminalsync.ai/es`
- EN → `https://terminalsync.ai/en`

No config needed in Stripe — the URL is passed at session creation.

## 5. Test mode vs live

Stripe maintains separate portal configs for test and live keys.
**Configure both**, otherwise dev sessions hit a portal that doesn't
allow cancellation and you'll think the feature is broken.

## 6. Webhook events to verify are enabled

The portal triggers these — they must be in the existing webhook
endpoint (`/api/webhooks/stripe`):

- `customer.subscription.updated` (plan switch, cancel-at-period-end toggle)
- `customer.subscription.deleted` (final cancellation)
- `customer.updated` (email / address edits)

Existing webhook handler in `src/app/api/webhooks/stripe/route.ts`
already covers all three.

## 7. Validation

Open `https://terminalsync.ai/es/billing` while signed in with a paid
account, paste the email, click "Abrir portal". You should land in
Stripe and see:

- [ ] "Cancel plan" button
- [ ] "Update plan" button with both Pro + Dev visible
- [ ] "Update payment method" button
- [ ] Invoice list with at least the most recent one
- [ ] Return arrow that lands back on `terminalsync.ai/es`
