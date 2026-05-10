"use client";

import { useState, useMemo } from "react";
import { Download, Sparkles } from "lucide-react";
import type { Dict } from "@/content";
import type { CurrencyHint } from "@/lib/geoCurrency";
import { formatLocal } from "@/lib/geoCurrency";

/**
 * Sliders + live numbers showing how much a dev saves per year by mixing
 * Claude/Gemini/Codex through TerminalSync vs. paying for a single AI's
 * heavy plan and burning extra hours.
 *
 * Numbers come from list prices Anthropic/OpenAI/Google + tool-mixing
 * productivity studies. Defaults are tuned to "mid-LATAM dev, full-time".
 *
 * Values are display-only — no telemetry, no API call. Pure client math.
 */

// Tunable constants — keep these here (not in dict) so adjusting model
// pricing is a code-change, not a translation update.
// Solo-vendor and mix costs are linearly interpolated by `heavyMix` —
// the % of the user's tasks that are heavy reasoning vs simple code.
//
//   heavyMix = 0  (all simple code edits) → solo $5/h, mix $0.50/h
//   heavyMix = 1  (all heavy reasoning)   → solo $15/h, mix $2.50/h
//
// The intuition: simple tasks are cheap on Codex / free on Gemini, but
// in single-vendor mode you still pay long-context+vision overhead on
// Claude Pro/Codex Pro for every prompt. Heavy tasks need Claude no
// matter what, so the gap shrinks but mix still wins via Codex/Gemini
// for the in-between.
const SOLO_BASE = 5; // USD/h baseline (all light)
const SOLO_HEAVY_PREMIUM = 10; // USD/h extra at 100% heavy
const MIX_BASE = 0.5; // USD/h baseline (Gemini free + Codex micro)
const MIX_HEAVY_PREMIUM = 2; // USD/h extra at 100% heavy

// Time savings also vary by mix: light-task days have more rate-limit
// waits and more model-swapping (more savings via TS); heavy-reasoning
// days are bottlenecked on the human + Claude single-thread, so the
// system can shave less.
const TIME_SAVING_BASE = 0.30; // 30% saved at all-light
const TIME_SAVING_HEAVY = 0.20; // 20% saved at all-heavy

const TS_PRO_ANNUAL = 228; // USD — Pro plan @ $19/mo × 12

