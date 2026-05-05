import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

// Windows / Linux early-access waitlist endpoint.
//
// POST { email, platform, locale?, source? } → 200 { ok: true }
//   - Upserts (email, platform) into public.early_access.
//   - DB-only by design — JM blasts the list manually via Resend
//     Audiences when the signed installer ships. NO automated email
//     from this endpoint per product policy.
//   - Pulls ip_country from the Vercel edge header so JM can segment
//     the launch email by region without storing IPs.

const ALLOWED_PLATFORMS = ["windows", "linux", "other"] as const;
type Platform = (typeof ALLOWED_PLATFORMS)[number];

function isPlatform(v: unknown): v is Platform {
  return typeof v === "string" && (ALLOWED_PLATFORMS as readonly string[]).includes(v);
}

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const data = body as Record<string, unknown>;
  const email = typeof data.email === "string" ? data.email.trim().toLowerCase() : "";
  const platform = isPlatform(data.platform) ? data.platform : null;
  const locale = typeof data.locale === "string" ? data.locale.slice(0, 8) : null;
  const source = typeof data.source === "string" ? data.source.slice(0, 200) : null;

  if (!EMAIL_RX.test(email)) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }
  if (!platform) {
    return NextResponse.json({ ok: false, error: "invalid_platform" }, { status: 400 });
  }

  const h = await headers();
  const ipCountry = h.get("x-vercel-ip-country") ?? null;

  const supa = getSupabaseAdmin();
  if (!supa) {
    // Dev sandbox without Supabase creds — still respond OK so the form
    // UX is testable locally. Log so a misconfigured prod deploy is loud
    // in Vercel logs.
    console.warn(
      "[early-access] Supabase not configured — skipping insert",
      { email, platform },
    );
  } else {
    const { error } = await supa
      .from("early_access")
      .upsert(
        {
          email,
          platform,
          locale,
          ip_country: ipCountry,
          source,
        },
        { onConflict: "email,platform", ignoreDuplicates: false },
      );
    if (error) {
      console.error("[early-access] insert failed", { error, email, platform });
      return NextResponse.json({ ok: false, error: "store_failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
