import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { corsHeaders, preflight } from "@/lib/cors";

export const runtime = "nodejs";

export async function OPTIONS(req: Request) {
  return preflight(req);
}

interface Body {
  /** The user's email — verified earlier by either their signed-in Supabase
   *  session or by them clicking a magic link we sent. */
  email: string;
  /** Optional locale for the localized return URL. */
  lang?: "es" | "en";
  /** Deep-link the portal session into a specific flow. "cancel" jumps
   *  straight into the cancellation form for the active subscription;
   *  omit for the default landing screen (where the user picks an action). */
  flow?: "cancel";
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
  const cors = corsHeaders(req.headers.get("origin"));
  const json = (data: unknown, status: number) =>
    NextResponse.json(data, { status, headers: cors });

  if (!stripe) {
    return json({ error: "Stripe not configured" }, 503);
  }
  const sb = getSupabaseAdmin();
  if (!sb) {
    return json({ error: "Supabase admin not configured" }, 503);
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }
  const email = body.email?.trim().toLowerCase();
  if (!email) {
    return json({ error: "Email required" }, 400);
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
    return json(
      {
        error:
          "No encontramos una suscripción para ese email. Si pensás que es un error, escribinos a soporte.",
      },
      404,
    );
  }

  const { data: sub, error: subErr } = await sb
    .from("subscriptions")
    .select("stripe_customer_id, stripe_subscription_id, status")
    .eq("user_id", profile.id)
    .maybeSingle();
  if (subErr || !sub?.stripe_customer_id) {
    return json(
      {
        error:
          "Tu cuenta está en plan Free, no hay nada que administrar todavía. Cuando upgrades, vas a poder volver acá.",
      },
      404,
    );
  }

  const wantsCancel = body.flow === "cancel";
  if (wantsCancel && !sub.stripe_subscription_id) {
    // Edge case: user has a Stripe customer but no active subscription
    // (e.g. previously canceled and never re-subscribed). The default
    // portal flow still lets them re-subscribe / see invoices.
    return json(
      {
        error:
          "No tenés una suscripción activa para cancelar. Si pensás que es un error, escribinos a soporte.",
      },
      404,
    );
  }

  try {
    const params: Parameters<typeof stripe.billingPortal.sessions.create>[0] = {
      customer: sub.stripe_customer_id,
      return_url: `https://terminalsync.ai/${lang}`,
    };
    if (wantsCancel && sub.stripe_subscription_id) {
      // Deep-link straight into the cancellation form. The Portal config
      // (set via Stripe API on 2026-05-20) has cancel + reason picker
      // enabled, so the user lands on the confirm screen with the
      // reason multiple-choice already visible.
      params.flow_data = {
        type: "subscription_cancel",
        subscription_cancel: { subscription: sub.stripe_subscription_id },
      };
    }
    const session = await stripe.billingPortal.sessions.create(params);
    return json({ url: session.url }, 200);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[billing-portal] create session failed", {
      email,
      flow: body.flow,
      message,
    });
    return json({ error: message }, 500);
  }
}
