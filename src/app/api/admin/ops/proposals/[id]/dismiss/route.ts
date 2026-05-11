import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/ops/proposals/[id]/dismiss
 *
 * Marks a pending proposal as dismissed without touching n8n. Used
 * when JM reads a Claude-proposed fix and decides it's wrong or
 * unnecessary.
 */
export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 503 },
    );
  }
  const sb = createClient(url, key, { auth: { persistSession: false } });
  const { id } = await ctx.params;
  const { error } = await sb
    .from("ops_auto_actions")
    .update({
      status: "dismissed",
      applied_at: new Date().toISOString(),
      applied_by: "admin-dismiss",
    })
    .eq("id", id)
    .eq("kind", "proposal")
    .eq("status", "pending");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
