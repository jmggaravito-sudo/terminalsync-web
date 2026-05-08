"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Pause,
  ExternalLink,
  Inbox,
} from "lucide-react";

interface OpsWorkflow {
  id: string;
  name: string;
  active: boolean;
  archived: boolean;
  project: string;
  description: string | null;
  cadence: string | null;
  updatedAt: string | null;
  todayCount: number;
  todaySuccess: number;
  todayError: number;
  lastExec: {
    id: string;
    status: string;
    startedAt: string;
    durationMs: number | null;
  } | null;
  recent: { id: string; status: string; startedAt: string }[];
}

interface OpsResponse {
  items: OpsWorkflow[];
  projects: { name: string; total: number; active: number; runs24h: number; errors24h: number }[];
  totals: { workflows: number; active: number; runs24h: number; errors24h: number };
  n8nUrl: string;
}

const PROJECT_LABEL: Record<string, string> = {
  MTC: "MueveTuCarro",
  NexFlowAI: "NexFlowAI",
  Kelaya: "Kelaya",
  Selva: "Selva",
  TerminalSync: "TerminalSync",
  Trends: "Trends Radar",
  Other: "Otros",
};

const PROJECT_EMOJI: Record<string, string> = {
  MTC: "🚗",
  NexFlowAI: "⚡",
  Kelaya: "💆",
  Selva: "👗",
  TerminalSync: "💻",
  Trends: "📡",
  Other: "📦",
};

const PROJECT_ORDER = ["MTC", "NexFlowAI", "Kelaya", "Selva", "TerminalSync", "Trends", "Other"];

