import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { isOpStatus, OP_STATUSES, type OpStatus } from "@/lib/outreach/types";

export const runtime = "nodejs";
export const revalidate = 0;

const SELECT_COLS = [
  "id",
  "handle",
  "platform",
  "name",
  "subscribers",
  "niche",
  "track",
  "language",
  "source_keyword",
  "profile_url",
  "discovered_at",
  "op_status",
  "op_hook",
  "op_notes",
  "op_last_message",
  "op_contacted_at",
].join(",");

export async function GET(req: Request) {
  const sb = getSupabaseAdmin();
  if (!sb) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

  const url = new URL(req.url);
  const status = url.searchParams.get("status") ?? "pendiente";
  if (!isOpStatus(status)) {
    return NextResponse.json(
      { error: `invalid status, expected one of ${OP_STATUSES.join(", ")}` },
      { status: 400 }
    );
  }

  const [itemsRes, ...countsRes] = await Promise.all([
    sb
      .from("agency_influencers")
      .select(SELECT_COLS)
      .eq("op_status", status)
      .order("subscribers", { ascending: false, nullsFirst: false }),
    ...OP_STATUSES.map((s) =>
      sb.from("agency_influencers").select("id", { count: "exact", head: true }).eq("op_status", s)
    ),
  ]);

  if (itemsRes.error) return NextResponse.json({ error: itemsRes.error.message }, { status: 500 });

  const counts: Record<OpStatus, number> = {
    pendiente: 0,
    enviado: 0,
    respondio: 0,
    descartado: 0,
  };
  OP_STATUSES.forEach((s, i) => {
    counts[s] = countsRes[i]?.count ?? 0;
  });

  return NextResponse.json({ items: itemsRes.data ?? [], counts });
}
