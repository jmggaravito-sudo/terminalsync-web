import { NextResponse } from "next/server";
import { authenticate, isAdmin } from "@/lib/marketplace/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

/** GET /api/marketplace/admin/queue?view=pending|approved
 *
 *  Admin-only. Returns enriched listings (publisher info + latest manifest +
 *  daily counters) for the review dashboard.
 */
export async function GET(req: Request) {
  const user = await authenticate(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(user)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const sb = getSupabaseAdmin();
  if (!sb) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

  const url = new URL(req.url);
  const view = url.searchParams.get("view") ?? "pending";
  const targetStatus = view === "approved" ? "approved" : "pending";

  const { data: listings, error } = await sb
    .from("connector_listings")
    .select(
      `id, slug, name, tagline, category, pricing_type, price_cents, currency,
       description_md, setup_md, logo_url, publisher_id, created_at, approved_at,
       install_count, rating_avg,
       publisher:publishers(id, display_name, slug, website, payout_enabled, stripe_account_id, approved_at)`,
    )
    .eq("status", targetStatus)
    .order(view === "approved" ? "approved_at" : "created_at", { ascending: view !== "approved" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const listingIds = (listings ?? []).map((l) => l.id);
  const versionsByListing: Record<
    string,
    { version: string; manifest_json: unknown; checksum: string; created_at: string }
  > = {};
  if (listingIds.length > 0) {
    const { data: versions, error: vErr } = await sb
      .from("connector_versions")
      .select("listing_id, version, manifest_json, checksum, created_at")
      .in("listing_id", listingIds)
      .order("created_at", { ascending: false });
    if (vErr) return NextResponse.json({ error: vErr.message }, { status: 500 });
    for (const v of versions ?? []) {
      if (!versionsByListing[v.listing_id]) {
        versionsByListing[v.listing_id] = {
          version: v.version,
          manifest_json: v.manifest_json,
          checksum: v.checksum,
          created_at: v.created_at,
        };
      }
    }
  }

  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);
  const todayIso = todayStart.toISOString();

  const [approvedToday, rejectedToday, pendingTotal] = await Promise.all([
    sb
      .from("connector_listings")
      .select("id", { count: "exact", head: true })
      .eq("status", "approved")
      .gte("approved_at", todayIso),
    sb
      .from("connector_listings")
      .select("id", { count: "exact", head: true })
      .eq("status", "rejected")
      .gte("rejected_at", todayIso),
    sb
      .from("connector_listings")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
  ]);

  const enriched = (listings ?? []).map((l) => ({
    ...l,
    latestVersion: versionsByListing[l.id] ?? null,
  }));

  return NextResponse.json({
    pending: enriched,
    stats: {
      pendingCount: pendingTotal.count ?? 0,
      approvedToday: approvedToday.count ?? 0,
      rejectedToday: rejectedToday.count ?? 0,
    },
  });
}
