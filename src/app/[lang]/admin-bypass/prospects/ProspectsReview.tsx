"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAdminKey } from "@/lib/marketplace/useAdminKey";
import { ExternalLink, Mail, Building2, MapPin } from "lucide-react";

type Status = "pending" | "qualified" | "contacted" | "replied" | "converted" | "rejected";

interface Prospect {
  id: string;
  source_platform: string;
  source_url: string;
  name: string | null;
  handle: string | null;
  email: string | null;
  title: string | null;
  company: string | null;
  location: string | null;
  language: "en" | "es" | "pt" | "other";
  profile_url: string | null;
  post_excerpt: string | null;
  pain_point: string | null;
  ai_tools_mentioned: string[];
  intent_score: number | null;
  is_non_dev: boolean | null;
  gemini_summary: string | null;
  status: Status;
  rejection_reason: string | null;
  outreach_subject: string | null;
  outreach_sent_at: string | null;
  reply_excerpt: string | null;
  discovered_at: string;
}

interface QueueResponse {
  items: Prospect[];
  stats: { pending: number; qualified: number; contacted: number; replied: number };
}

export function ProspectsReview({ lang }: { lang: string }) {
  const isEs = lang === "es";
  const { key, loaded: keyLoaded } = useAdminKey();
  const [status, setStatus] = useState<Status>("pending");
  const [data, setData] = useState<QueueResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const t = useMemo(() => ({
    missingKey: isEs ? "Falta el ?key= en la URL." : "Missing ?key= URL parameter.",
    empty: isEs ? "Cola vacía ✨" : "Queue empty ✨",
    loading: isEs ? "Cargando…" : "Loading…",
    qualify: isEs ? "Calificar" : "Qualify",
    reject: isEs ? "Rechazar" : "Reject",
    convert: isEs ? "Convirtió" : "Mark converted",
    rejectPrompt: isEs ? "¿Por qué no califica?" : "Why reject?",
    pending: isEs ? "Pendientes" : "Pending",
    qualified: isEs ? "Calificados" : "Qualified",
    contacted: isEs ? "Contactados" : "Contacted",
    replied: isEs ? "Respondieron" : "Replied",
    intent: isEs ? "Intención" : "Intent",
    pain: isEs ? "Pain point" : "Pain point",
    post: isEs ? "Post original" : "Original post",
    tools: isEs ? "Tools mencionados" : "Tools mentioned",
  }), [isEs]);

  const load = useCallback(async () => {
    if (!key) { setError(t.missingKey); return; }
    try {
      setError(null);
      const res = await fetch(`/api/marketplace/admin/prospects/queue?status=${status}&key=${encodeURIComponent(key)}`);
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Error");
      setData(d);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    }
  }, [status, key, t.missingKey]);

  useEffect(() => { load(); }, [load]);

  async function transition(p: Prospect, action: "qualify" | "reject" | "convert") {
    let notes: string | undefined;
    if (action === "reject") {
      const v = prompt(t.rejectPrompt) ?? "";
      if (!v.trim()) return;
      notes = v;
    }
    setBusyId(p.id);
    try {
      const res = await fetch(`/api/marketplace/admin/prospects/${p.id}?key=${encodeURIComponent(key)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, notes }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Failed");
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setBusyId(null);
    }
  }

  if (!keyLoaded) return null;
  if (!key) return <Banner tone="warn">{t.missingKey}</Banner>;
  if (error) return <Banner tone="error">{error}</Banner>;
  if (!data) return <Banner tone="muted">{t.loading}</Banner>;

  return (
    <div className="space-y-5">
      {/* Status filter chips with counts */}
      <div className="flex flex-wrap gap-1.5">
        <Chip active={status === "pending"} count={data.stats.pending} onClick={() => setStatus("pending")}>
          {t.pending}
        </Chip>
        <Chip active={status === "qualified"} count={data.stats.qualified} onClick={() => setStatus("qualified")}>
          {t.qualified}
        </Chip>
        <Chip active={status === "contacted"} count={data.stats.contacted} onClick={() => setStatus("contacted")}>
          {t.contacted}
        </Chip>
        <Chip active={status === "replied"} count={data.stats.replied} onClick={() => setStatus("replied")}>
          {t.replied}
        </Chip>
      </div>

      {data.items.length === 0 ? (
        <Banner tone="success">{t.empty}</Banner>
      ) : (
        <ul className="space-y-4">
          {data.items.map((p) => (
            <ProspectCard
              key={p.id}
              prospect={p}
              status={status}
              isEs={isEs}
              t={t}
              busy={busyId === p.id}
              onTransition={(a) => transition(p, a)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

interface UIText {
  qualify: string; reject: string; convert: string; rejectPrompt: string;
  intent: string; pain: string; post: string; tools: string;
}

function ProspectCard({
  prospect: p, status, isEs, t, busy, onTransition,
}: {
  prospect: Prospect; status: Status; isEs: boolean; t: UIText;
  busy: boolean;
  onTransition: (action: "qualify" | "reject" | "convert") => void;
}) {
  const intent = p.intent_score ?? 0;
  const intentColor = intent >= 0.85 ? "text-emerald-400" : intent >= 0.7 ? "text-amber-400" : "text-red-400";

  return (
    <li className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] overflow-hidden">
      <header className="p-4 sm:p-5 border-b border-[var(--color-border)]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-[16px] font-semibold tracking-tight truncate">
              {p.name || p.handle || "Anonymous"}
            </h3>
            <p className="mt-0.5 text-[12px] text-[var(--color-fg-muted)] truncate">
              {p.title}{p.company && <> · {p.company}</>}
            </p>
            <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-mono text-[var(--color-fg-dim)]">
              <span className="rounded bg-[var(--color-panel-2)] px-2 py-0.5">{p.source_platform}</span>
              <span className="rounded bg-[var(--color-panel-2)] px-2 py-0.5 uppercase">{p.language}</span>
              {p.location && (
                <span className="rounded bg-[var(--color-panel-2)] px-2 py-0.5 inline-flex items-center gap-1">
                  <MapPin size={10} /> {p.location}
                </span>
              )}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className={`text-[11px] font-mono ${intentColor}`}>{(intent * 100).toFixed(0)}%</div>
            <div className="text-[10px] text-[var(--color-fg-dim)]">{t.intent}</div>
          </div>
        </div>

        {/* Links */}
        <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-mono">
          <a href={p.source_url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-md border border-[var(--color-border)] bg-[var(--color-panel-2)] px-2 py-1 hover:border-[var(--color-accent)]/40">
            <ExternalLink size={11} /> Source
          </a>
          {p.profile_url && (
            <a href={p.profile_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-md border border-[var(--color-border)] bg-[var(--color-panel-2)] px-2 py-1 hover:border-[var(--color-accent)]/40">
              <Building2 size={11} /> Profile
            </a>
          )}
          {p.email ? (
            <a href={`mailto:${p.email}`}
              className="inline-flex items-center gap-1 rounded-md border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 text-[var(--color-accent)] px-2 py-1">
              <Mail size={11} /> {p.email}
            </a>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/5 text-amber-400 px-2 py-1">
              {isEs ? "(sin email)" : "(no email)"}
            </span>
          )}
        </div>
      </header>

      {/* Pain point */}
      {p.pain_point && (
        <div className="px-4 sm:px-5 py-3 border-b border-[var(--color-border)] bg-[var(--color-panel-2)]/40">
          <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--color-fg-dim)]">
            {t.pain}
          </p>
          <p className="mt-1 text-[13px] text-[var(--color-fg)] leading-relaxed">{p.pain_point}</p>
        </div>
      )}

      {/* Tools mentioned */}
      {p.ai_tools_mentioned && p.ai_tools_mentioned.length > 0 && (
        <div className="px-4 sm:px-5 py-3 border-b border-[var(--color-border)]">
          <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--color-fg-dim)] mb-1.5">
            {t.tools}
          </p>
          <div className="flex flex-wrap gap-1">
            {p.ai_tools_mentioned.map((tool) => (
              <span key={tool} className="text-[10px] font-mono rounded bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/20 px-1.5 py-0.5">
                {tool}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Original post */}
      {p.post_excerpt && (
        <details className="px-4 sm:px-5 py-3 border-b border-[var(--color-border)]">
          <summary className="text-[11px] font-mono uppercase tracking-[0.12em] text-[var(--color-fg-dim)] cursor-pointer hover:text-[var(--color-fg-muted)]">
            {t.post}
          </summary>
          <pre className="mt-2 text-[12px] font-sans whitespace-pre-wrap text-[var(--color-fg-muted)] max-h-[200px] overflow-auto">
            {p.post_excerpt}
          </pre>
        </details>
      )}

      {/* Reply excerpt for replied status */}
      {p.reply_excerpt && (
        <div className="px-4 sm:px-5 py-3 border-b border-[var(--color-border)] bg-emerald-500/5">
          <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-emerald-400 mb-1">
            {isEs ? "Su respuesta" : "Their reply"}
          </p>
          <p className="text-[12px] text-[var(--color-fg-muted)]">{p.reply_excerpt}</p>
        </div>
      )}

      {/* Actions */}
      <div className="p-3 bg-[var(--color-panel-2)]/40">
        {status === "pending" ? (
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => onTransition("reject")} disabled={busy}
              className="h-11 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-500/10 disabled:opacity-50 text-[13px] font-semibold transition-colors">
              {busy ? "…" : t.reject}
            </button>
            <button onClick={() => onTransition("qualify")} disabled={busy}
              className="h-11 rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-[13px] font-semibold transition-colors">
              {busy ? "…" : t.qualify}
            </button>
          </div>
        ) : status === "replied" ? (
          <button onClick={() => onTransition("convert")} disabled={busy}
            className="w-full h-11 rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-[13px] font-semibold transition-colors">
            {busy ? "…" : t.convert}
          </button>
        ) : (
          <p className="text-[12px] text-[var(--color-fg-dim)] font-mono text-center py-2">
            {p.rejection_reason || (p.outreach_sent_at && `sent ${new Date(p.outreach_sent_at).toISOString().slice(0,10)}`) || "—"}
          </p>
        )}
      </div>
    </li>
  );
}

function Chip({ active, count, onClick, children }: { active: boolean; count: number; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${
        active ? "bg-[var(--color-accent)] text-white" : "bg-[var(--color-panel-2)]/60 text-[var(--color-fg-muted)] hover:bg-[var(--color-panel-2)]"
      }`}>
      <span>{children}</span>
      <span className={`text-[10px] font-mono ${active ? "text-white/80" : "text-[var(--color-fg-dim)]"}`}>
        {count}
      </span>
    </button>
  );
}

function Banner({ tone, children }: { tone: "muted" | "warn" | "error" | "success"; children: React.ReactNode }) {
  const cls = tone === "error" ? "border-red-500/40 bg-red-500/10 text-red-400"
    : tone === "warn" ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
    : tone === "success" ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
    : "border-[var(--color-border)] bg-[var(--color-panel)] text-[var(--color-fg-muted)]";
  return <div className={`rounded-2xl border p-4 text-[13px] ${cls}`}>{children}</div>;
}
