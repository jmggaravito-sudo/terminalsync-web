// Thin wrapper around Resend so server actions / API routes can send email
// without knowing about the SDK. Guard for missing env so local dev doesn't
// crash when RESEND_API_KEY isn't set — we just log and skip the send.

import { Resend } from "resend";
import { WelcomeEmail } from "../../emails/welcome";
import { TrialEndingEmail } from "../../emails/trial-ending";
import { PaymentFailedEmail } from "../../emails/payment-failed";
import { CancellationConfirmedEmail } from "../../emails/cancellation-confirmed";
import { AccountDeletionRequestedEmail } from "../../emails/account-deletion-requested";
import { MarketplaceListingApprovedEmail } from "../../emails/marketplace-listing-approved";
import { MarketplaceListingRejectedEmail } from "../../emails/marketplace-listing-rejected";
import { MarketplaceNewSubmissionEmail } from "../../emails/marketplace-new-submission";
import { signBillingToken, signUnsubToken } from "./signedTokens";
import { resolveUserLang, type EmailLang } from "./userLang";

const key = process.env.RESEND_API_KEY;
const resend = key ? new Resend(key) : null;

const SUPPORT_FROM = "Juan de TerminalSync <support@terminalsync.ai>";
const BILLING_FROM = "Terminal Sync <billing@terminalsync.ai>";
const MARKETPLACE_FROM = "TerminalSync Marketplace <marketplace@terminalsync.ai>";

