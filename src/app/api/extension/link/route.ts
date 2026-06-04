// POST /api/extension/link
//
// Body: { code: "123456", userId: "<extension uuid>" }
//
// The flow:
//   1. User pays for Pro on the desktop site via Stripe Checkout.
//   2. Stripe redirects to /[lang]/checkout/success, which calls
//      /api/extension/issue-code (server-rendered) and prints a
//      6-digit code on the page.
//   3. User opens the extension popup → Options → "Already paid Pro"
//      → pastes the code.
//   4. The extension POSTs here. We flip the row to upgraded_to_pro
//      and the popup's next /chat call comes back as mode=pro
//      (unlimited).
//
// Mints are server-side only — see /api/extension/issue-code (NOT
// publicly callable; the success page imports the mint helper
// directly).
//
// Response shapes:
//   200 { ok: true, mode: "pro" }                            — linked
//   400 { error: "missing_field" }                            — body
//   404 { error: "not_found" }                                — bad code
//   409 { error: "already_consumed" }                         — replayed
//   410 { error: "expired" }                                  — TTL hit

import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { extensionCorsHeaders, extensionPreflight } from "../_lib/cors";
import { claimLinkCode } from "../_lib/linkCodes";

export const runtime = "nodejs";

interface Body {
  code: string;
  userId: string;
}

export function OPTIONS(req: Request): Response {
  return extensionPreflight(req, "POST, OPTIONS");
}

export async function POST(req: Request): Promise<Response> {
  const cors: Record<string, string> = {
    ...extensionCorsHeaders(req.headers.get("origin")),
    "content-type": "application/json",
  };

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return error(400, "bad_request", "Body must be JSON.", cors);
  }

  const code = typeof body.code === "string" ? body.code.trim() : "";
  const userId = typeof body.userId === "string" ? body.userId.trim() : "";
  if (!code || !userId) {
    return error(400, "missing_field", "Both code and userId are required.", cors);
  }
  if (!/^\d{6}$/.test(code)) {
    return error(400, "bad_request", "Code must be 6 digits.", cors);
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return error(
      500,
      "supabase_unavailable",
      "Linking is not configured on this deployment.",
      cors,
    );
  }

  let outcome;
  try {
    outcome = await claimLinkCode(supabase, code, userId);
  } catch (err) {
    console.error("[extension/link] claim failed", err);
    return error(500, "claim_failed", "Could not claim the code.", cors);
  }

  if (outcome.ok) {
    return new Response(
      JSON.stringify({ ok: true, mode: "pro" }),
      { status: 200, headers: cors },
    );
  }

  const status =
    outcome.reason === "not_found"
      ? 404
      : outcome.reason === "expired"
        ? 410
        : 409;
  return new Response(
    JSON.stringify({ error: outcome.reason }),
    { status, headers: cors },
  );
}

function error(
  status: number,
  code: string,
  detail: string,
  headers: Record<string, string>,
): Response {
  return new Response(
    JSON.stringify({ error: code, detail }),
    { status, headers },
  );
}
