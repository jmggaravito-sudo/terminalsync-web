import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import type { Dict } from "@/content";

// Mid-page CTA banner — sits between the emotional sections (BeforeAfter)
// and the consideration sections (Personas/Pricing). Captures users who
// already bought-in emotionally and don't need more proof.

export function MidCta({ dict }: { dict: Dict }) {
  const c = dict.midCta;
  return (
    <section className="mx-auto max-w-6xl px-5 md:px-6 py-12 md:py-16">
      <div className="relative overflow-hidden rounded-3xl border border-[var(--color-accent)]/40 bg-gradient-to-br from-[var(--color-accent)]/15 via-[var(--color-panel)] to-[var(--color-claude)]/10 px-6 py-10 md:px-12 md:py-14">
        {/* Ambient glow behind the content */}
        <div className="pointer-events-none absolute inset-0 opacity-50">
          <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-[var(--color-accent)]/20 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-[var(--color-claude)]/15 blur-3xl" />
        </div>

        <div className="relative text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--color-accent)] border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/8 px-3 py-1 rounded-full">
            <Sparkles size={11} strokeWidth={2.6} />
            {c.eyebrow}
          </span>
          <h2
            className="mt-4 font-semibold tracking-tight text-[var(--color-fg-strong)] leading-[1.1]"
            style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)" }}
          >
            {c.title}
          </h2>
          <p className="mt-3 text-[14.5px] text-[var(--color-fg-muted)] leading-relaxed">
            {c.body}
          </p>

          <div className="mt-7 flex items-center justify-center gap-3 flex-wrap">
            <a
              href="/api/download"
              data-cta="midcta-primary"
              className="inline-flex items-center gap-2 rounded-2xl px-5 sm:px-6 py-3 text-[14px] font-semibold text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] transition-all glow-accent hover:-translate-y-px"
            >
              {c.ctaPrimary}
              <ArrowRight size={15} strokeWidth={2.4} />
            </a>
            <Link
              href="#pricing"
              className="inline-flex items-center gap-2 rounded-2xl px-5 sm:px-6 py-3 text-[14px] font-semibold text-[var(--color-fg)] bg-[var(--color-panel)] border border-[var(--color-border)] hover:bg-[var(--color-panel-2)] transition-colors"
            >
              {c.ctaSecondary}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
