import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { authenticate, isAdmin } from "@/lib/marketplace/auth";

export const runtime = "nodejs";
export const revalidate = 0;

export async function GET(req: Request, { params }: { params: Promise<{ jobId: string }> }) {
  const user = await authenticate(req);
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = getSupabaseAdmin();
  if (!sb) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

  const { jobId } = await params;
  const { data, error } = await sb
    .from("linkedin_search_jobs")
    .select("id,filters,status,total,done,error,started_at,finished_at")
    .eq("id", jobId)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });

  return NextResponse.json({ job: data });
}
