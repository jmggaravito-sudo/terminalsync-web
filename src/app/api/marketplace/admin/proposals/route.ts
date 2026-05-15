import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { rowToProposal, type ProposalRow } from "@/lib/marketplace/proposals";

export const runtime = "nodejs";

/** Admin queue for bundle proposals. Mirrors the auth pattern of
 *  /api/marketplace/admin/bundles — `?key=<DISCOVERY_INGEST_KEY>` in
 *  the URL or `X-API-Key` header, no Supabase auth required.
 *
 *  GET    /api/marketplace/admin/proposals?key=...&status=pending
 *           → returns the queue, sorted newest-first.
 */

function authorized(req: Request): boolean {
  const url = new URL(req.url);
  const provided = url.searchParams.get("key") ?? req.headers.get("x-api-key");
  const expected = process.env.DISCOVERY_INGEST_KEY;
  return !!expected && provided === expected;
}

const ALLOWED_STATUSES = new Set([
  "pending",
  "approved",
  "rejected",
  "superseded",
]);

export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const sb = getSupabaseAdmin();
  if (!sb) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const url = new URL(req.url);
  const status = url.searchParams.get("status") ?? "pending";
  if (!ALLOWED_STATUSES.has(status)) {
    return NextResponse.json({ error: "invalid status" }, { status: 400 });
  }

  const res = await sb
    .from("bundle_proposals")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false })
    .limit(200);

  if (res.error) {
    return NextResponse.json({ error: res.error.message }, { status: 500 });
  }

  const proposals = (res.data ?? []).map((row) =>
    rowToProposal(row as ProposalRow),
  );

  // Lightweight counters so the page can show "23 pending / 4 approved
  // today" without a second request. Same idea as the discovery queue.
  const counts = await Promise.all([
    sb
      .from("bundle_proposals")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    sb
      .from("bundle_proposals")
      .select("id", { count: "exact", head: true })
      .eq("status", "approved"),
    sb
      .from("bundle_proposals")
      .select("id", { count: "exact", head: true })
      .eq("status", "rejected"),
  ]);

  return NextResponse.json({
    proposals,
    stats: {
      pending: counts[0].count ?? 0,
      approved: counts[1].count ?? 0,
      rejected: counts[2].count ?? 0,
    },
  });
}
