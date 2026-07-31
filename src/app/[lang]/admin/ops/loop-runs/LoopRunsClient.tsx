"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authedFetch, getSupabaseBrowser } from "@/lib/supabase/browser";

type AuthState = "checking" | "anon" | "ready" | "forbidden";

type LoopKind = "connectors" | "plugins" | "kits" | "skills" | "supervision";
type LoopFilter = "all" | LoopKind;

interface LoopRun {
  id: string;
  ran_at: string;
  kind?: LoopKind | null;
  item_slugs?: string[] | null;
  connectors_found: number;
  connectors_skipped: number;
  pr_url: string | null;
}

const FILTERS: { value: LoopFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "connectors", label: "Conectores" },
  { value: "plugins", label: "Plugins" },
  { value: "kits", label: "Kits" },
  { value: "skills", label: "Skills" },
  { value: "supervision", label: "Supervisión" },
];

export function LoopRunsClient() {
  const [auth, setAuth] = useState<AuthState>("checking");
  const [runs, setRuns] = useState<LoopRun[]>([]);
  const [filter, setFilter] = useState<LoopFilter>("all");
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

  const filteredRuns = useMemo(
    () =>
      filter === "all"
        ? runs
        : runs.filter((run) => (run.kind ?? "connectors") === filter),
    [filter, runs],
  );

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)]">
      <section className="mx-auto max-w-5xl px-5 md:px-6 py-10">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--color-fg-muted)]">
              Admin
            </p>
            <h1 className="mt-2 text-[26px] font-semibold tracking-tight text-[var(--color-fg-strong)]">
              Marketplace Loop runs
            </h1>
            <p className="mt-1 text-[13px] text-[var(--color-fg-muted)]">
              Historial de los 4 loops de creación más el loop de supervisión: tipo,
              fecha, encontrados, SKIP, links de landing y evidencia.
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

        {auth === "checking" ? (
          <Banner tone="muted">Verificando sesión…</Banner>
        ) : null}

        {auth === "anon" ? (
          <Banner tone="warn">
            Tenés que estar logueado para ver este historial.{" "}
            <a
              className="underline"
              href={`/es/login?next=${encodeURIComponent("/es/admin/ops/loop-runs")}`}
            >
              Entrar →
            </a>
          </Banner>
        ) : null}

        {auth === "forbidden" ? (
          <Banner tone="warn">
            Tu cuenta está logueada, pero no está en ADMIN_EMAILS.
          </Banner>
        ) : null}

        {error ? <Banner tone="error">{error}</Banner> : null}

        {auth === "ready" ? (
          <>
            <LoopMenu value={filter} onChange={setFilter} />
            <RunsTable runs={filteredRuns} loading={loading} />
          </>
        ) : null}
      </section>
    </main>
  );
}

function LoopMenu({
  value,
  onChange,
}: {
  value: LoopFilter;
  onChange: (value: LoopFilter) => void;
}) {
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {FILTERS.map((filter) => {
        const selected = value === filter.value;
        return (
          <button
            key={filter.value}
            type="button"
            onClick={() => onChange(filter.value)}
            className={
              selected
                ? "rounded-full bg-[var(--color-fg-strong)] px-3 py-1.5 text-[12px] font-medium text-[var(--color-bg)]"
                : "rounded-full border border-[var(--color-border)] px-3 py-1.5 text-[12px] font-medium text-[var(--color-fg-muted)] hover:bg-[var(--color-panel)] hover:text-[var(--color-fg-strong)]"
            }
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}

function RunsTable({ runs, loading }: { runs: LoopRun[]; loading: boolean }) {
  if (loading && runs.length === 0)
    return <Banner tone="muted">Cargando corridas…</Banner>;
  if (runs.length === 0)
    return (
      <Banner tone="muted">Todavía no hay corridas para este loop.</Banner>
    );

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)]/60">
      <table className="w-full border-collapse text-left text-[13px]">
        <thead className="border-b border-[var(--color-border)] text-[11px] font-mono uppercase tracking-[0.14em] text-[var(--color-fg-muted)]">
          <tr>
            <th className="px-4 py-3 font-medium">Tipo</th>
            <th className="px-4 py-3 font-medium">Fecha/hora</th>
            <th className="px-4 py-3 font-medium text-right">Encontró</th>
            <th className="px-4 py-3 font-medium text-right">SKIP</th>
            <th className="px-4 py-3 font-medium">Landing</th>
            <th className="px-4 py-3 font-medium">Evidencia</th>
          </tr>
        </thead>
        <tbody>
          {runs.map((run) => {
            const kind = run.kind ?? "connectors";
            return (
              <tr
                key={run.id}
                className="border-b border-[var(--color-border)]/70 last:border-0"
              >
                <td className="px-4 py-3">
                  <KindBadge kind={kind} />
                </td>
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
                  <LandingLinks kind={kind} slugs={run.item_slugs ?? []} />
                </td>
                <td className="px-4 py-3">
                  <EvidenceLink url={run.pr_url} kind={kind} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function LandingLinks({ kind, slugs }: { kind: LoopKind; slugs: string[] }) {
  if (kind === "supervision") {
    return (
      <span className="text-[var(--color-fg-muted)]">
        Verifica landing ↔ app
      </span>
    );
  }

  const safeSlugs = slugs.filter((slug) => /^[a-z0-9][a-z0-9-]*$/.test(slug));
  if (safeSlugs.length === 0) {
    return (
      <span className="text-[var(--color-fg-muted)]">Sin links todavía</span>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {safeSlugs.map((slug) => (
        <a
          key={slug}
          href={landingHref(kind, slug)}
          className="rounded-full border border-[var(--color-border)] px-2.5 py-1 text-[12px] font-medium text-[var(--color-accent)] underline-offset-4 hover:underline"
        >
          {labelFromSlug(slug)}
        </a>
      ))}
    </div>
  );
}

function landingHref(kind: Exclude<LoopKind, "supervision">, slug: string) {
  const base: Record<Exclude<LoopKind, "supervision">, string> = {
    connectors: "connectors",
    plugins: "plugins",
    kits: "stacks",
    skills: "skills",
  };
  return `/es/${base[kind]}/${slug}`;
}

function EvidenceLink({ url, kind }: { url: string | null; kind: LoopKind }) {
  if (!url) {
    return <span className="text-[var(--color-fg-muted)]">Sin evidencia</span>;
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="text-[12px] font-medium text-[var(--color-accent)] underline-offset-4 hover:underline"
    >
      {kind === "supervision" ? "Ver run" : "Ver PR"}
    </a>
  );
}

function labelFromSlug(slug: string) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function KindBadge({ kind }: { kind: LoopKind }) {
  const labels: Record<LoopKind, string> = {
    connectors: "Conectores",
    plugins: "Plugins",
    kits: "Kits",
    skills: "Skills",
    supervision: "Supervisión",
  };
  return (
    <span className="inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-fg-strong)]">
      {labels[kind] ?? labels.connectors}
    </span>
  );
}

function Banner({
  tone,
  children,
}: {
  tone: "muted" | "warn" | "error";
  children: ReactNode;
}) {
  const cls =
    tone === "error"
      ? "border-red-500/40 bg-red-500/10 text-red-800 dark:text-red-200"
      : tone === "warn"
        ? "border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-200"
        : "border-[var(--color-border)] bg-[var(--color-panel)]/60 text-[var(--color-fg-muted)]";
  return (
    <div className={`rounded-2xl border p-5 text-[14px] ${cls}`}>
      {children}
    </div>
  );
}
