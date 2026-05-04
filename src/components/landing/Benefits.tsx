import { ShieldCheck, Smartphone, BellRing } from "lucide-react";
import type { Dict } from "@/content";

export function Benefits({ dict }: { dict: Dict }) {
  const items = [
    {
      key: "uninterrupted" as const,
      Icon: ShieldCheck,
      tintBg: "bg-[var(--color-ok)]/12",
      tintFg: "text-[var(--color-ok)]",
    },
    {
      key: "anywhere" as const,
      Icon: Smartphone,
      tintBg: "bg-[var(--color-accent)]/12",
      tintFg: "text-[var(--color-accent)]",
    },
    {
      key: "notifications" as const,
      Icon: BellRing,
      tintBg: "bg-[var(--color-warn)]/12",
      tintFg: "text-[var(--color-warn)]",
    },
  ];

  return (
    <section
      id="features"
      className="mx-auto max-w-6xl px-5 md:px-6 py-20 md:py-24"
    >
      <div className="max-w-2xl">
        <h2
          className="font-semibold tracking-tight text-[var(--color-fg-strong)] leading-[1.08]"
          style={{ fontSize: "clamp(1.625rem, 4vw, 2.5rem)" }}
        >
          {dict.benefits.title}
        </h2>
        <p className="mt-3 text-[15px] text-[var(--color-fg-muted)]">
          {dict.benefits.subtitle}
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
        {items.map(({ key, Icon, tintBg, tintFg }) => (
          <article
            key={key}
            className="lift rounded-2xl bg-[var(--color-panel)] border border-[var(--color-border)] p-6"
          >
            <div
              className={`h-12 w-12 rounded-xl flex items-center justify-center ${tintBg} ${tintFg}`}
            >
              <Icon size={22} strokeWidth={2.2} />
            </div>
            <h3 className="mt-5 text-[17px] font-semibold tracking-tight text-[var(--color-fg-strong)]">
              {dict.benefits.items[key].title}
            </h3>
            <p className="mt-2 text-[13.5px] text-[var(--color-fg-muted)] leading-relaxed">
              {dict.benefits.items[key].body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
