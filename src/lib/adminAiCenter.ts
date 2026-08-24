// Internal Admin AI Center data adapter.
//
// Source of truth mirrored from TerminalSync merged PRs:
// - PR #1504: src-tauri/src/ai_provider_catalog.rs
// - PR #1522: src-tauri/src/ai_catalog_policy.rs
// - PR #1526: src-tauri/src/ai_control_center.rs
// - PR #1527: src/lib/aiCatalogPolicy.ts / composer provider-first wiring
// - PR #1534: lifecycle metadata
//
// This file is intentionally used only by /[lang]/admin/ai-center. Do not import
// it from public landing/client pages. `glm` remains the stable internal
// provider_id and its visible label is TerminalSync / Z.ai.

export type AiCatalogPromotionChannel = "internal" | "beta" | "public";
export type AiCatalogSurface = "chat" | "design" | "image" | "video" | "automation";
export type AiAdminSurface = "chat" | "image" | "video" | "automation";
export type AiCatalogAccess = "connected" | "managed" | "credits" | "requires_key";
export type AiCatalogDiscoveryState = "seeded" | "discovered";
export type AiCatalogSourceKind = "seed_snapshot" | "provider_api";
export type AiCatalogModelLifecycleState =
  | "active"
  | "beta"
  | "deprecated"
  | "retired"
  | "replacement_available";
export type AiCatalogMigrationMode = "automatic" | "manual";

export interface ProviderCatalogSourceMetadata {
  kind: AiCatalogSourceKind;
  label: string;
  endpoint: string | null;
}

export interface ProviderCatalogModelEntry {
  modelId: string;
  visibleLabel: string;
  capabilities: string[];
  lifecycle: AiCatalogModelLifecycleState;
  retiresAt: string | null;
  replacementModelId: string | null;
  replacementVisibleLabel: string | null;
  migrationMode: AiCatalogMigrationMode | null;
  isDefault: boolean;
}

export interface ProviderCatalogLifecycleSummary {
  totalModels: number;
  visibleModels: number;
  activeModels: number;
  betaModels: number;
  deprecatedModels: number;
  retiredModels: number;
  replacementAvailableModels: number;
  automaticMigrations: number;
}

export interface ProviderCatalogViewEntry {
  providerId: string;
  visibleLabel: string;
  discoveryState: AiCatalogDiscoveryState;
  source: ProviderCatalogSourceMetadata;
  updatedAt: number;
  channel: AiCatalogPromotionChannel;
  access: AiCatalogAccess;
  surfaces: AiCatalogSurface[];
  capabilities: string[];
  defaultModelId: string | null;
  modelIds: string[];
  models: ProviderCatalogModelEntry[];
  lifecycleSummary: ProviderCatalogLifecycleSummary;
}

export interface ManagedEngineCatalogViewEntry {
  engineId: string;
  visibleLabel: string;
  creditsProviderId: string;
  channel: AiCatalogPromotionChannel;
  access: AiCatalogAccess;
  surfaces: AiCatalogSurface[];
  capabilities: string[];
}

export interface ProviderFirstCatalogView {
  audience: AiCatalogPromotionChannel;
  surface: AiCatalogSurface;
  connectedProviders: ProviderCatalogViewEntry[];
  managedEngines: ManagedEngineCatalogViewEntry[];
}

export interface AiControlCenterSnapshot {
  generatedAt: number;
  catalogStatus: "seeded_only" | "fresh" | "refresh_due";
  refreshIntervalSecs: number;
  lastRefreshedAt: number | null;
  refreshDue: boolean;
  connectedProviders: ProviderCatalogViewEntry[];
  managedEngines: ManagedEngineCatalogViewEntry[];
  composerView: ProviderFirstCatalogView;
  surfaceViews: ProviderFirstCatalogView[];
}

export type AiCenterAlertKind =
  | "new_model_detected"
  | "retiring_soon"
  | "replacement_available"
  | "automatic_migration_scheduled"
  | "provider_degraded"
  | "new_capability";

export interface AiCenterAlert {
  kind: AiCenterAlertKind;
  severity: "info" | "warning" | "critical";
  title: string;
  detail: string;
  providerId?: string;
  modelId?: string;
  owner: "Producto" | "Ingeniería" | "Ops";
}

export interface AiCenterStats {
  providers: number;
  managedEngines: number;
  models: number;
  published: number;
  alerts: number;
}

