"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import type { Locale } from "@/content";

interface Demo {
  id: string;
  src: string;
  eyebrow: string;
  title: string;
  body: string;
}

const DEMOS: Record<Locale, Demo[]> = {
  es: [
    {
      id: "cambio-ia",
      src: "/demos/demo-cambio-ia.html",
      eyebrow: "Cambio de IA en un clic",
      title: "Cada tarea necesita un especialista.",
      body: "Claude piensa, Codex construye, Gemini analiza. ¿Sin tokens? Sigue con otra IA, sin perder el contexto.",
    },
    {
      id: "resultados",
      src: "/demos/demo-resultados.html",
      eyebrow: "Trabajo terminado",
      title: "No es un chat. Es trabajo terminado.",
      body: "Pides un trabajo y las 3 IAs lo hacen: Claude escribe, Codex arma, Gemini revisa — y queda ✅ entregado.",
    },
    {
      id: "director",
      src: "/demos/demo-ai-director.html",
      eyebrow: "AI Director",
      title: "Un director que elige por ti.",
      body: "TerminalSync recomienda el modo correcto para cada tarea — y te dice cuánto ahorras antes de cambiar.",
    },
    {
      id: "continuidad",
      src: "/demos/demo-sync-dispositivos.html",
      eyebrow: "Continuidad entre dispositivos",
      title: "Empieza en el portátil. Sigue en la oficina.",
      body: "Cierras todo y cambias de computadora — tu sesión, tu contexto y tu memoria te siguen, intactos.",
    },
    {
      id: "integraciones",
      src: "/demos/demo-conectores.html",
      eyebrow: "Integraciones",
      title: "Dale nuevas habilidades a tu equipo de IAs.",
      body: "Arrastra Gmail, Drive, Notion y más a tu sesión. Sin claves, sin configurar nada. Listo para trabajar.",
    },
    {
      id: "mensajeria",
      src: "/demos/demo-mensajeria.html",
      eyebrow: "Tu trabajo te sigue hasta el chat",
      title: "Empieza en la terminal. Sigue en WhatsApp y Telegram.",
      body: "La misma conversación continúa en tu celular — respondes desde el chat y tus IAs siguen trabajando, sin abrir la laptop.",
    },
    {
      id: "asistente",
      src: "/demos/demo-asistente-prompts.html",
      eyebrow: "Asistente de prompts",
      title: "Un asistente de IA para hablar con las IAs.",
      body: "¿No sabes qué responder? La IA redacta o pule tu mensaje por ti — para que le saques más a cada IA.",
    },
  ],
  en: [
    {
      id: "cambio-ia",
      src: "/demos/demo-cambio-ia.html",
      eyebrow: "Switch AI in one click",
      title: "Every task needs a specialist.",
      body: "Claude thinks, Codex builds, Gemini analyzes. Out of tokens? Continue on another AI, without losing context.",
    },
    {
      id: "resultados",
      src: "/demos/demo-resultados.html",
      eyebrow: "Finished work",
      title: "It's not a chat. It's finished work.",
      body: "Ask for a job and the 3 AIs do it: Claude writes, Codex builds, Gemini reviews — and it's ✅ delivered.",
    },
    {
      id: "director",
      src: "/demos/demo-ai-director.html",
      eyebrow: "AI Director",
      title: "A director that chooses for you.",
      body: "TerminalSync recommends the right mode for each task — and tells you how much you save before switching.",
    },
    {
      id: "continuidad",
      src: "/demos/demo-sync-dispositivos.html",
      eyebrow: "Continuity across devices",
      title: "Start on the laptop. Continue at the office.",
      body: "Close everything and switch computers — your session, context and memory follow you, intact.",
    },
    {
      id: "integraciones",
      src: "/demos/demo-conectores.html",
      eyebrow: "Integrations",
      title: "Give your AI team new skills.",
      body: "Drag Gmail, Drive, Notion and more into your session. No keys, nothing to set up. Ready to work.",
    },
    {
      id: "mensajeria",
      src: "/demos/demo-mensajeria.html",
      eyebrow: "Work from your phone",
      title: "Start in the terminal. Continue on WhatsApp and Telegram.",
      body: "The same conversation continues on your phone — you reply from the chat and your AIs keep working, without opening the laptop.",
    },
    {
      id: "asistente",
      src: "/demos/demo-asistente-prompts.html",
      eyebrow: "Prompt assistant",
      title: "An AI assistant to talk to the AIs.",
      body: "Not sure what to reply? The AI drafts or polishes your message for you — so you get more out of each AI.",
    },
  ],
};

