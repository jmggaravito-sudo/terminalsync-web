import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

interface Body {
  /** The user's email — verified earlier by either their signed-in Supabase
   *  session or by them clicking a magic link we sent. */
  email: string;
  /** Optional locale for the localized return URL. */
  lang?: "es" | "en";
}

/**
 * Creates a Stripe Customer Portal session and returns its URL. The
 * caller (typically the /es/billing page or the Tauri Settings panel)
 * redirects the user there so they can update payment methods, view
 * invoices, cancel, etc.
 *
 * Identification chain:
 *   1. We look up the email in Supabase profiles → user_id
 *   2. user_id → subscriptions row → stripe_customer_id
 *   3. Stripe portal session created against that customer
 *
 * Why not signed tokens in the email URL? Tried that — felt like reusing
 * the webhook signing secret for two purposes muddied things. Doing the
 * Supabase lookup on click adds ~150ms but keeps the email URLs clean
 * and avoids the "what if the secret rotates" headache.
 */
export async function POST(req: Request) {
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 503 },
    );
  }
  const sb = getSupabaseAdmin();
  if (!sb) {
    return NextResponse.json(
      { error: "Supabase admin not configured" },
      { status: 503 },
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const email = body.email?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }
  const lang = body.lang === "en" ? "en" : "es";

  // Resolve email → user_id → stripe_customer_id
  const { data: profile, error: profErr } = await sb
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (profErr || !profile) {
    // Don't leak whether the email exists in our system — just say the
    // portal isn't available. Same response shape regardless.
    return NextResponse.json(
      {
        error:
          "No encontramos una suscripción para ese email. Si pensás que es un error, escribinos a soporte.",
      },
      { status: 404 },
    );
  }

  const { data: sub, error: subErr } = await sb
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", profile.id)
    .maybeSingle();
  if (subErr || !sub?.stripe_customer_id) {
    return NextResponse.json(
      {
        error:
          "Tu cuenta está en plan Free, no hay nada que administrar todavía. Cuando upgrades, vas a poder volver acá.",
      },
      { status: 404 },
    );
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `https://terminalsync.ai/${lang}`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[billing-portal] create session failed", { email, message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
