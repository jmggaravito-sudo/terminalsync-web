"use client";

import { useEffect, useRef, useState } from "react";
import { RefreshCw, Laptop, Monitor, Cloud, Check } from "lucide-react";
import type { Locale } from "@/content";

/**
 * Demo 2 del handoff — "Continuidad entre dispositivos".
 * Portátil con una conversación → sync a la nube → el desktop se enciende y
 * aparece la misma conversación. Autoplay en viewport + replay. Sin deps.
 */

const T = {
  es: {
    title: "Continuidad entre dispositivos",
    replay: "Reproducir de nuevo",
    laptop: "Tu portátil",
    desktop: "Tu desktop",
    steps: ["Trabajas en tu portátil…", "Se sincroniza, cifrado, a tu nube…", "Abres el desktop — todo sigue donde lo dejaste."],
    convo: ["Arma el seguimiento del cliente Pérez", "✓ Borrador listo en tu voz", "¿Le agrego la propuesta?"],
    synced: "Sincronizado",
  },
  en: {
    title: "Continuity across devices",
    replay: "Play again",
    laptop: "Your laptop",
    desktop: "Your desktop",
    steps: ["You work on your laptop…", "It syncs, encrypted, to your cloud…", "You open the desktop — everything's where you left it."],
    convo: ["Draft the follow-up for client Pérez", "✓ Draft ready in your voice", "Add the proposal too?"],
    synced: "Synced",
  },
} as const;

export function DemoSyncDispositivos({ lang }: { lang: Locale }) {
  const t = T[lang];
  const ref = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0); // 0 laptop · 1 sync · 2 desktop on
  const [started, setStarted] = useState(false);

  const play = () => { setStep(0); setStarted(true); };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((e) => { if (e[0].isIntersecting && !started) play(); }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started || step >= 2) return;
    const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const id = setTimeout(() => setStep((s) => s + 1), reduce ? 0 : 1700);
    return () => clearTimeout(id);
  }, [started, step]);

  const Convo = ({ on }: { on: boolean }) => (
    <div className={`space-y-1.5 transition-opacity duration-700 ${on ? "opacity-100" : "opacity-0"}`}>
      {t.convo.map((c, i) => (
        <div
          key={i}
          className={`text-[11px] leading-snug rounded-lg px-2.5 py-1.5 ${
            i === 1 ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-medium" : "bg-[var(--color-panel-2)] text-[var(--color-fg)]"
          }`}
        >
          {c}
        </div>
      ))}
    </div>
  );

  return (
    <div ref={ref} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] overflow-hidden" style={{ boxShadow: "var(--shadow-floating)" }}>
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--color-border)] bg-[var(--color-panel-2)]">
        <span className="text-[12px] font-mono text-[var(--color-fg-muted)]">Terminal Sync · {t.title}</span>
        <button onClick={play} className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--color-accent)]">
          <RefreshCw size={13} strokeWidth={2.2} /> {t.replay}
        </button>
      </div>

      <div className="p-5 sm:p-7">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-5">
          {/* Portátil */}
          <DeviceCard icon={<Laptop size={16} />} label={t.laptop} active={step >= 0} dim={step >= 2}>
            <Convo on={step >= 0} />
          </DeviceCard>

          {/* Sync nube */}
          <div className="flex flex-col items-center gap-1.5">
            <Cloud
              size={26}
              strokeWidth={1.8}
              className={`transition-colors duration-500 ${step >= 1 ? "text-[var(--color-accent)]" : "text-[var(--color-fg-dim)]"}`}
            />
            <div className="h-8 w-px relative overflow-hidden bg-[var(--color-border)]">
              <span className={`absolute inset-x-0 h-3 bg-[var(--color-accent)] ${step === 1 ? "animate-[syncPulse_1.2s_linear_infinite]" : ""}`} style={{ top: step >= 1 ? 0 : "-12px" }} />
            </div>
            {step >= 2 ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[var(--color-accent)]">
                <Check size={11} strokeWidth={2.6} /> {t.synced}
              </span>
            ) : null}
          </div>

          {/* Desktop */}
          <DeviceCard icon={<Monitor size={16} />} label={t.desktop} active={step >= 2} powering={step < 2}>
            <Convo on={step >= 2} />
          </DeviceCard>
        </div>

        <p className="mt-6 text-center text-[14px] text-[var(--color-fg)] min-h-[1.5em] hero-rotate" key={step}>
          {t.steps[step]}
        </p>
      </div>

      <style>{`@keyframes syncPulse{0%{transform:translateY(-12px)}100%{transform:translateY(48px)}}`}</style>
    </div>
  );
}

function DeviceCard({
  icon,
  label,
  active,
  dim,
  powering,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  dim?: boolean;
  powering?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-xl border p-3 transition-all duration-700 ${
        active && !dim ? "border-[var(--color-accent)]/40 bg-[var(--color-panel)]" : "border-[var(--color-border)] bg-[var(--color-panel-2)]"
      } ${powering ? "opacity-40" : "opacity-100"} ${dim ? "opacity-60" : ""}`}
    >
      <div className="flex items-center gap-1.5 mb-2 text-[11.5px] font-medium text-[var(--color-fg-muted)]">
        <span className={active && !dim ? "text-[var(--color-accent)]" : ""}>{icon}</span>
        {label}
      </div>
      {children}
    </div>
  );
}
