"use client";

import { useRef, useState } from "react";
import { Play } from "lucide-react";
import type { Locale } from "@/content";

const COPY: Record<Locale, { eyebrow: string; title: string; sub: string; play: string }> = {
  es: {
    eyebrow: "Míralo en 1 minuto",
    title: "Ve TerminalSync en acción.",
    sub: "Una IA se detiene, cambias a otra y el trabajo sigue — incluso desde WhatsApp. Dale play.",
    play: "Reproducir video",
  },
  en: {
    eyebrow: "See it in 1 minute",
    title: "See TerminalSync in action.",
    sub: "One AI stops, you switch to another and the work keeps going — even from WhatsApp. Press play.",
    play: "Play video",
  },
};

const VIDEO_SRC: Record<Locale, string> = {
  es: "/assets/terminalsync.mp4",
  en: "/assets/terminalsync-en.mp4",
};

export function VideoSection({ lang }: { lang: Locale }) {
  const t = COPY[lang];
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const handlePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    v.play();
    setPlaying(true);
  };

  return (
    <section
      id="video"
      className="scroll-mt-20 mx-auto max-w-6xl px-5 md:px-6 py-20 md:py-28"
    >
      <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
        <span className="text-[12.5px] font-mono uppercase tracking-[0.12em] text-[var(--color-accent)]">
          {t.eyebrow}
        </span>
        <h2
          className="font-semibold tracking-tight text-[var(--color-fg-strong)] leading-[1.05] mt-3"
          style={{ fontSize: "clamp(34px, 5.2vw, 60px)" }}
        >
          {t.title}
        </h2>
        <p className="mt-4 text-[16px] md:text-[17px] text-[var(--color-fg-muted)] leading-relaxed">
          {t.sub}
        </p>
      </div>

      <div
        className="relative mx-auto rounded-2xl overflow-hidden bg-black"
        style={{
          maxWidth: "1080px",
          boxShadow:
            "0 30px 80px -20px color-mix(in oklch, var(--color-accent) 35%, transparent), 0 0 0 1px var(--color-border)",
        }}
      >
        <video
          ref={videoRef}
          src={VIDEO_SRC[lang]}
          poster="/redesign/dashboard-hero.png"
          controls={playing}
          playsInline
          preload="metadata"
          className="w-full block aspect-video bg-black"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />

        {!playing && (
          <button
            type="button"
            onClick={handlePlay}
            aria-label={t.play}
            className="absolute inset-0 z-10 flex items-center justify-center cursor-pointer group"
            style={{
              background:
                "linear-gradient(180deg, color-mix(in srgb, black 12%, transparent) 0%, color-mix(in srgb, black 32%, transparent) 100%)",
            }}
          >
            <span
              className="flex items-center justify-center rounded-full bg-[var(--color-accent)] text-white transition-transform duration-200 group-hover:scale-105"
              style={{
                width: "96px",
                height: "96px",
                boxShadow:
                  "0 10px 40px color-mix(in oklch, var(--color-accent) 55%, transparent), 0 0 0 8px color-mix(in srgb, white 18%, transparent)",
              }}
            >
              <Play size={36} strokeWidth={2.4} className="ml-1" fill="currentColor" />
            </span>
          </button>
        )}
      </div>
    </section>
  );
}
