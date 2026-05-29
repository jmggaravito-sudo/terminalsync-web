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

export type PlanId = "pro" | "max" | "agency";

/**
 * Billing cycle type, kept para que el webhook handler pueda seguir
 * leyendo `cycle === "yearly"` en metadata de subscriptions YA EXISTENTES.
 * Para nuevos checkouts solo vendemos mensual — JM decidió 2026-05-29
 * que anuales no son nuestra fortaleza (cancelaciones tardías, churn
 * agrupado, peor cashflow). Los yearly subs que ya están en la wild
 * siguen funcionando hasta que cancelen.
 */
export type BillingCycle = "monthly" | "yearly";

export function priceIdFor(plan: PlanId): string | null {
  if (plan === "pro") {
    return process.env.STRIPE_PRICE_PRO_MONTHLY ?? null;
  }
  if (plan === "max") {
    // STRIPE_PRICE_MAX_MONTHLY es el nombre canónico. STRIPE_PRICE_DEV_MONTHLY
    // queda como fallback en Vercel del rename Dev→Max (2026-05-20) para que
    // un deploy mid-rollout no 503ee. Pueden borrarse cuando ningún ambiente
    // dependa más del nombre viejo.
    return (
      process.env.STRIPE_PRICE_MAX_MONTHLY ??
      process.env.STRIPE_PRICE_DEV_MONTHLY ??
      null
    );
  }
  if (plan === "agency") return process.env.STRIPE_PRICE_AGENCY ?? null;
  return null;
}

/** Maps a PlanId to the Supabase `subscriptions.plan` enum value. Used
 * by the Stripe webhook to upsert the plan after checkout completes. */
export function planToSupabase(plan: PlanId): "pro" | "max" | "team" {
  if (plan === "agency") return "team";
  return plan;
}

/** Accept inbound webhooks/legacy clients that still say "dev" and route
 *  them through as "max". Old Tauri builds in the wild send "dev" in the
 *  checkout body — without this they would 400 on the rename rollout day. */
export function normalizePlanId(input: string): PlanId | null {
  if (input === "dev") return "max";
  if (input === "pro" || input === "max" || input === "agency") return input;
  return null;
}

// 7-day free trial on paid plans so users can activate features
// immediately after entering a card, and fall off without charge if they
// cancel before day 7. Applies to both Pro and Max.
export const TRIAL_DAYS = 7;
/** @deprecated — kept for back-compat with older imports. Use TRIAL_DAYS. */
export const PRO_TRIAL_DAYS = TRIAL_DAYS;

export function siteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3131";
}
