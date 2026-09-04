/**
 * GET /api/admin/soporte/conversations/[sessionId]
 *
 * Thread view for the admin "Soporte" panel: every turn for one session_id,
 * oldest first, straight from `support_conversations` (not the aggregated
 * view — the queue list uses that one).
 *
 * Auth: same Bearer-token + ADMIN_EMAILS allowlist gate as the rest of
 * /api/admin/* (see @/lib/marketplace/auth).
 */
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { authenticate, isAdmin } from "@/lib/marketplace/auth";
import {
  isSupportChannel,
  isSupportReason,
  type SupportConversationTurn,
} from "@/lib/supportConversations/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TurnRow = {
  id: string;
  created_at: string;
  channel: string;
  locale: string | null;
  plan: string | null;
  question: string;
  answer: string;
  escalated: boolean;
  reason: string | null;
  topic: string | null;
  prompt_version: string | null;
};

function mapRow(row: TurnRow): SupportConversationTurn {
  return {
    id: row.id,
    createdAt: row.created_at,
    channel: isSupportChannel(row.channel) ? row.channel : "web",
    locale: row.locale,
    plan: row.plan,
    question: row.question,
    answer: row.answer,
    escalated: row.escalated,
    reason: isSupportReason(row.reason) ? row.reason : null,
    topic: row.topic,
    promptVersion: row.prompt_version,
  };
}

export async function GET(_req: Request, ctx: { params: Promise<{ sessionId: string }> }) {
  const user = await authenticate(_req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isAdmin(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const sb = getSupabaseAdmin();
  if (!sb) {
    return NextResponse.json({ error: "supabase admin not configured" }, { status: 503 });
  }

  const { sessionId } = await ctx.params;
  if (!sessionId) {
    return NextResponse.json({ error: "sessionId required" }, { status: 400 });
  }

  const { data, error } = await sb
    .from("support_conversations")
    .select(
      "id, created_at, channel, locale, plan, question, answer, escalated, reason, topic, prompt_version",
    )
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const turns = (data ?? []).map((row) => mapRow(row as TurnRow));
  if (turns.length === 0) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return NextResponse.json({ sessionId, turns });
}