export function SavingsCalculator({
  dict,
  currencyHint,
}: {
  dict: Dict;
  currencyHint?: CurrencyHint;
}) {
  // The schema marks this block optional so older translations don't
  // break the type. Render nothing when copy is missing.
  const c = dict.comparison.calculator;
  if (!c) return null;

  const [rate, setRate] = useState(50);
  const [hpd, setHpd] = useState(6);
  const [dpm, setDpm] = useState(22);
  // 0..100 — % of work that is "heavy reasoning". Default 50 = balanced
  // dev who alternates simple edits (Codex/Gemini) with deep reasoning
  // (Claude). Numbers move both up and down from this center.
  const [heavyPct, setHeavyPct] = useState(50);

  const {
    hoursYear,
    soloApi,
    soloDev,
    soloTotal,
    tsApi,
    tsDev,
    tsTotal,
    savings,
    roi,
    soloPerHour,
    mixPerHour,
    timeSavingPct,
  } = useMemo(() => {
    const heavy = heavyPct / 100; // 0..1
    const soloPerHour = SOLO_BASE + SOLO_HEAVY_PREMIUM * heavy;
    const mixPerHour = MIX_BASE + MIX_HEAVY_PREMIUM * heavy;
    const timeSavingPct =
      TIME_SAVING_BASE - (TIME_SAVING_BASE - TIME_SAVING_HEAVY) * heavy;

    const hoursYear = hpd * dpm * 12;
    const soloApi = hoursYear * soloPerHour;
    const soloDev = hoursYear * rate;
    const soloTotal = soloApi + soloDev;
    const tsApi = hoursYear * mixPerHour;
    const tsDev = hoursYear * (1 - timeSavingPct) * rate;
    const tsTotal = tsApi + tsDev + TS_PRO_ANNUAL;
    const savings = Math.max(0, soloTotal - tsTotal);
    const roi = savings / TS_PRO_ANNUAL;
    return {
      hoursYear,
      soloApi,
      soloDev,
      soloTotal,
      tsApi,
      tsDev,
      tsTotal,
      savings,
      roi,
      soloPerHour,
      mixPerHour,
      timeSavingPct,
    };
  }, [rate, hpd, dpm, heavyPct]);

  const fmtUsd = (n: number) =>
    `$${Math.round(n).toLocaleString("en-US")}`;
  const fmtHours = (n: number) =>
    Math.round(n).toLocaleString("en-US");
  const fmtRoi = (n: number) =>
    n >= 100 ? `${Math.round(n)}×` : `${n.toFixed(1)}×`;

  return (
    <section
      id="savings-calculator"
      className="mx-auto max-w-6xl px-5 md:px-6 py-20 md:py-24"
    >
      <div className="text-center max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--color-accent)] border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 px-3 py-1 rounded-full">
          <Sparkles size={11} strokeWidth={2.4} />
          {c.eyebrow}
        </span>
        <h2
          className="mt-4 font-semibold tracking-tight text-[var(--color-fg-strong)] leading-[1.08]"
          style={{ fontSize: "clamp(1.625rem, 4vw, 2.5rem)" }}
        >
          {c.title}
        </h2>
        <p className="mt-3 text-[15px] text-[var(--color-fg-muted)] leading-relaxed">
          {c.subtitle}
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* INPUTS — three sliders with live values inline */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-6 md:p-8">
          <Slider
            label={c.inputs.rate.label}
            help={c.inputs.rate.help}
            value={rate}
            onChange={setRate}
            min={10}
            max={200}
            step={5}
            valueLabel={`${fmtUsd(rate)}/h`}
          />
          <Slider
            label={c.inputs.hoursPerDay.label}
            value={hpd}
            onChange={setHpd}
            min={2}
            max={12}
            step={1}
            valueLabel={`${hpd} ${c.inputs.hoursPerDay.suffix}`}
          />
          <Slider
            label={c.inputs.daysPerMonth.label}
            value={dpm}
            onChange={setDpm}
            min={5}
            max={30}
            step={1}
            valueLabel={`${dpm} ${c.inputs.daysPerMonth.suffix}`}
          />
          {/* Task-mix slider — JM's ask: a dimension that captures
              "code sencillo vs reasoning pesado". Drives both API
              cost ramps AND the productivity savings, so the big
              number reacts in a way users can feel. */}
          {c.inputs.taskMix ? (
            <Slider
              label={c.inputs.taskMix.label}
              help={c.inputs.taskMix.help}
              value={heavyPct}
              onChange={setHeavyPct}
              min={0}
              max={100}
              step={5}
              valueLabel={`${heavyPct}%`}
              endpoints={{
                left: c.inputs.taskMix.lightLabel,
                right: c.inputs.taskMix.heavyLabel,
              }}
              last
            />
          ) : null}

          <div className="mt-7 pt-6 border-t border-dashed border-[var(--color-border)] grid grid-cols-2 gap-4">
            <CostCard
              label={c.results.soloLabel}
              hint={c.results.soloHint}
              value={fmtUsd(soloTotal)}
              tone="dim"
            />
            <CostCard
              label={c.results.withTsLabel}
              hint={c.results.withTsHint}
              value={fmtUsd(tsTotal)}
              tone="ok"
            />
          </div>
        </div>

        {/* RESULTS — big savings number + ROI + breakdown */}
        <div className="rounded-2xl border border-[var(--color-accent)]/30 bg-gradient-to-br from-[var(--color-accent)]/8 to-transparent p-6 md:p-8 flex flex-col">
          <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--color-accent)]">
            {c.results.savingsLabel}
          </div>
          <div
            className="mt-2 font-semibold tracking-tight text-[var(--color-fg-strong)] leading-none tabular-nums"
            style={{ fontSize: "clamp(2.75rem, 8vw, 4.75rem)" }}
          >
            {fmtUsd(savings)}
            <span className="ml-1 text-[var(--color-fg-muted)] text-[0.4em] font-medium">
              {c.results.perYear}
            </span>
          </div>
          {currencyHint ? (
            <div className="mt-1 text-[12px] text-[var(--color-fg-dim)]">
              ≈ {formatLocal(savings, currencyHint)}
            </div>
          ) : null}

          <div className="mt-5 inline-flex items-center self-start gap-2 px-3 py-1.5 rounded-full border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/10 text-[12.5px] text-[var(--color-accent)] font-semibold">
            <span className="font-mono uppercase tracking-[0.12em] text-[10px] opacity-70">
              {c.results.roiLabel}
            </span>
            <span className="tabular-nums">{fmtRoi(roi)}</span>
            <span className="text-[var(--color-fg-muted)] text-[11px] font-normal normal-case tracking-normal">
              {c.results.roiSuffix}
            </span>
          </div>

          {/* Breakdown — small print, full math so people trust it */}
          <div className="mt-7 pt-5 border-t border-dashed border-[var(--color-border)] flex-1">
            <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-[var(--color-fg-muted)] mb-3">
              {c.breakdown.heading}
            </div>
            <BreakdownLine label={c.breakdown.hoursYear} value={fmtHours(hoursYear)} />
            {/* Per-hour values are computed live from the task-mix
                slider, so the breakdown moves visibly when the user
                drags it (proves the math isn't a fixed prop). */}
            <BreakdownLine
              label={c.breakdown.apiCostSolo.replace(
                /≈ \$\d+(\.\d+)?\/h/,
                `≈ $${soloPerHour.toFixed(2)}/h`,
              )}
              value={fmtUsd(soloApi)}
              muted
            />
            <BreakdownLine
              label={c.breakdown.apiCostMix.replace(
                /≈ \$\d+(\.\d+)?\/h/,
                `≈ $${mixPerHour.toFixed(2)}/h`,
              )}
              value={fmtUsd(tsApi)}
              muted
            />
            <BreakdownLine label={c.breakdown.devTimeSolo} value={fmtUsd(soloDev)} muted />
            <BreakdownLine
              label={c.breakdown.devTimeWithTs.replace(
                /\d+\s*%/,
                `${Math.round(timeSavingPct * 100)}%`,
              )}
              value={fmtUsd(tsDev)}
              muted
            />
            <BreakdownLine label={c.breakdown.subscription} value={fmtUsd(TS_PRO_ANNUAL)} muted />
            <p className="mt-4 text-[11.5px] leading-relaxed text-[var(--color-fg-dim)]">
              {c.breakdown.timeSaving}
            </p>
          </div>

          <a
            href="/api/download"
            data-cta="calculator-primary"
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-[14px] font-semibold text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] transition-all glow-accent hover:-translate-y-px"
          >
            <Download size={15} strokeWidth={2.4} />
            {c.cta}
          </a>
        </div>
      </div>

      <p className="mt-6 text-center text-[11.5px] text-[var(--color-fg-dim)] max-w-3xl mx-auto leading-relaxed">
        {c.caveat}
      </p>
    </section>
  );
}

