"use client";

import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
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
    trust: ["Sin programar", "Memoria permanente", "Continúa aunque cambie la IA"],
    prefixLabel: "CON TERMINALSYNC:",
    shotTitle: "Desde acá manejas tu empresa con IA",
    trustCount: "Más de 2,000 empresas ya confían en TerminalSync",
  },
  en: {
    resultsStrong:
      "Build in minutes: CRM · Portals · Dashboards · Inventory · Proposals · Automations · Reports · Quotes",
    ctaPrimary: "Start free",
    ctaSecondary: "See how it works",
    os: "macOS · Linux · Windows",
    trust: ["No coding", "Persistent memory", "Continues even if the AI changes"],
    prefixLabel: "WITH TERMINALSYNC:",
    shotTitle: "This is where your business runs from.",
    trustCount: "Over 2,000 companies already trust TerminalSync",
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
