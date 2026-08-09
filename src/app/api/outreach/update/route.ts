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

type ReplyBridgeResult =
  | { status: "not_needed" }
  | { status: "not_configured" }
  | { status: "sent"; upstreamStatus: number }
  | { status: "failed"; error: string };

const OUTREACH_REPLY_WEBHOOK_URL = process.env.OUTREACH_REPLY_WEBHOOK_URL || "";

async function notifyReplyBridge(args: {
  lead: Record<string, unknown> | null;
  payload: UpdatePayload;
  nowIso: string;
}): Promise<ReplyBridgeResult> {
  if (args.payload.op_status !== "respondio") return { status: "not_needed" };
  if (!OUTREACH_REPLY_WEBHOOK_URL) return { status: "not_configured" };

  try {
    const upstream = await fetch(OUTREACH_REPLY_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "agency_influencer_replied",
        source: "terminalsync-web-admin-ops",
        occurred_at: args.nowIso,
        lead: args.lead,
        operator_notes: args.payload.op_notes ?? null,
        last_message: args.payload.op_last_message ?? null,
        desired_actions: [
          "upsert_ghl_contact",
          "create_or_move_ghl_opportunity",
          "notify_telegram",
          "prepare_ai_response_analysis",
        ],
      }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!upstream.ok) {
      const text = await upstream.text().catch(() => "");
      return {
        status: "failed",
        error: `HTTP ${upstream.status}${text ? `: ${text.slice(0, 180)}` : ""}`,
      };
    }

    return { status: "sent", upstreamStatus: upstream.status };
  } catch (e) {
    return { status: "failed", error: e instanceof Error ? e.message : "unknown error" };
  }
}

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

  // GHL/Telegram bridge: web stays credential-free and only notifies n8n.
  // n8n owns GoHighLevel credentials, pipeline movement, Telegram alerts,
  // and AI response analysis. If OUTREACH_REPLY_WEBHOOK_URL is unset, the
  // Supabase state still updates but the API returns replyBridge.not_configured
  // so the UI/operator can see that GHL is still pending.

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
    .select(
      "id,op_status,name,handle,platform,profile_url,email,instagram_handle,twitter_handle,linkedin_url,tiktok_handle,source_url,op_last_message,op_notes",
    )
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const replyBridge = await notifyReplyBridge({ lead: data ?? null, payload: body, nowIso });
  const ok = replyBridge.status !== "failed";
  return NextResponse.json({ ok, lead: data, replyBridge }, { status: ok ? 200 : 502 });
}
