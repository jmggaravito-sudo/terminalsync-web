import { NextResponse } from "next/server";
import {
  TRIAL_DAYS,
  priceIdFor,
  siteUrl,
  stripe,
  type BillingCycle,
  type PlanId,
} from "@/lib/stripe";

export const runtime = "nodejs";

interface Body {
  plan: PlanId;
  cycle?: BillingCycle; // Pro + Dev only
  lang?: "es" | "en";
  email?: string;
  /** Supabase auth user id. Attached to subscription metadata so the
   *  webhook can link Stripe customers to Terminal Sync accounts. */
  supabaseUserId?: string;
  /** Rewardful referral UUID forwarded from the client. When present we
   *  set it as the Stripe `client_reference_id` so Rewardful's webhook
   *  can credit the affiliate after `checkout.session.completed`. */
  referral?: string;
  /** Where to send the user after success/cancel. Defaults to the marketing
   *  site routes; desktop app passes deep-link URLs like
   *  `terminalsync://billing/success`. */
  successUrl?: string;
  cancelUrl?: string;
}

// CORS for the Tauri desktop app. Tauri v2 sends requests with a
// `tauri://` scheme origin on macOS/Linux; browsers use the literal origin.
// We allow-list both terminalsync.ai and all tauri origins since the anon
// endpoint below doesn't expose any secrets beyond publishable info.
function corsHeaders(origin: string | null): Record<string, string> {
  const allowed =
    origin &&
    (origin.startsWith("tauri://") ||
      origin === "https://terminalsync.ai" ||
      origin === "https://www.terminalsync.ai" ||
      origin.startsWith("http://localhost") ||
      origin.startsWith("http://127.0.0.1"));
  return {
    "Access-Control-Allow-Origin": allowed ? origin : "https://terminalsync.ai",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(req.headers.get("origin")),
  });
}

export async function POST(req: Request) {
  const cors = corsHeaders(req.headers.get("origin"));

  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe not configured. Set STRIPE_SECRET_KEY." },
      { status: 503, headers: cors },
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400, headers: cors },
    );
  }

  const cycle: BillingCycle = body.cycle === "yearly" ? "yearly" : "monthly";
  const price = priceIdFor(body.plan, cycle);
  if (!price) {
    const envVar =
      body.plan === "dev"
        ? `STRIPE_PRICE_DEV_${cycle.toUpperCase()}`
        : body.plan === "pro"
          ? `STRIPE_PRICE_PRO_${cycle.toUpperCase()}`
          : "STRIPE_PRICE_AGENCY";
    return NextResponse.json(
      {
        error: `Missing Stripe price for plan "${body.plan}" (${cycle}). Set ${envVar} in the environment.`,
      },
      { status: 503, headers: cors },
    );
  }

  const lang: "es" | "en" = body.lang === "en" ? "en" : "es";
  const base = siteUrl();

  // Trial-eligible tiers (Pro + Dev). Agency is lead-gen, no trial.
  const trialEligible = body.plan === "pro" || body.plan === "dev";

  // Shared metadata so the webhook can identify the user + plan without
  // hitting Stripe's API again.
  const sharedMetadata: Record<string, string> = {
    plan: body.plan,
    cycle,
    source: body.supabaseUserId ? "app.terminalsync/upsell" : "terminalsync.ai/pricing",
  };
  if (body.supabaseUserId) {
    sharedMetadata.supabase_user_id = body.supabaseUserId;
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price, quantity: 1 }],
      allow_promotion_codes: true,
      customer_email: body.email,
      client_reference_id: body.referral,
      subscription_data: trialEligible
        ? {
            trial_period_days: TRIAL_DAYS,
            // If the card fails during the trial, cancel instead of
            // charging a failed invoice — gentler UX, matches the "no
            // charge if cancel before day 7" promise.
            trial_settings: {
              end_behavior: { missing_payment_method: "cancel" },
            },
            metadata: sharedMetadata,
          }
        : {
            // Even without trial we want the metadata on the subscription
            // so the webhook picks it up on `customer.subscription.created`.
            metadata: sharedMetadata,
          },
      // Always collect payment method up front so features can activate
      // immediately after checkout.session.completed.
      payment_method_collection: trialEligible ? "always" : undefined,
      success_url:
        body.successUrl ??
        `${base}/${lang}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: body.cancelUrl ?? `${base}/${lang}/checkout/cancel`,
      locale: lang === "es" ? "es" : "en",
      billing_address_collection: "auto",
      automatic_tax: { enabled: true },
      metadata: sharedMetadata,
    });

    return NextResponse.json({ url: session.url }, { headers: cors });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: message },
      { status: 500, headers: cors },
    );
  }
}