export type AiCenterPayloadMode = "live_endpoint" | "fallback_local";
export type AiCenterPayloadSource = "terminalsync_live" | "admin_api_mirror" | "page_local_mirror";

export interface AiCenterPayload {
  snapshot: AiControlCenterSnapshot;
  alerts: AiCenterAlert[];
  stats: AiCenterStats;
  generated_at: string;
  mode: AiCenterPayloadMode;
  source: AiCenterPayloadSource;
  fallbackReason?: string;
}

export const AI_CENTER_SURFACES: { key: AiAdminSurface; es: string; en: string }[] = [
  { key: "chat", es: "Chat", en: "Chat" },
  { key: "image", es: "Imagen", en: "Image" },
  { key: "video", es: "Video", en: "Video" },
  { key: "automation", es: "Automatización", en: "Automation" },
];

const REAL_GENERATED_AT = Date.UTC(2026, 7, 23, 15, 0, 0);
const REAL_UPDATED_AT = Date.UTC(2026, 7, 23, 15, 0, 0);
const GEMINI_DISCOVERED_AT = Date.UTC(2026, 7, 23, 14, 45, 0);
const PROVIDER_API_ENDPOINT_REDACTED = "provider_api_endpoint_redacted";

const ALL_CODE_CAPABILITIES = [
  "chat",
  "code",
  "filesystem",
  "background_jobs",
  "scheduled_jobs",
  "design_text",
  "tool_approval_gate",
];

const GLM_CAPABILITIES = [
  "chat",
  "code",
  "filesystem",
  "background_jobs",
  "scheduled_jobs",
  "design_text",
  "image_generation",
];

function source(label: string, kind: AiCatalogSourceKind = "seed_snapshot"): ProviderCatalogSourceMetadata {
  return {
    kind,
    label,
    endpoint: kind === "provider_api" ? PROVIDER_API_ENDPOINT_REDACTED : null,
  };
}

function summarizeLifecycle(models: ProviderCatalogModelEntry[]): ProviderCatalogLifecycleSummary {
  const summary: ProviderCatalogLifecycleSummary = {
    totalModels: models.length,
    visibleModels: 0,
    activeModels: 0,
    betaModels: 0,
    deprecatedModels: 0,
    retiredModels: 0,
    replacementAvailableModels: 0,
    automaticMigrations: 0,
  };
  for (const model of models) {
    if (model.lifecycle !== "retired") summary.visibleModels += 1;
    if (model.migrationMode === "automatic") summary.automaticMigrations += 1;
    if (model.lifecycle === "active") summary.activeModels += 1;
    if (model.lifecycle === "beta") summary.betaModels += 1;
    if (model.lifecycle === "deprecated") summary.deprecatedModels += 1;
    if (model.lifecycle === "retired") summary.retiredModels += 1;
    if (model.lifecycle === "replacement_available") summary.replacementAvailableModels += 1;
  }
  return summary;
}

function provider(input: Omit<ProviderCatalogViewEntry, "lifecycleSummary">): ProviderCatalogViewEntry {
  return {
    ...input,
    modelIds: input.models.filter((model) => model.lifecycle !== "retired").map((model) => model.modelId),
    lifecycleSummary: summarizeLifecycle(input.models),
  };
}

