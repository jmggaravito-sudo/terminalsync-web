import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

/** POST /api/business-leads/ingest
 *
 *  Server-to-server endpoint for the n8n "TS - Business Leads (Google Maps)"
 *  workflow. Auth via X-API-Key matched against BUSINESS_LEADS_INGEST_KEY.
 *
 *  Body: { items: [{...}] } — each row maps to a business_leads row.
 *  Upserts on (source, place_id) so re-running the same search is safe.
 */

const ALLOWED_SOURCES = new Set(["google_maps", "manual"]);

function toStr(v: unknown, max: number): string | null {
  return typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null;
}

function toNum(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

/** Best-effort E.164 normalization so the dashboard's wa.me link works
 *  without a human re-typing the number. Keeps the leading '+' if present,
 *  otherwise assumes the digits are already country-coded (Apify's Google
 *  Maps scraper returns internationally formatted numbers). */
function toPhoneE164(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const digits = v.replace(/[^0-9+]/g, "");
  if (digits.replace(/[^0-9]/g, "").length < 7) return null;
  return digits.startsWith("+") ? digits : `+${digits.replace(/^0+/, "")}`;
}

export async function POST(req: Request) {
  const provided = req.headers.get("x-api-key");
  const expected = process.env.BUSINESS_LEADS_INGEST_KEY;
  if (!expected || !provided || provided !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = getSupabaseAdmin();
  if (!sb) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

  let body: { items?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!Array.isArray(body.items)) return NextResponse.json({ error: "items must be array" }, { status: 400 });

  const rows: Record<string, unknown>[] = [];
  for (const raw of body.items as Record<string, unknown>[]) {
    if (!raw || typeof raw !== "object") continue;
    const name = toStr(raw.name, 200);
    if (!name) continue; // a lead with no business name is useless

    const source = typeof raw.source === "string" && ALLOWED_SOURCES.has(raw.source) ? raw.source : "google_maps";

    rows.push({
      source,
      source_keyword: toStr(raw.source_keyword, 120),
      niche: toStr(raw.niche, 60),
      city: toStr(raw.city, 100),
      country: toStr(raw.country, 100),
      place_id: toStr(raw.place_id, 200),
      name,
      category: toStr(raw.category, 120),
      address: toStr(raw.address, 300),
      phone: toStr(raw.phone, 60),
      phone_e164: toPhoneE164(raw.phone_e164 ?? raw.phone),
      website_url: toStr(raw.website_url, 500),
      google_maps_url: toStr(raw.google_maps_url, 500),
      rating: toNum(raw.rating),
      reviews_count: toNum(raw.reviews_count),
      email: toStr(raw.email, 200)?.toLowerCase() ?? null,
    });
  }

  if (rows.length === 0) return NextResponse.json({ inserted: 0, skipped: 0, total: 0 });

  // Rows without a place_id (manual entries) can't dedupe on the unique
  // constraint — insert those separately so they don't collide with each
  // other under a shared NULL key.
  const withPlaceId = rows.filter((r) => r.place_id);
  const withoutPlaceId = rows.filter((r) => !r.place_id);

  const results = await Promise.all([
    withPlaceId.length
      ? sb.from("business_leads").upsert(withPlaceId, { onConflict: "source,place_id", ignoreDuplicates: true }).select("id")
      : Promise.resolve({ data: [], error: null }),
    withoutPlaceId.length
      ? sb.from("business_leads").insert(withoutPlaceId).select("id")
      : Promise.resolve({ data: [], error: null }),
  ]);

  const error = results.find((r) => r.error)?.error;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const inserted = results.reduce((acc, r) => acc + (r.data?.length ?? 0), 0);
  return NextResponse.json({ inserted, skipped: rows.length - inserted, total: rows.length });
}
