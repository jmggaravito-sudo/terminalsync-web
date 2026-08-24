import { describe, expect, it } from "vitest";
import { buildAiCenterPayload, getAiCenterAlerts, getAiControlCenterSnapshot } from "./adminAiCenter";

describe("Admin AI Center payload", () => {
  it("keeps TerminalSync/Z.ai provider contract and lifecycle cases", () => {
    const snapshot = getAiControlCenterSnapshot();
    const glm = snapshot.connectedProviders.find((provider) => provider.providerId === "glm");
    const codex = snapshot.connectedProviders.find((provider) => provider.providerId === "codex");
    const gemini = snapshot.connectedProviders.find((provider) => provider.providerId === "gemini");

    expect(glm?.visibleLabel).toBe("TerminalSync / Z.ai");
    expect(glm?.defaultModelId).toBe("glm-5.3");
    expect(glm?.modelIds).toContain("glm-5.3");

    const gpt54 = codex?.models.find((model) => model.modelId === "gpt-5.4");
    expect(gpt54).toMatchObject({
      lifecycle: "replacement_available",
      retiresAt: "2026-08-31",
      replacementModelId: "gpt-5.6-terra",
      replacementVisibleLabel: "GPT-5.6 Terra",
      migrationMode: "automatic",
    });

    expect(gemini?.discoveryState).toBe("discovered");
    expect(gemini?.modelIds).toContain("gemini-2.5-flash-image");
  });

  it("builds endpoint-ready payload with snapshot, alerts, stats and mode/source", () => {
    const payload = buildAiCenterPayload({ mode: "live_endpoint", source: "admin_api_mirror" });

    expect(payload.mode).toBe("live_endpoint");
    expect(payload.source).toBe("admin_api_mirror");
    expect(payload.snapshot.connectedProviders).toHaveLength(4);
    expect(payload.stats).toMatchObject({ providers: 4, managedEngines: 2, models: 15, published: 6 });
    expect(payload.alerts).toHaveLength(getAiCenterAlerts(payload.snapshot).length);
    expect(new Date(payload.generated_at).toString()).not.toBe("Invalid Date");
  });
});
