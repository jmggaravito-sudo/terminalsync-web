import type Stripe from "stripe";
import { getSupabaseAdmin } from "./supabaseAdmin";
import { voiceStudioPriceId, type VoiceStudioSku } from "./voiceStudioStripe";

type PackSku = Extract<VoiceStudioSku, "pack4" | "pack8">;
type EntitlementSku = Exclude<VoiceStudioSku, "setup">;
type PaidEntitlement = {
  email: string;
  source_id: string;
  sku: EntitlementSku;
  starts_at: string;
  ends_at: string | null;
  video_total: number;
  short_total: number;
};

export class RetryableVoiceStudioEntitlementError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RetryableVoiceStudioEntitlementError";
  }
}

function paymentDate(unixSeconds: number): string {
  const date = new Date(unixSeconds * 1000);
  if (!Number.isSafeInteger(unixSeconds) || unixSeconds <= 0 || !Number.isFinite(date.getTime())) {
    throw new RetryableVoiceStudioEntitlementError("Voice Studio payment date is invalid");
  }
  return date.toISOString();
}

function billingEmail(raw: string | null | undefined): string {
  const email = typeof raw === "string" ? raw.trim().toLowerCase() : "";
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new RetryableVoiceStudioEntitlementError("Voice Studio billing email is missing or invalid");
  }
  return email;
}

async function persistPaidEntitlement(record: PaidEntitlement): Promise<void> {
  const db = getSupabaseAdmin();
  if (!db) {
    throw new RetryableVoiceStudioEntitlementError("Voice Studio entitlement database is unavailable");
  }
  try {
    const { error } = await db.from("voice_studio_entitlements").upsert(record, {
      onConflict: "source_id",
      // Retries must not update the existing grant, especially its used quota.
      ignoreDuplicates: true,
    });
    if (error) {
      throw new RetryableVoiceStudioEntitlementError(
        `Voice Studio entitlement write failed (${error.code || "unknown"})`,
      );
    }
  } catch (error) {
    if (error instanceof RetryableVoiceStudioEntitlementError) throw error;
    throw new RetryableVoiceStudioEntitlementError("Voice Studio entitlement write failed");
  }
}

export async function provisionVoiceStudioCheckout(
  session: Stripe.Checkout.Session,
  eventCreated: number,
): Promise<void> {
  const sku = session.metadata?.sku;
  // The setup is not a production credit. Packs come only from invoice.paid,
  // never from a separate checkout event for the same billing period.
  if (
    session.metadata?.business !== "voice-studio" ||
    (sku !== "trial" && sku !== "single") ||
    session.mode !== "payment" ||
    session.payment_status !== "paid" ||
    (session.amount_total ?? 0) <= 0
  ) return;
  if (session.livemode !== true || !session.id?.startsWith("cs_")) {
    throw new RetryableVoiceStudioEntitlementError("Voice Studio live checkout payload is invalid");
  }
  await persistPaidEntitlement({
    email: billingEmail(session.customer_details?.email ?? session.customer_email),
    source_id: session.id,
    sku,
    starts_at: paymentDate(eventCreated),
    ends_at: null,
    video_total: 1,
    short_total: 0,
  });
}

function packPriceIds(): Map<string, PackSku> {
  const entries = new Map<string, PackSku>();
  for (const sku of ["pack4", "pack8"] as const) {
    const price = voiceStudioPriceId(sku);
    if (price) entries.set(price, sku);
  }
  return entries;
}

function invoiceLinePriceId(line: Stripe.InvoiceLineItem): string | null {
  const price = line.pricing?.price_details?.price;
  return typeof price === "string" ? price : price?.id ?? null;
}

export function isVoiceStudioInvoice(invoice: Stripe.Invoice): boolean {
  // The subscription marker still identifies our events when the pack price
  // environment variables are temporarily missing or invoice lines paginate.
  if (invoice.parent?.subscription_details?.metadata?.business === "voice-studio") return true;
  const prices = packPriceIds();
  return invoice.lines?.data?.some((line) => prices.has(invoiceLinePriceId(line) ?? "")) ?? false;
}

export function isVoiceStudioSubscription(subscription: Stripe.Subscription): boolean {
  if (subscription.metadata?.business === "voice-studio") return true;
  const prices = packPriceIds();
  return subscription.items?.data?.some((item) => prices.has(item.price?.id ?? "")) ?? false;
}

export async function provisionVoiceStudioInvoice(
  invoice: Stripe.Invoice,
  getCustomerEmail: (customerId: string) => Promise<string | null>,
  listLines: (invoiceId: string) => Promise<Stripe.InvoiceLineItem[]>,
): Promise<void> {
  if (
    invoice.status !== "paid" ||
    (invoice.amount_paid ?? 0) <= 0 ||
    (invoice.billing_reason !== "subscription_create" && invoice.billing_reason !== "subscription_cycle")
  ) return;
  if (invoice.livemode !== true || !invoice.id?.startsWith("in_")) {
    throw new RetryableVoiceStudioEntitlementError("Voice Studio live invoice payload is invalid");
  }

  const prices = packPriceIds();
  let lines: Stripe.InvoiceLineItem[];
  try {
    lines = invoice.lines?.has_more ? await listLines(invoice.id) : invoice.lines?.data ?? [];
  } catch {
    throw new RetryableVoiceStudioEntitlementError("Voice Studio invoice lines unavailable");
  }
  const candidates = lines.flatMap((line) => {
    const sku = prices.get(invoiceLinePriceId(line) ?? "");
    return sku && line.parent?.type === "subscription_item_details" &&
      line.parent.subscription_item_details?.proration === false &&
      line.quantity === 1 && line.amount > 0 ? [{ sku, line }] : [];
  });
  if (candidates.length !== 1) {
    throw new RetryableVoiceStudioEntitlementError(
      "Voice Studio paid invoice must contain exactly one eligible pack line",
    );
  }
  const { sku, line } = candidates[0];
  const declaredSku = invoice.parent?.subscription_details?.metadata?.sku;
  if (declaredSku && declaredSku !== sku) {
    throw new RetryableVoiceStudioEntitlementError("Voice Studio invoice SKU and price disagree");
  }
  if (!line.period || line.period.end <= line.period.start) {
    throw new RetryableVoiceStudioEntitlementError("Voice Studio pack billing period is invalid");
  }
  const startsAt = paymentDate(line.period.start);
  const endsAt = paymentDate(line.period.end);
  const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
  let rawEmail = invoice.customer_email;
  if (!rawEmail && customerId) {
    try {
      rawEmail = await getCustomerEmail(customerId);
    } catch {
      throw new RetryableVoiceStudioEntitlementError("Voice Studio Stripe customer unavailable");
    }
  }
  const email = billingEmail(rawEmail);
  const total = sku === "pack4" ? 4 : 8;
  await persistPaidEntitlement({
    email,
    source_id: invoice.id,
    sku,
    starts_at: startsAt,
    ends_at: endsAt,
    video_total: total,
    short_total: total,
  });
}
