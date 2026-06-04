"use client";

import { useState, useMemo } from "react";
import { Download, Sparkles, ChevronDown } from "lucide-react";
import type { Dict } from "@/content";

/**
 * Calculadora simple y AUDITABLE: mueves 3 barras → resultado.
 *
 * Regla científica (JM): nada inventado. El resultado se calcula SOLO con:
 *  - tus propios números (valor/hora, horas/semana) — no son afirmaciones nuestras
 *  - una cifra citada de ahorro de tiempo con IA (30–55%, estudio controlado)
 *  - el precio publicado de TerminalSync
 * Bloque "Cómo lo calculamos" muestra la fórmula exacta + fuentes con links.
 */

const WEEKS = 52;
const HOURS_PER_WORKDAY = 8;
const TS_MONTHLY = 19; // USD — plan Pro TerminalSync

const T = {
  es: {
    eyebrow: "Calcula tu ahorro",
    title: "¿Cuánto te devuelve al año?",
    subtitle: "Mueve las barras con tus números reales. La cuenta es transparente y auditable.",
    rate: "Tu valor por hora (o el de tu equipo)",
    hours: "Horas/semana en tareas que la IA puede acelerar",
    pct: "% de ese tiempo que la IA te ahorra",
    pctHint: "Estudios miden 30–55% más rápido con IA. Empezamos conservador en 30%.",
    resultLabel: "Lo que recuperas al año",
    resultSub: (h: string, d: string) => `${h} horas/año · ≈ ${d} días de trabajo`,
    roi: (mo: string, x: string) => `TerminalSync cuesta ${mo}/mes · retorno ${x}×`,
    how: "Cómo lo calculamos",
    formula: "Horas recuperadas = horas/semana × 52 × % de ahorro.  Valor = horas recuperadas × tu valor por hora.",
    sourcesTitle: "Fuentes",
    s1: "Ahorro de tiempo con IA: 30–55% más rápido en tareas — experimento controlado (95 programadores, P=.0017).",
    s2: "Precios de IA de referencia: Claude Pro, ChatGPT Plus y Google AI Pro ≈ $20/mes c/u (2026).",
    note: "Tu valor por hora y tus horas son tus propios números. La única cifra externa es el precio de TerminalSync.",
    cta: "Descargar gratis",
    pricesLink: "comparativa de precios",
  },
  en: {
    eyebrow: "Calculate your savings",
    title: "How much does it give you back per year?",
    subtitle: "Move the sliders with your real numbers. The math is transparent and auditable.",
    rate: "Your value per hour (or your team's)",
    hours: "Hours/week on tasks AI can speed up",
    pct: "% of that time AI saves you",
    pctHint: "Studies measure 30–55% faster with AI. We start conservative at 30%.",
    resultLabel: "What you get back per year",
    resultSub: (h: string, d: string) => `${h} hours/yr · ≈ ${d} workdays`,
    roi: (mo: string, x: string) => `TerminalSync costs ${mo}/mo · ${x}× return`,
    how: "How we calculate this",
    formula: "Recovered hours = hours/week × 52 × % saved.  Value = recovered hours × your value per hour.",
    sourcesTitle: "Sources",
    s1: "Time saved with AI: 30–55% faster on tasks — controlled experiment (95 programmers, P=.0017).",
    s2: "Reference AI prices: Claude Pro, ChatGPT Plus and Google AI Pro ≈ $20/mo each (2026).",
    note: "Your value per hour and your hours are your own numbers. The only external figure is TerminalSync's price.",
    cta: "Download free",
    pricesLink: "price comparison",
  },
} as const;

const SOURCE_LINKS = {
  study: "https://arxiv.org/abs/2302.06590",
  prices: "https://www.aipricing.guru/subscriptions/",
};

