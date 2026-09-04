"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { authedFetch } from "@/lib/supabase/browser";
import { CorreccionButton } from "@/components/soporte/CorreccionButton";
import {
  SUPPORT_QUEUE_PAGE_SIZE,
  type SupportConversationSession,
  type SupportConversationTurn,
  type SupportQueueFilter,
  type SupportReason,
} from "@/lib/supportConversations/types";

// ─────────────────────────────────────────────────────────────
// SOPORTE — conversaciones reales del bot de soporte in-app.
// Lee support_conversations (via la vista agregada por session_id) a
// través de /api/admin/soporte/conversations[/[sessionId]], que a su vez
// usa la service-role key server-side — nunca llega al cliente.
//
// Cada turno se renderiza en <TurnCard>, que monta <CorreccionButton> del
// tren S3 (src/components/soporte/CorreccionButton.tsx) — el drawer de
// "corregir una respuesta" y el POST a /api/admin/soporte/corrections viven
// enteros ahí; acá solo se le pasa el subset ConversationForCorrection
// (id/question/answer/locale) del turno.
// ─────────────────────────────────────────────────────────────

type AuthState = "checking" | "anon" | "forbidden" | "ready";

const FILTERS: { value: SupportQueueFilter; label: { es: string; en: string } }[] = [
  { value: "all", label: { es: "Todas", en: "All" } },
  { value: "escalated", label: { es: "Escaladas", en: "Escalated" } },
  { value: "unknown", label: { es: "El bot no supo", en: "Bot didn't know" } },
];

const REASON_LABELS: Record<SupportReason, { es: string; en: string }> = {
  unknown: { es: "no supo la respuesta", en: "didn't know the answer" },
  billing: { es: "facturación", en: "billing" },
  requested: { es: "pidió un humano", en: "requested a human" },
  frustration: { es: "frustración", en: "frustration" },
  conflict: { es: "conflicto", en: "conflict" },
};

const CHANNEL_LABELS: Record<string, { es: string; en: string }> = {
  app: { es: "App", en: "App" },
  web: { es: "Web", en: "Web" },
};

function reasonLabel(reason: SupportReason, isEs: boolean): string {
  return REASON_LABELS[reason] ? REASON_LABELS[reason][isEs ? "es" : "en"] : reason;
}

function channelLabel(channel: string, isEs: boolean): string {
  return CHANNEL_LABELS[channel] ? CHANNEL_LABELS[channel][isEs ? "es" : "en"] : channel;
}

