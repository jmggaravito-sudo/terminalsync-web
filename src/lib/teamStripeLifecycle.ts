import type Stripe from "stripe";
import { envId } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

/** Stable server-stamped metadata contract for Team subscriptions. */
export const TEAM_STRIPE_METADATA = {
  plan: "team",
  source: "terminalsync_team",
  billingVersion: "1",
} as const;

export type TeamStripeEventType =
  | "customer.subscription.created"
  | "customer.subscription.updated"
  | "customer.subscription.deleted";

export type TeamStripeSyncCommand = {
  eventId: string;
  eventType: TeamStripeEventType;
  livemode: boolean;
  userId: string;
  customerId: string;
  subscriptionId: string;
  priceId: string;
  seatCount: number;
  status: Stripe.Subscription.Status;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  trialEnd: string | null;
  cancelAtPeriodEnd: boolean;
};

export class InvalidTeamStripeEventError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidTeamStripeEventError";
  }
}

export class TeamStripeSyncError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TeamStripeSyncError";
  }
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TEAM_EVENT_TYPES = new Set<string>([
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
]);

function configuredTeamPriceIds(): string[] {
  return [envId("STRIPE_PRICE_TEAM"), envId("STRIPE_PRICE_TEAM_TEST")].filter(
    (value): value is string => Boolean(value),
  );
}

function hasTeamIntent(metadata: Stripe.Metadata | null | undefined): boolean {
  return metadata?.plan === TEAM_STRIPE_METADATA.plan ||
    metadata?.source === TEAM_STRIPE_METADATA.source ||
    metadata?.team_billing_version === TEAM_STRIPE_METADATA.billingVersion;
}

function hasConfiguredTeamPrice(subscription: Stripe.Subscription): boolean {
  const teamPrices = new Set(configuredTeamPriceIds());
  return subscription.items.data.some((item) => teamPrices.has(item.price.id));
}

/**
 * Detect Team before legacy subscription handlers. Metadata is the primary
 * discriminator; configured Team price IDs are also recognized so a malformed
 * or missing metadata payload cannot fall through and downgrade Pro/Max.
 */
export function isTeamSubscriptionCandidate(
  event: Stripe.Event,
): event is Stripe.Event & { type: TeamStripeEventType; data: { object: Stripe.Subscription } } {
  if (!TEAM_EVENT_TYPES.has(event.type)) return false;
  const subscription = event.data.object as Stripe.Subscription;
  return hasTeamIntent(subscription.metadata) || hasConfiguredTeamPrice(subscription);
}

/** Team-marked Checkout Sessions are rejected until the Team checkout and its
 * no-card trial/entitlement lifecycle are enabled together. */
export function isTeamCheckoutCandidate(event: Stripe.Event): boolean {
  if (event.type !== "checkout.session.completed" && event.type !== "checkout.session.async_payment_succeeded") {
    return false;
  }
  const session = event.data.object as Stripe.Checkout.Session;
  return hasTeamIntent(session.metadata);
}

function customerIdOf(subscription: Stripe.Subscription): string | null {
  const customer = subscription.customer;
  return typeof customer === "string" ? customer : customer?.id ?? null;
}

function epochToIso(value: number | null | undefined): string | null {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0
    ? new Date(value * 1000).toISOString()
    : null;
}

