import { GitBranch, Lock, Brain } from "lucide-react";
import type { DevCopy } from "./copy";

const ICONS = [GitBranch, Lock, Brain];

/**
 * "Three things no other tool ships out of the box" — the dev-side
 * counterpart to MultiAI on the consumer landing. Each card carries
 * a concrete capability + the dev-flavored win, so the audience
 * gets it on a single scroll.
 */
export function DevFeatures({ copy }: { copy: DevCopy }) {
  return (
    <section
      id="features"
      className="mx-auto max-w-6xl px-5 md:px-6 py-20 md:py-24"
    >
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--color-accent)] font-semibold">
          {copy.features.eyebrow}
        </p>
        <h2
          className="mt-3 font-semibold tracking-tight text-[var(--color-fg-strong)] leading-[1.1]"
          style={{ fontSize: "clamp(1.625rem, 4vw, 2.5rem)" }}
        >
          {copy.features.title}
        </h2>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
        {copy.features.items.map((item, i) => {
          const Icon = ICONS[i] ?? Brain;
          return (
            <article
              key={item.title}
              className="lift rounded-2xl bg-[var(--color-panel)] border border-[var(--color-border)] p-7"
            >
              <div className="h-12 w-12 rounded-xl bg-[var(--color-accent)]/12 text-[var(--color-accent)] flex items-center justify-center">
                <Icon size={22} strokeWidth={2.2} />
              </div>
              <h3 className="mt-5 text-[17px] font-semibold tracking-tight text-[var(--color-fg-strong)]">
                {item.title}
              </h3>
              <p className="mt-2.5 text-[14px] text-[var(--color-fg-muted)] leading-relaxed">
                {item.body}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
