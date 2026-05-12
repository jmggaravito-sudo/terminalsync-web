import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import {
  isBundleItemKind,
  resolveBundleItems,
  type BundleItemKind,
  type BundleItemRef,
} from "@/lib/marketplace/bundleItems";

export const runtime = "nodejs";

/** GET /api/marketplace/bundles
 *
 *  Public list of active Stack Packs. Sorted by sort_order so JM
 *  can curate which appears first on /[lang]/stacks without a
 *  database edit — admins set sort_order via the admin endpoint.
 *
 *  Each bundle's items array is resolved into normalized item refs
 *  ({kind, slug, name, tagline, logo}) regardless of which pillar
 *  the item lives in. Items that don't resolve at render time are
 *  silently dropped (see resolveBundleItems).
 *
 *  Accepts `?lang=` (default "en") so the index page can use the
 *  caller's locale when reading markdown frontmatter.
 */
export async function GET(req: Request) {
  const sb = getSupabaseAdmin();
  if (!sb) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  const url = new URL(req.url);
  const lang = url.searchParams.get("lang") === "es" ? "es" : "en";

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

  const linksRes = await sb
    .from("bundle_listings")
    .select("bundle_id, kind, item_slug, sort_order")
    .in("bundle_id", bundleIds);
  if (linksRes.error) return NextResponse.json({ error: linksRes.error.message }, { status: 500 });

  type Row = {
    bundle_id: string;
    kind: BundleItemKind;
    item_slug: string;
    sort_order: number;
  };
  const linksByBundle = new Map<string, BundleItemRef[]>();
  for (const raw of linksRes.data ?? []) {
    const row = raw as Row;
    if (!isBundleItemKind(row.kind)) continue;
    const arr = linksByBundle.get(row.bundle_id) ?? [];
    arr.push({ kind: row.kind, slug: row.item_slug, sortOrder: row.sort_order });
    linksByBundle.set(row.bundle_id, arr);
  }

  const out = await Promise.all(
    (bundles ?? []).map(async (b) => {
      const refs = linksByBundle.get(b.id) ?? [];
      const items = await resolveBundleItems(refs, lang);
      return { ...b, items };
    }),
  );

  return NextResponse.json({ bundles: out });
}
