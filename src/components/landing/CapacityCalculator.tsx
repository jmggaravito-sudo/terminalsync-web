"use client";

import { useState, useMemo } from "react";
import type { Locale } from "@/content";

/**
 * §10 Capacity Calculator — capacidad recuperada al año (horas + plata) de
 * tres fuentes: Ejecución, Memoria y Continuidad. Lenguaje de dueño.
 * Bilingüe (ES neutro / EN). Valores ilustrativos; pura matemática cliente.
 * Defaults → $15,179/año (match del prototipo de Cowork).
 */

const WEEKS = 52;
const FULL_TIME_YEAR_HOURS = 2080;
const HOURS_PER_WORKDAY = 8;
const TS_MONTHLY = 19;
const TS_ANNUAL = TS_MONTHLY * 12;

const T = {
  es: {
    eyebrow: "Calculadora",
    title: "Mira cuánto te devuelve TerminalSync",
    subtitle: "Pon tus números reales y mira la capacidad, las horas y la plata que recuperas al año.",
    rateLabel: "Tu valor por hora (o el de tu equipo)",
    rateHelp: "No es cuánto cobras: es cuánto vale una hora de tu tiempo enfocada en hacer crecer el negocio.",
    execTitle: "Ejecución — capacidad que recuperas",
    execHours: "Horas/semana en tareas repetitivas o cosas que pospones por falta de tiempo",
    execPct: "% de eso que la IA puede ejecutar por ti",
    memTitle: "Memoria permanente",
    sessions: "Sesiones de IA por semana",
    reexplain: "Minutos re-explicando tu contexto cada sesión",
    memHelp: "Nunca repites quién eres, tu tono, tus reglas, dónde quedaste.",
    contTitle: "Continuidad — nunca te quedas trabado",
    fails: "Veces/semana que una IA llega a su límite o falla",
    lost: "Minutos perdidos cada vez (esperar, cambiar, repetir)",
    subs: "Suscripciones de IA extra que pagas hoy para esquivar límites",
    subCost: "Costo de cada suscripción al mes",
    hYr: "h/año", perYr: "/año", subsTag: "/año subs", perMo: "/mes",
    resultLabel: "Lo que recuperas al año",
    resultHours: (h: string, d: string) => `${h} horas/año · ≈ ${d} días de trabajo recuperados`,
    fte: (p: string) => `≈ ${p}% de una persona a tiempo completo — sin nómina`,
    cost: (m: string, roi: string) => `TerminalSync cuesta ${m}/mes · retorno ${roi}×`,
    caveat: "Valores ilustrativos para validar la lógica · luego se afinan con datos reales.",
  },
  en: {
    eyebrow: "Calculator",
    title: "See how much TerminalSync gives you back",
    subtitle: "Plug in your real numbers and see the capacity, hours and money you get back per year.",
    rateLabel: "Your value per hour (or your team's)",
    rateHelp: "Not what you charge: what an hour of your time is worth when focused on growing the business.",
    execTitle: "Execution — capacity you get back",
    execHours: "Hours/week on repetitive tasks or things you postpone for lack of time",
    execPct: "% of that the AI can do for you",
    memTitle: "Permanent memory",
    sessions: "AI sessions per week",
    reexplain: "Minutes re-explaining your context each session",
    memHelp: "You never repeat who you are, your tone, your rules, where you left off.",
    contTitle: "Continuity — you never get stuck",
    fails: "Times/week an AI hits its limit or fails",
    lost: "Minutes lost each time (waiting, switching, repeating)",
    subs: "Extra AI subscriptions you pay today to dodge limits",
    subCost: "Cost of each subscription per month",
    hYr: "h/yr", perYr: "/yr", subsTag: "/yr subs", perMo: "/mo",
    resultLabel: "What you get back per year",
    resultHours: (h: string, d: string) => `${h} hours/yr · ≈ ${d} workdays recovered`,
    fte: (p: string) => `≈ ${p}% of a full-time hire — without payroll`,
    cost: (m: string, roi: string) => `TerminalSync costs ${m}/mo · ${roi}× return`,
    caveat: "Illustrative values to validate the logic · later tuned with real data.",
  },
} as const;

