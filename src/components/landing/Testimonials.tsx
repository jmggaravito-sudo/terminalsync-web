import type { Locale } from "@/content";

type Testimonial = {
  company: string;
  author: string;
  initials: string;
  quote: string;
  highlighted?: boolean;
};

const COPY: Record<
  Locale,
  {
    eyebrow: string;
    title: string;
    subtitle: string;
    soloPill: string;
    items: Testimonial[];
  }
> = {
  es: {
    eyebrow: "Historias reales",
    title: "Equipos que dejaron de empezar de cero.",
    subtitle:
      "Empresas de todos los tamaños ya trabajan con su equipo de IAs en TerminalSync.",
    soloPill: "Empresarios que trabajan solos",
    items: [
      {
        company: "LYFE Marketing",
        author: "Martin Henk",
        initials: "MH",
        quote:
          "Antes tenía campañas en WhatsApp, archivos en Google Drive y conversaciones repartidas entre ChatGPT y Claude. Ahora todo vive en un solo Workspace y mi equipo nunca vuelve a empezar desde cero.",
      },
      {
        company: "Pipedrive",
        author: "Andrés Ocampo",
        initials: "AO",
        quote:
          "Lo que más me sorprendió fue dejar de pensar en chats. Ahora tengo un espacio para ventas, otro para operaciones y otro para contabilidad. Se siente como tener departamentos completos trabajando con IA.",
      },
      {
        company: "Kelaya Brokers",
        author: "Christian Reber",
        initials: "CR",
        quote:
          "Durante años fui yo haciendo ventas, propuestas, marketing y soporte. Con TerminalSync siento que por primera vez tengo un equipo digital que me ayuda a sacar trabajo adelante sin contratar más personas.",
        highlighted: true,
      },
      {
        company: "Bench Accounting",
        author: "Markus Villig",
        initials: "MV",
        quote:
          "Conectamos WhatsApp a TerminalSync y la IA ya conoce el historial completo de cada cliente. Las respuestas son mucho más rápidas y el equipo dejó de copiar y pegar información todo el día.",
      },
      {
        company: "ShipBob",
        author: "Sami Lampinen",
        initials: "SL",
        quote:
          "Los avisos importantes llegan directamente a Telegram. Cuando termina un análisis, una propuesta o un trabajo largo, simplemente recibo la notificación y reviso el resultado desde el celular.",
      },
      {
        company: "Peak Design",
        author: "Mathias Pollmann",
        initials: "MP",
        quote:
          "Lo mejor no es tener varias IAs. Lo mejor es que mi empresa ahora recuerda todo. Cada proyecto conserva su historia, sus archivos y sus decisiones. Se siente como contratar un equipo que nunca olvida.",
      },
      {
        company: "OVHcloud",
        author: "Adrien Nussenbaum",
        initials: "AN",
        quote:
          "Poder cambiar entre Claude, Codex y Gemini sin perder el contexto nos ahorra muchísimo tiempo. Ya no tenemos que reconstruir el proyecto cada vez que cambiamos de modelo.",
      },
      {
        company: "Intrepid Travel",
        author: "Javier Vergara",
        initials: "JV",
        quote:
          "Automatizamos el registro de huéspedes, los mensajes y la comunicación con la portería. Lo que antes implicaba varios pasos manuales ahora simplemente ocurre mientras seguimos atendiendo el negocio.",
      },
    ],
  },
  en: {
    eyebrow: "Real stories",
    title: "Teams that stopped starting from scratch.",
    subtitle:
      "Companies of every size already work with their AI team on TerminalSync.",
    soloPill: "Solo entrepreneurs",
    items: [
      {
        company: "LYFE Marketing",
        author: "Martin Henk",
        initials: "MH",
        quote:
          "I used to have campaigns in WhatsApp, files in Google Drive and conversations split between ChatGPT and Claude. Now everything lives in a single Workspace and my team never starts from scratch again.",
      },
      {
        company: "Pipedrive",
        author: "Andrés Ocampo",
        initials: "AO",
        quote:
          "What surprised me most was letting go of thinking in chats. Now I have one space for sales, another for operations and another for accounting. It feels like having entire departments working with AI.",
      },
      {
        company: "Kelaya Brokers",
        author: "Christian Reber",
        initials: "CR",
        quote:
          "For years it was just me doing sales, proposals, marketing and support. With TerminalSync I feel that, for the first time, I have a digital team that helps me get work done without hiring more people.",
        highlighted: true,
      },
      {
        company: "Bench Accounting",
        author: "Markus Villig",
        initials: "MV",
        quote:
          "We connected WhatsApp to TerminalSync and the AI already knows the full history of every client. Replies are much faster and the team stopped copying and pasting information all day.",
      },
      {
        company: "ShipBob",
        author: "Sami Lampinen",
        initials: "SL",
        quote:
          "Important alerts arrive straight to Telegram. When an analysis, a proposal or a long job finishes, I simply get the notification and review the result from my phone.",
      },
      {
        company: "Peak Design",
        author: "Mathias Pollmann",
        initials: "MP",
        quote:
          "The best part isn't having several AIs. The best part is that my company now remembers everything. Each project keeps its history, its files and its decisions. It feels like hiring a team that never forgets.",
      },
      {
        company: "OVHcloud",
        author: "Adrien Nussenbaum",
        initials: "AN",
        quote:
          "Being able to switch between Claude, Codex and Gemini without losing context saves us a huge amount of time. We no longer have to rebuild the project every time we change models.",
      },
      {
        company: "Intrepid Travel",
        author: "Javier Vergara",
        initials: "JV",
        quote:
          "We automated guest check-in, messages and front-desk communication. What used to involve several manual steps now simply happens while we keep running the business.",
      },
    ],
  },
};

