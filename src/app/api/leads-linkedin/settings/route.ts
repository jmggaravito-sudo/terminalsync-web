import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { authenticate, isAdmin } from "@/lib/marketplace/auth";
import type { LinkedinSettings } from "@/lib/linkedinLeads/types";

export const runtime = "nodejs";
export const revalidate = 0;

export async function GET(req: Request) {
  const user = await authenticate(req);
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = getSupabaseAdmin();
  if (!sb) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

  const { data, error } = await sb
    .from("linkedin_settings")
    .select("sender_name,company_name,offer_description,language")
    .eq("id", 1)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const settings: LinkedinSettings = {
    senderName: data.sender_name ?? "",
    companyName: data.company_name ?? "",
    offerDescription: data.offer_description ?? "",
    language: data.language === "en" ? "en" : "es",
  };
  return NextResponse.json({ settings });
}

export async function PUT(req: Request) {
  const user = await authenticate(req);
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = getSupabaseAdmin();
  if (!sb) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

  let body: Partial<LinkedinSettings>;
  try {
    body = (await req.json()) as Partial<LinkedinSettings>;
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const language = body.language === "en" ? "en" : "es";
  const { data, error } = await sb
    .from("linkedin_settings")
    .upsert({
      id: 1,
      sender_name: body.senderName ?? "",
      company_name: body.companyName ?? "",
      offer_description: body.offerDescription ?? "",
      language,
      updated_at: new Date().toISOString(),
    })
    .select("sender_name,company_name,offer_description,language")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const settings: LinkedinSettings = {
    senderName: data.sender_name ?? "",
    companyName: data.company_name ?? "",
    offerDescription: data.offer_description ?? "",
    language: data.language === "en" ? "en" : "es",
  };
  return NextResponse.json({ settings });
}
