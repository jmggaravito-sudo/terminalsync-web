"use client";

import { useState, useId } from "react";
import { HelpCircle } from "lucide-react";

/**
 * Small "?" icon that reveals a tooltip on hover (desktop) or tap (mobile).
 *
 * Uses `useState` instead of pure CSS so a tap on touch devices opens the
 * tooltip without leaving it stuck on screen forever. A second tap, a tap
 * outside, or losing focus closes it.
 *
 * Designed to be used inline next to a row label in dense tables, so it's
 * intentionally tiny (12px icon) and the tooltip is absolutely positioned
 * above-right of the trigger so it never pushes the row layout around.
 */
export function HelpTip({
  text,
  ariaLabel = "More info",
}: {
  text: string;
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const tipId = useId();

  return (
    <span
      className="relative inline-flex align-middle ml-1.5"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        onBlur={() => setOpen(false)}
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-describedby={open ? tipId : undefined}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[var(--color-fg-dim)] hover:text-[var(--color-accent)] focus:text-[var(--color-accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/40 transition-colors"
      >
        <HelpCircle size={12} strokeWidth={2.4} aria-hidden="true" />
      </button>

      {open ? (
        <span
          id={tipId}
          role="tooltip"
          className="absolute bottom-full left-1/2 z-30 mb-2 w-64 max-w-[80vw] -translate-x-1/2 rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-2)]/95 px-3 py-2 text-[12px] leading-relaxed text-[var(--color-fg)] shadow-xl backdrop-blur-sm pointer-events-none"
        >
          {text}
          {/* small arrow pointing down to the icon */}
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-1/2 rotate-45 h-2 w-2 border-b border-r border-[var(--color-border)] bg-[var(--color-panel-2)]/95"
          />
        </span>
      ) : null}
    </span>
  );
}
