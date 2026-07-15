"use client";

import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Download, PlayCircle } from "lucide-react";
import type { Dict, Locale } from "@/content";

const VIDEO_SRC: Record<Locale, string> = {
  es: "/assets/terminalsync.mp4",
  en: "/assets/terminalsync-en.mp4",
};

// 10 rotating pairs — headline (h) + subtitle (s).
// <span class="grad"> receives the brand accent gradient.
const ROTATE_DATA: Record<Locale, Array<{ h: string; s: string }>> = {
  es: [
    {
      h: 'Tu empresa trabaja con IA, <span class="grad">incluso cuando tú no estás.</span>',
      s: "Supervisa el trabajo desde cualquier dispositivo.",
    },
    {
      h: 'La IA trabaja <span class="grad">donde ya viven tus archivos.</span>',
      s: "No lleves tus archivos a la IA. Lleva la IA hasta ellos.",
    },
    {
      h: 'Deja de subir documentos. <span class="grad">Conecta la IA a tus carpetas.</span>',
      s: "Trabaja siempre con la versión más reciente de tus archivos.",
    },
    {
      h: 'Cada cliente, proyecto o área tiene <span class="grad">su propia memoria.</span>',
      s: "La IA nunca pierde el contexto de tu trabajo.",
    },
    {
      h: 'No es otro chat. <span class="grad">Es tu oficina digital con IA.</span>',
      s: "Porque trabajar es mucho más que conversar.",
    },
    {
      h: 'Convierte cada proceso de tu empresa en <span class="grad">un trabajador digital.</span>',
      s: "Cada área puede tener su propio equipo de IA.",
    },
    {
      h: 'Tu trabajo continúa <span class="grad">aunque cierres el computador.</span>',
      s: "TerminalSync puede seguir trabajando mientras tú haces otras cosas.",
    },
    {
      h: 'Usa Claude, Codex y Gemini <span class="grad">sin perder el contexto.</span>',
      s: "Siempre podrás continuar con la IA más conveniente.",
    },
    {
      h: 'Tu empresa <span class="grad">recuerda, organiza y ejecuta.</span>',
      s: "TerminalSync: tu equipo digital organizado.",
    },
    {
      h: 'La IA cambia cada pocos meses. <span class="grad">El trabajo de tu empresa permanece.</span>',
      s: "TerminalSync une los dos mundos.",
    },
  ],
  en: [
    {
      h: 'Your business works with AI, <span class="grad">even when you\'re away.</span>',
      s: "Monitor the work from any device.",
    },
    {
      h: 'AI works <span class="grad">where your files already live.</span>',
      s: "Don't bring your files to the AI. Bring the AI to them.",
    },
    {
      h: 'Stop uploading documents. <span class="grad">Connect AI to your folders.</span>',
      s: "Always work with the latest version of your files.",
    },
    {
      h: 'Every client, project or team has <span class="grad">its own memory.</span>',
      s: "The AI never loses the context of your work.",
    },
    {
      h: 'It\'s not another chat. <span class="grad">It\'s your digital office with AI.</span>',
      s: "Because work is much more than a conversation.",
    },
    {
      h: 'Turn every process in your business into <span class="grad">a digital worker.</span>',
      s: "Each team can have its own AI crew.",
    },
    {
      h: 'Your work keeps going <span class="grad">even after you close your laptop.</span>',
      s: "TerminalSync keeps working while you do other things.",
    },
    {
      h: 'Use Claude, Codex and Gemini <span class="grad">without losing context.</span>',
      s: "Always pick up with whichever AI suits you best.",
    },
    {
      h: 'Your business <span class="grad">remembers, organizes and executes.</span>',
      s: "TerminalSync: your digital team, organized.",
    },
    {
      h: 'AI changes every few months. <span class="grad">Your company\'s work stays.</span>',
      s: "TerminalSync bridges both worlds.",
    },
  ],
};

