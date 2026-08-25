"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { authedFetch } from "@/lib/supabase/browser";
import {
  AI_CENTER_SURFACES,
  buildAiCenterPayload,
  type AiAdminSurface,
  type AiCatalogEntitlementClass,
  type AiCatalogModelLifecycleState,
  type AiCatalogPromotionChannel,
  type AiCatalogSurface,
  type AiCenterAlert,
  type AiCenterAlertKind,
  type AiCenterPayload,
  type AiControlCenterSnapshot,
  type CatalogAlertSeverity,
  type CatalogChangeReport,
  type PremiumLaneDefinition,
  type ProviderCatalogModelEntry,
  type ProviderCatalogViewEntry,
} from "@/lib/adminAiCenter";

const TABS = [
  { key: "catalog", es: "Catálogo", en: "Catalog" },
  { key: "publishing", es: "Publicación", en: "Publishing" },
  { key: "alerts", es: "Alertas", en: "Alerts" },
  { key: "lanes", es: "Planes y lanes", en: "Plans & lanes" },
  { key: "changes", es: "Cambios recientes", en: "Recent changes" },
  { key: "routing", es: "Routing", en: "Routing" },
  { key: "review", es: "Pendientes", en: "Review queue" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function isTabKey(value: string | undefined): value is TabKey {
  return TABS.some((tab) => tab.key === value);
}

const lifecycleCopy: Record<AiCatalogModelLifecycleState, { es: string; en: string; className: string }> = {
  active: { es: "Activo", en: "Active", className: "border-emerald-700 bg-emerald-50 text-emerald-900" },
  beta: { es: "Beta", en: "Beta", className: "border-sky-700 bg-sky-50 text-sky-900" },
  deprecated: { es: "Deprecado", en: "Deprecated", className: "border-amber-700 bg-amber-50 text-amber-900" },
  replacement_available: { es: "Replacement available", en: "Replacement available", className: "border-orange-700 bg-orange-50 text-orange-900" },
  retired: { es: "Retirado", en: "Retired", className: "border-zinc-700 bg-zinc-100 text-zinc-900" },
};

const channelCopy: Record<AiCatalogPromotionChannel, string> = {
  internal: "internal",
  beta: "beta",
  public: "public",
};

const alertKindCopy: Record<AiCenterAlertKind, { es: string; en: string }> = {
  new_model_detected: { es: "Modelo nuevo detectado", en: "New model detected" },
  upcoming_retirement: { es: "Retiro próximo", en: "Upcoming retirement" },
  replacement_available: { es: "Reemplazo disponible", en: "Replacement available" },
  scheduled_auto_switch: { es: "Cambio automático programado", en: "Scheduled auto-switch" },
  new_capability: { es: "Capacidad nueva", en: "New capability" },
  provider_degraded: { es: "Catálogo desactualizado", en: "Catalog degraded" },
};

const entitlementCopy: Record<AiCatalogEntitlementClass, { es: string; en: string }> = {
  included: { es: "Incluido", en: "Included" },
  courtesy: { es: "Cortesía", en: "Courtesy" },
  credits: { es: "Créditos", en: "Credits" },
  premium: { es: "Premium", en: "Premium" },
};

const surfaceLabel: Record<AiCatalogSurface, { es: string; en: string }> = {
  chat: { es: "Chat", en: "Chat" },
  design: { es: "Diseño", en: "Design" },
  image: { es: "Imagen", en: "Image" },
  video: { es: "Video", en: "Video" },
  automation: { es: "Automatización", en: "Automation" },
};

/** Mirrors `ai_plan_policy.rs`'s `base15_entitlement()` — informative only,
 *  the real gate lives in the engine. Kept local to this tab; it is not
 *  part of any live snapshot data. */
const BASE_PLAN_MATRIX: {
  surface: AiCatalogSurface;
  es: string;
  en: string;
  className: string;
}[] = [
  { surface: "chat", es: "Incluido", en: "Included", className: "border-emerald-700 bg-emerald-50 text-emerald-900" },
  { surface: "design", es: "Incluido", en: "Included", className: "border-emerald-700 bg-emerald-50 text-emerald-900" },
  { surface: "image", es: "Cortesía acotada (tope 30/mes)", en: "Bounded courtesy (30/mo soft cap)", className: "border-amber-700 bg-amber-50 text-amber-900" },
  { surface: "video", es: "Premium siempre (nunca incluido)", en: "Always premium (never included)", className: "border-red-800 bg-red-50 text-red-950" },
  { surface: "automation", es: "Incluido", en: "Included", className: "border-emerald-700 bg-emerald-50 text-emerald-900" },
];

function LifecycleBadge({ lifecycle, isEs }: { lifecycle: AiCatalogModelLifecycleState; isEs: boolean }) {
  const c = lifecycleCopy[lifecycle];
  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${c.className}`}>
      {isEs ? c.es : c.en}
    </span>
  );
}

function CodePill({ children }: { children: ReactNode }) {
  return <code className="rounded-md border border-black bg-white px-1.5 py-0.5 text-[11px] font-semibold text-black">{children}</code>;
}

function InternalOnlyBanner({ isEs }: { isEs: boolean }) {
  return (
    <div className="rounded-2xl border border-black bg-white p-4 text-black">
      <p className="text-[12px] font-black uppercase tracking-[0.18em]">{isEs ? "Solo admin" : "Admin only"}</p>
      <p className="mt-1 text-[13px] leading-relaxed">
        {isEs
          ? "Este Centro de IAs lee el mirror del motor real de TerminalSync. No aparece en la landing pública ni en la app cliente; sirve para auditar provider_id, lifecycle, replacements y policy de publicación."
          : "This AI Center reads the TerminalSync AI engine mirror. It does not appear on the public landing or client app; it audits provider_id, lifecycle, replacements and publication policy."}
      </p>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
      <p className="text-[12px] text-[var(--color-fg-muted)]">{label}</p>
      <p className="mt-1 text-[26px] font-semibold text-[var(--color-fg-strong)]">{value}</p>
    </div>
  );
}

function TabNav({ lang, active, isEs }: { lang: string; active: TabKey; isEs: boolean }) {
  return (
    <div className="flex flex-wrap gap-2">
      {TABS.map((tab) => (
        <Link
          key={tab.key}
          href={`/${lang}/admin/ai-center?tab=${tab.key}`}
          className={`rounded-full border border-black px-4 py-2 text-[13px] font-bold ${
            active === tab.key ? "bg-black text-white" : "bg-white text-black hover:bg-zinc-100"
          }`}
        >
          {isEs ? tab.es : tab.en}
        </Link>
      ))}
    </div>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg)] p-4 text-[13px] text-[var(--color-fg-muted)]">
      {children}
    </p>
  );
}

function formatDate(value: number | string | null) {
  if (value === null) return "—";
  if (typeof value === "string") return value;
  return new Date(value).toISOString().replace("T", " ").slice(0, 16) + " UTC";
}

function CatalogTab({ isEs, snapshot }: { isEs: boolean; snapshot: AiControlCenterSnapshot }) {
  return (
    <div className="space-y-4">
      {snapshot.connectedProviders.map((provider) => (
        <section key={provider.providerId} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-[18px] font-semibold text-[var(--color-fg-strong)]">{provider.visibleLabel}</h2>
              <div className="mt-1 flex flex-wrap gap-2 text-[12px] text-[var(--color-fg-muted)]">
                <span>provider_id: <CodePill>{provider.providerId}</CodePill></span>
                <span>{isEs ? "default_model_id" : "default_model_id"}: <CodePill>{provider.defaultModelId ?? "—"}</CodePill></span>
                <span>source: <CodePill>{provider.source.kind}</CodePill></span>
                <span>updated_at: {formatDate(provider.updatedAt)}</span>
              </div>
            </div>
            <span className="rounded-full border border-black bg-white px-2 py-0.5 text-[11px] font-bold text-black">
              channel: {channelCopy[provider.channel]} · access: {provider.access}
            </span>
          </div>

          <div className="mt-3 text-[12px] leading-relaxed text-[var(--color-fg-muted)]">
            detected_model_ids: {provider.modelIds.map((id) => <CodePill key={id}>{id}</CodePill>).reduce<ReactNode[]>((acc, node) => acc.length ? [...acc, " ", node] : [node], [])}
          </div>
          <div className="mt-2 text-[12px] leading-relaxed text-[var(--color-fg-muted)]">
            surfaces: {provider.surfaces.map((surface) => <CodePill key={surface}>{surface}</CodePill>).reduce<ReactNode[]>((acc, node) => acc.length ? [...acc, " ", node] : [node], [])}
          </div>

          <div className="mt-4 grid gap-3">
            {provider.models.map((model) => (
              <article key={model.modelId} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold text-[var(--color-fg-strong)]">{model.visibleLabel}</h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <LifecycleBadge lifecycle={model.lifecycle} isEs={isEs} />
                    {model.replacementModelId ? (
                      <span className="rounded-full border border-black bg-white px-2 py-0.5 text-[11px] font-semibold text-black">
                        replacement available
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-1 gap-2 text-[12px] text-[var(--color-fg-muted)] md:grid-cols-2">
                  <p>model_id: <CodePill>{model.modelId}</CodePill></p>
                  <p>lifecycle_state: <CodePill>{model.lifecycle}</CodePill></p>
                  <p>retires_at: <CodePill>{model.retiresAt ?? "—"}</CodePill></p>
                  <p>migration_mode: <CodePill>{model.migrationMode ?? "—"}</CodePill></p>
                  <p>replacement_model_id: <CodePill>{model.replacementModelId ?? "—"}</CodePill></p>
                  <p>replacement_visible_label: <CodePill>{model.replacementVisibleLabel ?? "—"}</CodePill></p>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function SurfaceCell({ enabled }: { enabled: boolean }) {
  return (
    <span
      className={`inline-flex min-w-20 justify-center rounded-full border px-2 py-1 text-[12px] font-bold ${
        enabled ? "border-emerald-800 bg-emerald-50 text-emerald-900" : "border-zinc-500 bg-white text-black"
      }`}
    >
      {enabled ? "ON" : "OFF"}
    </span>
  );
}

function PublishingTab({ isEs, snapshot }: { isEs: boolean; snapshot: AiControlCenterSnapshot }) {
  const rows = snapshot.connectedProviders.map((provider) => ({
    key: provider.providerId,
    kind: "provider",
    id: provider.providerId,
    label: provider.visibleLabel,
    channel: provider.channel,
    access: provider.access,
    surfaces: provider.surfaces,
  })).concat(snapshot.managedEngines.map((engine) => ({
    key: `engine:${engine.engineId}`,
    kind: "managed_engine",
    id: engine.engineId,
    label: engine.visibleLabel,
    channel: engine.channel,
    access: engine.access,
    surfaces: engine.surfaces,
  })));

  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
      <div>
        <h2 className="text-[18px] font-semibold text-[var(--color-fg-strong)]">
          {isEs ? "Publicación por superficie" : "Publishing by surface"}
        </h2>
        <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-[var(--color-fg-muted)]">
          {isEs
            ? "Matriz real del policy layer: channel internal/beta/public, access connected/managed/credits/requires_key y visibilidad por chat, imagen, video y automatización. Composer se mantiene provider-first."
            : "Real policy-layer matrix: internal/beta/public channel, connected/managed/credits/requires_key access and visibility by chat, image, video and automation. Composer remains provider-first."}
        </p>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse text-left text-[13px]">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-[12px] uppercase tracking-[0.14em] text-[var(--color-fg-muted)]">
              <th className="py-3 pr-4">{isEs ? "Tipo" : "Type"}</th>
              <th className="py-3 pr-4">ID</th>
              <th className="py-3 pr-4">visible_label</th>
              <th className="py-3 pr-4">channel</th>
              <th className="py-3 pr-4">access_mode</th>
              {AI_CENTER_SURFACES.map((surface) => (
                <th key={surface.key} className="py-3 pr-4 text-center">
                  {isEs ? surface.es : surface.en}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className="border-b border-[var(--color-border)] align-middle">
                <td className="py-3 pr-4"><CodePill>{row.kind}</CodePill></td>
                <td className="py-3 pr-4"><CodePill>{row.id}</CodePill></td>
                <td className="py-3 pr-4 font-semibold text-[var(--color-fg-strong)]">{row.label}</td>
                <td className="py-3 pr-4"><CodePill>{row.channel}</CodePill></td>
                <td className="py-3 pr-4"><CodePill>{row.access}</CodePill></td>
                {AI_CENTER_SURFACES.map((surface) => (
                  <td key={surface.key} className="py-3 pr-4 text-center">
                    <SurfaceCell enabled={row.surfaces.includes(surface.key as AiAdminSurface)} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function alertTitle(alert: AiCenterAlert, isEs: boolean): string {
  if (alert.title) return alert.title;
  const kind = isEs ? alertKindCopy[alert.kind].es : alertKindCopy[alert.kind].en;
  return alert.visibleLabel ? `${kind}: ${alert.visibleLabel}` : kind;
}

function AlertsTab({ alerts, isEs }: { alerts: AiCenterAlert[]; isEs: boolean }) {
  const severityClass = {
    info: "border-sky-700 bg-sky-50 text-sky-950",
    warning: "border-amber-700 bg-amber-50 text-amber-950",
    critical: "border-red-800 bg-red-50 text-red-950",
  } as const;

  if (alerts.length === 0) {
    return <EmptyState>{isEs ? "Sin alertas activas." : "No active alerts."}</EmptyState>;
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert, idx) => (
        <article key={`${alert.kind}-${alert.providerId}-${alert.modelId}-${idx}`} className={`rounded-2xl border p-4 ${severityClass[alert.severity]}`}>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h2 className="text-[15px] font-black">{alertTitle(alert, isEs)}</h2>
            <span className="rounded-full border border-black bg-white px-2 py-0.5 text-[11px] font-bold text-black">
              {alert.kind} · {alert.severity.toUpperCase()}
            </span>
          </div>
          <p className="mt-1 text-[13px] leading-relaxed">{alert.detail}</p>
          <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-semibold">
            {alert.owner ? <span>Owner: {alert.owner}</span> : null}
            {alert.providerId ? <span>provider_id: <CodePill>{alert.providerId}</CodePill></span> : null}
            {alert.modelId ? <span>model_id: <CodePill>{alert.modelId}</CodePill></span> : null}
            {alert.retiresAt ? <span>retires_at: <CodePill>{alert.retiresAt}</CodePill></span> : null}
            {alert.replacementModelId ? <span>replacement_model_id: <CodePill>{alert.replacementModelId}</CodePill></span> : null}
          </div>
        </article>
      ))}
    </div>
  );
}

function LanesTab({ isEs, snapshot }: { isEs: boolean; snapshot: AiControlCenterSnapshot }) {
  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-2">
        {snapshot.premiumLanes.map((lane: PremiumLaneDefinition) => (
          <article key={lane.engineId} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2 className="text-[18px] font-semibold text-[var(--color-fg-strong)]">{lane.visibleLabel}</h2>
              <span className="rounded-full border border-black bg-white px-2 py-0.5 text-[11px] font-bold text-black">
                {isEs ? surfaceLabel[lane.surface].es : surfaceLabel[lane.surface].en}
              </span>
            </div>
            <p className="mt-1 text-[12px] text-[var(--color-fg-muted)]">
              engine_id: <CodePill>{lane.engineId}</CodePill> · credits_provider_id: <CodePill>{lane.creditsProviderId}</CodePill> · billing: <CodePill>{isEs ? entitlementCopy[lane.billing].es : entitlementCopy[lane.billing].en}</CodePill>
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {lane.bestFor.map((tag) => (
                <span key={tag} className="rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-fg-strong)]">
                  {tag}
                </span>
              ))}
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-[var(--color-fg-muted)]">{lane.upsellDetail}</p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
        <h2 className="text-[18px] font-semibold text-[var(--color-fg-strong)]">
          {isEs ? "Plan base ($15) por superficie" : "Base plan ($15) by surface"}
        </h2>
        <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-[var(--color-fg-muted)]">
          {isEs
            ? "Espejo de la política comercial del motor (ai_plan_policy.rs), no un dato del snapshot."
            : "Mirror of the engine's commercial policy (ai_plan_policy.rs), not snapshot data."}
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[12px] uppercase tracking-[0.14em] text-[var(--color-fg-muted)]">
                <th className="py-3 pr-4">{isEs ? "Superficie" : "Surface"}</th>
                <th className="py-3 pr-4">{isEs ? "Entitlement" : "Entitlement"}</th>
              </tr>
            </thead>
            <tbody>
              {BASE_PLAN_MATRIX.map((row) => (
                <tr key={row.surface} className="border-b border-[var(--color-border)]">
                  <td className="py-3 pr-4 font-semibold text-[var(--color-fg-strong)]">
                    {isEs ? surfaceLabel[row.surface].es : surfaceLabel[row.surface].en}
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[12px] font-semibold ${row.className}`}>
                      {isEs ? row.es : row.en}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[12px] text-[var(--color-fg-muted)]">
          {isEs
            ? "La política se aplica en el motor de la app; esta matriz es informativa."
            : "The policy is enforced in the app's engine; this matrix is informational only."}
        </p>
      </section>
    </div>
  );
}

