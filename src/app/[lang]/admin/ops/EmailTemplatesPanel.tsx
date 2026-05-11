"use client";

import { useEffect, useState } from "react";
import { Mail, Save, ChevronDown, ChevronRight, FileText } from "lucide-react";

interface EmailTemplate {
  id: string;
  workflow_id: string;
  workflow_name: string;
  slug: string;
  label: string;
  audience: string;
  locale: string;
  subject: string;
  body: string;
  updated_at: string;
}

const AUDIENCE_LABEL: Record<string, string> = {
  creator: "Creator",
  marketplace: "Marketplace",
  education: "Educación",
  consumer: "Consumer",
  developer: "Developer",
  support: "Support",
  lifecycle: "Lifecycle",
  other: "Other",
};

const AUDIENCE_TONE: Record<string, string> = {
  creator: "border-violet-500/30 bg-violet-500/8 text-violet-300",
  marketplace: "border-sky-500/30 bg-sky-500/8 text-sky-300",
  education: "border-emerald-500/30 bg-emerald-500/8 text-emerald-300",
  consumer: "border-amber-500/30 bg-amber-500/8 text-amber-300",
  developer: "border-rose-500/30 bg-rose-500/8 text-rose-300",
  support: "border-orange-500/30 bg-orange-500/8 text-orange-300",
  lifecycle: "border-teal-500/30 bg-teal-500/8 text-teal-300",
  other: "border-[var(--color-border)] bg-[var(--color-panel-2)]/40 text-[var(--color-fg-muted)]",
};

/**
 * Inline panel under each WorkflowCard that lists every registered
 * email template tied to that workflow_id. Click a template → expand
 * subject + body in editable form. Save writes to Supabase via
 * /api/admin/email-templates PATCH and updates the row in place.
 */
export function EmailTemplatesPanel({
  workflowId,
  isEs,
}: {
  workflowId: string;
  isEs: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<EmailTemplate[] | null>(null);
  const [loading, setLoading] = useState(false);

  // Lazy-load: only fetch when expanded the first time.
  useEffect(() => {
    if (!open || items !== null) return;
    setLoading(true);
    fetch(`/api/admin/email-templates?workflow_id=${workflowId}`)
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [open, items, workflowId]);

  // Mount-time prefetch of just the count, so the toggle can show a
  // badge "(2)" without waiting for the user to click.
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    fetch(`/api/admin/email-templates?workflow_id=${workflowId}`)
      .then((r) => r.json())
      .then((d) => setCount((d.items ?? []).length))
      .catch(() => setCount(0));
  }, [workflowId]);

  if (count === 0) return null; // hide entirely when nothing is registered

  return (
    <div className="mt-3 border-t border-[var(--color-border)] pt-3">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 text-[12px] font-mono text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] transition-colors"
      >
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        <Mail size={12} />
        <span>
          {isEs ? "Emails" : "Emails"}{" "}
          {count !== null && (
            <span className="text-[var(--color-fg-dim)]">({count})</span>
          )}
        </span>
      </button>

      {open && (
        <div className="mt-3 space-y-2">
          {loading && (
            <p className="text-[12px] text-[var(--color-fg-dim)]">
              {isEs ? "Cargando…" : "Loading…"}
            </p>
          )}
          {items?.map((tpl) => (
            <TemplateRow key={tpl.id} tpl={tpl} isEs={isEs} onSaved={(updated) => {
              setItems((cur) =>
                cur ? cur.map((c) => (c.id === updated.id ? updated : c)) : cur,
              );
            }} />
          ))}
        </div>
      )}
    </div>
  );
}

function TemplateRow({
  tpl,
  isEs,
  onSaved,
}: {
  tpl: EmailTemplate;
  isEs: boolean;
  onSaved: (t: EmailTemplate) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [subject, setSubject] = useState(tpl.subject);
  const [body, setBody] = useState(tpl.body);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/email-templates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: tpl.id, subject, body }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Save failed");
      const updated: EmailTemplate = { ...tpl, subject, body, updated_at: new Date().toISOString() };
      onSaved(updated);
      setSavedAt(new Date().toLocaleTimeString());
      setEditing(false);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <article className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel-2)]/40 p-3">
      <header className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.08em] ${AUDIENCE_TONE[tpl.audience] ?? AUDIENCE_TONE.other}`}
          >
            <FileText size={10} />
            {AUDIENCE_LABEL[tpl.audience] ?? tpl.audience}
          </span>
          <span className="rounded-full bg-[var(--color-panel)] border border-[var(--color-border)] px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.08em] text-[var(--color-fg-muted)]">
            {tpl.locale}
          </span>
          <span className="text-[12px] font-medium truncate">{tpl.label}</span>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-[11px] font-mono text-[var(--color-accent)] hover:underline"
          >
            {isEs ? "editar" : "edit"}
          </button>
        )}
      </header>

      {editing ? (
        <div className="mt-3 space-y-2">
          <div>
            <label className="text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--color-fg-dim)]">
              {isEs ? "Asunto" : "Subject"}
            </label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[13px] font-mono"
            />
          </div>
          <div>
            <label className="text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--color-fg-dim)]">
              {isEs ? "Cuerpo" : "Body"}
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={Math.min(20, Math.max(8, body.split("\n").length + 2))}
              className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[12.5px] font-mono leading-relaxed resize-y"
            />
          </div>
          <div className="flex gap-2 items-center">
            <button
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] text-white px-3 py-1.5 text-[12px] font-semibold disabled:opacity-50"
            >
              <Save size={12} />
              {saving ? (isEs ? "Guardando…" : "Saving…") : isEs ? "Guardar" : "Save"}
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setSubject(tpl.subject);
                setBody(tpl.body);
              }}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-1.5 text-[12px] font-medium text-[var(--color-fg-muted)] hover:bg-[var(--color-panel-2)]"
            >
              {isEs ? "Cancelar" : "Cancel"}
            </button>
            {savedAt && (
              <span className="text-[11px] font-mono text-emerald-400">
                ✓ {isEs ? "Guardado" : "Saved"} {savedAt}
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-2.5 space-y-1.5">
          <p className="text-[12.5px] font-semibold text-[var(--color-fg-strong)]">
            {tpl.subject}
          </p>
          <pre className="text-[11.5px] font-mono whitespace-pre-wrap text-[var(--color-fg-muted)] leading-relaxed max-h-[180px] overflow-y-auto bg-[var(--color-bg)]/50 rounded-md p-2 border border-[var(--color-border)]">
            {tpl.body}
          </pre>
        </div>
      )}
    </article>
  );
}
