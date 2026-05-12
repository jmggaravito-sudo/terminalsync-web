/**
 * Server-side proxy for the support form (escalation flow).
 * Talks to the n8n `sync-ai-support-form` webhook which validates input
 * and creates a GHL contact tagged `agent-support-form`.
 */
import { NextRequest, NextResponse } from "next/server";
import { getSupportKnowledge, supportLocale } from "@/lib/supportKnowledge";

const N8N_FORM_URL =
  process.env.N8N_AGENT_FORM_WEBHOOK_URL ||
  "https://n8n.nexflowai.net/webhook/sync-ai-support-form";

interface FormBody {
  email?: string;
  problem?: string;
  sessionId?: string;
  topicHint?: string;
  userLocale?: string;
}

export async function POST(req: NextRequest) {
  let body: FormBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, errors: ["invalid_json"] }, { status: 400 });
  }

  const locale = supportLocale(body.userLocale || req.headers.get("accept-language"));
  const knowledge = getSupportKnowledge(locale);

  const upstreamPayload = {
    channel: "web",
    session_id: body.sessionId || "anon",
    email: (body.email || "").trim(),
    problem: (body.problem || "").trim(),
    topic_hint: body.topicHint || "",
    user_locale: body.userLocale || req.headers.get("accept-language") || "en-US",
    context: {
      product: "TerminalSync",
      knowledge_version: knowledge.updated,
      support_knowledge: knowledge,
    },
  };

  try {
    const upstream = await fetch(N8N_FORM_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(upstreamPayload),
      signal: AbortSignal.timeout(15_000),
    });
    const data = await upstream.json().catch(() => ({}));
    return NextResponse.json(data, { status: upstream.status });
  } catch (e) {
    console.error("[agent escalate proxy] upstream failed:", e);
    return NextResponse.json(
      { ok: false, errors: ["upstream_unreachable"] },
      { status: 502 },
    );
  }
}
