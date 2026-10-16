import "server-only";

import type Stripe from "stripe";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { stripe } from "@/lib/stripe";

export const VIDEO_EXCLUSIVE_PURPOSE = "video-exclusive";
export const CREDIT_FUNDING_PURPOSE_METADATA = "credit_funding_purpose";
export const VIDEO_EXCLUSIVE_ISSUER_METADATA = "video_funding_issuer_id";
export const VIDEO_EXCLUSIVE_DESTINATION_METADATA = "video_funding_destination";
export const VIDEO_EXCLUSIVE_CHECKOUT_QUOTE_METADATA = "video_exclusive_checkout_quote_id";
export const VIDEO_EXCLUSIVE_CHECKOUT_REQUEST_HASH_METADATA = "video_exclusive_checkout_request_hash";
const VIDEO_FUNDING_IDENTIFIER = /^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/;

export function isVideoExclusiveFundingEnabled(value = process.env.VIDEO_EXCLUSIVE_FUNDING_ENABLED): boolean {
  return ["1", "true", "yes"].includes(value?.trim().toLowerCase() ?? "");
}

/**
 * Server-only, fail-closed producer call. The Stripe route must pass the
 * cryptographically verified event and attest it matched the live webhook
 * secret; SQL independently requires live mode, an enabled feature setting,
 * and an explicitly enrolled issuer. This does not infer a legitimate issuer
 * or convert a general-credit payment.
 */
