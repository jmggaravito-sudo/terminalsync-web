import type Stripe from "stripe";
import { getSupabaseAdmin } from "./supabaseAdmin";
import { includedAiPriceId, priceIdFor, stripe, type PlanId } from "./stripe";
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
  return [priceIdFor("pro"), priceIdFor("max")].filter(Boolean) as string[];
}

function findBaseItem(
  sub: Stripe.Subscription,
): Stripe.SubscriptionItem | undefined {
  const base = new Set(basePriceIds());
  return sub.items.data.find(
    (item) => item.price?.id && base.has(item.price.id),
  );
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

  const price = priceIdFor(input.plan);
  if (!price) throw new Error(`Missing Stripe price for plan "${input.plan}"`);
  const addOnPrice = input.includedAi ? includedAiPriceId() : null;
  if (input.includedAi && !addOnPrice) {
    throw new Error("Missing Stripe price for TerminalSync AI");
  }

  const existing = await stripe.subscriptions.retrieve(subId, {
    expand: ["items.data.price"],
  });
  const baseItem = findBaseItem(existing);
  const aiItem = findIncludedAiItem(existing);

  const items: Stripe.SubscriptionUpdateParams.Item[] = [];
  if (baseItem) items.push({ id: baseItem.id, price, quantity: 1 });
  else items.push({ price, quantity: 1 });

  if (addOnPrice) {
    if (aiItem) items.push({ id: aiItem.id, price: addOnPrice, quantity: 1 });
    else items.push({ price: addOnPrice, quantity: 1 });
  } else if (aiItem) {
    items.push({ id: aiItem.id, deleted: true });
  }

  const metadata: Stripe.MetadataParam = {
    ...(existing.metadata ?? {}),
    plan: input.plan,
    cycle: "monthly",
    source: "app.terminalsync/plan-change",
    supabase_user_id: input.userId,
  };
  if (input.includedAi) {
    metadata.included_ai = "1";
    metadata.add_ons = "included_ai";
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

  if (!input.includedAi) await revokeIncludedAiForUser(input.userId);
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
