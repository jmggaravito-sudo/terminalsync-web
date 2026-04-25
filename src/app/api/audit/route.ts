import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

interface Body {
  /** Event slug, e.g. "codex_synced_to", "codex_session_revoked",
   *  "gh_synced_to", "mcp_synced_to". Free-form, but stick to the
   *  `<feature>_<verb>` convention so dashboards can group by prefix. */
  event: string;
  /** Free-form JSON payload — at minimum include `source_device` /
   *  `target_device` IDs when this is a sync event. */
  metadata?: Record<string, unknown>;
}

/**
 * Append-only audit log endpoint for the Tauri desktop app.
 *
 * Auth: pass the user's Supabase access token as `Authorization: Bearer <jwt>`.
 * We validate it via the admin client (`auth.getUser(token)`) which handles
 * signature + expiry + revocation in one round-trip. The user_id from the
 * verified token becomes audit_log.user_id — no spoofing possible.
 *
 * Schema (already exists, migration 0001_init.sql):
 *   audit_log { id, user_id, event, metadata, ip_address, user_agent, created_at }
 *
 * The desktop app can fire-and-forget — we always return 200 (or 4xx for
 * misuse) so a failed audit log never blocks the actual sync operation.
 */
export async function POST(req: Request) {
  const sb = getSupabaseAdmin();
  if (!sb) {
    return NextResponse.json(
      { error: "Supabase admin not configured" },
      { status: 503 },
    );
  }

  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!token) {
    return NextResponse.json(
      { error: "Missing Bearer token" },
      { status: 401 },
    );
  }

  // getUser() validates signature + expiry against Supabase Auth and
  // returns the user. Adds ~80ms but the desktop app fires this async.
  const { data: userRes, error: userErr } = await sb.auth.getUser(token);
  if (userErr || !userRes?.user) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
  const userId = userRes.user.id;

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const event = body.event?.trim();
  if (!event || event.length > 64 || !/^[a-z][a-z0-9_]*$/.test(event)) {
    return NextResponse.json(
      { error: "event must be snake_case, ≤64 chars" },
      { status: 400 },
    );
  }

  // Forwarded IP via Vercel / common proxies. Falls back to remote address
  // when behind something else.
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    null;
  const ua = req.headers.get("user-agent") ?? null;

  const { error: insertErr } = await sb.from("audit_log").insert({
    user_id: userId,
    event,
    metadata: body.metadata ?? {},
    ip_address: ip,
    user_agent: ua,
  });

  if (insertErr) {
    console.error("[audit] insert failed", { userId, event, insertErr });
    return NextResponse.json(
      { error: "Failed to write audit log" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
