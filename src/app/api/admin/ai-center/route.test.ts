import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getAiControlCenterSnapshot, type AiCenterPayload } from "@/lib/adminAiCenter";

const mocks = vi.hoisted(() => ({
  authenticate: vi.fn(),
  isAdmin: vi.fn(),
}));

vi.mock("@/lib/marketplace/auth", () => ({
  authenticate: mocks.authenticate,
  isAdmin: mocks.isAdmin,
}));

function request(): Request {
  return new Request("https://terminalsync.ai/api/admin/ai-center", {
    method: "GET",
    headers: { Authorization: "Bearer admin-token" },
  });
}

/**
 * `route.ts` reads `TERMINALSYNC_AI_CENTER_URL` (and friends) into
 * module-level `const`s at import time, so each scenario needs a fresh
 * module instance after the env var is set — `vi.resetModules()` + a
 * dynamic re-import. `vi.mock` factories registered above stay active
 * across resets.
 */
async function loadRoute(envUrl?: string) {
  vi.resetModules();
  if (envUrl === undefined) {
    delete process.env.TERMINALSYNC_AI_CENTER_URL;
  } else {
    process.env.TERMINALSYNC_AI_CENTER_URL = envUrl;
  }
  return import("./route");
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.authenticate.mockResolvedValue({ id: "admin-1", email: "jm@terminalsync.ai" });
  mocks.isAdmin.mockReturnValue(true);
});

afterEach(() => {
  delete process.env.TERMINALSYNC_AI_CENTER_URL;
  delete process.env.TERMINALSYNC_AI_CENTER_TOKEN;
  vi.unstubAllGlobals();
});

describe("GET /api/admin/ai-center", () => {
  it("rejects unauthenticated requests", async () => {
    mocks.authenticate.mockResolvedValue(null);
    const { GET } = await loadRoute();
    const res = await GET(request());
    expect(res.status).toBe(401);
  });

  it("rejects non-admin requests", async () => {
    mocks.isAdmin.mockReturnValue(false);
    const { GET } = await loadRoute();
    const res = await GET(request());
    expect(res.status).toBe(403);
  });

  it("falls back to the local mirror when TERMINALSYNC_AI_CENTER_URL is unset", async () => {
    const { GET } = await loadRoute(undefined);
    const res = await GET(request());
    const body = (await res.json()) as AiCenterPayload;

    expect(res.status).toBe(200);
    expect(body.mode).toBe("fallback_local");
    expect(body.source).toBe("page_local_mirror");
    expect(body.fallbackReason).toContain("not configured");
  });

  it("passes through the real alerts/changeReport/internalSources/premiumLanes from a bare live snapshot instead of recomputing alerts (regression)", async () => {
    const realSnapshot = getAiControlCenterSnapshot();
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(realSnapshot), { status: 200 })));

    const { GET } = await loadRoute("https://example.com/ai-center-snapshot.json");
    const res = await GET(request());
    const body = (await res.json()) as AiCenterPayload;

    expect(res.status).toBe(200);
    expect(body.mode).toBe("live");
    expect(body.source).toBe("terminalsync_ai_center_url");
    // The bug this PR fixes: alerts must be the engine's real 3 gpt-5.4
    // findings, not the local heuristic's recomputation (which also covers
    // Gemini/GLM and would total more than 3).
    expect(body.alerts).toHaveLength(3);
    expect(body.alerts.map((a) => a.kind).sort()).toEqual(
      ["replacement_available", "scheduled_auto_switch", "upcoming_retirement"].sort(),
    );
    expect(body.snapshot.internalSources).toHaveLength(1);
    expect(body.snapshot.internalSources[0].providerId).toBe("openrouter");
    expect(body.snapshot.premiumLanes).toHaveLength(2);
    expect(body.snapshot.changeReport.retirements).toHaveLength(1);
  });

  it("passes through explicit alerts from a wrapped {snapshot, alerts, stats} live response", async () => {
    const realSnapshot = getAiControlCenterSnapshot();
    const customAlert = {
      kind: "new_model_detected" as const,
      severity: "info" as const,
      providerId: "codex",
      modelId: "gpt-7",
      visibleLabel: "GPT-7",
      detail: "custom wrapped alert",
      retiresAt: null,
      replacementModelId: null,
    };
    const wrapped = { snapshot: realSnapshot, alerts: [customAlert] };
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(wrapped), { status: 200 })));

    const { GET } = await loadRoute("https://example.com/ai-center-snapshot.json");
    const res = await GET(request());
    const body = (await res.json()) as AiCenterPayload;

    expect(body.mode).toBe("live");
    expect(body.alerts).toEqual([customAlert]);
  });

  it("passes through a full AiCenterPayload-shaped live response as-is", async () => {
    const realSnapshot = getAiControlCenterSnapshot();
    const fullPayload = {
      snapshot: realSnapshot,
      alerts: realSnapshot.alerts,
      stats: { providers: 4, managedEngines: 2, models: 15, published: 6, alerts: 3 },
      generated_at: "2026-08-20T00:00:00.000Z",
      mode: "live",
      source: "terminalsync_ai_center_url",
    };
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(fullPayload), { status: 200 })));

    const { GET } = await loadRoute("https://example.com/ai-center-snapshot.json");
    const res = await GET(request());
    const body = (await res.json()) as AiCenterPayload;

    expect(body.mode).toBe("live");
    expect(body.alerts).toEqual(realSnapshot.alerts);
    expect(body.snapshot.internalSources).toHaveLength(1);
  });

  it("falls back to the local mirror when the live fetch fails", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("boom", { status: 500 })));

    const { GET } = await loadRoute("https://example.com/ai-center-snapshot.json");
    const res = await GET(request());
    const body = (await res.json()) as AiCenterPayload;

    expect(res.status).toBe(200);
    expect(body.mode).toBe("fallback_local");
    expect(body.fallbackReason).toContain("HTTP 500");
  });

  it("uses the local heuristic when a live snapshot predates alerts/changeReport", async () => {
    const realSnapshot = getAiControlCenterSnapshot() as unknown as Record<string, unknown>;
    const oldShapeSnapshot = { ...realSnapshot };
    delete oldShapeSnapshot.internalSources;
    delete oldShapeSnapshot.changeReport;
    delete oldShapeSnapshot.alerts;
    delete oldShapeSnapshot.premiumLanes;
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(oldShapeSnapshot), { status: 200 })));

    const { GET } = await loadRoute("https://example.com/ai-center-snapshot.json");
    const res = await GET(request());
    const body = (await res.json()) as AiCenterPayload;

    expect(body.mode).toBe("live");
    // No real alerts on the wire → local heuristic kicks in, which (unlike
    // the real 3-alert set) also covers Gemini/GLM, so it's longer.
    expect(body.alerts.length).toBeGreaterThan(3);
  });
});