export function CapacityCalculator({ lang }: { lang: Locale }) {
  const t = T[lang];
  const [rate, setRate] = useState(40);
  const [execHours, setExecHours] = useState(12);
  const [execPct, setExecPct] = useState(45);
  const [sessions, setSessions] = useState(10);
  const [reexplainMin, setReexplainMin] = useState(4);
  const [fails, setFails] = useState(5);
  const [lostMin, setLostMin] = useState(12);
  const [extraSubs, setExtraSubs] = useState(2);
  const [subCost, setSubCost] = useState(20);

  const m = useMemo(() => {
    const execHoursYr = execHours * (execPct / 100) * WEEKS;
    const execValue = execHoursYr * rate;
    const memHoursYr = ((sessions * reexplainMin) / 60) * WEEKS;
    const memValue = memHoursYr * rate;
    const contHoursYr = ((fails * lostMin) / 60) * WEEKS;
    const contTimeValue = contHoursYr * rate;
    const subsYr = extraSubs * subCost * 12;
    const totalHours = execHoursYr + memHoursYr + contHoursYr;
    const totalMoney = execValue + memValue + contTimeValue + subsYr;
    const days = totalHours / HOURS_PER_WORKDAY;
    const pctFTE = (totalHours / FULL_TIME_YEAR_HOURS) * 100;
    const roi = totalMoney / TS_ANNUAL;
    return { execHoursYr, execValue, memHoursYr, memValue, contHoursYr, contTimeValue, subsYr, totalHours, totalMoney, days, pctFTE, roi };
  }, [rate, execHours, execPct, sessions, reexplainMin, fails, lostMin, extraSubs, subCost]);

  const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
  const num = (n: number) => Math.round(n).toLocaleString("en-US");

  return (
    <section id="capacity-calculator" className="mx-auto max-w-2xl px-5 md:px-6 py-20 md:py-24">
      <div className="text-center mb-10">
        <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--color-accent)]">{t.eyebrow}</span>
        <h2 className="mt-3 font-semibold tracking-tight text-[var(--color-fg-strong)] leading-[1.08]" style={{ fontSize: "clamp(1.75rem, 4.5vw, 2.75rem)" }}>
          {t.title}
        </h2>
        <p className="mt-3 text-[16px] text-[var(--color-fg-muted)] leading-relaxed">{t.subtitle}</p>
      </div>

      <Group>
        <RowHead label={t.rateLabel} value={`${usd(rate)}/h`} />
        <Range value={rate} onChange={setRate} min={10} max={200} step={5} />
        <Help>{t.rateHelp}</Help>
      </Group>

      <Group title={t.execTitle}>
        <RowHead label={t.execHours} value={num(execHours)} />
        <Range value={execHours} onChange={setExecHours} min={0} max={40} step={1} />
        <RowHead label={t.execPct} value={`${execPct}%`} />
        <Range value={execPct} onChange={setExecPct} min={0} max={100} step={5} />
        <Chips items={[`${num(m.execHoursYr)} ${t.hYr}`, `${usd(m.execValue)}${t.perYr}`]} />
      </Group>

      <Group title={t.memTitle}>
        <RowHead label={t.sessions} value={num(sessions)} />
        <Range value={sessions} onChange={setSessions} min={0} max={50} step={1} />
        <RowHead label={t.reexplain} value={num(reexplainMin)} />
        <Range value={reexplainMin} onChange={setReexplainMin} min={0} max={30} step={1} />
        <Chips items={[`${num(m.memHoursYr)} ${t.hYr}`, `${usd(m.memValue)}${t.perYr}`]} />
        <Help>{t.memHelp}</Help>
      </Group>

      <Group title={t.contTitle}>
        <RowHead label={t.fails} value={num(fails)} />
        <Range value={fails} onChange={setFails} min={0} max={30} step={1} />
        <RowHead label={t.lost} value={num(lostMin)} />
        <Range value={lostMin} onChange={setLostMin} min={0} max={60} step={1} />
        <RowHead label={t.subs} value={num(extraSubs)} />
        <Range value={extraSubs} onChange={setExtraSubs} min={0} max={10} step={1} />
        <RowHead label={t.subCost} value={`${usd(subCost)}${t.perMo}`} />
        <Range value={subCost} onChange={setSubCost} min={0} max={100} step={5} />
        <Chips items={[`${num(m.contHoursYr)} ${t.hYr}`, `${usd(m.contTimeValue)}${t.perYr}`, `${usd(m.subsYr)}${t.subsTag}`]} />
      </Group>

      <div className="mt-6 rounded-2xl border border-[var(--color-ok)]/40 bg-[var(--color-ok)]/8 px-6 py-8 text-center">
        <div className="text-[13px] text-[var(--color-fg-muted)]">{t.resultLabel}</div>
        <div className="mt-1 font-semibold tracking-tight text-[var(--color-ok)] leading-none tabular-nums" style={{ fontSize: "clamp(3rem, 11vw, 4.5rem)" }}>
          {usd(m.totalMoney)}
        </div>
        <div className="mt-3 text-[14px] text-[var(--color-fg)]">{t.resultHours(num(m.totalHours), num(m.days))}</div>
        <div className="mt-4 inline-flex items-center rounded-full border border-[var(--color-ok)]/40 bg-[var(--color-ok)]/10 px-4 py-1.5 text-[13px] font-semibold text-[var(--color-ok)]">
          {t.fte(num(m.pctFTE))}
        </div>
        <div className="mt-4 text-[13px] text-[var(--color-fg-muted)]">{t.cost(usd(TS_MONTHLY), num(m.roi))}</div>
      </div>

      <p className="mt-6 text-center text-[12px] text-[var(--color-fg-dim)]">{t.caveat}</p>
    </section>
  );
}

function Group({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-6 md:p-7">
      {title ? <h3 className="mb-4 text-[15px] font-semibold text-[var(--color-fg-strong)]">{title}</h3> : null}
      {children}
    </div>
  );
}

function RowHead({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-2 mt-4 first:mt-0">
      <label className="text-[13.5px] text-[var(--color-fg)] leading-snug">{label}</label>
      <span className="shrink-0 text-[14px] font-semibold tabular-nums text-[var(--color-accent)]">{value}</span>
    </div>
  );
}

function Range({ value, onChange, min, max, step }: { value: number; onChange: (v: number) => void; min: number; max: number; step: number }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-[var(--color-accent)]"
      style={{ background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${pct}%, var(--color-panel-2) ${pct}%, var(--color-panel-2) 100%)` }}
    />
  );
}

function Chips({ items }: { items: string[] }) {
  return (
    <div className="mt-5 flex flex-wrap gap-2.5">
      {items.map((t) => (
        <span key={t} className="inline-flex items-center rounded-lg border border-[var(--color-ok)]/35 bg-[var(--color-ok)]/8 px-3 py-1 text-[13px] font-medium tabular-nums text-[var(--color-ok)]">
          {t}
        </span>
      ))}
    </div>
  );
}

function Help({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 text-[12px] text-[var(--color-fg-dim)] leading-relaxed">{children}</p>;
}
