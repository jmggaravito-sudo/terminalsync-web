import {
  buildTeamCheckoutMetadata,
  type TeamCheckoutIntentIdentity,
  type TeamCheckoutMetadata,
  type TeamCheckoutTerms,
} from "@/lib/teamCheckoutMetadata";
import { isValidTeamSeatCount } from "@/lib/teamSeatLimits";

export const TEAM_PRICE_CENTS = 5900;
export const TEAM_PRICE_CURRENCY = "usd";
export const TEAM_PRICE_INTERVAL = "month";

export type TeamCheckoutLanguage = "es" | "en";
export type TeamPaidCheckoutRequest = {
  requestId: string;
  seats: number;
  lang: TeamCheckoutLanguage;
};

export type ConfiguredTeamCheckoutTerms = TeamCheckoutTerms & {
  livemode: boolean;
};

export type TeamCheckoutIntentState =
  | "reserved"
  | "creating"
  | "checkout_created"
  | "ambiguous"
  | "completed"
  | "expired"
  | "canceled";

export type TeamCheckoutIntent = TeamCheckoutIntentIdentity & {
  state: TeamCheckoutIntentState;
};

export class TeamPaidCheckoutRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TeamPaidCheckoutRequestError";
  }
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PRICE_ID = /^price_[A-Za-z0-9]+$/;
const CHECKOUT_SESSION_ID = /^cs_[A-Za-z0-9_]+$/;
const INTENT_STATES = new Set<TeamCheckoutIntentState>([
  "reserved",
  "creating",
  "checkout_created",
  "ambiguous",
  "completed",
  "expired",
  "canceled",
]);
const ALLOWED_REQUEST_FIELDS = new Set(["requestId", "seats", "lang"]);

function record(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

/** Strictly parse request-owned fields. No caller may attach an account ID. */
export function parseTeamPaidCheckoutRequest(value: unknown): TeamPaidCheckoutRequest {
  const body = record(value);
  if (!body || Object.keys(body).some((key) => !ALLOWED_REQUEST_FIELDS.has(key))) {
    throw new TeamPaidCheckoutRequestError("Unsupported Team checkout request");
  }
  if (typeof body.requestId !== "string" || !UUID.test(body.requestId)) {
    throw new TeamPaidCheckoutRequestError("A valid Team checkout request ID is required");
  }
  if (!isValidTeamSeatCount(body.seats)) {
    throw new TeamPaidCheckoutRequestError("Team seat count must be an integer from 1 through 64");
  }
  if (body.lang !== undefined && body.lang !== "es" && body.lang !== "en") {
    throw new TeamPaidCheckoutRequestError("Unsupported Team checkout language");
  }
  return { requestId: body.requestId, seats: body.seats, lang: body.lang === "en" ? "en" : "es" };
}

/**
 * Select a Team Price only from server configuration and only for the exact
 * Stripe key mode used by the server. This matches the lifecycle parser's
 * STRIPE_PRICE_TEAM (live) / STRIPE_PRICE_TEAM_TEST (test) contract.
 */
export function configuredTeamCheckoutTerms(
  environment: Record<string, string | undefined> = process.env,
): ConfiguredTeamCheckoutTerms | null {
  const key = environment.STRIPE_SECRET_KEY?.trim();
  const livemode = key?.startsWith("sk_live_") ? true : key?.startsWith("sk_test_") ? false : null;
  if (livemode === null) return null;

  const configuredPriceId = (livemode
    ? environment.STRIPE_PRICE_TEAM
    : environment.STRIPE_PRICE_TEAM_TEST)?.trim();
  if (!configuredPriceId || !PRICE_ID.test(configuredPriceId)) return null;

  return { configuredPriceId, mode: "subscription", livemode };
}

/** Validate the configured provider Price before any Checkout Session create. */
export function isConfiguredTeamStripePrice(
  value: unknown,
  terms: ConfiguredTeamCheckoutTerms,
): boolean {
  const price = record(value);
  if (!price || price.deleted === true || price.id !== terms.configuredPriceId ||
      price.livemode !== terms.livemode || price.active !== true ||
      typeof price.currency !== "string" || price.currency.toLowerCase() !== TEAM_PRICE_CURRENCY ||
      price.unit_amount !== TEAM_PRICE_CENTS) return false;

  const recurring = record(price.recurring);
  return recurring?.interval === TEAM_PRICE_INTERVAL && recurring.interval_count === 1;
}

/** Validate the service-role RPC row before it can influence provider input. */
export function parseTeamCheckoutIntent(
  value: unknown,
  terms: TeamCheckoutTerms,
): TeamCheckoutIntent {
  const intent = record(value);
  if (!intent || typeof intent.state !== "string" || !INTENT_STATES.has(intent.state as TeamCheckoutIntentState)) {
    throw new Error("Invalid Team checkout intent state");
  }

  const identity: TeamCheckoutIntentIdentity = {
    id: intent.id as string,
    owner_user_id: intent.owner_user_id as string,
    request_id: intent.request_id as string,
    stripe_price_id: intent.stripe_price_id as string,
    seats: intent.seats as number,
    mode: intent.mode as string,
    idempotency_key: intent.idempotency_key as string,
    stripe_session_id: intent.stripe_session_id as string | null | undefined,
  };
  buildTeamCheckoutMetadata(identity, terms);

  return { ...identity, state: intent.state as TeamCheckoutIntentState };
}

export function metadataForTeamCheckoutIntent(
  intent: TeamCheckoutIntent,
  terms: TeamCheckoutTerms,
): TeamCheckoutMetadata {
  return buildTeamCheckoutMetadata(intent, terms);
}

export function isValidTeamCheckoutSession(value: unknown): value is { id: string; url: string } {
  const session = record(value);
  if (!session || typeof session.id !== "string" || !CHECKOUT_SESSION_ID.test(session.id) ||
      typeof session.url !== "string") return false;
  try {
    return new URL(session.url).protocol === "https:";
  } catch {
    return false;
  }
}

/** Reuse only an already-bound, still-open, metadata-exact Checkout Session. */
export function isResumableTeamCheckoutSession(
  value: unknown,
  intent: TeamCheckoutIntent,
  terms: ConfiguredTeamCheckoutTerms,
  metadata: TeamCheckoutMetadata,
): value is { id: string; url: string } {
  if (!isValidTeamCheckoutSession(value) || !intent.stripe_session_id || value.id !== intent.stripe_session_id) return false;
  const session = record(value);
  if (!session || session.mode !== "subscription" || session.status !== "open" || session.livemode !== terms.livemode) return false;
  const actualMetadata = record(session.metadata);
  return actualMetadata !== null && Object.entries(metadata).every(([key, expected]) => actualMetadata[key] === expected);
}
