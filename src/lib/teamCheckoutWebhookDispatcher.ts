import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import {
  buildTeamCheckoutWebhookCommand,
  type TeamCheckoutWebhookEventProjection,
} from "@/lib/teamCheckoutWebhookCommand";
import {
  buildTeamSubscriptionFinalizeCommand,
  type TeamFinalizeIntent,
  type TeamSubscriptionLifecycleProjection,
  type VerifiedTeamCheckoutSession,
} from "@/lib/teamSubscriptionFinalizeCommand";
import type { TeamCheckoutTerms } from "@/lib/teamCheckoutMetadata";
import {
  configuredTeamCheckoutTerms,
  parseTeamCheckoutIntent,
} from "@/lib/teamPaidCheckout";
import {
  parseTeamStripeSubscription,
  type TeamStripeEventType,
} from "@/lib/teamStripeLifecycle";

const CHECKOUT_SESSION_EVENT_TYPES = new Set([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.expired",
  "checkout.session.async_payment_failed",
]);
const SUBSCRIPTION_EVENT_TYPES = new Set<TeamStripeEventType>([
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
]);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const INTENT_SELECT = [
  "id",
  "owner_user_id",
  "request_id",
  "stripe_price_id",
  "seats",
  "mode",
  "idempotency_key",
  "state",
  "stripe_session_id",
  "stripe_subscription_id",
  "billing_sync_status",
].join(",");

type CheckoutSessionEventType = TeamCheckoutWebhookEventProjection["eventType"];
type LoadedIntent = TeamFinalizeIntent & { billing_sync_status: string | null };

export type TeamCheckoutWebhookDispatchResult =
  | "pending_billing_sync"
  | "pending_reconciliation"
  | "completed"
  | "expired"
  | "canceled"
  | "terminal_noop";

/** The signed Stripe payload or durable binding is invalid; retrying cannot repair it. */
export class InvalidTeamCheckoutWebhookEventError extends Error {
  constructor(message = "Invalid Team checkout webhook event") {
    super(message);
    this.name = "InvalidTeamCheckoutWebhookEventError";
  }
}

/** A provider/database dependency is unavailable or delivery must wait for a signed Session event. */
export class RetryableTeamCheckoutWebhookError extends Error {
  constructor(message = "Team checkout webhook finalization requires retry") {
    super(message);
    this.name = "RetryableTeamCheckoutWebhookError";
  }
}

