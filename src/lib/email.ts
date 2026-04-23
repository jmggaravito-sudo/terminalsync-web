// Thin wrapper around Resend so server actions / API routes can send email
// without knowing about the SDK. Guard for missing env so local dev doesn't
// crash when RESEND_API_KEY isn't set — we just log and skip the send.

import { Resend } from "resend";
import { WelcomeEmail } from "../../emails/welcome";

const key = process.env.RESEND_API_KEY;
const resend = key ? new Resend(key) : null;

const SUPPORT_FROM = "Juan de TerminalSync <support@terminalsync.ai>";

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
