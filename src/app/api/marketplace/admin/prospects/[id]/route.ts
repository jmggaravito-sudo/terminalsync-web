import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

interface Params { params: Promise<{ id: string }> }

/** PATCH /api/marketplace/admin/prospects/{id}?key=...
 *
 *  Token-gated transition. Body: { action, notes? }.
 *  Actions:
 *    - qualify  → status = 'qualified' (will be picked up by outreach cron)
 *    - reject   → status = 'rejected', save reason in rejection_reason
 *    - convert  → status = 'converted', stamp converted_at
 */
export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params;
  const url = new URL(req.url);
  const provided = url.searchParams.get("key") ?? req.headers.get("x-api-key");
  const expected = process.env.PROSPECTS_INGEST_KEY ?? process.env.DISCOVERY_INGEST_KEY;
  if (!expected || !provided || provided !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = getSupabaseAdmin();
  if (!sb) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

  let body: { action?: string; notes?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const action = body.action;
  if (!["qualify", "reject", "convert"].includes(action ?? "")) {
    return NextResponse.json({ error: "action must be qualify|reject|convert" }, { status: 400 });
  }

  const update: Record<string, unknown> = {
    reviewed_at: new Date().toISOString(),
  };
  if (action === "qualify") update.status = "qualified";
  if (action === "reject") {
    update.status = "rejected";
    update.rejection_reason = body.notes ?? null;
  }
  if (action === "convert") {
    update.status = "converted";
    update.converted_at = new Date().toISOString();
  }

  const { error } = await sb.from("prospects_no_dev").update(update).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, status: update.status });
}