export async function allocateVideoExclusiveFunding(input: {
  event: Stripe.Event;
  session: Stripe.Checkout.Session;
  amountMicros: number;
  signatureVerifiedWithLiveSecret: boolean;
}): Promise<void> {
  const { event, session } = input;
  if (!isVideoExclusiveFundingEnabled()) throw new Error("Video exclusive funding is disabled");
  if (
    !input.signatureVerifiedWithLiveSecret ||
    event.livemode !== true ||
    (event.type !== "checkout.session.completed" &&
      event.type !== "checkout.session.async_payment_succeeded")
  ) {
    throw new Error("A live-signed, live-mode Stripe checkout event is required");
  }
  if (
    session.payment_status !== "paid" ||
    session.currency?.toLowerCase() !== "usd" ||
    !Number.isSafeInteger(input.amountMicros) || input.amountMicros <= 0 ||
    session.metadata?.[CREDIT_FUNDING_PURPOSE_METADATA] !== VIDEO_EXCLUSIVE_PURPOSE
  ) {
    throw new Error("Video-exclusive payment terms are not verified");
  }
  const issuerId = session.metadata?.[VIDEO_EXCLUSIVE_ISSUER_METADATA]?.trim();
  const destination = session.metadata?.[VIDEO_EXCLUSIVE_DESTINATION_METADATA]?.trim();
  const quoteId = session.metadata?.[VIDEO_EXCLUSIVE_CHECKOUT_QUOTE_METADATA]?.trim();
  const requestHash = session.metadata?.[VIDEO_EXCLUSIVE_CHECKOUT_REQUEST_HASH_METADATA]?.trim();
  const accountId = session.metadata?.supabase_user_id?.trim();
  const paymentId = typeof session.payment_intent === "string"
    ? session.payment_intent
    : session.payment_intent?.id;
  const configuredIssuer = process.env.VIDEO_FUNDING_SOURCE_ISSUER?.trim();
  const configuredDestination = process.env.VIDEO_FUNDING_SOURCE_DESTINATION?.trim();
  if (!issuerId || !accountId || !paymentId || !event.id || !quoteId || quoteId.length > 500 || /[\x00-\x1F\x7F]/.test(quoteId) || !requestHash || !/^[a-f0-9]{64}$/i.test(requestHash) ||
      !VIDEO_FUNDING_IDENTIFIER.test(issuerId) || !VIDEO_FUNDING_IDENTIFIER.test(destination ?? "") ||
      !VIDEO_FUNDING_IDENTIFIER.test(configuredIssuer ?? "") ||
      !VIDEO_FUNDING_IDENTIFIER.test(configuredDestination ?? "") ||
      issuerId !== configuredIssuer || destination !== configuredDestination) {
    throw new Error("Video-exclusive payment identity is incomplete");
  }

  // A signed webhook supplies a trusted existing session ID. Retrieve it from
  // Stripe before reconciling a creating/ambiguous durable intent; never infer
  // or synthesize a session ID/URL and never issue another create request here.
  if (!stripe) throw new Error("Video-exclusive session verification is unavailable");
  let verifiedSession: Stripe.Checkout.Session;
  try {
    verifiedSession = await stripe.checkout.sessions.retrieve(session.id);
  } catch {
    throw new Error("Video-exclusive session verification failed");
  }
  const verifiedMetadata = verifiedSession.metadata;
  const verifiedPaymentId = typeof verifiedSession.payment_intent === "string"
    ? verifiedSession.payment_intent
    : verifiedSession.payment_intent?.id;
  const expectedCents = input.amountMicros / 10_000;
  if (
    verifiedSession.id !== session.id ||
    verifiedPaymentId !== paymentId ||
    verifiedSession.livemode !== true ||
    verifiedSession.mode !== "payment" ||
    verifiedSession.payment_status !== "paid" ||
    verifiedSession.currency?.toLowerCase() !== "usd" ||
    verifiedSession.amount_total !== expectedCents ||
    verifiedMetadata?.source !== "terminalsync_credits" ||
    verifiedMetadata.credit_funding_purpose !== VIDEO_EXCLUSIVE_PURPOSE ||
    verifiedMetadata.supabase_user_id !== accountId ||
    verifiedMetadata.credit_amount_cents !== String(expectedCents) ||
    verifiedMetadata.credit_amount_micros !== String(input.amountMicros) ||
    verifiedMetadata.rail !== "stripe" ||
    verifiedMetadata[VIDEO_EXCLUSIVE_ISSUER_METADATA] !== issuerId ||
    verifiedMetadata[VIDEO_EXCLUSIVE_DESTINATION_METADATA] !== destination ||
    verifiedMetadata[VIDEO_EXCLUSIVE_CHECKOUT_QUOTE_METADATA] !== quoteId ||
    verifiedMetadata[VIDEO_EXCLUSIVE_CHECKOUT_REQUEST_HASH_METADATA] !== requestHash
  ) {
    throw new Error("Video-exclusive provider session does not match checkout terms");
  }

  const sb = getSupabaseAdmin();
  if (!sb) throw new Error("Supabase admin not configured");
  const { data: reconciled, error: reconcileError } = await sb.rpc("reconcile_video_exclusive_checkout", {
    p_account_id: accountId,
    p_quote_id: quoteId,
    p_request_hash: requestHash,
    p_stripe_session_id: verifiedSession.id,
    p_stripe_session_url: verifiedSession.url,
    p_issuer_id: issuerId,
    p_destination: destination,
    p_amount_cents: expectedCents,
    p_amount_micros: input.amountMicros,
    p_currency: verifiedSession.currency,
    p_mode: verifiedSession.mode,
    p_livemode: verifiedSession.livemode,
    p_payment_status: verifiedSession.payment_status,
    p_metadata: verifiedMetadata,
  });
  if (reconcileError || reconciled !== true) {
    throw new Error("Video-exclusive checkout reconciliation did not match");
  }
  const { error } = await sb.rpc("allocate_video_exclusive_funding_pinned", {
    p_signature_verified_live: true,
    p_event_livemode: true,
    p_source_event_id: event.id,
    p_provider_payment_id: verifiedPaymentId,
    p_account_id: accountId,
    p_issuer_id: issuerId,
    p_destination: destination,
    p_quote_id: quoteId,
    p_request_hash: requestHash,
    p_checkout_session_id: verifiedSession.id,
    p_purpose: VIDEO_EXCLUSIVE_PURPOSE,
    p_currency: "USD",
    p_amount_micros: input.amountMicros,
  });
  if (error) throw new Error("Could not allocate video-exclusive funding");
}
