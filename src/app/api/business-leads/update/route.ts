import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { authenticate, isAdmin } from "@/lib/marketplace/auth";
import { isBusinessLeadStatus, BUSINESS_LEAD_STATUSES, type BusinessLeadStatus } from "@/lib/businessLeads/types";

export const runtime = "nodejs";
export const revalidate = 0;

type UpdatePayload = {
  id: string;
  status: BusinessLeadStatus;
  notes?: string | null;
};

export async function POST(req: Request) {
  const user = await authenticate(req);
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = getSupabaseAdmin();
  if (!sb) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

  let body: UpdatePayload;
  try {
    body = (await req.json()) as UpdatePayload;
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  if (!body.id) return NextResponse.json({ error: "missing id" }, { status: 400 });
  if (!isBusinessLeadStatus(body.status)) {
    return NextResponse.json(
      { error: `invalid status, expected one of ${BUSINESS_LEAD_STATUSES.join(", ")}` },
      { status: 400 },
    );
  }

  const patch: Record<string, unknown> = { status: body.status, updated_at: new Date().toISOString() };
  if (body.notes !== undefined) patch.notes = body.notes;
  if (body.status === "contactado") patch.contacted_at = new Date().toISOString();

  const { data, error } = await sb
    .from("business_leads")
    .update(patch)
    .eq("id", body.id)
    .select("id,status,name,phone,phone_e164,notes,contacted_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, lead: data });
}
