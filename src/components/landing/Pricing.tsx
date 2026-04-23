import { Check } from "lucide-react";
import type { Dict } from "@/content";

export function Pricing({ dict }: { dict: Dict }) {
  const plans = [
    { key: "starter" as const, featured: false },
    { key: "pro" as const, featured: true },
    { key: "agency" as const, featured: false },
  ];

  return (
    <section id="pricing" className="mx-auto max-w-6xl px-5 md:px-6 py-20 md:py-24">
      <div className="text-center max-w-2xl mx-auto">
        <h2
          className="font-semibold tracking-tight text-[var(--color-fg-strong)] leading-[1.08]"
          style={{ fontSize: "clamp(1.625rem, 4vw, 2.5rem)" }}
        >
          {dict.pricing.title}
        </h2>
        <p className="mt-3 text-[15px] text-[var(--color-fg-muted)]">
          {dict.pricing.subtitle}
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
        {plans.map(({ key, featured }) => {
          const plan = dict.pricing.plans[key];
          const badge = "badge" in plan ? plan.badge : null;
          return (
            <article
              key={key}
              className={`relative rounded-2xl p-6 flex flex-col ${
                featured
                  ? "border-2 border-[var(--color-accent)] bg-[var(--color-panel)] shadow-floating"
                  : "lift border border-[var(--color-border)] bg-[var(--color-panel)]"
              }`}
            >
              {badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-[var(--color-accent)] text-white text-[10px] font-bold uppercase tracking-[0.12em] px-3 py-1">
                  {badge}
                </span>
              )}
              <h3 className="text-[15px] font-semibold text-[var(--color-fg-strong)]">
                {plan.name}
              </h3>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-[38px] font-semibold tracking-tight text-[var(--color-fg-strong)]">
                  {plan.price}
                </span>
                <span className="text-[12px] text-[var(--color-fg-muted)]">
                  {plan.priceNote}
                </span>
              </div>

              <ul className="mt-6 space-y-2.5 flex-1">
                {plan.features.map((feat) => (
                  <li
                    key={feat}
                    className="flex items-start gap-2 text-[13px] text-[var(--color-fg)]"
                  >
                    <Check
                      size={14}
                      className="text-[var(--color-ok)] mt-0.5 shrink-0"
                      strokeWidth={2.8}
                    />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#"
                className={`mt-7 w-full inline-flex items-center justify-center rounded-xl py-2.5 text-[13px] font-semibold transition-colors ${
                  featured
                    ? "bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] text-white shadow-[0_8px_24px_-10px_var(--color-accent-glow)]"
                    : "bg-[var(--color-panel-2)] hover:bg-[var(--color-bg)] text-[var(--color-fg)] border border-[var(--color-border)]"
                }`}
              >
                {plan.cta}
              </a>
            </article>
          );
        })}
      </div>
    </section>
  );
}
