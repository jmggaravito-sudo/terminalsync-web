import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import {
  isBundleItemKind,
  resolveBundleItems,
  type BundleItemKind,
  type BundleItemRef,
} from "@/lib/marketplace/bundleItems";

export const runtime = "nodejs";

interface Params { params: Promise<{ slug: string }> }

/** GET /api/marketplace/bundles/[slug]?lang=es
 *
 *  Public detail page payload. Returns the bundle plus its resolved
 *  items — each item carries a normalized name/tagline/logo plus a
 *  kind-appropriate CTA (deep-link for connectors with manifest,
 *  install command for CLI, /skills page link for skills).
 */
export async function GET(req: Request, { params }: Params) {
  const { slug } = await params;
  const sb = getSupabaseAdmin();
  if (!sb) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  const url = new URL(req.url);
  const lang = url.searchParams.get("lang") === "es" ? "es" : "en";

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
    .select("kind, item_slug, sort_order")
    .eq("bundle_id", bundle.id);
  if (linksRes.error) return NextResponse.json({ error: linksRes.error.message }, { status: 500 });

  type Row = { kind: BundleItemKind; item_slug: string; sort_order: number };
  const refs: BundleItemRef[] = [];
  for (const raw of linksRes.data ?? []) {
    const row = raw as Row;
    if (!isBundleItemKind(row.kind)) continue;
    refs.push({ kind: row.kind, slug: row.item_slug, sortOrder: row.sort_order });
  }
  const items = await resolveBundleItems(refs, lang);

  return NextResponse.json({ bundle: { ...bundle, items } });
}
