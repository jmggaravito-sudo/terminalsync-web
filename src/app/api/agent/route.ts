/**
 * Server-side proxy from the AgentWidget to the Sync-AI n8n webhook.
 *
 * Why a proxy and not a direct fetch from the browser:
 *   - The n8n endpoint URL stays server-side (no leak in the JS bundle)
 *   - We can rate-limit / abuse-protect here later without changing n8n
 *   - We can enrich payloads (page, plan, locale) without trusting the client
 *
 * The actual brain (Claude + memory + escalation routing) lives in n8n.
 */
import { NextRequest, NextResponse } from "next/server";
import { SUPPORT_AGENT_KNOWLEDGE } from "@/lib/supportKnowledge";

const N8N_CHAT_URL =
  process.env.N8N_AGENT_WEBHOOK_URL ||
  "https://n8n.nexflowai.net/webhook/sync-ai-inbound";

interface IncomingBody {
  sessionId?: string;
  message?: string;
  userLocale?: string;
  page?: string;
  userPlan?: "free" | "pro" | null;
}

export async function POST(req: NextRequest) {
  let body: IncomingBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const message = (body.message || "").trim();
  if (!message) {
    return NextResponse.json({ ok: false, error: "empty_message" }, { status: 400 });
  }
  const sessionId = body.sessionId || `web-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const upstreamPayload = {
    channel: "web",
    session_id: sessionId,
    user_id: null,
    message,
    user_locale: body.userLocale || req.headers.get("accept-language") || "en-US",
    context: {
      page: body.page || "/",
      user_plan: body.userPlan ?? null,
      product_knowledge: SUPPORT_AGENT_KNOWLEDGE,
    },
  };

  try {
    const upstream = await fetch(N8N_CHAT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(upstreamPayload),
      // The widget UX accepts up to ~30s; n8n + Anthropic typically <5s.
      signal: AbortSignal.timeout(30_000),
    });
    if (!upstream.ok) {
      return NextResponse.json(
        { ok: false, error: `upstream_${upstream.status}` },
        { status: 502 },
      );
    }
    const data = await upstream.json();
    return NextResponse.json({
      ok: true,
      sessionId,
      response: data.response ?? "",
      escalated: !!data.escalated,
      topic: data.topic ?? null,
    });
  } catch (e) {
    console.error("[agent proxy] upstream failed:", e);
    return NextResponse.json(
      { ok: false, error: "upstream_unreachable" },
      { status: 502 },
    );
  }
}
