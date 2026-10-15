import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { authenticate } from "@/lib/marketplace/auth";
import { corsHeaders, preflight } from "@/lib/cors";
import { creditPackageFor, normalizeCreditLang } from "@/lib/aiCredits";
import { isVideoExclusiveFundingEnabled, VIDEO_EXCLUSIVE_PURPOSE } from "@/lib/videoExclusiveFunding";
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
  // Same authenticated account + request id always maps to one Stripe key;
  // the provider rejects replay with changed payload instead of creating a
  // second session. The account identifier never comes from the request body.
  const idempotencyKey = `video-exclusive:${createHash("sha256").update(`${user.id}:${body.requestId}`).digest("hex")}`;
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
    if (!session.url) throw new Error("Stripe did not return a checkout URL");
    return json({ url: session.url, rail: "stripe", checkoutId: session.id }, 200);
  } catch (err) {
    console.error("[video-exclusive-checkout] provider failed", {
      userId: user.id,
      amountCents: creditPackage.amountCents,
      error: err instanceof Error ? err.message : String(err),
    });
    return json({ error: "Video checkout is temporarily unavailable.", code: "provider_unavailable" }, 502);
  }
}
