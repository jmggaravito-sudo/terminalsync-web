"use client";

import { useState } from "react";
import { ArrowRight, ShieldCheck, X } from "lucide-react";
import type { Locale } from "@/content";

const T = {
  es: {
    eyebrow: "Continuidad",
    title: "Cuando una IA se detiene, tu trabajo no.",
    subtitle:
      "Las IAs tienen límites. Tus proyectos no deberían tenerlos. Cuando una deja de responder, TerminalSync continúa el proyecto sin perder contexto, sin copiar nada, sin empezar desde cero.",
    relayFrom: "IA #1 llega a su límite",
    relayTo: "IA #2 continúa sola",
    moat: "Una herramienta de una sola IA no puede hacer esto. TerminalSync no depende de ninguna — por eso tu trabajo nunca choca contra una pared.",
    behaviors: [
      { title: "Se da cuenta cuando una IA se traba", body: "Detecta cuando una IA llega a su límite, se cae o deja de responder — sin que tengas que estar mirando." },
      { title: "Cambia de IA por ti", body: "Pasa el proyecto a otra IA disponible. Tú no haces nada." },
      { title: "Lleva tu contexto", body: "Retoma con el proyecto, las decisiones y dónde ibas, intactos." },
      { title: "Sigue donde quedaste", body: "No empieza de cero: continúa el proyecto en el punto exacto del corte." },
    ],
    neverAgain: [
      "Nunca vuelves a copiar contexto.",
      "Nunca vuelves a explicar el proyecto.",
      "Nunca vuelves a empezar desde cero.",
      "Nunca pierdes el trabajo realizado.",
    ],
    quote: "Mientras otras plataformas terminan conversaciones, TerminalSync termina proyectos.",
    whatsapp: {
      eyebrow: "Tu trabajo te sigue hasta el chat",
      title: "Escríbele a tu empresa desde donde estés.",
      body: "Desde WhatsApp o Telegram, das la instrucción. Tus IAs siguen trabajando. No necesitas abrir la laptop.",
      bullets: [
        "Aprueba cambios desde el celular",
        "Tus IAs te avisan cuando terminan",
        "El proyecto sigue aunque no estés en el computador",
      ],
      watchDemo: "Ver Demo",
      closeDemo: "Cerrar",
    },
  },
  en: {
    eyebrow: "Continuity",
    title: "When one AI stops, your work doesn't.",
    subtitle:
      "AIs have limits. Your projects shouldn't. When one stops responding, TerminalSync continues the project — no lost context, no copying, no starting over.",
    relayFrom: "AI #1 hits its limit",
    relayTo: "AI #2 continues on its own",
    moat: "A single-AI tool can't do this. TerminalSync doesn't depend on any one of them — that's why your work never hits a wall.",
    behaviors: [
      { title: "It notices when an AI gets stuck", body: "Detects when an AI hits its limit, goes down or stops responding — without you watching." },
      { title: "Switches to another AI for you", body: "Passes the project to another available AI. You don't do a thing." },
      { title: "Carries your context", body: "Picks up with the project, decisions, and where you left off — intact." },
      { title: "Keeps going where you left off", body: "It doesn't start over: it continues the project at the exact point of the cutoff." },
    ],
    neverAgain: [
      "Never copy context again.",
      "Never re-explain the project.",
      "Never start from scratch.",
      "Never lose completed work.",
    ],
    quote: "While other platforms end conversations, TerminalSync finishes projects.",
    whatsapp: {
      eyebrow: "Your work follows you to the chat",
      title: "Message your business from anywhere.",
      body: "From WhatsApp or Telegram, give the instruction. Your AIs keep working. No need to open the laptop.",
      bullets: [
        "Approve changes from your phone",
        "Your AIs notify you when they're done",
        "The project keeps going even when you're away",
      ],
      watchDemo: "Watch Demo",
      closeDemo: "Close",
    },
  },
} as const;

