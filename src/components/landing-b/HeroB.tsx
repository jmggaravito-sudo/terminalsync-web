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
          {c.title}
        </h1>
        <p className="mt-5 text-[16px] text-[var(--color-fg-muted)] leading-relaxed max-w-lg">
          {c.subtitle}
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href="/api/download"
            data-cta="hero-b-primary"
            className="inline-flex items-center h-11 px-6 rounded-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] text-white text-[14px] font-semibold transition-all shadow-[0_8px_24px_-8px_var(--color-accent-glow)] hover:shadow-[0_12px_32px_-8px_var(--color-accent-glow)]"
          >
            {c.ctaPrimary}
          </a>
        </div>
        <p className="mt-4 text-[12px] text-[var(--color-fg-dim)]">{c.trustLine}</p>
      </div>

      <div className="relative rounded-2xl overflow-hidden border border-[var(--color-border)] shadow-[0_20px_60px_-12px_rgba(0,0,0,0.18)]">
        <Image
          src="/landing-b/app-home-cover-v3.png"
          alt="TerminalSync workspace"
          width={1200}
          height={800}
          className="w-full h-auto"
          priority
        />
      </div>
    </section>
  );
}
