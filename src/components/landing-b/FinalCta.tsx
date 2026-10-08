import type { Dict } from "@/content";

interface Props {
  dict: Dict;
}

export function FinalCta({ dict }: Props) {
  const c = dict.landingB?.finalCta;
  if (!c) return null;

  return (
    <section className="mx-auto max-w-6xl px-5 md:px-6 py-20 md:py-28 text-center">
      <span className="inline-flex items-center text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--color-fg-muted)] border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-1 rounded-full">
        {c.eyebrow}
      </span>
      <h2
        className="mt-5 font-semibold tracking-tight text-[var(--color-fg-strong)] leading-[1.06] whitespace-pre-line"
        style={{ fontSize: "clamp(2rem, 5vw, 3rem)" }}
      >
        {c.title}
      </h2>
      <p className="mt-4 text-[16px] text-[var(--color-fg-muted)] leading-relaxed max-w-xl mx-auto">
        {c.subtitle}
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <a
          href="/api/download"
          data-cta="final-cta-download"
          className="inline-flex items-center h-11 px-6 rounded-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] text-white text-[14px] font-semibold transition-all shadow-[0_8px_24px_-8px_var(--color-accent-glow)]"
        >
          {c.ctaDownload}
        </a>
        <a
          href="mailto:hola@terminalsync.ai"
          className="inline-flex items-center h-11 px-6 rounded-full border border-[var(--color-border)] text-[14px] text-[var(--color-fg)] hover:border-[var(--color-fg-dim)] transition-colors"
        >
          {c.ctaTalk}
        </a>
      </div>
    </section>
  );
}
