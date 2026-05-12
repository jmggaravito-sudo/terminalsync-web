import type { LucideIcon } from "lucide-react";
import { Check, X, Sparkles, Brain, Wrench, FileText } from "lucide-react";
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

  // One icon per use-case card. Order matches the dict cards:
  //   0 Claude → Brain (reasoning)
  //   1 Codex → Wrench (execution)
  //   2 Gemini → FileText (long context, multimodal docs)
  const useCaseIcons = [Brain, Wrench, FileText];

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

      {/* Git-native portability promise. This is the simplest explanation
          of our architecture for repo-backed work: TS does not swallow the
          user's code into a proprietary blob. Git remains the source of
          truth for code; TerminalSync carries the AI terminal identity and
          workspace metadata with the repo. */}
      <div className="mt-6 rounded-2xl border border-[var(--color-accent)]/25 bg-[var(--color-accent)]/6 px-5 py-4 md:px-6 md:py-5 text-center">
        <p className="text-[16px] md:text-[18px] font-semibold tracking-tight text-[var(--color-fg-strong)]">
          {dict.locale === "es"
            ? "Tu código sigue en Git. Tus terminales IA viajan con el repo."
            : "Your code stays in Git. Your AI terminals travel with the repo."}
        </p>
        <p className="mt-1.5 text-[13px] md:text-[13.5px] text-[var(--color-fg-muted)] leading-relaxed">
          {dict.locale === "es"
            ? "TerminalSync guarda la identidad del workspace en .terminalsync/; tus archivos reales siguen moviéndose por commits, branches, push y pull."
            : "TerminalSync stores workspace identity in .terminalsync/; your real files still move through commits, branches, push and pull."}
        </p>
      </div>

      {/* Use-case cards */}
      <div className="mt-12">
        <p className="text-center text-[15px] text-[var(--color-fg-strong)] font-medium max-w-xl mx-auto leading-relaxed">
          {m.useCases.title}
        </p>
        {/* Triangular layout when there are 3 cards: first two side by
            side, third centered below. JM's request — visually echoes
            "Claude + Codex working together, Gemini supporting from
            below". Falls back to a normal grid if cards.length !== 3. */}
        {m.useCases.cards.length === 3 ? (
          <div className="mt-6 max-w-3xl mx-auto space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {m.useCases.cards.slice(0, 2).map((c, i) => (
                <UseCaseCard key={c.tool} card={c} icon={useCaseIcons[i] ?? Sparkles} />
              ))}
            </div>
            <div className="md:max-w-[calc(50%-10px)] mx-auto">
              {m.useCases.cards.slice(2, 3).map((c) => (
                <UseCaseCard
                  key={c.tool}
                  card={c}
                  icon={useCaseIcons[2] ?? Sparkles}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {m.useCases.cards.map((c, i) => (
              <UseCaseCard key={c.tool} card={c} icon={useCaseIcons[i] ?? Sparkles} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

interface UseCaseCardProps {
  card: { tool: string; verb: string; body: string };
  icon: LucideIcon;
}

function UseCaseCard({ card: c, icon: Icon }: UseCaseCardProps) {
  return (
    <article className="lift rounded-2xl bg-[var(--color-panel)] border border-[var(--color-border)] p-6">
      <div className="h-11 w-11 rounded-xl bg-[var(--color-accent)]/12 text-[var(--color-accent)] flex items-center justify-center">
        <Icon size={20} strokeWidth={2.2} />
      </div>
      <h4 className="mt-4 text-[16px] font-semibold tracking-tight text-[var(--color-fg-strong)]">
        <span className="text-[var(--color-accent)]">{c.tool}</span>{" "}
        <span className="text-[var(--color-fg-muted)] font-normal">{c.verb}</span>
      </h4>
      <p className="mt-2 text-[13.5px] text-[var(--color-fg-muted)] leading-relaxed">
        {c.body}
      </p>
    </article>
  );
}
