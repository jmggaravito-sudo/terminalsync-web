import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { authenticate, isAdmin } from "@/lib/marketplace/auth";
import { isLinkedinLeadStatus, LINKEDIN_LEAD_STATUSES, type LinkedinLeadStatus } from "@/lib/linkedinLeads/types";

export const runtime = "nodejs";
export const revalidate = 0;

const SELECT_COLS = [
  "id",
  "job_id",
  "keyword",
  "target_titles",
  "country",
  "state",
  "city",
  "full_name",
  "headline",
  "company",
  "location",
  "profile_url",
  "photo_url",
  "recent_posts",
  "analysis_summary",
  "drafted_message",
  "status",
  "notes",
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
  const rawLimit = Number(url.searchParams.get("limit") ?? "100");
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(Math.trunc(rawLimit), 1), 200) : 100;
  if (!isLinkedinLeadStatus(status)) {
    return NextResponse.json(
      { error: `invalid status, expected one of ${LINKEDIN_LEAD_STATUSES.join(", ")}` },
      { status: 400 },
    );
  }

  const [itemsRes, ...countsRes] = await Promise.all([
    sb
      .from("linkedin_leads")
      .select(SELECT_COLS)
      .eq("status", status)
      .order("discovered_at", { ascending: false })
      .limit(limit),
    ...LINKEDIN_LEAD_STATUSES.map((s) => sb.from("linkedin_leads").select("id", { count: "exact", head: true }).eq("status", s)),
  ]);

  if (itemsRes.error) return NextResponse.json({ error: itemsRes.error.message }, { status: 500 });

  const counts: Record<LinkedinLeadStatus, number> = {
    nuevo: 0,
    contactado: 0,
    respondio: 0,
    reunion_agendada: 0,
  };
  LINKEDIN_LEAD_STATUSES.forEach((s, i) => {
    counts[s] = countsRes[i]?.count ?? 0;
  });

  return NextResponse.json({ items: itemsRes.data ?? [], counts });
}
