import { Megaphone, Handshake, Settings2, LifeBuoy, BarChart3, PenLine, ArrowRight } from "lucide-react";

/**
 * §08 Especialistas (Capabilities) — pilar "razón para crecer". Cierra el
 * arco believe (Workforce → Continuity → Memory → Visible Results →
 * Capabilities). NO se llama "marketplace": se encuadra como equipar a tu
 * equipo de IAs con experiencia lista para usar. El moat: lo instalas una
 * vez y funciona con cualquier IA (cross-provider).
 *
 * Copy ES neutro inline (pre-i18n).
 */

const SPECIALISTS: { icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>; title: string; body: string }[] = [
  { icon: Megaphone, title: "Especialista en marketing", body: "Campañas, contenido y seguimiento que no se detiene." },
  { icon: Handshake, title: "Especialista en ventas", body: "Responde, califica y da seguimiento a cada lead." },
  { icon: Settings2, title: "Especialista en operaciones", body: "Ordena procesos, tareas y reportes repetitivos." },
  { icon: LifeBuoy, title: "Especialista en soporte", body: "Atiende las preguntas de siempre, al instante." },
  { icon: BarChart3, title: "Especialista en datos", body: "Convierte números sueltos en decisiones." },
  { icon: PenLine, title: "Especialista en contenido", body: "Escribe en tu voz y a tu ritmo." },
];

export function Capabilities() {
  return (
    <section id="capabilities" className="mx-auto max-w-5xl px-5 md:px-6 py-20 md:py-24">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--color-accent)]">
          Especialistas
        </span>
        <h2
          className="mt-3 font-semibold tracking-tight text-[var(--color-fg-strong)] leading-[1.08]"
          style={{ fontSize: "clamp(1.75rem, 4.5vw, 2.75rem)" }}
        >
          Equipa a tu equipo con especialistas
        </h2>
        <p className="mt-4 text-[16px] text-[var(--color-fg-muted)] leading-relaxed">
          Instala experiencia lista para usar — marketing, ventas, operaciones — y tu
          equipo de IAs crece contigo.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SPECIALISTS.map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5 transition-colors hover:border-[var(--color-accent)]/40"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
              <Icon size={18} strokeWidth={2} />
            </span>
            <h3 className="mt-3 text-[15px] font-semibold text-[var(--color-fg-strong)]">{title}</h3>
            <p className="mt-1.5 text-[13.5px] text-[var(--color-fg-muted)] leading-relaxed">{body}</p>
          </div>
        ))}
      </div>

      {/* El moat, sin jerga: portabilidad cross-provider */}
      <p className="mt-8 text-center text-[15px] font-semibold text-[var(--color-fg-strong)]">
        Lo instalas una vez y funciona con cualquier IA — Claude, Codex o Gemini.
      </p>

      <div className="mt-7 text-center">
        <a
          href="/skills"
          data-cta="capabilities-primary"
          className="inline-flex items-center gap-1.5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] px-5 py-3 text-[14px] font-semibold text-[var(--color-fg)] transition-colors hover:border-[var(--color-accent)]/40"
        >
          Explora los especialistas
          <ArrowRight size={15} strokeWidth={2.2} />
        </a>
      </div>
    </section>
  );
}
