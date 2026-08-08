import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { authenticate, isAdmin } from "@/lib/marketplace/auth";
import { isBusinessLeadStatus, BUSINESS_LEAD_STATUSES, type BusinessLeadStatus } from "@/lib/businessLeads/types";

export const runtime = "nodejs";
export const revalidate = 0;

const SELECT_COLS = [
  "id",
  "source",
  "source_keyword",
  "niche",
  "city",
  "country",
  "place_id",
  "name",
  "category",
  "address",
  "phone",
  "phone_e164",
  "website_url",
  "google_maps_url",
  "rating",
  "reviews_count",
  "email",
  "status",
  "notes",
  "contacted_at",
  "discovered_at",
  "updated_at",
].join(",");

export async function GET(req: Request) {
  const user = await authenticate(req);
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = getSupabaseAdmin();
  if (!sb) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

  const url = new URL(req.url);
  const status = url.searchParams.get("status") ?? "nuevo";
  const niche = url.searchParams.get("niche");
  const rawLimit = Number(url.searchParams.get("limit") ?? "50");
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(Math.trunc(rawLimit), 1), 100) : 50;
  if (!isBusinessLeadStatus(status)) {
    return NextResponse.json(
      { error: `invalid status, expected one of ${BUSINESS_LEAD_STATUSES.join(", ")}` },
      { status: 400 },
    );
  }

  let itemsQuery = sb
    .from("business_leads")
    .select(SELECT_COLS)
    .eq("status", status)
    .order("discovered_at", { ascending: false })
    .limit(limit);
  if (niche) itemsQuery = itemsQuery.eq("niche", niche);

  const [itemsRes, ...countsRes] = await Promise.all([
    itemsQuery,
    ...BUSINESS_LEAD_STATUSES.map((s) => sb.from("business_leads").select("id", { count: "exact", head: true }).eq("status", s)),
  ]);

  if (itemsRes.error) return NextResponse.json({ error: itemsRes.error.message }, { status: 500 });

  const counts: Record<BusinessLeadStatus, number> = {
    nuevo: 0,
    contactado: 0,
    agendado: 0,
    cliente: 0,
    descartado: 0,
  };
  BUSINESS_LEAD_STATUSES.forEach((s, i) => {
    counts[s] = countsRes[i]?.count ?? 0;
  });

  return NextResponse.json({ items: itemsRes.data ?? [], counts });
}
