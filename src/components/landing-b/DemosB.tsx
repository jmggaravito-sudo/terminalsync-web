"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { Dict } from "@/content";

interface Props {
  dict: Dict;
}

function DemoLightbox({
  src,
  title,
  onClose,
}: {
  src: string;
  title: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl rounded-2xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
          <span className="text-[13.5px] font-medium text-[var(--color-fg-strong)]">
            {title}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="inline-flex items-center justify-center h-7 w-7 rounded-lg text-[var(--color-fg-muted)] hover:bg-[var(--color-panel)] transition-colors"
          >
            <X size={16} strokeWidth={2.2} />
          </button>
        </div>
        <iframe
          src={src}
          title={title}
          className="w-full"
          style={{ height: "75vh" }}
        />
      </div>
    </div>
  );
}

export function DemosB({ dict }: Props) {
  const c = dict.landingB?.demos;
  const [active, setActive] = useState<{ src: string; title: string } | null>(null);

  if (!c) return null;

  return (
    <section
      id="demos"
      className="scroll-mt-28 mx-auto max-w-6xl px-5 md:px-6 py-20 md:py-24"
    >
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="inline-flex items-center text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--color-fg-muted)] border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-1 rounded-full">
          {c.eyebrow}
        </span>
        <h2
          className="mt-4 font-semibold tracking-tight text-[var(--color-fg-strong)] leading-[1.08] whitespace-pre-line"
          style={{ fontSize: "clamp(1.625rem, 4vw, 2.5rem)" }}
        >
          {c.title}
        </h2>
        <p className="mt-3 text-[14.5px] text-[var(--color-fg-muted)] leading-relaxed">
          {c.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {c.items.map((item) => (
          <button
            key={item.src}
            type="button"
            onClick={() => setActive({ src: item.src, title: item.title })}
            className="group flex flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] overflow-hidden hover:border-[var(--color-accent)]/50 transition-colors text-left"
          >
            <div className="aspect-video w-full bg-[var(--color-surface)] relative overflow-hidden">
              <iframe
                src={item.src}
                title={item.title}
                loading="lazy"
                className="w-full h-full pointer-events-none scale-[0.5] origin-top-left"
                style={{ width: "200%", height: "200%" }}
                tabIndex={-1}
              />
              <div className="absolute inset-0 group-hover:bg-[var(--color-accent)]/5 transition-colors" />
            </div>
            <div className="px-3 py-2.5">
              <p className="text-[12.5px] font-medium text-[var(--color-fg-strong)] leading-snug">
                {item.title}
              </p>
            </div>
          </button>
        ))}
      </div>

      {active ? (
        <DemoLightbox
          src={active.src}
          title={active.title}
          onClose={() => setActive(null)}
        />
      ) : null}
    </section>
  );
}
