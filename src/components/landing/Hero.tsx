"use client";

import React, { useState, useEffect } from "react";
import { ArrowRight, Download, Play, PlayCircle } from "lucide-react";
import type { Dict, Locale } from "@/content";
import { ClaudeMark, OpenAIMark, GeminiMark } from "@/components/brand/AILogos";
import { VideoLightbox } from "@/components/VideoLightbox";

const VIDEO_SRC: Record<Locale, string> = {
  es: "/assets/terminalsync.mp4",
  en: "/assets/terminalsync-en.mp4",
};

const COPY = {
  es: {
    eyebrow: "Piensan, construyen y ejecutan. Tú diriges el equipo.",
    subtitle:
      "Describe cómo funciona tu empresa. TerminalSync crea los programas, recuerda todo el contexto y sigue mejorándolo contigo.",
    results: "",
    resultsStrong: "Crea en minutos: CRM · Portales · Dashboards · Inventarios · Propuestas · Automatizaciones · Reportes · Cotizadores",
    ctaPrimary: "Empieza gratis",
    ctaSecondary: "Mira cómo funciona",
    os: "macOS · Linux · Windows",
    trust: ["Sin programar", "Memoria permanente", "Continúa aunque cambie la IA"],
    caption: "Cada proyecto tiene su propio espacio. Su memoria. Sus archivos. Su equipo de IAs.",
    prefixLabel: "CON TERMINALSYNC:",
    shotTitle: "Desde acá se maneja tu empresa.",
    playVideo: "Ver video",
    trustCount: "Más de 2,000 empresas ya confían en TerminalSync",
  },
  en: {
    eyebrow: "They think, build and execute. You run the team.",
    subtitle:
      "Describe how your business works. TerminalSync builds the tools, remembers everything, and keeps improving with you.",
    results: "",
    resultsStrong: "Build in minutes: CRM · Portals · Dashboards · Inventory · Proposals · Automations · Reports · Quotes",
    ctaPrimary: "Start free",
    ctaSecondary: "See how it works",
    os: "macOS · Linux · Windows",
    trust: ["No coding", "Persistent memory", "Continues even if the AI changes"],
    caption: "Every project has its own space. Its memory. Its files. Its AI team.",
    prefixLabel: "WITH TERMINALSYNC:",
    shotTitle: "This is where your business runs from.",
    playVideo: "Watch video",
    trustCount: "Over 2,000 companies already trust TerminalSync",
  },
} as const;

