import { NextResponse } from "next/server";
import { authenticateInternal } from "@/lib/internalAuth";
import { alertLeadReplied } from "@/lib/slack";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

/** POST /api/internal/leads-replied
 *
 *  Hit by the n8n flow when an outreach lead replies to one of the DMs.
 *  Marks `responded_at` on the matching `outreach_leads` row and pings
 *  #partnerships in Slack so the human team can take over the conversation.
 *
 *  Auth: same shared-secret bearer (INTERNAL_LEADS_TOKEN) as /leads-sent.
 *
 *  Body:
 *    {
 *      platform: "x" | "youtube" | "email" | "linkedin",
 *      handle: string,
 *      reply_text?: string,    // 280 char preview shown in Slack
 *      reply_url?: string,     // optional deep-link to the actual reply
 *    }
 *
 *  Response: { recorded: bool, alerted: bool }
 *    - recorded=true when we found and updated the lead row
 *    - recorded=false (404 status) when there's no matching lead in our table
 *    - alerted reflects whether the Slack ping went through */
export async function POST(req: Request) {
  const auth = authenticateInternal(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const platform = stringIn(body.platform, ["x", "youtube", "email", "linkedin"]);
  const handle = nonEmpty(body.handle, 1, 80);
  if (!platform || !handle) {
    return NextResponse.json(
      { error: "platform and handle are required" },
      { status: 400 },
    );
  }
  const replyText = stringOrNull(body.reply_text);

  const sb = getSupabaseAdmin();
  if (!sb) {
    // Dev fallback — log so n8n testing doesn't loop, attempt the Slack
    // ping anyway since that's the human-facing side.
    console.log("[leads-replied] dev fallback (no supabase)", { platform, handle });
    const alerted = await alertLeadReplied(
      { platform, handle, profile_url: "", tier: null, display_name: null },
      replyText ?? undefined,
    );
    return NextResponse.json({ recorded: false, alerted, persisted: false });
  }

  // Mark responded_at + return the row so we can pass tier / profile to Slack.
  const { data, error } = await sb
    .from("outreach_leads")
    .update({ responded_at: new Date().toISOString() })
    .eq("platform", platform)
    .eq("handle", handle)
    .select("platform, handle, profile_url, tier, display_name")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    // n8n hit the endpoint with a handle we never sent a DM to — likely a bug
    // in the dedup table on the n8n side. Don't alert Slack in that case.
    return NextResponse.json(
      { recorded: false, alerted: false, hint: "lead not found — was it sent via /leads-sent first?" },
      { status: 404 },
    );
  }

  const alerted = await alertLeadReplied(
    {
      platform: data.platform,
      handle: data.handle,
      profile_url: data.profile_url,
      tier: data.tier,
      display_name: data.display_name,
    },
    replyText ?? undefined,
  );

  return NextResponse.json({ recorded: true, alerted });
}

function stringIn<T extends string>(v: unknown, allow: readonly T[]): T | null {
  if (typeof v !== "string") return null;
  return (allow as readonly string[]).includes(v) ? (v as T) : null;
}
function nonEmpty(v: unknown, min: number, max: number): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length >= min && t.length <= max ? t : null;
}
function stringOrNull(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length > 0 ? t : null;
}
