import type Stripe from "stripe";
import { getSupabaseAdmin } from "./supabaseAdmin";
import { bundledPriceIdFor, includedAiPriceId, priceIdFor, stripe, type PlanId } from "./stripe";
import { mpAmountFor, updatePreapproval } from "./mercadopago";
import {
  grantIncludedAi,
  revokeIncludedAiForMercadoPagoUser,
  revokeIncludedAiForUser,
  upsertSubscription,
  type SubscriptionProvider,
  type SubscriptionStatus,
} from "./subscriptionState";
import { syncSubscriptionToSupabase } from "./subscriptionsSync";

const ACTIVE_STATUSES = new Set([
  "active",
  "trialing",
  "past_due",
  "incomplete",
  "unpaid",
]);

type CurrentSubscription = {
  provider: SubscriptionProvider | null;
  provider_subscription_id: string | null;
  provider_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  status: string | null;
  plan: string | null;
};

export class ExistingSubscriptionOnOtherRailError extends Error {
  constructor(provider: SubscriptionProvider) {
    super(
      provider === "mercadopago"
        ? "Tu suscripción actual está en Mercado Pago. Para evitar cobros duplicados, cambiá este plan desde Mercado Pago o contactanos y te ayudamos."
        : "Tu suscripción actual está en Stripe. Para evitar cobros duplicados, cambiá este plan desde Stripe o contactanos y te ayudamos.",
    );
    this.name = "ExistingSubscriptionOnOtherRailError";
  }
}

export async function getCurrentSubscriptionForUser(
  userId: string | undefined | null,
): Promise<CurrentSubscription | null> {
  if (!userId) return null;
  const sb = getSupabaseAdmin();
  if (!sb) return null;
  const { data, error } = await sb
    .from("subscriptions")
    .select(
      "provider,provider_subscription_id,provider_customer_id,stripe_subscription_id,stripe_customer_id,status,plan",
    )
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    console.warn("[plan-change] subscriptions lookup failed", {
      userId,
      error: error.message,
    });
    return null;
  }
  return (data as CurrentSubscription | null) ?? null;
}

export function isChangeableSubscription(
  sub: CurrentSubscription | null,
): boolean {
  if (!sub?.status) return false;
  return ACTIVE_STATUSES.has(sub.status);
}

export function subscriptionProvider(
  sub: CurrentSubscription,
): SubscriptionProvider {
  if (sub.provider === "mercadopago" || sub.provider === "stripe")
    return sub.provider;
  // Legacy rows before provider columns are Stripe when they carry Stripe ids.
  return "stripe";
}

function stripeSubscriptionId(sub: CurrentSubscription): string | null {
  return sub.provider_subscription_id ?? sub.stripe_subscription_id ?? null;
}

function stripeCustomerId(sub: CurrentSubscription): string | null {
  return sub.provider_customer_id ?? sub.stripe_customer_id ?? null;
}

function basePriceIds(): string[] {
  return [priceIdFor("pro"), priceIdFor("max"), bundledPriceIdFor("pro"), bundledPriceIdFor("max")].filter(Boolean) as string[];
}

function findIncludedAiItem(
  sub: Stripe.Subscription,
): Stripe.SubscriptionItem | undefined {
  const addOnPrice = includedAiPriceId();
  if (!addOnPrice) return undefined;
  return sub.items.data.find((item) => item.price?.id === addOnPrice);
}

export async function changeStripeSubscription(input: {
  userId: string;
  current: CurrentSubscription;
  plan: PlanId;
  includedAi: boolean;
}): Promise<Stripe.Subscription> {
  if (!stripe) throw new Error("Stripe not configured");
  const subId = stripeSubscriptionId(input.current);
  if (!subId)
    throw new Error("No active Stripe subscription found for this account");

  const includedAi = input.plan === "pro" || input.plan === "max";
  const price = includedAi ? bundledPriceIdFor(input.plan) : priceIdFor(input.plan);
  if (!price) throw new Error(`Missing Stripe price for plan "${input.plan}"`);

  const existing = await stripe.subscriptions.retrieve(subId, {
    expand: ["items.data.price"],
  });
  const baseItems = existing.items.data.filter((item) =>
    item.price?.id && basePriceIds().includes(item.price.id),
  );
  if (baseItems.length !== 1) {
    throw new Error("Cannot safely change a subscription without exactly one known plan item");
  }
  const baseItem = baseItems[0];
  const aiItem = findIncludedAiItem(existing);
  if (existing.items.data.some((item) => item.id !== baseItem.id && item.id !== aiItem?.id)) {
    throw new Error("Cannot safely change a subscription with unknown items");
  }

  const items: Stripe.SubscriptionUpdateParams.Item[] = [
    { id: baseItem.id, price, quantity: 1 },
  ];
  if (aiItem) {
    items.push({ id: aiItem.id, deleted: true });
  }

  const metadata: Stripe.MetadataParam = {
    ...(existing.metadata ?? {}),
    plan: input.plan,
    cycle: "monthly",
    source: "app.terminalsync/plan-change",
    supabase_user_id: input.userId,
  };
  if (includedAi) {
    metadata.included_ai = "1";
    metadata.add_ons = "";
  } else {
    metadata.included_ai = "0";
    metadata.add_ons = "";
  }

  const updated = await stripe.subscriptions.update(subId, {
    items,
    metadata,
    proration_behavior: "none",
    payment_behavior: "pending_if_incomplete",
    expand: ["items.data.price"],
  });
  await syncSubscriptionToSupabase(updated);

  if (!includedAi) await revokeIncludedAiForUser(input.userId);
  return updated;
}

export async function changeMercadoPagoSubscription(input: {
  userId: string;
  current: CurrentSubscription;
  plan: PlanId;
  includedAi: boolean;
}): Promise<void> {
  const preapprovalId = input.current.provider_subscription_id;
  if (!preapprovalId) {
    throw new Error(
      "No active Mercado Pago subscription found for this account",
    );
  }
  const amount = mpAmountFor(input.plan, input.includedAi);
  if (amount === null)
    throw new Error(`No Mercado Pago amount configured for "${input.plan}"`);
  const reason = `Terminal Sync ${input.plan === "max" ? "Max" : "Pro"}${input.includedAi ? " + IA" : ""}`;

  await updatePreapproval({ id: preapprovalId, amount, reason });
  await upsertSubscription({
    userId: input.userId,
    provider: "mercadopago",
    plan: input.plan === "max" ? "max" : "pro",
    status: (input.current.status as SubscriptionStatus) || "active",
    providerSubscriptionId: preapprovalId,
    aiIncluded: input.includedAi,
  });
  if (input.includedAi) await grantIncludedAi({ userId: input.userId });
  else await revokeIncludedAiForMercadoPagoUser(input.userId);
}

export function assertSameRailForChange(
  current: CurrentSubscription | null,
  expectedProvider: SubscriptionProvider,
): CurrentSubscription | null {
  if (!isChangeableSubscription(current)) return null;
  const provider = subscriptionProvider(current as CurrentSubscription);
  if (provider !== expectedProvider) {
    throw new ExistingSubscriptionOnOtherRailError(provider);
  }
  return current;
}
