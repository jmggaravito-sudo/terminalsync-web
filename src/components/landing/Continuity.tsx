import { ArrowRight, ShieldCheck } from "lucide-react";

/**
 * §06 Continuidad inteligente — sección DEDICADA (no feature card).
 *
 * Pilar "razón para elegir". Lidera con el beneficio, NUNCA con el nombre
 * interno ni con jerga: el visitante sale entendiendo "cuando una IA se
 * detiene, otra continúa" y, sobre todo, "mi trabajo nunca choca contra
 * una pared". Las capacidades (detección de límite, failover, transferencia
 * de contexto, continuación, preferencias) se muestran como comportamiento,
 * no como spec técnica.
 *
 * Copy ES neutro inline (pre-i18n).
 */

const BEHAVIORS: { title: string; body: string }[] = [
  {
    title: "Se da cuenta cuando una IA se traba",
    body: "Detecta cuando una IA llega a su límite, se cae o deja de responder — sin que tengas que estar mirando.",
  },
  {
    title: "Cambia a otra IA por ti",
    body: "Pasa el trabajo a otra IA disponible automáticamente. Tú no tienes que hacer nada.",
  },
  {
    title: "Lleva tu contexto con ella",
    body: "La IA que continúa retoma con todo lo que ya sabías: el proyecto, las decisiones, dónde ibas.",
  },
  {
    title: "Sigue donde quedaste",
    body: "No empieza de cero. Continúa la tarea exactamente en el punto en que se cortó.",
  },
  {
    title: "Tus preferencias te siguen",
    body: "Tu tono, tus reglas y tu forma de trabajar quedan intactas, sin importar qué IA esté al volante.",
  },
];

export function Continuity() {
  return (
    <section id="continuity" className="mx-auto max-w-5xl px-5 md:px-6 py-20 md:py-24">
      <div className="text-center max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--color-accent)]">
          <ShieldCheck size={13} strokeWidth={2.4} />
          Continuidad
        </span>
        <h2
          className="mt-3 font-semibold tracking-tight text-[var(--color-fg-strong)] leading-[1.08]"
          style={{ fontSize: "clamp(1.75rem, 4.5vw, 2.75rem)" }}
        >
          Cuando una IA se detiene, otra continúa.
        </h2>
        <p className="mt-4 text-[16px] text-[var(--color-fg-muted)] leading-relaxed">
          Tu trabajo no se detiene. Si una IA llega a su límite o falla, TerminalSync
          lo nota, pasa a otra y sigue donde ibas — con todo tu contexto. Nunca te
          quedas trabado.
        </p>
      </div>

      {/* El relevo, en una línea visual: una se detiene → otra toma la posta */}
      <div className="mt-10 flex items-center justify-center gap-3 sm:gap-5 text-[13px] font-medium">
        <span className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-3 text-[var(--color-fg-dim)] line-through decoration-[var(--color-fg-dim)]/50">
          IA #1 llega a su límite
        </span>
        <ArrowRight size={20} className="shrink-0 text-[var(--color-accent)]" />
        <span className="rounded-xl border border-[var(--color-ok)]/40 bg-[var(--color-ok)]/8 px-4 py-3 font-semibold text-[var(--color-ok)]">
          IA #2 continúa sola
        </span>
      </div>

      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {BEHAVIORS.map((b) => (
          <div
            key={b.title}
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5"
          >
            <h3 className="text-[15px] font-semibold text-[var(--color-fg-strong)]">{b.title}</h3>
            <p className="mt-1.5 text-[13.5px] text-[var(--color-fg-muted)] leading-relaxed">{b.body}</p>
          </div>
        ))}
        {/* La diferencia estructural, dicha sin jerga */}
        <div className="rounded-2xl border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/8 p-5 flex items-center">
          <p className="text-[14px] font-semibold text-[var(--color-fg-strong)] leading-snug">
            Una herramienta de una sola IA no puede hacer esto. TerminalSync no
            depende de ninguna — por eso tu trabajo nunca choca contra una pared.
          </p>
        </div>
      </div>
    </section>
  );
}
