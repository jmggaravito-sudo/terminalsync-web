"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, AlertTriangle, KeyRound, Gift, UserX } from "lucide-react";

// Mirrors AiSelectionAggregate in src/lib/aiSelectionSheet.ts.
interface Aggregate {
  total: number;
  resolved: number;
  bySystem: { byok: number; courtesy: number; none: number; other: number };
  byProvider: { claude: number; codex: number; gemini: number; other: number };
  byLocale: Record<string, number>;
  byPlan: Record<string, number>;
  arrivedWithAi: number;
  arrivedWithoutAi: number;
  noAiRate: number;
  byokRate: number;
  courtesyRate: number;
  noneRate: number;
  courtesyStarted: number;
  courtesyExhausted: number;
  courtesyConverted: number;
  courtesyConversionRate: number;
  minutesBuckets: Record<string, number>;
  authNeeded: number;
  authSwitched: number;
  authConnect: number;
  authSwitchRate: number;
  last7: number;
  last30: number;
  latestMs: number | null;
  daysSinceLatest: number | null;
}

interface ApiOk {
  ok: true;
  aggregate: Aggregate;
  generatedAt: string;
}

interface ApiErr {
  error: string;
  detail?: string;
}

const pct = (n: number) => `${Math.round(n * 100)}%`;

function Card({
  label,
  value,
  hint,
  accent,
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="flex items-center gap-2 text-[12px] text-[var(--color-fg-muted)]">
        {icon}
        <span>{label}</span>
      </div>
      <div
        className="mt-1 text-[26px] font-semibold tracking-tight"
        style={accent ? { color: accent } : undefined}
      >
        {value}
      </div>
      {hint ? (
        <div className="mt-0.5 text-[11px] text-[var(--color-fg-muted)]">{hint}</div>
      ) : null}
    </div>
  );
}

function Bar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const w = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 text-[13px]">
      <div className="w-24 shrink-0 text-[var(--color-fg-muted)]">{label}</div>
      <div className="h-3 flex-1 overflow-hidden rounded-full bg-[var(--color-border)]">
        <div className="h-full rounded-full" style={{ width: `${w}%`, background: color }} />
      </div>
      <div className="w-16 shrink-0 text-right tabular-nums">
        {count} · {w}%
      </div>
    </div>
  );
}

