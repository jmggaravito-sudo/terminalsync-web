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
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

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

  // Stripe sends LIVE events signed with STRIPE_WEBHOOK_SECRET and TEST
  // events signed with STRIPE_TEST_WEBHOOK_SECRET. Same endpoint URL is
  // registered for both modes in our Stripe account, so we accept either
  // signature here. Without this, the E2E test scripts firing test
  // events at production landed as `pending_webhooks=1` (signature
  // mismatch → 400) and Supabase never picked up the events.
  const liveSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const testSecret = process.env.STRIPE_TEST_WEBHOOK_SECRET;
  if (!liveSecret && !testSecret) {
    return NextResponse.json(
      { error: "Missing STRIPE_WEBHOOK_SECRET (and no test fallback)" },
      { status: 503 },
    );
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const raw = await req.text();
  let event: Stripe.Event | null = null;
  let lastError: unknown = null;
  for (const secret of [liveSecret, testSecret]) {
    if (!secret) continue;
    try {
      event = stripe.webhooks.constructEvent(raw, signature, secret);
      break;
    } catch (err) {
      lastError = err;
    }
  }
  if (!event) {
    const message =
      lastError instanceof Error ? lastError.message : "Invalid signature";
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

      // Marketplace one-time charges arrive here with mode='payment' and
      // a metadata.source flag — route them to the connector install flow
      // instead of the subscription welcome email path.
      if (session.metadata?.source === "terminalsync_marketplace") {
        await handleMarketplaceCheckout(session);
        break;
      }

      // Stack Pack (bundle) one-time charges. Same event type, different
      // source flag — grants the bundle to the buyer and creates an
      // install row per included connector so the desktop app picks them
      // all up on the next /installed sync.
      if (session.metadata?.source === "terminalsync_bundle") {
        await handleBundleCheckout(session);
        break;
      }

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

    case "account.updated": {
      // Stripe Connect: a publisher finished (or updated) their Express
      // onboarding. Sync payout_enabled into Supabase so paid listings can
      // route money to them.
      const acct = event.data.object as Stripe.Account;
      const sb = getSupabaseAdmin();
      if (!sb) break;
      const payoutEnabled =
        acct.payouts_enabled === true && acct.details_submitted === true;
      const { error } = await sb
        .from("publishers")
        .update({ payout_enabled: payoutEnabled })
        .eq("stripe_account_id", acct.id);
      if (error) {
        console.error("[stripe] account.updated upsert failed", error.message);
      } else {
        console.log("[stripe] publisher payout state synced", { account: acct.id, payoutEnabled });
      }
      break;
    }

    case "transfer.created": {
      const transfer = event.data.object as Stripe.Transfer;
      const sb = getSupabaseAdmin();
      if (!sb) break;
      const charge =
        typeof transfer.source_transaction === "string"
          ? transfer.source_transaction
          : transfer.source_transaction?.id;
      if (!charge) break;
      const { error } = await sb
        .from("marketplace_payouts")
        .update({ stripe_transfer_id: transfer.id, status: "paid" })
        .eq("stripe_charge_id", charge);
      if (error) console.error("[marketplace] payout sync failed", error.message);
      break;
    }

    case "charge.refunded": {
      // Buyer refund → drop install + mark payout refunded so reporting
      // and any future clawback logic has the right state. We only act on
      // FULL refunds — partial refunds get logged for now (the schema
      // doesn't track partial amounts).
      const charge = event.data.object as Stripe.Charge;
      const sb = getSupabaseAdmin();
      if (!sb) break;
      if (!charge.id) break;

      const refundedAll = charge.amount_refunded >= charge.amount;
      if (!refundedAll) {
        console.log("[marketplace] partial refund logged", { charge: charge.id });
        break;
      }

      const installUpd = await sb
        .from("connector_installs")
        .update({ status: "uninstalled" })
        .eq("stripe_charge_id", charge.id);
      if (installUpd.error) {
        console.error("[marketplace] refund install sync failed", installUpd.error.message);
      }

      const payoutUpd = await sb
        .from("marketplace_payouts")
        .update({ status: "refunded" })
        .eq("stripe_charge_id", charge.id);
      if (payoutUpd.error) {
        console.error("[marketplace] refund payout sync failed", payoutUpd.error.message);
      }

      // Bundle purchases share the same charge.refunded path. We mark
      // the purchase refunded AND drop the bundle's per-listing
      // installs that were granted at purchase time so the desktop
      // app removes them on next sync.
      const bundleRefund = await sb
        .from("bundle_purchases")
        .update({ status: "refunded", refunded_at: new Date().toISOString() })
        .eq("stripe_charge_id", charge.id)
        .select("id, user_id, bundle_id");
      if (bundleRefund.error) {
        console.error("[bundle] refund sync failed", bundleRefund.error.message);
      } else if (bundleRefund.data && bundleRefund.data.length > 0) {
        // For each refunded purchase, mark its bundle's listings
        // uninstalled FOR THIS USER ONLY (don't touch other users).
        for (const purchase of bundleRefund.data) {
          const listingsRes = await sb
            .from("bundle_listings")
            .select("listing_id")
            .eq("bundle_id", purchase.bundle_id);
          const listingIds = (listingsRes.data ?? []).map((l) => l.listing_id);
          if (listingIds.length > 0) {
            await sb
              .from("connector_installs")
              .update({ status: "uninstalled" })
              .eq("user_id", purchase.user_id)
              .in("listing_id", listingIds);
          }
        }
        console.log("[bundle] refund synced", { charge: charge.id, count: bundleRefund.data.length });
      }

      console.log("[marketplace] refund synced", { charge: charge.id });
      break;
    }

    default:
      // Other events (e.g. payment_intent.*) are expected and non-fatal.
      break;
  }
}

