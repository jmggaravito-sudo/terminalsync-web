"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { authedFetch } from "@/lib/supabase/browser";
import {
  AI_CENTER_SURFACES,
  buildAiCenterPayload,
  type AiAdminSurface,
  type AiCatalogModelLifecycleState,
  type AiCatalogPromotionChannel,
  type AiCenterAlert,
  type AiCenterPayload,
  type AiControlCenterSnapshot,
} from "@/lib/adminAiCenter";

const TABS = [
  { key: "catalog", es: "Catálogo", en: "Catalog" },
  { key: "publishing", es: "Publicación", en: "Publishing" },
  { key: "alerts", es: "Alertas", en: "Alerts" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

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

function AlertsTab({ alerts }: { alerts: AiCenterAlert[] }) {
  const severityClass = {
    info: "border-sky-700 bg-sky-50 text-sky-950",
    warning: "border-amber-700 bg-amber-50 text-amber-950",
    critical: "border-red-800 bg-red-50 text-red-950",
  } as const;

  return (
    <div className="space-y-3">
      {alerts.map((alert, idx) => (
        <article key={`${alert.kind}-${alert.providerId}-${alert.modelId}-${idx}`} className={`rounded-2xl border p-4 ${severityClass[alert.severity]}`}>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h2 className="text-[15px] font-black">{alert.title}</h2>
            <span className="rounded-full border border-black bg-white px-2 py-0.5 text-[11px] font-bold text-black">
              {alert.kind} · {alert.severity.toUpperCase()}
            </span>
          </div>
          <p className="mt-1 text-[13px] leading-relaxed">{alert.detail}</p>
          <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-semibold">
            <span>Owner: {alert.owner}</span>
            {alert.providerId ? <span>provider_id: <CodePill>{alert.providerId}</CodePill></span> : null}
            {alert.modelId ? <span>model_id: <CodePill>{alert.modelId}</CodePill></span> : null}
          </div>
        </article>
      ))}
    </div>
  );
}

export function AiCenterClient({ lang, requestedTab, initialPayload }: { lang: string; requestedTab?: string; initialPayload: AiCenterPayload }) {
  const [payload, setPayload] = useState<AiCenterPayload>(initialPayload);
  const [loadState, setLoadState] = useState<"idle" | "loading" | "ready" | "fallback">("idle");
  const active: TabKey = requestedTab === "publishing" || requestedTab === "alerts" ? requestedTab : "catalog";
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
        setLoadState("ready");
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
          {active === "alerts" ? <AlertsTab alerts={alerts} /> : null}
        </div>
      </section>
    </main>
  );
}
