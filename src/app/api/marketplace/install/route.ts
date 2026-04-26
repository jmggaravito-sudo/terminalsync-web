import { NextResponse } from "next/server";
import { authenticate } from "@/lib/marketplace/auth";
import { computeSplit } from "@/lib/marketplace/pricing";
import { siteUrl, stripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

interface Body {
  listingId: string;
  lang?: "es" | "en";
  /** Where Stripe should redirect after checkout. Tauri passes deep-links
   *  like terminalsync://marketplace/installed. Defaults to web. */
  successUrl?: string;
  cancelUrl?: string;
}

/** POST /api/marketplace/install
 *  Free listing → creates a row in connector_installs, returns 200.
 *  Paid listing → creates a Stripe Checkout session with Connect transfer
 *                 to the publisher (minus our take), returns the URL.
 *                 The actual install row is created by the webhook on
 *                 charge.succeeded so we never leak access to non-payers. */
export async function POST(req: Request) {
  const user = await authenticate(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sb = getSupabaseAdmin();
  if (!sb) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.listingId) return NextResponse.json({ error: "listingId required" }, { status: 400 });

  const listing = await sb
    .from("connector_listings")
    .select("id, slug, name, status, pricing_type, price_cents, install_count, stripe_price_id, publisher:publishers(id, stripe_account_id, payout_enabled, approved_at)")
    .eq("id", body.listingId)
    .maybeSingle();
  if (listing.error) return NextResponse.json({ error: listing.error.message }, { status: 500 });
  if (!listing.data || listing.data.status !== "approved") {
    return NextResponse.json({ error: "Not found or not approved" }, { status: 404 });
  }

  if (listing.data.pricing_type === "free") {
    const latestVersion = await sb
      .from("connector_versions")
      .select("id")
      .eq("listing_id", listing.data.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const upsert = await sb
      .from("connector_installs")
      .upsert(
        {
          user_id: user.id,
          listing_id: listing.data.id,
          version_id: latestVersion.data?.id ?? null,
          status: "active",
          installed_at: new Date().toISOString(),
        },
        { onConflict: "user_id,listing_id" },
      );
    if (upsert.error) return NextResponse.json({ error: upsert.error.message }, { status: 500 });

    // Best-effort install counter bump. Not atomic across concurrent
    // installs — fine for the MVP since the rendered count is decorative;
    // swap to a Postgres `increment_install_count` RPC when needed.
    await sb
      .from("connector_listings")
      .update({ install_count: (listing.data.install_count ?? 0) + 1 })
      .eq("id", listing.data.id);

    return NextResponse.json({ ok: true, installed: true });
  }

  // Paid path: requires Stripe + a published price + a payout-enabled publisher.
  if (!stripe) return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  if (!listing.data.stripe_price_id) {
    return NextResponse.json({ error: "Listing has no Stripe price (admin re-approve needed)" }, { status: 500 });
  }
  // `publisher` joins single row but Supabase types it as array — coerce.
  const pubRel = listing.data.publisher;
  const publisher = Array.isArray(pubRel) ? pubRel[0] : pubRel;
  if (!publisher?.stripe_account_id || !publisher?.payout_enabled) {
    return NextResponse.json({ error: "Publisher payouts not enabled" }, { status: 503 });
  }

  const split = computeSplit({
    grossCents: listing.data.price_cents ?? 0,
    publisherApprovedAt: publisher.approved_at ? new Date(publisher.approved_at) : null,
    // Rank is computed at admin-approve time in a real impl; for the MVP
    // scaffold we approximate by counting approved publishers with a row
    // approved before this one. Cheap query, fine for low volume.
    publisherApprovalRank: await approvalRank(sb, publisher.id, publisher.approved_at),
  });

  const lang = body.lang === "en" ? "en" : "es";
  const base = siteUrl();

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: listing.data.stripe_price_id, quantity: 1 }],
      payment_intent_data: {
        // Connect: TS take goes to the platform; remainder transfers to
        // the publisher's connected account.
        application_fee_amount: split.tsTakeCents,
        transfer_data: { destination: publisher.stripe_account_id },
        metadata: {
          source: "terminalsync_marketplace",
          listing_id: listing.data.id,
          publisher_id: publisher.id,
          buyer_user_id: user.id,
        },
      },
      metadata: {
        source: "terminalsync_marketplace",
        listing_id: listing.data.id,
        publisher_id: publisher.id,
        buyer_user_id: user.id,
        ts_take_cents: String(split.tsTakeCents),
        gross_cents: String(split.grossCents),
        waiver_applied: split.waiverApplied ? "1" : "0",
      },
      success_url:
        body.successUrl ??
        `${base}/${lang}/connectors/${listing.data.slug}?installed=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: body.cancelUrl ?? `${base}/${lang}/connectors/${listing.data.slug}?canceled=1`,
      locale: lang === "es" ? "es" : "en",
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Stripe error" },
      { status: 502 },
    );
  }
}

async function approvalRank(
  sb: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  publisherId: string,
  approvedAt: string | null,
): Promise<number | null> {
  if (!approvedAt) return null;
  const { count } = await sb
    .from("publishers")
    .select("id", { count: "exact", head: true })
    .lt("approved_at", approvedAt);
  return (count ?? 0) + 1;
}
