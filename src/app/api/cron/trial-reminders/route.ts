import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { sendTrialChargingTomorrowEmail } from "@/lib/email";

export const runtime = "nodejs";
// Vercel Cron triggers a GET to this route on schedule (see vercel.json).
// 14:00 UTC = 9-11 AM in the Americas — sweet spot for Spanish-speaking
// users to actually open the email and act before midnight conversion.

/** Vercel sets `Authorization: Bearer ${CRON_SECRET}` on cron-triggered
 *  invocations. We reject anything else so a public URL can't spam the
 *  endpoint and our own subscriptions table. */
function isAuthorized(req: Request): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    // No secret configured = local/dev environment. Allow so it's testable.
    return true;
  }
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${expected}`;
}

/** Friendly plan label from Stripe metadata, mirroring the webhook helper. */
function planLabel(metadata: Stripe.Metadata | null | undefined): string {
  const plan = metadata?.plan;
  const cycle = metadata?.cycle;
  if (!plan) return "Terminal Sync";
  const proper = plan.charAt(0).toUpperCase() + plan.slice(1);
  if (cycle === "yearly") return `${proper} anual`;
  if (cycle === "monthly") return `${proper} mensual`;
  return proper;
}

interface SubRow {
  user_id: string;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  trial_end: string;
  plan: string;
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 503 },
    );
  }
  const sb = getSupabaseAdmin();
  if (!sb) {
    return NextResponse.json(
      { error: "Supabase admin not configured" },
      { status: 503 },
    );
  }

  // Window: trials ending in the next 24-30 hours. We look 30h ahead so
  // a once-daily cron at 14:00 UTC reliably catches every trial regardless
  // of the exact moment Stripe finalizes it (some land at 14:01, some at
  // 13:59 — the 6h slack covers both). Idempotency on subscriptionId in
  // sendTrialChargingTomorrowEmail prevents double-sends if the window
  // overlaps two cron runs.
  const now = new Date();
  const windowStart = new Date(now.getTime() + 18 * 3600 * 1000); // +18h
  const windowEnd = new Date(now.getTime() + 30 * 3600 * 1000); // +30h

  const { data, error } = await sb
    .from("subscriptions")
    .select(
      "user_id, stripe_subscription_id, stripe_customer_id, trial_end, plan",
    )
    .eq("status", "trialing")
    .gte("trial_end", windowStart.toISOString())
    .lt("trial_end", windowEnd.toISOString());

  if (error) {
    console.error("[cron/trial-reminders] supabase query failed", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []) as SubRow[];
  let sent = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const row of rows) {
    if (!row.stripe_subscription_id || !row.stripe_customer_id) {
      skipped += 1;
      continue;
    }
    try {
      const sub = await stripe.subscriptions.retrieve(
        row.stripe_subscription_id,
      );
      // Skip if sub no longer trialing (status changed between query and now).
      if (sub.status !== "trialing") {
        skipped += 1;
        continue;
      }
      // Get the upcoming invoice to know the exact amount that will be
      // charged. Falls back to the subscription item price if upcoming
      // is unavailable for any reason (rare).
      let amountCents = 0;
      let currency = "usd";
      try {
        const upcoming = await (
          stripe.invoices as unknown as {
            retrieveUpcoming: (params: {
              subscription: string;
            }) => Promise<Stripe.Invoice>;
          }
        ).retrieveUpcoming({ subscription: sub.id });
        amountCents = upcoming.amount_due ?? 0;
        currency = upcoming.currency ?? "usd";
      } catch {
        const item = sub.items.data[0]?.price;
        amountCents = item?.unit_amount ?? 0;
        currency = item?.currency ?? "usd";
      }

      const customer = await stripe.customers.retrieve(row.stripe_customer_id);
      if (customer.deleted) {
        skipped += 1;
        continue;
      }
      const email = customer.email ?? null;
      if (!email) {
        skipped += 1;
        continue;
      }
      const firstName = (customer.name ?? "").split(" ")[0] || "hola";

      await sendTrialChargingTomorrowEmail({
        to: email,
        firstName,
        planName: planLabel(sub.metadata),
        trialEnd: new Date(row.trial_end),
        amountCents,
        currency,
        subscriptionId: sub.id,
        customerId: row.stripe_customer_id,
      });
      sent += 1;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "unknown";
      console.error("[cron/trial-reminders] send failed", {
        sub: row.stripe_subscription_id,
        err: msg,
      });
      errors.push(`${row.stripe_subscription_id}: ${msg}`);
    }
  }

  console.log("[cron/trial-reminders] done", {
    candidates: rows.length,
    sent,
    skipped,
    errors: errors.length,
  });

  return NextResponse.json({
    candidates: rows.length,
    sent,
    skipped,
    errors,
  });
}
