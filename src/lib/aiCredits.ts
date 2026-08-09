import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getTrm, TRM_FALLBACK } from "@/lib/trm";

export const CREDIT_CHECKOUT_SOURCE = "terminalsync_credits";

/**
 * What is added on top of the TRM when charging in pesos.
 *
 * Not profit: it covers what charging in another currency actually costs —
 * Mercado Pago's commission and the IVA on it, plus the exchange rate moving
 * between the moment of the charge and the settlement. The TRM swung 3.1%
 * across two weeks of August 2026, so a buffer in that neighbourhood is what
 * the evidence supports rather than a guess.
 *
 * **This is the one number to change if the policy changes.** It is deliberately
 * a single constant so nobody has to hunt for it.
 */
export const CREDIT_COP_MARGIN = 0.08;

/**
 * @deprecated Kept only so an unconverted caller still compiles. The real rate
 * comes from {@link copRateForCredits}; this constant was 4,100 and had drifted
 * ~28% above the real TRM, which is what made Colombians overpay.
 */
export const CREDIT_COP_PER_USD = TRM_FALLBACK * (1 + CREDIT_COP_MARGIN);

/** The COP/USD rate to charge at today: the legal TRM plus the margin. */
export async function copRateForCredits(): Promise<{
  rate: number;
  trm: number;
  source: string;
}> {
  const trm = await getTrm();
  return {
    rate: trm.value * (1 + CREDIT_COP_MARGIN),
    trm: trm.value,
    source: trm.source,
  };
}

export interface CreditPackage {
  amountCents: 1000 | 2000;
  amountMicros: number;
  usd: number;
}

const PACKAGES: Record<number, CreditPackage> = {
  1000: { amountCents: 1000, amountMicros: 10_000_000, usd: 10 },
  2000: { amountCents: 2000, amountMicros: 20_000_000, usd: 20 },
};

export function creditPackageFor(amountCents: unknown): CreditPackage | null {
  if (typeof amountCents !== "number" || !Number.isInteger(amountCents)) return null;
  return PACKAGES[amountCents] ?? null;
}

/**
 * Price of a package in pesos, rounded to the nearest 100 so the customer sees
 * a normal amount rather than 34,608.
 */
export function copAmountForCreditPackage(
  creditPackage: CreditPackage,
  rate = CREDIT_COP_PER_USD,
): number {
  return Math.round((creditPackage.usd * rate) / 100) * 100;
}

/** Same, at today's TRM. This is what the checkout and the webhook must use. */
export async function copAmountForCreditPackageToday(
  creditPackage: CreditPackage,
): Promise<number> {
  const { rate } = await copRateForCredits();
  return copAmountForCreditPackage(creditPackage, rate);
}

export type CreditRail = "stripe" | "mercadopago";
export type CreditFlavor = "stable" | "lab";
export type CreditLang = "es" | "en";

export function normalizeCreditRail(value: unknown): CreditRail | null {
  return value === "stripe" || value === "mercadopago" ? value : null;
}

export function normalizeCreditFlavor(value: unknown): CreditFlavor {
  return value === "lab" ? "lab" : "stable";
}

export function normalizeCreditLang(value: unknown): CreditLang {
  return value === "en" ? "en" : "es";
}

function enabledFlag(value: string | undefined): boolean {
  return ["1", "true", "yes"].includes(value?.trim().toLowerCase() ?? "");
}

/** Server-side launch gate. The client-provided flavor is never sufficient:
 * Lab also requires the authenticated Supabase user id to be explicitly
 * allowlisted. Stable remains closed until a separate server flag is enabled. */
export function canCreateCreditCheckout(input: {
  userId: string;
  flavor: CreditFlavor;
  enabled?: string;
  stableEnabled?: string;
  labUserIds?: string;
}): boolean {
  if (!enabledFlag(input.enabled)) return false;
  if (input.flavor === "stable") return enabledFlag(input.stableEnabled);
  const allowedLabUsers = new Set(
    (input.labUserIds ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  );
  return allowedLabUsers.has(input.userId);
}

export function creditReturnUrl(input: {
  base: string;
  lang: CreditLang;
  flavor: CreditFlavor;
  status: "success" | "cancel" | "pending" | "failure";
  stripeSessionPlaceholder?: boolean;
}): string {
  const url = new URL(`/${input.lang}/credits/return`, input.base.replace(/\/+$/, "") + "/");
  url.searchParams.set("status", input.status);
  url.searchParams.set("flavor", input.flavor);
  if (input.stripeSessionPlaceholder) {
    // Stripe replaces this literal after payment. URLSearchParams escapes the
    // braces, so restore them after serialization.
    url.searchParams.set("session_id", "{CHECKOUT_SESSION_ID}");
  }
  return url.toString().replace("%7BCHECKOUT_SESSION_ID%7D", "{CHECKOUT_SESSION_ID}");
}

export interface CreditPaymentMetadata {
  [key: string]: string;
  source: string;
  supabase_user_id: string;
  credit_amount_cents: string;
  credit_amount_micros: string;
  rail: CreditRail;
}

export function creditMetadata(input: {
  userId: string;
  creditPackage: CreditPackage;
  rail: CreditRail;
  /** Pesos actually charged, recorded so the webhook can verify what was
   *  agreed instead of recomputing it at a rate that has since moved. */
  copAmount?: number;
}): CreditPaymentMetadata {
  return {
    source: CREDIT_CHECKOUT_SOURCE,
    supabase_user_id: input.userId,
    credit_amount_cents: String(input.creditPackage.amountCents),
    credit_amount_micros: String(input.creditPackage.amountMicros),
    rail: input.rail,
    ...(input.copAmount ? { cop_amount: String(input.copAmount) } : {}),
  };
}

export function parseCreditPaymentMetadata(
  raw: Record<string, string | undefined> | null | undefined,
): {
  userId: string;
  creditPackage: CreditPackage;
  rail: CreditRail;
  /** What the customer agreed to pay in pesos, when the checkout recorded it.
   *  Absent on payments started before the rate became live. */
  copAmount: number | null;
} | null {
  if (raw?.source !== CREDIT_CHECKOUT_SOURCE) return null;
  const userId = raw.supabase_user_id?.trim();
  const amountCents = Number(raw.credit_amount_cents);
  const creditPackage = creditPackageFor(amountCents);
  const rail = normalizeCreditRail(raw.rail);
  if (!userId || !creditPackage || !rail) return null;
  if (Number(raw.credit_amount_micros) !== creditPackage.amountMicros) return null;
  const rawCop = Number(raw.cop_amount);
  const copAmount = Number.isFinite(rawCop) && rawCop > 0 ? rawCop : null;
  return { userId, creditPackage, rail, copAmount };
}

export async function grantPurchasedCredits(input: {
  userId: string;
  amountMicros: number;
  rail: CreditRail;
  providerPaymentId: string | null;
  checkoutId: string;
  idempotencyKey: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const sb = getSupabaseAdmin();
  if (!sb) throw new Error("Supabase admin not configured");
  const { error } = await sb.rpc("grant_ai_credits", {
    p_user_id: input.userId,
    p_amount_micros: input.amountMicros,
    p_rail: input.rail,
    p_provider_payment_id: input.providerPaymentId,
    p_checkout_id: input.checkoutId,
    p_idempotency_key: input.idempotencyKey,
    p_metadata: input.metadata ?? {},
  });
  if (error) throw new Error(`Could not grant AI credits: ${error.message}`);
}
