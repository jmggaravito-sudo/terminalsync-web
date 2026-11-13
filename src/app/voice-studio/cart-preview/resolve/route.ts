import { NextResponse } from "next/server";
import { verifyVoiceStudioQuoteVideo } from "@/lib/voiceStudioQuoteVideo";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const result = await verifyVoiceStudioQuoteVideo(body?.link);
  return "error" in result
    ? NextResponse.json({ error: result.error }, { status: result.status })
    : NextResponse.json(result);
}
