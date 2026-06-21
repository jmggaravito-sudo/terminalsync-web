"use client";

import { useState, useEffect } from "react";
import { ArrowRight, Download, PlayCircle } from "lucide-react";
import type { Dict, Locale } from "@/content";
import { VideoLightbox } from "@/components/VideoLightbox";
import { ClaudeMark, OpenAIMark, GeminiMark } from "@/components/brand/AILogos";

const DEMO_VIDEO_URLS: Record<string, string> = {
  es: "/video/corte-es.mp4",
  en: "/video/corte-en.mp4",
};

const COPY = {
  es: {
    eyebrow: "Piensan, construyen y ejecutan. Tú diriges el equipo.",
    subtitle:
      "Describe lo que necesitas. Tus IAs lo crean, lo mantienen y nunca olvidan tu negocio — aunque cierres todo o cambies de computadora.",
    results:
      "Seguimientos · Propuestas · Portales para clientes · Reportes · Automatizaciones — ",
    resultsStrong: "creados por tus IAs mientras trabajas.",
    ctaPrimary: "Empieza gratis",
    ctaSecondary: "Mira cómo funciona",
    os: "macOS · Linux · Windows",
    trust: ["Claude · Codex · Gemini incluidas", "Listo en minutos", "Cifrado E2EE · ni nosotros lo leemos"],
    caption: "Tus espacios de trabajo de IA, sincronizados en todas partes.",
  },
  en: {
    eyebrow: "They think, build and execute. You run the team.",
    subtitle:
      "Describe what you need. Your AIs build it, maintain it and never forget your business — even if you close everything or switch computers.",
    results: "Follow-ups · Proposals · Client portals · Reports · Automations — ",
    resultsStrong: "built by your AIs while you work.",
    ctaPrimary: "Start free",
    ctaSecondary: "See how it works",
    os: "macOS · Linux · Windows",
    trust: ["Claude · Codex · Gemini included", "Ready in minutes", "E2EE encrypted · not even we can read it"],
    caption: "Your AI workspaces, synced everywhere.",
  },
} as const;

export function Hero({ dict }: { dict: Dict }) {
  const [videoOpen, setVideoOpen] = useState(false);
  const t = COPY[dict.locale];

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
        {/* Chips de IAs + eyebrow */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <div className="inline-flex items-center gap-2">
            <Chip color="var(--color-claude)"><ClaudeMark size={15} /> Claude</Chip>
            <Chip color="var(--color-codex)"><OpenAIMark size={14} className="text-[var(--color-fg-strong)]" /> Codex</Chip>
            <Chip color="var(--color-gemini)"><GeminiMark size={15} /> Gemini</Chip>
          </div>
          <span className="text-[12.5px] font-mono uppercase tracking-[0.12em] text-[var(--color-accent)]">
            {t.eyebrow}
          </span>
        </div>

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
          <span className="font-semibold text-[var(--color-fg-strong)]">{t.resultsStrong}</span>
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

      {/* Dashboard real (claro) */}
      <div className="relative mx-auto max-w-6xl px-3 sm:px-5 md:px-6 pb-16 md:pb-20">
        {/* Shot title above the screenshot */}
        <h2
          className="text-center font-semibold text-[var(--color-fg-strong)] leading-tight max-w-[18ch] mx-auto mb-6 md:mb-8"
          style={{ fontSize: "clamp(26px, 4vw, 42px)", letterSpacing: "-0.035em" }}
        >
          {dict.locale === "es"
            ? "Desde acá se maneja tu empresa."
            : "This is where your business runs from."}
        </h2>

        <div className="rounded-[22px] border border-[var(--color-border)] bg-[var(--color-panel)] overflow-hidden" style={{ boxShadow: "var(--shadow-floating)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/redesign/dashboard-hero.png"
            alt={t.caption}
            className="w-full h-auto block"
            loading="eager"
          />
        </div>
        <p className="mt-4 text-center text-[13px] text-[var(--color-fg-dim)]">{t.caption}</p>

        {/* Trust bar — "Más de 2,000 empresas confían en TerminalSync" + logos */}
        <div className="mt-12 md:mt-16 text-center">
          <p className="text-[14px] text-[var(--color-fg-muted)] mb-5 md:mb-6">
            {dict.locale === "es"
              ? "Más de 2,000 empresas ya confían en TerminalSync"
              : "Over 2,000 companies already trust TerminalSync"}
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

      <VideoLightbox
        open={videoOpen}
        onClose={() => setVideoOpen(false)}
        dict={dict}
        videoUrl={DEMO_VIDEO_URLS[dict.locale] ?? undefined}
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
        // Fallback: show text if CDN fails
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
    { pre: "Convierte tus ideas en ", hi: "herramientas reales", post: " hablando con IA." },
    { pre: "Tu IA ", hi: "aprende de tu empresa", post: " y no se olvida nunca." },
    { pre: "Pasa de una IA a ", hi: "un equipo de IAs", post: "." },
    { pre: "Multiplica tu capacidad ", hi: "sin multiplicar tu nómina", post: "." },
    { pre: "La IA escribe el código. ", hi: "Tú diriges el negocio", post: "." },
    { pre: "Cuando una IA se detiene, ", hi: "otra continúa", post: "." },
    { pre: "Tu oficina ", hi: "cabe en cualquier computadora", post: "." },
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
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setI((prev) => (prev + 1) % phrases.length);
    }, 6500);
    return () => clearInterval(id);
  }, [phrases.length]);

  const p = phrases[i];
  return (
    <div className="mt-6">
      <h1
        key={i}
        className="hero-rotate font-semibold tracking-tight leading-[1.06] text-[var(--color-fg-strong)] max-w-4xl mx-auto break-words min-h-[2.2em]"
        style={{ fontSize: "clamp(2.375rem, 6.6vw, 4.75rem)", letterSpacing: "-0.045em" }}
        aria-live="polite"
      >
        {p.pre}
        <span className="bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-soft)] bg-clip-text text-transparent">
          {p.hi}
        </span>
        {p.post}
      </h1>
      <div className="mt-4 flex items-center justify-center gap-1.5">
        {phrases.map((_, idx) => (
          <span
            key={idx}
            className={`h-1.5 rounded-full transition-all ${
              idx === i ? "w-4 bg-[var(--color-accent)]" : "w-1.5 bg-[var(--color-border-strong)]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
