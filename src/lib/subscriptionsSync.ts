import type Stripe from "stripe";
import { getSupabaseAdmin } from "./supabaseAdmin";

// Maps Stripe priceIds back to our internal plan enum. Driven by env vars
// so the same code works in test mode (via the *_TEST overrides the
// webhook will pick up when the event comes from a test-mode endpoint).
function planFromPriceId(priceId: string): "pro" | "dev" | null {
  const pmM = process.env.STRIPE_PRICE_PRO_MONTHLY;
  const pmY = process.env.STRIPE_PRICE_PRO_YEARLY;
  const dvM = process.env.STRIPE_PRICE_DEV_MONTHLY;
  const dvY = process.env.STRIPE_PRICE_DEV_YEARLY;
  const pmMt = process.env.STRIPE_PRICE_PRO_MONTHLY_TEST;
  const pmYt = process.env.STRIPE_PRICE_PRO_YEARLY_TEST;
  const dvMt = process.env.STRIPE_PRICE_DEV_MONTHLY_TEST;
  const dvYt = process.env.STRIPE_PRICE_DEV_YEARLY_TEST;
  if (priceId === pmM || priceId === pmY || priceId === pmMt || priceId === pmYt) {
    return "pro";
  }
  if (priceId === dvM || priceId === dvY || priceId === dvMt || priceId === dvYt) {
    return "dev";
  }
  return null;
}

type SupabaseStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "unpaid";

/** Stripe's status strings map 1:1 to our enum except `incomplete_expired`
 *  which we fold into `incomplete` since the state machine treats them the
 *  same downstream (no active access). */
function mapStatus(s: Stripe.Subscription.Status): SupabaseStatus {
  if (s === "incomplete_expired") return "incomplete";
  if (
    s === "active" ||
    s === "trialing" ||
    s === "past_due" ||
    s === "canceled" ||
    s === "incomplete" ||
    s === "unpaid"
  ) {
    return s;
  }
  // "paused" and any future Stripe statuses: safest default is past_due
  // (blocks access until manual review).
  return "past_due";
}

/** Upsert a subscription row into Supabase from a Stripe subscription
 *  object. Safe to call on every event — uses user_id as the conflict key
 *  (PK in subscriptions) so repeated events just overwrite the same row
 *  with the latest state. Returns true when a row was written. */
export async function syncSubscriptionToSupabase(
  sub: Stripe.Subscription,
): Promise<boolean> {
  const sb = getSupabaseAdmin();
  if (!sb) {
    console.warn(
      "[stripe→supabase] admin client not configured — skipping upsert",
    );
    return false;
  }

  const userId =
    (sub.metadata?.supabase_user_id as string | undefined) ??
    // Fallback to metadata on the first line item (attached at
    // checkout creation when using subscription_data.metadata).
    undefined;
  if (!userId) {
    console.warn(
      "[stripe→supabase] missing supabase_user_id in subscription metadata — can't link",
      { subscriptionId: sub.id, customer: sub.customer },
    );
    return false;
  }

  const priceId = sub.items.data[0]?.price?.id;
  const plan = priceId ? planFromPriceId(priceId) : null;
  if (!plan) {
    console.warn("[stripe→supabase] unknown priceId, defaulting to free", {
      subscriptionId: sub.id,
      priceId,
    });
    // Still upsert with plan=free so the user's existing row (if any)
    // reflects reality, but flag it. Better than silently leaving the
    // row stale.
  }

  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer.id;

  // Stripe moved period boundaries onto individual line items (one
  // subscription can now have multiple items with different cycles).
  // For single-item subscriptions ours, read from the first item.
  const firstItem = sub.items.data[0];
  const periodStart = firstItem?.current_period_start ?? null;
  const periodEnd = firstItem?.current_period_end ?? null;

  const row = {
    user_id: userId,
    stripe_customer_id: customerId,
    stripe_subscription_id: sub.id,
    plan: (plan ?? "free") as "pro" | "dev" | "free",
    status: mapStatus(sub.status),
    current_period_start: periodStart
      ? new Date(periodStart * 1000).toISOString()
      : null,
    current_period_end: periodEnd
      ? new Date(periodEnd * 1000).toISOString()
      : null,
    cancel_at_period_end: sub.cancel_at_period_end ?? false,
    trial_end: sub.trial_end
      ? new Date(sub.trial_end * 1000).toISOString()
      : null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await sb
    .from("subscriptions")
    .upsert(row, { onConflict: "user_id" });

  if (error) {
    console.error("[stripe→supabase] upsert failed", {
      subscriptionId: sub.id,
      error: error.message,
    });
    return false;
  }
  console.log("[stripe→supabase] subscription synced", {
    userId,
    plan: row.plan,
    status: row.status,
    periodEnd: row.current_period_end,
  });
  return true;
}

/** When a subscription gets deleted (cancellation completed), flip the
 *  user back to free plan. Terminals they created as Dev stay — the
 *  client-side canCreateTerminal() enforces cap only on NEW terminal
 *  creation, not on listing existing ones. */
export async function revokeSubscription(sub: Stripe.Subscription): Promise<boolean> {
  const sb = getSupabaseAdmin();
  if (!sb) return false;

  const userId = sub.metadata?.supabase_user_id as string | undefined;
  if (!userId) {
    console.warn(
      "[stripe→supabase] delete event missing supabase_user_id — can't revoke",
      { subscriptionId: sub.id },
    );
    return false;
  }

  const { error } = await sb
    .from("subscriptions")
    .upsert(
      {
        user_id: userId,
        stripe_subscription_id: sub.id,
        plan: "free",
        status: "canceled",
        cancel_at_period_end: false,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

  if (error) {
    console.error("[stripe→supabase] revoke failed", {
      subscriptionId: sub.id,
      error: error.message,
    });
    return false;
  }
  console.log("[stripe→supabase] subscription revoked → free", { userId });
  return true;
}
