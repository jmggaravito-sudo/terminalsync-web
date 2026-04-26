import { Check, Clock, Code2, Users, Cpu } from "lucide-react";
import type { Dict } from "@/content";

// Per-tool coverage cards — concrete answer to "what actually syncs from
// each tool I use?". Splits live features (✅) from roadmap items (🔜) so
// power users see we know the tools deeply without us overpromising.

export function ToolBreakdown({ dict }: { dict: Dict }) {
  const t = dict.toolBreakdown;
  const tools = [
    {
      key: "claudeCode" as const,
      Icon: Code2,
      tintBg: "bg-[var(--color-claude)]/10",
      tintFg: "text-[var(--color-claude)]",
    },
    {
      key: "cowork" as const,
      Icon: Users,
      tintBg: "bg-[var(--color-accent)]/10",
      tintFg: "text-[var(--color-accent)]",
    },
    {
      key: "codex" as const,
      Icon: Cpu,
      tintBg: "bg-[var(--color-info)]/10",
      tintFg: "text-[var(--color-info)]",
    },
  ];

  return (
    <section
      id="tool-breakdown"
      className="mx-auto max-w-6xl px-5 md:px-6 py-20 md:py-24"
    >
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

      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
        {tools.map(({ key, Icon, tintBg, tintFg }) => {
          const tool = t.tools[key];
          return (
            <article
              key={key}
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-6 flex flex-col"
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`h-10 w-10 rounded-xl flex items-center justify-center ${tintBg} ${tintFg}`}
                >
                  <Icon size={18} strokeWidth={2.2} />
                </div>
                <h3 className="text-[16px] font-semibold tracking-tight text-[var(--color-fg-strong)]">
                  {tool.name}
                </h3>
              </div>
              <p className="text-[12.5px] text-[var(--color-fg-muted)] leading-relaxed mb-5">
                {tool.tagline}
              </p>

              <ul className="space-y-2 mb-4">
                {tool.live.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-[13px] text-[var(--color-fg)]"
                  >
                    <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-[var(--color-ok)]/15 text-[var(--color-ok)] mt-0.5 shrink-0">
                      <Check size={9} strokeWidth={3} />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              {tool.upcoming.length > 0 ? (
                <div className="mt-auto pt-3 border-t border-dashed border-[var(--color-border)]">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--color-info)] mb-2">
                    <Clock size={10} strokeWidth={2.6} />
                    {t.upcomingLabel}
                  </div>
                  <ul className="space-y-1.5">
                    {tool.upcoming.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-[12.5px] text-[var(--color-fg-muted)]"
                      >
                        <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-[var(--color-info)]/12 text-[var(--color-info)] mt-0.5 shrink-0">
                          <Clock size={8} strokeWidth={2.6} />
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
