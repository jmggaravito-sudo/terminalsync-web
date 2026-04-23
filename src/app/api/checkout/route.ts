import { NextResponse } from "next/server";
import {
  PRO_TRIAL_DAYS,
  priceIdFor,
  siteUrl,
  stripe,
  type BillingCycle,
  type PlanId,
} from "@/lib/stripe";

export const runtime = "nodejs";

interface Body {
  plan: PlanId;
  cycle?: BillingCycle; // only used for Pro — monthly | yearly
  lang?: "es" | "en";
  email?: string;
}

export async function POST(req: Request) {
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe not configured. Set STRIPE_SECRET_KEY." },
      { status: 503 },
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const cycle: BillingCycle = body.cycle === "yearly" ? "yearly" : "monthly";
  const price = priceIdFor(body.plan, cycle);
  if (!price) {
    return NextResponse.json(
      {
        error: `Missing Stripe price for plan "${body.plan}" (${cycle}). Set STRIPE_PRICE_PRO_${cycle.toUpperCase()}.`,
      },
      { status: 503 },
    );
  }

  const lang: "es" | "en" = body.lang === "en" ? "en" : "es";
  const base = siteUrl();

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price, quantity: 1 }],
      allow_promotion_codes: true,
      customer_email: body.email,
      // 7-day trial on Pro (both monthly and yearly). Card is required so the
      // subscription auto-converts on day 7 unless the user cancels first.
      subscription_data:
        body.plan === "pro"
          ? {
              trial_period_days: PRO_TRIAL_DAYS,
              // If the card fails during the trial, cancel instead of charging a
              // failed invoice — gentler UX, matches the "no charge if cancel
              // before day 7" promise.
              trial_settings: {
                end_behavior: { missing_payment_method: "cancel" },
              },
              metadata: {
                plan: body.plan,
                cycle,
              },
            }
          : undefined,
      // Require the payment method up front so the Power-Ups can activate
      // immediately after checkout.session.completed.
      payment_method_collection:
        body.plan === "pro" ? "always" : undefined,
      success_url: `${base}/${lang}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/${lang}/checkout/cancel`,
      locale: lang === "es" ? "es" : "en",
      billing_address_collection: "auto",
      automatic_tax: { enabled: true },
      metadata: {
        plan: body.plan,
        cycle,
        source: "terminalsync.ai/pricing",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
