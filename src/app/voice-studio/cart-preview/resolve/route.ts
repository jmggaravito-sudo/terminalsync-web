import { NextResponse } from "next/server";
import { verifyVoiceStudioQuoteVideo } from "@/lib/voiceStudioQuoteVideo";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const result = await verifyVoiceStudioQuoteVideo(body?.link);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  // Funnel metric, best-effort: a link made it into a visitor's cart. Never
  // let metrics failure affect the quote flow.
  try {
    const db = getSupabaseAdmin();
    if (db) {
      await db.from("voice_studio_cart_events")
        .insert({ kind: "link_added", video_id: result.id, seconds: result.seconds });
    }
  } catch (err) {
    console.error("[cart-preview] link_added metric failed", err);
  }
  return NextResponse.json(result);
}
