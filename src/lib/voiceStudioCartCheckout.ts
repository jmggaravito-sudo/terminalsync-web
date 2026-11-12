import Stripe from "stripe";
import { estimateCart, type CartVideo } from "@/components/voice-studio/cartPricing";
import { parseQuoteItems } from "@/lib/voiceStudioQuoteIntake";

export const checkoutKind = "voice-studio-cart-test";
export const quoteLifetimeSeconds = 2 * 60 * 60;

export const testCartCheckoutRequested = () => process.env.VOICE_STUDIO_CART_TEST_CHECKOUT_ENABLED === "true";

export function testCartCheckoutConfig() {
  if (!testCartCheckoutRequested() ||
      process.env.VERCEL_ENV === "production" || process.env.VERCEL_TARGET_ENV === "production") return null;
  const key = process.env.VOICE_STUDIO_CART_STRIPE_TEST_KEY?.trim();
  const testers = (process.env.VOICE_STUDIO_CART_TESTER_EMAILS ?? "")
    .split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
  if (!key || !/^(?:sk|rk)_test_[a-zA-Z0-9]+$/.test(key) || !testers.length) return null;
  try {
    // Preview normally inherits production Supabase. Require an explicit
    // opt-in for the isolated project, with matching client/server origins.
    const staging = new URL(process.env.VOICE_STUDIO_CART_TEST_SUPABASE_URL ?? "");
    if (staging.href !== `${staging.origin}/` ||
        new URL(process.env.SUPABASE_URL ?? "").origin !== staging.origin ||
        new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").origin !== staging.origin) return null;
    const origin = new URL(process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : (process.env.VOICE_STUDIO_CART_TEST_ORIGIN ?? "http://localhost:3131"));
    if (origin.username || origin.password || origin.href !== `${origin.origin}/`) return null;
    if (process.env.VERCEL_URL) {
      if (process.env.VERCEL_ENV !== "preview" || !origin.hostname.endsWith(".vercel.app")) return null;
    } else if (process.env.NODE_ENV === "production" || origin.protocol !== "http:" ||
        !["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname)) return null;
    return { key, testers, origin: origin.origin };
  } catch { return null; }
}

export function testCartStripe(key: string) {
  return new Stripe(key, { apiVersion: "2026-03-25.dahlia", timeout: 10_000, maxNetworkRetries: 1 });
}

export function quotePricing(raw: unknown, cents: unknown) {
  const choices = parseQuoteItems(raw);
  if (!choices || !Array.isArray(raw)) return null;
  const videos: CartVideo[] = [];
  for (const [index, choice] of choices.entries()) {
    const { seconds } = raw[index];
    if (!Number.isSafeInteger(seconds) || seconds <= 0 || choice.shorts.some((short) => short > seconds)) return null;
    videos.push({ ...choice, title: "", seconds });
  }
  const priced = estimateCart(videos);
  if (!Number.isSafeInteger(priced.total) || priced.total < 50 || priced.total > 99999999 || priced.total !== cents) return null;
  return priced;
}

export function testCheckoutParams(quoteId: string, origin: string, expiresAt: number, priced: NonNullable<ReturnType<typeof quotePricing>>): Stripe.Checkout.SessionCreateParams {
  const cart = [
    { name: "DUB · Spanish dubbing", amount: priced.dubbing },
    { name: "LIP · Spanish dubbing with lip-sync", amount: priced.lip },
    { name: "Shorts / Reels in Spanish", amount: priced.shorts },
  ];
  return {
    mode: "payment",
    payment_method_types: ["card"],
    currency: "usd",
    adaptive_pricing: { enabled: false },
    automatic_tax: { enabled: false },
    expires_at: expiresAt,
    success_url: `${origin}/voice-studio/cart-preview/test-result?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/voice-studio/cart-preview`,
    client_reference_id: quoteId,
    metadata: { kind: checkoutKind },
    line_items: cart.filter(({ amount }) => amount > 0).map(({ name, amount }) => ({
      quantity: 1,
      price_data: { currency: "usd", unit_amount: amount, product_data: { name } },
    })),
  };
}

export function matchesCartSession(session: Stripe.Checkout.Session, quoteId: string, cents: number) {
  return session.livemode === false && session.id.startsWith("cs_test_") && session.mode === "payment" &&
    session.metadata?.kind === checkoutKind && session.client_reference_id === quoteId &&
    session.currency === "usd" && session.amount_total === cents;
}
