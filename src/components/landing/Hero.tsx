"use client";

import { useState, useEffect } from "react";
import { ArrowRight, Chrome, Download, PlayCircle, Film } from "lucide-react";
import type { Dict } from "@/content";
import { AppMockup } from "./AppMockup";
import { VideoLightbox } from "@/components/VideoLightbox";
import { ClaudeMark, OpenAIMark, GeminiMark } from "@/components/brand/AILogos";
import { WindowsEarlyAccess } from "./WindowsEarlyAccess";

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
        {/* Tagline under the logo row — natural sentence-case to feel
            human, not a spec sheet. Slightly larger than a mono eyebrow
            because it's now a meaningful phrase, not a label. */}
        <p className="mt-4 text-[13px] sm:text-[14px] font-medium tracking-tight text-[var(--color-fg-muted)]">
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

        {/* Subhead rotativo (§01). Cicla los 5 mensajes del glosario cada
            4s con dots. Si la traducción no trae `rotating`, cae al
            subtítulo estático (EN no se rompe). */}
        {dict.hero.rotating && dict.hero.rotating.length > 0 ? (
          <RotatingSubhead messages={dict.hero.rotating} />
        ) : (
          <p
            className="mt-5 text-[var(--color-fg-muted)] max-w-2xl mx-auto leading-relaxed"
            style={{ fontSize: "clamp(0.9375rem, 1.6vw, 1.125rem)" }}
          >
            {dict.hero.subtitle}
          </p>
        )}

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

        {/* §01 — slot reservado del FILM V3 (autoplay muted cuando exista).
            Hasta que el master esté listo, mostramos una caja reservada
            (matchea el prototipo). Clic abre el lightbox como los CTAs. */}
        {DEMO_VIDEO_URL ? null : (
          <button
            type="button"
            onClick={() => setVideoOpen(true)}
            className="mt-8 w-full max-w-2xl mx-auto flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-panel)]/40 px-6 py-12 text-[var(--color-fg-muted)] transition-colors hover:border-[var(--color-accent)]/40"
            aria-label={dict.locale === "es" ? "Ver el film" : "Watch the film"}
          >
            <Film size={22} strokeWidth={1.8} className="opacity-70" />
            <span className="text-[13.5px] font-medium">
              {dict.locale === "es"
                ? "El film llega pronto — mira la demo mientras tanto"
                : "The film is coming soon — watch the demo meanwhile"}
            </span>
          </button>
        )}

        {/* Platform availability — small pills under the CTAs so visitors
            see at a glance which OS they can install on today. Apple
            logomark for macOS, Tux glyph for Linux. Windows is the only
            platform pending; Windows visitors see a waitlist banner
            below instead. */}
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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[var(--color-border)] bg-[var(--color-panel)]/60">
            <svg
              width="11"
              height="13"
              viewBox="0 0 14 17"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M7 0C5.7 0 4.6 1.4 4.6 3c0 .9.3 1.6.7 2.2-.6.4-1.5 1.3-2.3 2.5-1.2 1.7-1.5 3.6-1.5 4.6 0 1.5-.5 2-.5 3 0 .8.5 1.4 1.5 1.6.4.7 1.2 1.1 2 1.1 1 0 1.8-.4 2.6-.9.8.5 1.6.9 2.6.9.8 0 1.6-.4 2-1.1 1-.2 1.5-.8 1.5-1.6 0-1-.5-1.5-.5-3 0-1-.3-2.9-1.5-4.6-.8-1.2-1.7-2.1-2.3-2.5.4-.6.7-1.3.7-2.2C9.4 1.4 8.3 0 7 0zm0 .8c.7 0 1.4.4 1.7 1-.4-.4-.9-.6-1.4-.5-.7.1-1.3.6-1.7 1.3 0-1 .6-1.8 1.4-1.8zM5.5 5.7c.3.5.7 1 1.2 1 .4 0 .7-.4 1.1-.6.4-.2.9-.4 1.3-.1.4.3.5.8.5 1.3 0 .9-.4 1.7-1.1 2.2-.7.5-1.6.5-2.4.2-.8-.4-1.4-1-1.6-1.7-.1-.3-.1-.7 0-1 .2-.5.6-.9 1-1.3z" />
            </svg>
            Linux
          </span>
          {/* Windows — el build existe pero la web aún no sirve el instalador
              (/api/download es solo Mac). Lo mostramos como "pronto" hasta
              conectar el link; entonces pasa a disponible. */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-dashed border-[var(--color-border)] bg-[var(--color-panel)]/40 opacity-80">
            <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M0 2.3l6.5-.9v6.3H0V2.3zM7.3 1.3L16 0v7.7H7.3V1.3zM0 8.5h6.5v6.3L0 13.7V8.5zM7.3 8.5H16V16l-8.7-1.2V8.5z" />
            </svg>
            {dict.locale === "es" ? "Windows · pronto" : "Windows · soon"}
          </span>
        </div>

        {/* "También en Chrome" chip — bridge a la sección
            ChromeExtensionTeaser. Está separado de las pills de OS porque NO
            es un OS soportado del desktop; es un producto adjacente (la
            extensión BYOK). Visual: pill tintada con accent + Chrome glyph
            para diferenciarlo, link al anchor de la sección. */}
        <div className="mt-3 inline-flex items-center justify-center">
          <a
            href={`/${dict.locale}#chrome-extension`}
            className="group inline-flex items-center gap-1.5 rounded-full border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/8 px-3 py-1 text-[11px] font-semibold text-[var(--color-accent)] hover:bg-[var(--color-accent)]/14 transition-colors"
          >
            <Chrome size={11} strokeWidth={2.4} />
            {dict.locale === "es"
              ? "También en Chrome — 3 IAs en paralelo, BYOK"
              : "Also on Chrome — 3 AIs side-by-side, BYOK"}
            <ArrowRight
              size={11}
              strokeWidth={2.4}
              className="group-hover:translate-x-0.5 transition-transform"
            />
          </a>
        </div>

        {/* Windows visitors get the waitlist banner instead of being
            ignored — the macOS pill stays so the platform context is
            obvious, but they get a clear path to express interest. */}
        <WindowsEarlyAccess dict={dict} />

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

/** Subhead que rota entre los mensajes del §01 cada 4s, con dots. */
function RotatingSubhead({ messages }: { messages: string[] }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (messages.length < 2) return;
    const id = setInterval(() => {
      setI((prev) => (prev + 1) % messages.length);
    }, 4000);
    return () => clearInterval(id);
  }, [messages.length]);

  return (
    <div className="mt-5">
      <p
        key={i}
        className="hero-rotate text-[var(--color-fg-muted)] max-w-2xl mx-auto leading-relaxed min-h-[1.6em]"
        style={{ fontSize: "clamp(0.9375rem, 1.6vw, 1.125rem)" }}
        aria-live="polite"
      >
        {messages[i]}
      </p>
      <div className="mt-3 flex items-center justify-center gap-1.5">
        {messages.map((_, idx) => (
          <span
            key={idx}
            className={`h-1.5 rounded-full transition-all ${
              idx === i
                ? "w-4 bg-[var(--color-accent)]"
                : "w-1.5 bg-[var(--color-border)]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
