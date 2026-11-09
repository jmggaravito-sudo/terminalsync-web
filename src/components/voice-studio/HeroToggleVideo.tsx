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
  const [paused, setPaused] = useState(false);
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

  // Click on the video itself pauses/resumes the active render.
  const togglePlay = useCallback(() => {
    const v = lang === "en" ? enRef.current : esRef.current;
    if (!v) return;
    if (v.paused) void v.play().catch(() => {});
    else v.pause();
  }, [lang]);

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
          onPlay={() => setPaused(false)}
          onPause={() => setPaused(true)}
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
          onPlay={() => setPaused(false)}
          onPause={() => setPaused(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-out ${
            lang === "es" ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* click overlay: before the first interaction ANY click on the video
            unlocks audio (browsers mute autoplay; the gesture is required) —
            afterwards it toggles pause/resume of the active render */}
        <button
          type="button"
          onClick={() => (interacted ? togglePlay() : activate(lang))}
          onMouseEnter={() => setShouldPreloadEs(true)}
          onFocus={() => setShouldPreloadEs(true)}
          aria-label={interacted ? (paused ? "Play video" : "Pause video") : "Turn on sound"}
          className="absolute inset-0 z-0 outline-none"
        />
        {paused && (
          <span className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-950/55 ring-2 ring-white/80 shadow-xl">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="ml-1 h-8 w-8 text-white"
                aria-hidden="true"
              >
                <path d="M8 5.14v13.72c0 .8.87 1.3 1.56.88l10.8-6.86a1.05 1.05 0 0 0 0-1.76L9.56 4.26A1.04 1.04 0 0 0 8 5.14Z" />
              </svg>
            </span>
          </span>
        )}
        {!interacted && (
          <span className="pointer-events-none absolute right-3 top-3 z-10 rounded-full bg-zinc-950/70 px-3 py-1 text-xs font-semibold text-white/90">
            🔊 Click for sound
          </span>
        )}
      </div>

      {/* ONE glossy button BELOW the video (never on top of it): it always
          invites the language you're NOT hearing — "Click to Spanish" first,
          then it flips to "Click to English" and back with every click. */}
      <div className="flex justify-center bg-zinc-100 py-2">
        <button
          type="button"
          onClick={() => (lang === "es" ? activate("en") : activate("es"))}
          onMouseEnter={() => setShouldPreloadEs(true)}
          onFocus={() => setShouldPreloadEs(true)}
          aria-label={lang === "es" ? "Click to English" : "Click to Spanish"}
          className="group flex outline-none"
        >
          <img
            src={
              lang === "es"
                ? "/images/voice-studio/btn-click-to-english.png"
                : "/images/voice-studio/btn-click-to-spanish.png"
            }
            alt=""
            draggable={false}
            className={`h-36 w-36 drop-shadow-2xl transition-transform duration-200 group-hover:scale-110 group-active:scale-95 ${
              interacted ? "" : "animate-bounce"
            }`}
          />
        </button>
      </div>

      <span className="sr-only" aria-live="polite">
        {lang === "es" ? "Spanish dubbing on" : "English audio on"}
      </span>
    </div>
  );
}