export function SavingsCalculator({ dict }: { dict: Dict }) {
  const t = T[dict.locale];
  const [rate, setRate] = useState(40);
  const [hours, setHours] = useState(10);
  const [pct, setPct] = useState(30);
  const [open, setOpen] = useState(false);

  const m = useMemo(() => {
    const hoursYr = hours * WEEKS * (pct / 100);
    const value = hoursYr * rate;
    const days = hoursYr / HOURS_PER_WORKDAY;
    const roi = value / (TS_MONTHLY * 12);
    return { hoursYr, value, days, roi };
  }, [rate, hours, pct]);

  const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
  const num = (n: number) => Math.round(n).toLocaleString("en-US");

  return (
    <section id="savings-calculator" className="mx-auto max-w-2xl px-5 md:px-6 py-20 md:py-24">
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--color-accent)]">
          <Sparkles size={12} strokeWidth={2.4} />
          {t.eyebrow}
        </span>
        <h2
          className="mt-3 font-semibold tracking-tight text-[var(--color-fg-strong)] leading-[1.08]"
          style={{ fontSize: "clamp(1.75rem, 4.5vw, 2.75rem)" }}
        >
          {t.title}
        </h2>
        <p className="mt-3 text-[15px] text-[var(--color-fg-muted)] leading-relaxed">{t.subtitle}</p>
      </div>

      <div className="mt-10 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-6 md:p-8">
        <Slider label={t.rate} value={`${usd(rate)}/h`}>
          <Range value={rate} onChange={setRate} min={10} max={200} step={5} />
        </Slider>
        <Slider label={t.hours} value={num(hours)}>
          <Range value={hours} onChange={setHours} min={0} max={40} step={1} />
        </Slider>
        <Slider label={t.pct} value={`${pct}%`} hint={t.pctHint} last>
          <Range value={pct} onChange={setPct} min={0} max={55} step={5} />
        </Slider>
      </div>

      <div className="mt-6 rounded-2xl border border-[var(--color-ok)]/40 bg-[var(--color-ok)]/8 px-6 py-8 text-center">
        <div className="text-[13px] text-[var(--color-fg-muted)]">{t.resultLabel}</div>
        <div
          className="mt-1 font-semibold tracking-tight text-[var(--color-ok)] leading-none tabular-nums"
          style={{ fontSize: "clamp(3rem, 11vw, 4.5rem)" }}
        >
          {usd(m.value)}
        </div>
        <div className="mt-3 text-[14px] text-[var(--color-fg)]">{t.resultSub(num(m.hoursYr), num(m.days))}</div>
        <div className="mt-3 text-[13px] text-[var(--color-fg-muted)]">{t.roi(usd(TS_MONTHLY), num(m.roi))}</div>
      </div>

      {/* Cómo lo calculamos — transparencia + fuentes citadas */}
      <div className="mt-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)]/50">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between gap-3 px-5 py-3.5 text-left text-[13.5px] font-semibold text-[var(--color-fg)]"
          aria-expanded={open}
        >
          {t.how}
          <ChevronDown size={16} className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        {open ? (
          <div className="px-5 pb-5 text-[13px] text-[var(--color-fg-muted)] leading-relaxed space-y-3">
            <p className="font-mono text-[12px] text-[var(--color-fg)]">{t.formula}</p>
            <p>{t.note}</p>
            <div>
              <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-[var(--color-fg-dim)] mb-1.5">
                {t.sourcesTitle}
              </div>
              <ul className="space-y-1.5">
                <li>
                  • {t.s1}{" "}
                  <a href={SOURCE_LINKS.study} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
                    arXiv 2302.06590
                  </a>
                </li>
                <li>
                  • {t.s2}{" "}
                  <a href={SOURCE_LINKS.prices} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
                    {t.pricesLink}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-7 text-center">
        <a
          href="/api/download"
          data-cta="calculator-primary"
          className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-[14px] font-semibold text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] transition-all glow-accent hover:-translate-y-px"
        >
          <Download size={15} strokeWidth={2.4} />
          {t.cta}
        </a>
      </div>
    </section>
  );
}

function Slider({
  label,
  value,
  hint,
  last,
  children,
}: {
  label: string;
  value: string;
  hint?: string;
  last?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={last ? "" : "mb-6"}>
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <label className="text-[13.5px] font-medium text-[var(--color-fg)] leading-snug">{label}</label>
        <span className="shrink-0 text-[14px] font-semibold tabular-nums text-[var(--color-accent)]">{value}</span>
      </div>
      {children}
      {hint ? <p className="mt-1.5 text-[11.5px] text-[var(--color-fg-dim)] leading-relaxed">{hint}</p> : null}
    </div>
  );
}

function Range({
  value,
  onChange,
  min,
  max,
  step,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
}) {
  const p = ((value - min) / (max - min)) * 100;
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-[var(--color-accent)]"
      style={{
        background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${p}%, var(--color-panel-2) ${p}%, var(--color-panel-2) 100%)`,
      }}
    />
  );
}
