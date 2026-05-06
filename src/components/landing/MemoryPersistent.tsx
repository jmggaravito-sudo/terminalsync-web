import { Brain, Lock, Search, Sparkles, X, Check, Download } from "lucide-react";
import type { Dict } from "@/content";

/**
 * "Memoria persistente" — live feature section pitching the local
 * memory engine bundled in the desktop app. Sits between MultiAI and
 * Demos so the value lands early in the scroll.
 *
 * Layout:
 *   - Eyebrow with "Incluida" badge (live, accent green)
 *   - Title + subtitle
 *   - 3 pillars grid (local / multi-AI / semantic)
 *   - With-vs-without timeline (Day 1 → Day 30)
 *   - CTA → /api/download (same flow the rest of the landing uses)
 */
export function MemoryPersistent({ dict }: { dict: Dict }) {
  const m = dict.memory;
  const pillarIcons = [Lock, Brain, Search];

  return (
    <section
      id="memory"
      className="mx-auto max-w-6xl px-5 md:px-6 py-20 md:py-24"
    >
      <div className="text-center max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--color-accent)] border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 px-3 py-1 rounded-full">
          <Sparkles size={11} strokeWidth={2.4} />
          {m.eyebrow}
          <span className="text-[9.5px] font-bold uppercase tracking-[0.12em] px-1.5 py-0.5 rounded-full bg-[var(--color-ok)]/15 text-[var(--color-ok)]">
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

      {/* Recalls + closing block — concrete examples that make the
          abstract idea of "memory" tangible. Renders only when the
          dict carries the new fields, so older locales / partial
          updates fall back gracefully to the original layout. */}
      {m.recalls && m.recalls.length > 0 && (
        <div className="mt-8 max-w-xl mx-auto text-center">
          {m.recallsLead && (
            <p className="text-[14px] text-[var(--color-fg-muted)] font-medium">
              {m.recallsLead}
            </p>
          )}
          <ul className="mt-3 space-y-2 text-[14.5px] text-[var(--color-fg)] leading-relaxed">
            {m.recalls.map((line) => (
              <li key={line} className="flex items-start justify-center gap-2">
                <span className="mt-2 inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-accent)] shrink-0" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
          {m.closing && (
            <div className="mt-6 space-y-2">
              <p className="text-[15px] font-semibold text-[var(--color-fg-strong)] leading-relaxed">
                {m.closing.outcome}
              </p>
              <p className="text-[13.5px] text-[var(--color-fg-muted)]">
                {m.closing.reassurance}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 3 pillars */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
        {m.pillars.map((p, i) => {
          const Icon = pillarIcons[i] ?? Brain;
          return (
            <article
              key={p.title}
              className="lift rounded-2xl bg-[var(--color-panel)] border border-[var(--color-border)] p-6"
            >
              <div className="h-11 w-11 rounded-xl bg-[var(--color-accent)]/12 text-[var(--color-accent)] flex items-center justify-center">
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
                <li
                  key={it.when}
                  className="flex items-baseline gap-3 text-[13.5px] text-[var(--color-fg)]"
                >
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
                <li
                  key={it.when}
                  className="flex items-baseline gap-3 text-[13.5px] text-[var(--color-fg)]"
                >
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

      {/* Live CTA */}
      <div className="mt-12 max-w-2xl mx-auto rounded-2xl border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-5 md:gap-8">
        <div className="flex-1">
          <h3 className="text-[17px] font-semibold text-[var(--color-fg-strong)]">
            {m.cta.heading}
          </h3>
          <p className="mt-2 text-[13.5px] text-[var(--color-fg-muted)] leading-relaxed">
            {m.cta.body}
          </p>
        </div>
        <a
          href="/api/download"
          data-cta="memory-section"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] text-white text-[13px] font-semibold px-5 py-2.5 shadow-[0_8px_24px_-10px_var(--color-accent-glow)] transition-all whitespace-nowrap"
        >
          <Download size={14} strokeWidth={2.4} />
          {m.cta.button}
        </a>
      </div>
    </section>
  );
}
