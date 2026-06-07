"use client";

import { useEffect, useRef, useState } from "react";
import { RefreshCw, Check, MousePointer2, Plug } from "lucide-react";
import type { Locale } from "@/content";

/**
 * Demo 3 del handoff — "Integraciones drag & drop".
 * Un conector se arrastra (animado) a la sesión → se instala con pop + toast.
 * Autoplay en viewport + replay. Sin deps. (La interacción manual real vive
 * en el cajón de Integraciones del app desktop.)
 */

type Item = { key: string; name: string; color: string; abbr: string };
const ITEMS: Item[] = [
  { key: "notion", name: "Notion", color: "#111", abbr: "No" },
  { key: "gmail", name: "Gmail", color: "#ea4335", abbr: "Gm" },
  { key: "github", name: "GitHub", color: "#111", abbr: "Gh" },
  { key: "slack", name: "Slack", color: "#611f69", abbr: "Sl" },
];

const T = {
  es: {
    title: "Integraciones drag & drop",
    replay: "Reproducir de nuevo",
    lead: "Conecta kits, conectores y asistentes arrastrándolos. Cero código.",
    drop: "Suelta aquí para instalar",
    installed: (n: string) => `${n} instalado en tu sesión`,
    dragging: "Arrastrando…",
  },
  en: {
    title: "Drag & drop integrations",
    replay: "Play again",
    lead: "Connect kits, connectors and assistants by dragging them. Zero code.",
    drop: "Drop here to install",
    installed: (n: string) => `${n} installed in your session`,
    dragging: "Dragging…",
  },
} as const;

export function DemoConectores({ lang }: { lang: Locale }) {
  const t = T[lang];
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"idle" | "drag" | "drop" | "done">("idle");
  const [started, setStarted] = useState(false);
  const target = ITEMS[0]; // Notion vuela a la sesión

  const play = () => { setPhase("idle"); setStarted(true); };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((e) => { if (e[0].isIntersecting && !started) play(); }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const seq: Array<[typeof phase, number]> = [["drag", 700], ["drop", 1400], ["done", 700]];
    const cur = phase === "idle" ? -1 : seq.findIndex(([p]) => p === phase);
    if (cur + 1 >= seq.length) return;
    const [next, delay] = seq[cur + 1];
    const id = setTimeout(() => setPhase(next), reduce ? 0 : delay);
    return () => clearTimeout(id);
  }, [started, phase]);

  return (
    <div ref={ref} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] overflow-hidden" style={{ boxShadow: "var(--shadow-floating)" }}>
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--color-border)] bg-[var(--color-panel-2)]">
        <span className="text-[12px] font-mono text-[var(--color-fg-muted)]">Terminal Sync · {t.title}</span>
        <button onClick={play} className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--color-accent)]">
          <RefreshCw size={13} strokeWidth={2.2} /> {t.replay}
        </button>
      </div>

      <div className="p-5 sm:p-7">
        <p className="text-[13.5px] text-[var(--color-fg-muted)] mb-5">{t.lead}</p>

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1.2fr] gap-5 items-stretch">
          {/* Conectores disponibles */}
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel-2)] p-3">
            <div className="grid grid-cols-2 gap-2.5">
              {ITEMS.map((it) => {
                const flying = it.key === target.key && (phase === "drag" || phase === "drop");
                const gone = it.key === target.key && phase === "done";
                return (
                  <div
                    key={it.key}
                    className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] px-2.5 py-2 text-[12.5px] transition-all duration-700"
                    style={{
                      transform: flying ? "translate(40%, 40px) scale(.9)" : "none",
                      opacity: gone ? 0.35 : 1,
                    }}
                  >
                    <span className="grid h-6 w-6 place-items-center rounded-md text-[10px] font-bold text-white" style={{ background: it.color }}>
                      {it.abbr}
                    </span>
                    {it.name}
                    {flying ? <MousePointer2 size={13} className="ml-auto text-[var(--color-accent)]" /> : null}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Zona de la sesión (drop) */}
          <div
            className="rounded-xl border-2 border-dashed p-4 flex flex-col items-center justify-center text-center transition-colors duration-300"
            style={{
              borderColor: phase === "drop" ? "var(--color-accent)" : "var(--color-border-strong)",
              background: phase === "drop" ? "var(--color-accent-glow)" : "transparent",
            }}
          >
            {phase === "done" ? (
              <div className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent)] text-white px-4 py-2 text-[13px] font-semibold animate-[pop_.4s_var(--ease,ease)]">
                <Check size={15} strokeWidth={2.6} /> {t.installed(target.name)}
              </div>
            ) : (
              <>
                <Plug size={22} strokeWidth={1.8} className="text-[var(--color-fg-dim)] mb-2" />
                <span className="text-[12.5px] text-[var(--color-fg-muted)]">
                  {phase === "drag" || phase === "drop" ? t.dragging : t.drop}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`@keyframes pop{0%{transform:scale(.6);opacity:0}60%{transform:scale(1.06)}100%{transform:scale(1);opacity:1}}`}</style>
    </div>
  );
}
