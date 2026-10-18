import type { TeamCheckoutIntentIdentity, TeamCheckoutTerms } from "@/lib/teamCheckoutMetadata";
import { TEAM_STRIPE_METADATA } from "@/lib/teamStripeMetadata";
import { isValidTeamSeatCount } from "@/lib/teamSeatLimits";

/**
 * A minimal projection that the caller must derive only after successful Stripe
 * webhook signature verification. This module performs no signature verification
 * and deliberately makes no runtime provenance claim; do not pass request data.
 */
export type TeamCheckoutWebhookEventProjection = {
  eventId: string;
  eventType: "checkout.session.completed" | "checkout.session.async_payment_succeeded" |
    "checkout.session.expired" | "checkout.session.async_payment_failed";
  eventCreatedAt: string;
  livemode: boolean;
  session: {
    id: string;
    mode: string;
    status: string | null;
    paymentStatus: string;
    livemode: boolean;
    customerId: string | null;
    subscriptionId: string | null;
    metadata: Record<string, string | undefined>;
  };
};

type MarkerCommand = {
  kind: "mark_session_pending" | "release_expired_session" | "mark_async_failed";
  rpc: "mark_team_checkout_session_pending" | "release_team_checkout_expired_session" | "mark_team_checkout_async_failed";
  args: { p_intent_id: string; p_stripe_session_id: string };
};
export type TeamCheckoutWebhookCommand = MarkerCommand;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const STRIPE_EVENT_ID = /^evt_[A-Za-z0-9_]+$/;

function fail(message: string): never { throw new Error(`Invalid Team checkout event projection: ${message}`); }
function validTimestamp(value: string): boolean {
  return Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value;
}

function validateIntent(intent: TeamCheckoutIntentIdentity, terms: TeamCheckoutTerms): void {
  if (!UUID.test(intent.id) || !UUID.test(intent.owner_user_id) || !UUID.test(intent.request_id) ||
      !isValidTeamSeatCount(intent.seats) || intent.mode !== "subscription" ||
      terms.mode !== "subscription" || intent.stripe_price_id !== terms.configuredPriceId ||
      !/^price_[A-Za-z0-9]+$/.test(terms.configuredPriceId) ||
      !/^team-checkout:[0-9a-f-]{36}$/i.test(intent.idempotency_key)) fail("trusted intent or configured terms invalid");
}

function validateSessionMetadata(metadata: Record<string, string | undefined>, intent: TeamCheckoutIntentIdentity): void {
  if (metadata.plan !== TEAM_STRIPE_METADATA.plan || metadata.source !== TEAM_STRIPE_METADATA.source ||
      metadata.team_billing_version !== TEAM_STRIPE_METADATA.billingVersion ||
      metadata.supabase_user_id !== intent.owner_user_id || metadata.team_seat_count !== String(intent.seats) ||
      metadata.team_checkout_intent_id !== intent.id || metadata.team_checkout_owner_user_id !== intent.owner_user_id ||
      metadata.team_checkout_request_id !== intent.request_id || metadata.team_checkout_price_id !== intent.stripe_price_id ||
      metadata.team_checkout_seats !== String(intent.seats) || metadata.team_checkout_mode !== intent.mode ||
      metadata.team_checkout_idempotency_key !== intent.idempotency_key) fail("metadata does not bind the trusted intent");
}

/**
 * Pure marker construction for Checkout Session events. Async success remains
 * pending here; only a separately verified customer.subscription event may
 * construct/apply the atomic billing-finalize command in future wiring.
 */
export function buildTeamCheckoutWebhookCommand(
  event: TeamCheckoutWebhookEventProjection,
  intent: TeamCheckoutIntentIdentity,
  terms: TeamCheckoutTerms,
): TeamCheckoutWebhookCommand {
  if (!event || typeof event !== "object") fail("projection required");
  if (!STRIPE_EVENT_ID.test(event.eventId) || !validTimestamp(event.eventCreatedAt)) fail("invalid event identity or timestamp");
  if (typeof event.livemode !== "boolean" || event.session.livemode !== event.livemode) fail("mode mismatch");
  validateIntent(intent, terms);
  if (!/^cs_[A-Za-z0-9_]+$/.test(event.session.id) ||
      (intent.stripe_session_id && intent.stripe_session_id !== event.session.id)) fail("session binding mismatch");
  if (event.session.mode !== "subscription") fail("session mode mismatch");
  validateSessionMetadata(event.session.metadata, intent);

  const args = { p_intent_id: intent.id, p_stripe_session_id: event.session.id };
  if (event.eventType === "checkout.session.completed") {
    if (event.session.status !== "complete" ||
        !["paid", "unpaid", "no_payment_required"].includes(event.session.paymentStatus)) fail("completed session status mismatch");
    return { kind: "mark_session_pending", rpc: "mark_team_checkout_session_pending", args };
  }
  if (event.eventType === "checkout.session.async_payment_succeeded") {
    if (event.session.status !== "complete" || event.session.paymentStatus !== "paid" ||
        !/^cus_[A-Za-z0-9_]+$/.test(event.session.customerId ?? "") ||
        !/^sub_[A-Za-z0-9_]+$/.test(event.session.subscriptionId ?? "")) fail("async success session status or billing identity mismatch");
    return { kind: "mark_session_pending", rpc: "mark_team_checkout_session_pending", args };
  }
  if (event.eventType === "checkout.session.expired") {
    if (event.session.status !== "expired" || event.session.paymentStatus === "paid") fail("expired session status mismatch");
    return { kind: "release_expired_session", rpc: "release_team_checkout_expired_session", args };
  }
  if (event.eventType === "checkout.session.async_payment_failed") {
    if (event.session.status !== "complete" || event.session.paymentStatus !== "unpaid") fail("async failure session status mismatch");
    return { kind: "mark_async_failed", rpc: "mark_team_checkout_async_failed", args };
  }
  return fail("unsupported event type");
}