function ChangeListSection({
  title,
  items,
  emptyLabel,
  render,
}: {
  title: string;
  items: unknown[];
  emptyLabel: string;
  render: () => ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
      <h2 className="text-[16px] font-semibold text-[var(--color-fg-strong)]">{title}</h2>
      <div className="mt-3">{items.length === 0 ? <EmptyState>{emptyLabel}</EmptyState> : render()}</div>
    </section>
  );
}

function ChangesTab({ isEs, changeReport }: { isEs: boolean; changeReport: CatalogChangeReport }) {
  const empty = isEs ? "Sin novedades." : "No changes.";

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4 text-[12px] text-[var(--color-fg-muted)]">
        generated_at: {formatDate(changeReport.generatedAt)} · compared_against_updated_at: {formatDate(changeReport.comparedAgainstUpdatedAt)}
      </section>

      <ChangeListSection
        title={isEs ? "Modelos detectados" : "Detected models"}
        items={changeReport.detectedModels}
        emptyLabel={empty}
        render={() => (
          <div className="grid gap-2">
            {changeReport.detectedModels.map((m) => (
              <p key={`${m.providerId}-${m.modelId}`} className="text-[13px] text-[var(--color-fg-strong)]">
                <CodePill>{m.providerId}</CodePill> · {m.visibleLabel} (<CodePill>{m.modelId}</CodePill>) — {m.lifecycle}
              </p>
            ))}
          </div>
        )}
      />

      <ChangeListSection
        title={isEs ? "Retiros" : "Retirements"}
        items={changeReport.retirements}
        emptyLabel={empty}
        render={() => (
          <div className="grid gap-2">
            {changeReport.retirements.map((r) => (
              <p key={`${r.providerId}-${r.modelId}`} className="text-[13px] text-[var(--color-fg-strong)]">
                <CodePill>{r.providerId}</CodePill> · {r.visibleLabel} — {isEs ? "retira" : "retires"} <CodePill>{r.retiresAt ?? "—"}</CodePill>
                {r.replacementModelId ? <> → <CodePill>{r.replacementModelId}</CodePill></> : null}
              </p>
            ))}
          </div>
        )}
      />

      <ChangeListSection
        title={isEs ? "Reemplazos candidatos" : "Replacement candidates"}
        items={changeReport.replacementCandidates}
        emptyLabel={empty}
        render={() => (
          <div className="grid gap-2">
            {changeReport.replacementCandidates.map((r) => (
              <p key={`${r.providerId}-${r.modelId}`} className="text-[13px] text-[var(--color-fg-strong)]">
                <CodePill>{r.providerId}</CodePill> · <CodePill>{r.modelId}</CodePill> → <CodePill>{r.replacementModelId}</CodePill>
                {" "}({r.replacementVisibleLabel ?? "—"}) · migration_mode: <CodePill>{r.migrationMode ?? "—"}</CodePill>
              </p>
            ))}
          </div>
        )}
      />

      <ChangeListSection
        title={isEs ? "Cambios automáticos programados" : "Scheduled auto-switches"}
        items={changeReport.scheduledAutoSwitches}
        emptyLabel={empty}
        render={() => (
          <div className="grid gap-2">
            {changeReport.scheduledAutoSwitches.map((s) => (
              <p key={`${s.providerId}-${s.fromModelId}`} className="text-[13px] text-[var(--color-fg-strong)]">
                <CodePill>{s.providerId}</CodePill> · <CodePill>{s.fromModelId}</CodePill> → <CodePill>{s.toModelId}</CodePill>
                {" "}{isEs ? "el" : "on"} <CodePill>{s.switchAt ?? "—"}</CodePill>
              </p>
            ))}
          </div>
        )}
      />

      <ChangeListSection
        title={isEs ? "Capacidades nuevas" : "New capabilities"}
        items={changeReport.newCapabilities}
        emptyLabel={empty}
        render={() => (
          <div className="grid gap-2">
            {changeReport.newCapabilities.map((c, i) => (
              <p key={`${c.providerId}-${c.capability}-${i}`} className="text-[13px] text-[var(--color-fg-strong)]">
                <CodePill>{c.providerId}</CodePill> · <CodePill>{c.capability}</CodePill>
              </p>
            ))}
          </div>
        )}
      />
    </div>
  );
}

