import { teamJson } from "@/lib/teamApiResponse";
import { isTeamPaidCheckoutEnabled } from "@/lib/teamFeature";
import { verifiedTeamUser } from "@/lib/teamMetadata";
import {
  configuredTeamCheckoutTerms,
  isConfiguredTeamStripePrice,
  isResumableTeamCheckoutSession,
  isValidTeamCheckoutSession,
  metadataForTeamCheckoutIntent,
  parseTeamCheckoutIntent,
  parseTeamPaidCheckoutRequest,
  TeamPaidCheckoutRequestError,
  type TeamCheckoutIntent,
} from "@/lib/teamPaidCheckout";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { siteUrl, stripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

class TeamCheckoutRpcError extends Error {
  constructor(readonly providerMessage: string | null) {
    super("Team checkout metadata operation failed");
    this.name = "TeamCheckoutRpcError";
  }
}

function errorMessage(error: unknown): string | null {
  return error && typeof error === "object" && "message" in error && typeof error.message === "string"
    ? error.message
    : null;
}

/** Do not echo database/provider failures back to the browser. */
async function teamCheckoutRpc<T>(name: string, args: Record<string, unknown>): Promise<T> {
  let client;
  try {
    client = getSupabaseAdmin();
  } catch {
    throw new TeamCheckoutRpcError(null);
  }
  if (!client) throw new TeamCheckoutRpcError(null);

  try {
    const result = await client.rpc(name, args);
    if (result.error) throw new TeamCheckoutRpcError(errorMessage(result.error));
    return result.data as T;
  } catch (error) {
    if (error instanceof TeamCheckoutRpcError) throw error;
    throw new TeamCheckoutRpcError(null);
  }
}

function requiresReconciliation(error: unknown): boolean {
  return error instanceof TeamCheckoutRpcError
    && typeof error.providerMessage === "string"
    && /reconciliation|required|already in flight|terms conflict|state conflict|key mismatch|nonterminal paid/i.test(error.providerMessage);
}

function unavailable() {
  return teamJson({ error: "Team paid checkout is not available yet" }, { status: 503 });
}

function recoveryRequired() {
  return teamJson({
    error: "Team checkout requires reconciliation before another attempt",
    code: "team_checkout_reconciliation_required",
  }, { status: 409 });
}

function isBoundToVerifiedOwner(intent: TeamCheckoutIntent, ownerId: string, requestId: string): boolean {
  return intent.owner_user_id === ownerId && intent.request_id === requestId;
}

function teamReturnUrl(lang: "es" | "en"): string {
  return `${siteUrl().replace(/\/+$/, "")}/${lang}/team`;
}

/** Best-effort only: a create result is now unknown and must remain quarantined. */
async function markProviderAttemptAmbiguous(intent: TeamCheckoutIntent): Promise<void> {
  try {
    await teamCheckoutRpc("mark_team_checkout_intent_ambiguous", {
      p_intent_id: intent.id,
      p_idempotency_key: intent.idempotency_key,
    });
  } catch {
    // Preserve the fail-closed browser result even if the marker itself is unavailable.
  }
}

/**
 * Dedicated owner-bound Team checkout. This is deliberately separate from the
 * legacy /api/checkout route and has no Team trial, Pro, or Max behavior.
 *
 * The default-off gate is intentionally the first executable branch. While it
 * is off this handler does not authenticate, query metadata, inspect a Price,
 * retrieve a Checkout Session, or call Stripe.
 */
export async function POST(req: Request) {
  if (!isTeamPaidCheckoutEnabled()) return unavailable();

  let request;
  try {
    request = parseTeamPaidCheckoutRequest(await req.json());
  } catch (error) {
    if (error instanceof TeamPaidCheckoutRequestError || error instanceof SyntaxError) {
      return teamJson({ error: "Invalid Team checkout request" }, { status: 400 });
    }
    return teamJson({ error: "Invalid Team checkout request" }, { status: 400 });
  }

  const terms = configuredTeamCheckoutTerms();
  if (!terms || !stripe) return unavailable();

  let user;
  try {
    user = await verifiedTeamUser(req);
  } catch {
    return unavailable();
  }
  if (!user) return teamJson({ error: "Unauthorized" }, { status: 401 });

  let reserved: TeamCheckoutIntent;
  try {
    const result = await teamCheckoutRpc<unknown>("reserve_team_checkout_intent", {
      p_owner_user_id: user.id,
      p_request_id: request.requestId,
      p_stripe_price_id: terms.configuredPriceId,
      p_seats: request.seats,
      p_mode: "subscription",
    });
    reserved = parseTeamCheckoutIntent(result, terms);
    if (!isBoundToVerifiedOwner(reserved, user.id, request.requestId)) return unavailable();
  } catch (error) {
    return requiresReconciliation(error) ? recoveryRequired() : unavailable();
  }

  const metadata = metadataForTeamCheckoutIntent(reserved, terms);
  if (reserved.state === "checkout_created") {
    try {
      const session = await stripe.checkout.sessions.retrieve(reserved.stripe_session_id ?? "");
      if (!isResumableTeamCheckoutSession(session, reserved, terms, metadata)) return recoveryRequired();
      return teamJson({ url: session.url });
    } catch {
      return recoveryRequired();
    }
  }
  if (reserved.state !== "reserved") return recoveryRequired();

  // Validate the configured Price before claiming the irreversible create
  // attempt. A bad/missing configuration leaves a replayable reserved intent
  // because no provider create was attempted yet.
  try {
    const price = await stripe.prices.retrieve(terms.configuredPriceId);
    if (!isConfiguredTeamStripePrice(price, terms)) return unavailable();
  } catch {
    return unavailable();
  }

  let creating: TeamCheckoutIntent;
  try {
    const result = await teamCheckoutRpc<unknown>("begin_team_checkout_provider_attempt", {
      p_intent_id: reserved.id,
      p_idempotency_key: reserved.idempotency_key,
    });
    creating = parseTeamCheckoutIntent(result, terms);
    if (creating.state !== "creating" || creating.id !== reserved.id ||
        creating.idempotency_key !== reserved.idempotency_key ||
        !isBoundToVerifiedOwner(creating, user.id, request.requestId)) {
      return unavailable();
    }
  } catch (error) {
    return requiresReconciliation(error) ? recoveryRequired() : unavailable();
  }

  let session: unknown;
  try {
    session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: terms.configuredPriceId, quantity: creating.seats }],
      payment_method_collection: "always",
      success_url: teamReturnUrl(request.lang),
      cancel_url: teamReturnUrl(request.lang),
      locale: request.lang,
      metadata,
      // The separate 168-hour no-card Team trial never becomes a Stripe trial.
      subscription_data: { metadata },
    }, { idempotencyKey: creating.idempotency_key });
  } catch {
    await markProviderAttemptAmbiguous(creating);
    return recoveryRequired();
  }

  if (!isValidTeamCheckoutSession(session)) {
    await markProviderAttemptAmbiguous(creating);
    return recoveryRequired();
  }

  try {
    await teamCheckoutRpc("bind_team_checkout_session", {
      p_intent_id: creating.id,
      p_idempotency_key: creating.idempotency_key,
      p_stripe_session_id: session.id,
    });
  } catch {
    // A successful provider call followed by a failed/unknown binding cannot
    // be retried. Preserve an auditable ambiguous state for verified recovery.
    await markProviderAttemptAmbiguous(creating);
    return recoveryRequired();
  }

  return teamJson({ url: session.url });
}
