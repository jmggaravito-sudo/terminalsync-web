import { ArrowRight, ShieldCheck } from "lucide-react";
import type { Locale } from "@/content";

/**
 * §06 Continuidad inteligente — sección DEDICADA. Lidera con el beneficio,
 * sin jerga ni el nombre interno. Bilingüe (ES neutro / EN).
 */
const T = {
  es: {
    eyebrow: "Continuidad",
    title: "Cuando una IA se detiene, otra continúa.",
    subtitle:
      "Tu trabajo no se detiene. Si una IA llega a su límite o falla, TerminalSync lo nota, pasa a otra y sigue donde ibas — con todo tu contexto. Nunca te quedas trabado.",
    relayFrom: "IA #1 llega a su límite",
    relayTo: "IA #2 continúa sola",
    moat: "Una herramienta de una sola IA no puede hacer esto. TerminalSync no depende de ninguna — por eso tu trabajo nunca choca contra una pared.",
    behaviors: [
      { title: "Se da cuenta cuando una IA se traba", body: "Detecta cuando una IA llega a su límite, se cae o deja de responder — sin que tengas que estar mirando." },
      { title: "Cambia a otra IA por ti", body: "Pasa el trabajo a otra IA disponible automáticamente. Tú no tienes que hacer nada." },
      { title: "Lleva tu contexto con ella", body: "La IA que continúa retoma con todo lo que ya sabías: el proyecto, las decisiones, dónde ibas." },
      { title: "Sigue donde quedaste", body: "No empieza de cero. Continúa la tarea exactamente en el punto en que se cortó." },
      { title: "Tus preferencias te siguen", body: "Tu tono, tus reglas y tu forma de trabajar quedan intactas, sin importar qué IA esté al volante." },
    ],
  },
  en: {
    eyebrow: "Continuity",
    title: "When one AI stops, another continues.",
    subtitle:
      "Your work never stops. If an AI hits its limit or fails, TerminalSync notices, switches to another and keeps going where you were — with all your context. You never get stuck.",
    relayFrom: "AI #1 hits its limit",
    relayTo: "AI #2 continues on its own",
    moat: "A single-AI tool can't do this. TerminalSync doesn't depend on any one of them — that's why your work never hits a wall.",
    behaviors: [
      { title: "It notices when an AI gets stuck", body: "Detects when an AI hits its limit, goes down or stops responding — without you watching." },
      { title: "It switches to another AI for you", body: "Hands the work to another available AI automatically. You don't have to do anything." },
      { title: "It carries your context along", body: "The AI that continues picks up with everything you already had: the project, the decisions, where you were." },
      { title: "It keeps going where you left off", body: "It doesn't start over. It continues the task at the exact point it was cut off." },
      { title: "Your preferences follow you", body: "Your tone, your rules and your way of working stay intact, no matter which AI is at the wheel." },
    ],
  },
} as const;

export function Continuity({ lang }: { lang: Locale }) {
  const t = T[lang];
  return (
    <section id="continuity" className="mx-auto max-w-5xl px-5 md:px-6 py-14 md:py-24">
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
    </section>
  );
}
