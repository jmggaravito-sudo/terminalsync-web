"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Github,
  ExternalLink,
  Newspaper,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Archive,
  CheckCircle2,
} from "lucide-react";
import { authedFetch, getSupabaseBrowser } from "@/lib/supabase/browser";

type Status = "pending" | "kept" | "archived" | "promoted" | "all";
type Source = "all" | "github" | "hackernews" | "reddit" | "youtube" | "product_hunt";

interface TrendItem {
  id: string;
  source: string;
  source_url: string;
  source_subtype: string | null;
  title: string;
  summary: string | null;
  score: number;
  signal_type: string | null;
  tags: string[] | null;
  review_status: Exclude<Status, "all">;
  review_notes: string | null;
  captured_at: string;
}

interface CrossSourceItem {
  title_normalized: string;
  sources: string[];
  source_count: number;
  total_score: number;
  last_seen_at: string;
  signal_ids: string[];
}

interface TrendsResponse {
  items: TrendItem[];
  crossSource: CrossSourceItem[];
  counts: Record<string, number>;
  window: { days: number; since: string };
}

type AuthState = "checking" | "anon" | "ready" | "forbidden";

const SOURCES: { key: Source; label: string }[] = [
  { key: "all", label: "All" },
  { key: "github", label: "GitHub" },
  { key: "hackernews", label: "HN" },
  { key: "reddit", label: "Reddit" },
];

