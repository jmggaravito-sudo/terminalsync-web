import Image from "next/image";
import type { Dict } from "@/content";

interface Props {
  dict: Dict;
}

export function HeroB({ dict }: Props) {
  const c = dict.landingB?.hero;
  if (!c) return null;

  return (
    <section className="relative mx-auto max-w-6xl px-5 md:px-6 pt-16 pb-12 md:pt-24 md:pb-16 grid md:grid-cols-2 gap-10 md:gap-16 items-center">
      <div>
        <span className="inline-flex items-center text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--color-fg-muted)] border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-1 rounded-full">
          {c.eyebrow}
        </span>
        <h1
          className="mt-5 font-semibold tracking-tight text-[var(--color-fg-strong)] leading-[1.06] whitespace-pre-line"
          style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)" }}
        >
          {c.titlePre ? (
            <>
              {c.titlePre} {" "}
              <span className="text-[#7c3aed]">{c.titleHighlight}</span>
              {c.titlePost}
            </>
          ) : c.title}
        </h1>
        <p className="mt-5 text-[16px] text-[var(--color-fg-muted)] leading-relaxed max-w-lg">
          {c.subtitle}
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href="/api/download"
            data-cta="hero-b-primary"
            className="inline-flex items-center h-11 px-6 rounded-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-[14px] font-semibold transition-all shadow-[0_8px_24px_-8px_rgba(124,58,237,0.45)] hover:shadow-[0_12px_32px_-8px_rgba(124,58,237,0.5)]"
          >
            {c.ctaPrimary}
          </a>
          <a
            href={c.ctaSecondaryHref}
            className="inline-flex items-center h-11 px-6 rounded-full border border-[var(--color-border)] text-[var(--color-fg-strong)] text-[14px] font-semibold hover:border-[#7c3aed] hover:text-[#7c3aed] transition-colors"
          >
            {c.ctaSecondary}
          </a>
        </div>
        <p className="mt-4 text-[12px] text-[var(--color-fg-dim)]">{c.trustLine}</p>
      </div>

      <div className="relative rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-2 shadow-[0_20px_60px_-12px_rgba(0,0,0,0.22)]">
        <div className="flex h-7 items-center gap-1.5 px-2" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="overflow-hidden rounded-xl border border-[var(--color-border)]">
          <Image
            src="/landing-b/app-home-cover-v3.png"
            alt="TerminalSync workspace"
            width={1200}
            height={800}
            className="w-full h-auto"
            priority
          />
        </div>
      </div>
    </section>
  );
}