function Slider({
  label,
  help,
  value,
  onChange,
  min,
  max,
  step,
  valueLabel,
  endpoints,
  last,
}: {
  label: string;
  help?: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  valueLabel: string;
  /** Optional left/right end labels (e.g. "Simple code" / "Heavy reasoning"). */
  endpoints?: { left: string; right: string };
  last?: boolean;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className={last ? "" : "mb-6"}>
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <label className="text-[13.5px] font-medium text-[var(--color-fg)]">
          {label}
        </label>
        <span className="text-[14px] font-semibold tabular-nums text-[var(--color-accent)]">
          {valueLabel}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-[var(--color-panel-2)] accent-[var(--color-accent)]"
        style={{
          background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${pct}%, var(--color-panel-2) ${pct}%, var(--color-panel-2) 100%)`,
        }}
      />
      {endpoints ? (
        <div className="mt-1 flex justify-between text-[10.5px] font-mono uppercase tracking-[0.1em] text-[var(--color-fg-dim)]">
          <span>{endpoints.left}</span>
          <span>{endpoints.right}</span>
        </div>
      ) : null}
      {help ? (
        <p className="mt-1.5 text-[11.5px] text-[var(--color-fg-dim)] leading-relaxed">
          {help}
        </p>
      ) : null}
    </div>
  );
}

function CostCard({
  label,
  hint,
  value,
  tone,
}: {
  label: string;
  hint: string;
  value: string;
  tone: "dim" | "ok";
}) {
  return (
    <div
      className={`rounded-xl p-3.5 border ${
        tone === "ok"
          ? "border-[var(--color-ok)]/30 bg-[var(--color-ok)]/5"
          : "border-[var(--color-border)] bg-[var(--color-panel-2)]/40"
      }`}
    >
      <div className="text-[10.5px] font-mono uppercase tracking-[0.12em] text-[var(--color-fg-muted)] mb-1">
        {label}
      </div>
      <div
        className={`text-[20px] font-semibold tabular-nums ${
          tone === "ok" ? "text-[var(--color-ok)]" : "text-[var(--color-fg-strong)]"
        }`}
      >
        {value}
      </div>
      <div className="mt-1 text-[11px] text-[var(--color-fg-dim)] leading-snug">
        {hint}
      </div>
    </div>
  );
}

function BreakdownLine({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 text-[12.5px] py-1 ${
        muted ? "text-[var(--color-fg-muted)]" : "text-[var(--color-fg)]"
      }`}
    >
      <span>{label}</span>
      <span className="tabular-nums font-medium text-[var(--color-fg)]">{value}</span>
    </div>
  );
}
