"use client";

import { useEffect, useRef, useState } from "react";
import { RefreshCw, ArrowRight } from "lucide-react";
import type { Locale } from "@/content";

/**
 * Demo 1 del handoff — "Cambio de IA en un clic".
 * Replica del chat: pregunta → Claude planea → ⇄ Codex ejecuta → ⇄ Gemini
 * resume, compartiendo contexto. Texto PRE-CARGADO (sin API). Autoplay al
 * entrar en viewport + botón "Reproducir de nuevo". Respeta reduced-motion.
 */

type AIKey = "claude" | "codex" | "gemini";
const AI: Record<AIKey, { name: string; color: string; bg: string }> = {
  claude: { name: "Claude", color: "#d97757", bg: "rgba(217,119,87,0.08)" },
  codex: { name: "Codex", color: "#1f9d63", bg: "rgba(31,157,99,0.08)" },
  gemini: { name: "Gemini", color: "#3f74f5", bg: "rgba(63,116,245,0.08)" },
};

const T = {
  es: {
    question: "Necesito un plan de campaña de 90 días para mi marca de skincare.",
    you: "Tú",
    switched: (n: string) => `Cambiaste a ${n} — mismo contexto`,
    replay: "Reproducir de nuevo",
    steps: [
      { ai: "claude" as AIKey, role: "planea", text: "## Plan de campaña 90 días — Skincare\n- **Meta Ads** (60%) — prospección + retargeting\n- **Email** (20%) — bienvenida, carrito, post-compra\n- **Influencers** (20%) — UGC y prueba social\n**KPIs:** ROAS ≥ 3.5× · CAC ≤ 40% del ticket · meta +30% en ventas." },
      { ai: "codex" as AIKey, role: "ejecuta", text: "## Semana 1 — Entregables\n**Email 1 · Bienvenida**\nAsunto: Tu piel no necesita más productos. Necesita la rutina correcta.\n**Anuncio Meta · Prospección**\nTitular: Rutinas simples para una piel más saludable." },
      { ai: "gemini" as AIKey, role: "resume", text: "## Resumen de la sesión\n- Campaña de 90 días para skincare — meta **+30% en ventas**.\n- Canales: Meta Ads (60%), Email (20%), Influencers (20%).\n- Semana 1 entregada: 2 emails + 1 anuncio.\n- KPIs: ROAS ≥ 3.5× · CAC ≤ 40% del ticket." },
    ],
  },
  en: {
    question: "I need a 90-day campaign plan for my skincare brand.",
    you: "You",
    switched: (n: string) => `You switched to ${n} — same context`,
    replay: "Play again",
    steps: [
      { ai: "claude" as AIKey, role: "plans", text: "## 90-day campaign plan — Skincare\n- **Meta Ads** (60%) — prospecting + retargeting\n- **Email** (20%) — welcome, cart, post-purchase\n- **Influencers** (20%) — UGC and social proof\n**KPIs:** ROAS ≥ 3.5× · CAC ≤ 40% of ticket · goal +30% sales." },
      { ai: "codex" as AIKey, role: "executes", text: "## Week 1 — Deliverables\n**Email 1 · Welcome**\nSubject: Your skin doesn't need more products. It needs the right routine.\n**Meta Ad · Prospecting**\nHeadline: Simple routines for healthier skin." },
      { ai: "gemini" as AIKey, role: "summarizes", text: "## Session summary\n- 90-day skincare campaign — goal **+30% sales**.\n- Channels: Meta Ads (60%), Email (20%), Influencers (20%).\n- Week 1 delivered: 2 emails + 1 ad.\n- KPIs: ROAS ≥ 3.5× · CAC ≤ 40% of ticket." },
    ],
  },
} as const;

function renderMd(text: string) {
  return text.split("\n").map((line, i) => {
    if (line.startsWith("## ")) {
      return <p key={i} className="font-semibold text-[var(--color-fg-strong)] text-[14.5px] mb-1.5">{line.slice(3)}</p>;
    }
    const parts = line.replace(/^- /, "• ").split(/(\*\*[^*]+\*\*)/g);
    return (
      <p key={i} className="text-[13.5px] text-[var(--color-fg)] leading-relaxed">
        {parts.map((p, j) =>
          p.startsWith("**") && p.endsWith("**") ? (
            <strong key={j} className="font-semibold">{p.slice(2, -2)}</strong>
          ) : (
            <span key={j}>{p}</span>
          ),
        )}
      </p>
    );
  });
}

export function DemoCambioIA({ lang }: { lang: Locale }) {
  const t = T[lang];
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(0); // cuántos pasos visibles
  const [started, setStarted] = useState(false);

  const play = () => {
    setShown(0);
    setStarted(true);
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started) play();
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    if (shown >= t.steps.length) return;
    const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const delay = reduce ? 0 : shown === 0 ? 900 : 2200;
    const id = setTimeout(() => setShown((s) => s + 1), delay);
    return () => clearTimeout(id);
  }, [started, shown, t.steps.length]);

  return (
    <div ref={ref} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] overflow-hidden" style={{ boxShadow: "var(--shadow-floating)" }}>
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--color-border)] bg-[var(--color-panel-2)]">
        <span className="text-[12px] font-mono text-[var(--color-fg-muted)]">Terminal Sync · {lang === "es" ? "Cambio de IA en un clic" : "Switch AI in one click"}</span>
        <button onClick={play} className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--color-accent)]">
          <RefreshCw size={13} strokeWidth={2.2} /> {t.replay}
        </button>
      </div>

      <div className="p-4 sm:p-5 space-y-3 min-h-[320px]">
        {/* Pregunta del usuario */}
        <div className="flex justify-end">
          <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-[#5b56e6] text-white px-4 py-2.5 text-[13.5px]">
            {t.question}
          </div>
        </div>

        {/* Respuestas que aparecen una por una */}
        {t.steps.slice(0, shown).map((step, idx) => {
          const ai = AI[step.ai];
          return (
            <div key={idx} className="space-y-2 hero-rotate">
              {idx > 0 ? (
                <div className="flex items-center justify-center gap-2 text-[11.5px] font-mono text-[var(--color-fg-muted)] py-1">
                  <ArrowRight size={13} className="rotate-90 sm:rotate-0" style={{ color: ai.color }} />
                  {t.switched(ai.name)}
                </div>
              ) : null}
              <div className="rounded-2xl border px-4 py-3" style={{ borderColor: ai.color + "55", background: ai.bg }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: ai.color }} />
                  <span className="text-[12.5px] font-semibold" style={{ color: ai.color }}>{ai.name}</span>
                  <span className="text-[11.5px] text-[var(--color-fg-dim)]">· {step.role}</span>
                </div>
                <div className="space-y-1">{renderMd(step.text)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
