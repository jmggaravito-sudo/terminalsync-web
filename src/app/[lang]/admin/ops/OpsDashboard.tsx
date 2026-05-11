"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Pause,
  ExternalLink,
  Inbox,
  ChevronDown,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { EmailTemplatesPanel } from "./EmailTemplatesPanel";
import { AutoRepairPanel } from "./AutoRepairPanel";

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
  Other: "Otros",
};

const PROJECT_EMOJI: Record<string, string> = {
  MTC: "🚗",
  NexFlowAI: "⚡",
  Kelaya: "💆",
  Selva: "👗",
  TerminalSync: "💻",
  Other: "📦",
};

const PROJECT_ORDER = ["TerminalSync", "NexFlowAI", "MTC", "Kelaya", "Selva", "Other"];

export function OpsDashboard({ lang }: { lang: string }) {
  const isEs = lang === "es";
  const [data, setData] = useState<OpsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string>("TerminalSync");

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

      {/* Project menu — horizontal tabs. TerminalSync first, Auto-
          Repair is its own tab at the end so JM can jump straight to
          pending Claude-proposed fixes. */}
      <nav className="flex flex-wrap gap-2 border-b border-[var(--color-border)] pb-1">
        {orderedProjects.map((proj) => {
          const pStats = data.projects.find((p) => p.name === proj);
          const isActive = selectedProject === proj;
          const errorCount = pStats?.errors24h ?? 0;
          return (
            <button
              key={proj}
              onClick={() => setSelectedProject(proj)}
              className={`group inline-flex items-center gap-2 rounded-t-xl rounded-b-none border border-b-0 px-4 py-2.5 text-[13px] font-semibold transition-all ${
                isActive
                  ? "bg-[var(--color-panel)] border-[var(--color-border)] text-[var(--color-fg-strong)] -mb-px relative z-10"
                  : "bg-[var(--color-panel-2)]/40 border-transparent text-[var(--color-fg-muted)] hover:bg-[var(--color-panel-2)]/70 hover:text-[var(--color-fg)]"
              }`}
            >
              <span className="text-[16px]">{PROJECT_EMOJI[proj] ?? "📦"}</span>
              <span>{PROJECT_LABEL[proj] ?? proj}</span>
              {pStats && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-mono ${
                    errorCount > 0
                      ? "bg-red-500/20 text-red-300"
                      : isActive
                      ? "bg-[var(--color-accent)]/15 text-[var(--color-accent)]"
                      : "bg-[var(--color-panel-2)]/80 text-[var(--color-fg-dim)]"
                  }`}
                >
                  {pStats.active}/{pStats.total}
                </span>
              )}
              {errorCount > 0 && (
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              )}
            </button>
          );
        })}
        <button
          onClick={() => setSelectedProject("_repair")}
          className={`group inline-flex items-center gap-2 rounded-t-xl rounded-b-none border border-b-0 px-4 py-2.5 text-[13px] font-semibold transition-all ${
            selectedProject === "_repair"
              ? "bg-[var(--color-panel)] border-[var(--color-border)] text-[var(--color-fg-strong)] -mb-px relative z-10"
              : "bg-[var(--color-panel-2)]/40 border-transparent text-[var(--color-fg-muted)] hover:bg-[var(--color-panel-2)]/70 hover:text-[var(--color-fg)]"
          }`}
        >
          <span className="text-[16px]">🛠️</span>
          <span>{isEs ? "Auto-Reparación" : "Auto-Repair"}</span>
        </button>
      </nav>

      {/* Auto-Repair tab — separate render path. Falls through to the
          per-project workflow listing for every other tab. */}
      {selectedProject === "_repair" ? (
        <AutoRepairPanel isEs={isEs} n8nUrl={data.n8nUrl} />
      ) : null}

      {/* Selected project's workflows */}
      {selectedProject !== "_repair" && (() => {
        const arr = grouped.get(selectedProject) ?? [];
        const pStats = data.projects.find((p) => p.name === selectedProject);
        if (arr.length === 0) {
          return (
            <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-panel)] p-8 text-center text-[var(--color-fg-muted)]">
              <Inbox className="mx-auto h-6 w-6 opacity-60" />
              <p className="mt-2 text-[13px]">
                {isEs
                  ? "No hay flujos en este proyecto"
                  : "No flows in this project"}
              </p>
            </div>
          );
        }
        return (
          <section>
            <header className="flex items-baseline justify-between mb-4">
              <h2 className="text-[20px] font-semibold tracking-tight flex items-center gap-2">
                <span className="text-[24px]">
                  {PROJECT_EMOJI[selectedProject] ?? "📦"}
                </span>
                {PROJECT_LABEL[selectedProject] ?? selectedProject}
              </h2>
              {pStats && (
                <span className="text-[12px] font-mono text-[var(--color-fg-dim)]">
                  {pStats.active}/{pStats.total}{" "}
                  {isEs ? "activos" : "active"} · {pStats.runs24h}{" "}
                  {isEs ? "runs hoy" : "runs today"}
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
      })()}
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
              <span title={new Date(wf.lastExec.startedAt).toLocaleString()}>
                {isEs ? "Última actividad:" : "Last activity:"}{" "}
                <span className="text-[var(--color-fg)]">
                  {formatDateTime(wf.lastExec.startedAt, isEs)}
                </span>
                {" · "}
                <span className="text-[var(--color-fg-dim)]">
                  {isEs ? "hace" : ""} {timeAgo(wf.lastExec.startedAt, isEs)}
                </span>
              </span>
            )}
          </div>
          {/* Recent runs — sparkline + clickable detail per run. JM
              opens any of them to see what each one did/what failed. */}
          {wf.recent.length > 0 && (
            <RecentRunsPanel runs={wf.recent} n8nUrl={n8nUrl} isEs={isEs} />
          )}
          <EmailTemplatesPanel workflowId={wf.id} isEs={isEs} />
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

interface ExecutionDetail {
  id: string;
  workflowId: string | null;
  workflowName: string | null;
  status: string;
  startedAt: string | null;
  stoppedAt: string | null;
  durationMs: number | null;
  lastNode: string | null;
  error: {
    message: string | null;
    node: string | null;
    description: string | null;
  } | null;
  nodes: Array<{
    name: string;
    status: "ok" | "error";
    runs: number;
    itemsOut: number;
    durationMs: number | null;
    errorMessage: string | null;
    sample: string | null;
  }>;
}

/** Clickable list of recent runs. Sparkline up top is the at-a-glance
 *  view; clicking it (or the time chips below) expands the detail panel
 *  for that specific execution. */
function RecentRunsPanel({
  runs,
  n8nUrl,
  isEs,
}: {
  runs: { id: string; status: string; startedAt: string }[];
  n8nUrl: string;
  isEs: boolean;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ExecutionDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function loadDetail(id: string) {
    if (openId === id) {
      setOpenId(null);
      setDetail(null);
      return;
    }
    setOpenId(id);
    setDetail(null);
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch(`/api/admin/ops/executions/${id}`);
      const j = await r.json();
      if (!r.ok) throw new Error(j.error ?? `HTTP ${r.status}`);
      setDetail(j);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-3 space-y-2">
      {/* Sparkline — visible chronological strip (oldest left → newest right) */}
      <div className="flex gap-1">
        {runs
          .slice()
          .reverse()
          .map((e) => (
            <button
              key={e.id}
              onClick={() => loadDetail(e.id)}
              title={`${e.status} · ${new Date(e.startedAt).toLocaleString()}`}
              className={`h-2 flex-1 max-w-[40px] rounded-sm transition-all hover:h-3 ${
                e.status === "success"
                  ? "bg-emerald-500/70 hover:bg-emerald-400"
                  : e.status === "error"
                  ? "bg-red-500/70 hover:bg-red-400"
                  : "bg-amber-500/70 hover:bg-amber-400"
              } ${openId === e.id ? "ring-2 ring-[var(--color-accent)]" : ""}`}
            />
          ))}
      </div>

      {/* Compact list of run chips — same data, easier to click on
          mobile, surfaces the time. */}
      <div className="flex flex-wrap gap-1.5">
        {runs.map((e) => {
          const isOpen = openId === e.id;
          return (
            <button
              key={e.id}
              onClick={() => loadDetail(e.id)}
              className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10.5px] font-mono transition-colors ${
                isOpen
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                  : "border-[var(--color-border)] bg-[var(--color-panel-2)]/60 hover:bg-[var(--color-panel-2)] text-[var(--color-fg-muted)]"
              }`}
            >
              {e.status === "success" ? (
                <CheckCircle2 size={10} className="text-emerald-400" />
              ) : e.status === "error" ? (
                <XCircle size={10} className="text-red-400" />
              ) : (
                <Clock size={10} className="text-amber-400" />
              )}
              <span>{formatTime(e.startedAt, isEs)}</span>
              <ChevronDown
                size={10}
                className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
          );
        })}
      </div>

      {openId && (
        <ExecutionDetailPanel
          loading={loading}
          err={err}
          detail={detail}
          n8nUrl={n8nUrl}
          isEs={isEs}
        />
      )}
    </div>
  );
}

