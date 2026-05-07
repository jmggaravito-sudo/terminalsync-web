import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";
import type { Locale } from "@/content";
import type { DevCopy } from "./copy";

/**
 * Hero variant for /[lang]/for-developers.
 *
 * Code-forward aesthetic: terminal-style faux prompt under the
 * subtitle, mono accents, tighter copy. Skips the consumer-y video
 * lightbox and trust badges since this audience cares more about
 * "is the CLI real" than "is this trustworthy."
 */
export function DevHero({ copy, lang }: { copy: DevCopy; lang: Locale }) {
  return (
    <section className="relative overflow-hidden border-b border-[var(--color-border)]">
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, var(--color-accent-glow), transparent 50%), radial-gradient(ellipse at 0% 100%, var(--color-claude-glow), transparent 60%)",
        }}
      />
      <div className="relative mx-auto max-w-4xl px-5 md:px-6 pt-14 sm:pt-20 pb-16 text-center">
        <p className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--color-accent)] border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 px-3 py-1 rounded-full">
          {copy.hero.eyebrow}
        </p>

        <h1
          className="mt-6 font-semibold tracking-tight leading-[1.06] text-[var(--color-fg-strong)] max-w-3xl mx-auto"
          style={{ fontSize: "clamp(2rem, 6vw, 3.75rem)" }}
        >
          {copy.hero.title}
          <span className="bg-gradient-to-br from-[var(--color-claude)] to-[var(--color-claude-soft)] bg-clip-text text-transparent">
            {copy.hero.titleHighlight}
          </span>
        </h1>

        <p
          className="mt-5 text-[var(--color-fg-muted)] max-w-2xl mx-auto leading-relaxed"
          style={{ fontSize: "clamp(0.9375rem, 1.6vw, 1.125rem)" }}
        >
          {copy.hero.subtitle}
        </p>

        {/* Faux terminal prompt — communicates "this is a CLI tool"
            without forcing the reader to scroll to the code section. */}
        <div className="mt-8 mx-auto max-w-xl rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)]/80 backdrop-blur p-4 text-left shadow-lg">
          <div className="flex items-center gap-1.5 mb-3">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </div>
          <pre className="font-mono text-[13px] leading-relaxed text-[var(--color-fg)] overflow-x-auto">
            <span className="text-[var(--color-fg-dim)]">$ </span>
            <span className="text-[var(--color-accent)]">brew install</span> terminalsync
            {"\n"}
            <span className="text-[var(--color-fg-dim)]">$ </span>
            tsync init <span className="text-[var(--color-fg-muted)]">~/projects/api</span>
            {"\n"}
            <span className="text-[var(--color-ok)]">✓</span> synced across 5 machines · git-aware
            {"\n"}
            <span className="text-[var(--color-ok)]">✓</span> 47 sessions indexed · .env vault loaded
            {"\n"}
            <span className="text-[var(--color-fg-dim)]">$ </span>
            claude{" "}
            <span className="text-[var(--color-fg-muted)]">
              # Claude already remembers everything
            </span>
          </pre>
        </div>

        <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
          <a
            href="/api/download"
            data-cta="dev-hero-primary"
            className="inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-[14px] font-semibold text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] transition-all glow-accent hover:-translate-y-px"
          >
            <Download size={15} strokeWidth={2.4} />
            {copy.hero.ctaPrimary}
          </a>
          <Link
            href={`/${lang}/marketplace`}
            className="inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-[14px] font-semibold text-[var(--color-fg)] bg-[var(--color-panel)] border border-[var(--color-border)] lift"
          >
            {copy.hero.ctaSecondary}
            <ArrowRight size={14} strokeWidth={2.4} />
          </Link>
        </div>

        <p className="mt-5 text-[12px] font-mono text-[var(--color-fg-muted)]">
          {copy.hero.trustLine}
        </p>
      </div>
    </section>
  );
}
