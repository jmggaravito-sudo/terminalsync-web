import { NextResponse } from "next/server";
import {
  matchesCartSession, quoteLifetimeSeconds, quotePricing, testCartCheckoutConfig, testCartStripe, testCheckoutParams,
} from "@/lib/voiceStudioCartCheckout";
import { voiceStudioTestOrderEmails } from "@/lib/voiceStudioOrderEmails";
import { quoteAccount, voiceStudioAgreement } from "@/lib/voiceStudioQuoteIntake";

export const runtime = "nodejs";
const headers = { "Cache-Control": "private, no-store" };
const fail = (error: string, status: number) => NextResponse.json({ error }, { status, headers });
const uuid = /^[a-f\d]{8}-[a-f\d]{4}-4[a-f\d]{3}-[89ab][a-f\d]{3}-[a-f\d]{12}$/i;
const sessionIdPattern = /^cs_test_[a-zA-Z0-9]{1,200}$/;
const originMatches = (req: Request, origin: string) => !req.headers.has("origin") || req.headers.get("origin") === origin;

async function ownedQuote(account: NonNullable<Awaited<ReturnType<typeof quoteAccount>>>, id: string) {
  const { data, error } = await account.db.from("voice_studio_quote_requests")
    .select("id,agreement_version,rights_confirmed,items,estimated_cents,status,created_at")
    .eq("id", id).eq("account_id", account.id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function POST(req: Request) {
  const config = testCartCheckoutConfig();
  const agreement = voiceStudioAgreement();
  if (!config || !agreement) return fail("Test checkout is not available.", 503);
  if (!originMatches(req, config.origin)) return fail("Open test checkout from its configured preview URL.", 403);
  try {
    const account = await quoteAccount(req);
    if (!account) return fail("Sign in to continue.", 401);
    if (!config.testers.includes(account.email)) return fail("This account cannot use test checkout.", 403);
    const { quoteId } = await req.json().catch(() => ({})) ?? {};
    if (typeof quoteId !== "string" || !uuid.test(quoteId)) return fail("Invalid quote reference.", 400);
    const quote = await ownedQuote(account, quoteId);
    if (!quote) return fail("Quote not found.", 404);
    if (quote.agreement_version !== agreement.version || quote.rights_confirmed !== true || quote.status === "declined") {
      return fail("This quote is not eligible for test checkout.", 412);
    }
    const acceptance = await account.db.from("voice_studio_service_acceptances").select("agreement_url")
      .eq("account_id", account.id).eq("agreement_version", agreement.version).maybeSingle();
    if (acceptance.error) throw acceptance.error;
    if (acceptance.data?.agreement_url !== agreement.url) return fail("Accept the current agreement before checkout.", 412);
    const priced = quotePricing(quote.items, quote.estimated_cents);
    if (!priced) return fail("The quote cannot be charged at this amount. Review the cart and request a new estimate.", 409);

    // Fixed parameters and a bounded retry window keep retries within Stripe's
    // idempotency retention period; an old quote cannot create a second session.
    const now = Math.floor(Date.now() / 1000);
    const createdAt = Math.floor(Date.parse(quote.created_at) / 1000);
    const expiresAt = createdAt + quoteLifetimeSeconds;
    if (!Number.isFinite(createdAt) || createdAt > now + 60 || expiresAt <= now + 31 * 60) {
      return NextResponse.json({ error: "This quote is too old for checkout. Reverify the cart and try again.", refreshQuote: true },
        { status: 409, headers });
    }
    const session = await testCartStripe(config.key).checkout.sessions.create(
      testCheckoutParams(quoteId, config.origin, expiresAt, priced),
      { idempotencyKey: `voice-studio-cart-test:${quoteId}` },
    );
    if (!matchesCartSession(session, quoteId, priced.total) || !session.url || new URL(session.url).origin !== "https://checkout.stripe.com") {
      return fail("Stripe did not return a matching test checkout.", 502);
    }
    return NextResponse.json({ url: session.url }, { headers });
  } catch { return fail("Test checkout is temporarily unavailable. Please retry.", 503); }
}

export async function PATCH(req: Request) {
  const config = testCartCheckoutConfig();
  if (!config || !voiceStudioAgreement()) return fail("Test checkout is not available.", 503);
  if (!originMatches(req, config.origin)) return fail("Open test checkout from its configured preview URL.", 403);
  try {
    const account = await quoteAccount(req);
    if (!account) return fail("Sign in to verify the test payment.", 401);
    if (!config.testers.includes(account.email)) return fail("This account cannot use test checkout.", 403);
    const { sessionId } = await req.json().catch(() => ({})) ?? {};
    if (typeof sessionId !== "string" || !sessionIdPattern.test(sessionId)) return fail("Invalid test session reference.", 400);
    const session = await testCartStripe(config.key).checkout.sessions.retrieve(sessionId);
    const quoteId = session.client_reference_id;
    if (typeof quoteId !== "string" || !uuid.test(quoteId)) return fail("Test payment not found.", 404);
    const quote = await ownedQuote(account, quoteId);
    if (!quote || !matchesCartSession(session, quoteId, quote.estimated_cents)) return fail("Test payment not found.", 404);
    const paid = session.status === "complete" && session.payment_status === "paid";
    if (!paid) return NextResponse.json({ paid: false, total: quote.estimated_cents }, { headers });
    const previews = voiceStudioTestOrderEmails({
      id: quoteId, email: account.email, total: quote.estimated_cents, items: quote.items,
      opsUrl: `${config.origin}/admin/voice-studio/quotes`,
    });
    // Order and both previews are committed together. No email delivery or
    // live fulfillment occurs. Repeat Stripe returns cannot duplicate orders.
    const saved = await account.db.from("voice_studio_sandbox_orders").upsert({
      quote_id: quoteId, stripe_session_id: session.id, total_cents: quote.estimated_cents,
      currency: "usd", client_email_preview: previews.client, team_email_preview: previews.team,
    }, { onConflict: "quote_id", ignoreDuplicates: true });
    if (saved.error) throw saved.error;
    const order = await account.db.from("voice_studio_sandbox_orders").select("stripe_session_id")
      .eq("quote_id", quoteId).single();
    if (order.error || order.data?.stripe_session_id !== session.id) return fail("Test order could not be reconciled.", 409);
    return NextResponse.json({ paid: true, total: quote.estimated_cents, orderId: quoteId }, { headers });
  } catch { return fail("The test payment could not be verified.", 503); }
}
