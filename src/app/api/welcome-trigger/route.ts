import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

/**
 * POST /api/welcome-trigger
 *
 * Called from /auth/callback right after a successful magic-link exchange.
 * Idempotent: only fires the welcome email when the calling user's
 * `auth.users.created_at` is within the last 90 seconds — that's the
 * window that makes a magic-link callback "first signup" rather than
 * "existing user logging in again".
 *
 * Security model:
 *   - The endpoint reads the calling user's session via the Authorization
 *     header (the browser fetches with the access_token from supabase-js).
 *     We *never* trust an `email` field in the body — the email comes from
 *     auth.users via service-role, which means a hostile client can't ping
 *     this endpoint to spam someone else's inbox.
 *   - The service-role Supabase admin only runs server-side; the n8n
 *     webhook URL is also server-only (no NEXT_PUBLIC_).
 *
 * Body: { lang: "es" | "en", source: "dev" | "consumer" }
 *
 * Returns:
 *   200 { ok: true, fired: true }   — welcome email queued by n8n
 *   200 { ok: true, fired: false, reason: "..." }  — already-existing user, etc
 *   401 { error: "..." }            — no/invalid session
 *   503 { error: "..." }            — admin client or webhook URL missing
 */

const WEBHOOK_URL = process.env.WELCOME_FLOW_WEBHOOK_URL;
const WEBHOOK_SECRET = process.env.WELCOME_FLOW_SECRET;
const NEW_USER_WINDOW_MS = 90 * 1000;

export async function POST(req: NextRequest) {
  const admin = getSupabaseAdmin();
  if (!admin || !WEBHOOK_URL) {
    return NextResponse.json(
      { error: "welcome trigger not configured" },
      { status: 503 },
    );
  }

  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) {
    return NextResponse.json({ error: "missing bearer token" }, { status: 401 });
  }

  // Resolve the calling user from the access token. supabase-js's
  // `auth.getUser(token)` validates the JWT signature server-side and
  // returns the canonical user row.
  const { data: userData, error: userErr } = await admin.auth.getUser(token);
  if (userErr || !userData.user) {
    return NextResponse.json({ error: "invalid session" }, { status: 401 });
  }
  const user = userData.user;
  if (!user.email) {
    return NextResponse.json(
      { ok: true, fired: false, reason: "no_email_on_user" },
    );
  }

  // Idempotency: only fire the welcome flow on first signup. Compare the
  // user's created_at to now() — anything older than 90s is treated as a
  // returning login, not a new signup.
  const createdAt = user.created_at ? Date.parse(user.created_at) : 0;
  const isFreshSignup = createdAt > 0 && Date.now() - createdAt < NEW_USER_WINDOW_MS;
  if (!isFreshSignup) {
    return NextResponse.json(
      { ok: true, fired: false, reason: "returning_user" },
    );
  }

  let body: { lang?: string; source?: string } = {};
  try {
    body = await req.json();
  } catch {
    /* body is optional — we have sane defaults */
  }
  const lang = body.lang === "en" ? "en" : "es";
  const source = body.source === "dev" ? "dev" : "consumer";
  const name = (user.user_metadata?.name as string | undefined) ||
    user.email.split("@")[0];

  // The n8n workflow's first node (Normalize) checks this header and
  // throws if it's missing/wrong. Anyone who knows the public webhook
  // URL but not the secret gets rejected. The secret lives only in
  // server env vars on both sides — never shipped to the browser.
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (WEBHOOK_SECRET) headers["X-Welcome-Secret"] = WEBHOOK_SECRET;

  const r = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({ email: user.email, lang, source, name }),
  });

  if (!r.ok) {
    return NextResponse.json(
      { ok: false, fired: false, reason: `webhook_${r.status}` },
      { status: 502 },
    );
  }
  return NextResponse.json({ ok: true, fired: true, lang, source });
}
