import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { authenticate, isAdmin } from "@/lib/marketplace/auth";
import { isReviewStatus, REVIEW_STATUSES, type ReviewStatus } from "@/lib/outreach/types";

export const runtime = "nodejs";
export const revalidate = 0;

type ReviewPayload = {
  id: number | string;
  status: ReviewStatus;
  review_notes?: string | null;
};

export async function POST(req: Request) {
  const user = await authenticate(req);
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = getSupabaseAdmin();
  if (!sb) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

  let body: ReviewPayload;
  try {
    body = (await req.json()) as ReviewPayload;
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  if (body.id === undefined || body.id === null || body.id === "") {
    return NextResponse.json({ error: "missing id" }, { status: 400 });
  }
  if (!isReviewStatus(body.status)) {
    return NextResponse.json(
      { error: `invalid status, expected one of ${REVIEW_STATUSES.join(", ")}` },
      { status: 400 },
    );
  }

  const nowIso = new Date().toISOString();
  const patch: Record<string, unknown> = {
    status: body.status,
    reviewed_at: body.status === "pending" ? null : nowIso,
  };
  if (body.review_notes !== undefined) patch.review_notes = body.review_notes;

  const { data, error } = await sb
    .from("agency_influencers")
    .update(patch)
    .eq("id", body.id)
    .select("id,status,review_notes,reviewed_at,op_status,name,handle,platform,profile_url")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, lead: data });
}
