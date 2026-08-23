import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/content";
import {
  AI_CENTER_PROVIDERS,
  AI_CENTER_SURFACES,
  aiCenterStats,
  getAiCenterAlerts,
  type AiCenterLifecycle,
  type AiCenterSurface,
} from "@/lib/adminAiCenter";

interface Props {
  params: Promise<{ lang: string }>;
  searchParams?: Promise<{ tab?: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: lang === "es" ? "Admin · Centro de IAs" : "Admin · AI Center",
    robots: { index: false, follow: false },
  };
}

const TABS = [
  { key: "catalog", es: "Catálogo", en: "Catalog" },
  { key: "publishing", es: "Publicación", en: "Publishing" },
  { key: "alerts", es: "Alertas", en: "Alerts" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const lifecycleCopy: Record<AiCenterLifecycle, { es: string; en: string; className: string }> = {
  active: { es: "Activo", en: "Active", className: "border-emerald-700 bg-emerald-50 text-emerald-900" },
  beta: { es: "Beta", en: "Beta", className: "border-sky-700 bg-sky-50 text-sky-900" },
  deprecated: { es: "Deprecado", en: "Deprecated", className: "border-amber-700 bg-amber-50 text-amber-900" },
  retiring_soon: { es: "Retiro próximo", en: "Retiring soon", className: "border-orange-700 bg-orange-50 text-orange-900" },
  retired: { es: "Retirado", en: "Retired", className: "border-zinc-700 bg-zinc-100 text-zinc-900" },
};

function LifecycleBadge({ lifecycle, isEs }: { lifecycle: AiCenterLifecycle; isEs: boolean }) {
  const c = lifecycleCopy[lifecycle];
  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${c.className}`}>
      {isEs ? c.es : c.en}
    </span>
  );
}

function InternalOnlyBanner({ isEs }: { isEs: boolean }) {
  return (
    <div className="rounded-2xl border border-black bg-white p-4 text-black">
      <p className="text-[12px] font-black uppercase tracking-[0.18em]">{isEs ? "Solo admin" : "Admin only"}</p>
      <p className="mt-1 text-[13px] leading-relaxed">
        {isEs
          ? "Este Centro de IAs es una superficie interna para decidir qué modelos se pueden publicar. No aparece en la landing pública ni en la app cliente de TerminalSync."
          : "This AI Center is an internal surface for deciding which models can be published. It does not appear on the public landing or the TerminalSync client app."}
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

function CatalogTab({ isEs }: { isEs: boolean }) {
  return (
    <div className="space-y-4">
      {AI_CENTER_PROVIDERS.map((provider) => (
        <section key={provider.id} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-[18px] font-semibold text-[var(--color-fg-strong)]">{provider.publicName}</h2>
              <p className="text-[12px] text-[var(--color-fg-muted)]">
                {isEs ? "Familia" : "Family"}: {provider.family} · {isEs ? "Fuente" : "Source"}: {provider.source}
              </p>
            </div>
            <LifecycleBadge lifecycle={provider.lifecycle} isEs={isEs} />
          </div>

          <div className="mt-4 grid gap-3">
            {provider.models.map((model) => (
              <article key={model.id} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold text-[var(--color-fg-strong)]">{model.publicName}</h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <LifecycleBadge lifecycle={model.lifecycle} isEs={isEs} />
                    {model.replacementId ? (
                      <span className="rounded-full border border-black bg-white px-2 py-0.5 text-[11px] font-semibold text-black">
                        {isEs ? "Replacement available" : "Replacement available"}
                      </span>
                    ) : null}
                  </div>
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-[var(--color-fg-muted)]">{model.notes}</p>
                <p className="mt-2 text-[11px] text-[var(--color-fg-muted)]">
                  {isEs ? "ID interno oculto al cliente · fuente" : "Internal ID hidden from clients · source"}: {model.source}
                </p>
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

function PublishingTab({ isEs }: { isEs: boolean }) {
  const rows = AI_CENTER_PROVIDERS.flatMap((provider) =>
    provider.models.map((model) => ({ provider: provider.publicName, model })),
  );

  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[18px] font-semibold text-[var(--color-fg-strong)]">
            {isEs ? "Publicación por superficie" : "Publishing by surface"}
          </h2>
          <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-[var(--color-fg-muted)]">
            {isEs
              ? "Matriz interna de qué modelos pueden aparecer en chat, imagen, video o automatización. Esto no publica IDs técnicos al cliente; el cliente solo vería nombres controlados por producto. Fase 1 muestra la policy básica y evita tocar la app cliente."
              : "Internal matrix for which models may appear in chat, image, video or automation. This does not publish technical IDs to clients; clients only see product-controlled names. Phase 1 shows the basic policy and avoids touching the client app."}
          </p>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-[13px]">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-[12px] uppercase tracking-[0.14em] text-[var(--color-fg-muted)]">
              <th className="py-3 pr-4">{isEs ? "Proveedor" : "Provider"}</th>
              <th className="py-3 pr-4">{isEs ? "Modelo visible" : "Visible model"}</th>
              <th className="py-3 pr-4">Lifecycle</th>
              {AI_CENTER_SURFACES.map((surface) => (
                <th key={surface.key} className="py-3 pr-4 text-center">
                  {isEs ? surface.es : surface.en}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ provider, model }) => (
              <tr key={model.id} className="border-b border-[var(--color-border)] align-middle">
                <td className="py-3 pr-4 font-semibold text-[var(--color-fg-strong)]">{provider}</td>
                <td className="py-3 pr-4">{model.publicName}</td>
                <td className="py-3 pr-4"><LifecycleBadge lifecycle={model.lifecycle} isEs={isEs} /></td>
                {AI_CENTER_SURFACES.map((surface) => (
                  <td key={surface.key} className="py-3 pr-4 text-center">
                    <SurfaceCell enabled={model.surfaces[surface.key as AiCenterSurface]} />
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

function AlertsTab({ isEs }: { isEs: boolean }) {
  const alerts = getAiCenterAlerts();
  const severityClass = {
    info: "border-sky-700 bg-sky-50 text-sky-950",
    warning: "border-amber-700 bg-amber-50 text-amber-950",
    critical: "border-red-800 bg-red-50 text-red-950",
  } as const;

  return (
    <div className="space-y-3">
      {alerts.map((alert, idx) => (
        <article key={`${alert.title}-${idx}`} className={`rounded-2xl border p-4 ${severityClass[alert.severity]}`}>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h2 className="text-[15px] font-black">{alert.title}</h2>
            <span className="rounded-full border border-black bg-white px-2 py-0.5 text-[11px] font-bold text-black">
              {alert.severity.toUpperCase()}
            </span>
          </div>
          <p className="mt-1 text-[13px] leading-relaxed">{alert.detail}</p>
          <p className="mt-2 text-[11px] font-semibold">Owner: {alert.owner}</p>
        </article>
      ))}
    </div>
  );
}

export default async function AdminAiCenterPage({ params, searchParams }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const sp = (await searchParams) ?? {};
  const requested = sp.tab;
  const active: TabKey = requested === "publishing" || requested === "alerts" ? requested : "catalog";
  const isEs = lang === "es";
  const stats = aiCenterStats();

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
                ? "Control interno para catálogo de providers/modelos, lifecycle, replacements y publicación por superficie. No se monta en la landing pública ni en la app cliente."
                : "Internal control for provider/model catalog, lifecycle, replacements and publishing by surface. It is not mounted on the public landing or client app."}
            </p>
          </div>
          <TabNav lang={lang} active={active} isEs={isEs} />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-4">
          <StatCard label={isEs ? "Providers" : "Providers"} value={stats.providers} />
          <StatCard label={isEs ? "Modelos" : "Models"} value={stats.models} />
          <StatCard label={isEs ? "Publicados" : "Published"} value={stats.published} />
          <StatCard label={isEs ? "Alertas" : "Alerts"} value={stats.alerts} />
        </div>

        <div className="mt-5">
          <InternalOnlyBanner isEs={isEs} />
        </div>

        <div className="mt-6">
          {active === "catalog" ? <CatalogTab isEs={isEs} /> : null}
          {active === "publishing" ? <PublishingTab isEs={isEs} /> : null}
          {active === "alerts" ? <AlertsTab isEs={isEs} /> : null}
        </div>
      </section>
    </main>
  );
}
