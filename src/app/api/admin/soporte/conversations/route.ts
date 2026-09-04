/**
 * GET /api/admin/soporte/conversations
 *
 * List view for the admin "Soporte" panel: one row per session_id (a
 * conversation thread), most-recently-active first, reading the
 * `support_conversation_sessions` view (aggregated in
 * supabase/migrations/0030_support_conversations.sql from the raw
 * `support_conversations` rows the n8n Sync-AI workflow writes).
 *
 * Query params:
 *   filter = all | escalated | unknown   (default "all")
 *   q      = free-text search over every turn's question/answer in the
 *            session (server-side ilike against the view's `search_blob`)
 *   page   = 1-based page number (default 1)
 *
 * Auth: same Bearer-token + ADMIN_EMAILS allowlist gate as the rest of
 * /api/admin/* (see @/lib/marketplace/auth). The service-role Supabase
 * client this uses never reaches the browser.
 */
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { authenticate, isAdmin } from "@/lib/marketplace/auth";
import {
  isSupportChannel,
  isSupportQueueFilter,
  isSupportReason,
  SUPPORT_QUEUE_PAGE_SIZE,
  type SupportConversationSession,
} from "@/lib/supportConversations/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Escapes `%` and `_` so a literal search term never acts as an ilike
 *  wildcard, then wraps it for a "contains" match. */
function ilikePattern(raw: string): string {
  const escaped = raw.replace(/[%_]/g, (c) => `\\${c}`);
  return `%${escaped}%`;
}

type SessionRow = {
  session_id: string;
  first_turn_at: string;
  last_turn_at: string;
  turn_count: number;
  has_escalation: boolean;
  escalation_reasons: string[] | null;
  has_unknown_gap: boolean;
  channel: string;
  locale: string | null;
  plan: string | null;
  topic: string | null;
};

function mapRow(row: SessionRow): SupportConversationSession {
  return {
    sessionId: row.session_id,
    firstTurnAt: row.first_turn_at,
    lastTurnAt: row.last_turn_at,
    turnCount: row.turn_count,
    channel: isSupportChannel(row.channel) ? row.channel : "web",
    locale: row.locale,
    plan: row.plan,
    topic: row.topic,
    hasEscalation: row.has_escalation,
    escalationReasons: (row.escalation_reasons ?? []).filter(isSupportReason),
    hasUnknownGap: row.has_unknown_gap,
  };
}

export async function GET(req: Request) {
  const user = await authenticate(req);
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

  const url = new URL(req.url);
  const rawFilter = url.searchParams.get("filter") ?? "all";
  const filter = isSupportQueueFilter(rawFilter) ? rawFilter : "all";
  const q = (url.searchParams.get("q") ?? "").trim().slice(0, 200);
  const rawPage = Number(url.searchParams.get("page") ?? "1");
  const page = Number.isFinite(rawPage) && rawPage >= 1 ? Math.trunc(rawPage) : 1;
  const from = (page - 1) * SUPPORT_QUEUE_PAGE_SIZE;
  const to = from + SUPPORT_QUEUE_PAGE_SIZE - 1;

  let query = sb
    .from("support_conversation_sessions")
    .select(
      "session_id, first_turn_at, last_turn_at, turn_count, has_escalation, escalation_reasons, has_unknown_gap, channel, locale, plan, topic",
      { count: "exact" },
    )
    .order("last_turn_at", { ascending: false })
    .range(from, to);

  if (filter === "escalated") query = query.eq("has_escalation", true);
  if (filter === "unknown") query = query.eq("has_unknown_gap", true);
  if (q) query = query.ilike("search_blob", ilikePattern(q));

  const { data, error, count } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const sessions = (data ?? []).map((row) => mapRow(row as SessionRow));
  const total = count ?? sessions.length;

  return NextResponse.json({
    sessions,
    page,
    pageSize: SUPPORT_QUEUE_PAGE_SIZE,
    total,
    hasMore: from + sessions.length < total,
  });
}
