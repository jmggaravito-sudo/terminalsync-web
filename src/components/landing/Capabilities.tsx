import { Megaphone, Handshake, Settings2, LifeBuoy, BarChart3, PenLine, ArrowRight } from "lucide-react";
import type { Locale } from "@/content";

/**
 * §08 Especialistas (Capabilities) — pilar "razón para crecer". Cierra el
 * arco believe. NO se llama "marketplace": equipar tu equipo de IAs con
 * experiencia lista. Moat: una vez, cualquier IA. Bilingüe.
 */
const ICONS = [Megaphone, Handshake, Settings2, LifeBuoy, BarChart3, PenLine];

const T = {
  es: {
    eyebrow: "Especialistas",
    title: "Equipa a tu equipo con especialistas",
    subtitle: "Instala experiencia lista para usar — marketing, ventas, operaciones — y tu equipo de IAs crece contigo.",
    moat: "Lo instalas una vez y funciona con cualquier IA — Claude, Codex o Gemini.",
    cta: "Explora los especialistas",
    items: [
      { title: "Especialista en marketing", body: "Campañas, contenido y seguimiento que no se detiene." },
      { title: "Especialista en ventas", body: "Responde, califica y da seguimiento a cada lead." },
      { title: "Especialista en operaciones", body: "Ordena procesos, tareas y reportes repetitivos." },
      { title: "Especialista en soporte", body: "Atiende las preguntas de siempre, al instante." },
      { title: "Especialista en datos", body: "Convierte números sueltos en decisiones." },
      { title: "Especialista en contenido", body: "Escribe en tu voz y a tu ritmo." },
    ],
  },
  en: {
    eyebrow: "Specialists",
    title: "Equip your team with specialists",
    subtitle: "Install ready-made expertise — marketing, sales, operations — and your AI team grows with you.",
    moat: "Install it once and it works with any AI — Claude, Codex or Gemini.",
    cta: "Explore the specialists",
    items: [
      { title: "Marketing specialist", body: "Campaigns, content and follow-up that never stops." },
      { title: "Sales specialist", body: "Replies, qualifies and follows up on every lead." },
      { title: "Operations specialist", body: "Tidies up processes, tasks and repetitive reports." },
      { title: "Support specialist", body: "Handles the usual questions, instantly." },
      { title: "Data specialist", body: "Turns scattered numbers into decisions." },
      { title: "Content specialist", body: "Writes in your voice and at your pace." },
    ],
  },
} as const;

export function Capabilities({ lang }: { lang: Locale }) {
  const t = T[lang];
  return (
    <section id="capabilities" className="mx-auto max-w-5xl px-5 md:px-6 py-20 md:py-24">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--color-accent)]">
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

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {t.items.map((it, i) => {
          const Icon = ICONS[i];
          return (
            <div
              key={it.title}
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5 transition-colors hover:border-[var(--color-accent)]/40"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                <Icon size={18} strokeWidth={2} />
              </span>
              <h3 className="mt-3 text-[15px] font-semibold text-[var(--color-fg-strong)]">{it.title}</h3>
              <p className="mt-1.5 text-[13.5px] text-[var(--color-fg-muted)] leading-relaxed">{it.body}</p>
            </div>
          );
        })}
      </div>

      <p className="mt-8 text-center text-[15px] font-semibold text-[var(--color-fg-strong)]">{t.moat}</p>

      <div className="mt-7 text-center">
        <a
          href="/skills"
          data-cta="capabilities-primary"
          className="inline-flex items-center gap-1.5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] px-5 py-3 text-[14px] font-semibold text-[var(--color-fg)] transition-colors hover:border-[var(--color-accent)]/40"
        >
          {t.cta}
          <ArrowRight size={15} strokeWidth={2.2} />
        </a>
      </div>
    </section>
  );
}
