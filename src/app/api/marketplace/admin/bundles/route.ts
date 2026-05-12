import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { ensureBundlePrice, verifyBundlePriceLive } from "@/lib/marketplace/stripeBundles";
import {
  bundleItemExists,
  isBundleItemKind,
  type BundleItemKind,
} from "@/lib/marketplace/bundleItems";
import { validateBundleItems } from "@/lib/marketplace/schema";

export const runtime = "nodejs";

/** Admin endpoints for creating + publishing Stack Packs. Auth via the
 *  same DISCOVERY_INGEST_KEY that the n8n bypass uses, since the goal
 *  is the same: let JM curate without needing the broken Supabase auth
 *  UI to be working. The admin login flow can replace this later.
 *
 *  Bundles can mix items from the 3 pillars (connector / skill / cli),
 *  see `src/lib/marketplace/bundleItems.ts` for the polymorphic model.
 *
 *  Operations:
 *    GET    /api/marketplace/admin/bundles?key=...   → list all bundles
 *           regardless of status (drafts visible). Embeds the item refs.
 *    POST   /api/marketplace/admin/bundles?key=...   → create a draft
 *           bundle. Body: {slug, name, tagline, description_md, hero_subtitle?,
 *           hero_image_url?, price_cents, currency?, items[], sort_order?}
 *           Legacy `listing_slugs[]` is accepted for back-compat and
 *           treated as `items: [{kind: "connector", slug: <s>}]`.
 *    PATCH  /api/marketplace/admin/bundles?key=...   → publish/archive
 *           an existing bundle, or replace its items array. Body:
 *           {id, action: "publish"|"archive"|"update", items?: [...]}
 */

function authorized(req: Request): boolean {
  const url = new URL(req.url);
  const provided = url.searchParams.get("key") ?? req.headers.get("x-api-key");
  const expected = process.env.DISCOVERY_INGEST_KEY;
  return !!expected && provided === expected;
}

interface ItemRow {
  bundle_id: string;
  kind: BundleItemKind;
  item_slug: string;
  sort_order: number;
}

async function fetchItems(
  sb: ReturnType<typeof getSupabaseAdmin>,
  bundleIds: string[],
): Promise<Map<string, ItemRow[]>> {
  const out = new Map<string, ItemRow[]>();
  if (!sb || bundleIds.length === 0) return out;
  const { data, error } = await sb
    .from("bundle_listings")
    .select("bundle_id, kind, item_slug, sort_order")
    .in("bundle_id", bundleIds);
  if (error || !data) return out;
  for (const raw of data) {
    const row = raw as ItemRow;
    if (!isBundleItemKind(row.kind)) continue;
    const arr = out.get(row.bundle_id) ?? [];
    arr.push(row);
    out.set(row.bundle_id, arr);
  }
  for (const [k, arr] of out) {
    arr.sort((a, b) => a.sort_order - b.sort_order);
    out.set(k, arr);
  }
  return out;
}

export async function GET(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sb = getSupabaseAdmin();
  if (!sb) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

  const { data, error } = await sb
    .from("bundles")
    .select(
      "id, slug, name, tagline, status, price_cents, currency, purchase_count, sort_order, stripe_product_id, stripe_price_id, sample_prompts, created_at, updated_at",
    )
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const bundles = data ?? [];
  const items = await fetchItems(sb, bundles.map((b) => b.id));
  const bundlesOut = bundles.map((b) => ({
    ...b,
    items: (items.get(b.id) ?? []).map((it) => ({
      kind: it.kind,
      slug: it.item_slug,
      sortOrder: it.sort_order,
    })),
  }));
  return NextResponse.json({ bundles: bundlesOut });
}

interface BundlePayload {
  slug?: string;
  name?: string;
  tagline?: string;
  description_md?: string;
  hero_subtitle?: string;
  hero_image_url?: string;
  price_cents?: number;
  currency?: string;
  items?: unknown;
  // Legacy: kept so existing scripts/curl examples keep working — gets
  // normalized to items as connector entries.
  listing_slugs?: string[];
  sort_order?: number;
}

