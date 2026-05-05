"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { authedFetch, getSupabaseBrowser } from "@/lib/supabase/browser";

interface Publisher {
  id: string;
  display_name: string;
  slug: string;
  website: string | null;
  payout_enabled: boolean;
  stripe_account_id: string | null;
  approved_at: string | null;
}

interface PendingListing {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  category: string;
  pricing_type: "free" | "one_time";
  price_cents: number | null;
  currency: string;
  description_md: string;
  setup_md: string;
  logo_url: string;
  publisher_id: string;
  created_at: string;
  publisher: Publisher | null;
  latestVersion: {
    version: string;
    manifest_json: unknown;
    checksum: string;
    created_at: string;
  } | null;
}

interface QueueResponse {
  pending: PendingListing[];
  stats: { pendingCount: number; approvedToday: number; rejectedToday: number };
}

type AuthState = "checking" | "anon" | "ready" | "forbidden";
type View = "pending" | "approved";

interface UIText {
  checking: string; anon: string; forbidden: string; empty: string; loading: string;
  pending: string; approvedToday: string; rejectedToday: string;
  approve: string; reject: string; takedown: string; next: string; prev: string;
  manifest: string; description: string; setup: string; free: string;
  payoutEnabled: string; payoutPending: string; noWebsite: string;
  rejectPrompt: string; takedownPrompt: string; keyHint: string;
  tabPending: string; tabApproved: string;
}

