"use client";

import { useState } from "react";
import { Download, PlayCircle } from "lucide-react";
import type { Dict } from "@/content";
import { AppMockup } from "./AppMockup";
import { VideoLightbox } from "@/components/VideoLightbox";
import { ClaudeMark, OpenAIMark, GeminiMark } from "@/components/brand/AILogos";

// When the real demo video is ready, set this to a YouTube nocookie / Vimeo
// / Mux embed URL. Leave empty (null) to show the polished placeholder.
const DEMO_VIDEO_URL: string | null = null;

export function Hero({ dict }: { dict: Dict }) {
  const [videoOpen, setVideoOpen] = useState(false);

  return (
    <section id="hero" className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, var(--color-accent-glow), transparent 55%), radial-gradient(ellipse at 100% 100%, var(--color-claude-glow), transparent 60%)",
        }}
      />
      <div className="relative mx-auto max-w-5xl px-5 md:px-6 pt-12 sm:pt-16 md:pt-20 pb-10 text-center">
        {/* AI agent logo row — replaces the text-only eyebrow. Shows
            Claude / Codex / Gemini at a glance: the three agents the
            product ships with. Official brand marks at 44px for clear
            recognition; "+" separators keep it visually a "set". */}
        <div className="inline-flex items-center gap-4 text-[var(--color-fg-muted)]">
          <ClaudeMark size={44} aria-label="Anthropic Claude" />
          <span className="text-[18px] font-mono opacity-40">+</span>
          <OpenAIMark size={44} className="text-[var(--color-fg-strong)]" aria-label="OpenAI Codex" />
          <span className="text-[18px] font-mono opacity-40">+</span>
          <GeminiMark size={44} aria-label="Google Gemini" />
        </div>
        <p className="mt-3 text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--color-fg-dim)]">
          {dict.hero.eyebrow}
        </p>

        {/* Fluid hero headline — scales cleanly from ~32px on phones to 64px
            on wide screens without breakpoint jumps. `break-words` stops long
            words from overflowing narrow viewports. */}
        <h1
          className="mt-5 font-semibold tracking-tight leading-[1.06] text-[var(--color-fg-strong)] max-w-4xl mx-auto break-words"
          style={{ fontSize: "clamp(2rem, 6.2vw, 4rem)" }}
        >
          {dict.hero.titlePre}
          <span className="bg-gradient-to-br from-[var(--color-claude)] to-[var(--color-claude-soft)] bg-clip-text text-transparent">
            {dict.hero.titleHighlight}
          </span>
          {dict.hero.titlePost}
        </h1>

        <p
          className="mt-5 text-[var(--color-fg-muted)] max-w-2xl mx-auto leading-relaxed"
          style={{ fontSize: "clamp(0.9375rem, 1.6vw, 1.125rem)" }}
        >
          {dict.hero.subtitle}
        </p>

        <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
          <a
            href="/api/download"
            data-cta="hero-primary"
            className="inline-flex items-center gap-2 rounded-2xl px-5 sm:px-6 py-3 text-[14px] font-semibold text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] transition-all glow-accent hover:-translate-y-px"
          >
            <Download size={15} strokeWidth={2.4} />
            {dict.hero.ctaPrimary}
          </a>
          <button
            type="button"
            onClick={() => setVideoOpen(true)}
            className="inline-flex items-center gap-2 rounded-2xl px-5 sm:px-6 py-3 text-[14px] font-semibold text-[var(--color-fg)] bg-[var(--color-panel)] border border-[var(--color-border)] lift"
          >
            <PlayCircle size={15} strokeWidth={2} />
            {dict.hero.ctaSecondary}
          </button>
        </div>

        {/* Platform availability — small pill under the CTAs so visitors see
            at a glance which OS they can install on. Apple logomark for
            macOS. Windows is in waitlist (separate section); Linux is not
            on the roadmap. */}
        <div className="mt-3 inline-flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.12em] font-medium text-[var(--color-fg-muted)]">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[var(--color-border)] bg-[var(--color-panel)]/60">
            <svg
              width="11"
              height="13"
              viewBox="0 0 14 17"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M11.6 9.2c0-2.3 1.9-3.4 2-3.4-1.1-1.6-2.7-1.8-3.3-1.8-1.4-.1-2.8.8-3.5.8s-1.8-.8-3-.8c-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.1 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.2 0 2-1.1 2.8-2.2.9-1.3 1.2-2.5 1.3-2.6-.1 0-2.5-.9-2.5-3.9zM9.4 2.6c.6-.7 1-1.7.9-2.6-.9 0-1.9.6-2.5 1.3-.6.6-1.1 1.6-.9 2.5 1 .1 2-.5 2.5-1.2z" />
            </svg>
            macOS
          </span>
        </div>

        <p className="mt-4 text-[13px] font-semibold text-[var(--color-fg)]">
          {dict.hero.trustLine}
        </p>

        {/* "Next up" teaser — surfaces the upcoming Codex Desktop sync to
            OpenAI Plus/Pro/Team users browsing the page. Sits below the
            trust line so it doesn't compete with the primary CTA. */}
        <div className="mt-7 inline-flex max-w-xl items-start gap-2.5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)]/60 px-4 py-2.5 text-left">
          <span className="mt-0.5 inline-flex shrink-0 items-center rounded-full border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/8 px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--color-accent)]">
            {dict.hero.nextUp.eyebrow}
          </span>
          <span className="text-[12.5px] text-[var(--color-fg-muted)] leading-relaxed">
            {dict.hero.nextUp.body}
          </span>
        </div>
      </div>

      <div className="relative mx-auto max-w-6xl px-3 sm:px-5 md:px-6 pb-16 md:pb-20">
        <AppMockup dict={dict} />
      </div>

      <VideoLightbox
        open={videoOpen}
        onClose={() => setVideoOpen(false)}
        dict={dict}
        videoUrl={DEMO_VIDEO_URL ?? undefined}
      />
    </section>
  );
}
