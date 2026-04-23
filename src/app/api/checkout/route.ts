import { NextResponse } from "next/server";
import { priceIdFor, siteUrl, stripe, type PlanId } from "@/lib/stripe";

export const runtime = "nodejs";

interface Body {
  plan: PlanId;
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

  const price = priceIdFor(body.plan);
  if (!price) {
    return NextResponse.json(
      {
        error: `Missing Stripe price for plan "${body.plan}". Set STRIPE_PRICE_${body.plan.toUpperCase()}.`,
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
      // 14-day free trial so the Pro CTA ("Probar Pro gratis") stays honest.
      subscription_data: body.plan === "pro" ? { trial_period_days: 14 } : undefined,
      success_url: `${base}/${lang}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/${lang}/checkout/cancel`,
      locale: lang === "es" ? "es" : "en",
      billing_address_collection: "auto",
      automatic_tax: { enabled: true },
      metadata: {
        plan: body.plan,
        source: "terminalsync.ai/pricing",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
