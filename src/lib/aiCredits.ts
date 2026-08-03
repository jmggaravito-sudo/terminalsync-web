import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const CREDIT_CHECKOUT_SOURCE = "terminalsync_credits";
export const CREDIT_COP_PER_USD = 4_100;

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

export function copAmountForCreditPackage(
  creditPackage: CreditPackage,
  rate = CREDIT_COP_PER_USD,
): number {
  return Math.round((creditPackage.usd * rate) / 100) * 100;
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
}): CreditPaymentMetadata {
  return {
    source: CREDIT_CHECKOUT_SOURCE,
    supabase_user_id: input.userId,
    credit_amount_cents: String(input.creditPackage.amountCents),
    credit_amount_micros: String(input.creditPackage.amountMicros),
    rail: input.rail,
  };
}

export function parseCreditPaymentMetadata(
  raw: Record<string, string | undefined> | null | undefined,
): {
  userId: string;
  creditPackage: CreditPackage;
  rail: CreditRail;
} | null {
  if (raw?.source !== CREDIT_CHECKOUT_SOURCE) return null;
  const userId = raw.supabase_user_id?.trim();
  const amountCents = Number(raw.credit_amount_cents);
  const creditPackage = creditPackageFor(amountCents);
  const rail = normalizeCreditRail(raw.rail);
  if (!userId || !creditPackage || !rail) return null;
  if (Number(raw.credit_amount_micros) !== creditPackage.amountMicros) return null;
  return { userId, creditPackage, rail };
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