const connectedProviders: ProviderCatalogViewEntry[] = [
  provider({
    providerId: "glm",
    visibleLabel: "TerminalSync / Z.ai",
    discoveryState: "seeded",
    source: source("Z.ai seed snapshot from TerminalSync ai_provider_catalog.rs"),
    updatedAt: REAL_UPDATED_AT,
    channel: "public",
    access: "credits",
    surfaces: ["chat", "design", "image", "automation"],
    capabilities: GLM_CAPABILITIES,
    defaultModelId: "glm-5.3",
    modelIds: [],
    models: [
      {
        modelId: "glm-5.3",
        visibleLabel: "GLM-5.3",
        capabilities: GLM_CAPABILITIES,
        lifecycle: "active",
        retiresAt: null,
        replacementModelId: null,
        replacementVisibleLabel: null,
        migrationMode: null,
        isDefault: true,
      },
      {
        modelId: "glm-4.5",
        visibleLabel: "GLM 4.5",
        capabilities: GLM_CAPABILITIES,
        lifecycle: "active",
        retiresAt: null,
        replacementModelId: null,
        replacementVisibleLabel: null,
        migrationMode: null,
        isDefault: false,
      },
      {
        modelId: "glm-image",
        visibleLabel: "GLM Image",
        capabilities: GLM_CAPABILITIES,
        lifecycle: "active",
        retiresAt: null,
        replacementModelId: null,
        replacementVisibleLabel: null,
        migrationMode: null,
        isDefault: false,
      },
    ],
  }),
  provider({
    providerId: "claude",
    visibleLabel: "Claude Code",
    discoveryState: "seeded",
    source: source("Anthropic seed snapshot from TerminalSync ai_provider_catalog.rs"),
    updatedAt: REAL_UPDATED_AT,
    channel: "public",
    access: "connected",
    surfaces: ["chat", "design", "automation"],
    capabilities: ALL_CODE_CAPABILITIES,
    defaultModelId: "claude-sonnet-4-6",
    modelIds: [],
    models: [
      {
        modelId: "claude-sonnet-4-6",
        visibleLabel: "Claude Sonnet 4.6",
        capabilities: ALL_CODE_CAPABILITIES,
        lifecycle: "active",
        retiresAt: null,
        replacementModelId: null,
        replacementVisibleLabel: null,
        migrationMode: null,
        isDefault: true,
      },
      {
        modelId: "claude-opus-4-7",
        visibleLabel: "Claude Opus 4.7",
        capabilities: ALL_CODE_CAPABILITIES,
        lifecycle: "beta",
        retiresAt: null,
        replacementModelId: null,
        replacementVisibleLabel: null,
        migrationMode: null,
        isDefault: false,
      },
      {
        modelId: "haiku",
        visibleLabel: "Haiku",
        capabilities: ALL_CODE_CAPABILITIES,
        lifecycle: "deprecated",
        retiresAt: null,
        replacementModelId: "claude-haiku-4-5",
        replacementVisibleLabel: "Claude Haiku 4.5",
        migrationMode: "manual",
        isDefault: false,
      },
    ],
  }),
  provider({
    providerId: "codex",
    visibleLabel: "Codex",
    discoveryState: "seeded",
    source: source("OpenAI/Codex seed snapshot from TerminalSync ai_provider_catalog.rs"),
    updatedAt: REAL_UPDATED_AT,
    channel: "public",
    access: "connected",
    surfaces: ["chat", "design", "image", "automation"],
    capabilities: [...ALL_CODE_CAPABILITIES, "image_generation"],
    defaultModelId: "gpt-5.6-terra",
    modelIds: [],
    models: [
      {
        modelId: "gpt-5.6-terra",
        visibleLabel: "GPT-5.6 Terra",
        capabilities: [...ALL_CODE_CAPABILITIES, "image_generation"],
        lifecycle: "active",
        retiresAt: null,
        replacementModelId: null,
        replacementVisibleLabel: null,
        migrationMode: null,
        isDefault: true,
      },
      {
        modelId: "gpt-5.5",
        visibleLabel: "GPT-5.5",
        capabilities: [...ALL_CODE_CAPABILITIES, "image_generation"],
        lifecycle: "beta",
        retiresAt: null,
        replacementModelId: null,
        replacementVisibleLabel: null,
        migrationMode: null,
        isDefault: false,
      },
      {
        modelId: "gpt-5.4",
        visibleLabel: "GPT-5.4",
        capabilities: [...ALL_CODE_CAPABILITIES, "image_generation"],
        lifecycle: "replacement_available",
        retiresAt: "2026-08-31",
        replacementModelId: "gpt-5.6-terra",
        replacementVisibleLabel: "GPT-5.6 Terra",
        migrationMode: "automatic",
        isDefault: false,
      },
      {
        modelId: "gpt-5.4-mini",
        visibleLabel: "GPT-5.4 Mini",
        capabilities: [...ALL_CODE_CAPABILITIES, "image_generation"],
        lifecycle: "active",
        retiresAt: null,
        replacementModelId: null,
        replacementVisibleLabel: null,
        migrationMode: null,
        isDefault: false,
      },
      {
        modelId: "gpt-image-2",
        visibleLabel: "GPT Image 2",
        capabilities: [...ALL_CODE_CAPABILITIES, "image_generation"],
        lifecycle: "active",
        retiresAt: null,
        replacementModelId: null,
        replacementVisibleLabel: null,
        migrationMode: null,
        isDefault: false,
      },
    ],
  }),
  provider({
    providerId: "gemini",
    visibleLabel: "Gemini",
    discoveryState: "discovered",
    source: source("Google Gemini provider API", "provider_api"),
    updatedAt: GEMINI_DISCOVERED_AT,
    channel: "public",
    access: "connected",
    surfaces: ["chat", "design", "image", "automation"],
    capabilities: [...ALL_CODE_CAPABILITIES, "image_generation"],
    defaultModelId: "gemini-2.5-pro",
    modelIds: [],
    models: [
      {
        modelId: "gemini-2.5-pro",
        visibleLabel: "Gemini 2.5 Pro",
        capabilities: [...ALL_CODE_CAPABILITIES, "image_generation"],
        lifecycle: "active",
        retiresAt: null,
        replacementModelId: null,
        replacementVisibleLabel: null,
        migrationMode: null,
        isDefault: true,
      },
      {
        modelId: "gemini-2.5-flash",
        visibleLabel: "Gemini 2.5 Flash",
        capabilities: [...ALL_CODE_CAPABILITIES, "image_generation"],
        lifecycle: "active",
        retiresAt: null,
        replacementModelId: null,
        replacementVisibleLabel: null,
        migrationMode: null,
        isDefault: false,
      },
      {
        modelId: "gemini-2.5-flash-lite",
        visibleLabel: "Gemini 2.5 Flash Lite",
        capabilities: [...ALL_CODE_CAPABILITIES, "image_generation"],
        lifecycle: "beta",
        retiresAt: null,
        replacementModelId: null,
        replacementVisibleLabel: null,
        migrationMode: null,
        isDefault: false,
      },
      {
        modelId: "gemini-2.5-flash-image",
        visibleLabel: "Gemini 2.5 Flash Image",
        capabilities: [...ALL_CODE_CAPABILITIES, "image_generation"],
        lifecycle: "active",
        retiresAt: null,
        replacementModelId: null,
        replacementVisibleLabel: null,
        migrationMode: null,
        isDefault: false,
      },
    ],
  }),
];

