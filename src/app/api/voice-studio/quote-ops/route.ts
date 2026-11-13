import { NextResponse } from "next/server";
import { Resend } from "resend";
import { stripe } from "@/lib/stripe";
import { quoteAccount, quoteOpsAllowed } from "@/lib/voiceStudioQuoteIntake";
import { uuidPattern } from "@/lib/voiceStudioProduction";

const headers = { "Cache-Control": "private, no-store" };
const fail = (error: string, status: number) => NextResponse.json({ error }, { status, headers });
const statuses = ["submitted", "reviewed", "declined"];

export async function GET(req: Request) {
  try {
    const account = await quoteAccount(req);
    if (!account) return fail("Sign in to continue.", 401);
    if (!quoteOpsAllowed(account.email)) return fail("You do not have production access.", 403);
    const search = new URL(req.url).searchParams;
    const status = search.get("status") ?? "submitted";
    const page = Number(search.get("page") ?? 0);
    if (!statuses.includes(status) || !Number.isInteger(page) || page < 0 || page > 1000) return fail("Invalid filters.", 400);
    const list = await account.db.from("voice_studio_quote_requests")
      .select("id,email,items,estimated_cents,status,created_at,agreement_version")
      .eq("status", status).order("created_at", { ascending: true }).order("id").range(page * 25, page * 25 + 25);
    if (list.error) throw list.error;
    return NextResponse.json({ requests: list.data.slice(0, 25), hasMore: list.data.length > 25 }, { headers });
  } catch { return fail("Could not load quote requests.", 503); }
}

export async function PATCH(req: Request) {
  try {
    const account = await quoteAccount(req);
    if (!account) return fail("Sign in to continue.", 401);
    if (!quoteOpsAllowed(account.email)) return fail("You do not have production access.", 403);
    const body = await req.json().catch(() => null);
    if (typeof body?.id !== "string" || !uuidPattern.test(body.id) ||
        (body.status !== "reviewed" && body.status !== "declined")) return fail("Invalid request.", 400);
    const saved = await account.db.from("voice_studio_quote_requests").update({ status: body.status })
      .eq("id", body.id).eq("status", "submitted").select("id").maybeSingle();
    if (saved.error) throw saved.error;
    if (!saved.data) return fail("That request is no longer awaiting review.", 409);
    return NextResponse.json({ ok: true }, { headers });
  } catch { return fail("Could not save the review.", 503); }
}

// Creates a Stripe Payment Link for a reviewed quote's final amount and
// emails it to the customer. Payment-link metadata (business=voice-studio)
// flows into the checkout session, so the existing webhook handles the
// payment end-to-end: notification + CRM deal → Won.
export async function POST(req: Request) {
  try {
    const account = await quoteAccount(req);
    if (!account) return fail("Sign in to continue.", 401);
    if (!quoteOpsAllowed(account.email)) return fail("You do not have production access.", 403);
    if (!stripe) return fail("Stripe not configured.", 503);
    const body = await req.json().catch(() => null);
    const id = typeof body?.id === "string" && uuidPattern.test(body.id) ? body.id : null;
    const amount = Number(body?.amount_cents);
    if (!id || !Number.isSafeInteger(amount) || amount < 1000 || amount > 10_000_000) {
      return fail("Invalid request or amount (minimum $10).", 400);
    }
    const rows = await account.db.from("voice_studio_quote_requests")
      .select("email,items,estimated_cents").eq("id", id).limit(1);
    if (rows.error) throw rows.error;
    const quote = rows.data?.[0];
    if (!quote) return fail("Quote request not found.", 404);

    const link = await stripe.paymentLinks.create({
      line_items: [{
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: amount,
          product_data: { name: "Voice Studio — Spanish dubbing (final quote)" },
        },
      }],
      metadata: { business: "voice-studio", quote_request_id: id, quote_email: quote.email },
    });

    const key = process.env.RESEND_API_KEY;
    if (key) {
      const resend = new Resend(key);
      try {
        await resend.emails.send({
          from: "Voice Studio <hola@terminalsync.ai>",
          to: quote.email,
          subject: "Voice Studio — your final quote is ready",
          text: [
            "Your dubbing quote has been reviewed. Pay securely here:",
            link.url,
            "",
            `Amount: $${(amount / 100).toFixed(2)}`,
            `Reference: ${id}`,
            "",
            "Production starts as soon as the payment clears.",
          ].join("\n"),
        });
      } catch (err) {
        console.error("[quote-ops] payment link email failed", err);
      }
    }
    return NextResponse.json({ ok: true, url: link.url }, { headers });
  } catch (err) {
    console.error("[quote-ops] payment link failed", err);
    return fail("Could not create the payment link.", 503);
  }
}
