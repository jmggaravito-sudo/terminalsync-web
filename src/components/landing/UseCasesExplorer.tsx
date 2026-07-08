"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, X, ChevronDown, Download } from "lucide-react";
import type { Locale } from "@/content";
import {
  AREAS,
  AI_WHY,
  LEVEL_LABELS,
  JOB_CATS,
  CASES,
  JOBS,
  type UseCase,
  type Job,
  type AI,
  type Level,
} from "@/content/useCases";

// ─── AI badge ─────────────────────────────────────────────────────────────────

function AIBadge({ ai, small }: { ai: AI; small?: boolean }) {
  const why = AI_WHY.find((a) => a.id === ai)!;
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${small ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]"}`}
      style={{
        background: `color-mix(in oklch, ${why.color} 14%, transparent)`,
        color: why.color,
      }}
    >
      {ai}
    </span>
  );
}

// ─── Level badge ──────────────────────────────────────────────────────────────

function LevelBadge({ level, lang }: { level: Level; lang: Locale }) {
  const meta = LEVEL_LABELS.find((l) => l.id === level)!;
  const cls =
    level === "basico"
      ? "bg-[var(--color-panel-2)] text-[var(--color-fg-muted)] border-[var(--color-border)]"
      : level === "intermedio"
        ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)] border-[var(--color-accent)]/20"
        : "bg-amber-500/10 text-amber-500 border-amber-500/20";
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border ${cls}`}>
      {lang === "es" ? meta.es : meta.en}
    </span>
  );
}

// ─── Filter chip ──────────────────────────────────────────────────────────────

function filterChipClass(active: boolean) {
  return `rounded-full px-3 py-1.5 text-[12.5px] font-semibold transition-colors cursor-pointer select-none ${
    active
      ? "bg-[var(--color-accent)] text-white"
      : "border border-[var(--color-border)] bg-[var(--color-panel)] text-[var(--color-fg-muted)] hover:border-[var(--color-accent)]/40 hover:text-[var(--color-fg)]"
  }`;
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ lang, onClear }: { lang: Locale; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
      <span className="text-4xl">🔍</span>
      <p className="text-[15px] font-medium text-[var(--color-fg-strong)]">
        {lang === "es" ? "Sin resultados" : "No results"}
      </p>
      <p className="text-[13px] text-[var(--color-fg-muted)]">
        {lang === "es" ? "Prueba otros filtros." : "Try different filters."}
      </p>
      <button
        type="button"
        onClick={onClear}
        className="mt-2 text-[13px] font-semibold text-[var(--color-accent)] underline underline-offset-2"
      >
        {lang === "es" ? "Limpiar filtros" : "Clear filters"}
      </button>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function Modal({
  open,
  onClose,
  tab,
  title,
  lang,
}: {
  open: boolean;
  onClose: () => void;
  tab: "prompts" | "jobs";
  title: string;
  lang: Locale;
}) {
  if (!open) return null;
  const isEs = lang === "es";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6 shadow-2xl">
        <h3 className="text-[17px] font-semibold text-[var(--color-fg-strong)] mb-2 leading-snug">
          {tab === "prompts"
            ? (isEs ? "Usar este caso" : "Use this case")
            : (isEs ? "Contratar este trabajador digital" : "Hire this digital worker")}
        </h3>
        <p className="text-[13px] text-[var(--color-fg-muted)] mb-6 leading-relaxed">
          {tab === "prompts"
            ? (isEs
                ? `Descarga TerminalSync y abre "${title}" con tu IA preferida. El prompt ya está listo.`
                : `Download TerminalSync and open "${title}" with your preferred AI. The prompt is already ready.`)
            : (isEs
                ? `Descarga TerminalSync y activa "${title}" en minutos. Tu empleado digital trabaja solo desde el primer día.`
                : `Download TerminalSync and activate "${title}" in minutes. Your digital worker runs on its own from day one.`)}
        </p>
        <div className="flex flex-col gap-2">
          <a
            href="/api/download"
            className="flex items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] text-white text-[14px] font-semibold py-3 hover:bg-[var(--color-accent-soft)] transition-colors"
          >
            <Download size={14} strokeWidth={2.3} />
            {isEs ? "Descargar TerminalSync" : "Download TerminalSync"}
          </a>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] text-[14px] font-medium text-[var(--color-fg-muted)] py-3 hover:text-[var(--color-fg)] transition-colors"
          >
            {isEs ? "Cerrar" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Tab 1: Prompt cases ─────────────────────────────────────────────────────

function CaseCard({
  uc,
  lang,
  selected,
  onClick,
}: {
  uc: UseCase;
  lang: Locale;
  selected: boolean;
  onClick: () => void;
}) {
  const area = AREAS.find((a) => a.id === uc.area);
  const copy = uc[lang];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-xl border p-4 transition-all ${
        selected
          ? "border-[var(--color-accent)] bg-[var(--color-accent)]/6 shadow-[0_0_0_1px_var(--color-accent)]"
          : "border-[var(--color-border)] bg-[var(--color-panel)] hover:border-[var(--color-accent)]/40 hover:bg-[var(--color-panel-2)]"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
          <span className="text-[11px] text-[var(--color-fg-dim)] shrink-0">
            {area?.icon} {area ? (lang === "es" ? area.es : area.en) : ""}
          </span>
          {uc.used && (
            <span
              className="text-[9px] font-bold uppercase tracking-[0.1em] shrink-0"
              style={{ color: "#b7791f" }}
            >
              ★ {lang === "es" ? "Más usado" : "Most used"}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <AIBadge ai={uc.ai} small />
          <LevelBadge level={uc.level} lang={lang} />
        </div>
      </div>
      <p className="text-[13.5px] font-semibold text-[var(--color-fg-strong)] leading-snug">{copy.t}</p>
    </button>
  );
}

function CaseDetailPanel({
  uc,
  lang,
  onCta,
}: {
  uc: UseCase;
  lang: Locale;
  onCta: () => void;
}) {
  const area = AREAS.find((a) => a.id === uc.area);
  const copy = uc[lang];
  const aiInfo = AI_WHY.find((a) => a.id === uc.ai)!;
  return (
    <div className="h-full flex flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] overflow-hidden">
      <div className="px-6 pt-6 pb-5 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="text-[11px] font-mono uppercase tracking-[0.13em] text-[var(--color-fg-dim)]">
            {area?.icon} {area ? (lang === "es" ? area.es : area.en) : ""}
          </span>
          <span className="text-[var(--color-border)]">·</span>
          <AIBadge ai={uc.ai} />
          <LevelBadge level={uc.level} lang={lang} />
          {uc.used && (
            <span
              className="text-[9.5px] font-bold uppercase tracking-[0.1em]"
              style={{ color: "#b7791f" }}
            >
              ★ {lang === "es" ? "Más usado" : "Most used"}
            </span>
          )}
        </div>
        <h2 className="text-[22px] font-semibold tracking-tight text-[var(--color-fg-strong)] leading-snug">
          {copy.t}
        </h2>
        <p className="mt-1.5 text-[14px] text-[var(--color-fg-muted)] leading-relaxed">{copy.d}</p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
        <div className="rounded-xl bg-[var(--color-panel-2)] border border-[var(--color-border)] p-4">
          <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--color-fg-dim)] mb-2">
            {lang === "es" ? "Empieza con este texto" : "Start with this text"}
          </p>
          <pre className="text-[12.5px] font-mono text-[var(--color-fg)] leading-relaxed whitespace-pre-wrap break-words">
            {copy.p}
          </pre>
        </div>

        <div
          className="rounded-xl p-4"
          style={{
            background: `color-mix(in oklch, ${aiInfo.color} 7%, transparent)`,
            border: `1px solid color-mix(in oklch, ${aiInfo.color} 22%, transparent)`,
          }}
        >
          <p className="text-[10px] font-semibold mb-1 uppercase tracking-[0.1em]" style={{ color: aiInfo.color }}>
            {lang === "es" ? `IA recomendada — ${uc.ai}` : `Recommended AI — ${uc.ai}`}
          </p>
          <p className="text-[13px] text-[var(--color-fg-muted)]">
            {lang === "es" ? aiInfo.es : aiInfo.en}
          </p>
        </div>
      </div>

      <div className="px-6 pb-6 pt-2">
        <button
          type="button"
          onClick={onCta}
          className="flex items-center justify-center gap-2 w-full rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] text-white text-[14px] font-semibold py-3 transition-all"
        >
          ✨ {lang === "es" ? "Usar este caso" : "Use this case"}
        </button>
      </div>
    </div>
  );
}

function CaseAccordionItem({
  uc,
  lang,
  onCta,
}: {
  uc: UseCase;
  lang: Locale;
  onCta: () => void;
}) {
  const [open, setOpen] = useState(false);
  const area = AREAS.find((a) => a.id === uc.area);
  const copy = uc[lang];
  const aiInfo = AI_WHY.find((a) => a.id === uc.ai)!;
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start justify-between gap-3 p-4 text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
            <span className="text-[10px] text-[var(--color-fg-dim)]">
              {area?.icon} {area ? (lang === "es" ? area.es : area.en) : ""}
            </span>
            {uc.used && (
              <span className="text-[9px] font-bold uppercase tracking-[0.1em]" style={{ color: "#b7791f" }}>
                ★ {lang === "es" ? "Más usado" : "Most used"}
              </span>
            )}
            <AIBadge ai={uc.ai} small />
            <LevelBadge level={uc.level} lang={lang} />
          </div>
          <p className="text-[14px] font-semibold text-[var(--color-fg-strong)] leading-snug pr-2">{copy.t}</p>
        </div>
        <ChevronDown
          size={16}
          strokeWidth={2}
          className={`shrink-0 mt-1 text-[var(--color-fg-dim)] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-[var(--color-border)] pt-4 flex flex-col gap-3">
          <p className="text-[14px] text-[var(--color-fg)] leading-relaxed">{copy.d}</p>
          <div className="rounded-lg bg-[var(--color-panel-2)] border border-[var(--color-border)] p-3">
            <p className="text-[10px] font-mono uppercase tracking-[0.13em] text-[var(--color-fg-dim)] mb-2">
              {lang === "es" ? "Empieza con este texto" : "Start with this text"}
            </p>
            <pre className="text-[12px] font-mono text-[var(--color-fg)] leading-relaxed whitespace-pre-wrap break-words">
              {copy.p}
            </pre>
          </div>
          <div
            className="rounded-lg p-3"
            style={{
              background: `color-mix(in oklch, ${aiInfo.color} 8%, transparent)`,
              border: `1px solid color-mix(in oklch, ${aiInfo.color} 20%, transparent)`,
            }}
          >
            <p className="text-[10px] font-semibold mb-1 uppercase tracking-[0.1em]" style={{ color: aiInfo.color }}>
              {lang === "es" ? `IA recomendada — ${uc.ai}` : `Recommended AI — ${uc.ai}`}
            </p>
            <p className="text-[12.5px] text-[var(--color-fg-muted)]">
              {lang === "es" ? aiInfo.es : aiInfo.en}
            </p>
          </div>
          <button
            type="button"
            onClick={onCta}
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] text-white text-[13px] font-semibold py-3 transition-all"
          >
            ✨ {lang === "es" ? "Usar este caso" : "Use this case"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Tab 2: Automated jobs ───────────────────────────────────────────────────

function JobCard({
  job,
  lang,
  selected,
  onClick,
}: {
  job: Job;
  lang: Locale;
  selected: boolean;
  onClick: () => void;
}) {
  const cat = JOB_CATS.find((c) => c.id === job.cat);
  const copy = job[lang];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-xl border p-4 transition-all ${
        selected
          ? "border-[var(--color-accent)] bg-[var(--color-accent)]/6 shadow-[0_0_0_1px_var(--color-accent)]"
          : "border-[var(--color-border)] bg-[var(--color-panel)] hover:border-[var(--color-accent)]/40 hover:bg-[var(--color-panel-2)]"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-[11px] text-[var(--color-fg-dim)]">
          {cat?.icon} {cat ? (lang === "es" ? cat.es : cat.en) : ""}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          <AIBadge ai={job.ai} small />
          <span className="text-[10px] text-[var(--color-fg-dim)] border border-[var(--color-border)] rounded-full px-2 py-0.5 bg-[var(--color-panel-2)]">
            {copy.cad}
          </span>
        </div>
      </div>
      <p className="text-[13.5px] font-semibold text-[var(--color-fg-strong)] leading-snug">{copy.t}</p>
    </button>
  );
}

function JobDetailPanel({
  job,
  lang,
  onCta,
}: {
  job: Job;
  lang: Locale;
  onCta: () => void;
}) {
  const cat = JOB_CATS.find((c) => c.id === job.cat);
  const copy = job[lang];
  const aiInfo = AI_WHY.find((a) => a.id === job.ai)!;
  return (
    <div className="h-full flex flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] overflow-hidden">
      <div className="px-6 pt-6 pb-5 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-[11px] font-mono uppercase tracking-[0.13em] text-[var(--color-fg-dim)]">
            {cat?.icon} {cat ? (lang === "es" ? cat.es : cat.en) : ""}
          </span>
          <span className="text-[var(--color-border)]">·</span>
          <AIBadge ai={job.ai} />
        </div>
        <h2 className="text-[22px] font-semibold tracking-tight text-[var(--color-fg-strong)] leading-snug">{copy.t}</h2>
        <p className="mt-1.5 text-[14px] text-[var(--color-fg-muted)] leading-relaxed">{copy.d}</p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel-2)] p-4">
          <p className="text-[10px] font-mono uppercase tracking-[0.13em] text-[var(--color-fg-dim)] mb-3">
            {lang === "es" ? "Qué hace" : "What it does"}
          </p>
          <ol className="flex flex-col gap-2.5">
            {copy.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span
                  className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold mt-0.5"
                  style={{
                    background: `color-mix(in oklch, ${aiInfo.color} 18%, transparent)`,
                    color: aiInfo.color,
                  }}
                >
                  {i + 1}
                </span>
                <span className="text-[13.5px] text-[var(--color-fg-muted)] leading-snug">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel-2)] p-3">
            <p className="text-[10px] font-mono uppercase tracking-[0.13em] text-[var(--color-fg-dim)] mb-1.5">
              {lang === "es" ? "Se ejecuta" : "Runs"}
            </p>
            <p className="text-[13px] text-[var(--color-fg)] font-medium leading-snug">{copy.cad}</p>
          </div>
          <div
            className="rounded-xl p-3"
            style={{
              background: `color-mix(in oklch, ${aiInfo.color} 7%, transparent)`,
              border: `1px solid color-mix(in oklch, ${aiInfo.color} 22%, transparent)`,
            }}
          >
            <p className="text-[10px] font-mono uppercase tracking-[0.13em] mb-1.5" style={{ color: aiInfo.color }}>
              {lang === "es" ? "IA recomendada" : "Recommended AI"}
            </p>
            <p className="text-[13px] font-semibold" style={{ color: aiInfo.color }}>{job.ai}</p>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--color-ok)]/25 bg-[var(--color-ok)]/5 p-4">
          <p className="text-[10px] font-mono uppercase tracking-[0.13em] text-[var(--color-ok)] mb-2">
            {lang === "es" ? "Te reporta" : "Reports to you"}
          </p>
          <p className="text-[13.5px] text-[var(--color-fg)] leading-relaxed">{copy.rep}</p>
        </div>
      </div>

      <div className="px-6 pb-6 pt-2">
        <button
          type="button"
          onClick={onCta}
          className="flex items-center justify-center gap-2 w-full rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] text-white text-[14px] font-semibold py-3 transition-all"
        >
          🤝 {lang === "es" ? "Contratar este trabajador digital" : "Hire this digital worker"}
        </button>
      </div>
    </div>
  );
}

