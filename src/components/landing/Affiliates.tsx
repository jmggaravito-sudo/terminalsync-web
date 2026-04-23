import Link from "next/link";
import {
  HandCoins,
  Infinity as InfinityIcon,
  Package,
  ArrowRight,
  ScrollText,
} from "lucide-react";
import type { Dict } from "@/content";

export function Affiliates({ dict }: { dict: Dict }) {
  const lang = dict.locale;
  const perks = [
    { Icon: HandCoins, key: "recurring" as const },
    { Icon: InfinityIcon, key: "lifetime" as const },
    { Icon: Package, key: "assets" as const },
  ];
  return (
    <section id="affiliates" className="mx-auto max-w-6xl px-5 md:px-6 pb-20 md:pb-24">
      <div className="relative rounded-3xl overflow-hidden border border-[var(--color-accent)]/25 bg-gradient-to-br from-[var(--color-accent)]/8 via-[var(--color-info)]/6 to-transparent p-8 md:p-12 lift">
        <div className="grid md:grid-cols-[1.3fr_1fr] gap-10 items-center">
          <div>
            <span className="inline-block text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--color-accent)] font-semibold">
              {dict.affiliates.kicker}
            </span>
            <h2
              className="mt-3 font-semibold tracking-tight text-[var(--color-fg-strong)] leading-[1.1]"
              style={{ fontSize: "clamp(1.5rem, 3.4vw, 2.125rem)" }}
            >
              {dict.affiliates.title}
            </h2>
            <p className="mt-3 text-[14px] md:text-[15px] text-[var(--color-fg-muted)] leading-relaxed max-w-lg">
              {dict.affiliates.body}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="#"
                className="inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-[13px] font-semibold text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] glow-accent transition-all hover:-translate-y-px"
              >
                {dict.affiliates.cta}
                <ArrowRight size={14} strokeWidth={2.4} />
              </a>
              <Link
                href={`/${lang}/legal/affiliates`}
                className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--color-fg-muted)] hover:text-[var(--color-fg-strong)] transition-colors"
              >
                <ScrollText size={13} strokeWidth={2} />
                {dict.legal.affiliates.readFullTerms}
              </Link>
            </div>
          </div>

          <ul className="space-y-2.5">
            {perks.map(({ Icon, key }) => (
              <li
                key={key}
                className="flex items-center gap-3 rounded-xl bg-[var(--color-panel)] border border-[var(--color-border)] px-4 py-3"
              >
                <div className="h-9 w-9 rounded-lg bg-[var(--color-accent)]/10 text-[var(--color-accent)] flex items-center justify-center shrink-0">
                  <Icon size={16} strokeWidth={2.2} />
                </div>
                <span className="text-[13.5px] font-medium text-[var(--color-fg-strong)]">
                  {dict.affiliates.perks[key]}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
