"use client";

import { useMemo, useState } from "react";
import type { Locale } from "@/content";

/**
 * §10 Capacity Calculator — reencuadre completo a "capacidad" (2026-07-24).
 * Ya NO habla de dinero: mide horas recuperadas. Tres sliders, una fórmula,
 * y una equivalencia en "personas de tiempo completo".
 *
 *   horasMes = procesos × horas × %delegable × 4.33
 *
 * Copy exacto del prototipo aprobado. Bilingüe ES/EN.
 */

const WEEKS_PER_MONTH = 4.33;
const MONTHS_PER_YEAR = 12;

const T = {
  es: {
    eyebrow: "Calcula tu capacidad",
    title: "¿Cuánta capacidad le agregas a tu empresa?",
    subtitle:
      "Mueve los controles con la realidad de tu negocio. Medimos horas de trabajo recuperadas — no costo de tecnología.",
    sProc: {
      label: "Procesos que repites cada semana",
      hint: "Propuestas, reportes, seguimientos, facturas, publicaciones…",
    },
    sHpp: { label: "Horas que te toma cada uno" },
    sDel: {
      label: "¿Cuántos podrían delegarse?",
      hint: "Los que siguen un patrón: la IA los ejecuta y tú solo revisas.",
    },
    outHoursLabel: "Horas recuperadas al mes",
    outProcs: "Procesos delegados por semana",
    outYear: "Horas recuperadas al año",
    cta: "Recupera esas horas gratis",
    fte: {
      quarter: "Equivale a un cuarto de persona de tiempo completo",
      half: "Equivale a media persona de tiempo completo",
      one: "Equivale a una persona de tiempo completo",
      many: (n: number) => `Equivale a ${n} personas de tiempo completo`,
    },
    hSuffix: "h",
  },
  en: {
    eyebrow: "Calculate your capacity",
    title: "How much capacity do you add to your business?",
    subtitle:
      "Move the controls to match your reality. We measure hours of work recovered — not the cost of technology.",
    sProc: {
      label: "Processes you repeat every week",
      hint: "Proposals, reports, follow-ups, invoices, posts…",
    },
    sHpp: { label: "Hours each one takes" },
    sDel: {
      label: "How many could be delegated?",
      hint: "The ones that follow a pattern: the AI runs them and you just review.",
    },
    outHoursLabel: "Hours recovered per month",
    outProcs: "Processes delegated per week",
    outYear: "Hours recovered per year",
    cta: "Recover those hours for free",
    fte: {
      quarter: "Equivalent to a quarter of a full-time person",
      half: "Equivalent to half a full-time person",
      one: "Equivalent to one full-time person",
      many: (n: number) => `Equivalent to ${n} full-time people`,
    },
    hSuffix: "h",
  },
} as const;

