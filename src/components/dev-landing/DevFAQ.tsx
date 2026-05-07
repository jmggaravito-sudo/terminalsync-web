"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { DevCopy } from "./copy";

export function DevFAQ({ copy }: { copy: DevCopy }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="mx-auto max-w-3xl px-5 md:px-6 py-20 md:py-24">
      <h2
        className="text-center font-semibold tracking-tight text-[var(--color-fg-strong)] leading-[1.1]"
        style={{ fontSize: "clamp(1.625rem, 4vw, 2.25rem)" }}
      >
        {copy.faq.title}
      </h2>
      <div className="mt-10 space-y-2.5">
        {copy.faq.items.map((item, i) => {
          const expanded = open === i;
          return (
            <article
              key={item.q}
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpen(expanded ? null : i)}
                aria-expanded={expanded}
                className="flex items-center justify-between gap-4 w-full text-left p-5 transition-colors hover:bg-[var(--color-panel-2)]"
              >
                <span className="text-[15px] font-semibold text-[var(--color-fg-strong)]">
                  {item.q}
                </span>
                <ChevronDown
                  size={18}
                  className={`shrink-0 text-[var(--color-fg-muted)] transition-transform ${
                    expanded ? "rotate-180" : ""
                  }`}
                />
              </button>
              {expanded && (
                <div className="px-5 pb-5 text-[14px] text-[var(--color-fg-muted)] leading-relaxed">
                  {item.a}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
