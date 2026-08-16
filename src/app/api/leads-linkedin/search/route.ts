import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { authenticate, isAdmin } from "@/lib/marketplace/auth";
import { runLinkedInSearch } from "@/lib/linkedinLeads/apifyClient";
import { generateLeadDraft } from "@/lib/linkedinLeads/messageGenerator";
import type { LinkedinSearchFilters, LinkedinSettings } from "@/lib/linkedinLeads/types";

export const runtime = "nodejs";
export const revalidate = 0;
// Runs the Apify search + per-lead Anthropic drafting synchronously within
// the request (fine for realistic counts, 10-50 leads). No in-memory job
// queue (unlike the lead-hunter prototype) because Vercel functions are
// stateless between invocations — progress is written to
// linkedin_search_jobs after each lead instead, so the GET status route
// can poll it while this function is still running.
export const maxDuration = 300;

type SearchPayload = {
  keyword: string;
  targetTitles: string[];
  state?: string;
  city?: string;
  count: number;
};

export async function POST(req: Request) {
  const user = await authenticate(req);
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = getSupabaseAdmin();
  if (!sb) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

  let body: SearchPayload;
  try {
    body = (await req.json()) as SearchPayload;
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const keyword = (body.keyword ?? "").trim();
  const targetTitles = Array.isArray(body.targetTitles) ? body.targetTitles.filter((t) => typeof t === "string" && t.trim()) : [];
  const count = Number.isFinite(body.count) ? Math.min(Math.max(Math.trunc(body.count), 1), 100) : 10;
  if (!keyword && targetTitles.length === 0) {
    return NextResponse.json({ error: "keyword o targetTitles requerido" }, { status: 400 });
  }

  const filters: LinkedinSearchFilters = {
    keyword,
    targetTitles,
    country: "Estados Unidos",
    state: body.state || undefined,
    city: body.city || undefined,
    count,
  };

  const { data: job, error: jobErr } = await sb
    .from("linkedin_search_jobs")
    .insert({ filters, status: "running", total: 0, done: 0 })
    .select("id")
    .single();
  if (jobErr || !job) return NextResponse.json({ error: jobErr?.message ?? "could not create job" }, { status: 500 });

  const jobId = job.id as string;

  try {
    const profiles = await runLinkedInSearch(filters);
    await sb.from("linkedin_search_jobs").update({ total: profiles.length }).eq("id", jobId);

    const { data: settingsRow } = await sb
      .from("linkedin_settings")
      .select("sender_name,company_name,offer_description,language")
      .eq("id", 1)
      .single();
    const settings: LinkedinSettings = {
      senderName: settingsRow?.sender_name ?? "",
      companyName: settingsRow?.company_name ?? "",
      offerDescription: settingsRow?.offer_description ?? "",
      language: settingsRow?.language === "en" ? "en" : "es",
    };

    let done = 0;
    for (const profile of profiles) {
      let analysis = "";
      let message = "";
      try {
        const draft = await generateLeadDraft(
          {
            name: profile.name,
            title: profile.title,
            company: profile.company,
            location: profile.location,
            recentPosts: profile.recentPosts,
          },
          settings,
        );
        analysis = draft.analysis;
        message = draft.message;
      } catch (e) {
        // Per-lead drafting failure shouldn't abort the whole search — the
        // lead still gets saved with the scraped profile data, just
        // without an AI draft; "Regenerar" on the card can retry later.
        analysis = `(No se pudo generar el análisis: ${e instanceof Error ? e.message : "error desconocido"})`;
      }

      await sb.from("linkedin_leads").insert({
        job_id: jobId,
        keyword: filters.keyword || null,
        target_titles: filters.targetTitles,
        country: filters.country,
        state: filters.state ?? null,
        city: filters.city ?? null,
        full_name: profile.name,
        headline: profile.title || null,
        company: profile.company || null,
        location: profile.location || null,
        profile_url: profile.profileUrl || null,
        photo_url: profile.photoUrl,
        recent_posts: profile.recentPosts,
        analysis_summary: analysis || null,
        drafted_message: message || null,
        status: "nuevo",
      });

      done += 1;
      await sb.from("linkedin_search_jobs").update({ done }).eq("id", jobId);
    }

    await sb
      .from("linkedin_search_jobs")
      .update({ status: "done", finished_at: new Date().toISOString() })
      .eq("id", jobId);

    return NextResponse.json({ ok: true, jobId, total: profiles.length, done });
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown error";
    await sb
      .from("linkedin_search_jobs")
      .update({ status: "error", error: message, finished_at: new Date().toISOString() })
      .eq("id", jobId);
    return NextResponse.json({ error: message, jobId }, { status: 502 });
  }
}
