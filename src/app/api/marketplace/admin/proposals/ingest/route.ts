import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { validateProposal, type ValidationError } from "@/lib/marketplace/schema";
import { proposalToInsertRow } from "@/lib/marketplace/proposals";

export const runtime = "nodejs";

/** POST /api/marketplace/admin/proposals/ingest
 *
 *  Called by the n8n bundle-curator workflow (server-to-server). Same
 *  auth shape as /api/marketplace/admin/discovery/ingest: shared secret
 *  in the X-API-Key header matching DISCOVERY_INGEST_KEY.
 *
 *  Body:
 *    { proposals: [{ persona, personaLabel, painPoint, name, slug,
 *                    tagline, descriptionMd, setupMd, samplePrompts,
 *                    proposedItems, priceCents?, currency?,
 *                    proposedBy? }, ...] }
 *
 *  Each proposal is validated independently. Failures don't block the
 *  rest of the batch — n8n gets back counts + per-row errors so a
 *  weekly run with one bad row still publishes the good ones.
 *
 *  We deliberately don't verify that item slugs exist in their pillar's
 *  source — Claude can be wrong, the reviewer catches it visually in
 *  the queue. Slug uniqueness is also NOT enforced at insert (only on
 *  approval) so a re-run of the same prompt batch lands safely.
 */
export async function POST(req: Request) {
  const provided = req.headers.get("x-api-key");
  const expected = process.env.DISCOVERY_INGEST_KEY;
  if (!expected) {
    return NextResponse.json(
      { error: "DISCOVERY_INGEST_KEY not configured on server" },
      { status: 503 },
    );
  }
  if (!provided || provided !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = getSupabaseAdmin();
  if (!sb) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  let body: { proposals?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!Array.isArray(body.proposals)) {
    return NextResponse.json(
      { error: "proposals must be an array" },
      { status: 400 },
    );
  }

  const errors: { index: number; field?: string; message: string }[] = [];
  const rows: Record<string, unknown>[] = [];

  body.proposals.forEach((raw, i) => {
    const res = validateProposal(raw);
    if (!res.ok) {
      for (const e of res.errors as ValidationError[]) {
        errors.push({ index: i, field: e.field, message: e.message });
      }
      return;
    }
    rows.push(proposalToInsertRow(res.data));
  });

  let inserted = 0;
  if (rows.length > 0) {
    const ins = await sb
      .from("bundle_proposals")
      .insert(rows)
      .select("id");
    if (ins.error) {
      return NextResponse.json({ error: ins.error.message }, { status: 500 });
    }
    inserted = ins.data?.length ?? 0;
  }

  return NextResponse.json({
    inserted,
    skipped: body.proposals.length - inserted,
    errors,
  });
}
