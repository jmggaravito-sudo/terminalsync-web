"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";
import { useAdminKey } from "@/lib/marketplace/useAdminKey";
import {
  Check,
  Edit3,
  Loader2,
  Plus,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import type {
  BundleProposal,
  ProposedItem,
} from "@/lib/marketplace/schema";

type ProposalStatus = BundleProposal["status"];

interface QueueStats {
  pending: number;
  approved: number;
  rejected: number;
}

interface Banner {
  tone: "ok" | "error";
  message: string;
  link?: { href: string; label: string };
}

export function ProposalsClient({ lang }: { lang: string }) {
  const isEs = lang === "es";
  const { key, loaded: keyLoaded } = useAdminKey();

  const [proposals, setProposals] = useState<BundleProposal[] | null>(null);
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [filter, setFilter] = useState<ProposalStatus>("pending");
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectFor, setRejectFor] = useState<string | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");
  const [editing, setEditing] = useState<BundleProposal | null>(null);
  const [banner, setBanner] = useState<Banner | null>(null);

  const t = useMemo(
    () => ({
      missingKey: isEs ? "Falta el ?key= en la URL." : "Missing ?key= URL parameter.",
      loading: isEs ? "Cargando…" : "Loading…",
      empty: isEs ? "No hay propuestas." : "No proposals.",
      publish: isEs ? "Publicar" : "Publish",
      reject: isEs ? "Rechazar" : "Reject",
      edit: isEs ? "Editar" : "Edit",
      whatsIncluded: isEs ? "Qué incluye" : "What's included",
      samplePrompts: isEs ? "Prompts de ejemplo" : "Sample prompts",
      setup: isEs ? "Setup" : "Setup",
      reviewerNotes: isEs ? "Motivo del rechazo (opcional)" : "Reason for rejection (optional)",
      cancel: isEs ? "Cancelar" : "Cancel",
      confirmReject: isEs ? "Confirmar rechazo" : "Confirm rejection",
      save: isEs ? "Guardar cambios" : "Save changes",
      published: isEs ? "Publicado" : "Published",
      viewBundle: isEs ? "Ver pack" : "View pack",
      tabPending: isEs ? "Pendientes" : "Pending",
      tabApproved: isEs ? "Publicados" : "Published",
      tabRejected: isEs ? "Rechazados" : "Rejected",
    }),
    [isEs],
  );

  const reload = useCallback(
    async (status: ProposalStatus = filter) => {
      if (!key) return;
      setError(null);
      try {
        const res = await fetch(
          `/api/marketplace/admin/proposals?status=${status}&key=${encodeURIComponent(key)}`,
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
        setProposals(data.proposals ?? []);
        setStats(data.stats ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    },
    [key, filter],
  );

  useEffect(() => {
    reload(filter);
  }, [reload, filter]);

  const onPublish = async (p: BundleProposal) => {
    setBusyId(p.id);
    setBanner(null);
    try {
      const res = await fetch(
        `/api/marketplace/admin/proposals/${p.id}/approve?lang=${lang}&key=${encodeURIComponent(key)}`,
        { method: "POST" },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      const slug = data?.bundle?.slug ?? p.slug;
      setBanner({
        tone: "ok",
        message: isEs
          ? `Publicado como /${lang}/stacks/${slug}`
          : `Published as /${lang}/stacks/${slug}`,
        link: {
          href: data.redirectTo ?? `/${lang}/stacks/${slug}`,
          label: t.viewBundle,
        },
      });
      await reload(filter);
    } catch (err) {
      setBanner({
        tone: "error",
        message: err instanceof Error ? err.message : "Publish failed",
      });
    } finally {
      setBusyId(null);
    }
  };

  const onReject = async () => {
    if (!rejectFor) return;
    setBusyId(rejectFor);
    setBanner(null);
    try {
      const res = await fetch(
        `/api/marketplace/admin/proposals/${rejectFor}?key=${encodeURIComponent(key)}`,
        {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            action: "reject",
            reviewerNotes: rejectNotes,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setRejectFor(null);
      setRejectNotes("");
      await reload(filter);
    } catch (err) {
      setBanner({
        tone: "error",
        message: err instanceof Error ? err.message : "Reject failed",
      });
    } finally {
      setBusyId(null);
    }
  };

  const onSaveEdit = async (next: BundleProposal) => {
    setBusyId(next.id);
    setBanner(null);
    try {
      const res = await fetch(
        `/api/marketplace/admin/proposals/${next.id}?key=${encodeURIComponent(key)}`,
        {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            action: "edit",
            name: next.name,
            slug: next.slug,
            tagline: next.tagline,
            descriptionMd: next.descriptionMd,
            setupMd: next.setupMd,
            samplePrompts: next.samplePrompts,
            proposedItems: next.proposedItems,
            persona: next.persona,
            personaLabel: next.personaLabel,
            painPoint: next.painPoint,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setEditing(null);
      await reload(filter);
    } catch (err) {
      setBanner({
        tone: "error",
        message: err instanceof Error ? err.message : "Save failed",
      });
    } finally {
      setBusyId(null);
    }
  };

  // Wait for the cookie-read pass before flashing the "Missing key"
  // banner — the key may resolve from cookie a tick after first paint.
  if (!keyLoaded) return null;
  if (!key) return <Notice tone="warn" text={t.missingKey} />;

  return (
    <div className="space-y-5">
      {/* Tabs + stats */}
      <div className="flex flex-wrap items-center gap-2">
        <TabButton
          active={filter === "pending"}
          onClick={() => setFilter("pending")}
          label={t.tabPending}
          count={stats?.pending}
        />
        <TabButton
          active={filter === "approved"}
          onClick={() => setFilter("approved")}
          label={t.tabApproved}
          count={stats?.approved}
        />
        <TabButton
          active={filter === "rejected"}
          onClick={() => setFilter("rejected")}
          label={t.tabRejected}
          count={stats?.rejected}
        />
      </div>

      {banner && (
        <div
          className={`rounded-xl border px-3.5 py-2.5 text-[12.5px] flex items-center justify-between gap-3 ${
            banner.tone === "ok"
              ? "border-[var(--color-ok)]/40 bg-[var(--color-ok)]/10 text-[var(--color-ok)]"
              : "border-red-500/40 bg-red-500/10 text-red-400"
          }`}
        >
          <span>{banner.message}</span>
          {banner.link && (
            <a
              href={banner.link.href}
              target="_blank"
              rel="noreferrer"
              className="underline font-semibold"
            >
              {banner.link.label} →
            </a>
          )}
        </div>
      )}

      {error && <Notice tone="error" text={error} />}
      {!error && proposals === null && <Notice tone="info" text={t.loading} />}
      {!error && proposals !== null && proposals.length === 0 && (
        <Notice tone="info" text={t.empty} />
      )}

      {proposals?.map((p) => (
        <ProposalCard
          key={p.id}
          proposal={p}
          isEs={isEs}
          t={t}
          busy={busyId === p.id}
          rejecting={rejectFor === p.id}
          rejectNotes={rejectNotes}
          onPublish={() => onPublish(p)}
          onStartReject={() => {
            setRejectFor(p.id);
            setRejectNotes("");
          }}
          onCancelReject={() => {
            setRejectFor(null);
            setRejectNotes("");
          }}
          onChangeNotes={setRejectNotes}
          onConfirmReject={onReject}
          onEdit={() => setEditing(p)}
        />
      ))}

      {editing && (
        <EditModal
          proposal={editing}
          isEs={isEs}
          busy={busyId === editing.id}
          onCancel={() => setEditing(null)}
          onSave={onSaveEdit}
        />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors ${
        active
          ? "border-[var(--color-accent)] bg-[var(--color-accent)]/12 text-[var(--color-accent)]"
          : "border-[var(--color-border)] bg-[var(--color-panel)] text-[var(--color-fg-muted)] hover:border-[var(--color-accent)]/40"
      }`}
    >
      {label}
      {typeof count === "number" && (
        <span className="text-[10.5px] font-mono opacity-70">{count}</span>
      )}
    </button>
  );
}

interface CardTexts {
  publish: string;
  reject: string;
  edit: string;
  whatsIncluded: string;
  samplePrompts: string;
  setup: string;
  reviewerNotes: string;
  cancel: string;
  confirmReject: string;
  published: string;
  viewBundle: string;
}

function ProposalCard({
  proposal,
  isEs,
  t,
  busy,
  rejecting,
  rejectNotes,
  onPublish,
  onStartReject,
  onCancelReject,
  onChangeNotes,
  onConfirmReject,
  onEdit,
}: {
  proposal: BundleProposal;
  isEs: boolean;
  t: CardTexts;
  busy: boolean;
  rejecting: boolean;
  rejectNotes: string;
  onPublish: () => void;
  onStartReject: () => void;
  onCancelReject: () => void;
  onChangeNotes: (s: string) => void;
  onConfirmReject: () => void;
  onEdit: () => void;
}) {
  const isPending = proposal.status === "pending";

  return (
    <article className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5 space-y-4">
      <header className="flex flex-wrap items-start gap-3 justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            <span className="inline-flex items-center text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--color-accent)] border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 px-2 py-0.5 rounded-full">
              {proposal.persona}
            </span>
            <span className="text-[11px] text-[var(--color-fg-dim)]">
              {proposal.personaLabel}
            </span>
            {proposal.status !== "pending" && (
              <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--color-fg-dim)] border border-[var(--color-border)] px-1.5 py-0.5 rounded-full">
                {proposal.status}
              </span>
            )}
          </div>
          <h2 className="text-[17px] font-semibold tracking-tight">
            {proposal.name}
          </h2>
          <p className="mt-1 text-[12.5px] text-[var(--color-fg-muted)]">
            {proposal.tagline}
          </p>
          <p className="mt-2 text-[11.5px] text-[var(--color-fg-dim)] italic">
            “{proposal.painPoint}”
          </p>
        </div>
        <div className="text-right text-[10.5px] font-mono text-[var(--color-fg-dim)] shrink-0">
          <div>{proposal.slug}</div>
          <div>${(proposal.priceCents / 100).toFixed(2)}</div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Block title={t.whatsIncluded} icon="📦">
          <ul className="space-y-1.5">
            {proposal.proposedItems.map((it) => (
              <ItemRow key={`${it.kind}:${it.slug}`} item={it} />
            ))}
          </ul>
        </Block>

        {proposal.samplePrompts.length > 0 && (
          <Block title={t.samplePrompts} icon="💬">
            <ol className="space-y-1.5 list-decimal list-inside">
              {proposal.samplePrompts.map((sp, i) => (
                <li
                  key={i}
                  className="text-[12px] font-mono text-[var(--color-fg)] leading-relaxed"
                >
                  <code>“{sp}”</code>
                </li>
              ))}
            </ol>
          </Block>
        )}
      </div>

      {proposal.setupMd && (
        <Block title={t.setup} icon="📖">
          <pre className="whitespace-pre-wrap font-sans text-[12.5px] text-[var(--color-fg-muted)] leading-relaxed line-clamp-6">
            {proposal.setupMd}
          </pre>
        </Block>
      )}

      {proposal.reviewerNotes && (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-2)] px-3 py-2 text-[12px] text-[var(--color-fg-muted)]">
          <span className="font-mono uppercase text-[10px] tracking-[0.14em] text-[var(--color-fg-dim)] mr-2">
            {isEs ? "Notas" : "Notes"}:
          </span>
          {proposal.reviewerNotes}
        </div>
      )}

      {isPending && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={onPublish}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] text-white text-[12.5px] font-semibold px-3.5 py-2 disabled:opacity-50 transition-colors"
          >
            {busy ? (
              <Loader2 size={13} className="animate-spin" strokeWidth={2.4} />
            ) : (
              <Check size={13} strokeWidth={2.4} />
            )}
            {t.publish}
          </button>
          <button
            onClick={onStartReject}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] hover:border-red-400 text-[var(--color-fg-muted)] hover:text-red-400 text-[12.5px] font-semibold px-3.5 py-2 disabled:opacity-50 transition-colors"
          >
            <XCircle size={13} strokeWidth={2.4} />
            {t.reject}
          </button>
          <button
            onClick={onEdit}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-accent)]/60 text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] text-[12.5px] font-semibold px-3.5 py-2 disabled:opacity-50 transition-colors"
          >
            <Edit3 size={13} strokeWidth={2.4} />
            {t.edit}
          </button>
        </div>
      )}

      {rejecting && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-3 space-y-2">
          <label className="text-[11px] font-mono uppercase tracking-[0.14em] text-[var(--color-fg-dim)]">
            {t.reviewerNotes}
          </label>
          <textarea
            value={rejectNotes}
            onChange={(e) => onChangeNotes(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-2)] px-2.5 py-1.5 text-[12.5px] outline-none focus:border-[var(--color-accent)]/60 resize-y"
            placeholder={
              isEs
                ? "Ej: items no relacionados al persona"
                : "e.g. items unrelated to the persona"
            }
          />
          <div className="flex items-center gap-2">
            <button
              onClick={onConfirmReject}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/90 hover:bg-red-500 text-white text-[12px] font-semibold px-3 py-1.5 disabled:opacity-50"
            >
              {busy ? (
                <Loader2 size={12} className="animate-spin" strokeWidth={2.4} />
              ) : (
                <Check size={12} strokeWidth={2.4} />
              )}
              {t.confirmReject}
            </button>
            <button
              onClick={onCancelReject}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-fg-muted)] text-[12px] font-semibold px-3 py-1.5"
            >
              {t.cancel}
            </button>
          </div>
        </div>
      )}

      {proposal.status === "approved" && proposal.publishedBundleId && (
        <div className="text-[11.5px] font-mono text-[var(--color-fg-dim)]">
          → bundle id {proposal.publishedBundleId}
        </div>
      )}
    </article>
  );
}

// Same user-facing labels as the public bundle page — admin previews
// what the user will see, so dev terms don't leak into JM's review.
function adminKindLabel(kind: string): string {
  switch (kind) {
    case "connector":
      return "Integración";
    case "skill":
      return "Receta";
    case "cli":
      return "Herramienta";
    default:
      return kind;
  }
}

function ItemRow({ item }: { item: ProposedItem }) {
  return (
    <li className="flex flex-wrap items-baseline gap-2 text-[12.5px]">
      <span className="inline-flex items-center text-[9.5px] font-mono uppercase tracking-[0.14em] text-[var(--color-accent)] border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 px-1.5 py-0.5 rounded-full shrink-0">
        {adminKindLabel(item.kind)}
      </span>
      <code className="font-mono text-[var(--color-fg-dim)] text-[11px]">{item.slug}</code>
      {item.whyItHelps && (
        <span className="text-[11.5px] text-[var(--color-fg-muted)]">
          — {item.whyItHelps}
        </span>
      )}
    </li>
  );
}

function Block({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--color-fg-dim)] mb-2">
        <span className="mr-1.5">{icon}</span>
        {title}
      </h3>
      {children}
    </div>
  );
}

function EditModal({
  proposal,
  isEs,
  busy,
  onCancel,
  onSave,
}: {
  proposal: BundleProposal;
  isEs: boolean;
  busy: boolean;
  onCancel: () => void;
  onSave: (next: BundleProposal) => void;
}) {
  const [draft, setDraft] = useState<BundleProposal>(proposal);

  const set = <K extends keyof BundleProposal>(
    key: K,
    value: BundleProposal[K],
  ) => setDraft((d) => ({ ...d, [key]: value }));

  const updatePrompt = (i: number, value: string) => {
    setDraft((d) => ({
      ...d,
      samplePrompts: d.samplePrompts.map((p, idx) => (idx === i ? value : p)),
    }));
  };
  const addPrompt = () =>
    setDraft((d) => ({ ...d, samplePrompts: [...d.samplePrompts, ""] }));
  const removePrompt = (i: number) =>
    setDraft((d) => ({
      ...d,
      samplePrompts: d.samplePrompts.filter((_, idx) => idx !== i),
    }));

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/60 p-4 sm:p-8">
      <div className="relative w-full max-w-3xl rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6 my-4">
        <button
          onClick={onCancel}
          aria-label="Close"
          className="absolute top-4 right-4 text-[var(--color-fg-dim)] hover:text-[var(--color-fg)]"
        >
          <X size={18} strokeWidth={2.4} />
        </button>
        <h2 className="text-[16px] font-semibold tracking-tight mb-4">
          {isEs ? "Editar propuesta" : "Edit proposal"}
        </h2>
        <div className="space-y-3">
          <Field label="Name">
            <input
              value={draft.name}
              onChange={(e) => set("name", e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Slug">
            <input
              value={draft.slug}
              onChange={(e) => set("slug", e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Tagline">
            <textarea
              value={draft.tagline}
              onChange={(e) => set("tagline", e.target.value)}
              rows={2}
              className={inputCls}
            />
          </Field>
          <Field label="Description (markdown)">
            <textarea
              value={draft.descriptionMd}
              onChange={(e) => set("descriptionMd", e.target.value)}
              rows={5}
              className={`${inputCls} font-mono`}
            />
          </Field>
          <Field label="Setup (markdown)">
            <textarea
              value={draft.setupMd}
              onChange={(e) => set("setupMd", e.target.value)}
              rows={5}
              className={`${inputCls} font-mono`}
            />
          </Field>
          <Field label={isEs ? "Prompts de ejemplo" : "Sample prompts"}>
            <div className="space-y-2">
              {draft.samplePrompts.length === 0 && (
                <p className="text-[11.5px] text-[var(--color-fg-dim)]">
                  {isEs ? "No hay prompts." : "No prompts yet."}
                </p>
              )}
              {draft.samplePrompts.map((p, i) => (
                <PromptRow
                  key={i}
                  value={p}
                  onChange={(v) => updatePrompt(i, v)}
                  onRemove={() => removePrompt(i)}
                />
              ))}
              <button
                onClick={addPrompt}
                type="button"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-accent)]/60 text-[var(--color-fg-muted)] text-[11.5px] font-semibold px-2.5 py-1.5"
              >
                <Plus size={11} strokeWidth={2.4} /> {isEs ? "Agregar prompt" : "Add prompt"}
              </button>
            </div>
          </Field>
        </div>
        <div className="mt-5 flex items-center justify-end gap-2 border-t border-[var(--color-border)] pt-4">
          <button
            onClick={onCancel}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-fg-muted)] text-[12.5px] font-semibold px-3.5 py-2"
          >
            {isEs ? "Cancelar" : "Cancel"}
          </button>
          <button
            onClick={() => onSave(draft)}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] text-white text-[12.5px] font-semibold px-3.5 py-2 disabled:opacity-50"
          >
            {busy ? (
              <Loader2 size={13} className="animate-spin" strokeWidth={2.4} />
            ) : (
              <Check size={13} strokeWidth={2.4} />
            )}
            {isEs ? "Guardar" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PromptRow({
  value,
  onChange,
  onRemove,
}: {
  value: string;
  onChange: (v: string) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-start gap-2">
      <textarea
        value={value}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
        rows={2}
        className={`${inputCls} font-mono text-[12px]`}
      />
      <button
        onClick={onRemove}
        type="button"
        aria-label="Remove"
        className="shrink-0 text-[var(--color-fg-dim)] hover:text-red-400 mt-1.5"
      >
        <Trash2 size={13} strokeWidth={2.4} />
      </button>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block mb-1 text-[11px] font-mono uppercase tracking-[0.14em] text-[var(--color-fg-dim)]">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-2)] px-2.5 py-1.5 text-[13px] outline-none focus:border-[var(--color-accent)]/60 resize-y";

function Notice({
  tone,
  text,
}: {
  tone: "info" | "warn" | "error";
  text: string;
}) {
  const cls =
    tone === "error"
      ? "border-red-500/40 bg-red-500/10 text-red-400"
      : tone === "warn"
        ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
        : "border-[var(--color-border)] bg-[var(--color-panel)] text-[var(--color-fg-muted)]";
  return (
    <div className={`rounded-xl border px-3.5 py-2.5 text-[12.5px] ${cls}`}>
      {text}
    </div>
  );
}