export function AiSelectionClient({ isEs }: { isEs: boolean }) {
  const [data, setData] = useState<Aggregate | null>(null);
  const [genAt, setGenAt] = useState<string | null>(null);
  const [err, setErr] = useState<ApiErr | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/ai-selection", { cache: "no-store" });
      const json = (await res.json()) as ApiOk | ApiErr;
      if (!res.ok || "error" in json) {
        setErr("error" in json ? json : { error: `http_${res.status}` });
        setData(null);
      } else {
        setData(json.aggregate);
        setGenAt(json.generatedAt);
      }
    } catch (e) {
      setErr({ error: "fetch_failed", detail: e instanceof Error ? e.message : String(e) });
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const T = (es: string, en: string) => (isEs ? es : en);

  if (loading && !data) {
    return (
      <div className="flex items-center gap-2 text-[13px] text-[var(--color-fg-muted)]">
        <RefreshCw className="h-4 w-4 animate-spin" />
        {T("Cargando…", "Loading…")}
      </div>
    );
  }

  if (err) {
    const notConfigured = err.error === "not_configured";
    return (
      <div className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-4">
        <div className="flex items-center gap-2 text-[13px] font-medium text-amber-600 dark:text-amber-400">
          <AlertTriangle className="h-4 w-4" />
          {notConfigured
            ? T("Todavía sin configurar", "Not configured yet")
            : T("No se pudo leer la tabla", "Couldn't read the sheet")}
        </div>
        <p className="mt-2 text-[12px] text-[var(--color-fg-muted)]">
          {notConfigured
            ? T(
                "Falta agregar GOOGLE_SHEETS_SA_KEY y AI_SELECTION_SHEET_ID en Vercel. En cuanto estén, esta página muestra los números en vivo.",
                "GOOGLE_SHEETS_SA_KEY and AI_SELECTION_SHEET_ID need to be added in Vercel. Once they're set, this page shows live numbers.",
              )
            : err.detail || err.error}
        </p>
        <button
          onClick={() => void load()}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-[12px] hover:bg-[var(--color-surface)]"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          {T("Reintentar", "Retry")}
        </button>
      </div>
    );
  }

  if (!data) return null;

  const empty = data.total === 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-[12px] text-[var(--color-fg-muted)]">
          {genAt
            ? T(
                `En vivo · leído ${new Date(genAt).toLocaleString("es")}`,
                `Live · read ${new Date(genAt).toLocaleString("en")}`,
              )
            : null}
        </div>
        <button
          onClick={() => void load()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-[12px] hover:bg-[var(--color-surface)]"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          {T("Actualizar", "Refresh")}
        </button>
      </div>

      {empty ? (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center text-[13px] text-[var(--color-fg-muted)]">
          {T(
            "Todavía no llegó ningún evento. En cuanto alguien abra una terminal y elija una IA, aparece acá.",
            "No events yet. As soon as someone opens a terminal and picks an AI, it shows up here.",
          )}
        </div>
      ) : null}

      {/* Headline: % arriving with NO AI — the metric that decides the trial. */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card
          label={T("Llegan SIN ninguna IA", "Arrive with NO AI")}
          value={pct(data.noAiRate)}
          hint={T(
            `${data.arrivedWithoutAi} de ${data.arrivedWithAi + data.arrivedWithoutAi}`,
            `${data.arrivedWithoutAi} of ${data.arrivedWithAi + data.arrivedWithoutAi}`,
          )}
          accent="#f59e0b"
          icon={<UserX className="h-3.5 w-3.5" />}
        />
        <Card
          label={T("IA propia (BYOK)", "Own AI (BYOK)")}
          value={pct(data.byokRate)}
          hint={`${data.bySystem.byok} ${T("elecciones", "picks")}`}
          accent="#10b981"
          icon={<KeyRound className="h-3.5 w-3.5" />}
        />
        <Card
          label={T("Cortesía", "Courtesy")}
          value={pct(data.courtesyRate)}
          hint={`${data.bySystem.courtesy} ${T("elecciones", "picks")}`}
          accent="#0ea5e9"
          icon={<Gift className="h-3.5 w-3.5" />}
        />
      </div>

      {/* System split */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <div className="mb-3 text-[13px] font-medium">
          {T("Qué sistema eligen", "Which system they pick")}
        </div>
        <div className="space-y-2">
          <Bar
            label={T("IA propia", "Own AI")}
            count={data.bySystem.byok}
            total={data.resolved}
            color="#10b981"
          />
          <Bar
            label={T("Cortesía", "Courtesy")}
            count={data.bySystem.courtesy}
            total={data.resolved}
            color="#0ea5e9"
          />
          <Bar
            label={T("Ninguna", "None")}
            count={data.bySystem.none}
            total={data.resolved}
            color="#f59e0b"
          />
          {data.bySystem.other > 0 ? (
            <Bar
              label={T("Otro", "Other")}
              count={data.bySystem.other}
              total={data.resolved}
              color="#94a3b8"
            />
          ) : null}
        </div>
      </div>

      {/* Provider breakdown (BYOK only) */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <div className="mb-3 text-[13px] font-medium">
          {T("Proveedor (solo IA propia)", "Provider (BYOK only)")}
        </div>
        <div className="space-y-2">
          <Bar
            label="Claude"
            count={data.byProvider.claude}
            total={data.bySystem.byok}
            color="#d97757"
          />
          <Bar
            label="Codex"
            count={data.byProvider.codex}
            total={data.bySystem.byok}
            color="#6366f1"
          />
          <Bar
            label="Gemini"
            count={data.byProvider.gemini}
            total={data.bySystem.byok}
            color="#4285f4"
          />
          {data.byProvider.other > 0 ? (
            <Bar
              label={T("Otro", "Other")}
              count={data.byProvider.other}
              total={data.bySystem.byok}
              color="#94a3b8"
            />
          ) : null}
        </div>
      </div>

      {/* Courtesy funnel */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card
          label={T("Cortesía iniciada", "Courtesy started")}
          value={String(data.courtesyStarted)}
        />
        <Card
          label={T("Cortesía agotada", "Courtesy exhausted")}
          value={String(data.courtesyExhausted)}
        />
        <Card
          label={T("Convirtió a IA propia", "Converted to own AI")}
          value={String(data.courtesyConverted)}
        />
        <Card
          label={T("Tasa de conversión", "Conversion rate")}
          value={pct(data.courtesyConversionRate)}
          hint={T("de los que probaron cortesía", "of those who tried courtesy")}
        />
      </div>

      {/* Auth banner interactions */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <div className="mb-3 text-[13px] font-medium">
          {T("Aviso de IA no conectada", "AI-not-connected banner")}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Card label={T("Apareció", "Shown")} value={String(data.authNeeded)} />
          <Card label={T("Cambió de IA", "Switched AI")} value={String(data.authSwitched)} />
          <Card label={T("Fue a conectar", "Went to connect")} value={String(data.authConnect)} />
          <Card
            label={T("Tasa de cambio", "Switch rate")}
            value={pct(data.authSwitchRate)}
          />
        </div>
      </div>

      {/* Volume */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card label={T("Total eventos", "Total events")} value={String(data.total)} />
        <Card label={T("Resueltos", "Resolved")} value={String(data.resolved)} />
        <Card label={T("Últimos 7 días", "Last 7 days")} value={String(data.last7)} />
        <Card
          label={T("Último evento", "Latest event")}
          value={
            data.daysSinceLatest === null
              ? "—"
              : data.daysSinceLatest === 0
                ? T("hoy", "today")
                : T(`hace ${data.daysSinceLatest}d`, `${data.daysSinceLatest}d ago`)
          }
        />
      </div>

      {/* Locale + plan mix */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <div className="mb-3 text-[13px] font-medium">{T("Idioma", "Language")}</div>
          <div className="space-y-2">
            {Object.entries(data.byLocale).length === 0 ? (
              <div className="text-[12px] text-[var(--color-fg-muted)]">—</div>
            ) : (
              Object.entries(data.byLocale)
                .sort((a, b) => b[1] - a[1])
                .map(([k, v]) => (
                  <Bar key={k} label={k} count={v} total={data.resolved} color="#8b5cf6" />
                ))
            )}
          </div>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <div className="mb-3 text-[13px] font-medium">{T("Plan", "Plan")}</div>
          <div className="space-y-2">
            {Object.entries(data.byPlan).length === 0 ? (
              <div className="text-[12px] text-[var(--color-fg-muted)]">—</div>
            ) : (
              Object.entries(data.byPlan)
                .sort((a, b) => b[1] - a[1])
                .map(([k, v]) => (
                  <Bar key={k} label={k} count={v} total={data.resolved} color="#ec4899" />
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
