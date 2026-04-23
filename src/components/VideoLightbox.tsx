"use client";

import { useEffect } from "react";
import { X, PlayCircle, Download, ArrowRight } from "lucide-react";
import type { Dict } from "@/content";

interface Props {
  open: boolean;
  onClose: () => void;
  dict: Dict;
  /** Embed URL (YouTube nocookie, Vimeo, Mux). If absent we show a polished
      placeholder so the lightbox still ships before the video is recorded. */
  videoUrl?: string;
}

export function VideoLightbox({ open, onClose, dict, videoUrl }: Props) {
  useEffect(() => {
    if (!open) return;
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
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={dict.video.title}
    >
      {/* Scrim */}
      <button
        type="button"
        aria-label={dict.video.close}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md cursor-default"
      />

      {/* Frame */}
      <div className="relative w-full max-w-4xl rounded-2xl overflow-hidden shadow-floating bg-[var(--color-panel)] border border-[var(--color-border)]">
        <button
          onClick={onClose}
          aria-label={dict.video.close}
          className="absolute top-3 right-3 z-10 h-9 w-9 rounded-full flex items-center justify-center bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 transition-colors"
        >
          <X size={16} strokeWidth={2.2} />
        </button>

        <div className="relative aspect-video bg-black">
          {videoUrl ? (
            <iframe
              src={videoUrl}
              title={dict.video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          ) : (
            <VideoPlaceholder dict={dict} onClose={onClose} />
          )}
        </div>
      </div>
    </div>
  );
}

function VideoPlaceholder({
  dict,
  onClose,
}: {
  dict: Dict;
  onClose: () => void;
}) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#0f1115] via-[#0b1733] to-[#1f2937]">
      {/* Ambient dots */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgb(255 255 255 / 0.06) 1px, transparent 0)",
          backgroundSize: "22px 22px",
        }}
      />
      {/* Accent glows */}
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(ellipse at 20% 30%, rgb(37 99 235 / 0.25), transparent 55%), radial-gradient(ellipse at 80% 70%, rgb(200 90 58 / 0.25), transparent 60%)",
        }}
      />

      <div className="relative text-center max-w-md px-8">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-white/8 border border-white/15 flex items-center justify-center backdrop-blur-sm">
          <PlayCircle size={30} className="text-white/90" strokeWidth={1.6} />
        </div>
        <h3 className="mt-5 text-[22px] font-semibold tracking-tight text-white">
          {dict.video.comingSoon}
        </h3>
        <p className="mt-2 text-[13.5px] text-white/70 leading-relaxed">
          {dict.video.comingSoonBody}
        </p>
        <a
          href="#hero"
          onClick={onClose}
          className="mt-5 inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-[13px] font-semibold bg-white text-[var(--color-fg-strong)] hover:bg-white/90 transition-colors"
        >
          <Download size={13} strokeWidth={2.4} />
          {dict.video.ctaMeanwhile}
          <ArrowRight size={13} strokeWidth={2.4} />
        </a>
      </div>
    </div>
  );
}
