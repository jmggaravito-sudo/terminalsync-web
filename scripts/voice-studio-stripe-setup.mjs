#!/usr/bin/env node
// Idempotent Stripe product + price setup for the Voice Studio dubbing
// business (standalone landing at terminalsync.ai/voice-studio).
// Creates:
//   - 1 product: "Voice Studio Dubbing" (metadata.business = voice-studio)
//   - 3 one-time prices: setup $300, first-video trial $99, single video $129
//   - 2 recurring prices: 4-pack $399/month, 8-pack $699/month
// Re-running is safe — it finds existing resources by metadata and reuses
// them, then prints the `vercel env add` commands for the runtime price IDs.
//
// Usage:
//   STRIPE_SECRET_KEY=sk_live_... node scripts/voice-studio-stripe-setup.mjs

import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("❌ Missing STRIPE_SECRET_KEY in env");
  process.exit(1);
}

const stripe = new Stripe(key, { apiVersion: "2026-03-25.dahlia" });

const PRODUCT_METADATA_KEY = "business";
const PRODUCT_METADATA_VALUE = "voice-studio";

async function findOrCreateProduct() {
  const list = await stripe.products.list({ active: true, limit: 100 });
  const existing = list.data.find(
    (p) => p.metadata?.[PRODUCT_METADATA_KEY] === PRODUCT_METADATA_VALUE,
  );
  if (existing) {
    console.log(`✓ Product already exists: ${existing.id} (${existing.name})`);
    return existing;
  }
  const product = await stripe.products.create({
    name: "Voice Studio Dubbing",
    description:
      "Done-for-you Spanish YouTube channel: videos dubbed with a clone of the creator's own voice, subtitled, translated metadata, published to the creator's channel.",
    metadata: { [PRODUCT_METADATA_KEY]: PRODUCT_METADATA_VALUE },
    tax_code: "txcd_10000000",
    url: "https://terminalsync.ai/voice-studio",
  });
  console.log(`✓ Created product: ${product.id}`);
  return product;
}

async function findOrCreatePrice({ product, amountCents, recurring, nickname }) {
  const list = await stripe.prices.list({
    product: product.id,
    active: true,
    limit: 100,
  });
  const match = list.data.find(
    (p) =>
      p.unit_amount === amountCents &&
      p.currency === "usd" &&
      (recurring ? p.recurring?.interval === "month" : !p.recurring),
  );
  if (match) {
    console.log(`✓ Price exists: ${match.id} — ${nickname}`);
    return match;
  }
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: amountCents,
    currency: "usd",
    nickname,
    ...(recurring ? { recurring: { interval: "month" } } : {}),
    tax_behavior: "exclusive",
  });
  console.log(`✓ Created price: ${price.id} — ${nickname}`);
  return price;
}

const product = await findOrCreateProduct();

const prices = {
  VS_PRICE_SETUP: await findOrCreatePrice({
    product,
    amountCents: 30000,
    recurring: false,
    nickname: "Voice setup $300 one-time",
  }),
  VS_PRICE_TRIAL: await findOrCreatePrice({
    product,
    amountCents: 9900,
    recurring: false,
    nickname: "First video trial $99",
  }),
  VS_PRICE_SINGLE: await findOrCreatePrice({
    product,
    amountCents: 12900,
    recurring: false,
    nickname: "Single video $129",
  }),
  VS_PRICE_PACK4_MONTHLY: await findOrCreatePrice({
    product,
    amountCents: 39900,
    recurring: true,
    nickname: "4-video pack $399/month",
  }),
  VS_PRICE_PACK8_MONTHLY: await findOrCreatePrice({
    product,
    amountCents: 69900,
    recurring: true,
    nickname: "8-video pack $699/month",
  }),
};

console.log("\nSet these in Vercel (production):\n");
for (const [name, price] of Object.entries(prices)) {
  console.log(`printf "${price.id}" | vercel env add ${name} production`);
}
