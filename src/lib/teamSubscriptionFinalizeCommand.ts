import { isValidTeamSeatCount } from "@/lib/teamSeatLimits";
import {
  buildTeamCheckoutMetadata,
  buildVerifiedTeamCheckoutLedgerMetadata,
  type TeamCheckoutIntentIdentity,
  type TeamCheckoutTerms,
  type TeamCheckoutMetadata,
} from "@/lib/teamCheckoutMetadata";

export type TeamFinalizeIntent = TeamCheckoutIntentIdentity & {
  state: "reserved" | "checkout_created" | "ambiguous" | "completed" | "expired" | "canceled";
  stripe_subscription_id?: string | null;
};

/** Verified, minimal summaries only; neither value may come from request JSON. */
export type VerifiedTeamCheckoutSession = {
  id: string; mode: string; status: string | null; paymentStatus: string;
  livemode: boolean; customerId: string | null; subscriptionId: string | null;
  metadata: Record<string, string | undefined>;
};

export type TeamSubscriptionLifecycleProjection = {
  eventId: string;
  eventType: "customer.subscription.created" | "customer.subscription.updated" | "customer.subscription.deleted";
  eventCreatedAt: string;
  livemode: boolean;
  subscription: {
    id: string; livemode: boolean; customerId: string | null; status: string;
    priceId: string; quantity: number; currentPeriodStart: string | null;
    currentPeriodEnd: string | null; cancelAtPeriodEnd: boolean;
    metadata: Record<string, string | undefined>;
  };
};

export type TeamSubscriptionFinalizeCommand = {
  kind: "apply_team_checkout_billing_and_finalize";
  rpc: "apply_team_checkout_billing_and_finalize";
  args: {
    p_intent_id: string; p_stripe_session_id: string; p_user_id: string;
    p_stripe_customer_id: string; p_stripe_subscription_id: string;
    p_stripe_price_id: string; p_seat_count: number; p_status: string;
    p_current_period_start: string; p_current_period_end: string;
    p_cancel_at_period_end: boolean; p_event_id: string;
    p_event_type: TeamSubscriptionLifecycleProjection["eventType"];
    p_event_created_at: string; p_metadata: TeamCheckoutMetadata;
  };
};

const EVENT_ID = /^evt_[A-Za-z0-9_]+$/;
const STATUSES = new Set(["incomplete", "incomplete_expired", "trialing", "active", "past_due", "canceled", "unpaid", "paused"]);
const ID = { customer: /^cus_[A-Za-z0-9_]+$/, subscription: /^sub_[A-Za-z0-9_]+$/, session: /^cs_[A-Za-z0-9_]+$/ };

function fail(reason: string): never { throw new Error(`Invalid Team subscription finalize projection: ${reason}`); }
function timestamp(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value;
}
function sameMetadata(actual: Record<string, string | undefined>, expected: Record<string, string>): boolean {
  return Object.entries(expected).every(([key, value]) => actual[key] === value);
}

/**
 * Build only the migration 0051 allowlisted RPC command. Inputs must already be
 * independently verified Stripe projections plus a trusted database intent.
 * This function does not verify signatures, call Stripe, or access a database.
 */
export function buildTeamSubscriptionFinalizeCommand(
  event: TeamSubscriptionLifecycleProjection,
  intent: TeamFinalizeIntent,
  verifiedSession: VerifiedTeamCheckoutSession,
  terms: TeamCheckoutTerms,
): TeamSubscriptionFinalizeCommand {
  if (!event || typeof event !== "object" || !verifiedSession || typeof verifiedSession !== "object") fail("verified projections required");
  if (!EVENT_ID.test(event.eventId) || !timestamp(event.eventCreatedAt)) fail("invalid event identity or timestamp");
  if (typeof event.livemode !== "boolean" || event.subscription.livemode !== event.livemode || verifiedSession.livemode !== event.livemode) fail("livemode mismatch");
  if (!new Set(["customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted"]).has(event.eventType)) fail("unsupported event type");
  if (!["checkout_created", "ambiguous", "completed"].includes(intent.state)) fail("intent is not eligible for billing finalization");

  const baseMetadata = buildTeamCheckoutMetadata(intent, terms);
  if (!sameMetadata(event.subscription.metadata, baseMetadata) || !sameMetadata(verifiedSession.metadata, baseMetadata)) fail("pre-create Team metadata mismatch");

  const sub = event.subscription;
  const session = verifiedSession;
  if (!ID.session.test(session.id) || (intent.stripe_session_id && intent.stripe_session_id !== session.id)) fail("session binding mismatch");
  if (intent.state === "checkout_created" && !intent.stripe_session_id) fail("checkout-created intent has no bound session");
  if (intent.state === "completed" && (!intent.stripe_session_id || !intent.stripe_subscription_id)) fail("completed intent is missing durable bindings");
  if (session.mode !== "subscription" || session.status !== "complete" || !["paid", "unpaid", "no_payment_required"].includes(session.paymentStatus)) fail("verified Checkout Session is not a completed subscription session");
  if (!ID.customer.test(session.customerId ?? "") || !ID.subscription.test(session.subscriptionId ?? "") ||
      !ID.customer.test(sub.customerId ?? "") || !ID.subscription.test(sub.id) ||
      session.customerId !== sub.customerId || session.subscriptionId !== sub.id ||
      (intent.stripe_subscription_id && intent.stripe_subscription_id !== sub.id)) fail("session/subscription identity mismatch");
  if (sub.priceId !== intent.stripe_price_id || sub.priceId !== terms.configuredPriceId ||
      !isValidTeamSeatCount(sub.quantity) || sub.quantity !== intent.seats) fail("configured price or seat quantity mismatch");
  if (!STATUSES.has(sub.status) || typeof sub.cancelAtPeriodEnd !== "boolean") fail("invalid subscription status or cancellation flag");
  if (!timestamp(sub.currentPeriodStart) || !timestamp(sub.currentPeriodEnd) || Date.parse(sub.currentPeriodEnd) <= Date.parse(sub.currentPeriodStart)) fail("invalid subscription period timestamps");

  const metadata = buildVerifiedTeamCheckoutLedgerMetadata(intent, terms, {
    sessionId: session.id, customerId: session.customerId!, subscriptionId: sub.id,
  });
  return {
    kind: "apply_team_checkout_billing_and_finalize",
    rpc: "apply_team_checkout_billing_and_finalize",
    args: {
      p_intent_id: intent.id, p_stripe_session_id: session.id, p_user_id: intent.owner_user_id,
      p_stripe_customer_id: session.customerId!, p_stripe_subscription_id: sub.id,
      p_stripe_price_id: sub.priceId, p_seat_count: intent.seats, p_status: sub.status,
      p_current_period_start: sub.currentPeriodStart, p_current_period_end: sub.currentPeriodEnd,
      p_cancel_at_period_end: sub.cancelAtPeriodEnd, p_event_id: event.eventId,
      p_event_type: event.eventType, p_event_created_at: event.eventCreatedAt, p_metadata: metadata,
    },
  };
}