// Format a date in the recipient's language (no timezone noise).
function formatDate(d: Date, lang: EmailLang): string {
  return d.toLocaleDateString(lang === "en" ? "en-US" : "es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function unsubUrl(email: string, lang: EmailLang = "es"): string {
  // HMAC-signed so random visitors can't unsub other people by enumerating
  // emails. 90-day expiry mirrors RFC 8058 norms.
  return `https://terminalsync.ai/${lang}/unsubscribe?t=${encodeURIComponent(signUnsubToken(email))}`;
}

function manageBillingUrl(customerId?: string, lang: EmailLang = "es"): string {
  // When the caller has the Stripe customer ID, sign it into the URL so
  // the /<lang>/billing page can skip asking for the email — one-click
  // portal. When it's missing, fall back to the bare page where the user
  // types their email manually.
  if (!customerId) return `https://terminalsync.ai/${lang}/billing`;
  return `https://terminalsync.ai/${lang}/billing?t=${encodeURIComponent(signBillingToken(customerId))}`;
}

export async function sendWelcomeEmail(opts: {
  to: string;
  firstName: string;
  downloadUrl: string;
  unsubscribeUrl: string;
  lang?: EmailLang;
}) {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY missing — skipping welcome send");
    return { skipped: true as const };
  }

  const lang = opts.lang ?? "es";
  const subject =
    lang === "en"
      ? "🛡️ Your Claude Code now has superpowers (and memory)"
      : "🛡️ Tu Claude Code ahora tiene superpoderes (y memoria)";

  const result = await resend.emails.send({
    from: SUPPORT_FROM,
    to: [opts.to],
    subject,
    react: WelcomeEmail({
      firstName: opts.firstName,
      downloadUrl: opts.downloadUrl,
      unsubscribeUrl: opts.unsubscribeUrl,
      lang,
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
   *  one-click; otherwise it falls back to /<lang>/billing. */
  customerId?: string;
  lang?: EmailLang;
}) {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY missing — skipping trial-ending");
    return { skipped: true as const };
  }

  const lang = opts.lang ?? "es";
  const trialEndStr = formatDate(opts.trialEnd, lang);
  const subject =
    lang === "en"
      ? `⏰ Your ${opts.planName} trial ends on ${trialEndStr}`
      : `⏰ Tu prueba ${opts.planName} termina el ${trialEndStr}`;

  const result = await resend.emails.send({
    from: BILLING_FROM,
    to: [opts.to],
    subject,
    react: TrialEndingEmail({
      firstName: opts.firstName,
      planName: opts.planName,
      trialEndDate: trialEndStr,
      manageBillingUrl: manageBillingUrl(opts.customerId, lang),
      unsubscribeUrl: unsubUrl(opts.to, lang),
      lang,
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
  lang?: EmailLang;
}) {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY missing — skipping payment-failed");
    return { skipped: true as const };
  }

  const lang = opts.lang ?? "es";
  const amountFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: opts.currency.toUpperCase(),
  }).format(opts.amountCents / 100);
  const subject =
    lang === "en"
      ? `⚠️ We couldn't charge your ${opts.planName} plan`
      : `⚠️ No pudimos cobrar tu plan ${opts.planName}`;

  const result = await resend.emails.send({
    from: BILLING_FROM,
    to: [opts.to],
    subject,
    react: PaymentFailedEmail({
      firstName: opts.firstName,
      planName: opts.planName,
      amountFormatted,
      updatePaymentUrl: manageBillingUrl(undefined, lang),
      unsubscribeUrl: unsubUrl(opts.to, lang),
      lang,
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
  lang?: EmailLang;
}) {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY missing — skipping cancellation");
    return { skipped: true as const };
  }

  const lang = opts.lang ?? "es";
  const subject =
    lang === "en"
      ? `You canceled your ${opts.planName} plan — all good`
      : `Cancelaste tu plan ${opts.planName} — todo bien`;

  const result = await resend.emails.send({
    from: BILLING_FROM,
    to: [opts.to],
    subject,
    react: CancellationConfirmedEmail({
      firstName: opts.firstName,
      planName: opts.planName,
      manageBillingUrl: manageBillingUrl(undefined, lang),
      reason: opts.reason,
      unsubscribeUrl: unsubUrl(opts.to, lang),
      lang,
    }),
    headers: { "X-Entity-Ref-ID": `cancellation:${opts.subscriptionId}` },
  });

  if (result.error) throw result.error;
  return { id: result.data?.id };
}

/**
 * Sent when the user soft-deletes their account. Confirms the request,
 * explains the 30-day grace window, and includes a sign-in URL so the
 * user can come back and click "Recuperar cuenta" if they changed their
 * mind. The header X-Entity-Ref-ID is keyed by the user id so Resend
 * dedupes accidental double-fires from the API.
 */
export async function sendAccountDeletionRequestedEmail(opts: {
  to: string;
  firstName: string;
  /** ISO-8601 purge date. */
  purgeAtIso: string;
  /** Pre-formatted human-readable date (locale-aware) for body copy. */
  purgeAtHuman: string;
  reason?: string;
  /** Supabase user id — used for idempotency. */
  userId: string;
  lang?: EmailLang;
}) {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY missing — skipping deletion email");
    return { skipped: true as const };
  }

  const lang = opts.lang ?? "es";
  const subject =
    lang === "en"
      ? `Your Terminal Sync account will be deleted on ${opts.purgeAtHuman}`
      : `Tu cuenta de Terminal Sync se elimina el ${opts.purgeAtHuman}`;

  const result = await resend.emails.send({
    from: BILLING_FROM,
    to: [opts.to],
    subject,
    react: AccountDeletionRequestedEmail({
      firstName: opts.firstName,
      purgeAtIso: opts.purgeAtIso,
      purgeAtHuman: opts.purgeAtHuman,
      signInUrl: `https://terminalsync.ai/${lang}/login`,
      reason: opts.reason,
      unsubscribeUrl: unsubUrl(opts.to, lang),
      lang,
    }),
    headers: { "X-Entity-Ref-ID": `account-deletion:${opts.userId}` },
  });

  if (result.error) throw result.error;
  return { id: result.data?.id };
}

// ── Marketplace: listing approved (to publisher) ─────────────────────────

export async function sendListingApprovedEmail(opts: {
  to: string;
  publisherName: string;
  listingName: string;
  listingSlug: string;
  isPaid: boolean;
  listingId: string;
}) {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY missing — skipping listing-approved");
    return { skipped: true as const };
  }
  // Publisher-facing: localize to the publisher's profile language.
  const lang = await resolveUserLang({ email: opts.to });
  const subject =
    lang === "en"
      ? `Your listing "${opts.listingName}" is approved`
      : `Tu listing "${opts.listingName}" está aprobado`;
  const result = await resend.emails.send({
    from: MARKETPLACE_FROM,
    to: [opts.to],
    subject,
    react: MarketplaceListingApprovedEmail({
      publisherName: opts.publisherName,
      listingName: opts.listingName,
      listingSlug: opts.listingSlug,
      isPaid: opts.isPaid,
      unsubscribeUrl: unsubUrl(opts.to, lang),
      lang,
    }),
    headers: { "X-Entity-Ref-ID": `marketplace-approved:${opts.listingId}` },
  });
  if (result.error) throw result.error;
  return { id: result.data?.id };
}

// ── Marketplace: listing rejected (to publisher) ─────────────────────────

export async function sendListingRejectedEmail(opts: {
  to: string;
  publisherName: string;
  listingName: string;
  reviewNotes: string;
  listingId: string;
}) {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY missing — skipping listing-rejected");
    return { skipped: true as const };
  }
  const lang = await resolveUserLang({ email: opts.to });
  const subject =
    lang === "en"
      ? `Your listing "${opts.listingName}" needs a few tweaks`
      : `Tu listing "${opts.listingName}" necesita ajustes`;
  const result = await resend.emails.send({
    from: MARKETPLACE_FROM,
    to: [opts.to],
    subject,
    react: MarketplaceListingRejectedEmail({
      publisherName: opts.publisherName,
      listingName: opts.listingName,
      reviewNotes: opts.reviewNotes,
      unsubscribeUrl: unsubUrl(opts.to, lang),
      lang,
    }),
    headers: { "X-Entity-Ref-ID": `marketplace-rejected:${opts.listingId}` },
  });
  if (result.error) throw result.error;
  return { id: result.data?.id };
}

// ── Marketplace: new submission alert (to admins) ────────────────────────

export async function sendNewSubmissionAdminAlert(opts: {
  to: string[];
  listingName: string;
  listingSlug: string;
  category: string;
  pricing: string;
  publisherName: string;
  publisherEmail: string;
  listingId: string;
}) {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY missing — skipping admin alert");
    return { skipped: true as const };
  }
  if (opts.to.length === 0) {
    console.warn("[email] ADMIN_EMAILS empty — skipping admin alert");
    return { skipped: true as const };
  }
  const result = await resend.emails.send({
    from: MARKETPLACE_FROM,
    to: opts.to,
    subject: `Nueva submission marketplace: ${opts.listingName}`,
    react: MarketplaceNewSubmissionEmail({
      listingName: opts.listingName,
      listingSlug: opts.listingSlug,
      category: opts.category,
      pricing: opts.pricing,
      publisherName: opts.publisherName,
      publisherEmail: opts.publisherEmail,
      unsubscribeUrl: unsubUrl(opts.to[0]),
    }),
    headers: { "X-Entity-Ref-ID": `marketplace-submission:${opts.listingId}` },
  });
  if (result.error) throw result.error;
  return { id: result.data?.id };
}
