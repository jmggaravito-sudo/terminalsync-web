"use client";

import { useEffect, useRef, useState } from "react";
import type { Dict } from "@/content";

interface Props {
  dict: Dict;
}

const SECTIONS = [
  { id: "demos", key: "demos" },
  { id: "integrations", key: "integrations" },
  { id: "meta", key: "meta" },
  { id: "files", key: "files" },
  { id: "pricing", key: "pricing" },
] as const;

type SectionKey = (typeof SECTIONS)[number]["key"];

export function SubNav({ dict }: Props) {
  const c = dict.landingB?.subNav;
  const [active, setActive] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const ids = SECTIONS.map((s) => s.id);
    const entries = new Map<string, number>();

    observerRef.current = new IntersectionObserver(
      (obs) => {
        obs.forEach((entry) => {
          entries.set(entry.target.id, entry.intersectionRatio);
        });
        let best: string | null = null;
        let bestRatio = 0;
        entries.forEach((ratio, id) => {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            best = id;
          }
        });
        if (best) setActive(best);
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observerRef.current!.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (!c) return null;

  return (
    <nav
      aria-label="Page sections"
      className="sticky top-14 z-20 bg-[var(--color-bg)]/90 backdrop-blur-sm border-b border-[var(--color-border)]"
    >
      <div className="mx-auto max-w-6xl px-5 md:px-6 flex items-center gap-1 overflow-x-auto scrollbar-none">
        {SECTIONS.map(({ id, key }) => {
          const label = c[key as SectionKey];
          const isActive = active === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => handleClick(id)}
              className={`shrink-0 text-[13px] font-medium px-3 py-3 border-b-2 transition-colors ${
                isActive
                  ? "border-[var(--color-accent)] text-[var(--color-accent)]"
                  : "border-transparent text-[var(--color-fg-muted)] hover:text-[var(--color-fg-strong)]"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
