import { Square, ArrowRight } from "lucide-react";

/**
 * §04 "Lo que puedes resolver" — bloque ★CRÍTICO del wireframe.
 *
 * Tarjetas lideradas por el RESULTADO (no por la herramienta): el título es
 * el outcome en palabras del dueño, y la categoría va como sub-label callado.
 * Regla: outcome primero, herramienta después. Mal = "CRM". Bien = "Nunca
 * olvides hacerle seguimiento a un cliente".
 *
 * Copy ES neutro inline (pre-i18n). Match del prototipo de Cowork.
 */

const OUTCOMES: { outcome: string; category: string }[] = [
  { outcome: "Nunca olvides hacerle seguimiento a un cliente", category: "sistema de seguimiento" },
  { outcome: "Ten todo de cada cliente en un solo lugar", category: "ficha de clientes" },
  { outcome: "Mira de un vistazo cómo va tu negocio", category: "dashboard" },
  { outcome: "Recibe pedidos y solicitudes sin caos de correos", category: "sistema de intake" },
  { outcome: "Dale a cada cliente su propio portal", category: "portal de clientes" },
  { outcome: "Automatiza esa tarea que te come la semana", category: "automatización" },
  { outcome: "Cobra y haz seguimiento a tus pagos", category: "facturación y recordatorios" },
  { outcome: "Convierte una conversación en una propuesta", category: "propuestas" },
];

export function WhatYouCanBuild() {
  return (
    <section id="what-you-can-build" className="mx-auto max-w-3xl px-5 md:px-6 py-20 md:py-24">
      <div className="text-center">
        <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--color-accent)]">
          Qué puedes construir
        </span>
        <h2
          className="mt-3 font-semibold tracking-tight text-[var(--color-fg-strong)] leading-[1.08]"
          style={{ fontSize: "clamp(1.75rem, 4.5vw, 2.75rem)" }}
        >
          Construye lo que tu negocio necesita
        </h2>
        <p className="mt-3 text-[16px] text-[var(--color-fg-muted)] leading-relaxed">
          Lo describes con tus palabras. La IA lo construye. Y lo ves al instante.
        </p>
      </div>

      <ul className="mt-10 flex flex-col gap-3">
        {OUTCOMES.map((o) => (
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
              <span className="mt-0.5 block text-[13.5px] text-[var(--color-fg-dim)]">
                {o.category}
              </span>
            </span>
          </li>
        ))}

        {/* Cierre — la prueba de Resultados Visibles: no solo lo que la IA dijo */}
        <li className="flex items-center gap-3 rounded-2xl border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/8 px-5 py-4 text-center justify-center">
          <Square size={16} strokeWidth={2.2} className="shrink-0 text-[var(--color-accent)]" />
          <span className="text-[15px] font-semibold text-[var(--color-accent)]">
            Y lo ves apareciendo dentro de TerminalSync — no solo lo que la IA dijo.
          </span>
        </li>
      </ul>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <a
          href="/api/download"
          data-cta="build-primary"
          className="inline-flex items-center gap-2 rounded-2xl bg-[var(--color-accent)] px-5 py-3 text-[14px] font-semibold text-white transition-all glow-accent hover:-translate-y-px hover:bg-[var(--color-accent-soft)]"
        >
          Empieza gratis
        </a>
        <a
          href="#use-cases"
          className="inline-flex items-center gap-1.5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] px-5 py-3 text-[14px] font-semibold text-[var(--color-fg)] transition-colors hover:border-[var(--color-accent)]/40"
        >
          Ver más ejemplos
          <ArrowRight size={15} strokeWidth={2.2} />
        </a>
      </div>
    </section>
  );
}
