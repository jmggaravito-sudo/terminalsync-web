import { Frown, Smile, X, Check } from "lucide-react";
import type { Dict } from "@/content";

// Side-by-side emotional contrast — the "you in the now" vs "you with this".
// Kept intentionally simple: two columns of items, before in red/dim, after
// in green/highlighted. No clever tricks — the copy carries it.

export function BeforeAfter({ dict }: { dict: Dict }) {
  const ba = dict.beforeAfter;
  return (
    <section
      id="before-after"
      className="mx-auto max-w-6xl px-5 md:px-6 py-20 md:py-24"
    >
      <div className="text-center max-w-2xl mx-auto">
        <span className="inline-flex items-center text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--color-fg-muted)] border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-1 rounded-full">
          {ba.eyebrow}
        </span>
        <h2
          className="mt-4 font-semibold tracking-tight text-[var(--color-fg-strong)] leading-[1.08]"
          style={{ fontSize: "clamp(1.625rem, 4vw, 2.5rem)" }}
        >
          {ba.title}
        </h2>
        <p className="mt-3 text-[15px] text-[var(--color-fg-muted)] leading-relaxed">
          {ba.subtitle}
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Before — muted, faded */}
        <article className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)]/60 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-[var(--color-err)]/12 text-[var(--color-err)]">
              <Frown size={18} strokeWidth={2.2} />
            </div>
            <h3 className="text-[16px] font-semibold text-[var(--color-fg-muted)]">
              {ba.before.heading}
            </h3>
          </div>
          <ul className="space-y-2.5">
            {ba.before.items.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2.5 text-[13.5px] text-[var(--color-fg-muted)] leading-relaxed"
              >
                <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-[var(--color-err)]/15 text-[var(--color-err)] mt-0.5 shrink-0">
                  <X size={10} strokeWidth={2.8} />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>

        {/* After — vibrant, accent */}
        <article className="rounded-2xl border-2 border-[var(--color-accent)]/40 bg-gradient-to-br from-[var(--color-panel)] to-[var(--color-accent)]/5 p-6 shadow-floating">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-[var(--color-ok)]/15 text-[var(--color-ok)]">
              <Smile size={18} strokeWidth={2.2} />
            </div>
            <h3 className="text-[16px] font-semibold text-[var(--color-fg-strong)]">
              {ba.after.heading}
            </h3>
          </div>
          <ul className="space-y-2.5">
            {ba.after.items.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2.5 text-[13.5px] text-[var(--color-fg)] leading-relaxed"
              >
                <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-[var(--color-ok)]/15 text-[var(--color-ok)] mt-0.5 shrink-0">
                  <Check size={10} strokeWidth={2.8} />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