// Module-level helpers — take DOM elements as args so they're free of closure deps.
function doLock(
  head: HTMLDivElement,
  rot: HTMLHeadingElement,
  sub: HTMLParagraphElement,
) {
  head.style.minHeight = "";
  const ph = rot.innerHTML, ps = sub.innerHTML;
  let max = 0;
  for (const l of ["es", "en"] as Locale[]) {
    for (const pair of ROTATE_DATA[l]) {
      rot.innerHTML = pair.h;
      sub.innerHTML = pair.s;
      const h = head.offsetHeight;
      if (h > max) max = h;
    }
  }
  rot.innerHTML = ph;
  sub.innerHTML = ps;
  head.style.minHeight = `${max}px`;
}

function doPaint(
  rot: HTMLHeadingElement,
  sub: HTMLParagraphElement,
  lang: Locale,
  idx: number,
) {
  const d = ROTATE_DATA[lang][idx];
  rot.innerHTML = d.h;
  sub.innerHTML = d.s;
}

const COPY = {
  es: {
    resultsStrong:
      "Crea en minutos: CRM · Portales · Dashboards · Inventarios · Propuestas · Automatizaciones · Reportes · Cotizadores",
    ctaPrimary: "Empieza gratis",
    ctaSecondary: "Mira cómo funciona",
    os: "macOS · Linux · Windows",
    intelNote: "¿Tu Mac es de 2020 o anterior (procesador Intel)?",
    intelLink: "Descarga la versión para Mac Intel",
    trust: ["Sin programar", "Memoria permanente", "Continúa aunque cambie la IA"],
    prefixLabel: "CON TERMINALSYNC:",
    shotTitle: "Desde acá manejas tu empresa con IA",
  },
  en: {
    resultsStrong:
      "Build in minutes: CRM · Portals · Dashboards · Inventory · Proposals · Automations · Reports · Quotes",
    ctaPrimary: "Start free",
    ctaSecondary: "See how it works",
    os: "macOS · Linux · Windows",
    intelNote: "Is your Mac from 2020 or earlier (Intel processor)?",
    intelLink: "Download the Intel Mac version",
    trust: ["No coding", "Persistent memory", "Continues even if the AI changes"],
    prefixLabel: "WITH TERMINALSYNC:",
    shotTitle: "This is where your business runs from.",
  },
} as const;

