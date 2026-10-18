import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store", Pragma: "no-cache" },
  });
}

/** Hourly purge for already-inaccessible Team text deliveries past 7 days. */
export async function GET(req: Request) {
  const expected = process.env.CRON_SECRET ? `Bearer ${process.env.CRON_SECRET}` : "";
  if (!expected || req.headers.get("authorization") !== expected) return json({ error: "Unauthorized" }, 401);
  const sb = getSupabaseAdmin();
  if (!sb) return json({ error: "Cleanup unavailable" }, 503);
  const { data, error } = await sb.rpc("purge_expired_team_text_deliveries", { p_limit: 500 });
  if (error || typeof data !== "number" || !Number.isInteger(data) || data < 0 || data > 500) {
    return json({ error: "Cleanup unavailable" }, 503);
  }
  return json({ purged: data });
}
