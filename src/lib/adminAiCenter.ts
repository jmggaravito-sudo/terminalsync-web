// Internal Admin AI Center data adapter.
//
// Source of truth mirrored from TerminalSync merged PRs:
// - PR #1504: src-tauri/src/ai_provider_catalog.rs
// - PR #1522: src-tauri/src/ai_catalog_policy.rs
// - PR #1526: src-tauri/src/ai_control_center.rs
// - PR #1527: src/lib/aiCatalogPolicy.ts / composer provider-first wiring
// - PR #1534: lifecycle metadata
// - PR 8 (this one): internal_sources / change_report / alerts /
//   premium_lanes, mirrored from ai_catalog_lifecycle.rs (CatalogChangeAlert,
//   CatalogChangeReport) and ai_plan_policy.rs (PremiumLaneDefinition), plus
//   the upstream_provider_slug/modalities/pricing fields ai_provider_catalog.rs
//   added to ProviderCatalogModelEntry for internal-source (OpenRouter) models.
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

/** Mirrors `ProviderCatalogModelPricing` (ai_provider_catalog.rs). Populated
 *  only for internal-source (OpenRouter) models discovered from the live
 *  provider API — the seed data ships with `null` until a real fetch runs. */
export interface ProviderCatalogModelPricing {
  prompt: string | null;
  completion: string | null;
  image: string | null;
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
  /** Upstream vendor slug behind an aggregator model id (e.g. "openai" for
   *  `openai/gpt-5.6-terra` on OpenRouter). `null` for direct-provider models. */
  upstreamProviderSlug: string | null;
  /** Input/output modalities the model supports (e.g. ["text"], ["text", "image"]). */
  modalities: string[];
  pricing: ProviderCatalogModelPricing | null;
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

// ---- Real change-detection types (mirrors ai_catalog_lifecycle.rs) --------
//
// These are DETECTION-only, produced by diffing the current provider catalog
// against the last persisted snapshot. They never publish anything to the
// client on their own — see the module doc comment in ai_catalog_lifecycle.rs.

export type CatalogAlertKind =
  | "new_model_detected"
  | "upcoming_retirement"
  | "replacement_available"
  | "scheduled_auto_switch"
  | "new_capability";

export type CatalogAlertSeverity = "info" | "warning" | "critical";

export interface CatalogChangeAlert {
  kind: CatalogAlertKind;
  severity: CatalogAlertSeverity;
  providerId: string;
  modelId: string | null;
  visibleLabel: string | null;
  /** Plain-Spanish explanation, no jargon — meant to be shown as-is. */
  detail: string;
  retiresAt: string | null;
  replacementModelId: string | null;
}

export interface DetectedModel {
  providerId: string;
  modelId: string;
  visibleLabel: string;
  lifecycle: AiCatalogModelLifecycleState;
}

export interface RetirementNotice {
  providerId: string;
  modelId: string;
  visibleLabel: string;
  retiresAt: string | null;
  replacementModelId: string | null;
}

export interface ReplacementCandidate {
  providerId: string;
  modelId: string;
  replacementModelId: string;
  replacementVisibleLabel: string | null;
  migrationMode: AiCatalogMigrationMode | null;
}

export interface ScheduledAutoSwitch {
  providerId: string;
  fromModelId: string;
  toModelId: string;
  switchAt: string | null;
}

export interface NewCapabilityEntry {
  providerId: string;
  capability: string;
}

export interface CatalogChangeReport {
  generatedAt: number;
  comparedAgainstUpdatedAt: number | null;
  detectedModels: DetectedModel[];
  retirements: RetirementNotice[];
  replacementCandidates: ReplacementCandidate[];
  scheduledAutoSwitches: ScheduledAutoSwitch[];
  newCapabilities: NewCapabilityEntry[];
  alerts: CatalogChangeAlert[];
}

// ---- Commercial policy types (mirrors ai_plan_policy.rs) -------------------

/** How a surface's usage is billed under a plan — `EntitlementClass` in Rust. */
export type AiCatalogEntitlementClass = "included" | "courtesy" | "credits" | "premium";

/** A premium, credits-billed lane sitting outside the flat plan (Ideogram for
 *  image, TS Video for video). Product configuration, not a per-tenant
 *  routing decision — every audience sees the same registry. */
export interface PremiumLaneDefinition {
  engineId: string;
  creditsProviderId: string;
  surface: AiCatalogSurface;
  visibleLabel: string;
  billing: AiCatalogEntitlementClass;
  /** Plain-Spanish use cases, no jargon — meant to be shown as chips. */
  bestFor: string[];
  /** Plain-Spanish upsell copy — no internal routing jargon. */
  upsellDetail: string;
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
  /** Admin-only catalog data sources (e.g. OpenRouter) — never a client-facing
   *  AI choice. Empty for audiences below `internal`. */
  internalSources: ProviderCatalogViewEntry[];
  /** Full lifecycle-change report diffed against the last persisted catalog
   *  snapshot. Detection only — see `CatalogChangeReport` above. */
  changeReport: CatalogChangeReport;
  /** Same alerts as `changeReport.alerts`, duplicated here for direct
   *  frontend access without reaching into the nested report. */
  alerts: CatalogChangeAlert[];
  /** Always the full `premium_lane_registry()`, for every audience. */
  premiumLanes: PremiumLaneDefinition[];
}

// ---- Local-only alert shape (payload-level, used by the Alerts tab) -------
//
// A superset of `CatalogChangeAlert`: any real alert from the engine is a
// valid `AiCenterAlert` as-is. `title`/`owner` are extra fields this local
// heuristic (see `buildLocalFallbackAlerts` below) adds for display when
// there's no live engine to ask.

export type AiCenterAlertKind = CatalogAlertKind | "provider_degraded";

export interface AiCenterAlert {
  kind: AiCenterAlertKind;
  severity: CatalogAlertSeverity;
  providerId?: string;
  modelId?: string | null;
  visibleLabel?: string | null;
  detail: string;
  retiresAt?: string | null;
  replacementModelId?: string | null;
  title?: string;
  owner?: "Producto" | "Ingeniería" | "Ops";
}

export interface AiCenterStats {
  providers: number;
  managedEngines: number;
  models: number;
  published: number;
  alerts: number;
}

export type AiCenterPayloadMode = "live" | "fallback_local";
export type AiCenterPayloadSource = "terminalsync_ai_center_url" | "page_local_mirror";

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
const GPT_5_4_RETIRES_AT = "2026-08-31";

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
        upstreamProviderSlug: null,
        modalities: [],
        pricing: null,
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
        upstreamProviderSlug: null,
        modalities: [],
        pricing: null,
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
        upstreamProviderSlug: null,
        modalities: [],
        pricing: null,
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
        upstreamProviderSlug: null,
        modalities: [],
        pricing: null,
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
        upstreamProviderSlug: null,
        modalities: [],
        pricing: null,
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
        upstreamProviderSlug: null,
        modalities: [],
        pricing: null,
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
        upstreamProviderSlug: null,
        modalities: [],
        pricing: null,
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
        upstreamProviderSlug: null,
        modalities: [],
        pricing: null,
      },
      {
        modelId: "gpt-5.4",
        visibleLabel: "GPT-5.4",
        capabilities: [...ALL_CODE_CAPABILITIES, "image_generation"],
        lifecycle: "replacement_available",
        retiresAt: GPT_5_4_RETIRES_AT,
        replacementModelId: "gpt-5.6-terra",
        replacementVisibleLabel: "GPT-5.6 Terra",
        migrationMode: "automatic",
        isDefault: false,
        upstreamProviderSlug: null,
        modalities: [],
        pricing: null,
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
        upstreamProviderSlug: null,
        modalities: [],
        pricing: null,
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
        upstreamProviderSlug: null,
        modalities: [],
        pricing: null,
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
        upstreamProviderSlug: null,
        modalities: [],
        pricing: null,
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
        upstreamProviderSlug: null,
        modalities: [],
        pricing: null,
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
        upstreamProviderSlug: null,
        modalities: [],
        pricing: null,
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
        upstreamProviderSlug: null,
        modalities: [],
        pricing: null,
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

// OpenRouter is the sole `internal_source_catalog_backends()` entry
// (ai_provider_catalog.rs). It is a data source for the admin AI Control
// Center only — never an `AiProviderId`, never client-facing. Model list
// mirrors `seed_openrouter_model_entries()` verbatim (model_id, visible
// label, upstream_provider_slug, modalities, lifecycle/replacement wiring
// for gpt-5.4). `pricing` is `null` on every real seed model too — the seed
// only turns into priced entries after a live OpenRouter fetch normalizes
// `pricing` from the API response (see `openrouter_pricing()`). The one
// exception below (FLUX) carries illustrative sample pricing, called out
// explicitly, purely so the admin UI has a populated shape to render.
const openRouterModels: ProviderCatalogModelEntry[] = [
  {
    modelId: "openai/gpt-5.6-terra",
    visibleLabel: "GPT-5.6 Terra",
    capabilities: ["chat"],
    lifecycle: "active",
    retiresAt: null,
    replacementModelId: null,
    replacementVisibleLabel: null,
    migrationMode: null,
    isDefault: false,
    upstreamProviderSlug: "openai",
    modalities: ["text"],
    pricing: null,
  },
  {
    modelId: "openai/gpt-5.4",
    visibleLabel: "GPT-5.4",
    capabilities: ["chat"],
    lifecycle: "replacement_available",
    retiresAt: GPT_5_4_RETIRES_AT,
    replacementModelId: "openai/gpt-5.6-terra",
    replacementVisibleLabel: "GPT-5.6 Terra",
    migrationMode: "automatic",
    isDefault: false,
    upstreamProviderSlug: "openai",
    modalities: ["text"],
    pricing: null,
  },
  {
    modelId: "anthropic/claude-sonnet-4.6",
    visibleLabel: "Claude Sonnet 4.6",
    capabilities: ["chat"],
    lifecycle: "active",
    retiresAt: null,
    replacementModelId: null,
    replacementVisibleLabel: null,
    migrationMode: null,
    isDefault: false,
    upstreamProviderSlug: "anthropic",
    modalities: ["text"],
    pricing: null,
  },
  {
    modelId: "google/gemini-2.5-pro",
    visibleLabel: "Gemini 2.5 Pro",
    capabilities: ["chat"],
    lifecycle: "active",
    retiresAt: null,
    replacementModelId: null,
    replacementVisibleLabel: null,
    migrationMode: null,
    isDefault: false,
    upstreamProviderSlug: "google",
    modalities: ["text"],
    pricing: null,
  },
  {
    modelId: "z-ai/glm-5.3",
    visibleLabel: "GLM-5.3",
    capabilities: ["chat"],
    lifecycle: "active",
    retiresAt: null,
    replacementModelId: null,
    replacementVisibleLabel: null,
    migrationMode: null,
    isDefault: true,
    upstreamProviderSlug: "z-ai",
    modalities: ["text"],
    pricing: null,
  },
  {
    modelId: "black-forest-labs/flux-1.1-pro",
    visibleLabel: "FLUX 1.1 Pro",
    capabilities: ["image_generation"],
    lifecycle: "active",
    retiresAt: null,
    replacementModelId: null,
    replacementVisibleLabel: null,
    migrationMode: null,
    isDefault: false,
    upstreamProviderSlug: "black-forest-labs",
    modalities: ["text", "image"],
    // Illustrative sample only (see the block comment above `openRouterModels`).
    pricing: { prompt: "0.00004", completion: "0.00004", image: "0.055" },
  },
];

const internalSources: ProviderCatalogViewEntry[] = [
  provider({
    providerId: "openrouter",
    visibleLabel: "OpenRouter (fuente interna)",
    discoveryState: "seeded",
    source: source("OpenRouter Models API seed snapshot"),
    updatedAt: REAL_UPDATED_AT,
    channel: "internal",
    access: "managed",
    surfaces: ["chat", "image"],
    capabilities: ["chat", "image_generation"],
    defaultModelId: "z-ai/glm-5.3",
    modelIds: [],
    models: openRouterModels,
  }),
];

// Mirrors `premium_lane_registry()` (ai_plan_policy.rs) exactly — engine_id,
// credits_provider_id, best_for and upsell_detail copy included verbatim.
const premiumLanes: PremiumLaneDefinition[] = [
  {
    engineId: "ideogram",
    creditsProviderId: "ideogram",
    surface: "image",
    visibleLabel: "Ideogram",
    billing: "credits",
    bestFor: ["publicidad", "posts para redes", "imágenes con texto", "piezas de marca"],
    upsellDetail:
      "Con créditos o un plan superior puedes usar Ideogram para tus imágenes: es el que mejor resuelve piezas de marca, texto dentro de la imagen y contenido para publicidad o redes.",
  },
  {
    engineId: "ts-video",
    creditsProviderId: "wavespeed",
    surface: "video",
    visibleLabel: "TS Video",
    billing: "credits",
    bestFor: ["videos cortos", "anuncios con movimiento", "promos", "animaciones"],
    upsellDetail:
      "Con créditos o un plan superior puedes generar video con TS Video: pensado para videos cortos, promos y anuncios con movimiento.",
  },
];

// Mirrors what `diff_catalog_snapshots(previous: None, current, generated_at)`
// (ai_catalog_lifecycle.rs) produces on a real first launch: no previous
// snapshot to diff against, so `detectedModels`/`newCapabilities` stay empty
// (see `snapshot_without_previous_surfaces_gpt_54_lifecycle_alerts_but_no_new_model_alerts`
// in ai_control_center.rs's own test suite), while gpt-5.4's retirement/
// replacement/scheduled-switch findings surface unconditionally since those
// don't need a previous snapshot to be meaningful.
const gpt54Alerts: CatalogChangeAlert[] = [
  {
    kind: "upcoming_retirement",
    // Mirrors the engine's `retirement_severity()` formula: 8 days out from
    // REAL_GENERATED_AT is inside the 30-day window, so this is Critical.
    severity: "critical",
    providerId: "codex",
    modelId: "gpt-5.4",
    visibleLabel: "GPT-5.4",
    detail: `GPT-5.4 se retira el ${GPT_5_4_RETIRES_AT}; el reemplazo sugerido es GPT-5.6 Terra.`,
    retiresAt: GPT_5_4_RETIRES_AT,
    replacementModelId: "gpt-5.6-terra",
  },
  {
    kind: "replacement_available",
    severity: "info",
    providerId: "codex",
    modelId: "gpt-5.4",
    visibleLabel: "GPT-5.4",
    detail: "Hay un reemplazo disponible para GPT-5.4: GPT-5.6 Terra.",
    retiresAt: GPT_5_4_RETIRES_AT,
    replacementModelId: "gpt-5.6-terra",
  },
  {
    kind: "scheduled_auto_switch",
    severity: "warning",
    providerId: "codex",
    modelId: "gpt-5.4",
    visibleLabel: "GPT-5.4",
    detail: `Cambio automático programado: GPT-5.4 pasará a GPT-5.6 Terra el ${GPT_5_4_RETIRES_AT}.`,
    retiresAt: GPT_5_4_RETIRES_AT,
    replacementModelId: "gpt-5.6-terra",
  },
];

const changeReport: CatalogChangeReport = {
  generatedAt: REAL_GENERATED_AT,
  comparedAgainstUpdatedAt: null,
  detectedModels: [],
  retirements: [
    {
      providerId: "codex",
      modelId: "gpt-5.4",
      visibleLabel: "GPT-5.4",
      retiresAt: GPT_5_4_RETIRES_AT,
      replacementModelId: "gpt-5.6-terra",
    },
  ],
  replacementCandidates: [
    {
      providerId: "codex",
      modelId: "gpt-5.4",
      replacementModelId: "gpt-5.6-terra",
      replacementVisibleLabel: "GPT-5.6 Terra",
      migrationMode: "automatic",
    },
  ],
  scheduledAutoSwitches: [
    {
      providerId: "codex",
      fromModelId: "gpt-5.4",
      toModelId: "gpt-5.6-terra",
      switchAt: GPT_5_4_RETIRES_AT,
    },
  ],
  newCapabilities: [],
  alerts: gpt54Alerts,
};

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
    internalSources,
    changeReport,
    alerts: changeReport.alerts,
    premiumLanes,
  };
}