function formatInt(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

interface FteCopy {
  quarter: string;
  half: string;
  one: string;
  many: (n: number) => string;
}

/**
 * Escala del prototipo: <40 cuarto · 40-80 media · 80-160 una · >160 X personas.
 */
function fteLabel(hoursPerMonth: number, tFte: FteCopy): string {
  if (hoursPerMonth < 40) return tFte.quarter;
  if (hoursPerMonth < 80) return tFte.half;
  if (hoursPerMonth < 160) return tFte.one;
  const n = Math.round(hoursPerMonth / 160);
  return tFte.many(n);
}

export function CapacityCalculator({ lang }: { lang: Locale }) {
  const t = T[lang];

  const [procesos, setProcesos] = useState(12);
  const [horas, setHoras] = useState(2.5);
  const [delegablePct, setDelegablePct] = useState(70);

  const { hoursPerMonth, procsDelegated, hoursPerYear, fte } = useMemo(() => {
    const pctFraction = delegablePct / 100;
    const perMonth = procesos * horas * pctFraction * WEEKS_PER_MONTH;
    return {
      hoursPerMonth: perMonth,
      procsDelegated: procesos * pctFraction,
      hoursPerYear: perMonth * MONTHS_PER_YEAR,
      fte: fteLabel(perMonth, t.fte),
    };
  }, [procesos, horas, delegablePct, t.fte]);

  return (
    <section
      id="calculadora"
      className="scroll-mt-20 mx-auto max-w-6xl px-5 md:px-6 py-20 md:py-24"
    >
      <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
        <span className="text-[12.5px] font-mono uppercase tracking-[0.12em] text-[var(--color-accent)]">
          {t.eyebrow}
        </span>
        <h2
          className="mt-3 font-semibold tracking-tight text-[var(--color-fg-strong)] leading-[1.08]"
          style={{ fontSize: "clamp(1.75rem, 4.4vw, 2.75rem)" }}
        >
          {t.title}
        </h2>
        <p className="mt-3 text-[15px] text-[var(--color-fg-muted)] leading-relaxed">
          {t.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Sliders */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-6 md:p-7">
          <SliderRow
            label={t.sProc.label}
            hint={t.sProc.hint}
            value={procesos}
            display={String(procesos)}
            min={1}
            max={50}
            step={1}
            onChange={setProcesos}
          />
          <SliderRow
            label={t.sHpp.label}
            value={horas}
            display={`${horas} ${t.hSuffix}`}
            min={0.5}
            max={8}
            step={0.5}
            onChange={setHoras}
          />
          <SliderRow
            label={t.sDel.label}
            hint={t.sDel.hint}
            value={delegablePct}
            display={`${delegablePct}%`}
            min={10}
            max={100}
            step={5}
            onChange={setDelegablePct}
          />
        </div>

        {/* Output */}
        <div className="rounded-2xl border-2 border-[var(--color-accent)] bg-[var(--color-accent)]/[6%] p-6 md:p-7 flex flex-col">
          <span className="text-[12px] font-mono uppercase tracking-[0.14em] text-[var(--color-fg-muted)]">
            {t.outHoursLabel}
          </span>
          <div
            className="mt-2 font-semibold text-[var(--color-fg-strong)] leading-none tabular-nums"
            style={{ fontSize: "clamp(3rem, 8vw, 5rem)" }}
          >
            {formatInt(hoursPerMonth)}{" "}
            <span className="text-[var(--color-accent)]">{t.hSuffix}</span>
          </div>
          <p className="mt-3 text-[14px] text-[var(--color-fg-muted)]">{fte}</p>

          <div className="mt-6 space-y-2.5 border-t border-[var(--color-border)] pt-5">
            <OutputRow label={t.outProcs} value={formatInt(procsDelegated)} />
            <OutputRow
              label={t.outYear}
              value={`${formatInt(hoursPerYear)} ${t.hSuffix}`}
            />
          </div>

          <a
            href="#pricing"
            data-cta="capacity-calc"
            className="mt-auto pt-6 inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] text-white text-[14px] font-semibold px-5 py-3 transition-colors"
          >
            {t.cta}
          </a>
        </div>
      </div>
    </section>
  );
}

function SliderRow({
  label,
  hint,
  value,
  display,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  hint?: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="py-4 first:pt-1 last:pb-1 border-b last:border-b-0 border-[var(--color-border)]">
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <label className="text-[13.5px] text-[var(--color-fg)] font-medium">
          {label}
        </label>
        <span className="font-mono text-[15px] font-semibold text-[var(--color-accent)] tabular-nums">
          {display}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-[var(--color-accent)]"
        aria-label={label}
      />
      {hint && (
        <p className="mt-1.5 text-[12px] text-[var(--color-fg-muted)] leading-relaxed">
          {hint}
        </p>
      )}
    </div>
  );
}

function OutputRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-[13px] text-[var(--color-fg-muted)]">{label}</span>
      <span className="font-mono text-[14px] font-semibold text-[var(--color-fg-strong)] tabular-nums">
        {value}
      </span>
    </div>
  );
}
