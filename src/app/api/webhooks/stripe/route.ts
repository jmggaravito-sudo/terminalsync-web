import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import {
  sendWelcomeEmail,
  sendTrialEndingEmail,
  sendPaymentFailedEmail,
  sendCancellationEmail,
} from "@/lib/email";
import {
  syncSubscriptionToSupabase,
  revokeSubscription,
} from "@/lib/subscriptionsSync";

/** Friendly plan + cycle label from Stripe metadata. Falls back to a
 *  generic name if metadata wasn't propagated (older subs). */
function planLabel(metadata: Stripe.Metadata | null | undefined): string {
  const plan = metadata?.plan;
  const cycle = metadata?.cycle;
  if (!plan) return "Terminal Sync";
  const proper = plan.charAt(0).toUpperCase() + plan.slice(1);
  if (cycle === "yearly") return `${proper} anual`;
  if (cycle === "monthly") return `${proper} mensual`;
  return proper;
}

/** Pull customer email + first name from Stripe. Used by the trial-ending
 *  + payment-failed + cancellation handlers since the Subscription /
 *  Invoice objects only carry the customer id. */
async function fetchCustomerProfile(
  customerId: string,
): Promise<{ email: string | null; firstName: string }> {
  if (!stripe) return { email: null, firstName: "hola" };
  try {
    const c = await stripe.customers.retrieve(customerId);
    if (c.deleted) return { email: null, firstName: "hola" };
    const email = c.email ?? null;
    const firstName = (c.name ?? "").split(" ")[0] || "hola";
    return { email, firstName };
  } catch (err) {
    console.error("[stripe] customers.retrieve failed", { customerId, err });
    return { email: null, firstName: "hola" };
  }
}

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
      // Upsert immediately so the Tauri app can flip Power-Ups on as soon
      // as the user returns — even during the 7-day trial (status='trialing').
      await syncSubscriptionToSupabase(sub);
      break;
    }

    case "customer.subscription.trial_will_end": {
      // Fires ~3 days before trial ends. Last touchpoint to convert.
      const sub = event.data.object as Stripe.Subscription;
      console.log("[stripe] subscription.trial_will_end", {
        id: sub.id,
        trialEnd: sub.trial_end,
      });
      if (!sub.trial_end) break;
      const customerId =
        typeof sub.customer === "string" ? sub.customer : sub.customer.id;
      const { email, firstName } = await fetchCustomerProfile(customerId);
      if (email) {
        try {
          await sendTrialEndingEmail({
            to: email,
            firstName,
            planName: planLabel(sub.metadata),
            trialEnd: new Date(sub.trial_end * 1000),
            customerId,
            subscriptionId: sub.id,
          });
          console.log("[stripe] trial-ending email sent");
        } catch (err) {
          console.error("[stripe] trial-ending email failed", err);
        }
      }
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
      // Keep Supabase in sync on ANY mutation — status changes (trialing
      // → active), plan upgrades (Pro → Dev via customer portal), cancel-
      // at-period-end toggles. The row is authoritative for useMe().plan.
      await syncSubscriptionToSupabase(sub);
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      console.log("[stripe] subscription.deleted — revoke access", {
        id: sub.id,
        customer: sub.customer,
      });
      // Flip the user back to free plan. We DO NOT delete their terminals
      // — client-side canCreateTerminal() enforces the cap on NEW creates
      // only. Existing terminals stay readable/writable.
      await revokeSubscription(sub);

      // Send the cancellation confirmation last so revoke happens even if
      // the email fails (data integrity > inbox notification).
      const customerId =
        typeof sub.customer === "string" ? sub.customer : sub.customer.id;
      const { email, firstName } = await fetchCustomerProfile(customerId);
      if (email) {
        try {
          await sendCancellationEmail({
            to: email,
            firstName,
            planName: planLabel(sub.metadata),
            // Stripe surfaces feedback under cancellation_details when the
            // user picks a reason in the customer portal.
            reason:
              sub.cancellation_details?.feedback ??
              sub.cancellation_details?.comment ??
              undefined,
            subscriptionId: sub.id,
          });
          console.log("[stripe] cancellation email sent");
        } catch (err) {
          console.error("[stripe] cancellation email failed", err);
        }
      }
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
      // Stripe will retry the card 3 times over ~2 weeks. We don't revoke
      // access here — that's what subscription.deleted is for. Email the
      // user so they have a chance to fix the card before access drops.
      const customerId =
        typeof invoice.customer === "string"
          ? invoice.customer
          : invoice.customer?.id;
      if (!customerId || !invoice.id) break;
      const { email, firstName } = await fetchCustomerProfile(customerId);
      if (email) {
        try {
          // Generic plan label for the email — fetching the linked
          // subscription to get its metadata is a round-trip we skip
          // (Stripe's API location for `invoice.subscription` keeps
          // moving across SDK versions). User sees "Terminal Sync" + the
          // amount, and the CTA opens their portal where Stripe shows
          // exact plan details.
          await sendPaymentFailedEmail({
            to: email,
            firstName,
            planName: "Terminal Sync",
            amountCents: invoice.amount_due ?? 0,
            currency: invoice.currency ?? "usd",
            invoiceId: invoice.id,
          });
          console.log("[stripe] payment-failed email sent");
        } catch (err) {
          console.error("[stripe] payment-failed email failed", err);
        }
      }
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