export function Hero({ dict }: { dict: Dict }) {
  const t = COPY[dict.locale];
  const [videoOpen, setVideoOpen] = useState(false);

  return (
    <section id="hero" className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(ellipse at 50% -10%, var(--color-accent-glow), transparent 55%)",
        }}
      />
      <div className="relative mx-auto max-w-5xl px-5 md:px-6 pt-12 sm:pt-16 md:pt-20 pb-10 text-center">
        {/* Prefijo estático encima del H1 rotativo */}
        <p
          className="mb-2 font-mono uppercase text-[var(--color-fg-strong)] opacity-75"
          style={{ letterSpacing: "0.08em", fontSize: "14px" }}
        >
          {t.prefixLabel}
        </p>

        {/* Titular grande rotativo */}
        <RotatingHeadline lang={dict.locale} />

        <p
          className="mt-5 text-[var(--color-fg-muted)] max-w-2xl mx-auto leading-relaxed"
          style={{ fontSize: "clamp(0.9375rem, 1.6vw, 1.125rem)" }}
        >
          {t.subtitle}
        </p>

        {/* Línea de resultados */}
        <p className="mt-4 text-[14px] text-[var(--color-fg-muted)] max-w-2xl mx-auto leading-relaxed">
          {t.results}
          <strong className="font-bold text-[var(--color-fg-strong)]">
            {t.resultsStrong}
          </strong>
        </p>

        {/* CTAs */}
        <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
          <a
            href="/api/download"
            data-cta="hero-primary"
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-[15.5px] font-semibold text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] transition-all hover:-translate-y-px"
            style={{ boxShadow: "0 8px 30px -10px var(--color-accent)" }}
          >
            <Download size={16} strokeWidth={2.4} />
            {t.ctaPrimary}
          </a>
          <button
            type="button"
            onClick={() => setVideoOpen(true)}
            className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-[15px] font-semibold text-[var(--color-fg)] bg-[var(--color-panel)] border border-[var(--color-border-strong)] hover:border-[var(--color-accent)]/40 transition-colors"
          >
            <PlayCircle size={16} strokeWidth={2} />
            {t.ctaSecondary}
            <ArrowRight size={14} strokeWidth={2.4} />
          </button>
        </div>

        <p className="mt-3 text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--color-fg-dim)]">
          {t.os}
        </p>

        {/* Trust line */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[12px] font-mono text-[var(--color-fg-muted)]">
          {t.trust.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </div>

      {/* Dashboard */}
      <div className="relative mx-auto max-w-6xl px-3 sm:px-5 md:px-6 pb-16 md:pb-20">
        {/* Shot title */}
        <h2
          className="text-center font-semibold text-[var(--color-fg-strong)] leading-tight max-w-[18ch] mx-auto mb-4"
          style={{ fontSize: "clamp(26px, 4vw, 42px)", letterSpacing: "-0.035em" }}
        >
          {t.shotTitle}
        </h2>

        {/* Pills de IAs + eyebrow — debajo del shot title, encima del mockup */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-6 md:mb-8">
          <div className="inline-flex items-center gap-2">
            <Chip color="var(--color-claude)"><ClaudeMark size={15} /> Claude</Chip>
            <Chip color="var(--color-codex)"><OpenAIMark size={14} className="text-[var(--color-fg-strong)]" /> Codex</Chip>
            <Chip color="var(--color-gemini)"><GeminiMark size={15} /> Gemini</Chip>
          </div>
          <span className="text-[12.5px] font-mono uppercase tracking-[0.12em] text-[var(--color-accent)]">
            {t.eyebrow}
          </span>
        </div>

        {/* Imagen del dashboard con botón ▶ */}
        <div
          className="relative rounded-[22px] border border-[var(--color-border)] bg-[var(--color-panel)] overflow-hidden"
          style={{ boxShadow: "var(--shadow-floating)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/redesign/dashboard-hero.png"
            alt={t.caption}
            className="w-full h-auto block"
            loading="eager"
          />
          {/* Botón de video */}
          <button
            type="button"
            aria-label={t.playVideo}
            onClick={() => setVideoOpen(true)}
            className="absolute z-50 flex items-center justify-center rounded-full text-white transition-transform hover:scale-110 active:scale-95"
            style={{
              width: "72px",
              height: "72px",
              background: "rgba(0,0,0,0.75)",
              top: "50%",
              left: "58%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <Play size={26} strokeWidth={0} fill="white" className="ml-1" />
          </button>
        </div>

        <p className="mt-4 text-center text-[13px] text-[var(--color-fg-dim)]">{t.caption}</p>

        {/* Trust bar */}
        <div className="mt-12 md:mt-16 text-center">
          <p className="text-[14px] text-[var(--color-fg-muted)] mb-5 md:mb-6">
            {t.trustCount}
          </p>
          <div className="flex items-center justify-center gap-6 md:gap-8 lg:gap-12 flex-wrap">
            <TrustLogo name="Google" />
            <TrustLogo name="Notion" />
            <TrustLogo name="Slack" />
            <TrustLogo name="OpenAI" />
            <TrustLogo name="AWS" />
            <TrustLogo name="Miro" />
          </div>
        </div>
      </div>

      {/* Modal de video */}
      <VideoLightbox
        open={videoOpen}
        onClose={() => setVideoOpen(false)}
        dict={dict}
        videoUrl={VIDEO_SRC[dict.locale]}
      />
    </section>
  );
}

function Chip({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-1 text-[13px] font-medium text-[var(--color-fg)]">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      {children}
    </span>
  );
}

function TrustLogo({ name }: { name: string }) {
  const logoMap: Record<string, string> = {
    Google: "google",
    Notion: "notion",
    Slack: "slack",
    OpenAI: "openai",
    AWS: "amazonaws",
    Miro: "miro",
  };
  const icon = logoMap[name];
  const cdnUrl = `https://cdn.simpleicons.org/${icon}/9aa0aa`;

  return (
    <img
      src={cdnUrl}
      alt={name}
      onError={(e) => {
        const img = e.target as HTMLImageElement;
        img.style.display = "none";
        const span = document.createElement("span");
        span.textContent = name;
        span.className = "text-[13px] font-medium text-[var(--color-fg-muted)]";
        img.parentElement?.appendChild(span);
      }}
      className="h-6 w-auto opacity-70 hover:opacity-100 transition-opacity"
      loading="lazy"
    />
  );
}

/** Frases maestras completas para el titular del Hero (bilingüe). */
type Headline = { pre: string; hi: string; post: string };
const HERO_HEADLINES: Record<Locale, Headline[]> = {
  es: [
    { pre: "La forma más fácil de ", hi: "crear programas", post: " para tu empresa con IA." },
    { pre: "Deja de comprar programas, empieza a ", hi: "crearlos", post: "." },
    { pre: "Tu oficina ", hi: "cabe en cualquier computadora", post: "." },
    { pre: "Describe el problema. Tus IAs ", hi: "construyen la solución", post: "." },
    { pre: "Claude, Codex y Gemini. ", hi: "Una sola memoria", post: "." },
    { pre: "Convierte tus ideas en ", hi: "herramientas reales", post: " hablando con IA." },
    { pre: "Multiplica tu capacidad, ", hi: "sin multiplicar tu nómina", post: "." },
    { pre: "Tu empresa ahora ", hi: "recuerda todo", post: "." },
    { pre: "Cada problema nuevo ", hi: "ya no necesita otro programa", post: "." },
  ],
  en: [
    { pre: "Turn your ideas into ", hi: "real tools", post: " by talking to AI." },
    { pre: "Your AI ", hi: "learns your business", post: " and never forgets." },
    { pre: "Go from one AI to ", hi: "a team of AIs", post: "." },
    { pre: "Multiply your capacity ", hi: "without growing payroll", post: "." },
    { pre: "The AI writes the code. ", hi: "You run the business", post: "." },
    { pre: "When one AI stops, ", hi: "another continues", post: "." },
    { pre: "Your office ", hi: "fits in any computer", post: "." },
  ],
};

function RotatingHeadline({ lang }: { lang: Locale }) {
  const phrases = HERO_HEADLINES[lang];
  const [idx, setIdx] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setFading(true), 6500);
    return () => clearInterval(id);
  }, []);

  function handleTransitionEnd(e: React.TransitionEvent<HTMLHeadingElement>) {
    if (e.propertyName !== "opacity" || !fading) return;
    setIdx((prev) => (prev + 1) % phrases.length);
    setFading(false);
  }

  const p = phrases[idx];
  return (
    <div className="mt-6">
      {/* Fixed-height wrapper prevents layout shift when phrases wrap to different line counts */}
      <div
        className="relative w-full"
        style={{ height: `calc(3.4 * clamp(2.375rem, 6.6vw, 4.75rem))` }}
      >
        <h1
          className="hero-rotate font-semibold tracking-tight leading-[1.06] text-[var(--color-fg-strong)] max-w-4xl mx-auto break-words absolute inset-x-0 top-0 text-center"
          style={{
            fontSize: "clamp(2.375rem, 6.6vw, 4.75rem)",
            letterSpacing: "-0.045em",
            opacity: fading ? 0 : 1,
            transition: "opacity 0.22s ease",
          }}
          aria-live="polite"
          onTransitionEnd={handleTransitionEnd}
        >
          {p.pre}
          <span className="bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-soft)] bg-clip-text text-transparent">
            {p.hi}
          </span>
          {p.post}
        </h1>
      </div>
      <div className="mt-4 flex items-center justify-center gap-1.5">
        {phrases.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i === idx ? "w-4 bg-[var(--color-accent)]" : "w-1.5 bg-[var(--color-border-strong)]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
