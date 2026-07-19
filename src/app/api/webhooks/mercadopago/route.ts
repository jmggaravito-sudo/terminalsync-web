import { NextResponse } from "next/server";
import { getPreapproval, mercadoPagoConfigured } from "@/lib/mercadopago";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Mercado Pago subscription webhook — the MP analogue of
 * /api/webhooks/stripe. MP notifies on preapproval (subscription) state
 * changes; we confirm the state with MP and then activate/revoke the Terminal
 * Sync subscription.
 *
 * ── STATUS: prototype skeleton ──────────────────────────────────────────
 * The CHECKOUT side (create a preapproval, redirect to init_point) is done in
 * /api/checkout/mercadopago. The remaining piece is subscription STATE:
 * `syncSubscriptionToSupabase` in src/lib/subscriptionsSync.ts takes a
 * `Stripe.Subscription` — it is Stripe-shaped, so an MP preapproval can't reuse
 * it directly. To ship MP in parallel, the `subscriptions` model needs to
 * become provider-agnostic:
 *   1. add a `provider` column ('stripe' | 'mercadopago') to `subscriptions`;
 *   2. extract a small provider-neutral upsert (userId, plan, status,
 *      providerCustomerId, providerSubscriptionId, provider) that BOTH the
 *      Stripe webhook and this one call.
 * Until that lands, this handler confirms the MP event and logs it, but does
 * NOT write subscription state — flagged below so nobody assumes it activates.
 *
 * MP also expects a fast 200 to stop retries, and a secret-based signature
 * check (x-signature) that must be wired before go-live.
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

  // TODO(go-live): verify the `x-signature` header against
  // MERCADOPAGO_WEBHOOK_SECRET before trusting the payload.

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

  if (!isPreapproval || !id) {
    // Not a subscription event we handle — ack and move on.
    return NextResponse.json({ received: true, handled: false }, { status: 200 });
  }

  const pre = await getPreapproval(id);
  if (!pre) {
    return NextResponse.json({ received: true, found: false }, { status: 200 });
  }

  // pre.status: "authorized" (active) | "paused" | "cancelled" | "pending".
  // pre.external_reference: the Supabase user id we set at checkout.
  //
  // ── ACTIVATION NOT WIRED YET ──
  // When `subscriptions` is provider-agnostic (see file header), do:
  //   if (pre.status === "authorized") upsertSubscription({
  //     userId: pre.external_reference, plan, status: 'active',
  //     provider: 'mercadopago', providerSubscriptionId: pre.id });
  //   else if (pre.status === "cancelled") revoke(...)
  // For now we only acknowledge, so state is never silently half-written.
  return NextResponse.json(
    { received: true, status: pre.status, activation: "pending-provider-agnostic-subscriptions" },
    { status: 200 },
  );
}
