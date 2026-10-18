import { TEAM_STRIPE_METADATA } from "@/lib/teamStripeMetadata";
import { isValidTeamSeatCount } from "@/lib/teamSeatLimits";

/** Trusted projection of a row returned by reserve_team_checkout_intent. */
export type TeamCheckoutIntentIdentity = {
  id: string;
  owner_user_id: string;
  request_id: string;
  stripe_price_id: string;
  seats: number;
  mode: string;
  idempotency_key: string;
  stripe_session_id?: string | null;
};

export type TeamCheckoutTerms = {
  /** Price ID selected by server configuration for this Stripe mode. */
  configuredPriceId: string;
  mode: "subscription";
};

export type TeamCheckoutMetadata = Record<string, string>;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PRICE_ID = /^price_[A-Za-z0-9]+$/;
const STRIPE_ID = /^(?:cs|cus|sub)_[A-Za-z0-9_]+$/;

function assertUuid(value: unknown, name: string): asserts value is string {
  if (typeof value !== "string" || !UUID.test(value)) throw new Error(`Invalid Team checkout ${name}`);
}

function assertStripeId(value: unknown, prefix: "cs" | "cus" | "sub", name: string): asserts value is string {
  if (typeof value !== "string" || !STRIPE_ID.test(value) || !value.startsWith(`${prefix}_`)) {
    throw new Error(`Invalid Team checkout ${name}`);
  }
}

function validateIntent(intent: TeamCheckoutIntentIdentity, terms: TeamCheckoutTerms): void {
  assertUuid(intent.id, "intent ID");
  assertUuid(intent.owner_user_id, "owner ID");
  assertUuid(intent.request_id, "request ID");
  if (!isValidTeamSeatCount(intent.seats)) throw new Error("Invalid Team checkout seat count");
  if (terms.mode !== "subscription" || intent.mode !== terms.mode) throw new Error("Invalid Team checkout mode");
  if (!PRICE_ID.test(terms.configuredPriceId) || intent.stripe_price_id !== terms.configuredPriceId) {
    throw new Error("Team checkout price does not match configured mode");
  }
  if (typeof intent.idempotency_key !== "string" || !/^team-checkout:[0-9a-f-]{36}$/i.test(intent.idempotency_key)) {
    throw new Error("Invalid Team checkout idempotency key");
  }
}

/**
 * Metadata safe to stamp before Stripe creates anything. These keys deliberately
 * exclude Session, Customer, and Subscription IDs; a client body is never input.
 */
export function buildTeamCheckoutMetadata(
  intent: TeamCheckoutIntentIdentity,
  terms: TeamCheckoutTerms,
): TeamCheckoutMetadata {
  validateIntent(intent, terms);
  return {
    plan: TEAM_STRIPE_METADATA.plan,
    source: TEAM_STRIPE_METADATA.source,
    team_billing_version: TEAM_STRIPE_METADATA.billingVersion,
    supabase_user_id: intent.owner_user_id,
    team_seat_count: String(intent.seats),
    team_checkout_intent_id: intent.id,
    team_checkout_owner_user_id: intent.owner_user_id,
    team_checkout_request_id: intent.request_id,
    team_checkout_price_id: intent.stripe_price_id,
    team_checkout_seats: String(intent.seats),
    team_checkout_mode: intent.mode,
    team_checkout_idempotency_key: intent.idempotency_key,
  };
}

/**
 * Ledger metadata for the post-create lifecycle. Call only after loading the
 * intent from the trusted DB and verifying the signed Stripe Session and
 * Subscription; arguments are identifiers extracted from those verified objects,
 * never caller-provided request data or raw Stripe payloads.
 */
export function buildVerifiedTeamCheckoutLedgerMetadata(
  intent: TeamCheckoutIntentIdentity,
  terms: TeamCheckoutTerms,
  verified: { sessionId: string; customerId: string; subscriptionId: string },
): TeamCheckoutMetadata {
  validateIntent(intent, terms);
  assertStripeId(verified.sessionId, "cs", "session ID");
  assertStripeId(verified.customerId, "cus", "customer ID");
  assertStripeId(verified.subscriptionId, "sub", "subscription ID");
  if (intent.stripe_session_id && intent.stripe_session_id !== verified.sessionId) {
    throw new Error("Team checkout session does not match intent");
  }
  return {
    team_checkout_intent_id: intent.id,
    team_checkout_session_id: verified.sessionId,
    team_checkout_owner_user_id: intent.owner_user_id,
    team_checkout_request_id: intent.request_id,
    team_checkout_price_id: intent.stripe_price_id,
    team_checkout_seats: String(intent.seats),
    team_checkout_mode: intent.mode,
    team_checkout_idempotency_key: intent.idempotency_key,
    team_checkout_customer_id: verified.customerId,
    team_checkout_subscription_id: verified.subscriptionId,
  };
}
