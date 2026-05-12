import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { isBundleItemKind } from "@/lib/marketplace/bundleItems";
import { rowToProposal, type ProposalRow } from "@/lib/marketplace/proposals";

export const runtime = "nodejs";

/** PATCH /api/marketplace/admin/proposals/:id?key=...
 *
 *  Two flavors of update via a single endpoint:
 *
 *  1. Reject a proposal:
 *       { action: "reject", reviewerNotes?: string }
 *
 *  2. Edit fields before publishing (in-place tweaks JM makes when the
 *     AI nailed 90% of it):
 *       { action: "edit", name?, slug?, tagline?, descriptionMd?,
 *         setupMd?, samplePrompts?, proposedItems?, priceCents? }
 *
 *  Approval lives in its own route (`/approve`) because it has side
 *  effects on the live `bundles` + `bundle_listings` tables and needs
 *  a separate audit trail.
 */

function authorized(req: Request): boolean {
  const url = new URL(req.url);
  const provided = url.searchParams.get("key") ?? req.headers.get("x-api-key");
  const expected = process.env.DISCOVERY_INGEST_KEY;
  return !!expected && provided === expected;
}

interface EditBody {
  action?: string;
  reviewerNotes?: unknown;
  name?: unknown;
  slug?: unknown;
  tagline?: unknown;
  descriptionMd?: unknown;
  setupMd?: unknown;
  samplePrompts?: unknown;
  proposedItems?: unknown;
  priceCents?: unknown;
  persona?: unknown;
  personaLabel?: unknown;
  painPoint?: unknown;
}

function clean(v: unknown, max = 8000): string | undefined {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  if (t.length === 0) return undefined;
  return t.slice(0, max);
}

export async function PATCH(
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

  let body: EditBody;
  try {
    body = (await req.json()) as EditBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const action = typeof body.action === "string" ? body.action : "";

  if (action === "reject") {
    const notes = clean(body.reviewerNotes, 2000) ?? null;
    const upd = await sb
      .from("bundle_proposals")
      .update({
        status: "rejected",
        reviewer_notes: notes,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .maybeSingle();
    if (upd.error) {
      return NextResponse.json({ error: upd.error.message }, { status: 500 });
    }
    if (!upd.data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({
      proposal: rowToProposal(upd.data as ProposalRow),
    });
  }

  if (action === "edit") {
    // Build a partial update — only fields the caller sent get touched,
    // so JM can save just the tagline without re-supplying everything.
    const patch: Record<string, unknown> = {};

    const name = clean(body.name, 200);
    if (name !== undefined) patch.name = name;
    const slug = clean(body.slug, 80);
    if (slug !== undefined) patch.slug = slug;
    const tagline = clean(body.tagline, 400);
    if (tagline !== undefined) patch.tagline = tagline;
    const descriptionMd = clean(body.descriptionMd, 8000);
    if (descriptionMd !== undefined) patch.description_md = descriptionMd;
    const setupMd = clean(body.setupMd, 8000);
    if (setupMd !== undefined) patch.setup_md = setupMd;
    const persona = clean(body.persona, 60);
    if (persona !== undefined) patch.persona = persona;
    const personaLabel = clean(body.personaLabel, 160);
    if (personaLabel !== undefined) patch.persona_label = personaLabel;
    const painPoint = clean(body.painPoint, 200);
    if (painPoint !== undefined) patch.pain_point = painPoint;

    if (body.samplePrompts !== undefined) {
      if (!Array.isArray(body.samplePrompts)) {
        return NextResponse.json(
          { error: "samplePrompts must be an array of strings" },
          { status: 400 },
        );
      }
      patch.sample_prompts = body.samplePrompts
        .filter((p): p is string => typeof p === "string" && p.trim().length > 0)
        .map((p) => p.trim().slice(0, 1000));
    }

    if (body.proposedItems !== undefined) {
      if (!Array.isArray(body.proposedItems)) {
        return NextResponse.json(
          { error: "proposedItems must be an array" },
          { status: 400 },
        );
      }
      const cleaned: Array<{
        kind: string;
        slug: string;
        sortOrder: number;
        whyItHelps: string;
      }> = [];
      body.proposedItems.forEach((entry, i) => {
        if (!entry || typeof entry !== "object") return;
        const ent = entry as Record<string, unknown>;
        const kind = ent.kind;
        const itemSlug = typeof ent.slug === "string" ? ent.slug.trim() : "";
        if (!isBundleItemKind(kind) || !itemSlug) return;
        const sortRaw = ent.sortOrder ?? ent.sort_order;
        const sortOrder =
          typeof sortRaw === "number" && Number.isFinite(sortRaw) ? sortRaw : i;
        const whyRaw = ent.whyItHelps ?? ent.why_it_helps;
        const whyItHelps =
          typeof whyRaw === "string" ? whyRaw.trim().slice(0, 500) : "";
        cleaned.push({ kind, slug: itemSlug, sortOrder, whyItHelps });
      });
      if (cleaned.length === 0) {
        return NextResponse.json(
          { error: "proposedItems must contain at least one valid item" },
          { status: 400 },
        );
      }
      patch.proposed_items = cleaned;
    }

    if (body.priceCents !== undefined) {
      const pc = body.priceCents;
      if (typeof pc !== "number" || !Number.isInteger(pc) || pc <= 0) {
        return NextResponse.json(
          { error: "priceCents must be a positive integer" },
          { status: 400 },
        );
      }
      patch.price_cents = pc;
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "no editable fields supplied" }, { status: 400 });
    }

    const upd = await sb
      .from("bundle_proposals")
      .update(patch)
      .eq("id", id)
      .eq("status", "pending")
      .select("*")
      .maybeSingle();
    if (upd.error) {
      return NextResponse.json({ error: upd.error.message }, { status: 500 });
    }
    if (!upd.data) {
      return NextResponse.json(
        { error: "Not found or not pending" },
        { status: 404 },
      );
    }
    return NextResponse.json({
      proposal: rowToProposal(upd.data as ProposalRow),
    });
  }

  return NextResponse.json(
    { error: `Unknown action: ${action || "(missing)"}` },
    { status: 400 },
  );
}
