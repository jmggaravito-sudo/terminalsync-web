import { NextResponse } from "next/server";
import {
  getPayment,
  getPreapproval,
  mercadoPagoConfigured,
  mercadoPagoWebhookSecretSet,
  mpIncludesAi,
  mpPlanFromPreapproval,
  mpStatusToSubscriptionStatus,
  verifyMpWebhookSignature,
} from "@/lib/mercadopago";
import {
  downgradeToFree,
  findUserIdByEmail,
  grantIncludedAi,
  revokeIncludedAiForMercadoPagoUser,
  upsertSubscription,
} from "@/lib/subscriptionState";
import {
  copAmountForCreditPackage,
  grantPurchasedCredits,
  parseCreditPaymentMetadata,
} from "@/lib/aiCredits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Mercado Pago subscription webhook — the MP analogue of
 * /api/webhooks/stripe. MP notifies on preapproval (subscription) state
 * changes; we confirm the state with MP, resolve the Terminal Sync account,
 * and write it through the SAME provider-neutral upsert the Stripe webhook
 * uses (src/lib/subscriptionState.ts). The `subscriptions` table carries a
 * `provider` column (migration 0024) so one row can describe either rail.
 *
 * Security: when MERCADOPAGO_WEBHOOK_SECRET is set, every request must carry a
 * valid `x-signature` (HMAC-SHA256, verified below) or it's rejected 401 — this
 * closes the spoofing window (a forged "authorized" notification can't activate
 * a subscription without paying). Until the secret is set (pre-go-live) the
 * handler processes but warns, so nothing breaks while it's being wired.
 *
 * Go-live checklist still open:
 *   - live MERCADOPAGO_ACCESS_TOKEN + MP preapproval plans
 *     (MERCADOPAGO_PLAN_PRO / _MAX) so plan resolution succeeds;
 *   - the currency/price-per-country decision lives ON the MP plans, not here.
 */

interface MpNotification {
  type?: string;
  action?: string;
  data?: { id?: string | number };
}

