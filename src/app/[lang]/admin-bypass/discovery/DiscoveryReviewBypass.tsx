"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAdminKey } from "@/lib/marketplace/useAdminKey";
import { Github, ExternalLink, Youtube } from "lucide-react";

type Type = "connectors" | "skills";
type Status = "pending" | "approved" | "rejected" | "ignored";

interface DiscoveryItem {
  id: string;
  source_platform: "youtube" | "x" | "manual";
  source_url: string;
  product_name: string;
  product_slug: string;
  repo_url: string | null;
  demo_url: string | null;
  pricing: "free" | "paid" | "freemium" | "unknown";
  price_amount_usd: number | null;
  creator_handle: string | null;
  classification_confidence: number | null;
  gemini_summary: string | null;
  raw_title: string | null;
  raw_description: string | null;
  marketplace_category: string | null;
  review_status: Status;
  review_notes: string | null;
  vendors?: string[];
  discovered_at: string;
}

interface QueueResponse {
  items: DiscoveryItem[];
  stats: {
    pendingConnectors: number;
    pendingSkills: number;
  };
}

const CATEGORIES_CONNECTORS = ["productivity", "database", "automation", "storage", "messaging", "dev"] as const;
const CATEGORIES_SKILLS = ["marketing", "dev", "productivity", "research", "design", "finance"] as const;