export function Hero({ dict }: { dict: Dict }) {
  const t = COPY[dict.locale];
  const [videoOpen, setVideoOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  function openVideo() {
    setVideoOpen(true);
    setTimeout(() => videoRef.current?.play(), 60);
  }

  function closeVideo() {
    videoRef.current?.pause();
    setVideoOpen(false);
  }

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
        {/* Prefijo estático */}
        <p
          className="mb-2 font-mono uppercase text-[var(--color-fg-strong)] opacity-75"
          style={{ letterSpacing: "0.08em", fontSize: "14px" }}
        >
          {t.prefixLabel}
        </p>

        {/* Titular + subtítulo rotativos sincronizados */}
        <RotatingPair lang={dict.locale} />

        {/* Línea de resultados */}
        <p className="mt-4 text-[14px] text-[var(--color-fg-muted)] max-w-2xl mx-auto leading-relaxed">
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
            onClick={openVideo}
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

        {/* Macs Intel (2020 y anteriores) descargan su propio DMG — el
            navegador no puede detectar el chip (Safari en ARM se reporta
            como Intel), así que se le pregunta al visitante en simple. */}
        <p className="mt-1.5 text-[12px] text-[var(--color-fg-muted)]">
          {t.intelNote}{" "}
          <a
            href="/api/download?arch=x86_64"
            data-cta="hero-intel"
            className="underline underline-offset-2 hover:text-[var(--color-fg)] transition-colors"
          >
            {t.intelLink}
          </a>
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
        <h2
          className="text-center font-semibold text-[var(--color-fg-strong)] leading-tight mx-auto mb-4"
          style={{ fontSize: "clamp(22px, 3.2vw, 36px)", letterSpacing: "-0.03em" }}
        >
          {t.shotTitle}
        </h2>

        {/* Portada del video con botón ▶ */}
        <div className="relative mt-6 rounded-2xl overflow-hidden group cursor-pointer shadow-floating">
          <div style={{ aspectRatio: "1525/909" }}>
            <img
              src={dict.locale === "en" ? "/redesign/dashboard-hero-en.png" : "/redesign/dashboard-hero.png"}
              alt="TerminalSync dashboard"
              className="w-full h-full object-cover object-top"
            />
          </div>
          <button
            type="button"
            onClick={openVideo}
            aria-label={dict.locale === "es" ? "Reproducir video" : "Play video"}
            className="absolute inset-0 flex items-center justify-center"
          >
            <span className="w-[88px] h-[88px] rounded-full flex items-center justify-center bg-[rgba(15,17,21,0.72)] group-hover:bg-[rgba(15,17,21,0.88)] group-hover:scale-[1.08] transition-all duration-[180ms] ring-2 ring-white/30">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </button>
        </div>

        {/* Integraciones — tiles con logos a color de las integraciones reales */}
        <IntegrationTiles lang={dict.locale} />
      </div>

      {/* Modal de video */}
      {videoOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) closeVideo();
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.85)",
            zIndex: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ position: "relative", width: "min(900px, 92vw)" }}>
            <button
              aria-label={dict.locale === "es" ? "Cerrar" : "Close"}
              onClick={closeVideo}
              style={{
                position: "absolute",
                top: -40,
                right: 0,
                background: "none",
                border: "none",
                color: "white",
                fontSize: 28,
                cursor: "pointer",
                lineHeight: 1,
              }}
            >
              ✕
            </button>
            <video
              ref={videoRef}
              playsInline
              controls
              style={{ width: "100%", borderRadius: 12, display: "block" }}
            >
              <source src={VIDEO_SRC[dict.locale]} type="video/mp4" />
            </video>
          </div>
        </div>
      )}
    </section>
  );
}

// Integraciones reales del catálogo. Iconos a color desde simpleicons; los que
// se ven pesados en negro (Notion, GitHub) van en gris. OJO: el slug "slack" ya
// no existe en simpleicons — no usarlo. Si un icono falla al cargar, se oculta
// el tile completo (nunca dejar un tile vacío).
type IconTile = { name: string; slug: string; color?: string };

const INT_ROW_1: IconTile[] = [
  { name: "Google Sheets", slug: "googlesheets" },
  { name: "Notion", slug: "notion", color: "9aa0aa" },
  { name: "Gmail", slug: "gmail" },
  { name: "Google Drive", slug: "googledrive" },
  { name: "Stripe", slug: "stripe" },
  { name: "WhatsApp", slug: "whatsapp" },
  { name: "GitHub", slug: "github", color: "9aa0aa" },
  { name: "Airtable", slug: "airtable" },
  { name: "Telegram", slug: "telegram" },
];

const INT_ROW_2: IconTile[] = [
  { name: "Sentry", slug: "sentry" },
  { name: "Supabase", slug: "supabase" },
  { name: "PostgreSQL", slug: "postgresql" },
  { name: "Webflow", slug: "webflow" },
  { name: "Google Calendar", slug: "googlecalendar" },
  { name: "GitLab", slug: "gitlab" },
  { name: "Google Maps", slug: "googlemaps" },
  { name: "SQLite", slug: "sqlite" },
  { name: "Brave", slug: "brave" },
];

function IntegrationTile({ name, slug, color, edge }: IconTile & { edge: boolean }) {
  const src = `https://cdn.simpleicons.org/${slug}${color ? `/${color}` : ""}`;
  return (
    <div className={`int-tile${edge ? " edge" : ""}`} title={name}>
      <img
        src={src}
        alt={name}
        loading="lazy"
        onError={(e) => {
          const tile = e.currentTarget.parentElement as HTMLElement | null;
          if (tile) tile.style.display = "none";
        }}
      />
    </div>
  );
}