export function Continuity({ lang }: { lang: Locale }) {
  const t = T[lang];
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <section id="continuity" className="mx-auto max-w-5xl px-5 md:px-6 py-20 md:py-24">
      <div className="text-center max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--color-accent)]">
          <ShieldCheck size={13} strokeWidth={2.4} />
          {t.eyebrow}
        </span>
        <h2
          className="mt-3 font-semibold tracking-tight text-[var(--color-fg-strong)] leading-[1.08]"
          style={{ fontSize: "clamp(1.75rem, 4.5vw, 2.75rem)" }}
        >
          {t.title}
        </h2>
        <p className="mt-4 text-[16px] text-[var(--color-fg-muted)] leading-relaxed">{t.subtitle}</p>
      </div>

      <div className="mt-10 flex items-center justify-center gap-3 sm:gap-5 text-[13px] font-medium">
        <span className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-3 text-[var(--color-fg-dim)] line-through decoration-[var(--color-fg-dim)]/50">
          {t.relayFrom}
        </span>
        <ArrowRight size={20} className="shrink-0 text-[var(--color-accent)]" />
        <span className="rounded-xl border border-[var(--color-ok)]/40 bg-[var(--color-ok)]/8 px-4 py-3 font-semibold text-[var(--color-ok)]">
          {t.relayTo}
        </span>
      </div>

      {/* Pasos de continuidad */}
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {t.behaviors.map((b) => (
          <div key={b.title} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
            <h3 className="text-[15px] font-semibold text-[var(--color-fg-strong)]">{b.title}</h3>
            <p className="mt-1.5 text-[13.5px] text-[var(--color-fg-muted)] leading-relaxed">{b.body}</p>
          </div>
        ))}
        <div className="rounded-2xl border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/8 p-5 flex items-center">
          <p className="text-[14px] font-semibold text-[var(--color-fg-strong)] leading-snug">{t.moat}</p>
        </div>
      </div>

      {/* Lista "Nunca vuelves a..." */}
      <ul className="mt-10 flex flex-col gap-3 max-w-[520px] mx-auto">
        {t.neverAgain.map((item) => (
          <li key={item} className="flex items-start gap-3 text-[16px] text-[var(--color-fg-muted)]">
            <span className="mt-0.5 text-[var(--color-ok)] font-bold shrink-0">✓</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>

      {/* Quote de cierre */}
      <blockquote className="mt-16 text-center max-w-2xl mx-auto">
        <p
          className="text-[var(--color-fg-muted)] leading-snug"
          style={{ fontSize: "clamp(1.125rem, 2.5vw, 1.5rem)" }}
        >
          {lang === "es" ? (
            <>Mientras otras plataformas terminan conversaciones, <strong className="text-[var(--color-fg-strong)]">TerminalSync termina proyectos.</strong></>
          ) : (
            <>While other platforms end conversations, <strong className="text-[var(--color-fg-strong)]">TerminalSync finishes projects.</strong></>
          )}
        </p>
      </blockquote>

      {/* Bloque WhatsApp / Telegram — 2 columnas desktop */}
      <div className="mt-16 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Columna izquierda: texto */}
          <div className="p-8 md:p-10 flex flex-col justify-center">
            <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--color-accent)]">
              {t.whatsapp.eyebrow}
            </span>
            <h3
              className="mt-3 font-semibold tracking-tight text-[var(--color-fg-strong)] leading-[1.1]"
              style={{ fontSize: "clamp(1.375rem, 3vw, 1.875rem)" }}
            >
              {t.whatsapp.title}
            </h3>
            <p className="mt-3 text-[15px] text-[var(--color-fg-muted)] leading-relaxed">
              {t.whatsapp.body}
            </p>
            <ul className="mt-5 flex flex-col gap-2.5">
              {t.whatsapp.bullets.map((b) => (
                <li key={b} className="flex items-start gap-2 text-[14px] text-[var(--color-fg-muted)]">
                  <span className="mt-0.5 text-[var(--color-ok)] font-bold shrink-0">→</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna derecha: demo iframe con overlay borroso */}
          <div className="relative bg-[var(--color-panel-2)] min-h-[280px] md:min-h-0 border-t md:border-t-0 md:border-l border-[var(--color-border)]">
            {/* Preview borrosa */}
            <iframe
              src={`/demos/demo-mensajeria.html?lang=${lang}&embed=1`}
              title={t.whatsapp.title}
              className="absolute inset-0 w-full h-full border-0"
              style={{ filter: "blur(8px)", transform: "scale(1.05)", pointerEvents: "none" }}
              loading="lazy"
            />
            {/* Overlay + botón */}
            <button
              type="button"
              onClick={() => setDemoOpen(true)}
              className="absolute inset-0 z-10 flex items-center justify-center cursor-zoom-in"
              style={{
                background: "color-mix(in srgb, var(--color-bg) 75%, transparent)",
                backdropFilter: "blur(4px)",
              }}
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent)] text-white px-5 py-2.5 text-[13px] font-medium shadow-sm">
                {t.whatsapp.watchDemo}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox del demo mensajería */}
      {demoOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setDemoOpen(false); }}
        >
          <div className="relative w-full max-w-4xl bg-[var(--color-panel)] rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--color-border)]">
              <span className="text-[17px] font-semibold text-[var(--color-fg-strong)]">
                {t.whatsapp.title}
              </span>
              <button
                type="button"
                onClick={() => setDemoOpen(false)}
                className="inline-flex items-center justify-center h-9 w-9 rounded-lg text-[var(--color-fg)] hover:bg-[var(--color-panel-2)] transition-colors"
                aria-label={t.whatsapp.closeDemo}
              >
                <X size={20} strokeWidth={2} />
              </button>
            </div>
            <iframe
              src={`/demos/demo-mensajeria.html?lang=${lang}&embed=1`}
              title={t.whatsapp.title}
              className="w-full h-[80vh] border-0 block"
            />
          </div>
        </div>
      )}
    </section>
  );
}
