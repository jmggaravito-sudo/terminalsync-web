// Thin wrapper around Resend so server actions / API routes can send email
// without knowing about the SDK. Guard for missing env so local dev doesn't
// crash when RESEND_API_KEY isn't set — we just log and skip the send.

import { Resend } from "resend";
import { WelcomeEmail } from "../../emails/welcome";
import { TrialEndingEmail } from "../../emails/trial-ending";
import { PaymentFailedEmail } from "../../emails/payment-failed";
import { CancellationConfirmedEmail } from "../../emails/cancellation-confirmed";
import { signBillingToken, signUnsubToken } from "./signedTokens";

const key = process.env.RESEND_API_KEY;
const resend = key ? new Resend(key) : null;

const SUPPORT_FROM = "Juan de TerminalSync <support@terminalsync.ai>";
const BILLING_FROM = "Terminal Sync <billing@terminalsync.ai>";

function unsubUrl(email: string): string {
  // HMAC-signed so random visitors can't unsub other people by enumerating
  // emails. 90-day expiry mirrors RFC 8058 norms.
  return `https://terminalsync.ai/es/unsubscribe?t=${encodeURIComponent(signUnsubToken(email))}`;
}

function manageBillingUrl(customerId?: string): string {
  // When the caller has the Stripe customer ID, sign it into the URL so
  // the /es/billing page can skip asking for the email — one-click portal.
  // When it's missing, fall back to the bare page where the user types
  // their email manually.
  if (!customerId) return "https://terminalsync.ai/es/billing";
  return `https://terminalsync.ai/es/billing?t=${encodeURIComponent(signBillingToken(customerId))}`;
}

export async function sendWelcomeEmail(opts: {
  to: string;
  firstName: string;
  downloadUrl: string;
  unsubscribeUrl: string;
}) {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY missing — skipping welcome send");
    return { skipped: true as const };
  }

  const result = await resend.emails.send({
    from: SUPPORT_FROM,
    to: [opts.to],
    subject: "🛡️ Tu Claude Code ahora tiene superpoderes (y memoria)",
    react: WelcomeEmail({
      firstName: opts.firstName,
      downloadUrl: opts.downloadUrl,
      unsubscribeUrl: opts.unsubscribeUrl,
    }),
    // Idempotency so retried webhooks don't double-send.
    headers: { "X-Entity-Ref-ID": `welcome:${opts.to}` },
  });

  if (result.error) throw result.error;
  return { id: result.data?.id };
}

// ── Trial ending (3 days before conversion) ──────────────────────────────

export async function sendTrialEndingEmail(opts: {
  to: string;
  firstName: string;
  planName: string;
  trialEnd: Date;
  /** Subscription ID for idempotency — Stripe can re-fire trial_will_end. */
  subscriptionId: string;
  /** Stripe customer ID — when present, the billing link is signed and
   *  one-click; otherwise it falls back to /es/billing. */
  customerId?: string;
}) {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY missing — skipping trial-ending");
    return { skipped: true as const };
  }

  // Format date in Spanish without timezone noise.
  const trialEndStr = opts.trialEnd.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const result = await resend.emails.send({
    from: BILLING_FROM,
    to: [opts.to],
    subject: `⏰ Tu prueba ${opts.planName} termina el ${trialEndStr}`,
    react: TrialEndingEmail({
      firstName: opts.firstName,
      planName: opts.planName,
      trialEndDate: trialEndStr,
      manageBillingUrl: manageBillingUrl(),
      unsubscribeUrl: unsubUrl(opts.to),
    }),
    // Stripe fires trial_will_end exactly once at ~3-day mark, but in
    // practice retries can dupe — key on subscriptionId so we never
    // send two reminders for the same trial.
    headers: { "X-Entity-Ref-ID": `trial-ending:${opts.subscriptionId}` },
  });

  if (result.error) throw result.error;
  return { id: result.data?.id };
}

// ── Payment failed (Stripe retried and the card was declined) ────────────

export async function sendPaymentFailedEmail(opts: {
  to: string;
  firstName: string;
  planName: string;
  /** Amount in cents, as Stripe returns it. */
  amountCents: number;
  /** Currency lowercase code, e.g. "usd". */
  currency: string;
  /** Stripe invoice ID for idempotency (one email per failed invoice). */
  invoiceId: string;
}) {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY missing — skipping payment-failed");
    return { skipped: true as const };
  }

  const amountFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: opts.currency.toUpperCase(),
  }).format(opts.amountCents / 100);

  const result = await resend.emails.send({
    from: BILLING_FROM,
    to: [opts.to],
    subject: `⚠️ No pudimos cobrar tu plan ${opts.planName}`,
    react: PaymentFailedEmail({
      firstName: opts.firstName,
      planName: opts.planName,
      amountFormatted,
      updatePaymentUrl: manageBillingUrl(),
      unsubscribeUrl: unsubUrl(opts.to),
    }),
    headers: { "X-Entity-Ref-ID": `payment-failed:${opts.invoiceId}` },
  });

  if (result.error) throw result.error;
  return { id: result.data?.id };
}

// ── Cancellation confirmed (subscription.deleted) ────────────────────────

export async function sendCancellationEmail(opts: {
  to: string;
  firstName: string;
  planName: string;
  /** Optional reason captured from Stripe / cancellation flow. */
  reason?: string;
  /** Subscription ID for idempotency. */
  subscriptionId: string;
}) {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY missing — skipping cancellation");
    return { skipped: true as const };
  }

  const result = await resend.emails.send({
    from: BILLING_FROM,
    to: [opts.to],
    subject: `Cancelaste tu plan ${opts.planName} — todo bien`,
    react: CancellationConfirmedEmail({
      firstName: opts.firstName,
      planName: opts.planName,
      manageBillingUrl: manageBillingUrl(),
      reason: opts.reason,
      unsubscribeUrl: unsubUrl(opts.to),
    }),
    headers: { "X-Entity-Ref-ID": `cancellation:${opts.subscriptionId}` },
  });

  if (result.error) throw result.error;
  return { id: result.data?.id };
}
