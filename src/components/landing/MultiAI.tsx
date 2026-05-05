import { Check, X, Sparkles, Brain, Wrench } from "lucide-react";
import type { Dict } from "@/content";

/**
 * "Stop juggling AI tools" — the new core differentiator section.
 * Sits high in the page (right after Hero, before Demos) because it
 * frames the WHY: today the user runs Claude in one window, Codex in
 * another, and context dies in between. TerminalSync is the layer
 * that connects them.
 *
 * Layout:
 *   - Centered eyebrow + title + subtitle
 *   - Two side-by-side cards: Without TS (red Xs) vs With TS (green
 *     checks). Mirrors the BeforeAfter pattern but tighter — only
 *     about the multi-AI angle.
 *   - Two use-case cards below: Claude (reasoning) and Codex
 *     (execution), to anchor the "use the right tool for each moment"
 *     argument.
 */
export function MultiAI({ dict }: { dict: Dict }) {
  const m = dict.multiAI;

  // Pair each use-case card with an icon. Cap of 2 cards by current
  // dict; if we add more (e.g., when Gemini ships) the icon list
  // extends here without re-typing everything.
  const useCaseIcons = [Brain, Wrench];

  return (
    <section
      id="multi-ai"
      className="mx-auto max-w-6xl px-5 md:px-6 py-20 md:py-24"
    >
      <div className="text-center max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--color-accent)] border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 px-3 py-1 rounded-full">
          <Sparkles size={11} strokeWidth={2.4} />
          {m.eyebrow}
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

      {/* Problem vs Solution columns */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-5">
        <article className="rounded-2xl border border-[var(--color-err)]/30 bg-[var(--color-err)]/5 p-6">
          <h3 className="text-[14px] font-semibold uppercase tracking-[0.1em] text-[var(--color-err)] mb-4 inline-flex items-center gap-2">
            <X size={14} strokeWidth={2.6} />
            {m.problem.title}
          </h3>
          <ul className="space-y-2.5">
            {m.problem.items.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-[14px] text-[var(--color-fg)]"
              >
                <X
                  size={14}
                  className="text-[var(--color-err)] mt-1 shrink-0"
                  strokeWidth={2.6}
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-[var(--color-ok)]/30 bg-[var(--color-ok)]/5 p-6">
          <h3 className="text-[14px] font-semibold uppercase tracking-[0.1em] text-[var(--color-ok)] mb-4 inline-flex items-center gap-2">
            <Check size={14} strokeWidth={2.6} />
            {m.solution.title}
          </h3>
          <ul className="space-y-2.5">
            {m.solution.items.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-[14px] text-[var(--color-fg)]"
              >
                <Check
                  size={14}
                  className="text-[var(--color-ok)] mt-1 shrink-0"
                  strokeWidth={2.6}
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>

      {/* Use-case cards */}
      <div className="mt-12">
        <p className="text-center text-[15px] text-[var(--color-fg-strong)] font-medium max-w-xl mx-auto leading-relaxed">
          {m.useCases.title}
        </p>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
          {m.useCases.cards.map((c, i) => {
            const Icon = useCaseIcons[i] ?? Sparkles;
            return (
              <article
                key={c.tool}
                className="lift rounded-2xl bg-[var(--color-panel)] border border-[var(--color-border)] p-6"
              >
                <div className="h-11 w-11 rounded-xl bg-[var(--color-accent)]/12 text-[var(--color-accent)] flex items-center justify-center">
                  <Icon size={20} strokeWidth={2.2} />
                </div>
                <h4 className="mt-4 text-[16px] font-semibold tracking-tight text-[var(--color-fg-strong)]">
                  <span className="text-[var(--color-accent)]">{c.tool}</span>{" "}
                  <span className="text-[var(--color-fg-muted)] font-normal">
                    {c.verb}
                  </span>
                </h4>
                <p className="mt-2 text-[13.5px] text-[var(--color-fg-muted)] leading-relaxed">
                  {c.body}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
