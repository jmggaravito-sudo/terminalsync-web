import { NextResponse } from "next/server";
import {
  buildAiCenterPayload,
  isAiControlCenterSnapshot,
  isAiCenterStats,
  normalizeSnapshot,
  type AiCenterPayload,
  type AiCenterPayloadSource,
} from "@/lib/adminAiCenter";
import { authenticate, isAdmin } from "@/lib/marketplace/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const LIVE_SNAPSHOT_URL = process.env.TERMINALSYNC_AI_CENTER_URL ?? "";
const LIVE_SNAPSHOT_TOKEN = process.env.TERMINALSYNC_AI_CENTER_TOKEN ?? process.env.OPS_GITHUB_TOKEN ?? "";
const LIVE_TIMEOUT_MS = Number(process.env.TERMINALSYNC_AI_CENTER_TIMEOUT_MS ?? 5_000);

function fallbackPayload(fallbackReason: string) {
  return buildAiCenterPayload({
    mode: "fallback_local",
    source: "page_local_mirror" satisfies AiCenterPayloadSource,
    fallbackReason,
  });
}

type AiCenterPayloadCandidate = Partial<AiCenterPayload>;

function isLivePayload(value: unknown): value is AiCenterPayload {
  if (!value || typeof value !== "object") return false;
  const candidate = value as AiCenterPayloadCandidate;
  return Boolean(
    isAiControlCenterSnapshot(candidate.snapshot) &&
      Array.isArray(candidate.alerts) &&
      isAiCenterStats(candidate.stats) &&
      typeof candidate.generated_at === "string",
  );
}

function normalizeLiveResponse(json: unknown): AiCenterPayload {
  if (isAiControlCenterSnapshot(json)) {
    // Bare `AiControlCenterSnapshot` straight from the engine — it already
    // carries its own real `alerts`/`changeReport`/`internalSources`/
    // `premiumLanes`/`routingMatrix`/`videoLanePricing`. `buildAiCenterPayload`
    // (via `normalizeSnapshot` + `resolveAlerts`) prefers `snapshot.alerts`
    // over the local heuristic whenever it is non-empty, so this passes
    // every snapshot field through untouched (routingMatrix/videoLanePricing
    // included) instead of recomputing anything from scratch.
    return buildAiCenterPayload({
      mode: "live",
      source: "terminalsync_ai_center_url",
      snapshot: json,
    });
  }

  if (json && typeof json === "object") {
    const wrapped = json as { snapshot?: unknown; alerts?: unknown; stats?: unknown };
    if (isAiControlCenterSnapshot(wrapped.snapshot)) {
      return buildAiCenterPayload({
        mode: "live",
        source: "terminalsync_ai_center_url",
        snapshot: wrapped.snapshot,
        // Only override with an explicit `alerts` array when the caller
        // sent one — otherwise `buildAiCenterPayload` falls through to
        // `snapshot.alerts` (real) and only then the local heuristic.
        ...(Array.isArray(wrapped.alerts) ? { alerts: wrapped.alerts } : {}),
        ...(isAiCenterStats(wrapped.stats) ? { stats: wrapped.stats } : {}),
      });
    }
  }

  if (isLivePayload(json)) {
    return {
      ...json,
      snapshot: normalizeSnapshot(json.snapshot),
      mode: "live",
      source: "terminalsync_ai_center_url",
      generated_at: new Date().toISOString(),
    };
  }

  throw new Error("TERMINALSYNC_AI_CENTER_URL returned invalid payload: missing valid snapshot");
}

async function readLivePayload(): Promise<AiCenterPayload> {
  if (!LIVE_SNAPSHOT_URL) {
    throw new Error("TERMINALSYNC_AI_CENTER_URL not configured");
  }

  let url: URL;
  try {
    url = new URL(LIVE_SNAPSHOT_URL);
  } catch {
    throw new Error("TERMINALSYNC_AI_CENTER_URL is not a valid URL");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Math.max(1_000, LIVE_TIMEOUT_MS));
  try {
    const isGithubContentsApi = url.hostname === "api.github.com" && url.pathname.includes("/contents/");
    const headers = new Headers({
      Accept: isGithubContentsApi ? "application/vnd.github.raw+json" : "application/json",
    });
    if (LIVE_SNAPSHOT_TOKEN) headers.set("Authorization", `Bearer ${LIVE_SNAPSHOT_TOKEN}`);
    if (isGithubContentsApi && !LIVE_SNAPSHOT_TOKEN) {
      throw new Error("TERMINALSYNC_AI_CENTER_URL points to private GitHub contents API but no token is configured");
    }

    const res = await fetch(url, {
      headers,
      cache: "no-store",
      next: { revalidate: 0 },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`TERMINALSYNC_AI_CENTER_URL HTTP ${res.status}`);

    const json = (await res.json()) as unknown;
    return normalizeLiveResponse(json);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`TERMINALSYNC_AI_CENTER_URL timeout after ${Math.max(1_000, LIVE_TIMEOUT_MS)}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
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
    return NextResponse.json(await readLivePayload());
  } catch (error) {
    return NextResponse.json(
      fallbackPayload(error instanceof Error ? error.message : "live snapshot unavailable"),
    );
  }
}