function ExecutionDetailPanel({
  loading,
  err,
  detail,
  n8nUrl,
  isEs,
}: {
  loading: boolean;
  err: string | null;
  detail: ExecutionDetail | null;
  n8nUrl: string;
  isEs: boolean;
}) {
  if (loading) {
    return (
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-2)]/40 p-3 text-[11.5px] text-[var(--color-fg-muted)] flex items-center gap-2">
        <Loader2 size={12} className="animate-spin" />
        {isEs ? "Cargando detalle…" : "Loading detail…"}
      </div>
    );
  }
  if (err) {
    return (
      <div className="rounded-lg border border-red-500/40 bg-red-500/8 p-3 text-[11.5px] text-red-300">
        {err}
      </div>
    );
  }
  if (!detail) return null;

  const editorUrl = `${n8nUrl}/workflow/${detail.workflowId ?? ""}/executions/${detail.id}`;

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)]/50 p-3 space-y-3">
      {/* Header line */}
      <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-[var(--color-fg-dim)]">
        <span
          className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 ${
            detail.status === "success"
              ? "bg-emerald-500/15 text-emerald-400"
              : detail.status === "error"
              ? "bg-red-500/15 text-red-400"
              : "bg-amber-500/15 text-amber-400"
          }`}
        >
          {detail.status}
        </span>
        {detail.startedAt && (
          <span>{new Date(detail.startedAt).toLocaleString(isEs ? "es-CO" : "en-US")}</span>
        )}
        {detail.durationMs !== null && (
          <span>
            {(detail.durationMs / 1000).toFixed(2)}s
          </span>
        )}
        <span>
          {detail.nodes.length} {isEs ? "nodos" : "nodes"}
        </span>
        <a
          href={editorUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto inline-flex items-center gap-1 text-[var(--color-fg-muted)] hover:text-[var(--color-accent)]"
        >
          <ExternalLink size={10} />
          {isEs ? "abrir en n8n" : "open in n8n"}
        </a>
      </div>

      {/* Error banner — sits above the node walk when there's a top-
          level error so JM sees it without scrolling. */}
      {detail.error && (
        <div className="rounded border border-red-500/40 bg-red-500/8 p-2.5 text-[12px] text-red-200">
          <div className="flex items-start gap-2">
            <AlertTriangle size={13} className="shrink-0 mt-0.5 text-red-400" />
            <div className="min-w-0">
              <p className="font-semibold">
                {detail.error.node ?? (isEs ? "Error" : "Error")}
              </p>
              {detail.error.message && (
                <p className="mt-0.5 text-red-300/90 leading-snug">
                  {detail.error.message}
                </p>
              )}
              {detail.error.description && (
                <p className="mt-1 text-[11px] text-red-300/70 leading-snug">
                  {detail.error.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Node walk — what ran, what it produced. Errored nodes float
          to the top thanks to the API sort. */}
      <ul className="space-y-1.5">
        {detail.nodes.map((node) => (
          <li
            key={node.name}
            className={`rounded border px-2.5 py-2 ${
              node.status === "error"
                ? "border-red-500/40 bg-red-500/5"
                : "border-[var(--color-border)]/70 bg-[var(--color-panel-2)]/30"
            }`}
          >
            <div className="flex items-center justify-between gap-2 text-[11.5px]">
              <span className="flex items-center gap-1.5 min-w-0">
                {node.status === "error" ? (
                  <XCircle size={11} className="text-red-400 shrink-0" />
                ) : (
                  <CheckCircle2 size={11} className="text-emerald-500/80 shrink-0" />
                )}
                <span className="font-mono text-[var(--color-fg)] truncate">
                  {node.name}
                </span>
              </span>
              <span className="font-mono text-[10.5px] text-[var(--color-fg-dim)] shrink-0">
                {node.itemsOut} {isEs ? "items" : "items"}
                {node.durationMs ? ` · ${Math.round(node.durationMs)}ms` : ""}
              </span>
            </div>
            {node.errorMessage && (
              <p className="mt-1.5 text-[11px] text-red-300 leading-snug">
                {node.errorMessage}
              </p>
            )}
            {node.sample && node.status === "ok" && (
              <pre className="mt-1.5 text-[10.5px] font-mono text-[var(--color-fg-dim)] whitespace-pre-wrap break-all leading-relaxed">
                {node.sample}
              </pre>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function formatTime(iso: string, isEs: boolean): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) {
    return d.toLocaleTimeString(isEs ? "es-CO" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }
  return d.toLocaleDateString(isEs ? "es-CO" : "en-US", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
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

/**
 * Absolute date+time formatter for "last activity". Uses local time
 * (browser-side) so JM sees Bogotá time directly. Today/Yesterday get
 * special-cased so the most common case is the most readable; older
 * entries get a short month + day.
 */
function formatDateTime(iso: string, isEs: boolean): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    d.getFullYear() === yesterday.getFullYear() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getDate() === yesterday.getDate();

  const time = d.toLocaleTimeString(isEs ? "es-CO" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  if (sameDay) return `${isEs ? "Hoy" : "Today"} ${time}`;
  if (isYesterday) return `${isEs ? "Ayer" : "Yesterday"} ${time}`;

  const date = d.toLocaleDateString(isEs ? "es-CO" : "en-US", {
    day: "numeric",
    month: "short",
  });
  return `${date} ${time}`;
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
