import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

interface Body {
  /** Email of the visitor signing up. */
  email: string;
  /** Slug of the feature they're requesting early access for —
   *  e.g. "memory", "pair-programming", "linux-windows". */
  feature: string;
  /** Optional locale so we can reply in the right language. */
  lang?: "es" | "en";
}

// Public endpoint: anyone can hit this to signal interest in an
// upcoming feature. We don't gate behind auth because the whole point
// is to capture leads BEFORE signup. Stripe + Supabase aren't involved.
//
// Each submission fires an internal email to hola@terminalsync.ai so
// JM can triage manually until volume justifies a real waitlist table.
//
// Rate limiting is per-IP via Vercel's edge throttle in front of the
// route — not implemented in code, just trust Vercel's defaults until
// we see abuse.
export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const feature = body.feature?.trim();
  const lang = body.lang === "en" ? "en" : "es";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: lang === "es" ? "Email inválido" : "Invalid email" },
      { status: 400 },
    );
  }
  if (!feature || feature.length > 64 || !/^[a-z][a-z0-9-]*$/.test(feature)) {
    return NextResponse.json({ error: "Invalid feature slug" }, { status: 400 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  const country = req.headers.get("x-vercel-ip-country") ?? "unknown";
  const ua = req.headers.get("user-agent") ?? "unknown";

  const key = process.env.RESEND_API_KEY;
  if (key) {
    const resend = new Resend(key);
    try {
      await resend.emails.send({
        from: "TerminalSync <hola@terminalsync.ai>",
        to: "hola@terminalsync.ai",
        replyTo: email,
        subject: `🔔 Early access signup: ${feature}`,
        text: [
          `Feature: ${feature}`,
          `Email: ${email}`,
          `Lang: ${lang}`,
          `IP: ${ip}`,
          `Country: ${country}`,
          `User-Agent: ${ua}`,
          "",
          `Reply directly to this email to reach the visitor.`,
        ].join("\n"),
      });
    } catch (err) {
      // Don't fail the request just because the notification email
      // didn't go out — capture intent regardless.
      console.error("[early-access] email send failed", err);
    }
  } else {
    // Local dev / preview without RESEND_API_KEY — log to console so
    // we can still verify the flow works.
    console.log("[early-access] signup", { email, feature, ip, country });
  }

  return NextResponse.json({ ok: true });
}
