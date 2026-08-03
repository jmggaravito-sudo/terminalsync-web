import { NextResponse } from "next/server";
import { authenticate } from "@/lib/marketplace/auth";
import { corsHeaders, preflight } from "@/lib/cors";
import {
  copAmountForCreditPackage,
  creditMetadata,
  creditPackageFor,
  creditReturnUrl,
  normalizeCreditFlavor,
  normalizeCreditLang,
  normalizeCreditRail,
} from "@/lib/aiCredits";
import {
  createPaymentPreference,
  mercadoPagoConfigured,
} from "@/lib/mercadopago";
import { siteUrl, stripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Body {
  product?: string;
  amountCents?: number;
  rail?: string;
  country?: string | null;
  currency?: string;
  lang?: string;
  flavor?: string;
}

export async function OPTIONS(req: Request) {
  return preflight(req, "POST, OPTIONS");
}

export async function POST(req: Request) {
  const cors = corsHeaders(req.headers.get("origin"), "POST, OPTIONS");
  const json = (data: unknown, status: number) =>
    NextResponse.json(data, { status, headers: cors });

  const user = await authenticate(req);
  if (!user) {
    return json(
      { error: "Sign in again before adding credits.", code: "sign_in_required" },
      401,
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return json({ error: "Invalid request.", code: "invalid_request" }, 400);
  }

  if (body.product !== "credits") {
    return json({ error: "Unsupported product.", code: "invalid_request" }, 400);
  }
  const creditPackage = creditPackageFor(body.amountCents);
  if (!creditPackage) {
    return json(
      { error: "Choose a supported credit package.", code: "invalid_amount" },
      400,
    );
  }
  const rail = normalizeCreditRail(body.rail);
  if (!rail) {
    return json(
      { error: "Choose a supported payment method.", code: "invalid_rail" },
      400,
    );
  }

  const lang = normalizeCreditLang(body.lang);
  const flavor = normalizeCreditFlavor(body.flavor);
  const base = siteUrl();
  const successUrl = creditReturnUrl({
    base,
    lang,
    flavor,
    status: "success",
    stripeSessionPlaceholder: rail === "stripe",
  });
  const cancelUrl = creditReturnUrl({ base, lang, flavor, status: "cancel" });
  const pendingUrl = creditReturnUrl({ base, lang, flavor, status: "pending" });
  const metadata = creditMetadata({ userId: user.id, creditPackage, rail });

  try {
    if (rail === "stripe") {
      if (!stripe) {
        return json(
          { error: "Credit checkout is temporarily unavailable.", code: "checkout_unavailable" },
          503,
        );
      }
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "usd",
              unit_amount: creditPackage.amountCents,
              product_data: {
                name: `Terminal Sync AI credits — $${creditPackage.usd}`,
                description: "Prepaid balance for AI creation inside Terminal Sync",
              },
            },
            quantity: 1,
          },
        ],
        customer_email: user.email ?? undefined,
        success_url: successUrl,
        cancel_url: cancelUrl,
        locale: lang,
        payment_method_collection: "always",
        metadata,
        payment_intent_data: { metadata },
      });
      if (!session.url) throw new Error("Stripe did not return a checkout URL");
      return json({ url: session.url, rail, checkoutId: session.id }, 200);
    }

    if (!mercadoPagoConfigured) {
      return json(
        { error: "Credit checkout is temporarily unavailable.", code: "checkout_unavailable" },
        503,
      );
    }
    const preference = await createPaymentPreference({
      amount: copAmountForCreditPackage(creditPackage),
      currency: "COP",
      payerEmail: user.email ?? undefined,
      externalReference: user.id,
      title: `Créditos de IA Terminal Sync — US$${creditPackage.usd}`,
      successUrl,
      cancelUrl: creditReturnUrl({ base, lang, flavor, status: "failure" }),
      pendingUrl,
      notificationUrl: `${base.replace(/\/+$/, "")}/api/webhooks/mercadopago?source=credits`,
      metadata,
    });
    return json(
      { url: preference.initPoint, rail, checkoutId: preference.id },
      200,
    );
  } catch (err) {
    console.error("[credits-checkout] provider failed", {
      rail,
      userId: user.id,
      amountCents: creditPackage.amountCents,
      error: err instanceof Error ? err.message : String(err),
    });
    return json(
      { error: "Credit checkout is temporarily unavailable.", code: "provider_unavailable" },
      502,
    );
  }
}