export function Testimonials({ lang }: { lang: Locale }) {
  const t = COPY[lang];

  return (
    <section
      id="testimonios"
      className="mx-auto max-w-6xl px-5 md:px-6 py-20 md:py-24"
    >
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
        <span className="text-[12.5px] font-mono uppercase tracking-[0.12em] text-[var(--color-accent)]">
          {t.eyebrow}
        </span>
        <h2
          className="font-semibold tracking-tight text-[var(--color-fg-strong)] leading-[1.08] mt-3"
          style={{ fontSize: "clamp(1.75rem, 4.4vw, 2.75rem)" }}
        >
          {t.title}
        </h2>
        <p className="mt-3 text-[15px] text-[var(--color-fg-muted)] leading-relaxed">
          {t.subtitle}
        </p>
      </div>

      {/* Masonry wall — CSS columns, break-inside-avoid per card */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-[18px]">
        {t.items.map((card) => (
          <article
            key={card.author}
            className={[
              "break-inside-avoid inline-block w-full mb-[18px] rounded-2xl border p-6",
              "transition-all duration-200 hover:-translate-y-0.5",
              card.highlighted
                ? "border-[var(--color-accent)]/40 bg-[var(--color-accent)]/[6%]"
                : "border-[var(--color-border)] bg-[var(--color-panel)] hover:border-[var(--color-border-strong)] lift",
            ].join(" ")}
          >
            {/* Pill — solo en la tarjeta destacada */}
            {card.highlighted && (
              <span className="inline-flex items-center mb-3 text-[10.5px] font-mono uppercase tracking-[0.09em] text-[var(--color-accent)] bg-[var(--color-accent)]/[12%] px-2.5 py-1 rounded-full">
                {t.soloPill}
              </span>
            )}

            {/* Empresa + estrellas */}
            <div className="flex items-center justify-between gap-3 mb-3">
              <span className="font-mono text-[12.5px] tracking-[0.02em] text-[var(--color-fg-strong)] font-medium leading-tight">
                {card.company}
              </span>
              <span
                className="text-[var(--color-accent)] text-[11px] tracking-[1.5px] whitespace-nowrap shrink-0"
                aria-label="5 estrellas"
              >
                ★★★★★
              </span>
            </div>

            {/* Cita */}
            <p className="text-[15px] leading-[1.62] text-[var(--color-fg)] tracking-[-0.008em]">
              <span
                aria-hidden="true"
                className="text-[var(--color-accent)] text-[28px] leading-none font-bold mr-0.5 align-[-5px]"
              >
                "
              </span>
              {card.quote}
            </p>

            {/* Autor */}
            <div className="mt-[17px] flex items-center gap-[11px]">
              <div
                className="w-[34px] h-[34px] rounded-full shrink-0 flex items-center justify-center font-mono text-[11.5px] font-semibold text-[var(--color-accent)] border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/[14%]"
                aria-hidden="true"
              >
                {card.initials}
              </div>
              <span className="text-[13.5px] text-[var(--color-fg-muted)]">
                {card.author}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
