import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { ensureBundlePrice, verifyBundlePriceLive } from "@/lib/marketplace/stripeBundles";

export const runtime = "nodejs";

/** Admin endpoints for creating + publishing Stack Packs. Auth via the
 *  same DISCOVERY_INGEST_KEY that the n8n bypass uses, since the goal
 *  is the same: let JM curate without needing the broken Supabase auth
 *  UI to be working. The admin login flow can replace this later.
 *
 *  Three operations:
 *    GET    /api/marketplace/admin/bundles?key=...  → list all bundles
 *           regardless of status (drafts visible)
 *    POST   /api/marketplace/admin/bundles?key=...  → create a draft
 *           bundle. Body: {slug, name, tagline, description_md, hero_subtitle?,
 *           hero_image_url?, price_cents, currency?, listing_slugs[],
 *           sort_order?}
 *    PATCH  /api/marketplace/admin/bundles?key=...  → publish or update
 *           an existing bundle. Body: {id, action: "publish"|"archive"|"update",
 *           ...fields to update}
 */

function authorized(req: Request): boolean {
  const url = new URL(req.url);
  const provided = url.searchParams.get("key") ?? req.headers.get("x-api-key");
  const expected = process.env.DISCOVERY_INGEST_KEY;
  return !!expected && provided === expected;
}

export async function GET(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sb = getSupabaseAdmin();
  if (!sb) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

  const { data, error } = await sb
    .from("bundles")
    .select(
      "id, slug, name, tagline, status, price_cents, currency, purchase_count, sort_order, stripe_product_id, stripe_price_id, created_at, updated_at",
    )
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ bundles: data ?? [] });
}

export async function POST(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sb = getSupabaseAdmin();
  if (!sb) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

  let body: {
    slug?: string;
    name?: string;
    tagline?: string;
    description_md?: string;
    hero_subtitle?: string;
    hero_image_url?: string;
    price_cents?: number;
    currency?: string;
    listing_slugs?: string[];
    sort_order?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const required = ["slug", "name", "tagline", "description_md", "price_cents", "listing_slugs"] as const;
  for (const k of required) {
    if (body[k] === undefined || body[k] === null) {
      return NextResponse.json({ error: `${k} is required` }, { status: 400 });
    }
  }
  if (typeof body.price_cents !== "number" || body.price_cents <= 0) {
    return NextResponse.json({ error: "price_cents must be a positive integer" }, { status: 400 });
  }
  if (!Array.isArray(body.listing_slugs) || body.listing_slugs.length === 0) {
    return NextResponse.json({ error: "listing_slugs must be a non-empty array" }, { status: 400 });
  }

  // Resolve listing_slugs → ids. Reject if any slug doesn't match an
  // approved listing — bundles should never include a draft/rejected
  // connector.
  const listingsRes = await sb
    .from("connector_listings")
    .select("id, slug, status")
    .in("slug", body.listing_slugs);
  if (listingsRes.error) {
    return NextResponse.json({ error: listingsRes.error.message }, { status: 500 });
  }
  const found = listingsRes.data ?? [];
  const missing = body.listing_slugs.filter((s) => !found.some((f) => f.slug === s));
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Listings not found: ${missing.join(", ")}` },
      { status: 400 },
    );
  }
  const notApproved = found.filter((f) => f.status !== "approved");
  if (notApproved.length > 0) {
    return NextResponse.json(
      { error: `Listings must be approved before bundling: ${notApproved.map((l) => l.slug).join(", ")}` },
      { status: 400 },
    );
  }

  const insert = await sb
    .from("bundles")
    .insert({
      slug: body.slug,
      name: body.name,
      tagline: body.tagline,
      description_md: body.description_md,
      hero_subtitle: body.hero_subtitle ?? null,
      hero_image_url: body.hero_image_url ?? null,
      price_cents: body.price_cents,
      currency: body.currency ?? "usd",
      status: "draft",
      sort_order: body.sort_order ?? 0,
    })
    .select("id, slug")
    .single();
  if (insert.error) return NextResponse.json({ error: insert.error.message }, { status: 500 });

  // Insert bundle_listings rows preserving the order the slugs came in.
  const slugToId = new Map(found.map((f) => [f.slug, f.id]));
  const linkRows = body.listing_slugs.map((slug, i) => ({
    bundle_id: insert.data.id,
    listing_id: slugToId.get(slug)!,
    sort_order: i,
  }));
  const linkRes = await sb.from("bundle_listings").insert(linkRows);
  if (linkRes.error) {
    // Roll back the bundle so we don't end up with an empty bundle row.
    await sb.from("bundles").delete().eq("id", insert.data.id);
    return NextResponse.json({ error: linkRes.error.message }, { status: 500 });
  }

  return NextResponse.json({ id: insert.data.id, slug: insert.data.slug, status: "draft" });
}

export async function PATCH(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sb = getSupabaseAdmin();
  if (!sb) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

  let body: { id?: string; action?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });
  if (!body.action) return NextResponse.json({ error: "action required" }, { status: 400 });

  const bundleRes = await sb
    .from("bundles")
    .select("id, name, status, price_cents, currency, stripe_product_id, stripe_price_id")
    .eq("id", body.id)
    .maybeSingle();
  if (bundleRes.error) return NextResponse.json({ error: bundleRes.error.message }, { status: 500 });
  if (!bundleRes.data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const bundle = bundleRes.data;

  if (body.action === "archive") {
    const upd = await sb.from("bundles").update({ status: "archived" }).eq("id", bundle.id);
    if (upd.error) return NextResponse.json({ error: upd.error.message }, { status: 500 });
    return NextResponse.json({ ok: true, status: "archived" });
  }

  if (body.action === "publish") {
    if (bundle.status === "active") {
      return NextResponse.json({ ok: true, status: "active", note: "already active" });
    }

    let productId = bundle.stripe_product_id;
    let priceId = bundle.stripe_price_id;
    try {
      const ids = await ensureBundlePrice({
        id: bundle.id,
        name: bundle.name,
        priceCents: bundle.price_cents,
        currency: bundle.currency,
        stripeProductId: productId,
        stripePriceId: priceId,
      });
      productId = ids.productId;
      priceId = ids.priceId;
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Stripe error" },
        { status: 502 },
      );
    }

    // Persist Stripe IDs first, while still draft, so a crash before
    // the status flip doesn't lose them. Same pattern as listing
    // approval in /api/marketplace/listings/[id].
    if (productId !== bundle.stripe_product_id || priceId !== bundle.stripe_price_id) {
      const persist = await sb
        .from("bundles")
        .update({ stripe_product_id: productId, stripe_price_id: priceId })
        .eq("id", bundle.id)
        .neq("status", "active");
      if (persist.error) return NextResponse.json({ error: persist.error.message }, { status: 500 });
    }

    const live = await verifyBundlePriceLive(priceId!);
    if (!live) {
      return NextResponse.json(
        { error: "Stripe Price is not active. Re-publish to recreate." },
        { status: 502 },
      );
    }

    const upd = await sb
      .from("bundles")
      .update({ status: "active" })
      .eq("id", bundle.id);
    if (upd.error) return NextResponse.json({ error: upd.error.message }, { status: 500 });
    return NextResponse.json({ ok: true, status: "active", priceId });
  }

  return NextResponse.json({ error: `Unknown action: ${body.action}` }, { status: 400 });
}
