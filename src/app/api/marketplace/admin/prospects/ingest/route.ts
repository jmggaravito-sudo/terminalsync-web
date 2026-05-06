import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

/** POST /api/marketplace/admin/prospects/ingest
 *
 *  Server-to-server endpoint for the n8n No-Dev Prospects workflow.
 *  Auth via X-API-Key matched against PROSPECTS_INGEST_KEY (or falls back
 *  to DISCOVERY_INGEST_KEY for now to share secrets while we're early).
 *
 *  Body: { items: [{...}] } — each row maps directly to a prospects_no_dev
 *  insert. Upserts on source_url so retries are safe.
 */
export async function POST(req: Request) {
  const provided = req.headers.get("x-api-key");
  const expected = process.env.PROSPECTS_INGEST_KEY ?? process.env.DISCOVERY_INGEST_KEY;
  if (!expected || !provided || provided !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = getSupabaseAdmin();
  if (!sb) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

  let body: { items?: unknown };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  if (!Array.isArray(body.items)) return NextResponse.json({ error: "items must be array" }, { status: 400 });

  const allowedPlatforms = new Set(["reddit", "indiehackers", "n8n_forum", "make_forum", "linkedin", "manual"]);
  const allowedLangs = new Set(["en", "es", "pt", "other"]);

  const rows: Record<string, unknown>[] = [];
  for (const raw of body.items as Record<string, unknown>[]) {
    if (!raw || typeof raw !== "object") continue;
    const platform = String(raw.source_platform ?? "").toLowerCase();
    if (!allowedPlatforms.has(platform)) continue;
    if (typeof raw.source_url !== "string" || !raw.source_url) continue;

    const language = typeof raw.language === "string" && allowedLangs.has(raw.language) ? raw.language : "en";
    const intent = typeof raw.intent_score === "number" ? Math.min(1, Math.max(0, raw.intent_score)) : null;

    rows.push({
      source_platform: platform,
      source_url: raw.source_url,
      source_post_id: typeof raw.source_post_id === "string" ? raw.source_post_id : null,
      name: typeof raw.name === "string" ? raw.name.slice(0, 200) : null,
      handle: typeof raw.handle === "string" ? raw.handle.slice(0, 100) : null,
      email: typeof raw.email === "string" ? raw.email.toLowerCase().slice(0, 200) : null,
      title: typeof raw.title === "string" ? raw.title.slice(0, 200) : null,
      company: typeof raw.company === "string" ? raw.company.slice(0, 200) : null,
      company_size: typeof raw.company_size === "string" ? raw.company_size : null,
      location: typeof raw.location === "string" ? raw.location.slice(0, 200) : null,
      language,
      profile_url: typeof raw.profile_url === "string" ? raw.profile_url : null,
      post_excerpt: typeof raw.post_excerpt === "string" ? raw.post_excerpt.slice(0, 1000) : null,
      post_date: typeof raw.post_date === "string" ? raw.post_date : null,
      pain_point: typeof raw.pain_point === "string" ? raw.pain_point.slice(0, 500) : null,
      ai_tools_mentioned: Array.isArray(raw.ai_tools_mentioned)
        ? (raw.ai_tools_mentioned as unknown[]).filter((v) => typeof v === "string").slice(0, 20)
        : [],
      intent_score: intent,
      is_non_dev: typeof raw.is_non_dev === "boolean" ? raw.is_non_dev : null,
      gemini_summary: typeof raw.gemini_summary === "string" ? raw.gemini_summary.slice(0, 1000) : null,
    });
  }

  if (rows.length === 0) return NextResponse.json({ inserted: 0, skipped: 0, total: 0 });

  const { data, error } = await sb
    .from("prospects_no_dev")
    .upsert(rows, { onConflict: "source_url", ignoreDuplicates: true })
    .select("id");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    inserted: data?.length ?? 0,
    skipped: rows.length - (data?.length ?? 0),
    total: rows.length,
  });
}