function IntegrationTiles({ lang }: { lang: Locale }) {
  return (
    <div className="mt-12 md:mt-16 flex flex-col items-center gap-3">
      {[INT_ROW_1, INT_ROW_2].map((row, ri) => (
        <div key={ri} className="int-tiles-row">
          {row.map((it, i) => (
            <IntegrationTile
              key={it.slug}
              {...it}
              edge={i === 0 || i === row.length - 1}
            />
          ))}
        </div>
      ))}
      <Link
        href={`/${lang}/connectors`}
        className="mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 text-[15px] font-semibold text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] transition-all hover:-translate-y-px"
        style={{ boxShadow: "0 8px 30px -10px var(--color-accent)" }}
      >
        {lang === "es" ? "Ver todas las integraciones" : "Browse all integrations"}
        <ArrowRight size={16} strokeWidth={2.4} />
      </Link>
    </div>
  );
}

// React.memo prevents re-renders when Hero's videoOpen state changes,
// which would otherwise reset dangerouslySetInnerHTML to pair 0.
const RotatingPair = React.memo(function RotatingPair({ lang }: { lang: Locale }) {
  const headRef = useRef<HTMLDivElement>(null);
  const rotRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const idxRef = useRef(0);
  // Always reflects the latest lang without restarting the interval.
  const langRef = useRef(lang);
  langRef.current = lang;

  // Runs before browser paint — paint + re-lock on every lang change (no flash).
  useLayoutEffect(() => {
    const head = headRef.current;
    const rot = rotRef.current;
    const sub = subRef.current;
    if (!head || !rot || !sub) return;
    doPaint(rot, sub, lang, idxRef.current);
    doLock(head, rot, sub);
  }, [lang]);

  // Interval + resize + ts-lang — mounted once, never restarted.
  useEffect(() => {
    const head = headRef.current!;
    const rot = rotRef.current!;
    const sub = subRef.current!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => doLock(head, rot, sub), 150);
    };
    window.addEventListener("resize", onResize, { passive: true });

    // External language-change event (dispatched by the i18n switcher).
    const onLangChange = () => {
      doPaint(rot, sub, langRef.current, idxRef.current);
      doLock(head, rot, sub);
    };
    window.addEventListener("ts-lang", onLangChange);

    const timer = setInterval(() => {
      idxRef.current =
        (idxRef.current + 1) % ROTATE_DATA[langRef.current].length;

      if (reduce) {
        doPaint(rot, sub, langRef.current, idxRef.current);
        return;
      }

      rot.style.opacity = "0";
      rot.style.transform = "translateY(12px)";
      sub.style.opacity = "0";
      sub.style.transform = "translateY(10px)";

      setTimeout(() => {
        doPaint(rot, sub, langRef.current, idxRef.current);
        rot.style.opacity = "1";
        rot.style.transform = "";
        sub.style.opacity = "1";
        sub.style.transform = "";
      }, 420);
    }, 6000);

    return () => {
      clearInterval(timer);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("ts-lang", onLangChange);
    };
  }, []);

  return (
    <div ref={headRef} className="mt-6 pb-1">
      <h1
        ref={rotRef}
        className="font-semibold tracking-tight leading-[1.06] text-[var(--color-fg-strong)] max-w-4xl mx-auto text-center break-words"
        style={{
          fontSize: "clamp(2.375rem, 6.6vw, 4.75rem)",
          letterSpacing: "-0.045em",
          transition: "opacity .42s ease, transform .42s ease",
        }}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: ROTATE_DATA[lang][0].h }}
      />
      <p
        ref={subRef}
        className="mt-5 text-[var(--color-fg-muted)] max-w-2xl mx-auto leading-relaxed text-center"
        style={{
          fontSize: "clamp(0.9375rem, 1.6vw, 1.125rem)",
          transition: "opacity .42s ease, transform .42s ease",
        }}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: ROTATE_DATA[lang][0].s }}
      />
    </div>
  );
});