export async function POST(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sb = getSupabaseAdmin();
  if (!sb) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

  let body: BundlePayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  for (const k of ["slug", "name", "tagline", "description_md", "price_cents"] as const) {
    if (body[k] === undefined || body[k] === null) {
      return NextResponse.json({ error: `${k} is required` }, { status: 400 });
    }
  }
  if (typeof body.price_cents !== "number" || body.price_cents <= 0) {
    return NextResponse.json({ error: "price_cents must be a positive integer" }, { status: 400 });
  }

  // Normalize items: prefer `items[]`, fall back to legacy `listing_slugs[]`.
  let rawItems: unknown = body.items;
  if (!rawItems && Array.isArray(body.listing_slugs)) {
    rawItems = body.listing_slugs.map((slug) => ({ kind: "connector", slug }));
  }
  const itemsRes = validateBundleItems(rawItems);
  if (!itemsRes.ok) {
    return NextResponse.json({ error: "Invalid items", details: itemsRes.errors }, { status: 400 });
  }

  // Soft-validate that each referenced item resolves. We collect warnings
  // for missing items but still allow the insert so admins can stage
  // bundles that point at items not yet in the catalog (e.g. a skill
  // markdown landing in a follow-up PR).
  const warnings: string[] = [];
  await Promise.all(
    itemsRes.data.map(async (it) => {
      const ok = await bundleItemExists(it.kind, it.slug);
      if (!ok) warnings.push(`${it.kind}:${it.slug} not found`);
    }),
  );

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

  const linkRows = itemsRes.data.map((it, i) => ({
    bundle_id: insert.data.id,
    kind: it.kind,
    item_slug: it.slug,
    sort_order: it.sortOrder ?? i,
  }));
  const linkRes = await sb.from("bundle_listings").insert(linkRows);
  if (linkRes.error) {
    // Roll back the bundle so we don't end up with an empty bundle row.
    await sb.from("bundles").delete().eq("id", insert.data.id);
    return NextResponse.json({ error: linkRes.error.message }, { status: 500 });
  }

  return NextResponse.json({
    id: insert.data.id,
    slug: insert.data.slug,
    status: "draft",
    warnings,
  });
}

export async function PATCH(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sb = getSupabaseAdmin();
  if (!sb) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

  let body: {
    id?: string;
    action?: string;
    items?: unknown;
    samplePrompts?: unknown;
    sample_prompts?: unknown;
  };
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

  if (body.action === "update") {
    // PATCH-style update: caller may supply items, samplePrompts, or
    // both. At least one is required; everything else stays untouched.
    const promptsRaw = body.samplePrompts ?? body.sample_prompts;
    const hasItems = body.items !== undefined;
    const hasPrompts = promptsRaw !== undefined;
    if (!hasItems && !hasPrompts) {
      return NextResponse.json(
        { error: "items or samplePrompts required for action=update" },
        { status: 400 },
      );
    }

    const warnings: string[] = [];

    if (hasPrompts) {
      if (!Array.isArray(promptsRaw)) {
        return NextResponse.json(
          { error: "samplePrompts must be an array of strings" },
          { status: 400 },
        );
      }
      const cleaned = (promptsRaw as unknown[])
        .filter((p): p is string => typeof p === "string" && p.trim().length > 0)
        .map((p) => p.trim().slice(0, 1000));
      const upd = await sb
        .from("bundles")
        .update({ sample_prompts: cleaned })
        .eq("id", bundle.id);
      if (upd.error) {
        return NextResponse.json({ error: upd.error.message }, { status: 500 });
      }
    }

    if (hasItems) {
      const itemsRes = validateBundleItems(body.items);
      if (!itemsRes.ok) {
        return NextResponse.json({ error: "Invalid items", details: itemsRes.errors }, { status: 400 });
      }
      await Promise.all(
        itemsRes.data.map(async (it) => {
          const ok = await bundleItemExists(it.kind, it.slug);
          if (!ok) warnings.push(`${it.kind}:${it.slug} not found`);
        }),
      );

      // Replace-all strategy: delete then insert. Simpler than diffing and
      // safe because the table has no FK fanout — only bundle_listings
      // itself references these rows.
      const del = await sb.from("bundle_listings").delete().eq("bundle_id", bundle.id);
      if (del.error) return NextResponse.json({ error: del.error.message }, { status: 500 });
      const linkRows = itemsRes.data.map((it, i) => ({
        bundle_id: bundle.id,
        kind: it.kind,
        item_slug: it.slug,
        sort_order: it.sortOrder ?? i,
      }));
      if (linkRows.length > 0) {
        const ins = await sb.from("bundle_listings").insert(linkRows);
        if (ins.error) return NextResponse.json({ error: ins.error.message }, { status: 500 });
      }
      return NextResponse.json({ ok: true, count: linkRows.length, warnings });
    }

    return NextResponse.json({ ok: true });
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
