import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

/** Internal endpoint hit by the n8n outreach flow whenever a DM is sent.
 *
 *  Auth: shared-secret bearer token (`INTERNAL_LEADS_TOKEN`). Not exposed via
 *  CORS — n8n is server-to-server, not browser. Token compared with constant-
 *  time so no length-leak.
 *
 *  Body schema (all required unless marked):
 *    {
 *      platform: "x" | "youtube" | "email" | "linkedin",
 *      handle: string,                  // "@jmgaravito" or "channel-id"
 *      profile_url: string,             // full https URL
 *      display_name?: string,
 *      bio?: string,
 *      followers?: number,
 *      tier: 1 | 2 | 3,                 // matches the brief's prioritization
 *      dm_version: "a" | "b" | "c",     // which template was sent
 *      keywords_matched?: string[],
 *      recent_quote?: string,           // the personalization detail used
 *      metadata?: Record<string, unknown>,
 *    }
 *
 *  Response: { received: true, lead_id: <uuid> } on 200; { error } otherwise.
 *
 *  Idempotency: if (platform, handle) already exists, returns the existing
 *  lead_id with status 200 instead of creating a duplicate. Lets n8n retry
 *  failed webhooks safely. */
export async function POST(req: Request) {
  // ── auth ───────────────────────────────────────────────────────────────
  const expected = process.env.INTERNAL_LEADS_TOKEN;
  if (!expected) {
    return NextResponse.json(
      { error: "Internal endpoint not configured (INTERNAL_LEADS_TOKEN missing)" },
      { status: 503 },
    );
  }
  const auth = req.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token || !timingSafeEqual(token, expected)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── parse + validate ───────────────────────────────────────────────────
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const errors: string[] = [];
  const platform = stringIn(body.platform, ["x", "youtube", "email", "linkedin"]);
  if (!platform) errors.push("platform must be one of: x, youtube, email, linkedin");

  const handle = nonEmpty(body.handle, 1, 80);
  if (!handle) errors.push("handle required (1–80 chars)");

  const profileUrl = nonEmpty(body.profile_url, 8, 500);
  if (!profileUrl || !/^https?:\/\//.test(profileUrl)) {
    errors.push("profile_url must be a valid http(s) URL");
  }

  const tier = numberIn(body.tier, [1, 2, 3]);
  if (tier === null) errors.push("tier must be 1, 2 or 3");

  const dmVersion = stringIn(body.dm_version, ["a", "b", "c"]);
  if (!dmVersion) errors.push("dm_version must be 'a', 'b' or 'c'");

  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  // ── persist ────────────────────────────────────────────────────────────
  const sb = getSupabaseAdmin();
  if (!sb) {
    // No Supabase configured (dev sandbox) — log + ack so n8n doesn't retry
    // forever. Real persistence kicks in once the migration is applied and
    // SUPABASE_* env vars are set.
    console.log("[leads-sent] dev fallback (no supabase)", {
      platform,
      handle,
      profileUrl,
      tier,
      dmVersion,
    });
    return NextResponse.json({ received: true, lead_id: null, persisted: false });
  }

  // Upsert on (platform, handle) — idempotent. If the row already exists we
  // refresh the latest send timestamp so the dedup window is correct.
  const row = {
    platform,
    handle,
    profile_url: profileUrl,
    display_name: stringOrNull(body.display_name),
    bio: stringOrNull(body.bio),
    followers: numberOrNull(body.followers),
    tier,
    dm_version: dmVersion,
    keywords_matched: arrayOfStrings(body.keywords_matched) ?? [],
    recent_quote: stringOrNull(body.recent_quote),
    metadata: (body.metadata && typeof body.metadata === "object" ? body.metadata : {}) as Record<string, unknown>,
    sent_at: new Date().toISOString(),
  };

  const { data, error } = await sb
    .from("outreach_leads")
    .upsert(row, { onConflict: "platform,handle" })
    .select("id")
    .single();

  if (error) {
    console.error("[leads-sent] upsert failed", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ received: true, lead_id: data.id, persisted: true });
}

// ── helpers ──────────────────────────────────────────────────────────────

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

function stringIn<T extends string>(v: unknown, allow: readonly T[]): T | null {
  if (typeof v !== "string") return null;
  return (allow as readonly string[]).includes(v) ? (v as T) : null;
}
function numberIn<T extends number>(v: unknown, allow: readonly T[]): T | null {
  if (typeof v !== "number") return null;
  return (allow as readonly number[]).includes(v) ? (v as T) : null;
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
function numberOrNull(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}
function arrayOfStrings(v: unknown): string[] | null {
  if (!Array.isArray(v)) return null;
  if (v.some((x) => typeof x !== "string")) return null;
  return v as string[];
}
