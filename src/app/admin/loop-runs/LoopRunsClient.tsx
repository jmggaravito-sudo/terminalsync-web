"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { authedFetch, getSupabaseBrowser } from "@/lib/supabase/browser";

type AuthState = "checking" | "anon" | "ready" | "forbidden";

interface LoopRun {
  id: string;
  ran_at: string;
  connectors_found: number;
  connectors_skipped: number;
  pr_url: string | null;
}

export function LoopRunsClient() {
  const [auth, setAuth] = useState<AuthState>("checking");
  const [runs, setRuns] = useState<LoopRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authedFetch("/api/admin/loop-runs");
      if (res.status === 401) {
        setAuth("anon");
        setRuns([]);
        return;
      }
      if (res.status === 403) {
        setAuth("forbidden");
        setRuns([]);
        return;
      }
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `API ${res.status}`);
      setRuns(Array.isArray(json.runs) ? json.runs : []);
      setAuth("ready");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const sb = getSupabaseBrowser();
    if (!sb) {
      setAuth("anon");
      setLoading(false);
      return;
    }

    sb.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setAuth("anon");
        setLoading(false);
      } else {
        void load();
      }
    });

    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setAuth("anon");
        setRuns([]);
        setLoading(false);
      } else {
        void load();
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [load]);

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)]">
      <section className="mx-auto max-w-5xl px-5 md:px-6 py-10">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--color-fg-muted)]">
              Admin
            </p>
            <h1 className="mt-2 text-[26px] font-semibold tracking-tight text-[var(--color-fg-strong)]">
              Connector Loop runs
            </h1>
            <p className="mt-1 text-[13px] text-[var(--color-fg-muted)]">
              Historial operacional mínimo: fecha, encontrados, SKIP y PR abierto.
            </p>
          </div>
          {auth === "ready" ? (
            <button
              onClick={() => void load()}
              disabled={loading}
              className="self-start rounded-full border border-[var(--color-border)] px-3 py-1.5 text-[12px] hover:bg-[var(--color-panel)] disabled:opacity-50 sm:self-auto"
            >
              {loading ? "Actualizando…" : "Refrescar"}
            </button>
          ) : null}
        </header>

        {auth === "checking" ? <Banner tone="muted">Verificando sesión…</Banner> : null}

        {auth === "anon" ? (
          <Banner tone="warn">
            Tenés que estar logueado para ver este historial.{" "}
            <a className="underline" href={`/es/login?next=${encodeURIComponent("/admin/loop-runs")}`}>
              Entrar →
            </a>
          </Banner>
        ) : null}

        {auth === "forbidden" ? (
          <Banner tone="warn">Tu cuenta está logueada, pero no está en ADMIN_EMAILS.</Banner>
        ) : null}

        {error ? <Banner tone="error">{error}</Banner> : null}

        {auth === "ready" ? <RunsTable runs={runs} loading={loading} /> : null}
      </section>
    </main>
  );
}

function RunsTable({ runs, loading }: { runs: LoopRun[]; loading: boolean }) {
  if (loading && runs.length === 0) return <Banner tone="muted">Cargando corridas…</Banner>;
  if (runs.length === 0) return <Banner tone="muted">Todavía no hay corridas registradas.</Banner>;

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)]/60">
      <table className="w-full border-collapse text-left text-[13px]">
        <thead className="border-b border-[var(--color-border)] text-[11px] font-mono uppercase tracking-[0.14em] text-[var(--color-fg-muted)]">
          <tr>
            <th className="px-4 py-3 font-medium">Fecha/hora</th>
            <th className="px-4 py-3 font-medium text-right">Encontró</th>
            <th className="px-4 py-3 font-medium text-right">SKIP</th>
            <th className="px-4 py-3 font-medium">PR</th>
          </tr>
        </thead>
        <tbody>
          {runs.map((run) => (
            <tr key={run.id} className="border-b border-[var(--color-border)]/70 last:border-0">
              <td className="px-4 py-3 text-[var(--color-fg)]">
                {new Date(run.ran_at).toLocaleString("es-CO", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </td>
              <td className="px-4 py-3 text-right font-mono text-[var(--color-fg-strong)]">
                {run.connectors_found}
              </td>
              <td className="px-4 py-3 text-right font-mono text-amber-300">
                {run.connectors_skipped}
              </td>
              <td className="px-4 py-3">
                {run.pr_url ? (
                  <a
                    href={run.pr_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[var(--color-accent)] underline-offset-4 hover:underline"
                  >
                    Ver PR
                  </a>
                ) : (
                  <span className="text-[var(--color-fg-muted)]">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Banner({ tone, children }: { tone: "muted" | "warn" | "error"; children: ReactNode }) {
  const cls =
    tone === "error"
      ? "border-red-500/30 bg-red-500/5 text-red-300"
      : tone === "warn"
        ? "border-amber-500/30 bg-amber-500/5 text-amber-200"
        : "border-[var(--color-border)] bg-[var(--color-panel)]/60 text-[var(--color-fg-muted)]";
  return <div className={`rounded-2xl border p-5 text-[14px] ${cls}`}>{children}</div>;
}
