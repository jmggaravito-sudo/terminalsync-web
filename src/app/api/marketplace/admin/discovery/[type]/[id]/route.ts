import { NextResponse } from "next/server";
import { authenticate, isAdmin } from "@/lib/marketplace/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

interface Params { params: Promise<{ type: string; id: string }> }

/** PATCH /api/marketplace/admin/discovery/{type}/{id}
 *
 *  Admin transitions a discovery item.
 *  Body: { action: "approve" | "reject" | "ignore", notes?: string,
 *          marketplace_category?: string }
 *
 *  Approve = admin override-able category (because Gemini can be off).
 *  Reject  = admin discards (e.g. spam, low quality).
 *  Ignore  = admin saw it but won't action — useful for "already in
 *            the marketplace" cases without polluting the rejected list.
 */
export async function PATCH(req: Request, { params }: Params) {
  const { type, id } = await params;
  if (type !== "connectors" && type !== "skills") {
    return NextResponse.json({ error: "type must be 'connectors' or 'skills'" }, { status: 400 });
  }

  const user = await authenticate(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(user)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const sb = getSupabaseAdmin();
  if (!sb) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

  let body: { action?: string; notes?: string; marketplace_category?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!["approve", "reject", "ignore"].includes(body.action ?? "")) {
    return NextResponse.json({ error: "action must be approve | reject | ignore" }, { status: 400 });
  }

  const table = type === "connectors" ? "discovery_connectors" : "discovery_skills";
  const allowedConn = new Set(["productivity", "database", "automation", "storage", "messaging", "dev"]);
  const allowedSkill = new Set(["marketing", "dev", "productivity", "research", "design", "finance"]);

  const update: Record<string, unknown> = {
    review_status:
      body.action === "approve" ? "approved" : body.action === "reject" ? "rejected" : "ignored",
    review_notes: body.notes ?? null,
    reviewed_by: user.id,
    reviewed_at: new Date().toISOString(),
  };

  // Optionally update the marketplace category on approve (admin override).
  if (body.action === "approve" && typeof body.marketplace_category === "string") {
    const cat = body.marketplace_category.toLowerCase();
    const allowed = type === "connectors" ? allowedConn : allowedSkill;
    if (!allowed.has(cat)) {
      return NextResponse.json({ error: "invalid marketplace_category for this type" }, { status: 400 });
    }
    update.marketplace_category = cat;
  }

  const { error } = await sb.from(table).update(update).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, status: update.review_status });
}
