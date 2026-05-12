import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { isBundleItemKind } from "@/lib/marketplace/bundleItems";
import { rowToProposal, type ProposalRow } from "@/lib/marketplace/proposals";

export const runtime = "nodejs";

/** POST /api/marketplace/admin/proposals/:id/approve?key=...
 *
 *  The one-click "Publish" handler. Turns a `bundle_proposals` row
 *  (status=pending) into a live `bundles` row (status=draft) + its
 *  `bundle_listings` items, then flips the proposal to `approved` and
 *  links them via `published_bundle_id`.
 *
 *  Slug collision handling: if `bundles.slug` is already taken, we
 *  append `-2`, `-3`, … until we find a free one. This lets Claude
 *  propose the same slug twice without forcing a rejection.
 *
 *  Response:
 *    { bundle: { id, slug }, redirectTo: "/<lang>/stacks/<slug>" }
 *
 *  The newly created bundle is in `draft` status (NOT auto-published
 *  to Stripe). JM still has to click "Publish" in the bundles editor
 *  to flip it to `active` and lazy-create the Stripe Product + Price.
 *  That's intentional — approving the proposal is a content decision,
 *  publishing is a revenue decision, and bundling them would make the
 *  Stripe failure mode block the content move.
 */

function authorized(req: Request): boolean {
  const url = new URL(req.url);
  const provided = url.searchParams.get("key") ?? req.headers.get("x-api-key");
  const expected = process.env.DISCOVERY_INGEST_KEY;
  return !!expected && provided === expected;
}

async function uniqueSlug(
  sb: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  base: string,
): Promise<string> {
  // Cheap loop — bundles are O(10) so the existence check is fast and
  // we'll converge in 1-2 iterations in practice. Cap at 50 to avoid
  // an unbounded loop if something is misconfigured.
  let candidate = base;
  for (let n = 2; n <= 50; n++) {
    const { data } = await sb
      .from("bundles")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (!data) return candidate;
    candidate = `${base}-${n}`;
  }
  // Last-ditch: throw to caller, which surfaces a 500. Realistically
  // unreachable — if you have 50 sales-stack-N bundles, you have other
  // problems.
  throw new Error(`Could not generate unique slug from base "${base}"`);
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const sb = getSupabaseAdmin();
  if (!sb) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  const { id } = await ctx.params;
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  // Optional `?lang=es` so the redirect points at the user's locale.
  // Default to `es` since JM works in Spanish locale.
  const url = new URL(req.url);
  const lang = url.searchParams.get("lang") === "en" ? "en" : "es";

  // 1. Load the proposal — must be pending.
  const propRes = await sb
    .from("bundle_proposals")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (propRes.error) {
    return NextResponse.json({ error: propRes.error.message }, { status: 500 });
  }
  if (!propRes.data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const proposal = rowToProposal(propRes.data as ProposalRow);
  if (proposal.status !== "pending") {
    return NextResponse.json(
      { error: `Proposal is ${proposal.status}, only pending can be approved` },
      { status: 409 },
    );
  }
  if (proposal.proposedItems.length === 0) {
    return NextResponse.json(
      { error: "Proposal has no items — cannot publish" },
      { status: 400 },
    );
  }

  // 2. Resolve slug collision.
  let slug: string;
  try {
    slug = await uniqueSlug(sb, proposal.slug);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Slug error" },
      { status: 500 },
    );
  }

  // 3. Insert the bundle row (status=draft, no Stripe IDs yet).
  const bundleIns = await sb
    .from("bundles")
    .insert({
      slug,
      name: proposal.name,
      tagline: proposal.tagline,
      description_md: proposal.descriptionMd,
      hero_subtitle: null,
      hero_image_url: null,
      price_cents: proposal.priceCents,
      currency: proposal.currency,
      status: "draft",
      sort_order: 0,
      sample_prompts: proposal.samplePrompts,
    })
    .select("id, slug")
    .single();
  if (bundleIns.error) {
    return NextResponse.json({ error: bundleIns.error.message }, { status: 500 });
  }
  const newBundle = bundleIns.data as { id: string; slug: string };

  // 4. Insert the item link rows, preserving sort order from the
  // proposal. We re-validate kind here as a belt-and-suspenders check
  // — the JSON could have been hand-edited via PATCH between insert
  // and approval.
  const linkRows = proposal.proposedItems
    .filter((it) => isBundleItemKind(it.kind))
    .map((it, i) => ({
      bundle_id: newBundle.id,
      kind: it.kind,
      item_slug: it.slug,
      sort_order: it.sortOrder ?? i,
    }));
  if (linkRows.length === 0) {
    // Roll back the bundle so we don't leave an empty pack lying around.
    await sb.from("bundles").delete().eq("id", newBundle.id);
    return NextResponse.json(
      { error: "No valid items in proposal" },
      { status: 400 },
    );
  }
  const linkIns = await sb.from("bundle_listings").insert(linkRows);
  if (linkIns.error) {
    await sb.from("bundles").delete().eq("id", newBundle.id);
    return NextResponse.json({ error: linkIns.error.message }, { status: 500 });
  }

  // 5. Flip the proposal to approved + link it back to the new bundle.
  const propUpd = await sb
    .from("bundle_proposals")
    .update({
      status: "approved",
      published_bundle_id: newBundle.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (propUpd.error) {
    // The bundle is already live in `draft` status; surface the error
    // but don't roll back — the reviewer can clean up the proposal row
    // manually in the worst case. The bundle exists either way.
    return NextResponse.json(
      {
        error: `Bundle created but proposal status update failed: ${propUpd.error.message}`,
        bundle: { id: newBundle.id, slug: newBundle.slug },
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    bundle: { id: newBundle.id, slug: newBundle.slug },
    redirectTo: `/${lang}/stacks/${newBundle.slug}`,
  });
}
