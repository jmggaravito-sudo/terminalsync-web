import { NextResponse } from "next/server";

const samples = new Map([
  ["/45-seconds", { id: "demo-45", title: "Example · 45 seconds", seconds: 45 }],
  ["/90-seconds", { id: "demo-90", title: "Example · 90 seconds", seconds: 90 }],
  ["/24-minutes", { id: "demo-24", title: "Example · 24 minutes", seconds: 1440 }],
]);

function error(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function youtubeId(url: URL) {
  const host = url.hostname;
  if (host === "youtu.be") return url.pathname.split("/")[1];
  if (!["youtube.com", "www.youtube.com", "m.youtube.com"].includes(host)) return null;
  if (url.pathname === "/watch") return url.searchParams.get("v");
  const path = url.pathname.match(/^\/(?:shorts|embed)\/([^/]+)\/?$/);
  return path?.[1] ?? null;
}

function parseDuration(value: unknown) {
  if (typeof value !== "string") return 0;
  const match = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(value);
  return match ? Number(match[1] ?? 0) * 3600 + Number(match[2] ?? 0) * 60 + Number(match[3] ?? 0) : 0;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (typeof body?.link !== "string" || body.link.length > 2048) return error("Enter a valid video link.", 400);
  let url: URL;
  try { url = new URL(body.link.trim()); } catch { return error("Enter a valid video link.", 400); }
  if (url.protocol !== "https:" || url.username || url.password || url.port) return error("Use an HTTPS video link.", 400);

  const sample = url.hostname === "voice-studio.example" ? samples.get(url.pathname) : undefined;
  if (sample) return NextResponse.json({ ...sample, demo: true });

  const id = youtubeId(url);
  if (!id || !/^[A-Za-z0-9_-]{11}$/.test(id)) return error("Use a supported YouTube video link or one of the preview links.", 400);

  const key = process.env.VOICE_STUDIO_PREVIEW_YOUTUBE_API_KEY;
  if (!key) return error("Live verification is not enabled in this preview. Try one of the example links.", 503);

  // Only call the fixed Google endpoint; never fetch a user-supplied URL.
  const endpoint = new URL("https://www.googleapis.com/youtube/v3/videos");
  endpoint.searchParams.set("part", "contentDetails,snippet");
  endpoint.searchParams.set("id", id);
  try {
    const response = await fetch(endpoint, { headers: { "x-goog-api-key": key }, cache: "no-store", signal: AbortSignal.timeout(5000) });
    if (!response.ok) return error("We couldn't verify this video right now.", 502);
    const data = await response.json();
    const video = data.items?.[0];
    const seconds = parseDuration(video?.contentDetails?.duration);
    if (!Number.isSafeInteger(seconds) || seconds <= 0 || video?.snippet?.liveBroadcastContent !== "none") {
      return error("We couldn't verify a finished video at this link.", 422);
    }
    return NextResponse.json({ id: `youtube-${id}`, seconds, title: String(video.snippet.title || "YouTube video"), demo: false });
  } catch {
    return error("We couldn't verify this video right now.", 502);
  }
}