export async function POST(req: Request) {
  if (!mercadoPagoConfigured) {
    // Ack anyway so MP doesn't hammer retries at an unconfigured endpoint.
    return NextResponse.json({ received: true, configured: false }, { status: 200 });
  }

  const requestUrl = new URL(req.url);
  let body: MpNotification = {};
  try {
    body = (await req.json()) as MpNotification;
  } catch {
    // MP sometimes notifies via query string (?topic=&id=) — tolerate both.
    const id = requestUrl.searchParams.get("id") ?? undefined;
    const type =
      requestUrl.searchParams.get("type") ??
      requestUrl.searchParams.get("topic") ??
      undefined;
    body = { type, data: { id } };
  }

  const type =
    body.type ??
    requestUrl.searchParams.get("type") ??
    requestUrl.searchParams.get("topic") ??
    undefined;
  const isPreapproval =
    type === "subscription_preapproval" ||
    type === "preapproval" ||
    body.action?.startsWith("preapproval.") === true;
  const isPayment = type === "payment" || body.action?.startsWith("payment.") === true;
  const rawId = body.data?.id ?? requestUrl.searchParams.get("id") ?? undefined;
  const id = rawId === undefined || rawId === null ? undefined : String(rawId);

  // Signature gate. The signed manifest includes data.id, so verify after we
  // know it. Enforce only once the secret exists; warn (don't break) before.
  if (mercadoPagoWebhookSecretSet) {
    const ok = verifyMpWebhookSignature({
      xSignature: req.headers.get("x-signature"),
      xRequestId: req.headers.get("x-request-id"),
      dataId: id,
    });
    if (!ok) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  } else {
    if (isPayment) {
      // One-time credit grants are money. Do not process them before the MP
      // webhook secret is configured; 503 asks MP to retry after go-live
      // configuration instead of trusting a spoofable notification.
      return NextResponse.json(
        { error: "Mercado Pago webhook verification is not configured" },
        { status: 503 },
      );
    }
    console.warn(
      "[mercadopago] MERCADOPAGO_WEBHOOK_SECRET not set — processing webhook WITHOUT signature verification (set the secret before going live)",
    );
  }

  if (isPayment && id) {
    const payment = await getPayment(id);
    if (!payment) {
      return NextResponse.json(
        { received: false, error: "Payment lookup failed; retry required" },
        { status: 503 },
      );
    }
    const rawMetadata = Object.fromEntries(
      Object.entries(payment.metadata ?? {})
        .filter(([, value]) => value !== null && value !== undefined)
        .map(([key, value]) => [key, String(value)]),
    );
    const parsed = parseCreditPaymentMetadata(rawMetadata);
    if (!parsed) {
      return NextResponse.json({ received: true, handled: false }, { status: 200 });
    }
    if (payment.status !== "approved") {
      return NextResponse.json(
        { received: true, handled: true, granted: false, status: payment.status },
        { status: 200 },
      );
    }
    const expectedCop = copAmountForCreditPackage(parsed.creditPackage);
    if (
      parsed.rail !== "mercadopago" ||
      payment.external_reference !== parsed.userId ||
      payment.currency_id !== "COP" ||
      payment.transaction_amount !== expectedCop
    ) {
      console.error("[credits] Mercado Pago payment mismatch", {
        paymentId: String(payment.id),
        expectedUserId: parsed.userId,
        actualReference: payment.external_reference,
        expectedCop,
        actualAmount: payment.transaction_amount,
        currency: payment.currency_id,
      });
      return NextResponse.json(
        { received: false, error: "Credit payment verification failed" },
        { status: 409 },
      );
    }
    await grantPurchasedCredits({
      userId: parsed.userId,
      amountMicros: parsed.creditPackage.amountMicros,
      rail: "mercadopago",
      providerPaymentId: String(payment.id),
      checkoutId: `mercadopago:${payment.id}`,
      idempotencyKey: `mercadopago:${payment.id}`,
      metadata: {
        transaction_amount: payment.transaction_amount,
        currency: payment.currency_id,
        status: payment.status,
      },
    });
    console.log("[credits] Mercado Pago top-up granted", {
      userId: parsed.userId,
      paymentId: String(payment.id),
      amountMicros: parsed.creditPackage.amountMicros,
    });
    return NextResponse.json(
      { received: true, handled: true, granted: true },
      { status: 200 },
    );
  }

  if (!isPreapproval || !id) {
    // Not a subscription event we handle — ack and move on.
    return NextResponse.json({ received: true, handled: false }, { status: 200 });
  }

  const pre = await getPreapproval(id);
  if (!pre) {
    return NextResponse.json({ received: true, found: false }, { status: 200 });
  }

  // Resolve the Terminal Sync account. `external_reference` is what WE stamped
  // at checkout and MP echoes it back verbatim, so it's the reliable link key —
  // immune to the payer's MercadoPago-account email differing from their Terminal
  // Sync email (which is exactly what would otherwise make a Colombian client
  // "pay but stay Free"). It carries EITHER a Supabase user id (app / logged-in
  // web) OR the email the buyer typed on the site (anonymous landing). As a last
  // resort, fall back to the payer's MP-account email.
  let userId: string | null = null;
  const ref = pre.external_reference?.trim() ?? "";
  if (ref) {
    userId = ref.includes("@") ? await findUserIdByEmail(ref) : ref;
  }
  if (!userId && pre.payer_email) {
    userId = await findUserIdByEmail(pre.payer_email);
  }
  if (!userId) {
    console.warn(
      "[mercadopago→supabase] could not resolve account (no external_reference AND no matching profile by email) — subscription NOT linked",
      { preapprovalId: pre.id },
    );
    return NextResponse.json(
      { received: true, linked: false },
      { status: 200 },
    );
  }

  // Cancelled → downgrade to free. Everything else → upsert with the mapped
  // status/plan (authorized=active, pending=incomplete, paused=past_due).
  if (pre.status === "cancelled") {
    await downgradeToFree({
      userId,
      provider: "mercadopago",
      providerSubscriptionId: pre.id,
    });
    const includedAi = mpIncludesAi(pre);
    let includedAiWritten = false;
    if (includedAi) includedAiWritten = await revokeIncludedAiForMercadoPagoUser(userId);
    return NextResponse.json(
      { received: true, status: pre.status, action: "downgraded", includedAi, includedAiWritten },
      { status: 200 },
    );
  }

  const plan = mpPlanFromPreapproval(pre);
  if (!plan) {
    console.warn(
      "[mercadopago→supabase] could not classify plan (no matching amount / reason / plan_id)",
      {
        preapprovalId: pre.id,
        amount: pre.auto_recurring?.transaction_amount,
        reason: pre.reason,
      },
    );
    return NextResponse.json(
      { received: true, status: pre.status, plan: null, linked: false },
      { status: 200 },
    );
  }

  const status = mpStatusToSubscriptionStatus(pre.status);
  const ok = await upsertSubscription({
    userId,
    provider: "mercadopago",
    plan,
    status,
    providerSubscriptionId: pre.id,
  });
  const includedAi = mpIncludesAi(pre);
  let includedAiWritten = false;
  if (includedAi && status === "active") {
    includedAiWritten = await grantIncludedAi({ userId });
  } else if (includedAi && status === "canceled") {
    includedAiWritten = await revokeIncludedAiForMercadoPagoUser(userId);
  }

  return NextResponse.json(
    { received: true, status: pre.status, plan, includedAi, written: ok, includedAiWritten },
    { status: 200 },
  );
}
