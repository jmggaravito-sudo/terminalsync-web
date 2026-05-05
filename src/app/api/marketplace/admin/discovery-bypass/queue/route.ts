import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

/** GET /api/marketplace/admin/discovery-bypass/queue?type=...&status=...&key=...
 *
 *  Token-gated emergency bypass when Supabase auth UI isn't working.
 *  Accepts the same DISCOVERY_INGEST_KEY as the n8n ingest endpoint —
 *  one secret, one source of trust. Server-side fetch only; the client
 *  never sees Supabase service-role creds.
 *
 *  TODO: rotate to a separate ADMIN_BYPASS_KEY once login is stable
 *  again, and remove this route.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const provided = url.searchParams.get("key") ?? req.headers.get("x-api-key");
  const expected = process.env.DISCOVERY_INGEST_KEY;
  if (!expected || !provided || provided !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = getSupabaseAdmin();
  if (!sb) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

  const type = url.searchParams.get("type") ?? "connectors";
  if (type !== "connectors" && type !== "skills") {
    return NextResponse.json({ error: "type must be 'connectors' or 'skills'" }, { status: 400 });
  }
  const status = url.searchParams.get("status") ?? "pending";
  if (!["pending", "approved", "rejected", "ignored"].includes(status)) {
    return NextResponse.json({ error: "invalid status" }, { status: 400 });
  }

  const table = type === "connectors" ? "discovery_connectors" : "discovery_skills";

  const { data: items, error } = await sb
    .from(table)
    .select("*")
    .eq("review_status", status)
    .order("classification_confidence", { ascending: false, nullsFirst: false })
    .order("discovered_at", { ascending: false })
    .limit(200);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const [pendingConn, pendingSkills] = await Promise.all([
    sb.from("discovery_connectors").select("id", { count: "exact", head: true }).eq("review_status", "pending"),
    sb.from("discovery_skills").select("id", { count: "exact", head: true }).eq("review_status", "pending"),
  ]);

  return NextResponse.json({
    items: items ?? [],
    stats: {
      pendingConnectors: pendingConn.count ?? 0,
      pendingSkills: pendingSkills.count ?? 0,
    },
  });
}
