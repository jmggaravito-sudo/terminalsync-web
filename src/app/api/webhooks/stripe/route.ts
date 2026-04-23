import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { sendWelcomeEmail } from "@/lib/email";

export const runtime = "nodejs";

// Stripe requires the raw body for signature verification, so we opt out of
// any body parsing and read the bytes directly.
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

  try {
    await handle(event);
  } catch (err) {
    console.error("[stripe] handler error", err);
    // 200 anyway so Stripe doesn't retry-storm; the error is logged.
  }

  return NextResponse.json({ received: true });
}

async function handle(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed": {
      // User just finished checkout. For Pro this happens even before the
      // first charge because of the 7-day trial — perfect moment to activate
      // Power-Ups + send the welcome email.
      const session = event.data.object as Stripe.Checkout.Session;
      const plan = session.metadata?.plan;
      const cycle = session.metadata?.cycle;
      const email = session.customer_details?.email;
      const name = session.customer_details?.name ?? "";
      const firstName = name.split(" ")[0] || "hola";

      console.log("[stripe] checkout.session.completed", {
        sessionId: session.id,
        customer: session.customer,
        subscription: session.subscription,
        email,
        plan,
        cycle,
      });

      // Fire the welcome email (idempotency header inside sendWelcomeEmail
      // prevents duplicates if Stripe retries).
      if (email) {
        try {
          await sendWelcomeEmail({
            to: email,
            firstName,
            downloadUrl: "https://terminalsync.ai/es#hero",
            unsubscribeUrl: `https://terminalsync.ai/es/unsubscribe?e=${encodeURIComponent(email)}`,
          });
          console.log("[stripe] welcome email sent");
        } catch (err) {
          console.error("[stripe] welcome email failed", err);
        }
      }

      // TODO: push an activation record to the product backend so the
      // TerminalSync desktop app can flip Power-Ups on for this customer's
      // next session. Suggested payload:
      //   { customerId, subscriptionId, plan, cycle, trialEnd }
      // See PROVISIONING in comments below.
      break;
    }

    case "customer.subscription.created": {
      const sub = event.data.object as Stripe.Subscription;
      console.log("[stripe] subscription.created", {
        id: sub.id,
        status: sub.status, // "trialing" during the first 7 days
        trialEnd: sub.trial_end,
        customer: sub.customer,
      });
      // During trialing, the user already has access — no further action.
      // On status="active" (trial converted), the invoice.paid handler also
      // fires; we don't need to double-process here.
      break;
    }

    case "customer.subscription.trial_will_end": {
      // Fires ~3 days before trial ends. Chance to remind the user.
      const sub = event.data.object as Stripe.Subscription;
      console.log("[stripe] subscription.trial_will_end", {
        id: sub.id,
        trialEnd: sub.trial_end,
      });
      // TODO: send "your trial ends in 3 days" email via Resend.
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const canceledDuringTrial =
        sub.cancel_at_period_end === true && sub.status === "trialing";
      console.log("[stripe] subscription.updated", {
        id: sub.id,
        status: sub.status,
        cancel_at_period_end: sub.cancel_at_period_end,
        canceledDuringTrial,
      });
      // If canceled during trial, access stays until trial_end then Stripe
      // emits subscription.deleted automatically. Nothing to do here.
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      console.log("[stripe] subscription.deleted — revoke access", {
        id: sub.id,
        customer: sub.customer,
      });
      // TODO: flip the customer's access flag off in the product backend.
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
      // TODO: email customer + pause product access.
      break;
    }

    default:
      // Other events (e.g. payment_intent.*) are expected and non-fatal.
      break;
  }
}

// ─── PROVISIONING (next step, not in this file) ───────────────────────
// To flip "Power-Ups activated" on the desktop app immediately after
// checkout, add a small HTTP call from here to the product backend:
//
//   await fetch(`${PRODUCT_API}/provision`, {
//     method: "POST",
//     headers: { Authorization: `Bearer ${INTERNAL_TOKEN}` },
//     body: JSON.stringify({ customerId, subscriptionId, plan, cycle }),
//   });
//
// The Tauri app polls /me/subscription on launch; when it sees status=active
// or trialing, Power-Ups are unlocked.
