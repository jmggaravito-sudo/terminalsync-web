export type AiCenterLifecycle =
  | "active"
  | "beta"
  | "deprecated"
  | "retiring_soon"
  | "retired";

export type AiCenterSurface = "chat" | "image" | "video" | "automation";

export interface AiCenterModel {
  /** Internal slug. Keep out of client-facing UI; admin surfaces may use it only as a React key. */
  id: string;
  publicName: string;
  lifecycle: AiCenterLifecycle;
  replacementId?: string;
  notes: string;
  surfaces: Record<AiCenterSurface, boolean>;
  source: "extension-proxy" | "hosted-key" | "manual-seed" | "policy-snapshot";
}

export interface AiCenterProvider {
  /** Internal provider id. Keep out of client-facing UI. */
  id: string;
  publicName: string;
  family: string;
  lifecycle: AiCenterLifecycle;
  source: "extension-proxy" | "hosted-key" | "manual-seed" | "policy-snapshot";
  models: AiCenterModel[];
}

export interface AiCenterAlert {
  severity: "info" | "warning" | "critical";
  title: string;
  detail: string;
  owner: "Producto" | "Ingeniería" | "Ops";
}

export const AI_CENTER_SURFACES: { key: AiCenterSurface; es: string; en: string }[] = [
  { key: "chat", es: "Chat", en: "Chat" },
  { key: "image", es: "Imagen", en: "Image" },
  { key: "video", es: "Video", en: "Video" },
  { key: "automation", es: "Automatización", en: "Automation" },
];

/**
 * Phase-1 internal admin snapshot.
 *
 * This is intentionally NOT exported to public catalog/landing routes. It mirrors
 * the provider families currently supported by the web extension proxy and keeps
 * publication policy separate from client-facing labels. The next step is to
 * replace/augment this seed with the provider/model discovery snapshot once that
 * engine lands in this repo's main branch.
 */
export const AI_CENTER_PROVIDERS: AiCenterProvider[] = [
  {
    id: "openai",
    publicName: "OpenAI",
    family: "OpenAI",
    lifecycle: "active",
    source: "extension-proxy",
    models: [
      {
        id: "openai-primary-chat",
        publicName: "OpenAI · Chat principal",
        lifecycle: "active",
        notes: "Modelo recomendado para conversaciones generales y asistencia operativa.",
        source: "policy-snapshot",
        surfaces: { chat: true, image: false, video: false, automation: true },
      },
      {
        id: "openai-image",
        publicName: "OpenAI · Imagen",
        lifecycle: "beta",
        notes: "Disponible como candidato interno; publicar en cliente solo detrás de policy por superficie.",
        source: "manual-seed",
        surfaces: { chat: false, image: false, video: false, automation: false },
      },
    ],
  },
  {
    id: "anthropic",
    publicName: "Claude",
    family: "Anthropic",
    lifecycle: "active",
    source: "extension-proxy",
    models: [
      {
        id: "claude-primary-chat",
        publicName: "Claude · Chat principal",
        lifecycle: "active",
        notes: "Apto para chat y automatizaciones con razonamiento largo.",
        source: "policy-snapshot",
        surfaces: { chat: true, image: false, video: false, automation: true },
      },
      {
        id: "claude-legacy-chat",
        publicName: "Claude · Legacy",
        lifecycle: "deprecated",
        replacementId: "claude-primary-chat",
        notes: "Mantener solo para compatibilidad interna; no publicar como opción nueva.",
        source: "manual-seed",
        surfaces: { chat: false, image: false, video: false, automation: false },
      },
    ],
  },
  {
    id: "gemini",
    publicName: "Gemini",
    family: "Google",
    lifecycle: "active",
    source: "extension-proxy",
    models: [
      {
        id: "gemini-primary-chat",
        publicName: "Gemini · Chat principal",
        lifecycle: "active",
        notes: "Útil para chat multimodal y tareas de alto volumen cuando policy lo permita.",
        source: "policy-snapshot",
        surfaces: { chat: true, image: false, video: false, automation: true },
      },
      {
        id: "gemini-retiring-candidate",
        publicName: "Gemini · Modelo anterior",
        lifecycle: "retiring_soon",
        replacementId: "gemini-primary-chat",
        notes: "Candidato a retiro: mantener alerta visible antes de removerlo.",
        source: "manual-seed",
        surfaces: { chat: false, image: false, video: false, automation: false },
      },
    ],
  },
  {
    id: "ideogram",
    publicName: "Ideogram",
    family: "Imagen",
    lifecycle: "beta",
    source: "manual-seed",
    models: [
      {
        id: "ideogram-image-recommended",
        publicName: "Ideogram · Imagen comercial",
        lifecycle: "beta",
        notes: "Candidato recomendado para piezas comerciales con texto; publicar solo en superficie Imagen.",
        source: "manual-seed",
        surfaces: { chat: false, image: true, video: false, automation: false },
      },
    ],
  },
  {
    id: "legacy-video-provider",
    publicName: "Video legacy",
    family: "Video",
    lifecycle: "retired",
    source: "manual-seed",
    models: [
      {
        id: "legacy-video-model",
        publicName: "Video · Retirado",
        lifecycle: "retired",
        notes: "Placeholder interno para que el Centro muestre retirados sin exponerlos al cliente.",
        source: "manual-seed",
        surfaces: { chat: false, image: false, video: false, automation: false },
      },
    ],
  },
];

export function getAiCenterAlerts(): AiCenterAlert[] {
  const alerts: AiCenterAlert[] = [];
  for (const provider of AI_CENTER_PROVIDERS) {
    for (const model of provider.models) {
      if (model.lifecycle === "retiring_soon") {
        alerts.push({
          severity: "warning",
          title: `${model.publicName}: retiro próximo`,
          detail: model.replacementId
            ? "Tiene reemplazo asignado. Revisar superficies antes de apagarlo."
            : "No tiene reemplazo asignado todavía.",
          owner: "Producto",
        });
      }
      if (model.lifecycle === "deprecated") {
        alerts.push({
          severity: "info",
          title: `${model.publicName}: deprecado`,
          detail: "No debería publicarse para usuarios nuevos.",
          owner: "Ingeniería",
        });
      }
      if (model.lifecycle === "retired" && Object.values(model.surfaces).some(Boolean)) {
        alerts.push({
          severity: "critical",
          title: `${model.publicName}: retirado pero publicado`,
          detail: "Apagar inmediatamente en policy de publicación.",
          owner: "Ops",
        });
      }
    }
  }

  alerts.push({
    severity: "info",
    title: "Fase 1 conectada como panel interno",
    detail: "La fuente actual es snapshot/policy interna. Cuando el motor de discovery llegue a main, esta página debe leer su snapshot productivo.",
    owner: "Ingeniería",
  });

  return alerts;
}

export function aiCenterStats() {
  const models = AI_CENTER_PROVIDERS.flatMap((p) => p.models);
  return {
    providers: AI_CENTER_PROVIDERS.length,
    models: models.length,
    published: models.filter((m) => Object.values(m.surfaces).some(Boolean)).length,
    alerts: getAiCenterAlerts().length,
  };
}