export function DemosGrid({ lang }: { lang: Locale }) {
  const demos = DEMOS[lang];
  const [openId, setOpenId] = useState<string | null>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openId) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenId(null);
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (lightboxRef.current === e.target) setOpenId(null);
    };

    window.addEventListener("keydown", handleEsc);
    window.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleEsc);
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openId]);

  return (
    <>
      <section id="demos" className="scroll-mt-20 mx-auto max-w-6xl px-5 md:px-6 py-20 md:py-28">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <span className="text-[12.5px] font-mono uppercase tracking-[0.12em] text-[var(--color-accent)]">
            {lang === "es"
              ? "Por qué la gente cambia en 30 segundos"
              : "Why people switch in 30 seconds"}
          </span>
          <h2
            className="font-semibold tracking-tight text-[var(--color-fg-strong)] leading-[1.08] mt-3"
            style={{ fontSize: "clamp(1.75rem, 4.4vw, 2.75rem)" }}
          >
            {lang === "es"
              ? "Momentos en los que dices: \"¡Guau!\""
              : "Moments that make you say: \"Wow!\""}
          </h2>
          <p className="mt-3 text-[15px] text-[var(--color-fg-muted)]">
            {lang === "es"
              ? "No es un video: es TerminalSync funcionando. Míralo en vivo y pruébalo tú mismo."
              : "It's not a video: it's TerminalSync running. Watch it live and try it yourself."}
          </p>
        </div>

        {/* Demos grid: 2 columns on desktop, 1 on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {demos.map((demo) => (
            <article
              key={demo.id}
              className="group flex flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] overflow-hidden"
              style={{ boxShadow: "var(--shadow-floating)" }}
            >
              {/* Card header */}
              <div className="p-5 md:p-6 pb-4">
                <span className="text-[10.5px] font-mono uppercase tracking-[0.14em] text-[var(--color-accent)] font-semibold">
                  {demo.eyebrow}
                </span>
                <h3 className="mt-3 text-[17px] font-semibold tracking-tight text-[var(--color-fg-strong)] leading-tight">
                  {demo.title}
                </h3>
                <p className="mt-2 text-[13px] text-[var(--color-fg-muted)] leading-relaxed">
                  {demo.body}
                </p>
              </div>

              {/* Demo iframe container */}
              <div className="relative flex-1 bg-[var(--color-panel-2)] overflow-hidden">
                {/* Blurred preview - static, no pointer events */}
                <iframe
                  src={demo.src}
                  title={demo.title}
                  className="w-full h-[320px] md:h-[360px] border-0 block"
                  style={{
                    filter: "blur(7px) saturate(1.02)",
                    transform: "scale(1.08)",
                    pointerEvents: "none",
                  }}
                />

                {/* Frosted overlay — always visible, click anywhere to expand */}
                <button
                  type="button"
                  onClick={() => setOpenId(demo.id)}
                  className="absolute inset-0 z-10 flex items-center justify-center cursor-zoom-in"
                  style={{
                    background: "color-mix(in srgb, white 55%, transparent)",
                    backdropFilter: "blur(2px)",
                    transition: "background 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "color-mix(in srgb, white 42%, transparent)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "color-mix(in srgb, white 55%, transparent)";
                  }}
                  aria-label={lang === "es" ? "Ver Demo" : "Watch Demo"}
                >
                  <span className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent)] text-white px-4 py-2 text-[13px] font-medium shadow-sm">
                    {lang === "es" ? "Ver Demo" : "Watch Demo"}
                  </span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Lightbox modal */}
      {openId && (
        <div
          ref={lightboxRef}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="relative w-full max-w-4xl bg-[var(--color-panel)] rounded-2xl overflow-hidden">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setOpenId(null)}
              className="absolute top-4 right-4 z-10 inline-flex items-center justify-center h-10 w-10 rounded-lg text-[var(--color-fg)] hover:bg-[var(--color-panel-2)] transition-colors"
              aria-label={lang === "es" ? "Cerrar" : "Close"}
            >
              <X size={20} strokeWidth={2} />
            </button>

            {/* Demo iframe at full size */}
            <iframe
              src={demos.find((d) => d.id === openId)?.src}
              title={demos.find((d) => d.id === openId)?.title}
              className="w-full h-[80vh] border-0 block"
            />
          </div>
        </div>
      )}
    </>
  );
}
