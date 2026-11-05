import { NextResponse } from "next/server";
import { Resend } from "resend";
import {
  emailFromLicenseToken,
  LICENSE_VERSION,
} from "@/lib/voiceStudioLicense";
import { markLeadLicensed } from "@/lib/voiceStudioCrm";

export const runtime = "nodejs";

interface Body {
  token: string;
  /** Channel URL the license covers, re-typed by the signer. */
  channel: string;
}

// Electronic acceptance of the Voice Studio voice license. Verifies the
// HMAC token, records the acceptance (identity/time/IP/UA/version) via a
// Resend email to hola@ (durable record), and best-effort updates the CRM
// (lead → Calificado + comment). This acceptance is the hard gate before
// any voice clone is produced — no signed record, no sample.
export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = emailFromLicenseToken(body.token);
  if (!email) {
    return NextResponse.json(
      { error: "Invalid or expired license link." },
      { status: 400 },
    );
  }
  const channel = body.channel?.trim().slice(0, 200);
  if (!channel) {
    return NextResponse.json(
      { error: "Channel URL is required." },
      { status: 400 },
    );
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  const ua = req.headers.get("user-agent") ?? "unknown";
  const acceptedAt = new Date().toISOString();

  const crmResult = await markLeadLicensed(email, LICENSE_VERSION);
  console.log("[voice-studio-license] accepted", {
    email,
    channel,
    licenseVersion: LICENSE_VERSION,
    acceptedAt,
    ip,
    crm: crmResult,
  });

  const key = process.env.RESEND_API_KEY;
  if (key) {
    const resend = new Resend(key);
    try {
      await resend.emails.send({
        from: "Voice Studio <hola@terminalsync.ai>",
        to: "hola@terminalsync.ai",
        replyTo: email,
        subject: `✍️ Voice license accepted — ${email}`,
        text: [
          `SIGNED VOICE LICENSE — RECORD OF ACCEPTANCE`,
          ``,
          `License version: ${LICENSE_VERSION}`,
          `Licensed email: ${email}`,
          `Channel: ${channel}`,
          `Accepted at (UTC): ${acceptedAt}`,
          `IP: ${ip}`,
          `User-Agent: ${ua}`,
          `CRM: ${crmResult}`,
          ``,
          `Gate satisfied: the 60-second sample with this creator's cloned voice may now be produced.`,
        ].join("\n"),
      });
    } catch (err) {
      console.error("[voice-studio-license] record email failed", err);
    }
  }

  return NextResponse.json({ ok: true });
}
