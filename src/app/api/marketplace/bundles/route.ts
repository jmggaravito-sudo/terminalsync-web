import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

/** GET /api/marketplace/bundles
 *
 *  Public list of active Stack Packs. Sorted by sort_order so JM
 *  can curate which appears first on /[lang]/stacks without a
 *  database edit — admins set sort_order via the admin endpoint.
 *
 *  Returns the bundle rows + each one's included connector listings
 *  (slug + name + logo + category) so the index page can render rich
 *  cards without an N+1 round-trip per card.
 */
export async function GET() {
  const sb = getSupabaseAdmin();
  if (!sb) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

  const { data: bundles, error } = await sb
    .from("bundles")
    .select(
      "id, slug, name, tagline, hero_image_url, price_cents, currency, purchase_count, sort_order",
    )
    .eq("status", "active")
    .order("sort_order", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const bundleIds = (bundles ?? []).map((b) => b.id);
  if (bundleIds.length === 0) return NextResponse.json({ bundles: [] });

  // Fetch all bundle_listings + listings in one query, then group by
  // bundle_id in JS. Cheaper than nested-select Supabase guesses on
  // FK cardinality, and gives us clean typing.
  const linksRes = await sb
    .from("bundle_listings")
    .select("bundle_id, sort_order, listing:connector_listings(slug, name, logo_url, category)")
    .in("bundle_id", bundleIds);
  if (linksRes.error) return NextResponse.json({ error: linksRes.error.message }, { status: 500 });

  type Link = {
    bundle_id: string;
    sort_order: number;
    listing: { slug: string; name: string; logo_url: string; category: string } | null;
  };
  const linksByBundle = new Map<string, Link[]>();
  for (const raw of linksRes.data ?? []) {
    const link = raw as unknown as Link;
    if (!link.listing) continue;
    const arr = linksByBundle.get(link.bundle_id) ?? [];
    arr.push(link);
    linksByBundle.set(link.bundle_id, arr);
  }

  const out = (bundles ?? []).map((b) => {
    const links = (linksByBundle.get(b.id) ?? []).sort(
      (a, b) => a.sort_order - b.sort_order,
    );
    return { ...b, listings: links.map((l) => l.listing!) };
  });

  return NextResponse.json({ bundles: out });
}
