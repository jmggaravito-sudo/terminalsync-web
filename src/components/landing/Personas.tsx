import { Plane, Sparkles, Users } from "lucide-react";
import type { Dict } from "@/content";

export function Personas({ dict }: { dict: Dict }) {
  const items = [
    {
      key: "nomad" as const,
      Icon: Plane,
      tintBg: "bg-[var(--color-accent)]/12",
      tintFg: "text-[var(--color-accent)]",
    },
    {
      key: "beginner" as const,
      Icon: Sparkles,
      tintBg: "bg-[var(--color-claude)]/12",
      tintFg: "text-[var(--color-claude)]",
    },
    {
      key: "agency" as const,
      Icon: Users,
      tintBg: "bg-[var(--color-ok)]/12",
      tintFg: "text-[var(--color-ok)]",
    },
  ];

  return (
    <section className="bg-[var(--color-panel-2)]/40 py-20 md:py-24">
      <div className="mx-auto max-w-6xl px-5 md:px-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2
            className="font-semibold tracking-tight text-[var(--color-fg-strong)] leading-[1.08]"
            style={{ fontSize: "clamp(1.625rem, 4vw, 2.5rem)" }}
          >
            {dict.personas.title}
          </h2>
          <p className="mt-3 text-[15px] text-[var(--color-fg-muted)]">
            {dict.personas.subtitle}
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
          {items.map(({ key, Icon, tintBg, tintFg }) => (
            <article
              key={key}
              className="lift rounded-2xl bg-[var(--color-panel)] border border-[var(--color-border)] p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className={`h-11 w-11 rounded-xl flex items-center justify-center ${tintBg} ${tintFg}`}
                >
                  <Icon size={20} strokeWidth={2.2} />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--color-fg-muted)] border border-[var(--color-border)] rounded-full px-2 py-0.5">
                  {dict.personas.items[key].tag}
                </span>
              </div>
              <h3 className="mt-5 text-[17px] font-semibold tracking-tight text-[var(--color-fg-strong)]">
                {dict.personas.items[key].title}
              </h3>
              <p className="mt-2 text-[13.5px] text-[var(--color-fg-muted)] leading-relaxed">
                {dict.personas.items[key].body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
