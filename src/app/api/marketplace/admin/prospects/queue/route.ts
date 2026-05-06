import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

/** GET /api/marketplace/admin/prospects/queue?status=pending&key=...
 *
 *  Token-gated bypass while admin login UI isn't reliable. Returns up to
 *  100 prospects for the requested status, sorted by intent_score desc
 *  (highest-signal first).
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const provided = url.searchParams.get("key") ?? req.headers.get("x-api-key");
  const expected = process.env.PROSPECTS_INGEST_KEY ?? process.env.DISCOVERY_INGEST_KEY;
  if (!expected || !provided || provided !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = getSupabaseAdmin();
  if (!sb) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

  const status = url.searchParams.get("status") ?? "pending";
  if (!["pending", "qualified", "contacted", "replied", "converted", "rejected"].includes(status)) {
    return NextResponse.json({ error: "invalid status" }, { status: 400 });
  }

  const { data: items, error } = await sb
    .from("prospects_no_dev")
    .select("*")
    .eq("status", status)
    .order("intent_score", { ascending: false, nullsFirst: false })
    .order("discovered_at", { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Aggregate counts for the header
  const [pending, qualified, contacted, replied] = await Promise.all([
    sb.from("prospects_no_dev").select("id", { count: "exact", head: true }).eq("status", "pending"),
    sb.from("prospects_no_dev").select("id", { count: "exact", head: true }).eq("status", "qualified"),
    sb.from("prospects_no_dev").select("id", { count: "exact", head: true }).eq("status", "contacted"),
    sb.from("prospects_no_dev").select("id", { count: "exact", head: true }).eq("status", "replied"),
  ]);

  return NextResponse.json({
    items: items ?? [],
    stats: {
      pending: pending.count ?? 0,
      qualified: qualified.count ?? 0,
      contacted: contacted.count ?? 0,
      replied: replied.count ?? 0,
    },
  });
}
