import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

/**
 * GET /api/admin/trends?source=...&status=...&signal_type=...&days=7
 *
 * Returns the trend feed for /[lang]/admin/trends.
 *
 * No auth gate: every signal we surface here is already public (HN,
 * Reddit, GitHub feeds), the page is robots-noindex, and JM is the
 * only person who knows the URL. Login was blocking access for the
 * one user who actually uses this dashboard.
 */
export async function GET(req: Request) {
  const sb = getSupabaseAdmin();
  if (!sb)
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

  const url = new URL(req.url);
  const source = url.searchParams.get("source"); // null = all
  const status = url.searchParams.get("status") ?? "pending";
  const signalType = url.searchParams.get("signal_type");
  const days = Math.max(1, Math.min(30, Number(url.searchParams.get("days") ?? "7")));

  const sinceIso = new Date(Date.now() - days * 86400_000).toISOString();

  let q = sb
    .from("trend_signals")
    .select(
      "id,source,source_url,source_subtype,title,summary,score,signal_type,tags,review_status,review_notes,captured_at",
    )
    .gte("captured_at", sinceIso)
    .order("score", { ascending: false })
    .order("captured_at", { ascending: false })
    .limit(200);

  if (source) q = q.eq("source", source);
  if (status !== "all") q = q.eq("review_status", status);
  if (signalType) q = q.eq("signal_type", signalType);

  const { data: items, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Per-source counts in the same window. Issued in parallel so the
  // page header tabs show "github (24) · reddit (38) · ..." without
  // an extra round-trip.
  const sources = ["github", "hackernews", "reddit", "youtube", "product_hunt"] as const;
  const counts = await Promise.all(
    sources.map((s) =>
      sb
        .from("trend_signals")
        .select("id", { count: "exact", head: true })
        .eq("source", s)
        .eq("review_status", "pending")
        .gte("captured_at", sinceIso),
    ),
  );

  // Cross-source: titles that appeared in 2+ sources. View already
  // computes the aggregation; we just take the top 20 by source_count.
  const { data: crossSource } = await sb
    .from("trend_cross_source_signals")
    .select("*")
    .order("source_count", { ascending: false })
    .order("total_score", { ascending: false })
    .limit(20);

  return NextResponse.json({
    items: items ?? [],
    crossSource: crossSource ?? [],
    counts: Object.fromEntries(
      sources.map((s, i) => [s, counts[i].count ?? 0]),
    ),
    window: { days, since: sinceIso },
  });
}

/**
 * PATCH /api/admin/trends
 * Body: { id, action: 'keep' | 'archive' | 'promote', notes? }
 *
 * State machine for the queue. 'promote' is informational for now —
 * it just flags the signal so the dashboard can highlight things JM
 * marked as worth chasing. Wiring to outreach / connector listings is
 * a separate step. No auth — same reasoning as GET.
 */
export async function PATCH(req: Request) {
  const sb = getSupabaseAdmin();
  if (!sb)
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

  const body = await req.json().catch(() => ({}));
  const { id, action, notes } = body as {
    id?: string;
    action?: string;
    notes?: string;
  };
  if (!id || typeof id !== "string")
    return NextResponse.json({ error: "id required" }, { status: 400 });
  const map: Record<string, string> = {
    keep: "kept",
    archive: "archived",
    promote: "promoted",
  };
  if (!action || !map[action])
    return NextResponse.json(
      { error: "action must be keep|archive|promote" },
      { status: 400 },
    );

  const { error } = await sb
    .from("trend_signals")
    .update({
      review_status: map[action],
      review_notes: notes ?? null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