function JobAccordionItem({
  job,
  lang,
  onCta,
}: {
  job: Job;
  lang: Locale;
  onCta: () => void;
}) {
  const [open, setOpen] = useState(false);
  const cat = JOB_CATS.find((c) => c.id === job.cat);
  const copy = job[lang];
  const aiInfo = AI_WHY.find((a) => a.id === job.ai)!;
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start justify-between gap-3 p-4 text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
            <span className="text-[10px] text-[var(--color-fg-dim)]">
              {cat?.icon} {cat ? (lang === "es" ? cat.es : cat.en) : ""}
            </span>
            <AIBadge ai={job.ai} small />
            <span className="text-[9.5px] text-[var(--color-fg-dim)] border border-[var(--color-border)] rounded-full px-1.5 py-0.5 bg-[var(--color-panel-2)]">
              {copy.cad}
            </span>
          </div>
          <p className="text-[14px] font-semibold text-[var(--color-fg-strong)] leading-snug pr-2">{copy.t}</p>
        </div>
        <ChevronDown
          size={16}
          strokeWidth={2}
          className={`shrink-0 mt-1 text-[var(--color-fg-dim)] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-[var(--color-border)] pt-4 flex flex-col gap-3">
          <p className="text-[14px] text-[var(--color-fg)] leading-relaxed">{copy.d}</p>
          <div className="rounded-lg bg-[var(--color-panel-2)] border border-[var(--color-border)] p-3">
            <p className="text-[10px] font-mono uppercase tracking-[0.13em] text-[var(--color-fg-dim)] mb-2">
              {lang === "es" ? "Qué hace" : "What it does"}
            </p>
            <ol className="flex flex-col gap-1.5">
              {copy.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="flex-shrink-0 text-[10px] font-bold w-4 text-[var(--color-fg-dim)] mt-0.5">
                    {i + 1}.
                  </span>
                  <span className="text-[12.5px] text-[var(--color-fg-muted)]">{step}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-2)] p-2.5">
              <p className="text-[9.5px] font-mono uppercase tracking-[0.12em] text-[var(--color-fg-dim)] mb-1">
                {lang === "es" ? "Se ejecuta" : "Runs"}
              </p>
              <p className="text-[12px] text-[var(--color-fg)] font-medium leading-snug">{copy.cad}</p>
            </div>
            <div
              className="flex-1 rounded-lg p-2.5"
              style={{
                background: `color-mix(in oklch, ${aiInfo.color} 8%, transparent)`,
                border: `1px solid color-mix(in oklch, ${aiInfo.color} 20%, transparent)`,
              }}
            >
              <p className="text-[9.5px] font-mono uppercase tracking-[0.12em] mb-1" style={{ color: aiInfo.color }}>
                {lang === "es" ? "IA recomendada" : "Recommended AI"}
              </p>
              <p className="text-[12px] font-semibold" style={{ color: aiInfo.color }}>{job.ai}</p>
            </div>
          </div>
          <div className="rounded-lg border border-[var(--color-ok)]/25 bg-[var(--color-ok)]/5 p-3">
            <p className="text-[9.5px] font-mono uppercase tracking-[0.12em] text-[var(--color-ok)] mb-1.5">
              {lang === "es" ? "Te reporta" : "Reports to you"}
            </p>
            <p className="text-[12.5px] text-[var(--color-fg)] leading-relaxed">{copy.rep}</p>
          </div>
          <button
            type="button"
            onClick={onCta}
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] text-white text-[13px] font-semibold py-3 transition-all"
          >
            🤝 {lang === "es" ? "Contratar este trabajador digital" : "Hire this digital worker"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main explorer ────────────────────────────────────────────────────────────

const FILTER_AREAS = AREAS.filter((a) => a.id !== "usados" && a.id !== "todas");

export function UseCasesExplorer({ lang }: { lang: Locale }) {
  const isEs = lang === "es";
  const [activeTab, setActiveTab] = useState<"prompts" | "jobs">("prompts");
  const [modal, setModal] = useState<{ open: boolean; tab: "prompts" | "jobs"; title: string }>({
    open: false,
    tab: "prompts",
    title: "",
  });

  // Tab 1 state
  const [search, setSearch] = useState("");
  const [area, setArea] = useState<string | null>(null);
  const [ai, setAi] = useState<AI | null>(null);
  const [level, setLevel] = useState<Level | null>(null);
  const [selectedCaseId, setSelectedCaseId] = useState<string>(CASES[0].id);

  // Tab 2 state
  const [jobCat, setJobCat] = useState<string | null>(null);
  const [jobAi, setJobAi] = useState<AI | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string>(JOBS[0].id);

  const filteredCases = useMemo(() => {
    const q = search.toLowerCase().trim();
    return CASES.filter((uc) => {
      if (area === "usados" && !uc.used) return false;
      if (area && area !== "usados" && area !== "todas" && uc.area !== area) return false;
      if (ai && uc.ai !== ai) return false;
      if (level && uc.level !== level) return false;
      if (q) {
        const copy = uc[lang];
        if (
          !copy.t.toLowerCase().includes(q) &&
          !copy.d.toLowerCase().includes(q) &&
          !copy.p.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [search, area, ai, level, lang]);

  const filteredJobs = useMemo(() => {
    return JOBS.filter((j) => {
      if (jobCat && jobCat !== "todos" && j.cat !== jobCat) return false;
      if (jobAi && j.ai !== jobAi) return false;
      return true;
    });
  }, [jobCat, jobAi]);

  const selectedCase = filteredCases.find((uc) => uc.id === selectedCaseId) ?? filteredCases[0];
  const selectedJob = filteredJobs.find((j) => j.id === selectedJobId) ?? filteredJobs[0];

  const clearCases = () => {
    setSearch("");
    setArea(null);
    setAi(null);
    setLevel(null);
  };
  const clearJobs = () => {
    setJobCat(null);
    setJobAi(null);
  };

  const hasCaseFilters = !!(search || area || ai || level);
  const hasJobFilters = !!(jobCat || jobAi);

  const handleTabChange = (tab: "prompts" | "jobs") => {
    setActiveTab(tab);
    clearCases();
    clearJobs();
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Modal
        open={modal.open}
        onClose={() => setModal((m) => ({ ...m, open: false }))}
        tab={modal.tab}
        title={modal.title}
        lang={lang}
      />

      {/* ── Page header ────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-5xl px-5 md:px-6 pt-14 pb-8">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <Link
            href={`/${lang}`}
            className="inline-flex items-center gap-1 text-[12px] font-semibold uppercase tracking-[0.13em] text-[var(--color-accent)] mb-4 hover:opacity-70 transition-opacity"
          >
            ← {isEs ? "Inicio" : "Home"}
          </Link>
          <h1
            className="font-semibold tracking-tight text-[var(--color-fg-strong)] leading-[1.08]"
            style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)" }}
          >
            {isEs
              ? "Un equipo de IAs para lo que tu empresa hace todos los días."
              : "An AI team for what your business does every day."}
          </h1>
          <p className="mt-3 text-[15px] text-[var(--color-fg-muted)] leading-relaxed">
            {isEs
              ? "Casos con prompts listos para usar y trabajadores digitales que corren solos."
              : "Ready-to-use prompt cases and digital workers that run on their own."}
          </p>
        </div>

        {/* ── Tab switcher ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => handleTabChange("prompts")}
            className={`rounded-full px-5 py-2.5 text-[13.5px] font-semibold transition-colors ${
              activeTab === "prompts"
                ? "bg-[var(--color-accent)] text-white"
                : "border border-[var(--color-border)] bg-[var(--color-panel)] text-[var(--color-fg-muted)] hover:border-[var(--color-accent)]/40"
            }`}
          >
            {isEs ? `💬 Casos con prompts (${CASES.length})` : `💬 Prompt cases (${CASES.length})`}
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("jobs")}
            className={`rounded-full px-5 py-2.5 text-[13.5px] font-semibold transition-colors ${
              activeTab === "jobs"
                ? "bg-[var(--color-accent)] text-white"
                : "border border-[var(--color-border)] bg-[var(--color-panel)] text-[var(--color-fg-muted)] hover:border-[var(--color-accent)]/40"
            }`}
          >
            {isEs ? `⚡ Trabajos automatizados (${JOBS.length})` : `⚡ Automated jobs (${JOBS.length})`}
          </button>
        </div>
      </div>

      {/* ── Tab 1: Prompt cases ─────────────────────────────────────────── */}
      {activeTab === "prompts" && (
        <div className="mx-auto max-w-5xl px-5 md:px-6">
          {/* Search */}
          <div className="relative max-w-lg mx-auto mb-7">
            <Search
              size={15}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-fg-dim)] pointer-events-none"
            />
            <input
              type="search"
              placeholder={isEs ? "Buscar casos..." : "Search cases..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] pl-10 pr-10 py-2.5 text-[14px] text-[var(--color-fg)] placeholder:text-[var(--color-fg-dim)] outline-none focus:border-[var(--color-accent)] transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-fg-dim)] hover:text-[var(--color-fg)]"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-3 mb-8">
            {/* Area filter */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-[0.13em] text-[var(--color-fg-dim)] mr-1 shrink-0">
                {isEs ? "Área" : "Area"}
              </span>
              <button
                type="button"
                onClick={() => setArea(null)}
                className={filterChipClass(area === null || area === "todas")}
              >
                {isEs ? "Todas" : "All"}
              </button>
              <button
                type="button"
                onClick={() => setArea(area === "usados" ? null : "usados")}
                className={filterChipClass(area === "usados")}
              >
                ⭐ {isEs ? "Más usados" : "Most used"}
              </button>
              {FILTER_AREAS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setArea(area === a.id ? null : a.id)}
                  className={filterChipClass(area === a.id)}
                >
                  {a.icon} {isEs ? a.es : a.en}
                </button>
              ))}
            </div>

            {/* Level + AI filter */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-[0.13em] text-[var(--color-fg-dim)] mr-1 shrink-0">
                {isEs ? "Nivel" : "Level"}
              </span>
              <button type="button" onClick={() => setLevel(null)} className={filterChipClass(level === null)}>
                {isEs ? "Todos" : "All"}
              </button>
              {LEVEL_LABELS.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setLevel(level === l.id ? null : l.id)}
                  className={filterChipClass(level === l.id)}
                >
                  {isEs ? l.es : l.en}
                </button>
              ))}
              <span className="w-px h-5 bg-[var(--color-border)] mx-1" />
              <span className="text-[11px] font-mono uppercase tracking-[0.13em] text-[var(--color-fg-dim)] mr-1 shrink-0">
                IA
              </span>
              <button type="button" onClick={() => setAi(null)} className={filterChipClass(ai === null)}>
                {isEs ? "Todas" : "All"}
              </button>
              {AI_WHY.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setAi(ai === a.id ? null : a.id)}
                  className={filterChipClass(ai === a.id)}
                >
                  {a.id}
                </button>
              ))}
              {hasCaseFilters && (
                <button
                  type="button"
                  onClick={clearCases}
                  className="ml-1 flex items-center gap-1 text-[12px] text-[var(--color-fg-dim)] hover:text-[var(--color-fg)]"
                >
                  <X size={12} /> {isEs ? "Limpiar" : "Clear"}
                </button>
              )}
            </div>

            <p className="text-[12px] text-[var(--color-fg-dim)]">
              {filteredCases.length}{" "}
              {isEs
                ? `caso${filteredCases.length !== 1 ? "s" : ""} encontrado${filteredCases.length !== 1 ? "s" : ""}`
                : `case${filteredCases.length !== 1 ? "s" : ""} found`}
            </p>
          </div>

          {/* Cases list + detail */}
          <div className="pb-20">
            {filteredCases.length === 0 ? (
              <EmptyState lang={lang} onClear={clearCases} />
            ) : (
              <>
                <div className="hidden md:grid md:grid-cols-[360px_1fr] gap-5 items-start">
                  <div className="flex flex-col gap-2 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
                    {filteredCases.map((uc) => (
                      <CaseCard
                        key={uc.id}
                        uc={uc}
                        lang={lang}
                        selected={selectedCase?.id === uc.id}
                        onClick={() => setSelectedCaseId(uc.id)}
                      />
                    ))}
                  </div>
                  <div className="sticky top-16 max-h-[calc(100vh-80px)]">
                    {selectedCase && (
                      <CaseDetailPanel
                        uc={selectedCase}
                        lang={lang}
                        onCta={() =>
                          setModal({ open: true, tab: "prompts", title: selectedCase[lang].t })
                        }
                      />
                    )}
                  </div>
                </div>
                <div className="md:hidden flex flex-col gap-3">
                  {filteredCases.map((uc) => (
                    <CaseAccordionItem
                      key={uc.id}
                      uc={uc}
                      lang={lang}
                      onCta={() => setModal({ open: true, tab: "prompts", title: uc[lang].t })}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Tab 2: Automated jobs ────────────────────────────────────────── */}
      {activeTab === "jobs" && (
        <div className="mx-auto max-w-5xl px-5 md:px-6">
          <div className="text-center max-w-xl mx-auto mb-8">
            <p className="text-[14px] text-[var(--color-fg-muted)] leading-relaxed">
              {isEs
                ? "Trabajos que tu agente ejecuta solo, en los momentos correctos. Tú solo apruebas el plan — la IA hace el resto."
                : "Jobs your agent runs on its own, at the right moments. You just approve the plan — the AI does the rest."}
            </p>
          </div>

          {/* Jobs filters */}
          <div className="flex flex-col gap-3 mb-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-[0.13em] text-[var(--color-fg-dim)] mr-1 shrink-0">
                {isEs ? "Tipo" : "Type"}
              </span>
              {JOB_CATS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setJobCat(c.id === "todos" ? null : jobCat === c.id ? null : c.id)}
                  className={filterChipClass(c.id === "todos" ? jobCat === null : jobCat === c.id)}
                >
                  {c.icon ? `${c.icon} ` : ""}
                  {isEs ? c.es : c.en}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-[0.13em] text-[var(--color-fg-dim)] mr-1 shrink-0">
                IA
              </span>
              <button type="button" onClick={() => setJobAi(null)} className={filterChipClass(jobAi === null)}>
                {isEs ? "Todas" : "All"}
              </button>
              {AI_WHY.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setJobAi(jobAi === a.id ? null : a.id)}
                  className={filterChipClass(jobAi === a.id)}
                >
                  {a.id}
                </button>
              ))}
              {hasJobFilters && (
                <button
                  type="button"
                  onClick={clearJobs}
                  className="ml-1 flex items-center gap-1 text-[12px] text-[var(--color-fg-dim)] hover:text-[var(--color-fg)]"
                >
                  <X size={12} /> {isEs ? "Limpiar" : "Clear"}
                </button>
              )}
            </div>
            <p className="text-[12px] text-[var(--color-fg-dim)]">
              {filteredJobs.length}{" "}
              {isEs
                ? `trabajo${filteredJobs.length !== 1 ? "s" : ""} encontrado${filteredJobs.length !== 1 ? "s" : ""}`
                : `job${filteredJobs.length !== 1 ? "s" : ""} found`}
            </p>
          </div>

          {/* Jobs list + detail */}
          <div className="pb-20">
            {filteredJobs.length === 0 ? (
              <EmptyState lang={lang} onClear={clearJobs} />
            ) : (
              <>
                <div className="hidden md:grid md:grid-cols-[360px_1fr] gap-5 items-start">
                  <div className="flex flex-col gap-2 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
                    {filteredJobs.map((job) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        lang={lang}
                        selected={selectedJob?.id === job.id}
                        onClick={() => setSelectedJobId(job.id)}
                      />
                    ))}
                  </div>
                  <div className="sticky top-16 max-h-[calc(100vh-80px)]">
                    {selectedJob && (
                      <JobDetailPanel
                        job={selectedJob}
                        lang={lang}
                        onCta={() =>
                          setModal({ open: true, tab: "jobs", title: selectedJob[lang].t })
                        }
                      />
                    )}
                  </div>
                </div>
                <div className="md:hidden flex flex-col gap-3">
                  {filteredJobs.map((job) => (
                    <JobAccordionItem
                      key={job.id}
                      job={job}
                      lang={lang}
                      onCta={() => setModal({ open: true, tab: "jobs", title: job[lang].t })}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <div className="border-t border-[var(--color-border)] bg-[var(--color-panel)]">
        <div className="mx-auto max-w-2xl px-5 md:px-6 py-16 text-center">
          <p className="text-[12px] font-mono uppercase tracking-[0.14em] text-[var(--color-accent)] mb-3">
            {isEs ? "Empieza hoy" : "Start today"}
          </p>
          <h2 className="text-[24px] md:text-[28px] font-semibold tracking-tight text-[var(--color-fg-strong)] leading-snug mb-3">
            {isEs
              ? "Tu equipo de IAs trabaja mientras tú haces otra cosa."
              : "Your AI team works while you do something else."}
          </h2>
          <p className="text-[15px] text-[var(--color-fg-muted)] mb-8 leading-relaxed">
            {isEs
              ? "Gratis para empezar. Sin tarjeta de crédito. Instalado en 2 minutos."
              : "Free to start. No credit card. Installed in 2 minutes."}
          </p>
          <a
            href="/api/download"
            data-cta="usecases-page-final"
            className="inline-flex items-center gap-2 rounded-2xl bg-[var(--color-accent)] px-7 py-3.5 text-[15px] font-semibold text-white transition-all glow-accent hover:-translate-y-px hover:bg-[var(--color-accent-soft)]"
          >
            <Download size={15} strokeWidth={2.2} />
            {isEs ? "Descargar TerminalSync" : "Download TerminalSync"}
          </a>
        </div>
      </div>
    </div>
  );
}
