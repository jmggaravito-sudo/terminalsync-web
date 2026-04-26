import { NextResponse } from "next/server";
import { authenticate } from "@/lib/marketplace/auth";
import { validateListingDraft } from "@/lib/marketplace/schema";
import {
  validateManifest,
  manifestChecksum,
  type McpManifest,
} from "@/lib/marketplace/manifest";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

/** GET /api/marketplace/listings?status=approved
 *  Public list. Defaults to approved-only; pass status=mine to get the
 *  authenticated publisher's own drafts/pending. */
export async function GET(req: Request) {
  const sb = getSupabaseAdmin();
  if (!sb) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

  const url = new URL(req.url);
  const status = url.searchParams.get("status") ?? "approved";

  if (status === "mine") {
    const user = await authenticate(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const pub = await sb
      .from("publishers")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (pub.error) return NextResponse.json({ error: pub.error.message }, { status: 500 });
    if (!pub.data) return NextResponse.json({ listings: [] });
    const { data, error } = await sb
      .from("connector_listings")
      .select("*")
      .eq("publisher_id", pub.data.id)
      .order("updated_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ listings: data });
  }

  const { data, error } = await sb
    .from("connector_listings")
    .select("id, slug, name, tagline, category, logo_url, pricing_type, price_cents, currency, install_count, rating_avg, rating_count, approved_at")
    .eq("status", "approved")
    .order("install_count", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ listings: data });
}

/** POST /api/marketplace/listings — submit a new listing as the current
 *  publisher. Creates the listing in 'pending' status and the first
 *  version row in one transaction-ish flow. */
export async function POST(req: Request) {
  const user = await authenticate(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sb = getSupabaseAdmin();
  if (!sb) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

  let body: { listing?: unknown; manifest?: unknown; version?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const v = validateListingDraft(body.listing);
  if (!v.ok) return NextResponse.json({ errors: v.errors }, { status: 400 });

  const mv = validateManifest(body.manifest);
  if (!mv.ok) return NextResponse.json({ errors: mv.errors.map((m) => ({ field: "manifest", message: m })) }, { status: 400 });

  const version = (body.version ?? "1.0.0").trim();
  if (!/^\d+\.\d+\.\d+$/.test(version)) {
    return NextResponse.json({ error: "version must be semver (e.g. 1.0.0)" }, { status: 400 });
  }

  const pub = await sb
    .from("publishers")
    .select("id, payout_enabled")
    .eq("user_id", user.id)
    .maybeSingle();
  if (pub.error) return NextResponse.json({ error: pub.error.message }, { status: 500 });
  if (!pub.data) return NextResponse.json({ error: "Onboard as a publisher first" }, { status: 403 });

  // Paid listings require Stripe payout enabled — otherwise we'd accept
  // money we couldn't legally route to them.
  if (v.data.pricingType === "one_time" && !pub.data.payout_enabled) {
    return NextResponse.json(
      { error: "Complete Stripe Connect onboarding before submitting paid listings" },
      { status: 403 },
    );
  }

  const insert = await sb
    .from("connector_listings")
    .insert({
      publisher_id: pub.data.id,
      slug: v.data.slug,
      name: v.data.name,
      tagline: v.data.tagline,
      category: v.data.category,
      logo_url: v.data.logoUrl,
      screenshots: v.data.screenshots ?? [],
      description_md: v.data.descriptionMd,
      setup_md: v.data.setupMd,
      status: "pending",
      pricing_type: v.data.pricingType,
      price_cents: v.data.priceCents ?? null,
      currency: "usd",
    })
    .select("id, slug")
    .single();
  if (insert.error) return NextResponse.json({ error: insert.error.message }, { status: 500 });

  const manifestJson = body.manifest as McpManifest;
  const checksum = manifestChecksum(manifestJson);
  const versionInsert = await sb.from("connector_versions").insert({
    listing_id: insert.data.id,
    version,
    manifest_json: manifestJson,
    checksum,
  });
  if (versionInsert.error) {
    // Roll back the listing — Postgres doesn't give us a true tx via the
    // JS client, but we can delete the orphan to keep state clean.
    await sb.from("connector_listings").delete().eq("id", insert.data.id);
    return NextResponse.json({ error: versionInsert.error.message }, { status: 500 });
  }

  return NextResponse.json({
    listingId: insert.data.id,
    slug: insert.data.slug,
    status: "pending",
    warnings: mv.warnings,
  });
}
