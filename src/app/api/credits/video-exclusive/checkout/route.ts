import { NextResponse } from "next/server";
import { authenticate } from "@/lib/marketplace/auth";
import { corsHeaders, preflight } from "@/lib/cors";
import { creditPackageFor, normalizeCreditLang } from "@/lib/aiCredits";
import { isVideoExclusiveFundingEnabled, VIDEO_EXCLUSIVE_PURPOSE } from "@/lib/videoExclusiveFunding";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { siteUrl, stripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const IDENTIFIER = /^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/;
const REQUEST_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const enabled = (value: string | undefined) => ["1", "true", "yes"].includes(value?.trim().toLowerCase() ?? "");

export async function OPTIONS(req: Request) {
  return preflight(req, "POST, OPTIONS");
}

export async function POST(req: Request) {
  const cors = corsHeaders(req.headers.get("origin"), "POST, OPTIONS");
  const json = (data: unknown, status: number) => NextResponse.json(data, { status, headers: cors });

  const user = await authenticate(req);
  if (!user) return json({ error: "Sign in again before checkout.", code: "sign_in_required" }, 401);

  // This is deliberately a backend contract only. No existing UI or general
  // credits checkout is routed here until product approves the customer flow.
  if (!enabled(process.env.VIDEO_EXCLUSIVE_CHECKOUT_ENABLED) ||
      !isVideoExclusiveFundingEnabled() ||
      !IDENTIFIER.test(process.env.VIDEO_FUNDING_SOURCE_ISSUER?.trim() ?? "") ||
      !IDENTIFIER.test(process.env.VIDEO_FUNDING_SOURCE_DESTINATION?.trim() ?? "")) {
    return json({ error: "Video checkout is not available.", code: "checkout_disabled" }, 503);
  }
  if (!stripe) return json({ error: "Video checkout is not available.", code: "checkout_unavailable" }, 503);

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await req.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("body");
    body = parsed as Record<string, unknown>;
  } catch {
    return json({ error: "Invalid request.", code: "invalid_request" }, 400);
  }
  if (Object.keys(body).some((key) => !["amountCents", "requestId", "lang"].includes(key))) {
    return json({ error: "Unsupported request fields.", code: "invalid_request" }, 400);
  }
  const creditPackage = creditPackageFor(body.amountCents);
  if (!creditPackage) return json({ error: "Choose a supported package.", code: "invalid_amount" }, 400);
  if (typeof body.requestId !== "string" || !REQUEST_ID.test(body.requestId)) {
    return json({ error: "A valid request id is required.", code: "invalid_request" }, 400);
  }

  const issuerId = process.env.VIDEO_FUNDING_SOURCE_ISSUER!.trim();
  const destination = process.env.VIDEO_FUNDING_SOURCE_DESTINATION!.trim();
  const lang = normalizeCreditLang(body.lang);
  const sb = getSupabaseAdmin();
  if (!sb) return json({ error: "Video checkout is not available.", code: "authority_unavailable" }, 503);

  let reserve: { data?: Record<string, unknown> | null; error?: unknown };
  try {
    const result = await sb.rpc("reserve_video_exclusive_checkout", {
      p_account_id: user.id,
      p_request_id: body.requestId,
      p_amount_cents: creditPackage.amountCents,
      p_issuer_id: issuerId,
      p_destination: destination,
    });
    reserve = result as typeof reserve;
  } catch {
    return json({ error: "Video checkout authority is unavailable.", code: "authority_unavailable" }, 503);
  }
  if (reserve.error || !reserve.data || typeof reserve.data.status !== "string") {
    return json({ error: "Video checkout authority is unavailable.", code: "authority_unavailable" }, 503);
  }
  if (reserve.data.status === "created" &&
      typeof reserve.data.url === "string" && typeof reserve.data.checkoutId === "string") {
    return json({ url: reserve.data.url, rail: "stripe", checkoutId: reserve.data.checkoutId }, 200);
  }
  if (reserve.data.status === "paid") {
    // A terminal paid session is not an open checkout; never return a stale or null URL.
    return json({ error: "This checkout is already complete.", code: "checkout_already_completed" }, 409);
  }
  if (reserve.data.status === "reconcile_required") {
    return json({ error: "This checkout request needs reconciliation before it can be retried.", code: "checkout_reconcile_required" }, 409);
  }
  if (reserve.data.status !== "create" || typeof reserve.data.idempotencyKey !== "string") {
    return json({ error: "Video checkout authority is unavailable.", code: "authority_unavailable" }, 503);
  }

  const metadata: Record<string, string> = {
    source: "terminalsync_credits",
    credit_funding_purpose: VIDEO_EXCLUSIVE_PURPOSE,
    supabase_user_id: user.id,
    credit_amount_cents: String(creditPackage.amountCents),
    credit_amount_micros: String(creditPackage.amountMicros),
    rail: "stripe",
    video_funding_issuer_id: issuerId,
    video_funding_destination: destination,
    video_exclusive_checkout_request_id: body.requestId,
  };
  // The durable SQL intent owns this key and pins the terms before any provider
  // call. Replays after Stripe's idempotency TTL never call create again.
  const idempotencyKey = reserve.data.idempotencyKey;
  const base = siteUrl().replace(/\/+$/, "");
  const returnBase = `${base}/${lang}`;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "usd",
          unit_amount: creditPackage.amountCents,
          product_data: {
            name: `Terminal Sync Video credits — $${creditPackage.usd}`,
            description: "Exclusive prepaid funding for Video execution",
          },
        },
        quantity: 1,
      }],
      customer_email: user.email ?? undefined,
      success_url: returnBase,
      cancel_url: returnBase,
      locale: lang,
      metadata,
      payment_intent_data: { metadata },
    }, { idempotencyKey });
    if (!session.url) {
      await sb.rpc("mark_video_exclusive_checkout_ambiguous", {
        p_account_id: user.id,
        p_request_id: body.requestId,
        p_idempotency_key: idempotencyKey,
      });
      console.error("[video-exclusive-checkout] failure category", { category: "stripe_response_incomplete" });
      return json({ error: "Checkout needs reconciliation before retry.", code: "checkout_reconcile_required" }, 409);
    }
    const completed = await sb.rpc("complete_video_exclusive_checkout", {
      p_account_id: user.id,
      p_request_id: body.requestId,
      p_idempotency_key: idempotencyKey,
      p_stripe_session_id: session.id,
      p_stripe_session_url: session.url,
    });
    if (completed.error || completed.data !== true) {
      // Leave the durable row in `creating`: it blocks every retry and can be
      // reconciled by the immutable request ID in Stripe metadata.
      console.error("[video-exclusive-checkout] failure category", { category: "intent_completion_failed" });
      return json({ error: "Checkout needs reconciliation before retry.", code: "checkout_reconcile_required" }, 409);
    }
    return json({ url: session.url, rail: "stripe", checkoutId: session.id }, 200);
  } catch {
    try {
      await sb.rpc("mark_video_exclusive_checkout_ambiguous", {
        p_account_id: user.id,
        p_request_id: body.requestId,
        p_idempotency_key: idempotencyKey,
      });
    } catch {
      // The pre-existing `creating` row already fails closed if marking fails.
    }
    console.error("[video-exclusive-checkout] failure category", {
      category: "provider_outcome_ambiguous",
    });
    return json({ error: "Video checkout is temporarily unavailable.", code: "provider_unavailable" }, 502);
  }
}
