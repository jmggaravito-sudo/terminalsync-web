"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface HeroToggleVideoProps {
  /** Video track (identical for both languages — dubbing v0 has no lip-sync). */
  videoSrc: string;
  /** Original-language audio (English). */
  enAudioSrc: string;
  /** Dubbed audio (Spanish) — AI voice. */
  esAudioSrc: string;
  /** Hook/title shown while the video is playing muted before first click. */
  hookTitle?: string;
  /** Called when the visitor first unlocks sound (useful for analytics later). */
  onFirstPlay?: () => void;
}

type Lang = "en" | "es";

const DRIFT_TOLERANCE = 0.25;

// HERO "Turn on Spanish": one video track, two audio tracks. The button is
// the product demo — English AI voice ↔ Spanish dub — and the first click
// doubles as the user gesture that unlocks autoplay-with-sound.
export function HeroToggleVideo({
  videoSrc,
  enAudioSrc,
  esAudioSrc,
  hookTitle = "",
  onFirstPlay,
}: HeroToggleVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<Record<Lang, HTMLAudioElement | null>>({
    en: null,
    es: null,
  });
  const [lang, setLang] = useState<Lang>("en");
  const [playing, setPlaying] = useState(false);

  const resync = useCallback((langNow: Lang) => {
    const v = videoRef.current;
    const a = audioRef.current[langNow];
    if (v && a && Math.abs(a.currentTime - v.currentTime) > DRIFT_TOLERANCE) {
      a.currentTime = v.currentTime;
    }
  }, []);

  // keep the active audio glued to the video clock
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onSync = () => resync(lang);
    const onPlay = () => {
      const a = audioRef.current[lang];
      if (a) void a.play().catch(() => {});
    };
    const onPause = () => {
      const a = audioRef.current[lang];
      a?.pause();
    };
    v.addEventListener("timeupdate", onSync);
    v.addEventListener("seeked", onSync);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("ended", onPause);
    return () => {
      v.removeEventListener("timeupdate", onSync);
      v.removeEventListener("seeked", onSync);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("ended", onPause);
    };
  }, [lang, resync]);

  function toggle(next: Lang) {
    const v = videoRef.current;
    if (!v) return;
    const prevAudio = audioRef.current[lang];
    const nextAudio = audioRef.current[next];
    if (!prevAudio || !nextAudio) return;
    // crossfade: duck previous, bring next up at the video clock
    prevAudio.pause();
    nextAudio.currentTime = v.currentTime;
    nextAudio.volume = 0;
    void nextAudio.play().then(() => {
      const fade = nextAudio.volume === 0 ? 0 : nextAudio.volume;
      const steps = 8;
      let i = 0;
      const timer = setInterval(() => {
        i += 1;
        nextAudio.volume = Math.min(1, fade + i / steps);
        if (i >= steps) clearInterval(timer);
      }, 50);
    }).catch(() => {});
    if (!playing) {
      void v.play().catch(() => {});
      setPlaying(true);
      onFirstPlay?.();
    }
    setLang(next);
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl">
      <video
        ref={videoRef}
        src={videoSrc}
        muted
        autoPlay
        playsInline
        loop
        className="aspect-video w-full"
        onClick={() => (playing ? (lang === "es" ? toggle("en") : toggle("es")) : toggle("es"))}
      />
      {/* pistas de audio: nunca autopian solas — las maneja el toggle */}
      <audio ref={(el) => { audioRef.current.en = el; }} src={enAudioSrc} preload="auto" />
      <audio ref={(el) => { audioRef.current.es = el; }} src={esAudioSrc} preload="auto" />

      {/* hook/title before first interaction */}
      {!playing && hookTitle && (
        <div className="absolute inset-x-0 top-8 flex justify-center">
          <span className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-bold text-zinc-950">
            {hookTitle}
          </span>
        </div>
      )}

      {/* ES captions + AI tag while dubbed mode is on */}
      {playing && lang === "es" && (
        <div className="absolute inset-x-0 bottom-16 flex justify-center px-8">
          <span className="rounded-md bg-zinc-950/80 px-3 py-1.5 text-sm font-semibold text-white">
            Subtítulos en español · voz AI
          </span>
        </div>
      )}

      {/* language toggle */}
      <div className="absolute inset-x-0 bottom-5 flex justify-center gap-3">
        <button
          type="button"
          onClick={() => toggle("en")}
          className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
            playing && lang === "en"
              ? "bg-zinc-100 text-zinc-950"
              : "bg-zinc-800/90 text-zinc-200 hover:bg-zinc-700"
          }`}
        >
          English
        </button>
        <button
          type="button"
          onClick={() => toggle("es")}
          className={`rounded-full px-5 py-2.5 text-sm font-bold transition-colors ${
            playing && lang === "es"
              ? "bg-amber-400 text-zinc-950"
              : "bg-amber-500/90 text-zinc-950 hover:bg-amber-400"
          }`}
        >
          ▶ Turn on Spanish
        </button>
      </div>
    </div>
  );
}