export function OpsDashboard({ lang }: { lang: string }) {
  const isEs = lang === "es";
  const [data, setData] = useState<OpsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/ops")
      .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (!ok) throw new Error(d.error ?? "Error");
        setData(d);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Error"))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-6 text-center text-[var(--color-fg-muted)]">
        {isEs ? "Cargando…" : "Loading…"}
      </div>
    );

  if (error)
    return (
      <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-red-400 text-[13px]">
        {error}
      </div>
    );

  if (!data) return null;

  // Group items by project, in fixed order
  const grouped = new Map<string, OpsWorkflow[]>();
  for (const it of data.items) {
    if (it.archived) continue;
    const arr = grouped.get(it.project) ?? [];
    arr.push(it);
    grouped.set(it.project, arr);
  }
  // Sort each group: errors first, then active, then by name
  for (const arr of grouped.values()) {
    arr.sort((a, b) => {
      if (a.todayError !== b.todayError) return b.todayError - a.todayError;
      if (a.active !== b.active) return a.active ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }
  const orderedProjects = PROJECT_ORDER.filter((p) => grouped.has(p));

  const hasErrors = data.totals.errors24h > 0;

  return (
    <div className="space-y-8">
      {/* Top summary — at-a-glance */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <BigStat
          label={isEs ? "Trabajando" : "Working"}
          value={data.totals.active}
          subtext={`${isEs ? "de" : "of"} ${data.totals.workflows}`}
          tone="emerald"
        />
        <BigStat
          label={isEs ? "Mensajes hoy" : "Runs today"}
          value={data.totals.runs24h}
          subtext={isEs ? "últimas 24h" : "last 24h"}
          tone="sky"
        />
        <BigStat
          label={isEs ? "Con problemas" : "Errors"}
          value={data.totals.errors24h}
          subtext={isEs ? "últimas 24h" : "last 24h"}
          tone={hasErrors ? "red" : "muted"}
        />
        <BigStat
          label={isEs ? "Pausados" : "Paused"}
          value={data.totals.workflows - data.totals.active}
          subtext={isEs ? "no se usan" : "inactive"}
          tone="muted"
        />
      </section>

      {/* Per-project sections */}
      {orderedProjects.map((proj) => {
        const arr = grouped.get(proj)!;
        const pStats = data.projects.find((p) => p.name === proj);
        return (
          <section key={proj}>
            <header className="flex items-baseline justify-between mb-3">
              <h2 className="text-[18px] font-semibold tracking-tight flex items-center gap-2">
                <span className="text-[20px]">{PROJECT_EMOJI[proj] ?? "📦"}</span>
                {PROJECT_LABEL[proj] ?? proj}
              </h2>
              {pStats && (
                <span className="text-[12px] font-mono text-[var(--color-fg-dim)]">
                  {pStats.active}/{pStats.total} {isEs ? "activos" : "active"} ·{" "}
                  {pStats.runs24h} {isEs ? "runs hoy" : "runs today"}
                  {pStats.errors24h > 0 && (
                    <span className="ml-1 text-red-400">
                      · {pStats.errors24h} {isEs ? "errores" : "errors"}
                    </span>
                  )}
                </span>
              )}
            </header>
            <ul className="space-y-2">
              {arr.map((wf) => (
                <WorkflowCard
                  key={wf.id}
                  wf={wf}
                  n8nUrl={data.n8nUrl}
                  isEs={isEs}
                />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function BigStat({
  label,
  value,
  subtext,
  tone,
}: {
  label: string;
  value: number;
  subtext: string;
  tone: "emerald" | "sky" | "red" | "muted";
}) {
  const colors: Record<string, string> = {
    emerald: "text-emerald-400 border-emerald-500/30 bg-emerald-500/8",
    sky: "text-sky-400 border-sky-500/30 bg-sky-500/8",
    red: "text-red-400 border-red-500/40 bg-red-500/12",
    muted: "text-[var(--color-fg-muted)] border-[var(--color-border)] bg-[var(--color-panel)]",
  };
  return (
    <div className={`rounded-2xl border p-4 ${colors[tone]}`}>
      <p className="text-[11px] font-mono uppercase tracking-[0.12em] opacity-80">{label}</p>
      <p className="mt-1 text-[28px] font-semibold leading-none">{value}</p>
      <p className="mt-1 text-[11px] opacity-70">{subtext}</p>
    </div>
  );
}

function WorkflowCard({
  wf,
  n8nUrl,
  isEs,
}: {
  wf: OpsWorkflow;
  n8nUrl: string;
  isEs: boolean;
}) {
  const editorUrl = `${n8nUrl}/workflow/${wf.id}`;

  // Decide overall mood: red if errors today, amber if paused, green if active.
  const mood: "ok" | "warn" | "err" | "off" =
    !wf.active
      ? "off"
      : wf.todayError > 0
      ? "err"
      : wf.todayCount > 0
      ? "ok"
      : "warn";

  const moodMap = {
    ok: { ring: "border-l-emerald-500", chip: "bg-emerald-500/15 text-emerald-400", icon: <CheckCircle2 size={13} /> },
    warn: { ring: "border-l-amber-500/70", chip: "bg-amber-500/15 text-amber-400", icon: <Clock size={13} /> },
    err: { ring: "border-l-red-500", chip: "bg-red-500/15 text-red-400", icon: <XCircle size={13} /> },
    off: { ring: "border-l-[var(--color-border)]", chip: "bg-[var(--color-panel-2)]/60 text-[var(--color-fg-dim)]", icon: <Pause size={13} /> },
  } as const;

  const moodLabel = {
    ok: isEs ? "trabajando" : "working",
    warn: isEs ? "sin actividad hoy" : "idle today",
    err: isEs ? "con error" : "errors",
    off: isEs ? "pausado" : "paused",
  } as const;

  return (
    <li
      className={`rounded-xl border border-[var(--color-border)] border-l-[3px] ${moodMap[mood].ring} bg-[var(--color-panel)] p-4`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-[14px] font-semibold tracking-tight text-[var(--color-fg-strong)] truncate">
              {wf.name}
            </h3>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.08em] ${moodMap[mood].chip}`}
            >
              {moodMap[mood].icon}
              {moodLabel[mood]}
            </span>
          </div>
          {wf.description && (
            <p className="mt-1.5 text-[12.5px] text-[var(--color-fg-muted)] leading-relaxed">
              {wf.description}
            </p>
          )}
          <div className="mt-2 flex flex-wrap gap-3 text-[11px] font-mono text-[var(--color-fg-dim)]">
            {wf.cadence && (
              <span className="inline-flex items-center gap-1">
                <Clock size={11} />
                {wf.cadence}
              </span>
            )}
            <span>
              {isEs ? "Hoy:" : "Today:"}{" "}
              <span className="text-[var(--color-fg)]">{wf.todayCount} {isEs ? "veces" : "runs"}</span>
              {wf.todayCount > 0 && (
                <>
                  {" "}
                  ·{" "}
                  <span className="text-emerald-400">✓ {wf.todaySuccess}</span>
                  {wf.todayError > 0 && (
                    <>
                      {" "}
                      · <span className="text-red-400">✗ {wf.todayError}</span>
                    </>
                  )}
                </>
              )}
            </span>
            {wf.lastExec && (
              <span>
                {isEs ? "Última:" : "Last:"} {timeAgo(wf.lastExec.startedAt, isEs)}
              </span>
            )}
          </div>
          {/* Sparkline of last 5 runs */}
          {wf.recent.length > 0 && (
            <div className="mt-2.5 flex gap-1">
              {wf.recent.slice().reverse().map((e) => (
                <span
                  key={e.id}
                  title={`${e.status} · ${new Date(e.startedAt).toLocaleString()}`}
                  className={`h-2 flex-1 max-w-[40px] rounded-sm ${
                    e.status === "success"
                      ? "bg-emerald-500/70"
                      : e.status === "error"
                      ? "bg-red-500/70"
                      : "bg-amber-500/70"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
        <a
          href={editorUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-2)]/60 hover:bg-[var(--color-panel-2)] px-2.5 py-1.5 text-[11px] font-medium text-[var(--color-fg-muted)] transition-colors"
          title={isEs ? "Abrir en n8n" : "Open in n8n"}
        >
          <ExternalLink size={11} />
          n8n
        </a>
      </div>
    </li>
  );
}

function timeAgo(iso: string, isEs: boolean): string {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.round(ms / 60_000);
  if (m < 1) return isEs ? "ahora" : "just now";
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.round(h / 24);
  return `${d}${isEs ? "d" : "d"}`;
}

// Empty-state placeholder, currently unused — kept around because the
// dashboard will eventually want to render it for projects with zero
// active workflows.
export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-panel)] p-6 text-center">
      <Inbox className="mx-auto h-6 w-6 text-[var(--color-fg-dim)]" />
      <p className="mt-2 text-[13px] text-[var(--color-fg-muted)]">{message}</p>
    </div>
  );
}
