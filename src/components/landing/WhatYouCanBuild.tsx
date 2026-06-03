import { Square, ArrowRight } from "lucide-react";
import type { Locale } from "@/content";

/**
 * §04 "Lo que puedes resolver" — bloque ★CRÍTICO. Tarjetas lideradas por el
 * RESULTADO (no la herramienta); la categoría va como sub-label callado.
 * Bilingüe (ES neutro / EN).
 */
const T = {
  es: {
    eyebrow: "Qué puedes construir",
    title: "Construye lo que tu negocio necesita",
    subtitle: "Lo describes con tus palabras. La IA lo construye. Y lo ves al instante.",
    closing: "Y lo ves apareciendo dentro de TerminalSync — no solo lo que la IA dijo.",
    ctaPrimary: "Empieza gratis",
    ctaSecondary: "Míralo hecho",
    outcomes: [
      { outcome: "Nunca olvides hacerle seguimiento a un cliente", category: "sistema de seguimiento" },
      { outcome: "Ten todo de cada cliente en un solo lugar", category: "ficha de clientes" },
      { outcome: "Mira de un vistazo cómo va tu negocio", category: "dashboard" },
      { outcome: "Recibe pedidos y solicitudes sin caos de correos", category: "sistema de intake" },
      { outcome: "Dale a cada cliente su propio portal", category: "portal de clientes" },
      { outcome: "Automatiza esa tarea que te come la semana", category: "automatización" },
      { outcome: "Cobra y haz seguimiento a tus pagos", category: "facturación y recordatorios" },
      { outcome: "Convierte una conversación en una propuesta", category: "propuestas" },
    ],
  },
  en: {
    eyebrow: "What you can build",
    title: "Build what your business actually needs",
    subtitle: "You describe it in your words. The AI builds it. And you see it instantly.",
    closing: "And you watch it appear inside TerminalSync — not just what the AI said.",
    ctaPrimary: "Start free",
    ctaSecondary: "See it done",
    outcomes: [
      { outcome: "Never forget to follow up with a customer", category: "follow-up system" },
      { outcome: "Keep everything about each client in one place", category: "client records" },
      { outcome: "See how your business is doing at a glance", category: "dashboard" },
      { outcome: "Take in requests and orders without email chaos", category: "intake system" },
      { outcome: "Give each client their own portal", category: "client portal" },
      { outcome: "Automate that task that eats your week", category: "automation" },
      { outcome: "Collect and track your payments", category: "billing & reminders" },
      { outcome: "Turn a conversation into a proposal", category: "proposals" },
    ],
  },
} as const;

export function WhatYouCanBuild({ lang }: { lang: Locale }) {
  const t = T[lang];
  return (
    <section id="what-you-can-build" className="mx-auto max-w-3xl px-5 md:px-6 py-20 md:py-24">
      <div className="text-center">
        <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--color-accent)]">
          {t.eyebrow}
        </span>
        <h2
          className="mt-3 font-semibold tracking-tight text-[var(--color-fg-strong)] leading-[1.08]"
          style={{ fontSize: "clamp(1.75rem, 4.5vw, 2.75rem)" }}
        >
          {t.title}
        </h2>
        <p className="mt-3 text-[16px] text-[var(--color-fg-muted)] leading-relaxed">{t.subtitle}</p>
      </div>

      <ul className="mt-10 flex flex-col gap-3">
        {t.outcomes.map((o) => (
          <li
            key={o.outcome}
            className="flex items-start gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] px-5 py-4 transition-colors hover:border-[var(--color-accent)]/40"
          >
            <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
              <Square size={16} strokeWidth={2.2} />
            </span>
            <span>
              <span className="block text-[16px] font-semibold text-[var(--color-fg-strong)] leading-snug">
                {o.outcome}
              </span>
              <span className="mt-0.5 block text-[13.5px] text-[var(--color-fg-dim)]">{o.category}</span>
            </span>
          </li>
        ))}

        <li className="flex items-center gap-3 rounded-2xl border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/8 px-5 py-4 text-center justify-center">
          <Square size={16} strokeWidth={2.2} className="shrink-0 text-[var(--color-accent)]" />
          <span className="text-[15px] font-semibold text-[var(--color-accent)]">{t.closing}</span>
        </li>
      </ul>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <a
          href="/api/download"
          data-cta="build-primary"
          className="inline-flex items-center gap-2 rounded-2xl bg-[var(--color-accent)] px-5 py-3 text-[14px] font-semibold text-white transition-all glow-accent hover:-translate-y-px hover:bg-[var(--color-accent-soft)]"
        >
          {t.ctaPrimary}
        </a>
        <a
          href="#visible-results"
          className="inline-flex items-center gap-1.5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] px-5 py-3 text-[14px] font-semibold text-[var(--color-fg)] transition-colors hover:border-[var(--color-accent)]/40"
        >
          {t.ctaSecondary}
          <ArrowRight size={15} strokeWidth={2.2} />
        </a>
      </div>
    </section>
  );
}
