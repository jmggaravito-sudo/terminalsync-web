import { NextResponse } from "next/server";
import {
  buildAiCenterPayload,
  type AiCenterPayload,
  type AiCenterPayloadMode,
  type AiCenterPayloadSource,
} from "@/lib/adminAiCenter";
import { authenticate, isAdmin } from "@/lib/marketplace/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const LIVE_SNAPSHOT_URL = process.env.TERMINALSYNC_AI_CENTER_URL ?? "";
const LIVE_SNAPSHOT_TOKEN = process.env.TERMINALSYNC_AI_CENTER_TOKEN ?? "";

type LiveCandidate = Partial<AiCenterPayload>;

function isAiCenterPayload(value: unknown): value is AiCenterPayload {
  if (!value || typeof value !== "object") return false;
  const candidate = value as LiveCandidate;
  return Boolean(
    candidate.snapshot &&
      candidate.alerts &&
      candidate.stats &&
      typeof candidate.generated_at === "string" &&
      candidate.mode &&
      candidate.source,
  );
}

async function readLivePayload(): Promise<AiCenterPayload | null> {
  if (!LIVE_SNAPSHOT_URL) return null;

  const headers = new Headers({ Accept: "application/json" });
  if (LIVE_SNAPSHOT_TOKEN) headers.set("Authorization", `Bearer ${LIVE_SNAPSHOT_TOKEN}`);

  const res = await fetch(LIVE_SNAPSHOT_URL, {
    headers,
    cache: "no-store",
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`TerminalSync live snapshot HTTP ${res.status}`);

  const json = (await res.json()) as unknown;
  const payload = isAiCenterPayload(json)
    ? json
    : buildAiCenterPayload({
        mode: "live_endpoint",
        source: "terminalsync_live",
        snapshot: (json as { snapshot?: unknown }).snapshot,
        alerts: (json as { alerts?: unknown }).alerts,
        stats: (json as { stats?: unknown }).stats,
      });

  return {
    ...payload,
    mode: "live_endpoint" satisfies AiCenterPayloadMode,
    source: "terminalsync_live" satisfies AiCenterPayloadSource,
    generated_at: new Date().toISOString(),
  };
}

export async function GET(req: Request) {
  const user = await authenticate(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isAdmin(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const livePayload = await readLivePayload();
    if (livePayload) return NextResponse.json(livePayload);
  } catch (error) {
    const payload = buildAiCenterPayload({
      mode: "live_endpoint",
      source: "admin_api_mirror",
      fallbackReason: error instanceof Error ? error.message : "live snapshot unavailable",
    });
    return NextResponse.json(payload);
  }

  return NextResponse.json(
    buildAiCenterPayload({
      mode: "live_endpoint",
      source: "admin_api_mirror",
    }),
  );
}