export function DiscoveryReviewBypass({ lang }: { lang: string }) {
  const isEs = lang === "es";
  const { key, loaded: keyLoaded } = useAdminKey();
  const [type, setType] = useState<Type>("connectors");
  const [status, setStatus] = useState<Status>("pending");
  const [data, setData] = useState<QueueResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const t = useMemo(
    () => ({
      missingKey: isEs ? "Falta el parámetro ?key= en la URL." : "Missing ?key= URL parameter.",
      empty: isEs ? "Cola vacía ✨" : "Queue empty ✨",
      loading: isEs ? "Cargando…" : "Loading…",
      approve: isEs ? "Aprobar" : "Approve",
      reject: isEs ? "Rechazar" : "Reject",
      ignore: isEs ? "Ignorar" : "Ignore",
      noRepo: isEs ? "(sin repo)" : "(no repo)",
      category: isEs ? "Categoría" : "Category",
      summary: isEs ? "Resumen" : "Summary",
      original: isEs ? "Contenido original" : "Original content",
      rejectPrompt: isEs ? "¿Por qué rechazás?" : "Reason for rejection?",
      tabConnectors: "Connectors",
      tabSkills: "Skills",
      filterPending: isEs ? "Pendientes" : "Pending",
      filterApproved: isEs ? "Aprobados" : "Approved",
      filterRejected: isEs ? "Rechazados" : "Rejected",
    }),
    [isEs],
  );

  const load = useCallback(async () => {
    if (!key) {
      setError(t.missingKey);
      return;
    }
    try {
      setError(null);
      const res = await fetch(
        `/api/marketplace/admin/discovery-bypass/queue?type=${type}&status=${status}&key=${encodeURIComponent(key)}`,
      );
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Error");
      setData(d);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    }
  }, [type, status, key, t.missingKey]);

  useEffect(() => {
    load();
  }, [load]);

  async function transition(
    item: DiscoveryItem,
    action: "approve" | "reject" | "ignore",
    overrideCategory?: string,
  ) {
    let notes: string | undefined;
    if (action === "reject") {
      const v = prompt(t.rejectPrompt) ?? "";
      if (!v.trim()) return;
      notes = v;
    }
    setBusyId(item.id);
    try {
      const body: Record<string, unknown> = { action, notes };
      if (action === "approve" && overrideCategory) body.marketplace_category = overrideCategory;
      const res = await fetch(
        `/api/marketplace/admin/discovery-bypass/${type}/${item.id}?key=${encodeURIComponent(key)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );
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
      <div className="grid grid-cols-2 gap-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)]/60 p-1">
        <TabPill active={type === "connectors"} onClick={() => setType("connectors")}>
          {t.tabConnectors}
          {data.stats.pendingConnectors > 0 && (
            <span className="ml-1.5 rounded-full bg-amber-500/20 text-amber-300 px-1.5 py-0.5 text-[10px] font-mono">
              {data.stats.pendingConnectors}
            </span>
          )}
        </TabPill>
        <TabPill active={type === "skills"} onClick={() => setType("skills")}>
          {t.tabSkills}
          {data.stats.pendingSkills > 0 && (
            <span className="ml-1.5 rounded-full bg-amber-500/20 text-amber-300 px-1.5 py-0.5 text-[10px] font-mono">
              {data.stats.pendingSkills}
            </span>
          )}
        </TabPill>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <FilterChip active={status === "pending"} onClick={() => setStatus("pending")}>{t.filterPending}</FilterChip>
        <FilterChip active={status === "approved"} onClick={() => setStatus("approved")}>{t.filterApproved}</FilterChip>
        <FilterChip active={status === "rejected"} onClick={() => setStatus("rejected")}>{t.filterRejected}</FilterChip>
      </div>

      {data.items.length === 0 ? (
        <Banner tone="success">{t.empty}</Banner>
      ) : (
        <ul className="space-y-4">
          {data.items.map((item) => (
            <DiscoveryCard
              key={item.id}
              item={item}
              type={type}
              status={status}
              isEs={isEs}
              t={t}
              busy={busyId === item.id}
              onTransition={(action, cat) => transition(item, action, cat)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

interface UIText {
  noRepo: string; category: string; summary: string; original: string;
  approve: string; reject: string; ignore: string; rejectPrompt: string;
}

function DiscoveryCard({
  item, type, status, isEs, t, busy, onTransition,
}: {
  item: DiscoveryItem; type: Type; status: Status; isEs: boolean;
  t: UIText; busy: boolean;
  onTransition: (action: "approve" | "reject" | "ignore", category?: string) => void;
}) {
  const [pickedCategory, setPickedCategory] = useState<string>(item.marketplace_category ?? "");
  const conf = item.classification_confidence ?? 0;
  const confColor = conf >= 0.85 ? "text-emerald-400" : conf >= 0.7 ? "text-amber-400" : "text-red-400";
  const priceLabel = item.pricing === "free" ? "Free" : item.pricing === "paid" ? `$${item.price_amount_usd ?? "?"}` : item.pricing === "freemium" ? "Freemium" : "?";
  const categories = type === "connectors" ? CATEGORIES_CONNECTORS : CATEGORIES_SKILLS;

  return (
    <li className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] overflow-hidden">
      <header className="p-4 sm:p-5 border-b border-[var(--color-border)]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-[16px] font-semibold tracking-tight truncate">{item.product_name}</h3>
            <p className="mt-0.5 text-[11px] font-mono text-[var(--color-fg-dim)] truncate">
              {item.product_slug} · {priceLabel}{item.creator_handle && <> · {item.creator_handle}</>}
            </p>
          </div>
          <div className={`shrink-0 text-[11px] font-mono ${confColor}`}>{(conf * 100).toFixed(0)}%</div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-mono">
          {item.source_platform === "youtube" ? (
            <a href={item.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-md border border-[var(--color-border)] bg-[var(--color-panel-2)] px-2 py-1 hover:border-[var(--color-accent)]/40">
              <Youtube size={11} /> YouTube
            </a>
          ) : item.source_platform === "x" ? (
            <a href={item.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-md border border-[var(--color-border)] bg-[var(--color-panel-2)] px-2 py-1 hover:border-[var(--color-accent)]/40">𝕏</a>
          ) : null}
          {item.repo_url ? (
            <a href={item.repo_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-md border border-[var(--color-border)] bg-[var(--color-panel-2)] px-2 py-1 hover:border-[var(--color-accent)]/40">
              <Github size={11} /> Repo
            </a>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/5 text-amber-400 px-2 py-1">{t.noRepo}</span>
          )}
          {item.demo_url && (
            <a href={item.demo_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-md border border-[var(--color-border)] bg-[var(--color-panel-2)] px-2 py-1 hover:border-[var(--color-accent)]/40">
              <ExternalLink size={11} /> Demo
            </a>
          )}
        </div>
      </header>

      <div className="px-4 sm:px-5 py-3 border-b border-[var(--color-border)] bg-[var(--color-panel-2)]/40">
        <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--color-fg-dim)]">{t.summary}</p>
        <p className="mt-1 text-[13px] text-[var(--color-fg-muted)] leading-relaxed">{item.gemini_summary || "—"}</p>
      </div>

      {status === "pending" && (
        <div className="px-4 sm:px-5 py-3 border-b border-[var(--color-border)]">
          <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--color-fg-dim)] mb-2">
            {t.category}
            {item.marketplace_category && (
              <span className="ml-2 normal-case tracking-normal text-[var(--color-accent)]">
                {isEs ? "(sugerencia:" : "(suggested:"} {item.marketplace_category})
              </span>
            )}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setPickedCategory(c)}
                className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${
                  pickedCategory === c
                    ? "bg-[var(--color-accent)] text-white"
                    : "bg-[var(--color-panel-2)]/60 text-[var(--color-fg-muted)] hover:bg-[var(--color-panel-2)]"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {status === "pending" ? (
        <div className="grid grid-cols-3 gap-2 p-3 bg-[var(--color-panel-2)]/40">
          <button onClick={() => onTransition("reject")} disabled={busy} className="h-11 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-500/10 disabled:opacity-50 text-[13px] font-semibold transition-colors">
            {busy ? "…" : t.reject}
          </button>
          <button onClick={() => onTransition("ignore")} disabled={busy} className="h-11 rounded-xl border border-[var(--color-border)] text-[var(--color-fg-muted)] hover:bg-[var(--color-panel-2)] disabled:opacity-50 text-[13px] font-semibold transition-colors">
            {busy ? "…" : t.ignore}
          </button>
          <button onClick={() => onTransition("approve", pickedCategory || undefined)} disabled={busy || !pickedCategory} className="h-11 rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-[13px] font-semibold transition-colors" title={!pickedCategory ? "Picá una categoría primero" : undefined}>
            {busy ? "…" : t.approve}
          </button>
        </div>
      ) : (
        <div className="p-3 text-[12px] text-[var(--color-fg-dim)] bg-[var(--color-panel-2)]/40">
          {item.review_notes && <p className="font-mono">{item.review_notes}</p>}
          {item.marketplace_category && <p className="mt-1 font-mono">→ {item.marketplace_category}</p>}
        </div>
      )}
    </li>
  );
}

function TabPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`px-3 py-2 rounded-lg text-[12.5px] font-semibold transition-colors flex items-center justify-center ${active ? "bg-[var(--color-accent)] text-white" : "text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"}`}>
      {children}
    </button>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${active ? "bg-[var(--color-accent)] text-white" : "bg-[var(--color-panel-2)]/60 text-[var(--color-fg-muted)] hover:bg-[var(--color-panel-2)]"}`}>
      {children}
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
