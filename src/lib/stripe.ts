import Stripe from "stripe";

// Single Stripe client shared across server routes. Using the latest API
// version pins behavior so dashboard changes don't silently shift responses.
const secret = process.env.STRIPE_SECRET_KEY;

export const stripe: Stripe | null = secret
  ? new Stripe(secret, {
      apiVersion: "2026-03-25.dahlia",
      typescript: true,
      appInfo: { name: "TerminalSync", version: "0.1.0" },
    })
  : null;

export type PlanId = "pro" | "agency";
export type BillingCycle = "monthly" | "yearly";

export function priceIdFor(
  plan: PlanId,
  cycle: BillingCycle = "monthly",
): string | null {
  if (plan === "pro") {
    return cycle === "yearly"
      ? process.env.STRIPE_PRICE_PRO_YEARLY ?? null
      : process.env.STRIPE_PRICE_PRO_MONTHLY ?? null;
  }
  if (plan === "agency") return process.env.STRIPE_PRICE_AGENCY ?? null;
  return null;
}

// 7-day free trial on Pro so users can activate Power-Ups immediately after
// entering a card, and fall off without charge if they cancel before day 7.
export const PRO_TRIAL_DAYS = 7;

export function siteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3131";
}
