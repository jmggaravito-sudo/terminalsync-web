import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { authenticate, isAdmin } from "@/lib/marketplace/auth";
import { generateLeadDraft } from "@/lib/linkedinLeads/messageGenerator";
import type { LinkedinSettings } from "@/lib/linkedinLeads/types";

export const runtime = "nodejs";
export const revalidate = 0;
export const maxDuration = 60;

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await authenticate(req);
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = getSupabaseAdmin();
  if (!sb) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

  const { id } = await params;

  const { data: lead, error: leadErr } = await sb
    .from("linkedin_leads")
    .select("id,full_name,headline,company,location,recent_posts")
    .eq("id", id)
    .single();
  if (leadErr || !lead) return NextResponse.json({ error: leadErr?.message ?? "lead not found" }, { status: 404 });

  const { data: settingsRow, error: settingsErr } = await sb
    .from("linkedin_settings")
    .select("sender_name,company_name,offer_description,language")
    .eq("id", 1)
    .single();
  if (settingsErr) return NextResponse.json({ error: settingsErr.message }, { status: 500 });

  const settings: LinkedinSettings = {
    senderName: settingsRow.sender_name ?? "",
    companyName: settingsRow.company_name ?? "",
    offerDescription: settingsRow.offer_description ?? "",
    language: settingsRow.language === "en" ? "en" : "es",
  };

  try {
    const draft = await generateLeadDraft(
      {
        name: lead.full_name,
        title: lead.headline ?? "",
        company: lead.company ?? "",
        location: lead.location ?? "",
        recentPosts: Array.isArray(lead.recent_posts) ? (lead.recent_posts as string[]) : [],
      },
      settings,
    );

    const { data: updated, error: updateErr } = await sb
      .from("linkedin_leads")
      .update({
        analysis_summary: draft.analysis,
        drafted_message: draft.message,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("id,analysis_summary,drafted_message,updated_at")
      .single();
    if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

    return NextResponse.json({ ok: true, lead: updated });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "unknown error" }, { status: 502 });
  }
}
