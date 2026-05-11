"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
} from "lucide-react";

/** Shape from /api/admin/ops/auto-actions */
interface RetryRow {
  id: string;
  workflow_id: string;
  workflow_name: string | null;
  execution_id: string | null;
  failed_node: string | null;
  raw_error: string | null;
  classification: string | null;
  confidence: number | null;
  reasoning: string | null;
  retry_execution_id: string | null;
  retry_status: string | null;
  status: string;
  applied_at: string | null;
  apply_error: string | null;
  created_at: string;
}

interface ProposalRow {
  id: string;
  workflow_id: string;
  workflow_name: string | null;
  execution_id: string | null;
  failed_node: string | null;
  raw_error: string | null;
  classification: string | null;
  confidence: number | null;
  reasoning: string | null;
  proposed_patch?: { name?: string; nodes?: unknown[]; connections?: unknown; settings?: unknown };
  original_snapshot?: { name?: string; nodes?: unknown[]; connections?: unknown; active?: boolean };
  proposal_summary: string | null;
  status: string;
  applied_at: string | null;
  applied_by: string | null;
  apply_error: string | null;
  created_at: string;
}

interface Resp {
  retries: RetryRow[];
  proposals: { pending: ProposalRow[]; recent: ProposalRow[] };
}

export function AutoRepairPanel({
  isEs,
  n8nUrl,
}: {
  isEs: boolean;
  n8nUrl: string;
}) {
  const [data, setData] = useState<Resp | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch("/api/admin/ops/auto-actions", { cache: "no-store" });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error ?? `HTTP ${r.status}`);
      setData(j);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  if (loading)
    return (
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-6 text-center text-[var(--color-fg-muted)] flex items-center justify-center gap-2">
        <Loader2 size={14} className="animate-spin" />
        {isEs ? "Cargando reparaciones…" : "Loading repairs…"}
      </div>
    );

  if (err)
    return (
      <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-red-400 text-[13px]">
        {err}
      </div>
    );
  if (!data) return null;

  const pending = data.proposals.pending;
  const recentProposals = data.proposals.recent;

  return (
    <div className="space-y-6">
      <header className="flex items-baseline justify-between">
        <h2 className="text-[20px] font-semibold tracking-tight flex items-center gap-2">
          <span className="text-[22px]">🛠️</span>
          {isEs ? "Auto-Reparación" : "Auto-Repair"}
        </h2>
        <button
          onClick={() => void load()}
          className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-panel-2)]/60 hover:bg-[var(--color-panel-2)] px-2.5 py-1 text-[11.5px] text-[var(--color-fg-muted)]"
        >
          <RefreshCw size={12} />
          {isEs ? "Actualizar" : "Refresh"}
        </button>
      </header>

      {/* ── Pending proposals ────────────────────────────────────── */}
      <section>
        <h3 className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[var(--color-fg-muted)] mb-3">
          {isEs ? "Fixes propuestos por Claude" : "Claude-proposed fixes"}
          <span className="ml-2 font-mono text-[11px] text-[var(--color-fg-dim)]">
            {pending.length} {isEs ? "esperando" : "pending"}
          </span>
        </h3>
        {pending.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-panel)] p-6 text-center text-[12.5px] text-[var(--color-fg-muted)]">
            {isEs
              ? "Nada que aprobar. Claude no propuso fixes nuevos."
              : "Nothing to approve. Claude hasn't proposed new fixes."}
          </div>
        ) : (
          <ul className="space-y-3">
            {pending.map((p) => (
              <ProposalCard
                key={p.id}
                p={p}
                isEs={isEs}
                n8nUrl={n8nUrl}
                onChange={load}
              />
            ))}
          </ul>
        )}
      </section>

      {/* ── Retries log ──────────────────────────────────────────── */}
      <section>
        <h3 className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[var(--color-fg-muted)] mb-3">
          {isEs ? "Reintentos automáticos" : "Auto-retries"}
          <span className="ml-2 font-mono text-[11px] text-[var(--color-fg-dim)]">
            {data.retries.length}
          </span>
        </h3>
        {data.retries.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-panel)] p-6 text-center text-[12.5px] text-[var(--color-fg-muted)]">
            {isEs
              ? "Sin reintentos todavía. Claude reintenta errores transient automáticamente."
              : "No retries yet. Claude auto-retries transient errors."}
          </div>
        ) : (
          <ul className="space-y-1.5">
            {data.retries.map((r) => (
              <RetryRowItem key={r.id} r={r} isEs={isEs} n8nUrl={n8nUrl} />
            ))}
          </ul>
        )}
      </section>

      {/* ── Recent proposal history ──────────────────────────────── */}
      {recentProposals.length > 0 && (
        <section>
          <h3 className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[var(--color-fg-muted)] mb-3">
            {isEs ? "Historial de fixes" : "Fix history"}
          </h3>
          <ul className="space-y-1.5">
            {recentProposals.map((p) => (
              <li
                key={p.id}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] p-3 text-[12.5px]"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  {p.status === "applied" ? (
                    <CheckCircle2 size={13} className="text-emerald-400" />
                  ) : p.status === "failed" ? (
                    <XCircle size={13} className="text-red-400" />
                  ) : (
                    <Clock size={13} className="text-[var(--color-fg-dim)]" />
                  )}
                  <span className="font-semibold">
                    {p.workflow_name || p.workflow_id}
                  </span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10.5px] font-mono ${
                      p.status === "applied"
                        ? "bg-emerald-500/15 text-emerald-400"
                        : p.status === "failed"
                          ? "bg-red-500/15 text-red-400"
                          : "bg-[var(--color-panel-2)]/80 text-[var(--color-fg-dim)]"
                    }`}
                  >
                    {p.status}
                  </span>
                  <span className="text-[var(--color-fg-dim)] font-mono text-[11px]">
                    {p.applied_at ? formatWhen(p.applied_at, isEs) : formatWhen(p.created_at, isEs)}
                  </span>
                </div>
                {p.proposal_summary && (
                  <p className="mt-1 text-[var(--color-fg-muted)] leading-snug">
                    {p.proposal_summary}
                  </p>
                )}
                {p.apply_error && (
                  <p className="mt-1 text-[11.5px] text-red-300 font-mono">
                    {p.apply_error}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function ProposalCard({
  p,
  isEs,
  n8nUrl,
  onChange,
}: {
  p: ProposalRow;
  isEs: boolean;
  n8nUrl: string;
  onChange: () => void;
}) {
  const [diffOpen, setDiffOpen] = useState(false);
  const [busy, setBusy] = useState<"apply" | "dismiss" | null>(null);
  const [actErr, setActErr] = useState<string | null>(null);

  async function act(kind: "apply" | "dismiss") {
    setBusy(kind);
    setActErr(null);
    try {
      const r = await fetch(`/api/admin/ops/proposals/${p.id}/${kind}`, {
        method: "POST",
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error ?? `HTTP ${r.status}`);
      onChange();
    } catch (e) {
      setActErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  // Naive node-level diff: compare nodes by name + JSON. We never edit
  // node ids/positions, so name is a reliable key here.
  const beforeNodes = (p.original_snapshot?.nodes ?? []) as Array<{ name?: string }>;
  const afterNodes = (p.proposed_patch?.nodes ?? []) as Array<{ name?: string }>;
  const beforeByName = new Map<string, unknown>(
    beforeNodes.map((n) => [n.name ?? "", n]),
  );
  const afterByName = new Map<string, unknown>(
    afterNodes.map((n) => [n.name ?? "", n]),
  );
  const changedNodes: string[] = [];
  for (const [name, after] of afterByName) {
    const before = beforeByName.get(name);
    if (!before || JSON.stringify(before) !== JSON.stringify(after)) {
      changedNodes.push(name);
    }
  }

  return (
    <li className="rounded-xl border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 p-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Sparkles
              size={13}
              className="text-[var(--color-accent)] shrink-0"
            />
            <h4 className="text-[14px] font-semibold tracking-tight">
              {p.workflow_name || p.workflow_id}
            </h4>
            {p.confidence !== null && (
              <span className="rounded px-1.5 py-0.5 text-[10.5px] font-mono bg-[var(--color-accent)]/15 text-[var(--color-accent)]">
                conf {p.confidence.toFixed(2)}
              </span>
            )}
          </div>
          {p.proposal_summary && (
            <p className="mt-1.5 text-[13px] text-[var(--color-fg)] leading-relaxed">
              {p.proposal_summary}
            </p>
          )}
          <div className="mt-2 flex flex-wrap gap-3 text-[11px] font-mono text-[var(--color-fg-dim)]">
            <span>
              {isEs ? "Nodo:" : "Node:"} {p.failed_node ?? "—"}
            </span>
            <span>
              {changedNodes.length} {isEs ? "nodos cambiados" : "nodes changed"}
            </span>
            <span>{formatWhen(p.created_at, isEs)}</span>
          </div>
          {p.raw_error && (
            <pre className="mt-2 max-h-24 overflow-auto rounded-md bg-red-500/8 border border-red-500/20 px-2 py-1.5 text-[11px] text-red-300 whitespace-pre-wrap break-all leading-snug">
              {p.raw_error}
            </pre>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setDiffOpen((v) => !v)}
            className="inline-flex items-center gap-1 rounded-md border border-[var(--color-border)] bg-[var(--color-panel)] hover:bg-[var(--color-panel-2)] px-2.5 py-1.5 text-[11.5px]"
          >
            {diffOpen ? (isEs ? "Ocultar" : "Hide") : isEs ? "Ver diff" : "View diff"}
          </button>
          <button
            disabled={busy !== null}
            onClick={() => void act("apply")}
            className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 text-[11.5px] font-semibold disabled:opacity-50"
          >
            {busy === "apply" ? (
              <Loader2 size={11} className="animate-spin" />
            ) : (
              <CheckCircle2 size={11} />
            )}
            {isEs ? "Aplicar" : "Apply"}
          </button>
          <button
            disabled={busy !== null}
            onClick={() => void act("dismiss")}
            className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-panel)] hover:bg-red-500/10 hover:border-red-500/40 hover:text-red-400 px-2.5 py-1.5 text-[11.5px]"
          >
            <XCircle size={11} />
            {isEs ? "Descartar" : "Dismiss"}
          </button>
        </div>
      </div>

      {actErr && (
        <div className="mt-2 rounded-md border border-red-500/40 bg-red-500/10 p-2 text-[11.5px] text-red-300 flex items-start gap-1.5">
          <AlertTriangle size={12} className="shrink-0 mt-0.5" />
          <span>{actErr}</span>
        </div>
      )}

      {diffOpen && (
        <div className="mt-3 space-y-2">
          {changedNodes.length === 0 ? (
            <p className="text-[12px] text-[var(--color-fg-muted)] italic">
              {isEs ? "Sin cambios detectados a nivel de nodos." : "No node-level changes detected."}
            </p>
          ) : (
            changedNodes.map((name) => {
              const before = beforeByName.get(name);
              const after = afterByName.get(name);
              return (
                <div
                  key={name}
                  className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg)]/50 p-2"
                >
                  <div className="text-[11.5px] font-mono font-semibold text-[var(--color-fg)] mb-1">
                    {name}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10.5px] font-mono">
                    <pre className="rounded bg-red-500/8 border border-red-500/20 p-2 max-h-48 overflow-auto whitespace-pre-wrap break-all">
                      {before
                        ? JSON.stringify(before, null, 2)
                        : "(new node)"}
                    </pre>
                    <pre className="rounded bg-emerald-500/8 border border-emerald-500/20 p-2 max-h-48 overflow-auto whitespace-pre-wrap break-all">
                      {after ? JSON.stringify(after, null, 2) : "(removed)"}
                    </pre>
                  </div>
                </div>
              );
            })
          )}
          <p className="text-[10.5px] text-[var(--color-fg-dim)]">
            {isEs
              ? "Aplicar dispara: desactivar workflow → PUT body completo → reactivar. Si falla, intentamos re-activar igual."
              : "Apply runs: deactivate workflow → full PUT → reactivate. We re-activate even on failure as a safety net."}
          </p>
        </div>
      )}
    </li>
  );
}

function RetryRowItem({
  r,
  isEs,
  n8nUrl,
}: {
  r: RetryRow;
  isEs: boolean;
  n8nUrl: string;
}) {
  const link = `${n8nUrl}/workflow/${r.workflow_id}/executions/${r.retry_execution_id ?? r.execution_id ?? ""}`;
  return (
    <li className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] p-2.5 text-[12px] flex items-center gap-2 flex-wrap">
      {r.status === "applied" ? (
        <RefreshCw size={12} className="text-emerald-400" />
      ) : (
        <XCircle size={12} className="text-red-400" />
      )}
      <span className="font-semibold truncate">
        {r.workflow_name || r.workflow_id}
      </span>
      <span className="font-mono text-[10.5px] text-[var(--color-fg-dim)]">
        {formatWhen(r.created_at, isEs)}
      </span>
      {r.classification && (
        <span className="rounded px-1.5 py-0.5 text-[10.5px] font-mono bg-[var(--color-panel-2)]/60 text-[var(--color-fg-muted)]">
          {r.classification}
        </span>
      )}
      {r.retry_status && (
        <span
          className={`rounded px-1.5 py-0.5 text-[10.5px] font-mono ${
            r.retry_status === "running" || r.retry_status === "success"
              ? "bg-emerald-500/15 text-emerald-400"
              : "bg-amber-500/15 text-amber-400"
          }`}
        >
          {r.retry_status}
        </span>
      )}
      {r.retry_execution_id && (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto text-[10.5px] font-mono text-[var(--color-fg-muted)] hover:text-[var(--color-accent)]"
        >
          retry #{r.retry_execution_id} ↗
        </a>
      )}
    </li>
  );
}

function formatWhen(iso: string, isEs: boolean): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  const time = d.toLocaleTimeString(isEs ? "es-CO" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  if (sameDay) return `${isEs ? "hoy" : "today"} ${time}`;
  return d.toLocaleDateString(isEs ? "es-CO" : "en-US", {
    day: "numeric",
    month: "short",
  });
}
