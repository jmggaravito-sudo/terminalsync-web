import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

// Stripe requires the raw body for signature verification, so we opt out
// of any body parsing and read the bytes directly.
export async function POST(req: Request) {
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 503 },
    );
  }

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Missing STRIPE_WEBHOOK_SECRET" },
      { status: 503 },
    );
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, signature, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // Route each event to its handler. Handlers are intentionally minimal right
  // now; they log + acknowledge. Once the backend/DB is wired, this is where
  // we'd create users, enable features, send email receipts, etc.
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("[stripe] checkout.session.completed", {
          sessionId: session.id,
          customer: session.customer,
          email: session.customer_details?.email,
          plan: session.metadata?.plan,
        });
        // TODO: mark the user as paid in the DB, send welcome email via Resend,
        // provision a license key, etc.
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        console.log("[stripe] subscription", {
          id: sub.id,
          status: sub.status,
          customer: sub.customer,
        });
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        console.log("[stripe] subscription canceled", {
          id: sub.id,
          customer: sub.customer,
        });
        // TODO: revoke access in the app.
        break;
      }
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log("[stripe] invoice.paid", {
          id: invoice.id,
          amount: invoice.amount_paid,
          customer: invoice.customer,
        });
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.warn("[stripe] invoice.payment_failed", {
          id: invoice.id,
          customer: invoice.customer,
        });
        // TODO: email the customer, pause their plan if we need to.
        break;
      }
      default:
        // Unhandled events are expected and non-fatal.
        break;
    }
  } catch (err) {
    console.error("[stripe] handler error", err);
    // Return 200 anyway to avoid Stripe retry storms; the error is logged.
  }

  return NextResponse.json({ received: true });
}
