// Read-only trial status for the extension popup's banner.
//
// The popup calls this on open to render "🎁 Trial: 4 días + 32 prompts
// hoy" without burning a hosted prompt. It returns the same
// `TrialStatus` shape /chat returns inside its 4xx error bodies, so
// the popup can render from either source.
//
// We do NOT create a row for a brand-new userId here. /chat is what
// "starts the trial". If you call /trial-status before ever calling
// /chat, you get a synthetic "fresh trial" response (full days, full
// cap) — same UX from the popup's perspective.
//
// Endpoint: GET /api/extension/trial-status?userId=<uuid>

import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { extensionCorsHeaders, extensionPreflight } from "../_lib/cors";
import { readTrialStatus, statusHeaders } from "../_lib/trial";

export const runtime = "nodejs";

export function OPTIONS(req: Request): Response {
  return extensionPreflight(req, "GET, OPTIONS");
}

export async function GET(req: Request): Promise<Response> {
  const cors: Record<string, string> = {
    ...extensionCorsHeaders(req.headers.get("origin"), "GET, OPTIONS"),
    "content-type": "application/json",
  };

  const url = new URL(req.url);
  const userId =
    url.searchParams.get("userId") || req.headers.get("x-user-id") || "";
  if (!userId) {
    return new Response(
      JSON.stringify({ error: "missing_user_id" }),
      { status: 400, headers: cors },
    );
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    // Dev sandbox — pretend we have a fresh trial so the popup still
    // renders something sensible.
    return new Response(
      JSON.stringify({
        mode: "hosted",
        daysLeft: 7,
        promptsLeftToday: 50,
        cap: 50,
        expiresAt: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        expired: false,
        note: "Supabase not configured; status is synthetic.",
      }),
      { status: 200, headers: cors },
    );
  }

  try {
    const status = await readTrialStatus(supabase, userId);
    return new Response(
      JSON.stringify({
        mode: status.mode,
        daysLeft: status.daysLeft,
        promptsLeftToday:
          status.promptsLeftToday === Number.POSITIVE_INFINITY
            ? null
            : status.promptsLeftToday,
        cap: status.cap,
        expiresAt: status.expiresAt,
        expired: status.expired,
      }),
      { status: 200, headers: { ...cors, ...statusHeaders(status) } },
    );
  } catch (err) {
    console.error("[extension/trial-status] read failed", err);
    return new Response(
      JSON.stringify({ error: "read_failed" }),
      { status: 500, headers: cors },
    );
  }
}
