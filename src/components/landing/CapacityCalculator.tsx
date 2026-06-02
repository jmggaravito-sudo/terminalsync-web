"use client";

import { useState, useMemo } from "react";

/**
 * Capacity Calculator — §10 del wireframe del homepage (rediseño 2026-06).
 *
 * Reemplaza el SavingsCalculator de "costo de tokens" por uno en lenguaje
 * de dueño: cuánta CAPACIDAD recuperás al año (horas + plata) sumando tres
 * fuentes — Ejecución, Memoria y Continuidad — contra el costo de TerminalSync.
 *
 * Copy en español neutro inline (pre-i18n). Se extrae a dict cuando el
 * bloque quede lockeado. Valores ilustrativos; no hay telemetría ni API.
 *
 * Match 1:1 del prototipo de Cowork aprobado por JM (defaults → $15,179/año).
 */

const WEEKS = 52;
const FULL_TIME_YEAR_HOURS = 2080; // 40h × 52
const HOURS_PER_WORKDAY = 8;
const TS_MONTHLY = 19; // USD
const TS_ANNUAL = TS_MONTHLY * 12; // 228

export function CapacityCalculator() {
  const [rate, setRate] = useState(40); // $/h del tiempo del dueño

  // Ejecución
  const [execHours, setExecHours] = useState(12); // h/sem repetitivas
  const [execPct, setExecPct] = useState(45); // % que la IA ejecuta

  // Memoria
  const [sessions, setSessions] = useState(10); // sesiones IA/sem
  const [reexplainMin, setReexplainMin] = useState(4); // min re-explicando c/sesión

  // Continuidad
  const [fails, setFails] = useState(5); // veces/sem que una IA falla/limita
  const [lostMin, setLostMin] = useState(12); // min perdidos c/vez
  const [extraSubs, setExtraSubs] = useState(2); // subs IA extra
  const [subCost, setSubCost] = useState(20); // $/mes c/sub

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

    return {
      execHoursYr, execValue,
      memHoursYr, memValue,
      contHoursYr, contTimeValue, subsYr,
      totalHours, totalMoney, days, pctFTE, roi,
    };
  }, [rate, execHours, execPct, sessions, reexplainMin, fails, lostMin, extraSubs, subCost]);

  const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
  const num = (n: number) => Math.round(n).toLocaleString("en-US");

  return (
    <section id="capacity-calculator" className="mx-auto max-w-2xl px-5 md:px-6 py-20 md:py-24">
      {/* GRUPO 1 — Valor por hora */}
      <Group>
        <RowHead label="Tu valor por hora (o el de tu equipo)" value={`${usd(rate)}/h`} />
        <Range value={rate} onChange={setRate} min={10} max={200} step={5} />
        <Help>No es cuánto cobras: es cuánto vale una hora de tu tiempo enfocada en hacer crecer el negocio.</Help>
      </Group>

      {/* GRUPO 2 — Ejecución */}
      <Group title="Ejecución — capacidad que recuperas">
        <RowHead label="Horas/semana en tareas repetitivas o cosas que pospones por falta de tiempo" value={num(execHours)} />
        <Range value={execHours} onChange={setExecHours} min={0} max={40} step={1} />
        <RowHead label="% de eso que la IA puede ejecutar por ti" value={`${execPct}%`} />
        <Range value={execPct} onChange={setExecPct} min={0} max={100} step={5} />
        <Chips items={[`${num(m.execHoursYr)} h/año`, `${usd(m.execValue)}/año`]} />
      </Group>

      {/* GRUPO 3 — Memoria */}
      <Group title="Memoria permanente">
        <RowHead label="Sesiones de IA por semana" value={num(sessions)} />
        <Range value={sessions} onChange={setSessions} min={0} max={50} step={1} />
        <RowHead label="Minutos re-explicando tu contexto cada sesión" value={num(reexplainMin)} />
        <Range value={reexplainMin} onChange={setReexplainMin} min={0} max={30} step={1} />
        <Chips items={[`${num(m.memHoursYr)} h/año`, `${usd(m.memValue)}/año`]} />
        <Help>Nunca repites quién eres, tu tono, tus reglas, dónde quedaste.</Help>
      </Group>

      {/* GRUPO 4 — Continuidad */}
      <Group title="Continuidad — nunca te quedas trabado">
        <RowHead label="Veces/semana que una IA llega a su límite o falla" value={num(fails)} />
        <Range value={fails} onChange={setFails} min={0} max={30} step={1} />
        <RowHead label="Minutos perdidos cada vez (esperar, cambiar, repetir)" value={num(lostMin)} />
        <Range value={lostMin} onChange={setLostMin} min={0} max={60} step={1} />
        <RowHead label="Suscripciones de IA extra que pagas hoy para esquivar límites" value={num(extraSubs)} />
        <Range value={extraSubs} onChange={setExtraSubs} min={0} max={10} step={1} />
        <RowHead label="Costo de cada suscripción al mes" value={`${usd(subCost)}/mes`} />
        <Range value={subCost} onChange={setSubCost} min={0} max={100} step={5} />
        <Chips items={[`${num(m.contHoursYr)} h/año`, `${usd(m.contTimeValue)}/año`, `${usd(m.subsYr)}/año subs`]} />
      </Group>

      {/* RESULTADO */}
      <div className="mt-6 rounded-2xl border border-[var(--color-ok)]/40 bg-[var(--color-ok)]/8 px-6 py-8 text-center">
        <div className="text-[13px] text-[var(--color-fg-muted)]">Lo que recuperas al año</div>
        <div className="mt-1 font-semibold tracking-tight text-[var(--color-ok)] leading-none tabular-nums" style={{ fontSize: "clamp(3rem, 11vw, 4.5rem)" }}>
          {usd(m.totalMoney)}
        </div>
        <div className="mt-3 text-[14px] text-[var(--color-fg)]">
          {num(m.totalHours)} horas/año · ≈ {num(m.days)} días de trabajo recuperados
        </div>
        <div className="mt-4 inline-flex items-center rounded-full border border-[var(--color-ok)]/40 bg-[var(--color-ok)]/10 px-4 py-1.5 text-[13px] font-semibold text-[var(--color-ok)]">
          ≈ {num(m.pctFTE)}% de una persona a tiempo completo — sin nómina
        </div>
        <div className="mt-4 text-[13px] text-[var(--color-fg-muted)]">
          TerminalSync cuesta {usd(TS_MONTHLY)}/mes · retorno {num(m.roi)}×
        </div>
      </div>

      <p className="mt-6 text-center text-[12px] text-[var(--color-fg-dim)]">
        Valores ilustrativos para validar la lógica · luego se afinan con datos reales.
      </p>
    </section>
  );
}

function Group({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-6 md:p-7">
      {title ? (
        <h3 className="mb-4 text-[15px] font-semibold text-[var(--color-fg-strong)]">{title}</h3>
      ) : null}
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

function Range({ value, onChange, min, max, step }: {
  value: number; onChange: (v: number) => void; min: number; max: number; step: number;
}) {
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
