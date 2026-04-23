#!/usr/bin/env node
// Idempotent Stripe product + price setup for TerminalSync Pro.
// Creates:
//   - 1 product: "TerminalSync Pro"
//   - 2 recurring prices: $19 USD/month, $190 USD/year
// Re-running is safe — it finds existing resources by metadata and reuses them.
//
// Usage:
//   STRIPE_SECRET_KEY=sk_live_... node scripts/stripe-setup.mjs

import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("❌ Missing STRIPE_SECRET_KEY in env");
  process.exit(1);
}

const stripe = new Stripe(key, { apiVersion: "2026-03-25.dahlia" });

const PRODUCT_METADATA_KEY = "terminalsync_plan";
const PRODUCT_METADATA_VALUE = "pro";

async function findOrCreateProduct() {
  // Stripe doesn't have a "find by metadata" endpoint, so we list and filter.
  // At low product counts this is fine; the search API also exists but costs a
  // request roundtrip even for empty result sets.
  const list = await stripe.products.list({ active: true, limit: 100 });
  const existing = list.data.find(
    (p) => p.metadata?.[PRODUCT_METADATA_KEY] === PRODUCT_METADATA_VALUE,
  );
  if (existing) {
    console.log(`✓ Product already exists: ${existing.id} (${existing.name})`);
    return existing;
  }

  const product = await stripe.products.create({
    name: "TerminalSync Pro",
    description:
      "Unlimited terminals · AI Auto-Pilot (one-click Claude Code install) · AI context sync · 90-day history · up to 5 computers.",
    metadata: { [PRODUCT_METADATA_KEY]: PRODUCT_METADATA_VALUE },
    // Assumes Stripe Tax is enabled on the account (automatic_tax in checkout).
    tax_code: "txcd_10000000",
    url: "https://terminalsync.ai/es#pricing",
  });
  console.log(`✓ Created product: ${product.id}`);
  return product;
}

async function findOrCreatePrice({ product, amountCents, interval, nickname }) {
  const list = await stripe.prices.list({
    product: product.id,
    active: true,
    limit: 100,
  });
  const match = list.data.find(
    (p) =>
      p.unit_amount === amountCents &&
      p.currency === "usd" &&
      p.recurring?.interval === interval,
  );
  if (match) {
    console.log(
      `✓ Price exists for ${interval}: ${match.id} ($${amountCents / 100}/${interval})`,
    );
    return match;
  }

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: amountCents,
    currency: "usd",
    nickname,
    recurring: { interval },
    metadata: { cycle: interval === "month" ? "monthly" : "yearly" },
    tax_behavior: "exclusive",
  });
  console.log(
    `✓ Created price for ${interval}: ${price.id} ($${amountCents / 100}/${interval})`,
  );
  return price;
}

const product = await findOrCreateProduct();
const monthly = await findOrCreatePrice({
  product,
  amountCents: 1900,
  interval: "month",
  nickname: "Pro Monthly",
});
const yearly = await findOrCreatePrice({
  product,
  amountCents: 19000,
  interval: "year",
  nickname: "Pro Yearly (17% off vs monthly)",
});

console.log("\n──────────────────────────────────────────────");
console.log("Paste these in Vercel → Settings → Environment Variables:");
console.log("──────────────────────────────────────────────");
console.log(`STRIPE_PRICE_PRO_MONTHLY=${monthly.id}`);
console.log(`STRIPE_PRICE_PRO_YEARLY=${yearly.id}`);
console.log("──────────────────────────────────────────────\n");