/**
 * LOCAL FALLBACK ONLY. Synthesizes alerts straight from a snapshot's
 * `models[]` when there is no real `snapshot.alerts`/`changeReport` to show —
 * i.e. `mode: "fallback_local"` (no live engine reachable), or a live payload
 * from an app version that predates `alerts`/`changeReport` on the wire. The
 * real engine (ai_catalog_lifecycle.rs) computes these by diffing against the
 * previously persisted catalog; this function has no such history, so it
 * re-derives an approximation from the current snapshot alone. Prefer
 * `snapshot.alerts` (or `snapshot.changeReport.alerts`, identical) whenever
 * it is non-empty — see `resolveAlerts` below.
 */
export function buildLocalFallbackAlerts(
  snapshot: AiControlCenterSnapshot = getAiControlCenterSnapshot(),
): AiCenterAlert[] {
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
          kind: "upcoming_retirement",
          severity: "warning",
          title: `${model.visibleLabel} retires on ${model.retiresAt}`,
          detail: model.replacementVisibleLabel
            ? `Replacement available: ${model.replacementVisibleLabel}.`
            : "No replacement configured yet.",
          providerId: provider.providerId,
          modelId: model.modelId,
          visibleLabel: model.visibleLabel,
          retiresAt: model.retiresAt,
          replacementModelId: model.replacementModelId,
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
          visibleLabel: model.visibleLabel,
          replacementModelId: model.replacementModelId,
          owner: "Ingeniería",
        });
      }
      if (model.migrationMode === "automatic") {
        alerts.push({
          kind: "scheduled_auto_switch",
          severity: "warning",
          title: `Cambio automático programado: ${model.visibleLabel}`,
          detail: `${model.modelId} migrará automáticamente a ${model.replacementModelId ?? "replacement"}.`,
          providerId: provider.providerId,
          modelId: model.modelId,
          visibleLabel: model.visibleLabel,
          replacementModelId: model.replacementModelId,
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

/** Real alerts when the snapshot carries them, local heuristic otherwise. */
function resolveAlerts(snapshot: AiControlCenterSnapshot, explicit?: unknown): AiCenterAlert[] {
  if (Array.isArray(explicit)) return explicit as AiCenterAlert[];
  return snapshot.alerts.length > 0 ? snapshot.alerts : buildLocalFallbackAlerts(snapshot);
}

export function aiCenterStats(
  snapshot: AiControlCenterSnapshot = getAiControlCenterSnapshot(),
  alerts?: AiCenterAlert[],
): AiCenterStats {
  const models = snapshot.connectedProviders.flatMap((p) => p.models);
  const publishedConnected = snapshot.connectedProviders.filter((p) => p.surfaces.length > 0).length;
  return {
    providers: snapshot.connectedProviders.length,
    managedEngines: snapshot.managedEngines.length,
    models: models.length,
    published: publishedConnected + snapshot.managedEngines.length,
    alerts: (alerts ?? resolveAlerts(snapshot)).length,
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
    ? normalizeSnapshot(options.snapshot)
    : getAiControlCenterSnapshot();
  const alerts = resolveAlerts(snapshot, options.alerts);
  const stats = isAiCenterStats(options.stats)
    ? options.stats
    : aiCenterStats(snapshot, alerts);

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

export function isAiControlCenterSnapshot(value: unknown): value is AiControlCenterSnapshot {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<AiControlCenterSnapshot>;
  return Array.isArray(candidate.connectedProviders)
    && Array.isArray(candidate.managedEngines)
    && Array.isArray(candidate.surfaceViews)
    && typeof candidate.generatedAt === "number";
}

export function isAiCenterStats(value: unknown): value is AiCenterStats {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<AiCenterStats>;
  return typeof candidate.providers === "number"
    && typeof candidate.managedEngines === "number"
    && typeof candidate.models === "number"
    && typeof candidate.published === "number"
    && typeof candidate.alerts === "number";
}

// ---- Tolerant normalization -------------------------------------------
//
// `normalizeSnapshot` takes a value already gated by `isAiControlCenterSnapshot`
// (so the 4 "core" fields are known to be present) and fills safe defaults
// ([] / null) for every field this PR added, so a payload from an older app
// version — or a hand-wrapped `{ snapshot, alerts, stats }` — never crashes
// the admin UI on a missing key.

function normalizeModelEntry(model: unknown): ProviderCatalogModelEntry {
  const raw = (model && typeof model === "object" ? model : {}) as Partial<ProviderCatalogModelEntry>;
  return {
    modelId: typeof raw.modelId === "string" ? raw.modelId : "",
    visibleLabel: typeof raw.visibleLabel === "string" ? raw.visibleLabel : "",
    capabilities: Array.isArray(raw.capabilities) ? raw.capabilities : [],
    lifecycle: raw.lifecycle ?? "active",
    retiresAt: raw.retiresAt ?? null,
    replacementModelId: raw.replacementModelId ?? null,
    replacementVisibleLabel: raw.replacementVisibleLabel ?? null,
    migrationMode: raw.migrationMode ?? null,
    isDefault: Boolean(raw.isDefault),
    upstreamProviderSlug: raw.upstreamProviderSlug ?? null,
    modalities: Array.isArray(raw.modalities) ? raw.modalities : [],
    pricing: raw.pricing ?? null,
  };
}

function normalizeProviderEntry(entry: unknown): ProviderCatalogViewEntry {
  const raw = (entry && typeof entry === "object" ? entry : {}) as Partial<ProviderCatalogViewEntry>;
  const models = Array.isArray(raw.models) ? raw.models.map(normalizeModelEntry) : [];
  return {
    providerId: typeof raw.providerId === "string" ? raw.providerId : "",
    visibleLabel: typeof raw.visibleLabel === "string" ? raw.visibleLabel : "",
    discoveryState: raw.discoveryState ?? "seeded",
    source: raw.source ?? { kind: "seed_snapshot", label: "", endpoint: null },
    updatedAt: typeof raw.updatedAt === "number" ? raw.updatedAt : 0,
    channel: raw.channel ?? "public",
    access: raw.access ?? "connected",
    surfaces: Array.isArray(raw.surfaces) ? raw.surfaces : [],
    capabilities: Array.isArray(raw.capabilities) ? raw.capabilities : [],
    defaultModelId: raw.defaultModelId ?? null,
    modelIds: Array.isArray(raw.modelIds) ? raw.modelIds : models.map((m) => m.modelId),
    models,
    lifecycleSummary: raw.lifecycleSummary ?? summarizeLifecycle(models),
  };
}

function normalizeProviderEntries(list: unknown): ProviderCatalogViewEntry[] {
  return Array.isArray(list) ? list.map(normalizeProviderEntry) : [];
}

function normalizeProviderFirstView(view: unknown): ProviderFirstCatalogView {
  const raw = (view && typeof view === "object" ? view : {}) as Partial<ProviderFirstCatalogView>;
  return {
    audience: raw.audience ?? "internal",
    surface: raw.surface ?? "chat",
    connectedProviders: normalizeProviderEntries(raw.connectedProviders),
    managedEngines: Array.isArray(raw.managedEngines) ? raw.managedEngines : [],
  };
}

function normalizeChangeReport(raw: unknown): CatalogChangeReport {
  const r = (raw && typeof raw === "object" ? raw : {}) as Partial<CatalogChangeReport>;
  return {
    generatedAt: typeof r.generatedAt === "number" ? r.generatedAt : Date.now(),
    comparedAgainstUpdatedAt: typeof r.comparedAgainstUpdatedAt === "number" ? r.comparedAgainstUpdatedAt : null,
    detectedModels: Array.isArray(r.detectedModels) ? r.detectedModels : [],
    retirements: Array.isArray(r.retirements) ? r.retirements : [],
    replacementCandidates: Array.isArray(r.replacementCandidates) ? r.replacementCandidates : [],
    scheduledAutoSwitches: Array.isArray(r.scheduledAutoSwitches) ? r.scheduledAutoSwitches : [],
    newCapabilities: Array.isArray(r.newCapabilities) ? r.newCapabilities : [],
    alerts: Array.isArray(r.alerts) ? r.alerts : [],
  };
}

export function normalizeSnapshot(json: unknown): AiControlCenterSnapshot {
  const raw = (json && typeof json === "object" ? json : {}) as Partial<AiControlCenterSnapshot> & Record<string, unknown>;
  return {
    generatedAt: typeof raw.generatedAt === "number" ? raw.generatedAt : Date.now(),
    catalogStatus: raw.catalogStatus ?? "fresh",
    refreshIntervalSecs: typeof raw.refreshIntervalSecs === "number" ? raw.refreshIntervalSecs : 0,
    lastRefreshedAt: typeof raw.lastRefreshedAt === "number" ? raw.lastRefreshedAt : null,
    refreshDue: Boolean(raw.refreshDue),
    connectedProviders: normalizeProviderEntries(raw.connectedProviders),
    managedEngines: Array.isArray(raw.managedEngines) ? (raw.managedEngines as ManagedEngineCatalogViewEntry[]) : [],
    composerView: normalizeProviderFirstView(raw.composerView),
    surfaceViews: Array.isArray(raw.surfaceViews) ? raw.surfaceViews.map(normalizeProviderFirstView) : [],
    internalSources: normalizeProviderEntries(raw.internalSources),
    changeReport: normalizeChangeReport(raw.changeReport),
    alerts: Array.isArray(raw.alerts) ? (raw.alerts as CatalogChangeAlert[]) : [],
    premiumLanes: Array.isArray(raw.premiumLanes) ? (raw.premiumLanes as PremiumLaneDefinition[]) : [],
  };
}