async function handleMarketplaceCheckout(session: Stripe.Checkout.Session) {
  const listingId = session.metadata?.listing_id;
  const buyerUserId = session.metadata?.buyer_user_id;
  const publisherId = session.metadata?.publisher_id;
  if (!listingId || !buyerUserId || !publisherId) {
    console.warn("[marketplace] checkout missing metadata", session.id);
    return;
  }

  const sb = getSupabaseAdmin();
  if (!sb) return;

  const latestVersion = await sb
    .from("connector_versions")
    .select("id")
    .eq("listing_id", listingId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const chargeId =
    typeof session.payment_intent === "string" ? session.payment_intent : null;

  const upsert = await sb.from("connector_installs").upsert(
    {
      user_id: buyerUserId,
      listing_id: listingId,
      version_id: latestVersion.data?.id ?? null,
      status: "active",
      stripe_charge_id: chargeId,
      amount_paid_cents: session.amount_total ?? null,
      installed_at: new Date().toISOString(),
    },
    { onConflict: "user_id,listing_id" },
  );
  if (upsert.error) {
    console.error("[marketplace] install upsert failed", upsert.error.message);
    return;
  }

  const grossCents = Number(session.metadata?.gross_cents ?? 0);
  const tsTakeCents = Number(session.metadata?.ts_take_cents ?? 0);
  const publisherCents = grossCents - tsTakeCents;
  const payout = await sb.from("marketplace_payouts").insert({
    publisher_id: publisherId,
    gross_cents: grossCents,
    ts_take_cents: tsTakeCents,
    publisher_cents: publisherCents,
    stripe_charge_id: chargeId,
    status: "pending",
  });
  if (payout.error) {
    console.error("[marketplace] payout row insert failed", payout.error.message);
  }
  console.log("[marketplace] install + pending payout", { buyerUserId, listingId, grossCents });
}

async function handleBundleCheckout(session: Stripe.Checkout.Session) {
  const bundleId = session.metadata?.bundle_id;
  const buyerUserId = session.metadata?.buyer_user_id;
  if (!bundleId || !buyerUserId) {
    console.warn("[bundle] checkout missing metadata", session.id);
    return;
  }

  const sb = getSupabaseAdmin();
  if (!sb) return;

  const chargeId =
    typeof session.payment_intent === "string" ? session.payment_intent : null;
  const amountPaid = session.amount_total ?? 0;
  const currency = session.currency ?? "usd";

  // 1) Upsert the purchase row. unique(user_id, bundle_id) means a
  //    refund-then-rebuy by the same user updates the same row back to
  //    'active'. Replays of the same webhook also no-op gracefully.
  const purchase = await sb
    .from("bundle_purchases")
    .upsert(
      {
        user_id: buyerUserId,
        bundle_id: bundleId,
        stripe_charge_id: chargeId,
        stripe_session_id: session.id,
        amount_paid_cents: amountPaid,
        currency,
        status: "active",
        purchased_at: new Date().toISOString(),
        refunded_at: null,
      },
      { onConflict: "user_id,bundle_id" },
    )
    .select("id")
    .maybeSingle();
  if (purchase.error) {
    console.error("[bundle] purchase upsert failed", purchase.error.message);
    return;
  }

  // 2) Grant access to every listing in the bundle by inserting an
  //    install row per listing for this user. The desktop app already
  //    knows how to consume connector_installs rows on its next sync —
  //    no extra surface needed.
  const blRes = await sb
    .from("bundle_listings")
    .select("listing_id")
    .eq("bundle_id", bundleId);
  if (blRes.error) {
    console.error("[bundle] failed to load listings", blRes.error.message);
    return;
  }
  const listingIds = (blRes.data ?? []).map((b) => b.listing_id);

  // For each listing, fetch the latest version_id so the install row
  // pins to a specific manifest. Using the same pattern as
  // handleMarketplaceCheckout above for consistency.
  for (const listingId of listingIds) {
    const versionRes = await sb
      .from("connector_versions")
      .select("id")
      .eq("listing_id", listingId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    const versionId = versionRes.data?.id ?? null;
    const upRes = await sb.from("connector_installs").upsert(
      {
        user_id: buyerUserId,
        listing_id: listingId,
        version_id: versionId,
        status: "active",
        // Tag the install with the charge so a future refund can find
        // and revert these specific rows.
        stripe_charge_id: chargeId,
        amount_paid_cents: 0, // bundle cost is on the purchase row, not per-listing
        installed_at: new Date().toISOString(),
      },
      { onConflict: "user_id,listing_id" },
    );
    if (upRes.error) {
      console.error("[bundle] install upsert failed", { listingId, err: upRes.error.message });
    }
  }

  // 3) Bump the purchase counter (best-effort, not atomic — same
  //    pattern as install_count on connector_listings).
  const bundleRow = await sb
    .from("bundles")
    .select("purchase_count")
    .eq("id", bundleId)
    .maybeSingle();
  if (bundleRow.data) {
    await sb
      .from("bundles")
      .update({ purchase_count: (bundleRow.data.purchase_count ?? 0) + 1 })
      .eq("id", bundleId);
  }

  console.log("[bundle] purchase complete", { bundleId, buyerUserId, listings: listingIds.length });
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
