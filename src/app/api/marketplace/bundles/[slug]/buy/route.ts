import { NextResponse } from "next/server";
import { authenticate } from "@/lib/marketplace/auth";
import { siteUrl, stripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

interface Params { params: Promise<{ slug: string }> }

/** POST /api/marketplace/bundles/[slug]/buy
 *
 *  Creates a Stripe Checkout Session for the requested bundle and
 *  returns the URL the client should redirect to. Mirrors the
 *  /api/marketplace/install flow for paid listings — same metadata
 *  shape so the existing webhook can dispatch on metadata.source.
 *
 *  Auth: requires Bearer token. We need the user_id to attach to the
 *  session metadata so the webhook can grant the bundle to the right
 *  account.
 *
 *  Idempotency: if the same user has an unpaid Checkout session in
 *  flight, Stripe handles dedup at the Session level (each call is a
 *  fresh Session). If the user already paid, the webhook upserted on
 *  (user_id, bundle_id), so a second buy gets the same row updated.
 */
export async function POST(req: Request, { params }: Params) {
  const { slug } = await params;
  const user = await authenticate(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!stripe) return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  const sb = getSupabaseAdmin();
  if (!sb) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

  const body = (await req.json().catch(() => ({}))) as {
    successUrl?: string;
    cancelUrl?: string;
    lang?: "es" | "en";
  };
  const lang = body.lang === "en" ? "en" : "es";

  const { data: bundle, error } = await sb
    .from("bundles")
    .select("id, slug, name, status, stripe_price_id, price_cents, currency")
    .eq("slug", slug)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!bundle) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (bundle.status !== "active") {
    return NextResponse.json({ error: "Bundle is not available for purchase" }, { status: 409 });
  }
  if (!bundle.stripe_price_id) {
    return NextResponse.json(
      { error: "Bundle is missing a Stripe Price. Admin must publish it before buying." },
      { status: 502 },
    );
  }

  // Has the user already bought this bundle? Two strategies:
  // - If active → tell them, suggest opening the app instead
  // - If refunded → let them re-buy (webhook will update the row to active)
  const existing = await sb
    .from("bundle_purchases")
    .select("status")
    .eq("user_id", user.id)
    .eq("bundle_id", bundle.id)
    .maybeSingle();
  if (existing.data?.status === "active") {
    return NextResponse.json(
      { error: "You already own this bundle.", code: "already_owned" },
      { status: 409 },
    );
  }

  const base = siteUrl();
  const successUrl =
    body.successUrl ??
    `${base}/${lang}/stacks/${slug}?paid=1&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = body.cancelUrl ?? `${base}/${lang}/stacks/${slug}?canceled=1`;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: bundle.stripe_price_id, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: user.email ?? undefined,
    payment_method_collection: "always",
    metadata: {
      source: "terminalsync_bundle",
      bundle_id: bundle.id,
      bundle_slug: bundle.slug,
      buyer_user_id: user.id,
    },
    payment_intent_data: {
      metadata: {
        source: "terminalsync_bundle",
        bundle_id: bundle.id,
        bundle_slug: bundle.slug,
        buyer_user_id: user.id,
      },
    },
  });

  if (!session.url) {
    return NextResponse.json({ error: "Stripe session creation failed" }, { status: 502 });
  }

  return NextResponse.json({ url: session.url, sessionId: session.id });
}