function record(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function invalid(message: string): never {
  throw new InvalidTeamCheckoutWebhookEventError(message);
}

function metadataRecord(value: unknown): Record<string, string | undefined> {
  const source = record(value);
  if (!source) invalid("Team checkout metadata is invalid");
  const metadata: Record<string, string | undefined> = {};
  for (const [key, entry] of Object.entries(source)) {
    if (typeof entry !== "string" && entry !== undefined) {
      invalid("Team checkout metadata is invalid");
    }
    metadata[key] = entry;
  }
  return metadata;
}

function linkedStripeId(value: unknown): string | null {
  if (typeof value === "string") return value;
  const item = record(value);
  return typeof item?.id === "string" ? item.id : null;
}

function eventTimestamp(event: Stripe.Event): string {
  if (!Number.isSafeInteger(event.created) || event.created <= 0) {
    invalid("Team checkout event timestamp is invalid");
  }
  return new Date(event.created * 1000).toISOString();
}

function routeIntentId(metadata: Record<string, string | undefined>): string {
  const value = metadata.team_checkout_intent_id;
  if (typeof value !== "string" || !UUID.test(value)) {
    invalid("Team checkout route intent metadata is invalid");
  }
  return value;
}

function configuredTerms(event: Stripe.Event): TeamCheckoutTerms {
  if (typeof event.livemode !== "boolean") invalid("Team checkout event mode is invalid");
  const terms = configuredTeamCheckoutTerms();
  if (!terms || terms.livemode !== event.livemode) {
    // These values are local rollout configuration, not provider payload.
    // A valid signed delivery must remain retryable while an operator restores
    // its mode-specific Team terms; otherwise Stripe would stop retrying a
    // fulfillment event that has not reached any side-effect boundary.
    throw new RetryableTeamCheckoutWebhookError("Team checkout terms are unavailable or mode-mismatched");
  }
  return terms;
}

function rpcResult(value: unknown): string | null {
  if (typeof value === "string") return value;
  const result = record(value);
  return typeof result?.result === "string" ? result.result : null;
}

async function teamRpc(name: string, args: Record<string, unknown>, expected: readonly string[]): Promise<string> {
  let client;
  try {
    client = getSupabaseAdmin();
  } catch {
    throw new RetryableTeamCheckoutWebhookError();
  }
  if (!client) throw new RetryableTeamCheckoutWebhookError();

  let response: { data: unknown; error: unknown };
  try {
    response = await client.rpc(name, args);
  } catch {
    throw new RetryableTeamCheckoutWebhookError();
  }
  if (response.error) throw new RetryableTeamCheckoutWebhookError();
  const result = rpcResult(response.data);
  if (!result || !expected.includes(result)) {
    throw new RetryableTeamCheckoutWebhookError("Team checkout RPC returned an unknown result");
  }
  return result;
}

function parseLoadedIntent(value: unknown, terms: TeamCheckoutTerms): LoadedIntent {
  try {
    const intent = parseTeamCheckoutIntent(value, terms);
    const raw = record(value);
    const subscriptionId = raw?.stripe_subscription_id;
    const billingStatus = raw?.billing_sync_status;
    if (subscriptionId !== null && subscriptionId !== undefined && typeof subscriptionId !== "string") {
      invalid("Team checkout intent subscription binding is invalid");
    }
    if (billingStatus !== null && billingStatus !== undefined && typeof billingStatus !== "string") {
      invalid("Team checkout billing synchronization state is invalid");
    }
    return {
      ...intent,
      stripe_subscription_id: subscriptionId ?? null,
      billing_sync_status: billingStatus ?? null,
    };
  } catch (error) {
    if (error instanceof InvalidTeamCheckoutWebhookEventError) throw error;
    invalid("Trusted Team checkout intent is invalid");
  }
}

async function loadIntent(intentId: string, terms: TeamCheckoutTerms): Promise<LoadedIntent> {
  let client;
  try {
    client = getSupabaseAdmin();
  } catch {
    throw new RetryableTeamCheckoutWebhookError();
  }
  if (!client) throw new RetryableTeamCheckoutWebhookError();

  let response: { data: unknown; error: unknown };
  try {
    response = await client
      .from("team_checkout_intents")
      .select(INTENT_SELECT)
      .eq("id", intentId)
      .maybeSingle();
  } catch {
    throw new RetryableTeamCheckoutWebhookError();
  }
  if (response.error) throw new RetryableTeamCheckoutWebhookError();
  if (!response.data) invalid("Team checkout intent was not found");
  return parseLoadedIntent(response.data, terms);
}

function checkoutSessionProjection(event: Stripe.Event): TeamCheckoutWebhookEventProjection {
  if (!CHECKOUT_SESSION_EVENT_TYPES.has(event.type)) {
    invalid("Unsupported Team Checkout Session event");
  }
  const session = event.data.object as Stripe.Checkout.Session;
  return {
    eventId: event.id,
    eventType: event.type as CheckoutSessionEventType,
    eventCreatedAt: eventTimestamp(event),
    livemode: event.livemode,
    session: {
      id: session.id,
      mode: session.mode,
      status: session.status,
      paymentStatus: session.payment_status,
      livemode: session.livemode,
      customerId: linkedStripeId(session.customer),
      subscriptionId: linkedStripeId(session.subscription),
      metadata: metadataRecord(session.metadata),
    },
  };
}

function verifiedSessionProjection(value: unknown): VerifiedTeamCheckoutSession {
  const session = value as Stripe.Checkout.Session;
  return {
    id: session.id,
    mode: session.mode,
    status: session.status,
    paymentStatus: session.payment_status,
    livemode: session.livemode,
    customerId: linkedStripeId(session.customer),
    subscriptionId: linkedStripeId(session.subscription),
    metadata: metadataRecord(session.metadata),
  };
}

function subscriptionProjection(event: Stripe.Event): TeamSubscriptionLifecycleProjection {
  if (!SUBSCRIPTION_EVENT_TYPES.has(event.type as TeamStripeEventType)) {
    invalid("Unsupported Team subscription event");
  }
  let parsed;
  try {
    parsed = parseTeamStripeSubscription(event as Stripe.Event & {
      type: TeamStripeEventType;
      data: { object: Stripe.Subscription };
    });
  } catch {
    invalid("Team subscription lifecycle metadata is invalid");
  }
  const subscription = event.data.object as Stripe.Subscription;
  return {
    eventId: parsed.eventId,
    eventType: parsed.eventType,
    eventCreatedAt: parsed.eventCreatedAt,
    livemode: parsed.livemode,
    subscription: {
      id: parsed.subscriptionId,
      livemode: subscription.livemode,
      customerId: parsed.customerId,
      status: parsed.status,
      priceId: parsed.priceId,
      quantity: parsed.seatCount,
      currentPeriodStart: parsed.currentPeriodStart,
      currentPeriodEnd: parsed.currentPeriodEnd,
      cancelAtPeriodEnd: parsed.cancelAtPeriodEnd,
      metadata: metadataRecord(subscription.metadata),
    },
  };
}

function buildSessionCommand(
  projection: TeamCheckoutWebhookEventProjection,
  intent: LoadedIntent,
  terms: TeamCheckoutTerms,
) {
  try {
    return buildTeamCheckoutWebhookCommand(projection, intent, terms);
  } catch {
    invalid("Team Checkout Session does not match the durable intent");
  }
}

function buildFinalizeCommand(
  projection: TeamSubscriptionLifecycleProjection,
  intent: LoadedIntent,
  session: VerifiedTeamCheckoutSession,
  terms: TeamCheckoutTerms,
) {
  try {
    return buildTeamSubscriptionFinalizeCommand(projection, intent, session, terms);
  } catch {
    invalid("Team subscription does not match the verified Checkout Session");
  }
}

function terminalIntent(state: LoadedIntent["state"]): boolean {
  return state === "completed" || state === "expired" || state === "canceled";
}

async function dispatchCheckoutSession(event: Stripe.Event, terms: TeamCheckoutTerms): Promise<TeamCheckoutWebhookDispatchResult> {
  const projection = checkoutSessionProjection(event);
  let intent = await loadIntent(routeIntentId(projection.session.metadata), terms);
  let command = buildSessionCommand(projection, intent, terms);

  if (terminalIntent(intent.state)) return "terminal_noop";

  // A crash after the one allowed provider create may leave no session ID.
  // Only this independently signed, metadata-exact Session event can bind it;
  // subscription payload metadata is never used to invent a Session binding.
  if ((intent.state === "creating" || intent.state === "ambiguous") && !intent.stripe_session_id) {
    await teamRpc("bind_team_checkout_session", {
      p_intent_id: intent.id,
      p_idempotency_key: intent.idempotency_key,
      p_stripe_session_id: projection.session.id,
    }, ["checkout_created", "ambiguous"]);
    intent = await loadIntent(intent.id, terms);
    command = buildSessionCommand(projection, intent, terms);
    if (terminalIntent(intent.state)) return "terminal_noop";
  }

  if (intent.state !== "checkout_created" && intent.state !== "ambiguous") {
    invalid("Team Checkout Session intent state is not eligible for marking");
  }

  const expected = command.kind === "release_expired_session"
    ? ["expired", "canceled"]
    : ["pending_billing_sync", "completed"];
  const result = await teamRpc(command.rpc, command.args, expected);
  return result as TeamCheckoutWebhookDispatchResult;
}

async function dispatchSubscriptionLifecycle(event: Stripe.Event, terms: TeamCheckoutTerms): Promise<TeamCheckoutWebhookDispatchResult> {
  // Stripe's signed event object is the authoritative historical subscription
  // snapshot. Do not replace it with a mutable `subscriptions.retrieve()`
  // result: that could make a valid delayed event disagree with a newer state
  // and defeat the ledger's monotonic event-ordering safeguards. We retrieve
  // only the durable Checkout Session because it is absent from subscription
  // events and is needed to prove the route-issued binding.
  const projection = subscriptionProjection(event);
  const intentId = routeIntentId(projection.subscription.metadata);
  const intent = await loadIntent(intentId, terms);

  if (terminalIntent(intent.state) && intent.state !== "completed") return "terminal_noop";
  if ((intent.state === "creating" || intent.state === "ambiguous") && !intent.stripe_session_id) {
    // Ordering is deliberately retryable: wait for the signed Checkout Session
    // event rather than list/reconstruct a Session from subscription metadata.
    throw new RetryableTeamCheckoutWebhookError("Team checkout Session binding is not yet available");
  }
  if (intent.state !== "checkout_created" && intent.state !== "ambiguous" && intent.state !== "completed") {
    invalid("Team subscription intent state is not eligible for finalization");
  }
  if (!intent.stripe_session_id) invalid("Team subscription intent is missing a Checkout Session binding");
  if (!stripe) throw new RetryableTeamCheckoutWebhookError();

  let retrieved: Stripe.Checkout.Session;
  try {
    retrieved = await stripe.checkout.sessions.retrieve(intent.stripe_session_id);
  } catch {
    throw new RetryableTeamCheckoutWebhookError();
  }
  const command = buildFinalizeCommand(
    projection,
    intent,
    verifiedSessionProjection(retrieved),
    terms,
  );
  const result = await teamRpc(command.rpc, command.args, ["completed", "pending_reconciliation"]);
  return result as TeamCheckoutWebhookDispatchResult;
}

/**
 * Execute only the dedicated Team Checkout path after Stripe signature
 * verification and the default-off route gate. It never invokes the legacy
 * Team adapter or the Pro/Max subscription handlers.
 */
export async function dispatchTeamCheckoutWebhook(event: Stripe.Event): Promise<TeamCheckoutWebhookDispatchResult> {
  const terms = configuredTerms(event);
  if (CHECKOUT_SESSION_EVENT_TYPES.has(event.type)) return dispatchCheckoutSession(event, terms);
  if (SUBSCRIPTION_EVENT_TYPES.has(event.type as TeamStripeEventType)) {
    return dispatchSubscriptionLifecycle(event, terms);
  }
  invalid("Unsupported Team checkout webhook event");
}
