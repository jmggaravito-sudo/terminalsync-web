"use client";

import { useState } from "react";
import { Brain, Lock, Search, Sparkles, X, Check } from "lucide-react";
import type { Dict } from "@/content";

/**
 * "Memoria persistente" — coming-soon section that pitches the
 * upcoming local-first AI memory layer (semantic recall, MCP-agnostic,
 * encrypted multi-Mac sync). Sits between Hero and Demos so it shows
 * up early in the scroll without bumping the existing flow.
 *
 * Includes an inline email gate that POSTs to /api/early-access
 * (which fires a notification to hola@terminalsync.ai). No DB writes;
 * JM triages from his inbox until volume justifies a real waitlist.
 */
export function MemoryPersistent({ dict }: { dict: Dict }) {
  const m = dict.memory;
  const isEs = dict.locale === "es";
  const pillarIcons = [Lock, Brain, Search];

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const v = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      setError(m.cta.errorEmail);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/early-access", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: v,
          feature: "memory",
          lang: dict.locale,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setSuccess(true);
      setEmail("");
    } catch {
      setError(m.cta.errorGeneric);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      id="memory"
      className="mx-auto max-w-6xl px-5 md:px-6 py-20 md:py-24"
    >
      <div className="text-center max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--color-info)] border border-[var(--color-info)]/30 bg-[var(--color-info)]/8 px-3 py-1 rounded-full">
          <Sparkles size={11} strokeWidth={2.4} />
          {m.eyebrow}
          <span className="text-[9.5px] font-bold uppercase tracking-[0.12em] px-1.5 py-0.5 rounded-full bg-[var(--color-info)]/15 text-[var(--color-info)]">
            {m.badge}
          </span>
        </span>
        <h2
          className="mt-4 font-semibold tracking-tight text-[var(--color-fg-strong)] leading-[1.08]"
          style={{ fontSize: "clamp(1.625rem, 4vw, 2.5rem)" }}
        >
          {m.title}
        </h2>
        <p className="mt-3 text-[15px] text-[var(--color-fg-muted)] leading-relaxed">
          {m.subtitle}
        </p>
      </div>

      {/* 3 pillars */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
        {m.pillars.map((p, i) => {
          const Icon = pillarIcons[i] ?? Brain;
          return (
            <article
              key={p.title}
              className="lift rounded-2xl bg-[var(--color-panel)] border border-[var(--color-border)] p-6"
            >
              <div className="h-11 w-11 rounded-xl bg-[var(--color-info)]/12 text-[var(--color-info)] flex items-center justify-center">
                <Icon size={20} strokeWidth={2.2} />
              </div>
              <h3 className="mt-4 text-[16px] font-semibold tracking-tight text-[var(--color-fg-strong)]">
                {p.title}
              </h3>
              <p className="mt-2 text-[13.5px] text-[var(--color-fg-muted)] leading-relaxed">
                {p.body}
              </p>
            </article>
          );
        })}
      </div>

      {/* Timeline: with vs without */}
      <div className="mt-12">
        <h3 className="text-center text-[14px] font-semibold uppercase tracking-[0.1em] text-[var(--color-fg-muted)]">
          {m.timeline.heading}
        </h3>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          <article className="rounded-2xl border border-[var(--color-err)]/30 bg-[var(--color-err)]/5 p-6">
            <h4 className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[var(--color-err)] mb-4 inline-flex items-center gap-2">
              <X size={13} strokeWidth={2.6} />
              {m.timeline.withoutLabel}
            </h4>
            <ul className="space-y-3">
              {m.timeline.withoutItems.map((it) => (
                <li key={it.when} className="flex items-baseline gap-3 text-[13.5px] text-[var(--color-fg)]">
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[var(--color-err)] shrink-0 w-12">
                    {it.when}
                  </span>
                  <span>{it.line}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-[var(--color-ok)]/30 bg-[var(--color-ok)]/5 p-6">
            <h4 className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[var(--color-ok)] mb-4 inline-flex items-center gap-2">
              <Check size={13} strokeWidth={2.6} />
              {m.timeline.withLabel}
            </h4>
            <ul className="space-y-3">
              {m.timeline.withItems.map((it) => (
                <li key={it.when} className="flex items-baseline gap-3 text-[13.5px] text-[var(--color-fg)]">
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[var(--color-ok)] shrink-0 w-12">
                    {it.when}
                  </span>
                  <span>{it.line}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </div>

      {/* Email gate */}
      <div className="mt-12 max-w-lg mx-auto rounded-2xl border border-[var(--color-info)]/30 bg-[var(--color-info)]/5 p-6 md:p-7">
        <h3 className="text-[16px] font-semibold text-[var(--color-fg-strong)]">
          {m.cta.heading}
        </h3>
        <p className="mt-2 text-[13.5px] text-[var(--color-fg-muted)] leading-relaxed">
          {m.cta.body}
        </p>
        {success ? (
          <p className="mt-4 inline-flex items-center gap-2 text-[14px] font-semibold text-[var(--color-ok)]">
            {m.cta.success}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={m.cta.placeholder}
              aria-label={isEs ? "Email" : "Email"}
              className="flex-1 h-10 px-4 rounded-full bg-[var(--color-panel)] border border-[var(--color-border)] text-[13.5px] text-[var(--color-fg)] placeholder-[var(--color-fg-dim)] outline-none focus:border-[var(--color-info)] focus:ring-4 focus:ring-[var(--color-info)]/15 transition-all"
            />
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-full bg-[var(--color-info)] hover:opacity-90 text-white text-[13px] font-semibold transition-all disabled:opacity-60"
            >
              {submitting ? m.cta.submitting : m.cta.button}
            </button>
          </form>
        )}
        {error && (
          <p className="mt-3 text-[12.5px] text-[var(--color-err)]">{error}</p>
        )}
      </div>
    </section>
  );
}
