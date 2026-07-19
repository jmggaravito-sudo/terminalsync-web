import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Returns the visitor's country (ISO-3166 alpha-2) so client components can
 * geo-gate UI without shipping a geo library. On Vercel this comes from the
 * edge-populated `x-vercel-ip-country` request header; off-Vercel (local dev,
 * other hosts) it's absent and we return null — callers must treat null as
 * "unknown" and default to their safe branch (e.g. hide a country-specific
 * payment button rather than show it everywhere).
 */
export function GET(req: Request) {
  const country =
    req.headers.get("x-vercel-ip-country") ??
    req.headers.get("x-country") ??
    null;
  return NextResponse.json(
    { country: country ? country.toUpperCase() : null },
    { headers: { "Cache-Control": "no-store" } },
  );
}
