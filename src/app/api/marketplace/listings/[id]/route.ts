import { NextResponse } from "next/server";
import { authenticate, isAdmin } from "@/lib/marketplace/auth";
import { ensureListingPrice } from "@/lib/marketplace/stripeConnect";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

interface Params { params: Promise<{ id: string }> }

/** GET /api/marketplace/listings/[id] — full detail incl. latest version. */
export async function GET(req: Request, { params }: Params) {
  const { id } = await params;
  const sb = getSupabaseAdmin();
  if (!sb) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

  const { data: listing, error } = await sb
    .from("connector_listings")
    .select("*, publisher:publishers(id, display_name, slug, website)")
    .eq("id", id)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Hide non-approved listings unless the requester is the owner or admin.
  if (listing.status !== "approved") {
    const user = await authenticate(req);
    const owner = user && (await ownsListing(user.id, listing.publisher_id));
    if (!user || (!owner && !isAdmin(user))) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  }

  const versions = await sb
    .from("connector_versions")
    .select("id, version, changelog_md, checksum, created_at")
    .eq("listing_id", id)
    .order("created_at", { ascending: false });

  return NextResponse.json({ listing, versions: versions.data ?? [] });
}

/** PATCH /api/marketplace/listings/[id]
 *  - Admin: { action: 'approve' | 'reject', notes?: string }
 *  - Owner: edit draft fields (subset). Approved listings can only be
 *    edited via a new version (POST /listings/[id]/versions, future).
 */
export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params;
  const user = await authenticate(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sb = getSupabaseAdmin();
  if (!sb) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

  let body: { action?: string; notes?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.action === "approve" || body.action === "reject") {
    if (!isAdmin(user)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return await handleAdminTransition(sb, id, body.action, body.notes);
  }

  // Owner edit path: out-of-scope for MVP scaffold (one-shot submission).
  // When implemented: validate body, ensure listing.status='draft', update.
  return NextResponse.json({ error: "Owner edits not yet supported in MVP" }, { status: 501 });
}

async function handleAdminTransition(
  sb: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  listingId: string,
  action: "approve" | "reject",
  notes?: string,
) {
  const listing = await sb
    .from("connector_listings")
    .select("id, status, name, pricing_type, price_cents, currency, stripe_product_id, stripe_price_id, publisher_id")
    .eq("id", listingId)
    .maybeSingle();
  if (listing.error) return NextResponse.json({ error: listing.error.message }, { status: 500 });
  if (!listing.data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (listing.data.status !== "pending") {
    return NextResponse.json({ error: `Listing is ${listing.data.status}, not pending` }, { status: 409 });
  }

  if (action === "reject") {
    const upd = await sb
      .from("connector_listings")
      .update({ status: "rejected", rejected_at: new Date().toISOString(), review_notes: notes ?? null })
      .eq("id", listingId);
    if (upd.error) return NextResponse.json({ error: upd.error.message }, { status: 500 });
    return NextResponse.json({ status: "rejected" });
  }

  // Approve: lazily create Stripe Product + Price for paid listings.
  let stripeProductId = listing.data.stripe_product_id;
  let stripePriceId = listing.data.stripe_price_id;
  if (listing.data.pricing_type === "one_time" && listing.data.price_cents) {
    try {
      const ids = await ensureListingPrice({
        id: listing.data.id,
        name: listing.data.name,
        priceCents: listing.data.price_cents,
        currency: listing.data.currency,
        stripeProductId: listing.data.stripe_product_id,
        stripePriceId: listing.data.stripe_price_id,
      });
      stripeProductId = ids.productId;
      stripePriceId = ids.priceId;
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Stripe error" },
        { status: 502 },
      );
    }
  }

  const upd = await sb
    .from("connector_listings")
    .update({
      status: "approved",
      approved_at: new Date().toISOString(),
      review_notes: notes ?? null,
      stripe_product_id: stripeProductId,
      stripe_price_id: stripePriceId,
    })
    .eq("id", listingId);
  if (upd.error) return NextResponse.json({ error: upd.error.message }, { status: 500 });

  // Stamp the publisher's first-approval timestamp (waiver eligibility).
  await sb
    .from("publishers")
    .update({ approved_at: new Date().toISOString() })
    .eq("id", listing.data.publisher_id)
    .is("approved_at", null);

  return NextResponse.json({ status: "approved", stripePriceId });
}

async function ownsListing(userId: string, publisherId: string): Promise<boolean> {
  const sb = getSupabaseAdmin();
  if (!sb) return false;
  const { data } = await sb
    .from("publishers")
    .select("id")
    .eq("id", publisherId)
    .eq("user_id", userId)
    .maybeSingle();
  return data !== null;
}
