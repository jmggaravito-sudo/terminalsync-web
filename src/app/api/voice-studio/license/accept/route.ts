import { NextResponse } from "next/server";
import { Resend } from "resend";
import {
  emailFromLicenseToken,
  LICENSE_VERSION,
} from "@/lib/voiceStudioLicense";
import { recordVoiceLicense } from "@/lib/voiceStudioConsent";
import { markLeadLicensed } from "@/lib/voiceStudioCrm";

export const runtime = "nodejs";

interface Body {
  token: string;
  /** Channel URL the license covers, re-typed by the signer. */
  channel: string;
}

// Electronic acceptance of the Voice Studio voice license. Verifies the
// HMAC token and durably records acceptance before returning success.
// CRM and email remain supplementary notifications, not consent checks.
export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
    if (!body || typeof body !== "object") throw new Error("Invalid body");
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = (typeof body.token === "string" ? emailFromLicenseToken(body.token) : null)?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json(
      { error: "Invalid or expired license link." },
      { status: 400 },
    );
  }
  const channel = typeof body.channel === "string" ? body.channel.trim().slice(0, 200) : "";
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

  try {
    const outcome = await recordVoiceLicense({
      email, channel, accepted_at: acceptedAt, ip: ip.slice(0, 64), user_agent: ua.slice(0, 512),
    });
    if (outcome === "revoked") {
      return NextResponse.json({ error: "This license was revoked. Contact Voice Studio for help." }, { status: 409 });
    }
    if (outcome === "already_signed") return NextResponse.json({ ok: true, alreadySigned: true });
  } catch {
    return NextResponse.json({ error: "Could not record the license. Please try again." }, { status: 503 });
  }

  const crmResult = await markLeadLicensed(email, LICENSE_VERSION);

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