const managedEngines: ManagedEngineCatalogViewEntry[] = [
  {
    engineId: "ideogram",
    visibleLabel: "Ideogram",
    creditsProviderId: "ideogram",
    channel: "public",
    access: "requires_key",
    surfaces: ["image"],
    capabilities: ["image_generation"],
  },
  {
    engineId: "ts-video",
    visibleLabel: "TS Video",
    creditsProviderId: "wavespeed",
    channel: "public",
    access: "managed",
    surfaces: ["video"],
    capabilities: ["video_generation"],
  },
];

const SURFACE_ORDER: AiCatalogSurface[] = ["chat", "design", "image", "video", "automation"];

function surfaceView(surface: AiCatalogSurface): ProviderFirstCatalogView {
  return {
    audience: "internal",
    surface,
    connectedProviders: connectedProviders.filter((provider) => provider.surfaces.includes(surface)),
    managedEngines: managedEngines.filter((engine) => engine.surfaces.includes(surface)),
  };
}

export function getAiControlCenterSnapshot(): AiControlCenterSnapshot {
  const surfaceViews = SURFACE_ORDER.map(surfaceView);
  return {
    generatedAt: REAL_GENERATED_AT,
    catalogStatus: "fresh",
    refreshIntervalSecs: 21_600,
    lastRefreshedAt: REAL_UPDATED_AT,
    refreshDue: false,
    connectedProviders,
    managedEngines,
    composerView: surfaceViews.find((view) => view.surface === "chat")!,
    surfaceViews,
  };
}

