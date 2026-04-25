"use client";

import { useState } from "react";
import { Download, PlayCircle } from "lucide-react";
import type { Dict } from "@/content";
import { AppMockup } from "./AppMockup";
import { VideoLightbox } from "@/components/VideoLightbox";

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
        <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--color-claude)] border border-[var(--color-claude)]/30 bg-[var(--color-claude)]/5 px-3 py-1 rounded-full">
          {dict.hero.eyebrow}
        </span>

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
            href="#"
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

        <p className="mt-4 text-[12px] text-[var(--color-fg-dim)]">
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
