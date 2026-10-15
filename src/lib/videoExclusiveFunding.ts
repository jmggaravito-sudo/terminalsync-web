import "server-only";

import type Stripe from "stripe";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const VIDEO_EXCLUSIVE_DESTINATION = "video-exclusive";
export const CREDIT_FUNDING_DESTINATION_METADATA = "credit_funding_destination";
export const VIDEO_EXCLUSIVE_ISSUER_METADATA = "video_funding_issuer_id";

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
    session.metadata?.[CREDIT_FUNDING_DESTINATION_METADATA] !== VIDEO_EXCLUSIVE_DESTINATION
  ) {
    throw new Error("Video-exclusive payment terms are not verified");
  }
  const issuerId = session.metadata?.[VIDEO_EXCLUSIVE_ISSUER_METADATA]?.trim();
  const accountId = session.metadata?.supabase_user_id?.trim();
  const paymentId = typeof session.payment_intent === "string"
    ? session.payment_intent
    : session.payment_intent?.id;
  if (!issuerId || !accountId || !paymentId || !event.id) {
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
    p_destination: VIDEO_EXCLUSIVE_DESTINATION,
    p_currency: "USD",
    p_amount_micros: input.amountMicros,
  });
  if (error) throw new Error(`Could not allocate video-exclusive funding: ${error.message}`);
}
