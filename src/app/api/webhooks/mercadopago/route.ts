import { NextResponse } from "next/server";
import {
  getPreapproval,
  mercadoPagoConfigured,
  mercadoPagoWebhookSecretSet,
  mpPlanFromPreapprovalPlanId,
  mpStatusToSubscriptionStatus,
  verifyMpWebhookSignature,
} from "@/lib/mercadopago";
import {
  downgradeToFree,
  findUserIdByEmail,
  upsertSubscription,
} from "@/lib/subscriptionState";

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
  data?: { id?: string };
}

export async function POST(req: Request) {
  if (!mercadoPagoConfigured) {
    // Ack anyway so MP doesn't hammer retries at an unconfigured endpoint.
    return NextResponse.json({ received: true, configured: false }, { status: 200 });
  }

  let body: MpNotification = {};
  try {
    body = (await req.json()) as MpNotification;
  } catch {
    // MP sometimes notifies via query string (?topic=&id=) — tolerate both.
    const url = new URL(req.url);
    const id = url.searchParams.get("id") ?? undefined;
    const type = url.searchParams.get("topic") ?? undefined;
    body = { type, data: { id } };
  }

  const isPreapproval =
    body.type === "subscription_preapproval" || body.type === "preapproval";
  const id = body.data?.id;

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
    console.warn(
      "[mercadopago] MERCADOPAGO_WEBHOOK_SECRET not set — processing webhook WITHOUT signature verification (set the secret before going live)",
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

  // Resolve the Terminal Sync account: external_reference (the supabase user
  // id we stamped at checkout) is primary; fall back to matching the payer's
  // email against profiles for checkouts that carried no user id.
  let userId = pre.external_reference ?? null;
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
    return NextResponse.json(
      { received: true, status: pre.status, action: "downgraded" },
      { status: 200 },
    );
  }

  const plan = mpPlanFromPreapprovalPlanId(pre.preapproval_plan_id);
  if (!plan) {
    console.warn(
      "[mercadopago→supabase] unknown preapproval_plan_id — can't classify plan",
      { preapprovalId: pre.id, preapprovalPlanId: pre.preapproval_plan_id },
    );
    return NextResponse.json(
      { received: true, status: pre.status, plan: null, linked: false },
      { status: 200 },
    );
  }

  const ok = await upsertSubscription({
    userId,
    provider: "mercadopago",
    plan,
    status: mpStatusToSubscriptionStatus(pre.status),
    providerSubscriptionId: pre.id,
  });

  return NextResponse.json(
    { received: true, status: pre.status, plan, written: ok },
    { status: 200 },
  );
}
