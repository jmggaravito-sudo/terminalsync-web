import type Stripe from "stripe";
import { getSupabaseAdmin } from "./supabaseAdmin";
import { stripe, envId } from "./stripe";
import {
  downgradeToFree,
  upsertSubscription,
  type SubscriptionStatus,
} from "./subscriptionState";

type SupabaseAdmin = NonNullable<ReturnType<typeof getSupabaseAdmin>>;

/** Fetch the email attached to a subscription's Stripe customer.
 *  The Subscription object usually carries only the customer id, so we
 *  retrieve the customer unless it arrived already expanded. */
async function customerEmail(sub: Stripe.Subscription): Promise<string | null> {
  if (typeof sub.customer !== "string") {
    if ("deleted" in sub.customer && sub.customer.deleted) return null;
    const expanded = (sub.customer as Stripe.Customer).email;
    if (expanded) return expanded;
  }
  if (!stripe) return null;
  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  try {
    const c = await stripe.customers.retrieve(customerId);
    if (c.deleted) return null;
    return c.email ?? null;
  } catch (err) {
    console.error("[stripe→supabase] customers.retrieve failed", {
      customerId,
      err: err instanceof Error ? err.message : err,
    });
    return null;
  }
}

/**
 * Resolve the Terminal Sync account (Supabase user id) a subscription
 * belongs to.
 *
 *  1. **Metadata (primary):** `supabase_user_id` is stamped into the
 *     subscription metadata at checkout creation when the purchase started
 *     from the desktop app (which knows the signed-in user).
 *  2. **Email cross-match (fallback):** purchases started from the marketing
 *     site's pricing buttons carry NO metadata — the visitor may not even be
 *     signed in. We match the email the buyer entered at Stripe checkout
 *     against `profiles`. On a hit we ALSO backfill the subscription metadata
 *     so every later event (updated / deleted / cancel) links directly.
 *
 *  Returns null only when the account genuinely can't be identified (paid
 *  with an email that has no Terminal Sync profile yet) — the caller logs it
 *  loudly for manual reconciliation.
 */
async function resolveUserId(
  sb: SupabaseAdmin,
  sub: Stripe.Subscription,
): Promise<string | null> {
  const fromMeta = sub.metadata?.supabase_user_id as string | undefined;
  if (fromMeta) return fromMeta;

  const email = await customerEmail(sub);
  if (!email) return null;

  const { data, error } = await sb
    .from("profiles")
    .select("id")
    .ilike("email", email)
    .maybeSingle();
  if (error) {
    console.error("[stripe→supabase] profile email lookup failed", {
      email,
      error: error.message,
    });
    return null;
  }
  const userId = (data?.id as string | undefined) ?? null;
  if (!userId) return null;

  // Backfill so future lifecycle events + revoke-on-cancel link by metadata
  // without repeating this lookup (revokeSubscription reads metadata only).
  if (stripe) {
    try {
      await stripe.subscriptions.update(sub.id, {
        metadata: { ...(sub.metadata ?? {}), supabase_user_id: userId },
      });
    } catch (err) {
      console.warn("[stripe→supabase] metadata backfill failed (non-fatal)", {
        subscriptionId: sub.id,
        err: err instanceof Error ? err.message : err,
      });
    }
  }
  console.log("[stripe→supabase] linked subscription via email cross-match", {
    subscriptionId: sub.id,
  });
  return userId;
}

// Maps Stripe priceIds back to our internal plan enum. Driven by env vars
// so the same code works in test mode (via the *_TEST overrides the
// webhook will pick up when the event comes from a test-mode endpoint).
//
// Legacy STRIPE_PRICE_DEV_* env vars are still read as a fallback during
// the Dev→Max rename rollout — same prices, different env names.
function planFromPriceId(priceId: string): "pro" | "max" | null {
  const pmM = envId("STRIPE_PRICE_PRO_MONTHLY");
  const pmY = envId("STRIPE_PRICE_PRO_YEARLY");
  const mxM = envId("STRIPE_PRICE_MAX_MONTHLY", "STRIPE_PRICE_DEV_MONTHLY");
  const mxY = envId("STRIPE_PRICE_MAX_YEARLY", "STRIPE_PRICE_DEV_YEARLY");
  const pmMt = envId("STRIPE_PRICE_PRO_MONTHLY_TEST");
  const pmYt = envId("STRIPE_PRICE_PRO_YEARLY_TEST");
  const mxMt = envId("STRIPE_PRICE_MAX_MONTHLY_TEST", "STRIPE_PRICE_DEV_MONTHLY_TEST");
  const mxYt = envId("STRIPE_PRICE_MAX_YEARLY_TEST", "STRIPE_PRICE_DEV_YEARLY_TEST");
  if (priceId === pmM || priceId === pmY || priceId === pmMt || priceId === pmYt) {
    return "pro";
  }
  if (priceId === mxM || priceId === mxY || priceId === mxMt || priceId === mxYt) {
    return "max";
  }
  return null;
}

/** Stripe's status strings map 1:1 to our enum except `incomplete_expired`
 *  which we fold into `incomplete` since the state machine treats them the
 *  same downstream (no active access). */
function mapStatus(s: Stripe.Subscription.Status): SubscriptionStatus {
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

  const userId = await resolveUserId(sb, sub);
  if (!userId) {
    console.warn(
      "[stripe→supabase] could not resolve account (no metadata AND the checkout email had no matching profile) — subscription NOT linked, needs manual reconciliation",
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

  // Adapt the Stripe object into the provider-neutral shape and hand off the
  // actual DB write to upsertSubscription (shared with the Mercado Pago rail).
  return upsertSubscription({
    userId,
    provider: "stripe",
    plan: plan ?? "free",
    status: mapStatus(sub.status),
    providerCustomerId: customerId,
    providerSubscriptionId: sub.id,
    currentPeriodStart: periodStart
      ? new Date(periodStart * 1000).toISOString()
      : null,
    currentPeriodEnd: periodEnd
      ? new Date(periodEnd * 1000).toISOString()
      : null,
    cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
    trialEnd: sub.trial_end
      ? new Date(sub.trial_end * 1000).toISOString()
      : null,
  });
}

/** When a subscription gets deleted (cancellation completed), flip the
 *  user back to free plan. Terminals they created as Dev stay — the
 *  client-side canCreateTerminal() enforces cap only on NEW terminal
 *  creation, not on listing existing ones. */
export async function revokeSubscription(sub: Stripe.Subscription): Promise<boolean> {
  const sb = getSupabaseAdmin();
  if (!sb) return false;

  const userId = await resolveUserId(sb, sub);
  if (!userId) {
    console.warn(
      "[stripe→supabase] delete event: could not resolve account (no metadata AND no matching profile by email) — can't revoke",
      { subscriptionId: sub.id },
    );
    return false;
  }

  return downgradeToFree({
    userId,
    provider: "stripe",
    providerSubscriptionId: sub.id,
  });
}
