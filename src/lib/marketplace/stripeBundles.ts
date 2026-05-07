// Stripe Product + Price helper for bundles. Mirrors the
// `ensureListingPrice` pattern from stripeConnect.ts so the surface
// of the marketplace stays consistent: idempotency keys on every
// Stripe write, persistence-before-flip ordering, and an explicit
// liveness check before checkout.

import { stripe } from "@/lib/stripe";

interface BundleStripeInput {
  id: string;
  name: string;
  priceCents: number;
  currency: string;
  stripeProductId: string | null;
  stripePriceId: string | null;
}

/** Lazily create a Stripe Product + one-time Price for a bundle.
 *  Two layers of idempotency:
 *    - DB level: reuse persisted IDs if already set.
 *    - Stripe level: deterministic idempotency keys so a retry after a
 *      partial failure (Stripe write succeeded, DB write afterwards
 *      didn't) returns the SAME Product/Price instead of a duplicate. */
export async function ensureBundlePrice(
  bundle: BundleStripeInput,
): Promise<{ productId: string; priceId: string }> {
  if (!stripe) throw new Error("Stripe not configured");

  let productId: string;
  if (bundle.stripeProductId) {
    productId = bundle.stripeProductId;
  } else {
    const product = await stripe.products.create(
      {
        name: `Stack Pack — ${bundle.name}`,
        metadata: {
          bundle_id: bundle.id,
          source: "terminalsync_bundle",
        },
      },
      { idempotencyKey: `bundle_product_${bundle.id}` },
    );
    productId = product.id;
  }

  let priceId: string;
  if (bundle.stripePriceId) {
    priceId = bundle.stripePriceId;
  } else {
    // Including amount + currency in the key means changing the price
    // gets a NEW Stripe Price (Prices are immutable).
    const price = await stripe.prices.create(
      {
        product: productId,
        currency: bundle.currency,
        unit_amount: bundle.priceCents,
        metadata: {
          bundle_id: bundle.id,
          source: "terminalsync_bundle",
        },
      },
      {
        idempotencyKey: `bundle_price_${bundle.id}_${bundle.priceCents}_${bundle.currency}`,
      },
    );
    priceId = price.id;
  }

  return { productId, priceId };
}

/** Verify a Stripe Price is still active. Use right before flipping a
 *  bundle to status='active' so checkout never lands on a dead Price. */
export async function verifyBundlePriceLive(priceId: string): Promise<boolean> {
  if (!stripe) throw new Error("Stripe not configured");
  try {
    const price = await stripe.prices.retrieve(priceId);
    return price.active === true;
  } catch {
    return false;
  }
}