export function AdminReview({ lang }: { lang: string }) {
  const isEs = lang === "es";
  const [auth, setAuth] = useState<AuthState>("checking");
  const [data, setData] = useState<QueueResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [cursor, setCursor] = useState(0);
  const [view, setView] = useState<View>("pending");

  const t: UIText = useMemo(
    () => ({
      checking: isEs ? "Verificando sesión…" : "Checking session…",
      anon: isEs ? "Iniciá sesión con tu cuenta admin." : "Sign in with your admin account.",
      forbidden: isEs ? "Tu cuenta no tiene permisos de admin." : "Your account is not an admin.",
      empty: isEs ? "Cola vacía. Buen trabajo ✨" : "Queue empty. Nice work ✨",
      loading: isEs ? "Cargando…" : "Loading…",
      pending: isEs ? "Pendientes" : "Pending",
      approvedToday: isEs ? "Aprobados hoy" : "Approved today",
      rejectedToday: isEs ? "Rechazados hoy" : "Rejected today",
      approve: isEs ? "Aprobar" : "Approve",
      reject: isEs ? "Rechazar" : "Reject",
      takedown: isEs ? "Bajar del marketplace" : "Take down",
      next: isEs ? "Siguiente →" : "Next →",
      prev: isEs ? "← Anterior" : "← Prev",
      manifest: "Manifest",
      description: isEs ? "Descripción" : "Description",
      setup: "Setup",
      free: "Free",
      payoutEnabled: "Stripe OK",
      payoutPending: isEs ? "Stripe pendiente" : "Stripe pending",
      noWebsite: isEs ? "(sin website)" : "(no website)",
      rejectPrompt: isEs ? "¿Por qué rechazás?" : "Reason for rejection?",
      takedownPrompt: isEs ? "Razón del takedown:" : "Takedown reason:",
      keyHint: isEs ? "Atajos: A aprobar · R rechazar · ← → navegar" : "Shortcuts: A approve · R reject · ← → navigate",
      tabPending: isEs ? "Pendientes" : "Pending",
      tabApproved: isEs ? "Aprobados" : "Approved",
    }),
    [isEs],
  );

  const load = useCallback(async () => {
    try {
      setError(null);
      const res = await authedFetch(`/api/marketplace/admin/queue?view=${view}`);
      if (res.status === 401) { setAuth("anon"); return; }
      if (res.status === 403) { setAuth("forbidden"); return; }
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Error");
      setData(d);
      setAuth("ready");
      setCursor((c) => Math.min(c, Math.max(0, d.pending.length - 1)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    }
  }, [view]);

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

  async function transition(id: string, action: "approve" | "reject" | "unpublish") {
    let notes = "";
    if (action === "reject") {
      notes = prompt(t.rejectPrompt) ?? "";
      if (!notes.trim()) return;
    } else if (action === "unpublish") {
      notes = prompt(t.takedownPrompt) ?? "";
      if (!notes.trim()) return;
    }
    setBusyId(id);
    try {
      const res = await authedFetch(`/api/marketplace/listings/${id}`, {
        method: "PATCH",
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

  useEffect(() => {
    if (auth !== "ready" || !data || data.pending.length === 0) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const current = data.pending[cursor];
      if (!current) return;
      if ((e.key === "a" || e.key === "A") && view === "pending") {
        e.preventDefault();
        transition(current.id, "approve");
      } else if ((e.key === "r" || e.key === "R") && view === "pending") {
        e.preventDefault();
        transition(current.id, "reject");
      } else if (e.key === "ArrowRight") {
        setCursor((c) => Math.min(c + 1, data.pending.length - 1));
      } else if (e.key === "ArrowLeft") {
        setCursor((c) => Math.max(c - 1, 0));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [auth, data, cursor, view]); // eslint-disable-line react-hooks/exhaustive-deps

  if (auth === "checking") return <Banner tone="muted">{t.checking}</Banner>;
  if (auth === "anon")
    return (
      <Banner tone="warn">
        {t.anon}{" "}
        <a href={`/${lang}/login?next=${encodeURIComponent(`/${lang}/admin/marketplace`)}`} className="underline">
          {isEs ? "Entrar →" : "Sign in →"}
        </a>
      </Banner>
    );
  if (auth === "forbidden") return <Banner tone="warn">{t.forbidden}</Banner>;
  if (error) return <Banner tone="error">{error}</Banner>;
  if (!data) return <Banner tone="muted">{t.loading}</Banner>;

  const total = data.pending.length;
  const current = data.pending[cursor];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)]/60 p-1">
        <TabPill active={view === "pending"} onClick={() => { setView("pending"); setCursor(0); }}>
          {t.tabPending}
        </TabPill>
        <TabPill active={view === "approved"} onClick={() => { setView("approved"); setCursor(0); }}>
          {t.tabApproved}
        </TabPill>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat label={t.pending} value={data.stats.pendingCount} accent="amber" />
        <Stat label={t.approvedToday} value={data.stats.approvedToday} accent="emerald" />
        <Stat label={t.rejectedToday} value={data.stats.rejectedToday} accent="red" />
      </div>

      {total === 0 ? (
        <Banner tone="success">{t.empty}</Banner>
      ) : (
        <>
          <div className="flex items-center justify-between gap-3 text-[12px] font-mono text-[var(--color-fg-muted)]">
            <button
              onClick={() => setCursor((c) => Math.max(c - 1, 0))}
              disabled={cursor === 0}
              className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 disabled:opacity-30"
            >
              {t.prev}
            </button>
            <span>{cursor + 1} / {total}</span>
            <button
              onClick={() => setCursor((c) => Math.min(c + 1, total - 1))}
              disabled={cursor === total - 1}
              className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 disabled:opacity-30"
            >
              {t.next}
            </button>
          </div>

          {current && (
            <ListingCard
              listing={current}
              isEs={isEs}
              t={t}
              busy={busyId === current.id}
              view={view}
              onApprove={() => transition(current.id, "approve")}
              onReject={() => transition(current.id, "reject")}
              onTakedown={() => transition(current.id, "unpublish")}
            />
          )}

          <p className="text-center text-[11px] font-mono text-[var(--color-fg-dim)]">
            {t.keyHint}
          </p>
        </>
      )}
    </div>
  );
}

function ListingCard({
  listing, isEs, t, busy, view, onApprove, onReject, onTakedown,
}: {
  listing: PendingListing; isEs: boolean; t: UIText;
  busy: boolean; view: View;
  onApprove: () => void; onReject: () => void; onTakedown: () => void;
}) {
  const [tab, setTab] = useState<"manifest" | "description" | "setup">("manifest");
  const priceLabel =
    listing.pricing_type === "free"
      ? t.free
      : `$${((listing.price_cents ?? 0) / 100).toFixed(2)} ${listing.currency.toUpperCase()}`;
  const manifestPretty = useMemo(() => {
    if (!listing.latestVersion) return "// no version";
    try { return JSON.stringify(listing.latestVersion.manifest_json, null, 2); }
    catch { return "// invalid JSON"; }
  }, [listing.latestVersion]);

  return (
    <article className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] overflow-hidden">
      <header className="flex items-start gap-3 p-4 sm:p-5 border-b border-[var(--color-border)]">
        {listing.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={listing.logo_url} alt="" className="h-12 w-12 rounded-xl object-cover bg-[var(--color-panel-2)] shrink-0" />
        ) : (
          <div className="h-12 w-12 rounded-xl bg-[var(--color-panel-2)] shrink-0" />
        )}
        <div className="min-w-0 flex-1">
          <h3 className="text-[16px] sm:text-[18px] font-semibold tracking-tight truncate">{listing.name}</h3>
          <p className="mt-0.5 text-[11px] font-mono text-[var(--color-fg-dim)] truncate">
            {listing.category} · {priceLabel} · {listing.slug}
          </p>
          <p className="mt-2 text-[13px] text-[var(--color-fg-muted)]">{listing.tagline}</p>
        </div>
      </header>

      <div className="px-4 sm:px-5 py-3 border-b border-[var(--color-border)] bg-[var(--color-panel-2)]/40">
        <div className="flex items-center justify-between gap-2 text-[12px]">
          <div className="min-w-0">
            <p className="font-mono text-[var(--color-fg-dim)] uppercase tracking-[0.12em] text-[10px]">Publisher</p>
            <p className="font-semibold truncate">
              {listing.publisher?.display_name ?? "—"}
              {listing.publisher?.slug && (
                <span className="ml-2 font-mono font-normal text-[var(--color-fg-dim)]">@{listing.publisher.slug}</span>
              )}
            </p>
            {listing.publisher?.website ? (
              <a href={listing.publisher.website} target="_blank" rel="noopener noreferrer" className="text-[11px] text-[var(--color-accent)] hover:underline">
                {listing.publisher.website}
              </a>
            ) : (
              <span className="text-[11px] text-[var(--color-fg-dim)]">{t.noWebsite}</span>
            )}
          </div>
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-mono ${
            listing.publisher?.payout_enabled
              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
              : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
          }`}>
            {listing.publisher?.payout_enabled ? t.payoutEnabled : t.payoutPending}
          </span>
        </div>
      </div>

      <div className="flex border-b border-[var(--color-border)]">
        <TabButton active={tab === "manifest"} onClick={() => setTab("manifest")}>{t.manifest}</TabButton>
        <TabButton active={tab === "description"} onClick={() => setTab("description")}>{t.description}</TabButton>
        <TabButton active={tab === "setup"} onClick={() => setTab("setup")}>{t.setup}</TabButton>
      </div>

      <div className="p-4 sm:p-5">
        {tab === "manifest" && (
          <div className="space-y-2">
            {listing.latestVersion && (
              <p className="text-[10px] font-mono text-[var(--color-fg-dim)]">
                v{listing.latestVersion.version} · sha256:{listing.latestVersion.checksum.slice(0, 12)}…
              </p>
            )}
            <pre className="text-[11px] sm:text-[12px] font-mono whitespace-pre-wrap text-[var(--color-fg)] bg-[var(--color-panel-2)] rounded-lg p-3 max-h-[40vh] overflow-auto">
              {manifestPretty}
            </pre>
          </div>
        )}
        {tab === "description" && (
          <pre className="text-[12px] sm:text-[13px] font-sans whitespace-pre-wrap text-[var(--color-fg-muted)] max-h-[40vh] overflow-auto">{listing.description_md}</pre>
        )}
        {tab === "setup" && (
          <pre className="text-[12px] sm:text-[13px] font-sans whitespace-pre-wrap text-[var(--color-fg-muted)] max-h-[40vh] overflow-auto">{listing.setup_md}</pre>
        )}
      </div>

      <div className="p-3 border-t border-[var(--color-border)] bg-[var(--color-panel-2)]/40">
        {view === "pending" ? (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onReject}
              disabled={busy}
              className="h-12 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-500/10 disabled:opacity-50 text-[14px] font-semibold transition-colors"
            >
              {busy ? "…" : t.reject}
            </button>
            <button
              onClick={onApprove}
              disabled={busy || (listing.pricing_type === "one_time" && !listing.publisher?.payout_enabled)}
              className="h-12 rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-[14px] font-semibold transition-colors"
              title={listing.pricing_type === "one_time" && !listing.publisher?.payout_enabled ? "Publisher must complete Stripe Connect first" : undefined}
            >
              {busy ? "…" : t.approve}
            </button>
          </div>
        ) : (
          <button
            onClick={onTakedown}
            disabled={busy}
            className="w-full h-12 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-500/10 disabled:opacity-50 text-[14px] font-semibold transition-colors"
          >
            {busy ? "…" : t.takedown}
          </button>
        )}
      </div>
    </article>
  );
}

function TabPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-lg text-[12.5px] font-semibold transition-colors ${
        active ? "bg-[var(--color-accent)] text-white" : "text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
      }`}
    >
      {children}
    </button>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 px-3 py-2.5 text-[12px] font-mono uppercase tracking-[0.12em] transition-colors ${
        active
          ? "text-[var(--color-fg)] bg-[var(--color-panel-2)]/60 border-b-2 border-[var(--color-accent)]"
          : "text-[var(--color-fg-dim)] hover:text-[var(--color-fg-muted)]"
      }`}
    >
      {children}
    </button>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent: "amber" | "emerald" | "red" }) {
  const tone = accent === "amber" ? "text-amber-400" : accent === "emerald" ? "text-emerald-400" : "text-red-400";
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-3 text-center">
      <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--color-fg-dim)]">{label}</p>
      <p className={`mt-1 text-[22px] font-semibold ${tone}`}>{value}</p>
    </div>
  );
}

function Banner({ tone, children }: { tone: "muted" | "warn" | "error" | "success"; children: React.ReactNode }) {
  const cls =
    tone === "error" ? "border-red-500/40 bg-red-500/10 text-red-400"
    : tone === "warn" ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
    : tone === "success" ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
    : "border-[var(--color-border)] bg-[var(--color-panel)] text-[var(--color-fg-muted)]";
  return <div className={`rounded-2xl border p-4 text-[13px] ${cls}`}>{children}</div>;
}
