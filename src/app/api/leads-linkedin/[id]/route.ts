import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { authenticate, isAdmin } from "@/lib/marketplace/auth";
import { isLinkedinLeadStatus, LINKEDIN_LEAD_STATUSES } from "@/lib/linkedinLeads/types";

export const runtime = "nodejs";
export const revalidate = 0;

type PatchPayload = {
  status?: string;
  notes?: string | null;
};

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await authenticate(req);
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = getSupabaseAdmin();
  if (!sb) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

  const { id } = await params;
  let body: PatchPayload;
  try {
    body = (await req.json()) as PatchPayload;
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.status !== undefined) {
    if (!isLinkedinLeadStatus(body.status)) {
      return NextResponse.json(
        { error: `invalid status, expected one of ${LINKEDIN_LEAD_STATUSES.join(", ")}` },
        { status: 400 },
      );
    }
    patch.status = body.status;
  }
  if (body.notes !== undefined) patch.notes = body.notes;

  const { data, error } = await sb
    .from("linkedin_leads")
    .update(patch)
    .eq("id", id)
    .select("id,status,full_name,notes,updated_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, lead: data });
}
