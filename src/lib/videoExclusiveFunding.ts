import "server-only";

import type Stripe from "stripe";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const VIDEO_EXCLUSIVE_PURPOSE = "video-exclusive";
export const CREDIT_FUNDING_PURPOSE_METADATA = "credit_funding_purpose";
export const VIDEO_EXCLUSIVE_ISSUER_METADATA = "video_funding_issuer_id";
export const VIDEO_EXCLUSIVE_DESTINATION_METADATA = "video_funding_destination";
export const VIDEO_EXCLUSIVE_CHECKOUT_REQUEST_METADATA = "video_exclusive_checkout_request_id";
const VIDEO_FUNDING_IDENTIFIER = /^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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
  const requestId = session.metadata?.[VIDEO_EXCLUSIVE_CHECKOUT_REQUEST_METADATA]?.trim();
  const accountId = session.metadata?.supabase_user_id?.trim();
  const paymentId = typeof session.payment_intent === "string"
    ? session.payment_intent
    : session.payment_intent?.id;
  const configuredIssuer = process.env.VIDEO_FUNDING_SOURCE_ISSUER?.trim();
  const configuredDestination = process.env.VIDEO_FUNDING_SOURCE_DESTINATION?.trim();
  if (!issuerId || !accountId || !paymentId || !event.id || !requestId || !UUID.test(requestId) ||
      !VIDEO_FUNDING_IDENTIFIER.test(issuerId) || !VIDEO_FUNDING_IDENTIFIER.test(destination ?? "") ||
      !VIDEO_FUNDING_IDENTIFIER.test(configuredIssuer ?? "") ||
      !VIDEO_FUNDING_IDENTIFIER.test(configuredDestination ?? "") ||
      issuerId !== configuredIssuer || destination !== configuredDestination) {
    throw new Error("Video-exclusive payment identity is incomplete");
  }

  const sb = getSupabaseAdmin();
  if (!sb) throw new Error("Supabase admin not configured");
  const { error } = await sb.rpc("allocate_video_exclusive_funding", {
    p_signature_verified_live: true,
    p_event_livemode: true,
    p_source_event_id: event.id,
    p_provider_payment_id: paymentId,
    p_account_id: accountId,
    p_issuer_id: issuerId,
    p_purpose: VIDEO_EXCLUSIVE_PURPOSE,
    p_currency: "USD",
    p_amount_micros: input.amountMicros,
  });
  if (error) throw new Error(`Could not allocate video-exclusive funding: ${error.message}`);
}
