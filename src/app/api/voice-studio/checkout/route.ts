import { NextResponse } from "next/server";
import { siteUrl, stripe } from "@/lib/stripe";
import {
  VOICE_STUDIO_SKUS,
  voiceStudioPriceId,
  type VoiceStudioSku,
} from "@/lib/voiceStudioStripe";

export const runtime = "nodejs";

interface Body {
  sku: VoiceStudioSku;
  /** Optional prefilled buyer email. */
  email?: string;
}

// Public checkout endpoint for the Voice Studio landing. Creates a Stripe
// Checkout session (hosted by Stripe) for the requested SKU and returns its
// URL. Sessions carry metadata.business = "voice-studio" so the webhook
// routes the payment to the Voice Studio flow — never TerminalSync
// fulfillment. No Supabase, no desktop app, no cross-links to the app site.
export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const sku = body.sku;
  const def = sku && sku in VOICE_STUDIO_SKUS ? VOICE_STUDIO_SKUS[sku] : null;
  if (!def) {
    return NextResponse.json(
      { error: `Unknown SKU "${String(sku)}"` },
      { status: 400 },
    );
  }
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe not configured. Set STRIPE_SECRET_KEY." },
      { status: 503 },
    );
  }
  const price = voiceStudioPriceId(def.sku);
  if (!price) {
    return NextResponse.json(
      {
        error: `Missing Stripe price for "${def.sku}". Set ${def.envVar} in the environment.`,
      },
      { status: 503 },
    );
  }

  // Back on the standalone landing only — never the app site.
  const base = siteUrl();
  const successUrl = `${base}/voice-studio?checkout=success`;
  const cancelUrl = `${base}/voice-studio#pricing`;
  const metadata: Record<string, string> = {
    business: "voice-studio",
    sku: def.sku,
    source: "terminalsync.ai/voice-studio",
  };

  try {
    const session = await stripe.checkout.sessions.create({
      mode: def.mode,
      line_items: [{ price, quantity: 1 }],
      allow_promotion_codes: true,
      customer_email: body.email?.trim() || undefined,
      ...(def.mode === "subscription"
        ? { subscription_data: { metadata } }
        : {}),
      payment_method_collection: "always",
      success_url: successUrl,
      cancel_url: cancelUrl,
      locale: "en",
      billing_address_collection: "auto",
      automatic_tax: { enabled: true },
      metadata,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[voice-studio-checkout] session failed", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