function InternalSourceModelsTable({ models }: { models: ProviderCatalogModelEntry[] }) {
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-left text-[12px]">
        <thead>
          <tr className="border-b border-[var(--color-border)] uppercase tracking-[0.1em] text-[var(--color-fg-muted)]">
            <th className="py-2 pr-4">model_id</th>
            <th className="py-2 pr-4">upstream_provider_slug</th>
            <th className="py-2 pr-4">modalities</th>
            <th className="py-2 pr-4">pricing (prompt/completion/image)</th>
          </tr>
        </thead>
        <tbody>
          {models.map((model) => (
            <tr key={model.modelId} className="border-b border-[var(--color-border)]">
              <td className="py-2 pr-4"><CodePill>{model.modelId}</CodePill></td>
              <td className="py-2 pr-4"><CodePill>{model.upstreamProviderSlug ?? "—"}</CodePill></td>
              <td className="py-2 pr-4">{model.modalities.join(", ") || "—"}</td>
              <td className="py-2 pr-4">
                {model.pricing
                  ? `${model.pricing.prompt ?? "—"} / ${model.pricing.completion ?? "—"} / ${model.pricing.image ?? "—"}`
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RoutingTab({ isEs, snapshot }: { isEs: boolean; snapshot: AiControlCenterSnapshot }) {
  return (
    <div className="space-y-5">
      <p className="text-[12px] text-[var(--color-fg-muted)]">
        {isEs
          ? "El snapshot no trae decisiones de routing en vivo; esta pestaña combina lo que sí trae (superficies servidas) con la política del motor documentada abajo."
          : "The snapshot carries no live routing decisions; this tab combines what it does carry (surfaces served) with the engine policy documented below."}
      </p>

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
        <h2 className="text-[18px] font-semibold text-[var(--color-fg-strong)]">
          {isEs ? "Quién sirve cada superficie" : "Who serves each surface"}
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[12px] uppercase tracking-[0.14em] text-[var(--color-fg-muted)]">
                <th className="py-3 pr-4">{isEs ? "Superficie" : "Surface"}</th>
                <th className="py-3 pr-4">{isEs ? "Providers conectados" : "Connected providers"}</th>
                <th className="py-3 pr-4">Managed engines</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.surfaceViews.map((view) => (
                <tr key={view.surface} className="border-b border-[var(--color-border)] align-top">
                  <td className="py-3 pr-4 font-semibold text-[var(--color-fg-strong)]">
                    {isEs ? surfaceLabel[view.surface].es : surfaceLabel[view.surface].en}
                  </td>
                  <td className="py-3 pr-4">
                    {view.connectedProviders.length === 0
                      ? "—"
                      : view.connectedProviders.map((p) => <CodePill key={p.providerId}>{p.providerId}</CodePill>).reduce<ReactNode[]>((acc, node) => acc.length ? [...acc, " ", node] : [node], [])}
                  </td>
                  <td className="py-3 pr-4">
                    {view.managedEngines.length === 0
                      ? "—"
                      : view.managedEngines.map((e) => <CodePill key={e.engineId}>{e.engineId}</CodePill>).reduce<ReactNode[]>((acc, node) => acc.length ? [...acc, " ", node] : [node], [])}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
        <h2 className="text-[18px] font-semibold text-[var(--color-fg-strong)]">
          {isEs ? "Reglas del router (documentadas, espejo del motor)" : "Router rules (documented, engine mirror)"}
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-[13px] leading-relaxed text-[var(--color-fg-muted)]">
          <li>
            {isEs
              ? "GLM (TerminalSync / Z.ai) es la base fuerte para chat, diseño y automatización."
              : "GLM (TerminalSync / Z.ai) is the strong base for chat, design and automation."}
          </li>
          <li>
            {isEs
              ? "OpenRouter opera por debajo como infraestructura interna — nunca es una marca visible para el cliente."
              : "OpenRouter operates underneath as internal infrastructure — never a client-visible brand."}
          </li>
          <li>
            {isEs
              ? "Pedidos comerciales de imagen van primero a Ideogram."
              : "Commercial image requests go to Ideogram first."}
          </li>
          <li>
            {isEs
              ? "Video SIEMPRE va por el carril ts-video/WaveSpeed — jamás incluido en el plan base."
              : "Video ALWAYS goes through the ts-video/WaveSpeed lane — never included in the base plan."}
          </li>
        </ul>
      </section>

      <section className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-panel)] p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-[18px] font-semibold text-[var(--color-fg-strong)]">
            {isEs ? "Fuentes internas de catálogo" : "Internal catalog sources"}
          </h2>
          <span className="rounded-full border border-black bg-black px-2 py-0.5 text-[11px] font-bold text-white">
            {isEs ? "solo equipo" : "team only"}
          </span>
        </div>
        {snapshot.internalSources.length === 0 ? (
          <div className="mt-3">
            <EmptyState>{isEs ? "Sin fuentes internas en este snapshot." : "No internal sources in this snapshot."}</EmptyState>
          </div>
        ) : (
          snapshot.internalSources.map((source: ProviderCatalogViewEntry) => (
            <div key={source.providerId} className="mt-4">
              <p className="text-[13px] text-[var(--color-fg-muted)]">
                provider_id: <CodePill>{source.providerId}</CodePill> · {source.visibleLabel} · access: <CodePill>{source.access}</CodePill>
              </p>
              <InternalSourceModelsTable models={source.models} />
            </div>
          ))
        )}
      </section>
    </div>
  );
}

interface ReviewItem {
  key: string;
  providerId: string;
  modelId: string | null;
  reason: string;
  detail: string;
  severity: CatalogAlertSeverity | "manual" | "unresolved";
}

function ReviewTab({ isEs, snapshot }: { isEs: boolean; snapshot: AiControlCenterSnapshot }) {
  const items: ReviewItem[] = [
    ...snapshot.alerts
      .filter((alert) => alert.severity === "warning" || alert.severity === "critical")
      .map((alert) => ({
        key: `alert-${alert.kind}-${alert.providerId}-${alert.modelId}`,
        providerId: alert.providerId,
        modelId: alert.modelId,
        reason: isEs ? `Alerta ${alert.severity}` : `${alert.severity} alert`,
        detail: alert.detail,
        severity: alert.severity,
      })),
    ...snapshot.changeReport.replacementCandidates
      .filter((candidate) => candidate.migrationMode === "manual")
      .map((candidate) => ({
        key: `manual-${candidate.providerId}-${candidate.modelId}`,
        providerId: candidate.providerId,
        modelId: candidate.modelId,
        reason: isEs ? "Migración manual pendiente" : "Manual migration pending",
        detail: isEs
          ? `${candidate.modelId} tiene reemplazo sugerido (${candidate.replacementVisibleLabel ?? candidate.replacementModelId}) pero requiere decisión humana.`
          : `${candidate.modelId} has a suggested replacement (${candidate.replacementVisibleLabel ?? candidate.replacementModelId}) but needs a human decision.`,
        severity: "manual" as const,
      })),
    ...snapshot.changeReport.retirements
      .filter((retirement) => !retirement.replacementModelId)
      .map((retirement) => ({
        key: `unresolved-${retirement.providerId}-${retirement.modelId}`,
        providerId: retirement.providerId,
        modelId: retirement.modelId,
        reason: isEs ? "Retiro sin reemplazo" : "Retirement with no replacement",
        detail: isEs
          ? `${retirement.visibleLabel} se retira${retirement.retiresAt ? ` el ${retirement.retiresAt}` : ""} y no tiene reemplazo configurado.`
          : `${retirement.visibleLabel} retires${retirement.retiresAt ? ` on ${retirement.retiresAt}` : ""} with no replacement configured.`,
        severity: "unresolved" as const,
      })),
  ];

  return (
    <div className="space-y-4">
      <p className="text-[12px] text-[var(--color-fg-muted)]">
        {isEs
          ? "Criterio derivado del snapshot; el motor no tiene una cola de review propia. Se listan: alertas warning/critical, candidatos de reemplazo con migración manual, y retiros sin reemplazo."
          : "Criteria derived from the snapshot; the engine has no review queue of its own. Lists: warning/critical alerts, replacement candidates with manual migration, and retirements with no replacement."}
      </p>
      {items.length === 0 ? (
        <EmptyState>{isEs ? "Nada pendiente." : "Nothing pending."}</EmptyState>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <article key={item.key} className="rounded-2xl border border-amber-700 bg-amber-50 p-4 text-amber-950">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h2 className="text-[15px] font-black">{item.reason}</h2>
                <span className="rounded-full border border-black bg-white px-2 py-0.5 text-[11px] font-bold text-black">
                  {item.severity}
                </span>
              </div>
              <p className="mt-1 text-[13px] leading-relaxed">{item.detail}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-semibold">
                <span>provider_id: <CodePill>{item.providerId}</CodePill></span>
                {item.modelId ? <span>model_id: <CodePill>{item.modelId}</CodePill></span> : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export function AiCenterClient({ lang, requestedTab, initialPayload }: { lang: string; requestedTab?: string; initialPayload: AiCenterPayload }) {
  const [payload, setPayload] = useState<AiCenterPayload>(initialPayload);
  const [loadState, setLoadState] = useState<"idle" | "loading" | "live" | "fallback">("idle");
  const active: TabKey = isTabKey(requestedTab) ? requestedTab : "catalog";
  const isEs = lang === "es";

  useEffect(() => {
    let alive = true;
    setLoadState("loading");
    authedFetch("/api/admin/ai-center", { cache: "no-store" })
      .then(async (res) => {
        if (!alive) return;
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as AiCenterPayload;
        setPayload(json);
        setLoadState(json.mode === "live" && json.source === "terminalsync_ai_center_url" ? "live" : "fallback");
      })
      .catch((error) => {
        if (!alive) return;
        setPayload(buildAiCenterPayload({
          mode: "fallback_local",
          source: "page_local_mirror",
          fallbackReason: error instanceof Error ? error.message : "endpoint unavailable",
        }));
        setLoadState("fallback");
      });
    return () => { alive = false; };
  }, []);

  const { snapshot, stats, alerts } = payload;

  return (
    <main className="text-[var(--color-fg)]">
      <section className="mx-auto max-w-6xl px-5 py-10 md:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--color-fg-muted)]">
              {isEs ? "Admin interno" : "Internal admin"}
            </p>
            <h1 className="mt-1 text-[28px] font-semibold tracking-tight text-[var(--color-fg-strong)]">
              {isEs ? "Centro de IAs" : "AI Center"}
            </h1>
            <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-[var(--color-fg-muted)]">
              {isEs
                ? "Control interno conectado al mirror del motor real de TerminalSync: catálogo de providers/modelos, lifecycle/replacements y policy de publicación por superficie. No toca landing pública ni app cliente."
                : "Internal control connected to the TerminalSync AI engine mirror: provider/model catalog, lifecycle/replacements and publication policy by surface. It does not touch the public landing or client app."}
            </p>
            <p className="mt-2 text-[12px] text-[var(--color-fg-muted)]">
              catalog_status: <CodePill>{snapshot.catalogStatus}</CodePill> · generated_at: {formatDate(payload.generated_at)} · refresh_due: <CodePill>{String(snapshot.refreshDue)}</CodePill> · mode: <CodePill>{payload.mode}</CodePill> · source: <CodePill>{payload.source}</CodePill> · api: <CodePill>{loadState}</CodePill>
            </p>
          </div>
          <TabNav lang={lang} active={active} isEs={isEs} />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-5">
          <StatCard label="Providers" value={stats.providers} />
          <StatCard label={isEs ? "Managed engines" : "Managed engines"} value={stats.managedEngines} />
          <StatCard label={isEs ? "Modelos" : "Models"} value={stats.models} />
          <StatCard label={isEs ? "Publicados" : "Published"} value={stats.published} />
          <StatCard label={isEs ? "Alertas" : "Alerts"} value={stats.alerts} />
        </div>

        <div className="mt-5">
          <InternalOnlyBanner isEs={isEs} />
        </div>

        <div className="mt-6">
          {active === "catalog" ? <CatalogTab isEs={isEs} snapshot={snapshot} /> : null}
          {active === "publishing" ? <PublishingTab isEs={isEs} snapshot={snapshot} /> : null}
          {active === "alerts" ? <AlertsTab alerts={alerts} isEs={isEs} /> : null}
          {active === "lanes" ? <LanesTab isEs={isEs} snapshot={snapshot} /> : null}
          {active === "changes" ? <ChangesTab isEs={isEs} changeReport={snapshot.changeReport} /> : null}
          {active === "routing" ? <RoutingTab isEs={isEs} snapshot={snapshot} /> : null}
          {active === "review" ? <ReviewTab isEs={isEs} snapshot={snapshot} /> : null}
        </div>
      </section>
    </main>
  );
}
