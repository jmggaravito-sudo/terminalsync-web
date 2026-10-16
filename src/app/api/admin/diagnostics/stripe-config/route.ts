import { NextResponse } from "next/server";
import { authenticate, isAdmin } from "@/lib/marketplace/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
const headers = { "Cache-Control": "private, no-store, max-age=0", Vary: "Authorization" };

// Temporary, explicitly authorized operational check. Remove after inspection.
// Exact values are compared as the webhook does; nothing is logged or returned.
export async function GET(req: Request) {
  try {
    // Fail closed outside the authorized production project, including previews.
    // Expiry also disables immutable older deployments after removal.
    if (process.env.VERCEL_ENV !== "production" ||
        process.env.VERCEL_PROJECT_ID !== "prj_eIfBcNc88PvnSGJW8ruLq1EangyG" ||
        Date.now() >= Date.parse("2026-10-16T04:00:00Z")) {
      return NextResponse.json({}, { status: 404, headers });
    }
    const user = await authenticate(req);
    if (!user) return NextResponse.json({}, { status: 401, headers });
    if (!isAdmin(user)) return NextResponse.json({}, { status: 403, headers });
    const live = process.env.STRIPE_WEBHOOK_SECRET;
    const test = process.env.STRIPE_TEST_WEBHOOK_SECRET;
    return NextResponse.json({
      livePresent: Boolean(live),
      testPresent: Boolean(test),
      secretsDistinct: Boolean(live && test && live !== test),
    }, { headers });
  } catch {
    // Do not expose auth/provider errors or operational configuration.
    return NextResponse.json({}, { status: 503, headers });
  }
}
