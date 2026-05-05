// Stripe Connect Express helpers for the marketplace.
//
// Express accounts: Stripe hosts KYC + dashboard, we just kick off the
// onboarding link and store the resulting account id. Payouts to the
// publisher happen automatically via `transfer_data.destination` on the
// PaymentIntent at checkout time — no manual transfers needed.
//
// Docs: https://stripe.com/docs/connect/express-accounts

import { siteUrl, stripe } from "@/lib/stripe";

export interface CreateAccountInput {
  email: string;
  /** Country in ISO 3166-1 alpha-2. Stripe requires this at account
   *  creation. Default 'US' but the publisher onboarding form should
   *  collect it for non-US creators. */
  country?: string;
}

/** Create a fresh Express account. Returns the Stripe account id, which
 *  we persist on `publishers.stripe_account_id`. */
export async function createExpressAccount(
  input: CreateAccountInput,
): Promise<string> {
  if (!stripe) throw new Error("Stripe not configured");
  const account = await stripe.accounts.create({
    type: "express",
    email: input.email,
    country: input.country ?? "US",
    capabilities: {
      transfers: { requested: true },
      card_payments: { requested: true },
    },
    business_type: "individual",
    metadata: { source: "terminalsync_marketplace" },
  });
  return account.id;
}

/** Generate a one-time onboarding link. We never persist this — generate
 *  fresh each time the publisher clicks "complete onboarding". */
export async function createOnboardingLink(
  accountId: string,
  lang: "es" | "en",
): Promise<string> {
  if (!stripe) throw new Error("Stripe not configured");
  const base = siteUrl();
  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${base}/${lang}/publishers/onboard?refresh=1`,
    return_url: `${base}/${lang}/publishers/listings?onboarded=1`,
    type: "account_onboarding",
  });
  return link.url;
}

/** Reads the live state of an Express account so we can update
 *  `payout_enabled` in Supabase. Called from the account.updated webhook
 *  and on-demand when the publisher returns from Stripe's hosted flow. */
export async function fetchAccountState(
  accountId: string,
): Promise<{ payoutEnabled: boolean; chargesEnabled: boolean }> {
  if (!stripe) throw new Error("Stripe not configured");
  const acct = await stripe.accounts.retrieve(accountId);
  return {
    payoutEnabled: acct.payouts_enabled === true && acct.details_submitted === true,
    chargesEnabled: acct.charges_enabled === true,
  };
}

/** Lazily create a Stripe Product + one-time Price for a listing. Idempotent —
 *  reuse existing IDs if already created. Returned IDs should be persisted
 *  on the listing row so we don't keep creating duplicates. */
export async function ensureListingPrice(
  listing: {
    id: string;
    name: string;
    priceCents: number;
    currency: string;
    stripeProductId: string | null;
    stripePriceId: string | null;
  },
): Promise<{ productId: string; priceId: string }> {
  if (!stripe) throw new Error("Stripe not configured");

  let productId: string;
  if (listing.stripeProductId) {
    productId = listing.stripeProductId;
  } else {
    // Idempotency key keyed on the listing id — a retry after a partial
    // failure (Stripe created the Product but our DB write afterwards
    // failed) returns the SAME Product, never an orphaned duplicate.
    const product = await stripe.products.create(
      {
        name: `Connector — ${listing.name}`,
        metadata: { listing_id: listing.id, source: "terminalsync_marketplace" },
      },
      { idempotencyKey: `marketplace_product_${listing.id}` },
    );
    productId = product.id;
  }

  let priceId: string;
  if (listing.stripePriceId) {
    priceId = listing.stripePriceId;
  } else {
    // Includes amount+currency in the key so changing the price gets a NEW
    // Price (Stripe Prices are immutable; idempotency must reflect that).
    const price = await stripe.prices.create(
      {
        product: productId,
        currency: listing.currency,
        unit_amount: listing.priceCents,
        metadata: { listing_id: listing.id, source: "terminalsync_marketplace" },
      },
      {
        idempotencyKey: `marketplace_price_${listing.id}_${listing.priceCents}_${listing.currency}`,
      },
    );
    priceId = price.id;
  }

  return { productId, priceId };
}

/** Verify a Stripe Price exists and is active. Use right before flipping a
 *  listing to 'approved' so we never leave a listing pointing at a price
 *  that 500s on checkout. */
export async function verifyPriceLive(priceId: string): Promise<boolean> {
  if (!stripe) throw new Error("Stripe not configured");
  try {
    const price = await stripe.prices.retrieve(priceId);
    return price.active === true;
  } catch {
    return false;
  }
}
