import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/signedTokens";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

interface Body {
  /** The HMAC-signed unsubscribe token from the email footer link. */
  token: string;
  action: "unsubscribe" | "resubscribe";
}

/**
 * Flips `profiles.email_marketing_opt_out` based on a signed token. The
 * token's subject is the user's email (lowercased at sign time), so we
 * don't need to ask the user to confirm — the signature already proves
 * we sent them the link.
 *
 * Transactional emails (receipts, payment-failed, cancellation) are
 * NOT gated by this flag. Only marketing / lifecycle nudges should
 * check it before sending.
 */
export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = verifyToken(body.token, "unsubscribe");
  if (!email) {
    return NextResponse.json(
      { error: "Link inválido o expirado" },
      { status: 401 },
    );
  }

  if (body.action !== "unsubscribe" && body.action !== "resubscribe") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const sb = getSupabaseAdmin();
  if (!sb) {
    return NextResponse.json(
      { error: "Supabase admin not configured" },
      { status: 503 },
    );
  }

  const optOut = body.action === "unsubscribe";
  const { error } = await sb
    .from("profiles")
    .update({ email_marketing_opt_out: optOut })
    .eq("email", email);

  if (error) {
    console.error("[unsubscribe] update failed", { email, optOut, error });
    return NextResponse.json(
      { error: "No pudimos actualizar tu preferencia. Reintenta." },
      { status: 500 },
    );
  }

  // No row may exist yet (e.g. user paid via Stripe but never created
  // a Supabase profile). That's still "ok" from the user's POV — the
  // flag only matters when we look it up before sending; if there's no
  // row, there's nothing for us to send to either.
  return NextResponse.json({ ok: true });
}
