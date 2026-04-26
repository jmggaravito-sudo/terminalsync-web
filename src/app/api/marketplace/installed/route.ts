import { NextResponse } from "next/server";
import { authenticate } from "@/lib/marketplace/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

// CORS for the Tauri desktop app — same allow-list as /api/checkout.
function corsHeaders(origin: string | null): Record<string, string> {
  const allowed =
    origin &&
    (origin.startsWith("tauri://") ||
      origin === "https://terminalsync.ai" ||
      origin === "https://www.terminalsync.ai" ||
      origin.startsWith("http://localhost") ||
      origin.startsWith("http://127.0.0.1"));
  return {
    "Access-Control-Allow-Origin": allowed ? origin : "https://terminalsync.ai",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    Vary: "Origin",
  };
}

export async function OPTIONS(req: Request) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req.headers.get("origin")) });
}

/** GET /api/marketplace/installed?since=<iso>
 *
 *  Tauri-facing endpoint. Returns the authenticated user's active connector
 *  installs, each with the latest manifest_json + checksum so the desktop
 *  client can merge them into claude_desktop_config.json without a second
 *  round-trip. Pass ?since=<iso> to get a delta.
 *
 *  NOTE: this endpoint is the contract with the desktop app. The terminal
 *  redesign in flight should treat this shape as the source of truth — the
 *  marketplace install merge logic lives in the Tauri client, not here. */
export async function GET(req: Request) {
  const cors = corsHeaders(req.headers.get("origin"));
  const user = await authenticate(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: cors });

  const sb = getSupabaseAdmin();
  if (!sb) return NextResponse.json({ error: "Supabase not configured" }, { status: 503, headers: cors });

  const url = new URL(req.url);
  const since = url.searchParams.get("since");

  let q = sb
    .from("connector_installs")
    .select(`
      id,
      installed_at,
      status,
      listing:connector_listings (
        id, slug, name, tagline
      ),
      version:connector_versions (
        id, version, manifest_json, checksum
      )
    `)
    .eq("user_id", user.id)
    .eq("status", "active");
  if (since) q = q.gte("installed_at", since);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: cors });

  const installs = (data ?? []).map((row) => {
    const listing = Array.isArray(row.listing) ? row.listing[0] : row.listing;
    const version = Array.isArray(row.version) ? row.version[0] : row.version;
    return {
      installId: row.id,
      installedAt: row.installed_at,
      slug: listing?.slug,
      name: listing?.name,
      tagline: listing?.tagline,
      version: version?.version,
      checksum: version?.checksum,
      manifest: version?.manifest_json,
    };
  });

  return NextResponse.json({ installs }, { headers: cors });
}
