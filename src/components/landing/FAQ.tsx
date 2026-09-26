"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { PublicFaqItem } from "@/content/faq";

type FaqCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
};

// Accordion-style FAQ. The page passes only the public FAQ projection so
// editorial evidence never crosses the client boundary.

export function FAQ({
  copy,
  items,
}: {
  copy: FaqCopy;
  items: readonly PublicFaqItem[];
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="scroll-mt-20 mx-auto max-w-3xl px-5 md:px-6 py-20 md:py-24"
    >
      <div className="text-center max-w-2xl mx-auto">
        <span className="inline-flex items-center text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--color-fg-muted)] border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-1 rounded-full">
          {copy.eyebrow}
        </span>
        <h2
          className="mt-4 font-semibold tracking-tight text-[var(--color-fg-strong)] leading-[1.08]"
          style={{ fontSize: "clamp(1.625rem, 4vw, 2.5rem)" }}
        >
          {copy.title}
        </h2>
        <p className="mt-3 text-[14.5px] text-[var(--color-fg-muted)] leading-relaxed">
          {copy.subtitle}
        </p>
      </div>

      <div className="mt-10 space-y-3">
        {items.map((item, idx) => {
          const open = openIndex === idx;
          return (
            <div
              key={item.id}
              className={`rounded-2xl border bg-[var(--color-panel)] transition-colors ${
                open
                  ? "border-[var(--color-accent)]/40"
                  : "border-[var(--color-border)] hover:border-[var(--color-fg-dim)]"
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(open ? null : idx)}
                aria-expanded={open}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="text-[14.5px] font-semibold text-[var(--color-fg-strong)] leading-snug">
                  {item.question}
                </span>
                <ChevronDown
                  size={18}
                  strokeWidth={2.2}
                  className={`shrink-0 text-[var(--color-fg-muted)] transition-transform ${
                    open ? "rotate-180 text-[var(--color-accent)]" : ""
                  }`}
                />
              </button>
              {open ? (
                <div className="px-5 pb-5 pt-0 text-[13.5px] text-[var(--color-fg-muted)] leading-relaxed">
                  {item.answer}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
