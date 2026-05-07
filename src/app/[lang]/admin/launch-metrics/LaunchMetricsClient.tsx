"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

interface Metrics {
  generatedAt: string;
  outreach: { target: number; sent: number | null; replied: number | null; responseRate: number | null };
  signups: { total: number | null; last7d: number | null; last30d: number | null; daily: { day: string; count: number }[] | null };
  revenue: { activeSubscriptions: number | null; mrr: number | null; trialConversionPct: number | null };
  welcomeFlow: { fired: number | null; failed: number | null };
  warnings: string[];
}

export function LaunchMetricsClient({ lang }: { lang: string }) {
  const isEs = lang === "es";
  const [data, setData] = useState<Metrics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const sb = getSupabaseBrowser();
      const token = sb ? (await sb.auth.getSession()).data.session?.access_token : null;
      if (!token) {
        setError(isEs ? "No estás logueado." : "Not signed in.");
        setLoading(false);
        return;
      }
      const r = await fetch("/api/admin/launch-metrics", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (r.status === 403) {
        setError(isEs ? "No sos admin." : "Not authorized.");
        setLoading(false);
        return;
      }
      if (!r.ok) {
        setError(`API ${r.status}`);
        setLoading(false);
        return;
      }
      setData(await r.json());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
    setLoading(false);
  }

  useEffect(() => {
    void load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)]">
      <section className="mx-auto max-w-6xl px-5 md:px-6 py-10">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[26px] font-semibold tracking-tight text-[var(--color-fg-strong)]">
              {isEs ? "Launch Metrics" : "Launch Metrics"}
            </h1>
            <p className="text-[13px] text-[var(--color-fg-muted)] mt-1">
              {data
                ? `${isEs ? "Última actualización" : "Last refreshed"}: ${new Date(data.generatedAt).toLocaleTimeString()}`
                : isEs ? "Cargando…" : "Loading…"}
            </p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="text-[12px] px-3 py-1.5 rounded-full border border-[var(--color-border)] hover:bg-[var(--color-panel)] disabled:opacity-50"
          >
            {loading ? (isEs ? "Actualizando…" : "Refreshing…") : (isEs ? "Refrescar" : "Refresh")}
          </button>
        </header>

        {error ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-5 text-[14px] text-red-400">{error}</div>
        ) : null}

        {data ? (
          <>
            {data.warnings.length > 0 ? (
              <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
                <p className="text-[12px] font-mono uppercase tracking-[0.14em] text-amber-400 mb-1.5">
                  {isEs ? "Datos parciales" : "Partial data"}
                </p>
                <ul className="text-[13px] text-[var(--color-fg-muted)] space-y-1">
                  {data.warnings.map((w, i) => <li key={i}>· {w}</li>)}
                </ul>
              </div>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card title={isEs ? "Outreach enviados" : "Outreach sent"}
                value={data.outreach.sent}
                sub={`/ ${data.outreach.target} ${isEs ? "objetivo" : "target"}`}
              />
              <Card title={isEs ? "Respuestas" : "Replies"}
                value={data.outreach.replied}
                sub={data.outreach.responseRate != null
                  ? `${(data.outreach.responseRate * 100).toFixed(1)}% ${isEs ? "tasa de respuesta" : "response rate"}`
                  : isEs ? "sin envíos aún" : "no sends yet"}
              />
              <Card title={isEs ? "Welcome emails" : "Welcome emails"}
                value={data.welcomeFlow.fired}
                sub={data.welcomeFlow.failed != null && data.welcomeFlow.failed > 0
                  ? `${data.welcomeFlow.failed} ${isEs ? "fallidos" : "failed"}`
                  : isEs ? "sin fallos (30d)" : "no failures (30d)"}
                tone={(data.welcomeFlow.failed ?? 0) > 0 ? "warn" : "ok"}
              />
              <Card title={isEs ? "Signups totales" : "Total signups"}
                value={data.signups.total}
                sub={`+${data.signups.last7d ?? 0} ${isEs ? "últimos 7d" : "last 7d"}`}
              />
              <Card title={isEs ? "Subscripciones activas" : "Active subs"}
                value={data.revenue.activeSubscriptions}
                sub={data.revenue.trialConversionPct != null
                  ? `${data.revenue.trialConversionPct}% ${isEs ? "conversión trial" : "trial conv"}`
                  : ""}
              />
              <Card title="MRR"
                value={data.revenue.mrr != null ? `$${data.revenue.mrr.toLocaleString()}` : null}
                sub=""
                accent
              />
            </div>

            {data.signups.daily ? (
              <section className="mt-10">
                <h2 className="text-[14px] font-mono uppercase tracking-[0.14em] text-[var(--color-fg-muted)] mb-4">
                  {isEs ? "Signups diarios — 30 días" : "Daily signups — last 30 days"}
                </h2>
                <SparkBars data={data.signups.daily} />
              </section>
            ) : null}
          </>
        ) : null}
      </section>
    </main>
  );
}

function Card({ title, value, sub, accent, tone }: {
  title: string;
  value: number | string | null;
  sub: string;
  accent?: boolean;
  tone?: "ok" | "warn";
}) {
  const display = value === null ? "—" : value;
  return (
    <div className={`rounded-2xl border p-5 ${accent
      ? "border-[var(--color-accent)]/40 bg-[var(--color-accent)]/5"
      : "border-[var(--color-border)] bg-[var(--color-panel)]/60"}`}>
      <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-[var(--color-fg-muted)]">{title}</p>
      <p className={`mt-2 text-[28px] font-semibold tracking-tight ${accent
        ? "text-[var(--color-accent)]"
        : "text-[var(--color-fg-strong)]"}`}>
        {display}
      </p>
      {sub ? (
        <p className={`mt-1 text-[12px] ${tone === "warn"
          ? "text-amber-400"
          : "text-[var(--color-fg-muted)]"}`}>{sub}</p>
      ) : null}
    </div>
  );
}

function SparkBars({ data }: { data: { day: string; count: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)]/60 p-5">
      <div className="flex items-end gap-1 h-32">
        {data.map((d) => (
          <div
            key={d.day}
            className="flex-1 bg-[var(--color-accent)] rounded-t opacity-80 hover:opacity-100 transition-opacity"
            style={{ height: `${Math.max(2, (d.count / max) * 100)}%` }}
            title={`${d.day}: ${d.count}`}
          />
        ))}
      </div>
      <div className="flex justify-between mt-2 text-[10px] text-[var(--color-fg-muted)] font-mono">
        <span>{data[0]?.day}</span>
        <span>{data[data.length - 1]?.day}</span>
      </div>
    </div>
  );
}
