import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

interface Params { params: Promise<{ slug: string }> }

/** GET /api/marketplace/bundles/[slug]
 *
 *  Public detail page payload. Returns the bundle plus the full
 *  listing rows (tagline, description, logo, category) for each
 *  included connector so the detail page renders the "What's
 *  included" section without resolving each listing one-by-one.
 */
export async function GET(_req: Request, { params }: Params) {
  const { slug } = await params;
  const sb = getSupabaseAdmin();
  if (!sb) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

  const bundleRes = await sb
    .from("bundles")
    .select(
      "id, slug, name, tagline, description_md, hero_subtitle, hero_image_url, price_cents, currency, purchase_count",
    )
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();
  if (bundleRes.error) return NextResponse.json({ error: bundleRes.error.message }, { status: 500 });
  if (!bundleRes.data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const bundle = bundleRes.data;

  const linksRes = await sb
    .from("bundle_listings")
    .select(
      "sort_order, listing:connector_listings(id, slug, name, tagline, category, logo_url, description_md)",
    )
    .eq("bundle_id", bundle.id);
  if (linksRes.error) return NextResponse.json({ error: linksRes.error.message }, { status: 500 });

  type Link = {
    sort_order: number;
    listing: {
      id: string;
      slug: string;
      name: string;
      tagline: string;
      category: string;
      logo_url: string;
      description_md: string;
    } | null;
  };
  const links = (linksRes.data ?? []) as unknown as Link[];
  const listings = links
    .filter((l) => l.listing !== null)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((l) => l.listing!);

  return NextResponse.json({ bundle: { ...bundle, listings } });
}
