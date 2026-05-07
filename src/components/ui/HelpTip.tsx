"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { HelpCircle } from "lucide-react";

/**
 * Small "?" icon that reveals a tooltip on hover (desktop) or tap (mobile).
 *
 * Implementation note: the tooltip body is rendered into a React portal
 * at `document.body` and positioned with `position: fixed` using
 * `getBoundingClientRect()` of the trigger. This is the only way to
 * guarantee the tooltip both:
 *   - escapes any ancestor `overflow-hidden` (e.g. the comparison
 *     table wrapper), and
 *   - clamps inside the viewport on small screens regardless of where
 *     the trigger sits in the row.
 *
 * Pure-CSS attempts (centered, then right-anchored) all failed for at
 * least one trigger position. Measure once on open, clamp, render.
 * JM 2026-05-07.
 */

const TOOLTIP_WIDTH = 280;
const VIEWPORT_PADDING = 12;
const GAP_FROM_TRIGGER = 8;

export function HelpTip({
  text,
  ariaLabel = "More info",
}: {
  text: string;
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    arrowLeft: number;
  } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const tipId = useId();

  // Measure the trigger and compute clamped tooltip position.
  useLayoutEffect(() => {
    if (!open) return;

    function measure() {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      const triggerCenterX = rect.left + rect.width / 2;

      // Ideal: center horizontally on trigger.
      let left = triggerCenterX - TOOLTIP_WIDTH / 2;

      // Clamp inside viewport.
      const minLeft = VIEWPORT_PADDING;
      const maxLeft = window.innerWidth - TOOLTIP_WIDTH - VIEWPORT_PADDING;
      left = Math.max(minLeft, Math.min(left, maxLeft));

      // Arrow points at the trigger center, regardless of where the
      // tooltip ended up after clamping.
      const arrowLeft = Math.max(
        12,
        Math.min(TOOLTIP_WIDTH - 12, triggerCenterX - left),
      );

      const top = rect.top - GAP_FROM_TRIGGER;
      setCoords({ top, left, arrowLeft });
    }

    measure();
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    };
  }, [open]);

  // SSR safety: createPortal needs document.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <span
      className="relative inline-flex align-middle ml-1.5"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        ref={triggerRef}
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

      {mounted && open && coords
        ? createPortal(
            <span
              id={tipId}
              role="tooltip"
              style={{
                position: "fixed",
                top: coords.top,
                left: coords.left,
                width: TOOLTIP_WIDTH,
                transform: "translateY(-100%)",
                zIndex: 100,
                pointerEvents: "none",
              }}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-2)]/95 px-3 py-2 text-[12px] leading-relaxed text-[var(--color-fg)] shadow-xl backdrop-blur-sm"
            >
              {text}
              <span
                aria-hidden="true"
                style={{ left: coords.arrowLeft - 4 }}
                className="absolute top-full -translate-y-1/2 rotate-45 h-2 w-2 border-b border-r border-[var(--color-border)] bg-[var(--color-panel-2)]/95"
              />
            </span>,
            document.body,
          )
        : null}
    </span>
  );
}
