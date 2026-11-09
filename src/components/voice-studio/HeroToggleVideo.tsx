"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface HeroToggleVideoProps {
  /** English render (AI avatar, own soundtrack). */
  videoEn: string;
  /** Spanish render (same avatar dubbed, own soundtrack). */
  videoEs: string;
  /** Called when the visitor first unlocks sound (useful for analytics later). */
  onFirstPlay?: () => void;
}

type Lang = "en" | "es";

// HERO "Turn on Spanish": two full renders of the same AI avatar — one per
// language (each with lip-sync, so the whole video swaps, not just the audio).
// English starts as a muted ambient loop (browsers forbid autoplay with
// sound); the big round button unlocks audio and every activation restarts
// its own video from the top so the pitch always begins on a sentence
// boundary.
export function HeroToggleVideo({
  videoEn,
  videoEs,
  onFirstPlay,
}: HeroToggleVideoProps) {
  const enRef = useRef<HTMLVideoElement>(null);
  const esRef = useRef<HTMLVideoElement>(null);
  const [lang, setLang] = useState<Lang>("en");
  const [interacted, setInteracted] = useState(false);
  const [shouldPreloadEs, setShouldPreloadEs] = useState(false);

  // The ES render ships as preload="metadata"; when the visitor shows intent
  // (hover/focus on the toggle) we promote it to full preload so the
  // crossfade starts without a loading gap.
  useEffect(() => {
    if (shouldPreloadEs) {
      const el = esRef.current;
      if (el) el.preload = "auto";
    }
  }, [shouldPreloadEs]);

  const restart = useCallback((v: HTMLVideoElement | null) => {
    if (!v) return;
    if (v.readyState >= HTMLMediaElement.HAVE_METADATA) {
      try {
        v.currentTime = 0;
      } catch {
        // seek raced metadata; the loop restarts it anyway
      }
    } else {
      v.addEventListener(
        "loadedmetadata",
        () => {
          try {
            v.currentTime = 0;
          } catch {
            /* ignore */
          }
        },
        { once: true },
      );
    }
  }, []);

  const activate = useCallback(
    (next: Lang) => {
      const active = next === "en" ? enRef.current : esRef.current;
      const inactive = next === "en" ? esRef.current : enRef.current;
      if (!active) return;
      inactive?.pause();
      restart(active);
      void active.play().catch(() => {});
      if (!interacted) {
        setInteracted(true);
        onFirstPlay?.();
      }
      setLang(next);
    },
    [interacted, onFirstPlay, restart],
  );

  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 shadow-2xl">
      <div className="relative aspect-video">
        <video
          ref={enRef}
          src={videoEn}
          muted={!(interacted && lang === "en")}
          autoPlay
          playsInline
          loop
          preload="auto"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-out ${
            lang === "en" ? "opacity-100" : "opacity-0"
          }`}
        />
        <video
          ref={esRef}
          src={videoEs}
          muted={lang !== "es"}
          playsInline
          loop
          preload="metadata"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-out ${
            lang === "es" ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* mode pill while dubbing is engaged */}
        {interacted && (
          <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center px-8">
            <span
              className={`rounded-full px-3 py-1.5 text-sm font-semibold shadow ${
                lang === "es"
                  ? "bg-zinc-950/80 text-white"
                  : "bg-white/85 text-zinc-900"
              }`}
            >
              {lang === "es"
                ? "Español · misma persona, voz AI"
                : "English · AI-dubbed voice"}
            </span>
          </div>
        )}

        {/* big glossy unlock button — floats over the video bottom */}
        {!interacted && (
          <button
            type="button"
            onClick={() => activate("es")}
            onMouseEnter={() => setShouldPreloadEs(true)}
            onFocus={() => setShouldPreloadEs(true)}
            aria-label="Click to Spanish"
            className="group absolute inset-x-0 bottom-4 z-10 flex justify-center outline-none"
          >
            <img
              src="/images/voice-studio/btn-click-to-spanish.png"
              alt=""
              draggable={false}
              className="h-28 w-28 animate-bounce drop-shadow-2xl transition-transform duration-200 group-hover:scale-110 group-active:scale-95"
            />
          </button>
        )}
      </div>

      {/* language switcher once sound is unlocked */}
      {interacted && (
        <div className="flex items-center justify-center gap-8 py-4">
          <button
            type="button"
            onClick={() => activate("en")}
            aria-label="Click to English"
            className={`transition-all duration-200 ${
              lang === "en"
                ? "scale-110 opacity-100"
                : "scale-90 opacity-50 hover:opacity-90"
            }`}
          >
            <img
              src="/images/voice-studio/btn-click-to-english.png"
              alt=""
              draggable={false}
              className="h-20 w-20"
            />
          </button>
          <button
            type="button"
            onClick={() => activate("es")}
            aria-label="Click to Spanish"
            className={`transition-all duration-200 ${
              lang === "es"
                ? "scale-110 opacity-100"
                : "scale-90 opacity-50 hover:opacity-90"
            }`}
          >
            <img
              src="/images/voice-studio/btn-click-to-spanish.png"
              alt=""
              draggable={false}
              className="h-20 w-20"
            />
          </button>
        </div>
      )}

      <span className="sr-only" aria-live="polite">
        {lang === "es" ? "Spanish dubbing on" : "English audio on"}
      </span>
    </div>
  );
}
