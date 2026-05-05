import { NextResponse } from "next/server";
import { authenticate, isAdmin } from "@/lib/marketplace/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

/** GET /api/marketplace/admin/discovery/queue?type=connectors|skills&status=pending|approved|rejected
 *
 *  Admin-only feed of discovered items. Default status=pending.
 *  Sorted by classification_confidence desc → highest-signal items first.
 */
export async function GET(req: Request) {
  const user = await authenticate(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(user)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const sb = getSupabaseAdmin();
  if (!sb) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

  const url = new URL(req.url);
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

  // Counters for both types so the page header shows totals at a glance.
  const [pendingConn, pendingSkills, approvedToday, rejectedToday] = await Promise.all([
    sb.from("discovery_connectors").select("id", { count: "exact", head: true }).eq("review_status", "pending"),
    sb.from("discovery_skills").select("id", { count: "exact", head: true }).eq("review_status", "pending"),
    sb.from(table).select("id", { count: "exact", head: true }).eq("review_status", "approved").gte("reviewed_at", todayIsoStart()),
    sb.from(table).select("id", { count: "exact", head: true }).eq("review_status", "rejected").gte("reviewed_at", todayIsoStart()),
  ]);

  return NextResponse.json({
    items: items ?? [],
    stats: {
      pendingConnectors: pendingConn.count ?? 0,
      pendingSkills: pendingSkills.count ?? 0,
      approvedTodayInType: approvedToday.count ?? 0,
      rejectedTodayInType: rejectedToday.count ?? 0,
    },
  });
}

function todayIsoStart(): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}