/** Parse and validate all billing identity fields before invoking any DB write. */
export function parseTeamStripeSubscription(
  event: Stripe.Event & { type: TeamStripeEventType; data: { object: Stripe.Subscription } },
): TeamStripeSyncCommand {
  const subscription = event.data.object;
  const metadata = subscription.metadata;
  if (typeof event.livemode !== "boolean" || subscription.livemode !== event.livemode) {
    throw new InvalidTeamStripeEventError("Team Stripe event mode mismatch");
  }
  if (
    metadata?.plan !== TEAM_STRIPE_METADATA.plan ||
    metadata?.source !== TEAM_STRIPE_METADATA.source ||
    metadata?.team_billing_version !== TEAM_STRIPE_METADATA.billingVersion
  ) {
    throw new InvalidTeamStripeEventError("Team Stripe metadata contract mismatch");
  }
  const userId = metadata.supabase_user_id;
  if (!userId || !UUID.test(userId)) {
    throw new InvalidTeamStripeEventError("Team Stripe event has no valid user binding");
  }
  const seatText = metadata.team_seat_count;
  if (!seatText || !/^[1-9]\d*$/.test(seatText)) {
    throw new InvalidTeamStripeEventError("Team Stripe event has invalid seat metadata");
  }
  const seatCount = Number(seatText);
  if (!Number.isSafeInteger(seatCount) || seatCount < 1) {
    throw new InvalidTeamStripeEventError("Team Stripe event seat count is out of range");
  }
  const customerId = customerIdOf(subscription);
  if (!customerId || !subscription.id || !event.id) {
    throw new InvalidTeamStripeEventError("Team Stripe event is missing a billing identity");
  }
  if (subscription.items.data.length !== 1) {
    throw new InvalidTeamStripeEventError("Team Stripe subscription must have exactly one price item");
  }
  const item = subscription.items.data[0];
  const price = item.price;
  const expectedPriceId = event.livemode
    ? envId("STRIPE_PRICE_TEAM")
    : envId("STRIPE_PRICE_TEAM_TEST");
  if (!expectedPriceId || price.id !== expectedPriceId) {
    throw new InvalidTeamStripeEventError("Team Stripe price does not match the configured mode");
  }
  if (
    price.currency.toLowerCase() !== "usd" ||
    price.unit_amount !== 5900 ||
    price.recurring?.interval !== "month" ||
    price.recurring.interval_count !== 1
  ) {
    throw new InvalidTeamStripeEventError("Team Stripe price must be USD $59 per month");
  }
  if (item.quantity !== seatCount) {
    throw new InvalidTeamStripeEventError("Team Stripe price quantity does not match seat metadata");
  }
  if (!Number.isSafeInteger(event.created) || event.created <= 0) {
    throw new InvalidTeamStripeEventError("Team Stripe event timestamp is invalid");
  }

  const firstItem = subscription.items.data[0];
  const currentPeriodStart = epochToIso(firstItem.current_period_start);
  const currentPeriodEnd = epochToIso(firstItem.current_period_end);
  if (!currentPeriodStart || !currentPeriodEnd || Date.parse(currentPeriodEnd) <= Date.parse(currentPeriodStart)) {
    throw new InvalidTeamStripeEventError("Team Stripe billing period is invalid");
  }
  if (subscription.status === "trialing" && !epochToIso(subscription.trial_end)) {
    throw new InvalidTeamStripeEventError("Team Stripe trial end is missing");
  }
  return {
    eventId: event.id,
    eventType: event.type,
    livemode: event.livemode,
    userId,
    customerId,
    subscriptionId: subscription.id,
    priceId: price.id,
    seatCount,
    status: subscription.status,
    currentPeriodStart,
    currentPeriodEnd,
    trialEnd: epochToIso(subscription.trial_end),
    cancelAtPeriodEnd: subscription.cancel_at_period_end === true,
  };
}

/**
 * Invoke the future, service-role-only atomic DB RPC. It must validate that
 * userId exists, bind Stripe customer/subscription uniquely, serialize
 * duplicate/out-of-order events by eventId, and update only Team membership
 * rows—never `subscriptions.plan`. Missing migration/RPC is an error so the
 * webhook returns 5xx and Stripe retries; it is not acknowledged as success.
 */
export async function syncTeamStripeSubscription(command: TeamStripeSyncCommand): Promise<void> {
  const sb = getSupabaseAdmin();
  if (!sb) throw new TeamStripeSyncError("Team Stripe service-role database client is unavailable");

  const { data, error } = await sb.rpc("sync_team_subscription_event", {
    p_event_id: command.eventId,
    p_event_type: command.eventType,
    p_livemode: command.livemode,
    p_user_id: command.userId,
    p_stripe_customer_id: command.customerId,
    p_stripe_subscription_id: command.subscriptionId,
    p_stripe_price_id: command.priceId,
    p_seat_count: command.seatCount,
    p_status: command.status,
    p_current_period_start: command.currentPeriodStart,
    p_current_period_end: command.currentPeriodEnd,
    p_trial_end: command.trialEnd,
    p_cancel_at_period_end: command.cancelAtPeriodEnd,
  });
  if (error) {
    throw new TeamStripeSyncError(`Team Stripe entitlement sync failed: ${error.message}`);
  }
  const result = typeof data === "string" ? data : (data as { result?: unknown } | null)?.result;
  if (result !== "ok" && result !== "duplicate") {
    throw new TeamStripeSyncError("Team Stripe entitlement RPC returned an unknown result");
  }
}
