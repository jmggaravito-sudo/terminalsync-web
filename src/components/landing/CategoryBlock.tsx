import type { Locale } from "@/content";

const T = {
  es: {
    eyebrow: "No es otro chat",
    title: "Otra categoría: el sistema operativo del trabajo con IA.",
    subtitle:
      "Cada una de estas herramientas es buena en lo suyo. TerminalSync juega otro partido.",
    cards: [
      {
        name: "ChatGPT",
        strength: "Chat general potente",
        diff: "TerminalSync organiza trabajo persistente por espacios — no conversaciones sueltas.",
      },
      {
        name: "Claude",
        strength: "Razonamiento y escritura",
        diff: "TerminalSync evita que tu trabajo dependa de un solo límite o proveedor.",
      },
      {
        name: "Cursor",
        strength: "Programación",
        diff: "TerminalSync vive en toda la empresa, no solo en el código.",
      },
      {
        name: "Notion",
        strength: "Organización y documentos",
        diff: "TerminalSync agrega trabajadores digitales y continuidad operativa.",
      },
      {
        name: "Zapier",
        strength: "Conectar aplicaciones",
        diff: "Zapier conecta aplicaciones. TerminalSync conecta trabajo, contexto y decisiones.",
      },
    ],
  },
  en: {
    eyebrow: "Not another chat",
    title: "A different category: the operating system for AI work.",
    subtitle:
      "Each of these tools is great at its own thing. TerminalSync plays a different game.",
    cards: [
      {
        name: "ChatGPT",
        strength: "Powerful general chat",
        diff: "TerminalSync organizes persistent work in spaces — not loose conversations.",
      },
      {
        name: "Claude",
        strength: "Reasoning and writing",
        diff: "TerminalSync keeps your work from depending on a single limit or provider.",
      },
      {
        name: "Cursor",
        strength: "Coding",
        diff: "TerminalSync lives across the whole business, not just the code.",
      },
      {
        name: "Notion",
        strength: "Organization and docs",
        diff: "TerminalSync adds digital workers and operational continuity.",
      },
      {
        name: "Zapier",
        strength: "Connecting apps",
        diff: "Zapier connects apps. TerminalSync connects work, context and decisions.",
      },
    ],
  },
} as const;

export function CategoryBlock({ lang }: { lang: Locale }) {
  const t = T[lang];
  return (
    <section className="mx-auto max-w-6xl px-5 md:px-6 py-16 md:py-20">
      <div className="text-center max-w-2xl mx-auto">
        <span className="inline-flex items-center text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--color-accent)] border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 px-3 py-1 rounded-full">
          {t.eyebrow}
        </span>
        <h2
          className="mt-4 font-semibold tracking-tight text-[var(--color-fg-strong)] leading-[1.08]"
          style={{ fontSize: "clamp(1.625rem, 4vw, 2.5rem)" }}
        >
          {t.title}
        </h2>
        <p className="mt-3 text-[15px] text-[var(--color-fg-muted)] leading-relaxed">
          {t.subtitle}
        </p>
      </div>

      {/* 5 cols → 3 → 2 → 1 */}
      <div className="mt-10 grid grid-cols-1 min-[480px]:grid-cols-2 min-[680px]:grid-cols-2 min-[1020px]:grid-cols-3 xl:grid-cols-5 gap-4">
        {t.cards.map((card) => (
          <div
            key={card.name}
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5 flex flex-col gap-3"
          >
            <div>
              <div className="text-[15px] font-semibold text-[var(--color-fg-strong)]">
                {card.name}
              </div>
              <div className="mt-0.5 text-[11px] font-mono text-[var(--color-fg-dim)] uppercase tracking-[0.08em]">
                {card.strength}
              </div>
            </div>
            <div className="pt-3 border-t border-[var(--color-border)] text-[12.5px] text-[var(--color-fg-muted)] leading-relaxed">
              {card.diff}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
