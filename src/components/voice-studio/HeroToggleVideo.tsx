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
  const switching = useRef(false);
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
    async (next: Lang) => {
      const active = next === "en" ? enRef.current : esRef.current;
      const inactive = next === "en" ? esRef.current : enRef.current;
      if (!active || switching.current) return;
      switching.current = true;
      const inactiveWasMuted = inactive?.muted ?? true;
      try {
        if (inactive) inactive.muted = true;
        restart(active);
        // Unmute within the click gesture, before awaiting play. This is
        // required by browsers that block unmuting outside a user gesture.
        active.muted = false;
        await active.play();
        inactive?.pause();
        setPaused(false);
        setLang(next);
        if (!interacted) {
          setInteracted(true);
          onFirstPlay?.();
        }
      } catch {
        active.muted = true;
        if (inactive) inactive.muted = inactiveWasMuted;
      } finally {
        switching.current = false;
      }
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

        {/* After sound is on, clicking the video still pauses or resumes it. */}
        {interacted && (
          <button
            type="button"
            onClick={togglePlay}
            aria-label={paused ? "Play video" : "Pause video"}
            className="absolute inset-0 z-0 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-amber-400"
          />
        )}
        {interacted && paused && (
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
      </div>

      {/* The same button unlocks English sound, then switches languages. */}
      <div className="flex justify-center bg-zinc-100 py-2">
        <button
          type="button"
          onClick={() => void activate(!interacted || lang === "es" ? "en" : "es")}
          onMouseEnter={() => setShouldPreloadEs(true)}
          onFocus={() => setShouldPreloadEs(true)}
          aria-label={!interacted ? "Click for sound" : lang === "es" ? "Click to English" : "Click to Spanish"}
          className="group flex h-36 w-36 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
        >
          {!interacted ? (
            <span
              aria-hidden="true"
              className="grid h-28 w-28 place-items-center rounded-full border border-zinc-500 bg-[linear-gradient(145deg,#fafafa_5%,#71717a_36%,#e4e4e7_54%,#52525b_80%,#d4d4d8)] p-2 shadow-lg transition-transform duration-200 group-hover:scale-110 group-active:scale-95"
            >
              <span className="grid h-full w-full place-content-center rounded-full border-2 border-zinc-800 bg-[radial-gradient(ellipse_at_40%_20%,#fdba74_0%,#ea580c_53%,#9a3412_100%)] text-center text-sm font-extrabold uppercase leading-tight text-white shadow-inner [text-shadow:0_1px_2px_#7c2d12]">
                Click for<br />sound
              </span>
            </span>
          ) : (
            <img
              src={
                lang === "es"
                  ? "/images/voice-studio/btn-click-to-english.png"
                  : "/images/voice-studio/btn-click-to-spanish.png"
              }
              alt=""
              draggable={false}
              className="h-36 w-36 drop-shadow-2xl transition-transform duration-200 group-hover:scale-110 group-active:scale-95"
            />
          )}
        </button>
      </div>

      <span className="sr-only" aria-live="polite">
        {interacted ? (lang === "es" ? "Spanish dubbing on" : "English audio on") : ""}
      </span>
    </div>
  );
}
