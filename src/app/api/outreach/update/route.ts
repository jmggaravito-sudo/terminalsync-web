import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { authenticate, isAdmin } from "@/lib/marketplace/auth";
import { isOpStatus, OP_STATUSES, type OpStatus } from "@/lib/outreach/types";

export const runtime = "nodejs";
export const revalidate = 0;

type UpdatePayload = {
  id: number | string;
  op_status: OpStatus;
  op_hook?: string | null;
  op_notes?: string | null;
  op_last_message?: string | null;
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

  if (body.id === undefined || body.id === null || body.id === "") {
    return NextResponse.json({ error: "missing id" }, { status: 400 });
  }
  if (!isOpStatus(body.op_status)) {
    return NextResponse.json(
      { error: `invalid op_status, expected one of ${OP_STATUSES.join(", ")}` },
      { status: 400 }
    );
  }

  const nowIso = new Date().toISOString();
  const patch: Record<string, unknown> = { op_status: body.op_status };

  // TODO GHL (fast-follow): cuando body.op_status === 'respondio' disparar
  // upsert de contacto a sub-account XMfsHoa5sEugu6zuVZdr (tag src:discovery)
  // y crear/avanzar oportunidad a etapa "Contactado" del pipeline
  // 4Y3fCkfYpBCDhjAbZMwJ vía n8n. Esto depende del cableado discovery→GHL
  // que todavía no existe. Hasta entonces op_status es estado operativo,
  // no verdad comercial.

  if (body.op_status === "enviado") {
    patch.op_contacted_at = nowIso;
    if (body.op_hook !== undefined) patch.op_hook = body.op_hook;
    if (body.op_notes !== undefined) patch.op_notes = body.op_notes;
    if (body.op_last_message !== undefined) patch.op_last_message = body.op_last_message;
  } else if (body.op_status === "respondio") {
    patch.op_responded_at = nowIso;
  } else if (body.op_status === "descartado") {
    patch.op_discarded_at = nowIso;
  }
  // pendiente: solo flip de status (no timestamps; sirve para "deshacer")

  const { data, error } = await sb
    .from("agency_influencers")
    .update(patch)
    .eq("id", body.id)
    .select("id, op_status")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, lead: data });
}
