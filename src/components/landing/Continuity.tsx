import { ArrowRight, ShieldCheck } from "lucide-react";
import type { Locale } from "@/content";

/**
 * §06 Continuidad inteligente — sección DEDICADA. Lidera con el beneficio,
 * sin jerga ni el nombre interno. Bilingüe (ES neutro / EN).
 */
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
      { title: "Cambia a otra IA por ti", body: "Pasa el trabajo a otra IA disponible automáticamente. Tú no tienes que hacer nada." },
      { title: "Lleva tu contexto con ella", body: "La IA que continúa retoma con todo lo que ya sabías: el proyecto, las decisiones, dónde ibas." },
      { title: "Sigue donde quedaste", body: "No empieza de cero. Continúa la tarea exactamente en el punto en que se cortó." },
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
      { title: "It switches to another AI for you", body: "Hands the work to another available AI automatically. You don't have to do anything." },
      { title: "It carries your context along", body: "The AI that continues picks up with everything you already had: the project, the decisions, where you were." },
      { title: "It keeps going where you left off", body: "It doesn't start over. It continues the task at the exact point it was cut off." },
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
    },
  },
} as const;

export function Continuity({ lang }: { lang: Locale }) {
  const t = T[lang];
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
      <ul className="mt-10 flex flex-col sm:flex-row flex-wrap justify-center gap-x-8 gap-y-3">
        {t.neverAgain.map((item) => (
          <li key={item} className="flex items-start gap-2 text-[14.5px] text-[var(--color-fg-muted)]">
            <span className="mt-0.5 text-[var(--color-ok)] font-bold">✓</span>
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
          &ldquo;<strong className="text-[var(--color-fg-strong)]">{t.quote}</strong>&rdquo;
        </p>
      </blockquote>

      {/* Bloque WhatsApp / Telegram */}
      <div className="mt-16 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-8 md:p-10">
        <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--color-accent)]">
          {t.whatsapp.eyebrow}
        </span>
        <h3
          className="mt-3 font-semibold tracking-tight text-[var(--color-fg-strong)] leading-[1.1]"
          style={{ fontSize: "clamp(1.375rem, 3vw, 1.875rem)" }}
        >
          {t.whatsapp.title}
        </h3>
        <p className="mt-3 text-[15px] text-[var(--color-fg-muted)] leading-relaxed max-w-xl">
          {t.whatsapp.body}
        </p>
        <ul className="mt-5 flex flex-col gap-2">
          {t.whatsapp.bullets.map((b) => (
            <li key={b} className="flex items-start gap-2 text-[14px] text-[var(--color-fg-muted)]">
              <span className="mt-0.5 text-[var(--color-ok)] font-bold">✓</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
        <div className="mt-8 rounded-xl overflow-hidden border border-[var(--color-border)]" style={{ height: "360px" }}>
          <iframe
            src={`/demos/demo-mensajeria.html?lang=${lang}&embed=1`}
            title={t.whatsapp.title}
            className="w-full h-full"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
