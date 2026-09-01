import { describe, expect, it } from "vitest";
import {
  buildAiCenterPayload,
  buildLocalFallbackAlerts,
  getAiControlCenterSnapshot,
  normalizeSnapshot,
} from "./adminAiCenter";

describe("Admin AI Center payload", () => {
  it("keeps TerminalSync/Z.ai provider contract and lifecycle cases", () => {
    const snapshot = getAiControlCenterSnapshot();
    const glm = snapshot.connectedProviders.find(
      (provider) => provider.providerId === "glm",
    );
    const codex = snapshot.connectedProviders.find(
      (provider) => provider.providerId === "codex",
    );
    const gemini = snapshot.connectedProviders.find(
      (provider) => provider.providerId === "gemini",
    );

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
    // New fields land on every model entry, direct providers included.
    expect(gpt54).toMatchObject({
      upstreamProviderSlug: null,
      modalities: [],
      pricing: null,
    });

    expect(gemini?.discoveryState).toBe("discovered");
    const claude = snapshot.connectedProviders.find(
      (provider) => provider.providerId === "claude",
    );
    expect(claude?.modelIds).toContain("claude-fable-5");
    expect(
      claude?.models.find((model) => model.modelId === "claude-fable-5"),
    ).toMatchObject({
      visibleLabel: "Claude Fable 5",
      lifecycle: "beta",
    });

    expect(gemini?.defaultModelId).toBe("gemini-3.7-flash");
    expect(gemini?.modelIds).toContain("gemini-3.7-flash");
    expect(gemini?.modelIds).toContain("gemini-omni-1.1-flash");
    expect(
      gemini?.models.find((model) => model.modelId === "gemini-2.5-pro"),
    ).toMatchObject({
      lifecycle: "deprecated",
    });
  });

  it("builds endpoint-ready payload with snapshot, alerts, stats and mode/source", () => {
    const payload = buildAiCenterPayload({
      mode: "live",
      source: "terminalsync_ai_center_url",
    });

    expect(payload.mode).toBe("live");
    expect(payload.source).toBe("terminalsync_ai_center_url");
    expect(payload.snapshot.connectedProviders).toHaveLength(4);
    expect(payload.stats).toMatchObject({
      providers: 4,
      managedEngines: 2,
      models: 22,
      published: 6,
    });
    // Real snapshot alerts (3 gpt-5.4 findings) take priority over the local
    // heuristic, which is what the bug fix in this PR is about.
    expect(payload.alerts).toHaveLength(3);
    expect(payload.stats.alerts).toBe(3);
    expect(new Date(payload.generated_at).toString()).not.toBe("Invalid Date");
  });

  it("carries internalSources with the OpenRouter mirror, never as a connectedProvider", () => {
    const snapshot = getAiControlCenterSnapshot();
    expect(snapshot.internalSources).toHaveLength(1);
    const openrouter = snapshot.internalSources[0];
    expect(openrouter.providerId).toBe("openrouter");
    expect(openrouter.channel).toBe("internal");
    expect(openrouter.access).toBe("managed");
    expect(openrouter.models.map((m) => m.modelId)).toEqual(
      expect.arrayContaining([
        "openai/gpt-5.6-terra",
        "openai/gpt-5.4",
        "anthropic/claude-fable-5",
        "anthropic/claude-sonnet-4.6",
        "google/gemini-3.7-flash",
        "google/gemini-2.5-pro",
        "z-ai/glm-5.3",
        "black-forest-labs/flux-1.1-pro",
      ]),
    );
    const flux = openrouter.models.find(
      (m) => m.modelId === "black-forest-labs/flux-1.1-pro",
    );
    expect(flux?.upstreamProviderSlug).toBe("black-forest-labs");
    expect(flux?.modalities).toEqual(["text", "image"]);
    expect(flux?.pricing).not.toBeNull();

    expect(
      snapshot.connectedProviders.some((p) => p.providerId === "openrouter"),
    ).toBe(false);
  });

  it("populates changeReport and alerts with the three gpt-5.4 findings", () => {
    const snapshot = getAiControlCenterSnapshot();
    const { changeReport } = snapshot;

    expect(changeReport.detectedModels).toEqual([]);
    expect(changeReport.newCapabilities).toEqual([]);
    expect(changeReport.comparedAgainstUpdatedAt).toBeNull();

    expect(changeReport.retirements).toHaveLength(1);
    expect(changeReport.retirements[0]).toMatchObject({
      providerId: "codex",
      modelId: "gpt-5.4",
      retiresAt: "2026-08-31",
      replacementModelId: "gpt-5.6-terra",
    });

    expect(changeReport.replacementCandidates).toHaveLength(1);
    expect(changeReport.replacementCandidates[0]).toMatchObject({
      modelId: "gpt-5.4",
      replacementModelId: "gpt-5.6-terra",
      migrationMode: "automatic",
    });

    expect(changeReport.scheduledAutoSwitches).toHaveLength(1);
    expect(changeReport.scheduledAutoSwitches[0]).toMatchObject({
      fromModelId: "gpt-5.4",
      toModelId: "gpt-5.6-terra",
      switchAt: "2026-08-31",
    });

    expect(changeReport.alerts).toHaveLength(3);
    expect(changeReport.alerts.map((a) => a.kind).sort()).toEqual(
      [
        "replacement_available",
        "scheduled_auto_switch",
        "upcoming_retirement",
      ].sort(),
    );
    expect(snapshot.alerts).toEqual(changeReport.alerts);
  });

  it("carries exactly the two premium lanes (image and video)", () => {
    const snapshot = getAiControlCenterSnapshot();
    expect(snapshot.premiumLanes).toHaveLength(2);
    const ideogram = snapshot.premiumLanes.find(
      (lane) => lane.engineId === "ideogram",
    );
    expect(ideogram).toMatchObject({
      surface: "image",
      creditsProviderId: "ideogram",
      billing: "credits",
    });
    expect(ideogram?.bestFor.length).toBeGreaterThan(0);

    const tsVideo = snapshot.premiumLanes.find(
      (lane) => lane.engineId === "ts-video",
    );
    expect(tsVideo).toMatchObject({
      surface: "video",
      creditsProviderId: "wavespeed",
      billing: "credits",
    });
  });

  describe("buildLocalFallbackAlerts", () => {
    it("is documented as local-only and still produces a non-empty heuristic", () => {
      const snapshot = getAiControlCenterSnapshot();
      const alerts = buildLocalFallbackAlerts(snapshot);
      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts.every((alert) => typeof alert.title === "string")).toBe(
        true,
      );
    });
  });

  describe("normalizeSnapshot", () => {
    it("defaults every new field to a safe empty value for an old, field-less payload", () => {
      const oldSnapshot = getAiControlCenterSnapshot();
      // Simulate a payload from before this PR: strip the 4 new top-level
      // fields and the 3 new per-model fields entirely.
      const stripped = {
        ...oldSnapshot,
        connectedProviders: oldSnapshot.connectedProviders.map((p) => ({
          ...p,
          models: p.models.map(
            ({ upstreamProviderSlug, modalities, pricing, ...rest }) => rest,
          ),
        })),
      } as Record<string, unknown>;
      delete stripped.internalSources;
      delete stripped.changeReport;
      delete stripped.alerts;
      delete stripped.premiumLanes;

      const normalized = normalizeSnapshot(stripped);

      expect(normalized.internalSources).toEqual([]);
      expect(normalized.alerts).toEqual([]);
      expect(normalized.premiumLanes).toEqual([]);
      expect(normalized.changeReport).toMatchObject({
        comparedAgainstUpdatedAt: null,
        detectedModels: [],
        retirements: [],
        replacementCandidates: [],
        scheduledAutoSwitches: [],
        newCapabilities: [],
        alerts: [],
      });
      expect(typeof normalized.changeReport.generatedAt).toBe("number");

      for (const provider of normalized.connectedProviders) {
        for (const model of provider.models) {
          expect(model.upstreamProviderSlug).toBeNull();
          expect(model.modalities).toEqual([]);
          expect(model.pricing).toBeNull();
        }
      }

      // Fields that already existed pre-PR are preserved untouched.
      expect(normalized.connectedProviders.map((p) => p.providerId)).toEqual(
        oldSnapshot.connectedProviders.map((p) => p.providerId),
      );
    });

    it("preserves new fields as-is when the payload already carries them", () => {
      const snapshot = getAiControlCenterSnapshot();
      const normalized = normalizeSnapshot(snapshot);
      expect(normalized).toEqual(snapshot);
    });
  });

  describe("routingMatrix normalization", () => {
    it("defaults to an empty array when the field is absent (old snapshot)", () => {
      const snapshot = getAiControlCenterSnapshot() as unknown as Record<
        string,
        unknown
      >;
      const { routingMatrix: _omit, ...withoutRoutingMatrix } = snapshot;
      const normalized = normalizeSnapshot(withoutRoutingMatrix);
      expect(normalized.routingMatrix).toEqual([]);
    });

    it("normalizes a full entry for each selected.kind variant, preserving trace and upsell", () => {
      const raw = {
        ...getAiControlCenterSnapshot(),
        routingMatrix: [
          {
            surface: "chat",
            plan: "base15",
            profileId: "solo-glm",
            profileLabel: "Solo GLM",
            selected: {
              kind: { kind: "connected_provider", providerId: "glm" },
              visibleLabel: "TerminalSync / Z.ai",
              billing: "included",
              detail: "Ruta directa a glm-5.3.",
            },
            upsell: null,
            trace: [
              "profile=solo-glm",
              "surface=chat",
              "picked connected_provider:glm",
            ],
          },
          {
            surface: "chat",
            plan: "credits_only",
            profileId: "claude-solo",
            profileLabel: "Claude solo",
            selected: {
              kind: {
                kind: "internal_routed",
                sourceId: "openrouter",
                upstreamModelId: "anthropic/claude-sonnet-4.6",
              },
              visibleLabel: "Claude Sonnet 4.6",
              billing: "credits",
              detail: "Ruteado por OpenRouter hacia Anthropic.",
            },
            upsell: "Con créditos podés desbloquear Claude directo.",
            trace: [],
          },
          {
            surface: "video",
            plan: "premium_unlocked",
            profileId: "glm-completo",
            profileLabel: "GLM completo",
            selected: {
              kind: {
                kind: "managed_engine",
                engineId: "ts-video",
                creditsProviderId: "wavespeed",
              },
              visibleLabel: "TS Video",
              billing: "premium",
              detail: "",
            },
            upsell: null,
            trace: [],
          },
          {
            surface: "automation",
            plan: "base15",
            profileId: "sin-ias",
            profileLabel: "Sin IAs",
            selected: null,
            upsell: "Activá un perfil con IA para usar automatización.",
            trace: [],
          },
        ],
      };

      const normalized = normalizeSnapshot(raw);
      expect(normalized.routingMatrix).toHaveLength(4);

      const glmEntry = normalized.routingMatrix[0];
      expect(glmEntry.selected?.kind).toEqual({
        kind: "connected_provider",
        providerId: "glm",
      });
      expect(glmEntry.trace).toEqual([
        "profile=solo-glm",
        "surface=chat",
        "picked connected_provider:glm",
      ]);

      const routedEntry = normalized.routingMatrix[1];
      expect(routedEntry.selected?.kind).toEqual({
        kind: "internal_routed",
        sourceId: "openrouter",
        upstreamModelId: "anthropic/claude-sonnet-4.6",
      });
      expect(routedEntry.upsell).toBe(
        "Con créditos podés desbloquear Claude directo.",
      );

      const engineEntry = normalized.routingMatrix[2];
      expect(engineEntry.selected?.kind).toEqual({
        kind: "managed_engine",
        engineId: "ts-video",
        creditsProviderId: "wavespeed",
      });

      const noLaneEntry = normalized.routingMatrix[3];
      expect(noLaneEntry.selected).toBeNull();
      expect(noLaneEntry.upsell).toBe(
        "Activá un perfil con IA para usar automatización.",
      );
    });

    it("tolerates a partial/malformed entry without throwing", () => {
      const raw = {
        ...getAiControlCenterSnapshot(),
        routingMatrix: [
          {},
          {
            surface: "image",
            profileId: "solo-glm",
            selected: { kind: { kind: "unknown_future_kind" } },
          },
          "not-an-object",
          null,
        ],
      };

      const normalized = normalizeSnapshot(raw);
      expect(normalized.routingMatrix).toHaveLength(4);
      expect(normalized.routingMatrix[0]).toMatchObject({
        surface: "chat",
        plan: "",
        profileId: "",
        selected: null,
        trace: [],
      });
      expect(normalized.routingMatrix[1]).toMatchObject({
        surface: "image",
        profileId: "solo-glm",
        selected: null,
      });
      expect(normalized.routingMatrix[2].profileId).toBe("");
      expect(normalized.routingMatrix[3].selected).toBeNull();
    });
  });

  describe("videoLanePricing normalization", () => {
    it("defaults to an empty array when the field is absent (old snapshot)", () => {
      const snapshot = getAiControlCenterSnapshot() as unknown as Record<
        string,
        unknown
      >;
      const { videoLanePricing: _omit, ...withoutVideoLanePricing } = snapshot;
      const normalized = normalizeSnapshot(withoutVideoLanePricing);
      expect(normalized.videoLanePricing).toEqual([]);
    });

    it("normalizes full entries and preserves withinRule true/false", () => {
      const raw = {
        ...getAiControlCenterSnapshot(),
        videoLanePricing: [
          {
            modelId: "wavespeed/ts-video-1",
            label: "TS Video 1",
            costUsd5s: 0.2,
            priceUsd5s: 0.44,
            multiple: 2.2,
            withinRule: true,
          },
          {
            modelId: "wavespeed/ts-video-fast",
            label: "TS Video Fast",
            costUsd5s: 0.1,
            priceUsd5s: 0.35,
            multiple: 3.5,
            withinRule: false,
          },
        ],
      };

      const normalized = normalizeSnapshot(raw);
      expect(normalized.videoLanePricing).toHaveLength(2);
      expect(normalized.videoLanePricing[0]).toMatchObject({
        modelId: "wavespeed/ts-video-1",
        multiple: 2.2,
        withinRule: true,
      });
      expect(normalized.videoLanePricing[1]).toMatchObject({
        modelId: "wavespeed/ts-video-fast",
        multiple: 3.5,
        withinRule: false,
      });
    });

    it("tolerates a partial/malformed entry without throwing", () => {
      const raw = {
        ...getAiControlCenterSnapshot(),
        videoLanePricing: [
          { modelId: "wavespeed/ts-video-1" },
          {
            modelId: "wavespeed/ts-video-2",
            costUsd5s: "not-a-number",
            withinRule: "yes",
          },
          {},
          null,
        ],
      };

      const normalized = normalizeSnapshot(raw);
      expect(normalized.videoLanePricing).toHaveLength(4);
      expect(normalized.videoLanePricing[0]).toMatchObject({
        modelId: "wavespeed/ts-video-1",
        label: null,
        costUsd5s: null,
        withinRule: false,
      });
      expect(normalized.videoLanePricing[1]).toMatchObject({
        modelId: "wavespeed/ts-video-2",
        costUsd5s: null,
        withinRule: true,
      });
      expect(normalized.videoLanePricing[2]).toMatchObject({
        modelId: "",
        withinRule: false,
      });
    });
  });

  it("buildAiCenterPayload falls back to the heuristic only when the snapshot truly has no alerts", () => {
    const snapshot = getAiControlCenterSnapshot();
    const emptyAlertsSnapshot = {
      ...snapshot,
      alerts: [],
      changeReport: { ...snapshot.changeReport, alerts: [] },
    };
    const payload = buildAiCenterPayload({ snapshot: emptyAlertsSnapshot });
    expect(payload.alerts.length).toBeGreaterThan(0);
    expect(payload.alerts).toEqual(
      buildLocalFallbackAlerts(normalizeSnapshot(emptyAlertsSnapshot)),
    );
  });
});