function fmtDateTime(iso: string, isEs: boolean): string {
  try {
    return new Date(iso).toLocaleString(isEs ? "es-CO" : "en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function fmtTime(iso: string, isEs: boolean): string {
  try {
    return new Date(iso).toLocaleTimeString(isEs ? "es-CO" : "en-US", { timeStyle: "short" });
  } catch {
    return iso;
  }
}

export function SoporteClient({ lang }: { lang: string }) {
  const isEs = lang === "es";
  const [auth, setAuth] = useState<AuthState>("checking");

  const [filter, setFilter] = useState<SupportQueueFilter>("all");
  const [qInput, setQInput] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const [sessions, setSessions] = useState<SupportConversationSession[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<string | null>(null);
  const [turns, setTurns] = useState<SupportConversationTurn[] | null>(null);
  const [threadLoading, setThreadLoading] = useState(false);
  const [threadError, setThreadError] = useState<string | null>(null);

  // Debounce the search box so every keystroke doesn't fire a request.
  useEffect(() => {
    const t = window.setTimeout(() => {
      setQ(qInput.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(t);
  }, [qInput]);

  useEffect(() => {
    setPage(1);
  }, [filter]);

  const loadSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ filter, page: String(page) });
      if (q) params.set("q", q);
      const res = await authedFetch(`/api/admin/soporte/conversations?${params.toString()}`, {
        cache: "no-store",
      } as RequestInit);
      if (res.status === 401) {
        setAuth("anon");
        return;
      }
      if (res.status === 403) {
        setAuth("forbidden");
        return;
      }
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      setSessions(Array.isArray(json.sessions) ? json.sessions : []);
      setTotal(typeof json.total === "number" ? json.total : 0);
      setHasMore(!!json.hasMore);
      setAuth("ready");
    } catch (e) {
      setError(e instanceof Error ? e.message : "unknown error");
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, [filter, q, page]);

  useEffect(() => {
    const watchdog = window.setTimeout(() => {
      setAuth((current) => (current === "checking" ? "anon" : current));
      setLoading(false);
    }, 3_000);
    void loadSessions().finally(() => window.clearTimeout(watchdog));
    return () => window.clearTimeout(watchdog);
  }, [loadSessions]);

  useEffect(() => {
    if (!selected) {
      setTurns(null);
      setThreadError(null);
      return;
    }
    let cancelled = false;
    setThreadLoading(true);
    setThreadError(null);
    (async () => {
      try {
        const res = await authedFetch(
          `/api/admin/soporte/conversations/${encodeURIComponent(selected)}`,
          { cache: "no-store" } as RequestInit,
        );
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
        if (!cancelled) setTurns(Array.isArray(json.turns) ? json.turns : []);
      } catch (e) {
        if (!cancelled) setThreadError(e instanceof Error ? e.message : "unknown error");
      } finally {
        if (!cancelled) setThreadLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selected]);

  const path = `/${lang}/admin/soporte`;
  const loginHref = `/${lang}/login?next=${encodeURIComponent(path)}`;
  const totalPages = Math.max(1, Math.ceil(total / SUPPORT_QUEUE_PAGE_SIZE));
  const noResultsForFilter = !loading && sessions.length === 0 && (filter !== "all" || q !== "");
  const trulyEmpty = !loading && sessions.length === 0 && filter === "all" && q === "" && page === 1;

  if (auth === "checking") {
    return (
      <Shell isEs={isEs}>
        <Banner tone="muted">{isEs ? "Verificando sesión admin…" : "Checking admin session…"}</Banner>
      </Shell>
    );
  }
  if (auth === "anon") {
    return (
      <Shell isEs={isEs}>
        <Banner tone="warn">
          {isEs ? "Este panel requiere sesión admin." : "This panel requires an admin session."}{" "}
          <a className="underline" href={loginHref}>
            {isEs ? "Entrar →" : "Sign in →"}
          </a>
        </Banner>
      </Shell>
    );
  }
  if (auth === "forbidden") {
    return (
      <Shell isEs={isEs}>
        <Banner tone="warn">
          {isEs
            ? "Tu cuenta no tiene permisos de admin. Verificá que tu email esté en ADMIN_EMAILS."
            : "Your account isn't an admin. Check that your email is in ADMIN_EMAILS."}
        </Banner>
      </Shell>
    );
  }

  return (
    <Shell isEs={isEs}>
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--color-fg-muted)]">Admin</p>
          <h1 className="mt-2 text-[26px] font-semibold tracking-tight text-[var(--color-fg-strong)]">
            {isEs ? "Soporte" : "Support"}
          </h1>
          <p className="mt-1 text-[13px] text-[var(--color-fg-muted)]">
            {isEs
              ? "Conversaciones reales del asistente de soporte, agrupadas por hilo."
              : "Real conversations with the support assistant, grouped by thread."}
          </p>
        </div>
        <button
          onClick={() => void loadSessions()}
          disabled={loading}
          className="self-start rounded-full border border-[var(--color-border)] px-3 py-1.5 text-[12px] hover:bg-[var(--color-panel)] disabled:opacity-50 sm:self-auto"
        >
          {loading ? (isEs ? "Actualizando…" : "Refreshing…") : isEs ? "Refrescar" : "Refresh"}
        </button>
      </header>

      {error ? <Banner tone="error">{error}</Banner> : null}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[420px_1fr]">
        <section className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFilter(f.value)}
                className={
                  filter === f.value
                    ? "rounded-full bg-[var(--color-fg-strong)] px-3 py-1.5 text-[12px] font-medium text-[var(--color-bg)]"
                    : "rounded-full border border-[var(--color-border)] px-3 py-1.5 text-[12px] font-medium text-[var(--color-fg-muted)] hover:bg-[var(--color-panel)] hover:text-[var(--color-fg-strong)]"
                }
              >
                {isEs ? f.label.es : f.label.en}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            placeholder={isEs ? "Buscar en pregunta o respuesta…" : "Search question or answer…"}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-2 text-[13px] text-[var(--color-fg)] outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          />

          {trulyEmpty ? (
            <Banner tone="muted">
              {isEs
                ? "Todavía no hay conversaciones registradas — el registro se activa cuando el nodo de n8n esté conectado."
                : "No conversations logged yet — logging turns on once the n8n node is connected."}
            </Banner>
          ) : noResultsForFilter ? (
            <Banner tone="muted">
              {isEs ? "Ninguna conversación coincide con este filtro/búsqueda." : "No conversations match this filter/search."}
            </Banner>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-[var(--color-border)]">
              {sessions.map((s) => (
                <SessionRow
                  key={s.sessionId}
                  session={s}
                  selected={selected === s.sessionId}
                  isEs={isEs}
                  onClick={() => setSelected(s.sessionId)}
                />
              ))}
            </div>
          )}

          {total > SUPPORT_QUEUE_PAGE_SIZE ? (
            <div className="flex items-center justify-between text-[12px] text-[var(--color-fg-muted)]">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-full border border-[var(--color-border)] px-3 py-1 disabled:opacity-40"
              >
                {isEs ? "← Anterior" : "← Prev"}
              </button>
              <span>
                {isEs ? "Página" : "Page"} {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={!hasMore}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-full border border-[var(--color-border)] px-3 py-1 disabled:opacity-40"
              >
                {isEs ? "Siguiente →" : "Next →"}
              </button>
            </div>
          ) : null}
        </section>

        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)]/60 p-5 min-h-[320px]">
          {!selected ? (
            <div className="flex h-full min-h-[280px] items-center justify-center text-center text-[13px] text-[var(--color-fg-muted)]">
              {isEs ? "Elegí una conversación de la lista para ver el hilo." : "Pick a conversation from the list to see the thread."}
            </div>
          ) : threadLoading && !turns ? (
            <Banner tone="muted">{isEs ? "Cargando hilo…" : "Loading thread…"}</Banner>
          ) : threadError ? (
            <Banner tone="error">{threadError}</Banner>
          ) : turns && turns.length > 0 ? (
            <div className="flex flex-col gap-4">
              <p className="text-[11px] font-mono text-[var(--color-fg-muted)] break-all">{selected}</p>
              {turns.map((t) => (
                <TurnCard key={t.id} turn={t} isEs={isEs} />
              ))}
            </div>
          ) : (
            <Banner tone="muted">{isEs ? "Este hilo no tiene turnos." : "This thread has no turns."}</Banner>
          )}
        </section>
      </div>
    </Shell>
  );
}

function SessionRow({
  session,
  selected,
  isEs,
  onClick,
}: {
  session: SupportConversationSession;
  selected: boolean;
  isEs: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`block w-full border-b border-[var(--color-border)] px-4 py-3 text-left last:border-b-0 ${
        selected ? "bg-[var(--color-panel-2)]" : "bg-[var(--color-panel)] hover:bg-[var(--color-panel-2)]"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-medium text-[var(--color-fg-strong)]">
          {fmtDateTime(session.lastTurnAt, isEs)}
        </span>
        <span className="text-[11px] font-mono text-[var(--color-fg-muted)]">
          {session.turnCount} {isEs ? "turnos" : "turns"}
        </span>
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
        <Pill>{channelLabel(session.channel, isEs)}</Pill>
        {session.locale ? <Pill>{session.locale}</Pill> : null}
        {session.plan ? <Pill>{session.plan}</Pill> : null}
        {session.topic ? <Pill>{session.topic}</Pill> : null}
        {session.hasEscalation ? (
          <Pill tone="warn">
            {isEs ? "Escalada" : "Escalated"}
            {session.escalationReasons.length > 0
              ? ` · ${session.escalationReasons.map((r) => reasonLabel(r, isEs)).join(", ")}`
              : ""}
          </Pill>
        ) : null}
        {session.hasUnknownGap ? (
          <Pill tone="info">{isEs ? "No supo" : "Didn't know"}</Pill>
        ) : null}
      </div>
    </button>
  );
}

function TurnCard({ turn, isEs }: { turn: SupportConversationTurn; isEs: boolean }) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] p-4">
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <Pill>{fmtTime(turn.createdAt, isEs)}</Pill>
        <Pill>{channelLabel(turn.channel, isEs)}</Pill>
        {turn.locale ? <Pill>{turn.locale}</Pill> : null}
        {turn.plan ? <Pill>{turn.plan}</Pill> : null}
        {turn.topic ? <Pill>{turn.topic}</Pill> : null}
        {turn.promptVersion ? <Pill>prompt {turn.promptVersion}</Pill> : null}
        {turn.escalated ? (
          <Pill tone="warn">
            {isEs ? "Escalada" : "Escalated"}
            {turn.reason ? ` · ${reasonLabel(turn.reason, isEs)}` : ""}
          </Pill>
        ) : turn.reason === "unknown" ? (
          <Pill tone="info">{isEs ? "No supo" : "Didn't know"}</Pill>
        ) : null}
      </div>
      <p className="text-[13px] font-medium text-[var(--color-fg-strong)]">{turn.question}</p>
      <p className="mt-2 whitespace-pre-wrap text-[13px] text-[var(--color-fg)]">{turn.answer}</p>
      <div className="mt-3">
        <CorreccionButton
          conversation={{ id: turn.id, question: turn.question, answer: turn.answer, locale: turn.locale }}
        />
      </div>
    </div>
  );
}

function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "warn" | "info" }) {
  const cls =
    tone === "warn"
      ? "border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-200"
      : tone === "info"
        ? "border-sky-500/40 bg-sky-500/10 text-sky-800 dark:text-sky-200"
        : "border-[var(--color-border)] text-[var(--color-fg-muted)]";
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${cls}`}>
      {children}
    </span>
  );
}

function Shell({ isEs, children }: { isEs: boolean; children: ReactNode }) {
  void isEs;
  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)]">
      <section className="mx-auto max-w-6xl px-5 md:px-6 py-10">{children}</section>
    </main>
  );
}

function Banner({ tone, children }: { tone: "muted" | "warn" | "error"; children: ReactNode }) {
  const cls =
    tone === "error"
      ? "border-red-500/40 bg-red-500/10 text-red-800 dark:text-red-200"
      : tone === "warn"
        ? "border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-200"
        : "border-[var(--color-border)] bg-[var(--color-panel)]/60 text-[var(--color-fg-muted)]";
  return <div className={`rounded-2xl border p-5 text-[14px] ${cls}`}>{children}</div>;
}
