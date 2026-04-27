import { NextResponse } from "next/server";
import { authenticateInternal } from "@/lib/internalAuth";
import { alertLeadConverted } from "@/lib/slack";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

/** POST /api/internal/leads-converted
 *
 *  Marks an outreach lead as converted (signed up as publisher, installed a
 *  paid skill, etc) and pings Slack. n8n is one possible caller — the
 *  publishers/onboard endpoint can also fire this internally once the UTM
 *  attribution flow lands, so the auth + body shape is forward-compatible.
 *
 *  Body:
 *    {
 *      platform: "x" | "youtube" | "email" | "linkedin",
 *      handle: string,
 *      event: string,             // e.g. "publisher_onboarded", "first_install"
 *      publisher_id?: string,     // optional, if the lead became a publisher
 *    }
 *
 *  Response: { recorded: bool, alerted: bool }
 *
 *  Note: idempotent in spirit — if `converted_at` is already set, we leave
 *  the original timestamp (so the lifecycle clock isn't reset) but still
 *  re-ping Slack with the new event so the team sees follow-on conversions
 *  (publisher onboarded → first listing approved → first install). */
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
  const event = nonEmpty(body.event, 1, 80);
  if (!platform || !handle || !event) {
    return NextResponse.json(
      { error: "platform, handle and event are required" },
      { status: 400 },
    );
  }
  const publisherId = stringOrNull(body.publisher_id);

  const sb = getSupabaseAdmin();
  if (!sb) {
    console.log("[leads-converted] dev fallback (no supabase)", { platform, handle, event });
    const alerted = await alertLeadConverted(
      { platform, handle, profile_url: "", tier: null, display_name: null },
      { event, publisherId },
    );
    return NextResponse.json({ recorded: false, alerted, persisted: false });
  }

  // Read current state so we don't clobber an existing converted_at.
  const existing = await sb
    .from("outreach_leads")
    .select("platform, handle, profile_url, tier, display_name, converted_at, metadata")
    .eq("platform", platform)
    .eq("handle", handle)
    .maybeSingle();

  if (existing.error) {
    return NextResponse.json({ error: existing.error.message }, { status: 500 });
  }
  if (!existing.data) {
    return NextResponse.json(
      { recorded: false, alerted: false, hint: "lead not found — was it sent via /leads-sent first?" },
      { status: 404 },
    );
  }

  // Append this event to the metadata.events array so we keep a full audit
  // trail of conversion stages without adding a separate join table.
  const prevMeta = (existing.data.metadata && typeof existing.data.metadata === "object"
    ? (existing.data.metadata as Record<string, unknown>)
    : {}) as Record<string, unknown>;
  const prevEvents = Array.isArray(prevMeta.events) ? (prevMeta.events as unknown[]) : [];
  const nextMeta: Record<string, unknown> = {
    ...prevMeta,
    events: [...prevEvents, { event, publisher_id: publisherId, at: new Date().toISOString() }],
  };

  const update: Record<string, unknown> = { metadata: nextMeta };
  if (!existing.data.converted_at) {
    update.converted_at = new Date().toISOString();
  }

  const upd = await sb
    .from("outreach_leads")
    .update(update)
    .eq("platform", platform)
    .eq("handle", handle);
  if (upd.error) {
    return NextResponse.json({ error: upd.error.message }, { status: 500 });
  }

  const alerted = await alertLeadConverted(
    {
      platform: existing.data.platform,
      handle: existing.data.handle,
      profile_url: existing.data.profile_url,
      tier: existing.data.tier,
      display_name: existing.data.display_name,
    },
    { event, publisherId },
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
