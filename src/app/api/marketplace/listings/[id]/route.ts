import { NextResponse } from "next/server";
import { authenticate, isAdmin } from "@/lib/marketplace/auth";
import { ensureListingPrice, verifyPriceLive } from "@/lib/marketplace/stripeConnect";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { sendListingApprovedEmail, sendListingRejectedEmail } from "@/lib/email";
import { resolveLogo } from "@/lib/marketplace/logoResolver";

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
 *  Admin actions: approve | reject | unpublish (takedown of approved listing).
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

  if (body.action === "unpublish") {
    if (!isAdmin(user)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return await handleUnpublish(sb, id, body.notes);
  }

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
    .select("id, slug, status, name, pricing_type, price_cents, currency, stripe_product_id, stripe_price_id, publisher_id, logo_url, repo_url, source_url, demo_url")
    .eq("id", listingId)
    .maybeSingle();
  if (listing.error) return NextResponse.json({ error: listing.error.message }, { status: 500 });
  if (!listing.data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (listing.data.status !== "pending") {
    return NextResponse.json({ error: `Listing is ${listing.data.status}, not pending` }, { status: 409 });
  }

  // Resolve publisher info + email once for both approve/reject paths.
  const publisher = await sb
    .from("publishers")
    .select("id, display_name, user_id")
    .eq("id", listing.data.publisher_id)
    .maybeSingle();
  let publisherEmail: string | null = null;
  if (publisher.data?.user_id) {
    const { data: userRow } = await sb.auth.admin.getUserById(publisher.data.user_id);
    publisherEmail = userRow?.user?.email ?? null;
  }

  if (action === "reject") {
    const upd = await sb
      .from("connector_listings")
      .update({ status: "rejected", rejected_at: new Date().toISOString(), review_notes: notes ?? null })
      .eq("id", listingId);
    if (upd.error) return NextResponse.json({ error: upd.error.message }, { status: 500 });

    if (publisherEmail) {
      try {
        await sendListingRejectedEmail({
          to: publisherEmail,
          publisherName: publisher.data?.display_name ?? "Publisher",
          listingName: listing.data.name,
          reviewNotes: notes ?? "",
          listingId: listing.data.id,
        });
      } catch (err) {
        console.error("[marketplace] reject email failed:", err);
      }
    }

    return NextResponse.json({ status: "rejected" });
  }

  // Approve flow (Fix #4 hardening): idempotent Stripe + persist before
  // verify + verify before flipping status.
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

    if (
      stripeProductId !== listing.data.stripe_product_id ||
      stripePriceId !== listing.data.stripe_price_id
    ) {
      const persistIds = await sb
        .from("connector_listings")
        .update({ stripe_product_id: stripeProductId, stripe_price_id: stripePriceId })
        .eq("id", listingId)
        .eq("status", "pending");
      if (persistIds.error) {
        return NextResponse.json({ error: persistIds.error.message }, { status: 500 });
      }
    }

    const live = await verifyPriceLive(stripePriceId!);
    if (!live) {
      return NextResponse.json(
        { error: "Stripe Price is not active. Re-approve to recreate." },
        { status: 502 },
      );
    }
  }

  // Safety net for hand-approved rows that came in with no logo. The
  // publisher submission flow requires logo_url, but rows promoted from
  // discovery (or imported in bulk) sometimes land with logo_url=""; the
  // resolver fills them on approve so the catalog never renders a blank
  // square. Best-effort — if it fails we just keep whatever was there
  // and let the frontend initials fallback take over.
  type ListingRow = {
    logo_url: string | null;
    repo_url: string | null;
    source_url: string | null;
    demo_url: string | null;
    name: string;
  };
  const listingRow = listing.data as ListingRow;
  let resolvedLogoUrl: string | null = null;
  if (!listingRow.logo_url || listingRow.logo_url.trim() === "") {
    try {
      const resolved = await resolveLogo({
        homepage: listingRow.demo_url || listingRow.source_url || null,
        repoUrl: listingRow.repo_url || null,
        name: listingRow.name,
      });
      resolvedLogoUrl = resolved.url;
    } catch (err) {
      console.warn("[approve] resolveLogo failed:", err);
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
      ...(resolvedLogoUrl ? { logo_url: resolvedLogoUrl } : {}),
    })
    .eq("id", listingId);
  if (upd.error) return NextResponse.json({ error: upd.error.message }, { status: 500 });

  await sb
    .from("publishers")
    .update({ approved_at: new Date().toISOString() })
    .eq("id", listing.data.publisher_id)
    .is("approved_at", null);

  if (publisherEmail) {
    try {
      await sendListingApprovedEmail({
        to: publisherEmail,
        publisherName: publisher.data?.display_name ?? "Publisher",
        listingName: listing.data.name,
        listingSlug: listing.data.slug,
        isPaid: listing.data.pricing_type === "one_time",
        listingId: listing.data.id,
      });
    } catch (err) {
      console.error("[marketplace] approve email failed:", err);
    }
  }

  return NextResponse.json({ status: "approved", stripePriceId });
}

/** Admin takedown of an approved listing. Sets status back to 'rejected'
 *  with [TAKEDOWN] prefix in review_notes. Stripe IDs are kept so a future
 *  re-approval reuses them. */
async function handleUnpublish(
  sb: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  listingId: string,
  notes?: string,
) {
  const listing = await sb
    .from("connector_listings")
    .select("id, slug, status, name, publisher_id")
    .eq("id", listingId)
    .maybeSingle();
  if (listing.error) return NextResponse.json({ error: listing.error.message }, { status: 500 });
  if (!listing.data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (listing.data.status !== "approved") {
    return NextResponse.json(
      { error: `Listing is ${listing.data.status}, not approved — only approved listings can be unpublished` },
      { status: 409 },
    );
  }

  const reason = notes?.trim() || "Admin takedown";
  const upd = await sb
    .from("connector_listings")
    .update({
      status: "rejected",
      rejected_at: new Date().toISOString(),
      review_notes: `[TAKEDOWN] ${reason}`,
    })
    .eq("id", listingId);
  if (upd.error) return NextResponse.json({ error: upd.error.message }, { status: 500 });

  const publisher = await sb
    .from("publishers")
    .select("display_name, user_id")
    .eq("id", listing.data.publisher_id)
    .maybeSingle();
  if (publisher.data?.user_id) {
    const { data: userRow } = await sb.auth.admin.getUserById(publisher.data.user_id);
    const email = userRow?.user?.email;
    if (email) {
      try {
        await sendListingRejectedEmail({
          to: email,
          publisherName: publisher.data.display_name ?? "Publisher",
          listingName: listing.data.name,
          reviewNotes: `Tu listing fue dado de baja del marketplace. Razón: ${reason}`,
          listingId: listing.data.id,
        });
      } catch (err) {
        console.error("[marketplace] takedown email failed:", err);
      }
    }
  }

  return NextResponse.json({ status: "unpublished" });
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