export function getAiCenterAlerts(snapshot: AiControlCenterSnapshot = getAiControlCenterSnapshot()): AiCenterAlert[] {
  const alerts: AiCenterAlert[] = [];
  for (const provider of snapshot.connectedProviders) {
    if (provider.providerId === "gemini" && provider.discoveryState === "discovered") {
      alerts.push({
        kind: "new_model_detected",
        severity: "info",
        title: "Nuevo modelo Gemini detectado",
        detail: "Gemini 2.5 Flash Image aparece en detected_model_ids desde provider_api.",
        providerId: provider.providerId,
        modelId: "gemini-2.5-flash-image",
        owner: "Producto",
      });
      alerts.push({
        kind: "new_capability",
        severity: "info",
        title: "Capability nueva: image_generation en Gemini",
        detail: "El catálogo real reporta superficie Imagen disponible para Gemini; mantener gated por policy antes de publicarlo al cliente.",
        providerId: provider.providerId,
        modelId: "gemini-2.5-flash-image",
        owner: "Ingeniería",
      });
    }

    if (provider.providerId === "glm") {
      alerts.push({
        kind: "new_model_detected",
        severity: "info",
        title: "GLM-5.3 available",
        detail: "provider_id interno estable: glm. Label visible: TerminalSync / Z.ai.",
        providerId: provider.providerId,
        modelId: "glm-5.3",
        owner: "Producto",
      });
    }

    for (const model of provider.models) {
      if (model.retiresAt) {
        alerts.push({
          kind: "retiring_soon",
          severity: "warning",
          title: `${model.visibleLabel} retires on ${model.retiresAt}`,
          detail: model.replacementVisibleLabel
            ? `Replacement available: ${model.replacementVisibleLabel}.`
            : "No replacement configured yet.",
          providerId: provider.providerId,
          modelId: model.modelId,
          owner: "Producto",
        });
      }
      if (model.lifecycle === "replacement_available") {
        alerts.push({
          kind: "replacement_available",
          severity: "warning",
          title: `Replacement available for ${model.visibleLabel}`,
          detail: model.replacementVisibleLabel
            ? `${model.visibleLabel} should move to ${model.replacementVisibleLabel}.`
            : "Replacement flag exists but visible label is missing.",
          providerId: provider.providerId,
          modelId: model.modelId,
          owner: "Ingeniería",
        });
      }
      if (model.migrationMode === "automatic") {
        alerts.push({
          kind: "automatic_migration_scheduled",
          severity: "warning",
          title: `Cambio automático programado: ${model.visibleLabel}`,
          detail: `${model.modelId} migrará automáticamente a ${model.replacementModelId ?? "replacement"}.`,
          providerId: provider.providerId,
          modelId: model.modelId,
          owner: "Ops",
        });
      }
    }
  }

  if (snapshot.refreshDue || snapshot.catalogStatus === "refresh_due") {
    alerts.push({
      kind: "provider_degraded",
      severity: "critical",
      title: "Provider catalog refresh due",
      detail: "El catálogo necesita refresh; revisar scheduler del motor de IAs.",
      owner: "Ops",
    });
  }

  return alerts;
}

export function aiCenterStats(snapshot: AiControlCenterSnapshot = getAiControlCenterSnapshot()): AiCenterStats {
  const models = snapshot.connectedProviders.flatMap((p) => p.models);
  const publishedConnected = snapshot.connectedProviders.filter((p) => p.surfaces.length > 0).length;
  return {
    providers: snapshot.connectedProviders.length,
    managedEngines: snapshot.managedEngines.length,
    models: models.length,
    published: publishedConnected + snapshot.managedEngines.length,
    alerts: getAiCenterAlerts(snapshot).length,
  };
}

export function buildAiCenterPayload(options: {
  mode?: AiCenterPayloadMode;
  source?: AiCenterPayloadSource;
  snapshot?: unknown;
  alerts?: unknown;
  stats?: unknown;
  fallbackReason?: string;
} = {}): AiCenterPayload {
  const snapshot = isAiControlCenterSnapshot(options.snapshot)
    ? options.snapshot
    : getAiControlCenterSnapshot();
  const alerts = Array.isArray(options.alerts)
    ? (options.alerts as AiCenterAlert[])
    : getAiCenterAlerts(snapshot);
  const stats = isAiCenterStats(options.stats)
    ? options.stats
    : aiCenterStats(snapshot);

  return {
    snapshot,
    alerts,
    stats,
    generated_at: new Date().toISOString(),
    mode: options.mode ?? "fallback_local",
    source: options.source ?? "page_local_mirror",
    ...(options.fallbackReason ? { fallbackReason: options.fallbackReason } : {}),
  };
}

function isAiControlCenterSnapshot(value: unknown): value is AiControlCenterSnapshot {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<AiControlCenterSnapshot>;
  return Array.isArray(candidate.connectedProviders)
    && Array.isArray(candidate.managedEngines)
    && Array.isArray(candidate.surfaceViews)
    && typeof candidate.generatedAt === "number";
}

function isAiCenterStats(value: unknown): value is AiCenterStats {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<AiCenterStats>;
  return typeof candidate.providers === "number"
    && typeof candidate.managedEngines === "number"
    && typeof candidate.models === "number"
    && typeof candidate.published === "number"
    && typeof candidate.alerts === "number";
}
