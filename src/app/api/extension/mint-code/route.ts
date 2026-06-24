// POST /api/extension/mint-code
//
// Issues a fresh 6-digit code to bind an extension install to the
// authenticated user's Pro subscription — WITHOUT having to go through
// Stripe checkout again.
//
// This is the "I already paid Pro a long time ago, give me my code"
// path. The Stripe checkout success page calls mintLinkCode() directly
// inline; this endpoint is the equivalent self-serve flow for users
// who landed on the website AFTER paying, or who need a second code.
//
// Auth:
//   - Bearer token in Authorization header (Supabase user access token).
//   - We verify the token via sb.auth.getUser() to get the user_id.
//
// Authorization:
//   - User must have an active Pro/Max subscription
//     (subscriptions.plan IN (pro, max) AND status IN (active, trialing)).
//
// Response shapes:
//   200 { code: "123456", expiresAt: "2026-06-11T..." } — minted, ready to paste
//   401 { error: "unauthenticated" }                    — bad/missing token
//   403 { error: "not_pro" }                            — user is on Free
//   500 { error: "supabase_unavailable" | "mint_failed" }

import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { extensionCorsHeaders, extensionPreflight } from "../_lib/cors";
import { mintLinkCode } from "../_lib/linkCodes";

export const runtime = "nodejs";

const ACTIVE_STATUSES = ["active", "trialing"] as const;
// "dev" is the LEGACY name for what's now "max" — subscriptions written
// before the 2026-05-20 rename still carry it. The Stripe webhook now
// writes "max" for new ones, but old rows are not backfilled. The desktop
// app's normalizePlan() handles this transparently; we mirror that here
// rather than running a destructive migration on production rows.
const PAID_PLANS = ["pro", "max", "dev"] as const;

export function OPTIONS(req: Request): Response {
  return extensionPreflight(req, "POST, OPTIONS");
}

export async function POST(req: Request): Promise<Response> {
  const cors: Record<string, string> = {
    ...extensionCorsHeaders(req.headers.get("origin")),
    "content-type": "application/json",
  };

  // 1. Read Bearer token. Same pattern as /api/audit.
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!token) {
    return jerr(401, "unauthenticated", "Missing Bearer token.", cors);
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return jerr(
      500,
      "supabase_unavailable",
      "Linking is not configured on this deployment.",
      cors,
    );
  }

  // 2. Verify the token and get the user_id.
  const { data: userRes, error: userErr } = await supabase.auth.getUser(token);
  if (userErr || !userRes?.user) {
    return jerr(401, "unauthenticated", "Invalid or expired token.", cors);
  }
  const userId = userRes.user.id;

  // 3. Check the user has an active paid plan. The subscriptions table is
  //    the source of truth — it's kept in sync by the Stripe webhook.
  //    Note: a "canceled" sub with cancel_at_period_end=true still shows
  //    status="active" until the period ends, so this gate is correct
  //    even for users mid-cancellation (they retain access until
  //    current_period_end).
  const { data: sub, error: subErr } = await supabase
    .from("subscriptions")
    .select("plan, status")
    .eq("user_id", userId)
    .maybeSingle();
  if (subErr) {
    console.error("[extension/mint-code] subscription lookup failed", {
      userId,
      subErr,
    });
    return jerr(
      500,
      "supabase_unavailable",
      "Could not check subscription status.",
      cors,
    );
  }
  if (
    !sub ||
    !PAID_PLANS.includes(sub.plan as (typeof PAID_PLANS)[number]) ||
    !ACTIVE_STATUSES.includes(sub.status as (typeof ACTIVE_STATUSES)[number])
  ) {
    return jerr(
      403,
      "not_pro",
      "Active Pro or Max subscription required.",
      cors,
    );
  }

  // 4. Mint a code. mintLinkCode() invalidates any prior unconsumed codes
  //    for this user, so repeated calls are safe — the user always sees
  //    the freshest code.
  let result;
  try {
    result = await mintLinkCode(supabase, userId);
  } catch (err) {
    console.error("[extension/mint-code] mint failed", { userId, err });
    return jerr(500, "mint_failed", "Could not mint a code.", cors);
  }

  // 5. Has this user EVER successfully linked an extension?
  //    A consumed code with consumed_by_extension_user_id != null means a
  //    real extension install bound itself to this user. We use this as a
  //    soft "you already have it installed" signal — the desktop app can't
  //    introspect Chrome from the Tauri WebView, but this row is the next
  //    best thing. Errors are non-fatal: assume false on lookup failure
  //    (worst case the UI shows the install link even though they have it).
  let hasLinkedExtension = false;
  try {
    const { count } = await supabase
      .from("extension_link_codes")
      .select("code", { count: "exact", head: true })
      .eq("supabase_user_id", userId)
      .not("consumed_by_extension_user_id", "is", null);
    hasLinkedExtension = (count ?? 0) > 0;
  } catch (err) {
    console.warn("[extension/mint-code] hasLinkedExtension lookup failed", {
      userId,
      err,
    });
  }

  return new Response(
    JSON.stringify({
      code: result.code,
      expiresAt: result.expiresAt,
      hasLinkedExtension,
    }),
    { status: 200, headers: cors },
  );
}

function jerr(
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
