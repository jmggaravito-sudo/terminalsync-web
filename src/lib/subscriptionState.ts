import { getSupabaseAdmin } from "./supabaseAdmin";

/**
 * Provider-neutral subscription state.
 *
 * The `subscriptions` table used to be written only from the Stripe webhook,
 * shaped around a `Stripe.Subscription`. To offer Mercado Pago as a parallel
 * payment rail we extract the actual DB write into ONE provider-agnostic
 * function that both webhooks call:
 *
 *   - src/lib/subscriptionsSync.ts (Stripe) adapts a `Stripe.Subscription`
 *     into `SubscriptionUpsertParams` and calls `upsertSubscription`.
 *   - src/app/api/webhooks/mercadopago adapts an MP preapproval the same way.
 *
 * This module knows nothing about Stripe or Mercado Pago types — only our own
 * plan/status enums and the `provider` discriminator (migration 0024).
 */

export type SubscriptionProvider = "stripe" | "mercadopago";

export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "unpaid";

export type SubscriptionPlan = "free" | "pro" | "max";

export interface SubscriptionUpsertParams {
  userId: string;
  provider: SubscriptionProvider;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  providerCustomerId?: string | null;
  providerSubscriptionId?: string | null;
  /** ISO strings; omit (undefined) to leave the existing column untouched. */
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd?: boolean;
  trialEnd?: string | null;
}

/**
 * Upsert the single subscription row for a user (conflict key `user_id`).
 * Writes the generic `provider*` columns for every provider, and additionally
 * keeps the legacy Stripe-named columns populated for Stripe rows so readers
 * mid-transition still resolve. Fields left `undefined` are NOT written, so a
 * partial update (e.g. a cancel event) doesn't clobber period boundaries.
 */
export async function upsertSubscription(
  params: SubscriptionUpsertParams,
): Promise<boolean> {
  const sb = getSupabaseAdmin();
  if (!sb) {
    console.warn("[subscriptions] admin client not configured — skipping upsert");
    return false;
  }

  const row: Record<string, unknown> = {
    user_id: params.userId,
    provider: params.provider,
    provider_customer_id: params.providerCustomerId ?? null,
    provider_subscription_id: params.providerSubscriptionId ?? null,
    plan: params.plan,
    status: params.status,
    updated_at: new Date().toISOString(),
  };

  // Back-compat: keep the Stripe-named columns filled for Stripe rows.
  if (params.provider === "stripe") {
    row.stripe_customer_id = params.providerCustomerId ?? null;
    row.stripe_subscription_id = params.providerSubscriptionId ?? null;
  }

  if (params.currentPeriodStart !== undefined) {
    row.current_period_start = params.currentPeriodStart;
  }
  if (params.currentPeriodEnd !== undefined) {
    row.current_period_end = params.currentPeriodEnd;
  }
  if (params.cancelAtPeriodEnd !== undefined) {
    row.cancel_at_period_end = params.cancelAtPeriodEnd;
  }
  if (params.trialEnd !== undefined) {
    row.trial_end = params.trialEnd;
  }

  const { error } = await sb
    .from("subscriptions")
    .upsert(row, { onConflict: "user_id" });

  if (error) {
    // Migration-safety net: the provider* columns (migration 0024) may not
    // exist yet if the code deploys before the migration runs. Rather than
    // break the LIVE Stripe path, detect the missing-column error, strip the
    // new columns, and retry with the legacy shape (the Stripe stripe_*
    // columns are still written, so Stripe keeps working). MP writes just
    // lose the provider tag until the migration lands.
    if (isMissingProviderColumn(error)) {
      console.warn(
        "[subscriptions] provider columns missing — retrying without them. APPLY migration 0024 (supabase db push).",
      );
      delete row.provider;
      delete row.provider_customer_id;
      delete row.provider_subscription_id;
      // A pure Mercado Pago row has no legacy columns to fall back on; skip
      // rather than write a Stripe-less row that can't be linked to a rail.
      if (params.provider !== "stripe") {
        console.error(
          "[subscriptions] cannot record Mercado Pago subscription until migration 0024 is applied",
          { userId: params.userId },
        );
        return false;
      }
      const retry = await sb
        .from("subscriptions")
        .upsert(row, { onConflict: "user_id" });
      if (retry.error) {
        console.error("[subscriptions] upsert failed (legacy retry)", {
          userId: params.userId,
          error: retry.error.message,
        });
        return false;
      }
    } else {
      console.error("[subscriptions] upsert failed", {
        provider: params.provider,
        userId: params.userId,
        error: error.message,
      });
      return false;
    }
  }
  console.log("[subscriptions] synced", {
    provider: params.provider,
    userId: params.userId,
    plan: params.plan,
    status: params.status,
  });
  return true;
}

/** True when a PostgREST error signals one of the migration-0024 columns is
 *  absent (deployed before the migration ran). Codes: PGRST204 (schema cache
 *  miss) or Postgres 42703 (undefined_column); message names the column. */
function isMissingProviderColumn(error: {
  code?: string;
  message?: string;
}): boolean {
  const code = error.code ?? "";
  if (code === "PGRST204" || code === "42703") return true;
  const msg = (error.message ?? "").toLowerCase();
  return (
    msg.includes("column") &&
    (msg.includes("provider") ||
      msg.includes("provider_customer_id") ||
      msg.includes("provider_subscription_id"))
  );
}

/** Downgrade a user to Free (subscription cancelled / revoked). Keeps the
 *  provider + provider_subscription_id for the record, flips plan→free,
 *  status→canceled. Provider-neutral: both webhooks' delete paths call it. */
export async function downgradeToFree(input: {
  userId: string;
  provider: SubscriptionProvider;
  providerSubscriptionId?: string | null;
}): Promise<boolean> {
  return upsertSubscription({
    userId: input.userId,
    provider: input.provider,
    plan: "free",
    status: "canceled",
    providerSubscriptionId: input.providerSubscriptionId ?? null,
    cancelAtPeriodEnd: false,
  });
}

/** Resolve a Terminal Sync account by the email a buyer entered at checkout.
 *  Shared fallback for web purchases that carry no user id (the visitor may
 *  not have been signed in). Provider-neutral — matches against `profiles`. */
export async function findUserIdByEmail(email: string): Promise<string | null> {
  const sb = getSupabaseAdmin();
  if (!sb) return null;
  const { data, error } = await sb
    .from("profiles")
    .select("id")
    .ilike("email", email)
    .maybeSingle();
  if (error) {
    console.error("[subscriptions] profile email lookup failed", {
      email,
      error: error.message,
    });
    return null;
  }
  return (data?.id as string | undefined) ?? null;
}