export function TrendsReview({ lang }: { lang: string }) {
  const isEs = lang === "es";
  const [auth, setAuth] = useState<AuthState>("checking");
  const [source, setSource] = useState<Source>("all");
  const [status, setStatus] = useState<Status>("pending");
  const [days, setDays] = useState<number>(7);
  const [data, setData] = useState<TrendsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const t = useMemo(
    () => ({
      anon: isEs ? "Iniciá sesión con tu cuenta admin." : "Sign in with your admin account.",
      forbidden: isEs ? "Tu cuenta no tiene permisos de admin." : "Your account is not admin.",
      empty: isEs ? "Sin señales en este filtro" : "No signals match this filter",
      loading: isEs ? "Cargando…" : "Loading…",
      checking: isEs ? "Verificando…" : "Checking…",
      keep: isEs ? "Guardar" : "Keep",
      archive: isEs ? "Archivar" : "Archive",
      promote: isEs ? "Promover" : "Promote",
      cross: isEs ? "Cross-source" : "Cross-source",
      crossDesc: isEs
        ? "Apariciones en 2+ fuentes en los últimos 7 días — momentum real, no ruido."
        : "Items that appeared in 2+ sources in the last 7 days — real momentum, not noise.",
      filterPending: isEs ? "Pendientes" : "Pending",
      filterKept: isEs ? "Guardados" : "Kept",
      filterArchived: isEs ? "Archivados" : "Archived",
      filterPromoted: isEs ? "Promovidos" : "Promoted",
      filterAll: isEs ? "Todos" : "All",
      score: isEs ? "score" : "score",
    }),
    [isEs],
  );

  const load = useCallback(async () => {
    try {
      setError(null);
      const params = new URLSearchParams({ status, days: String(days) });
      if (source !== "all") params.set("source", source);
      const res = await authedFetch(`/api/admin/trends?${params}`);
      if (res.status === 401) { setAuth("anon"); return; }
      if (res.status === 403) { setAuth("forbidden"); return; }
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Error");
      setData(d);
      setAuth("ready");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    }
  }, [source, status, days]);

  useEffect(() => {
    const sb = getSupabaseBrowser();
    if (!sb) { setAuth("anon"); return; }
    sb.auth.getSession().then(({ data: { session } }) => {
      if (!session) setAuth("anon");
      else load();
    });
    const { data: sub } = sb.auth.onAuthStateChange(() => load());
    return () => sub.subscription.unsubscribe();
  }, [load]);

  async function transition(item: TrendItem, action: "keep" | "archive" | "promote") {
    setBusyId(item.id);
    try {
      const res = await authedFetch(`/api/admin/trends`, {
        method: "PATCH",
        body: JSON.stringify({ id: item.id, action }),
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

  if (auth === "checking") return <Banner tone="muted">{t.checking}</Banner>;
  if (auth === "anon")
    return (
      <Banner tone="warn">
        {t.anon}{" "}
        <a
          href={`/${lang}/login?next=${encodeURIComponent(`/${lang}/admin/trends`)}`}
          className="underline"
        >
          {isEs ? "Entrar →" : "Sign in →"}
        </a>
      </Banner>
    );
  if (auth === "forbidden") return <Banner tone="warn">{t.forbidden}</Banner>;
  if (error) return <Banner tone="error">{error}</Banner>;
  if (!data) return <Banner tone="muted">{t.loading}</Banner>;

  return (
    <div className="space-y-6">
      {/* Cross-source momentum — only render if we have any */}
      {data.crossSource.length > 0 && (
        <section className="rounded-2xl border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-[var(--color-accent)]" />
            <h2 className="text-[13px] font-mono uppercase tracking-[0.14em] text-[var(--color-accent)]">
              {t.cross}
            </h2>
          </div>
          <p className="mt-1 text-[12px] text-[var(--color-fg-muted)]">{t.crossDesc}</p>
          <ul className="mt-3 space-y-2">
            {data.crossSource.slice(0, 5).map((c) => (
              <li
                key={c.title_normalized}
                className="rounded-xl bg-[var(--color-panel)]/80 border border-[var(--color-border)] p-3"
              >
                <p className="text-[13px] font-medium text-[var(--color-fg-strong)]">
                  {c.title_normalized}
                </p>
                <p className="mt-1 text-[11px] font-mono text-[var(--color-fg-dim)]">
                  {c.sources.join(" · ")} · {t.score}: {c.total_score}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Source tabs */}
      <div className="flex flex-wrap gap-1.5">
        {SOURCES.map((s) => {
          const count = s.key === "all"
            ? Object.values(data.counts).reduce((a, b) => a + b, 0)
            : data.counts[s.key] ?? 0;
          return (
            <FilterChip
              key={s.key}
              active={source === s.key}
              onClick={() => setSource(s.key)}
            >
              {s.label}
              {count > 0 && (
                <span className="ml-1.5 rounded-full bg-amber-500/20 text-amber-300 px-1.5 py-0 text-[10px] font-mono">
                  {count}
                </span>
              )}
            </FilterChip>
          );
        })}
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-1.5">
        <FilterChip active={status === "pending"} onClick={() => setStatus("pending")}>
          {t.filterPending}
        </FilterChip>
        <FilterChip active={status === "kept"} onClick={() => setStatus("kept")}>
          {t.filterKept}
        </FilterChip>
        <FilterChip active={status === "promoted"} onClick={() => setStatus("promoted")}>
          {t.filterPromoted}
        </FilterChip>
        <FilterChip active={status === "archived"} onClick={() => setStatus("archived")}>
          {t.filterArchived}
        </FilterChip>
        <FilterChip active={status === "all"} onClick={() => setStatus("all")}>
          {t.filterAll}
        </FilterChip>
      </div>

      {/* Window */}
      <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
        <span className="text-[var(--color-fg-dim)]">window:</span>
        {[1, 3, 7, 14, 30].map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`rounded-md px-2 py-1 ${
              days === d
                ? "bg-[var(--color-accent)] text-white"
                : "bg-[var(--color-panel-2)]/60 text-[var(--color-fg-muted)] hover:bg-[var(--color-panel-2)]"
            }`}
          >
            {d}d
          </button>
        ))}
      </div>

      {/* Items */}
      {data.items.length === 0 ? (
        <Banner tone="muted">{t.empty}</Banner>
      ) : (
        <ul className="space-y-3">
          {data.items.map((item) => (
            <TrendCard
              key={item.id}
              item={item}
              status={status}
              isEs={isEs}
              t={t}
              busy={busyId === item.id}
              onTransition={(a) => transition(item, a)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

interface UIText {
  keep: string;
  archive: string;
  promote: string;
  score: string;
}

function TrendCard({
  item,
  status,
  isEs: _isEs,
  t,
  busy,
  onTransition,
}: {
  item: TrendItem;
  status: Status;
  isEs: boolean;
  t: UIText;
  busy: boolean;
  onTransition: (action: "keep" | "archive" | "promote") => void;
}) {
  const Icon =
    item.source === "github"
      ? Github
      : item.source === "hackernews"
      ? Newspaper
      : item.source === "reddit"
      ? MessageSquare
      : ExternalLink;

  const sourceColor =
    item.source === "github"
      ? "text-emerald-400 border-emerald-500/30"
      : item.source === "hackernews"
      ? "text-orange-400 border-orange-500/30"
      : item.source === "reddit"
      ? "text-rose-400 border-rose-500/30"
      : "text-[var(--color-fg-dim)] border-[var(--color-border)]";

  const captured = new Date(item.captured_at);
  const hoursAgo = Math.round((Date.now() - captured.getTime()) / 3_600_000);
  const ageLabel = hoursAgo < 24 ? `${hoursAgo}h` : `${Math.round(hoursAgo / 24)}d`;

  return (
    <li className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] overflow-hidden">
      <div className="p-4 flex items-start gap-3">
        <span className={`shrink-0 inline-flex items-center justify-center h-8 w-8 rounded-lg border ${sourceColor} bg-[var(--color-panel-2)]/40`}>
          <Icon size={14} />
        </span>
        <div className="min-w-0 flex-1">
          <a
            href={item.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[14px] font-semibold text-[var(--color-fg-strong)] hover:text-[var(--color-accent)] transition-colors block break-words"
          >
            {item.title}
          </a>
          <p className="mt-1 text-[11px] font-mono text-[var(--color-fg-dim)]">
            {item.source}
            {item.source_subtype && <> · {item.source_subtype}</>}
            {" · "}
            {t.score}: {item.score}
            {" · "}
            {ageLabel}
          </p>
          {item.summary && (
            <p className="mt-2 text-[12.5px] text-[var(--color-fg-muted)] leading-relaxed line-clamp-2">
              {item.summary}
            </p>
          )}
          {item.tags && item.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {item.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[var(--color-panel-2)]/60 text-[var(--color-fg-muted)] px-2 py-0.5 text-[10px] font-mono"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {status === "pending" && (
        <div className="grid grid-cols-3 gap-2 p-2 bg-[var(--color-panel-2)]/40 border-t border-[var(--color-border)]">
          <button
            onClick={() => onTransition("archive")}
            disabled={busy}
            className="h-9 rounded-lg border border-[var(--color-border)] text-[var(--color-fg-muted)] hover:bg-[var(--color-panel-2)] disabled:opacity-50 text-[12px] font-medium inline-flex items-center justify-center gap-1.5 transition-colors"
          >
            <Archive size={12} />
            {busy ? "…" : t.archive}
          </button>
          <button
            onClick={() => onTransition("keep")}
            disabled={busy}
            className="h-9 rounded-lg border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-50 text-[12px] font-medium inline-flex items-center justify-center gap-1.5 transition-colors"
          >
            <CheckCircle2 size={12} />
            {busy ? "…" : t.keep}
          </button>
          <button
            onClick={() => onTransition("promote")}
            disabled={busy}
            className="h-9 rounded-lg text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] disabled:opacity-50 text-[12px] font-medium inline-flex items-center justify-center gap-1.5 transition-colors"
          >
            <TrendingUp size={12} />
            {busy ? "…" : t.promote}
          </button>
        </div>
      )}
    </li>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-[12px] font-medium transition-colors inline-flex items-center ${
        active
          ? "bg-[var(--color-accent)] text-white"
          : "bg-[var(--color-panel-2)]/60 text-[var(--color-fg-muted)] hover:bg-[var(--color-panel-2)]"
      }`}
    >
      {children}
    </button>
  );
}

function Banner({
  tone,
  children,
}: {
  tone: "muted" | "warn" | "error" | "success";
  children: React.ReactNode;
}) {
  const cls =
    tone === "error"
      ? "border-red-500/40 bg-red-500/10 text-red-400"
      : tone === "warn"
      ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
      : tone === "success"
      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
      : "border-[var(--color-border)] bg-[var(--color-panel)] text-[var(--color-fg-muted)]";
  return <div className={`rounded-2xl border p-4 text-[13px] ${cls}`}>{children}</div>;
}
