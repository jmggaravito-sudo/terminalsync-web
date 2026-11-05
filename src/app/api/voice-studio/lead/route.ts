import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

interface Body {
  name: string;
  email: string;
  /** YouTube channel URL or @handle the lead wants dubbed. */
  channel: string;
  /** Rough subscriber band — self-reported, from the signup form. */
  subscribers?: string;
  /** Self-reported niche: business | finance | fitness | other. */
  niche?: string;
  /** Optional brand/personal names the clone must pronounce carefully. */
  names?: string;
}

const MAX_BANDS = new Set([
  "under-10k",
  "10k-50k",
  "50k-100k",
  "100k-250k",
  "250k-plus",
]);
const NICHES = new Set(["business", "finance", "fitness", "other"]);

// Public lead-capture endpoint for the Voice Studio landing
// (/voice-studio). Mirrors the early-access route: no auth, no Supabase,
// just a Resend notification to hola@terminalsync.ai with reply-to set so
// JM can triage manually until volume justifies a leads table.
export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = body.name?.trim().slice(0, 120);
  const email = body.email?.trim().toLowerCase();
  const channel = body.channel?.trim().slice(0, 200);
  const subscribers =
    body.subscribers && MAX_BANDS.has(body.subscribers)
      ? body.subscribers
      : "unknown";
  const niche =
    body.niche && NICHES.has(body.niche) ? body.niche : "unknown";
  const names = body.names?.trim().slice(0, 300) || "—";

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  if (!channel) {
    return NextResponse.json(
      { error: "YouTube channel URL is required" },
      { status: 400 },
    );
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
        from: "Voice Studio <hola@terminalsync.ai>",
        to: "hola@terminalsync.ai",
        replyTo: email,
        subject: `🎬 Voice Studio sample request — ${name} (${subscribers}, ${niche})`,
        text: [
          `Name: ${name}`,
          `Email: ${email}`,
          `Channel: ${channel}`,
          `Subscribers: ${subscribers}`,
          `Niche: ${niche}`,
          `Names to pronounce: ${names}`,
          `IP: ${ip}`,
          `Country: ${country}`,
          `User-Agent: ${ua}`,
          "",
          `Next step: email the voice license (one-pager, digital signature).`,
          `Pricing funnel: free 60s sample → $300 setup → $99 trial video → $129/video or packs (4=$399, 8=$699).`,
        ].join("\n"),
      });
    } catch (err) {
      // Don't fail the request just because the notification email
      // didn't go out — capture intent regardless.
      console.error("[voice-studio-lead] email send failed", err);
    }
  } else {
    // Local dev / preview without RESEND_API_KEY — log to console so
    // we can still verify the flow works.
    console.log("[voice-studio-lead] lead", {
      name,
      email,
      channel,
      subscribers,
      niche,
      names,
      ip,
      country,
    });
  }

  return NextResponse.json({ ok: true });
}
