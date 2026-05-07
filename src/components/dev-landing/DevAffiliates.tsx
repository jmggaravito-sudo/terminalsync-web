import { ArrowRight, DollarSign, Repeat, ShieldCheck } from "lucide-react";
import type { DevCopy } from "./copy";

const ICONS = [DollarSign, Repeat, ShieldCheck];

export function DevAffiliates({ copy }: { copy: DevCopy }) {
  return (
    <section
      id="affiliates"
      className="mx-auto max-w-6xl px-5 md:px-6 py-20 md:py-24"
    >
      <div className="rounded-3xl border border-[var(--color-accent)]/30 bg-gradient-to-br from-[var(--color-accent)]/8 via-[var(--color-info)]/4 to-transparent p-8 md:p-12">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--color-accent)] font-semibold">
            {copy.affiliates.eyebrow}
          </p>
          <h2
            className="mt-3 font-semibold tracking-tight text-[var(--color-fg-strong)] leading-[1.1]"
            style={{ fontSize: "clamp(1.5rem, 3.6vw, 2.25rem)" }}
          >
            {copy.affiliates.title}
          </h2>
          <p className="mt-4 text-[15px] text-[var(--color-fg-muted)] leading-relaxed">
            {copy.affiliates.body}
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          {copy.affiliates.items.map((item, i) => {
            const Icon = ICONS[i] ?? DollarSign;
            return (
              <article
                key={item.kicker}
                className="rounded-2xl bg-[var(--color-bg)] border border-[var(--color-border)] p-5"
              >
                <div className="h-10 w-10 rounded-xl bg-[var(--color-accent)]/12 text-[var(--color-accent)] flex items-center justify-center">
                  <Icon size={18} strokeWidth={2.2} />
                </div>
                <p className="mt-4 text-[18px] font-semibold tracking-tight text-[var(--color-fg-strong)]">
                  {item.kicker}
                </p>
                <p className="mt-1.5 text-[13px] text-[var(--color-fg-muted)] leading-relaxed">
                  {item.body}
                </p>
              </article>
            );
          })}
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="mailto:soporte@nexflowai.net?subject=Affiliate%20Application%20-%20TerminalSync"
            data-cta="dev-affiliate"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] text-white text-[13.5px] font-semibold px-6 py-3 shadow-[0_8px_24px_-10px_var(--color-accent-glow)] transition-all"
          >
            {copy.affiliates.cta}
            <ArrowRight size={14} strokeWidth={2.4} />
          </a>
        </div>
        <p className="mt-4 text-center text-[12px] font-mono uppercase tracking-[0.12em] text-[var(--color-accent)]">
          {copy.affiliates.note}
        </p>
      </div>
    </section>
  );
}
