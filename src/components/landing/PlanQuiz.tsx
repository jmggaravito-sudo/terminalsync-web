"use client";

import { useState, useEffect } from "react";
import {
  X,
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
  RotateCcw,
  Loader2,
} from "lucide-react";
import type { Dict } from "@/content";

type PlanKey = "starter" | "pro" | "dev";

interface Props {
  dict: Dict;
  open: boolean;
  onClose: () => void;
  /**
   * Called when the user commits to a recommended plan. We scroll the
   * pricing section into view with the card highlighted; the caller can
   * also open checkout for the chosen tier (starter / pro / dev).
   */
  onCommit: (plan: PlanKey) => void;
}

type Answers = Record<string, string>;

export function PlanQuiz({ dict, open, onClose, onCommit }: Props) {
  const q = dict.pricing.quiz;
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [finished, setFinished] = useState(false);

  // Reset when the modal opens so returning users get a fresh quiz.
  useEffect(() => {
    if (open) {
      setStep(0);
      setAnswers({});
      setFinished(false);
    }
  }, [open]);

  // Close on ESC.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const total = q.questions.length;
  const current = q.questions[step];
  const currentAnswer = current ? answers[current.id] : undefined;
  const isLastQuestion = step === total - 1;
  const progress = finished ? 100 : (step / total) * 100;

  function pick(value: string) {
    if (!current) return;
    setAnswers((prev) => ({ ...prev, [current.id]: value }));
  }

  function advance() {
    if (isLastQuestion) {
      setFinished(true);
    } else {
      setStep((s) => s + 1);
    }
  }

  function goBack() {
    if (finished) {
      setFinished(false);
      return;
    }
    if (step > 0) setStep((s) => s - 1);
  }

  function restart() {
    setStep(0);
    setAnswers({});
    setFinished(false);
  }

  const recommendation = finished ? scoreAnswers(answers) : null;
  const planCopy = recommendation ? dict.pricing.plans[recommendation] : null;
  const planName = planCopy?.name ?? "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] shadow-floating overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-6 pt-5 pb-4 border-b border-[var(--color-border)]">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 h-7 w-7 rounded flex items-center justify-center text-[var(--color-fg-dim)] hover:text-[var(--color-fg-strong)] hover:bg-[var(--color-panel-2)] transition-colors"
            aria-label="Close"
          >
            <X size={14} />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-[var(--color-accent)]/15 text-[var(--color-accent)] flex items-center justify-center">
              <Sparkles size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-[16px] font-semibold tracking-tight text-[var(--color-fg-strong)]">
                {q.title}
              </h2>
              <p className="text-[12px] text-[var(--color-fg-muted)] leading-tight">
                {q.subtitle}
              </p>
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-4 h-1 rounded-full bg-[var(--color-panel-2)] overflow-hidden">
            <div
              className="h-full bg-[var(--color-accent)] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 min-h-[260px] flex flex-col">
          {!finished && current && (
            <>
              <div className="text-[10.5px] font-mono uppercase tracking-[0.16em] text-[var(--color-fg-dim)] mb-2">
                Pregunta {step + 1} de {total}
              </div>
              <h3 className="text-[16px] font-semibold text-[var(--color-fg-strong)] leading-snug mb-4">
                {current.text}
              </h3>
              <div className="space-y-2 flex-1">
                {current.options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => pick(opt.value)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl border transition-colors ${
                      currentAnswer === opt.value
                        ? "border-[var(--color-accent)] bg-[var(--color-accent)]/8"
                        : "border-[var(--color-border)] bg-[var(--color-panel-2)] hover:border-[var(--color-accent)]/40"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          currentAnswer === opt.value
                            ? "border-[var(--color-accent)] bg-[var(--color-accent)]"
                            : "border-[var(--color-border)]"
                        }`}
                      >
                        {currentAnswer === opt.value && (
                          <Check size={10} className="text-white" strokeWidth={3} />
                        )}
                      </div>
                      <span className="text-[13.5px] text-[var(--color-fg-strong)]">
                        {opt.label}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {finished && recommendation && planCopy && (
            <ResultCard
              planKey={recommendation}
              planName={planName}
              planCopy={planCopy}
              whyLabel={q.resultWhy}
              whyPoints={buildReasons(answers, dict)}
              resultTitle={q.resultTitle.replace("{{plan}}", planName)}
              resultCta={q.resultCta.replace("{{plan}}", planName)}
              startOverLabel={q.startOver}
              onCommit={() => onCommit(recommendation)}
              onRestart={restart}
            />
          )}
        </div>

        {/* Footer nav (only during quiz; result has its own CTAs) */}
        {!finished && (
          <div className="px-6 py-3 border-t border-[var(--color-border)] flex items-center justify-between bg-[var(--color-panel-2)]/30">
            <button
              onClick={goBack}
              disabled={step === 0}
              className={`inline-flex items-center gap-1.5 text-[12.5px] font-medium transition-colors ${
                step === 0
                  ? "text-[var(--color-fg-dim)] cursor-not-allowed"
                  : "text-[var(--color-fg-muted)] hover:text-[var(--color-fg-strong)]"
              }`}
            >
              <ArrowLeft size={12} />
              {q.back}
            </button>
            <button
              onClick={advance}
              disabled={!currentAnswer}
              className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-[12.5px] font-semibold transition-colors ${
                !currentAnswer
                  ? "bg-[var(--color-panel-2)] text-[var(--color-fg-dim)] cursor-not-allowed"
                  : "bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] text-white"
              }`}
            >
              {isLastQuestion ? q.seePlan : q.next}
              <ArrowRight size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Result card ────────────────────────────────────────────────────────

function ResultCard({
  planKey,
  planName,
  planCopy,
  whyLabel,
  whyPoints,
  resultTitle,
  resultCta,
  startOverLabel,
  onCommit,
  onRestart,
}: {
  planKey: PlanKey;
  planName: string;
  planCopy: { features: string[] };
  whyLabel: string;
  whyPoints: string[];
  resultTitle: string;
  resultCta: string;
  startOverLabel: string;
  onCommit: () => void;
  onRestart: () => void;
}) {
  return (
    <div className="flex flex-col">
      <div className="inline-flex self-start items-center gap-1.5 text-[9.5px] font-mono uppercase tracking-[0.16em] border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 text-[var(--color-accent)] rounded-full px-2 py-0.5 mb-2">
        <Check size={9} strokeWidth={3} />
        Tu match
      </div>
      <h3 className="text-[20px] font-semibold tracking-tight text-[var(--color-fg-strong)] leading-tight">
        {resultTitle}
      </h3>

      {whyPoints.length > 0 && (
        <div className="mt-3">
          <div className="text-[11.5px] text-[var(--color-fg-muted)] mb-1.5">
            {whyLabel}
          </div>
          <ul className="space-y-1">
            {whyPoints.map((p, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-[12.5px] text-[var(--color-fg)]"
              >
                <div className="h-1 w-1 rounded-full bg-[var(--color-fg-dim)] mt-2 shrink-0" />
                {p}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-panel-2)]/40 p-3">
        <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-[var(--color-fg-dim)] mb-1.5">
          {planName} incluye
        </div>
        <ul className="space-y-1">
          {planCopy.features.slice(0, 4).map((f) => (
            <li
              key={f}
              className="flex items-start gap-1.5 text-[12px] text-[var(--color-fg)]"
            >
              <Check
                size={11}
                className="text-[var(--color-ok)] mt-0.5 shrink-0"
                strokeWidth={2.8}
              />
              {f}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 flex gap-2">
        <button
          onClick={onRestart}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12.5px] text-[var(--color-fg-muted)] hover:text-[var(--color-fg-strong)] hover:bg-[var(--color-panel-2)] transition-colors"
        >
          <RotateCcw size={12} />
          {startOverLabel}
        </button>
        <button
          onClick={onCommit}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] text-white px-4 py-2.5 text-[13.5px] font-semibold transition-colors shadow-[0_6px_18px_-6px_var(--color-accent-glow)]"
        >
          {resultCta}
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}

// ── Scoring logic ──────────────────────────────────────────────────────
//
// Rules (kept readable on purpose — this is marketing, not a tax engine):
//   1. "team" role OR "developer" role OR "projects" pain → Dev (more
//      terminals + .env vault + setup.sh fit team-lead workflows).
//   2. "creator" role + "chats" pain + "one" device → Free is enough.
//   3. Anything else (including "idk") → Pro (safe middle).
//
// Bias toward Pro on ambiguity — conversion-friendliest tier for unsure
// users. Only recommend Free when signals are strongly "light usage".

function scoreAnswers(a: Answers): PlanKey {
  if (a.role === "team" || a.role === "developer" || a.pain === "projects") {
    return "dev";
  }
  if (a.role === "creator" && a.pain === "chats" && a.volume === "one") {
    return "starter";
  }
  return "pro";
}

function buildReasons(a: Answers, dict: Dict): string[] {
  const reasons: string[] = [];
  const locale = dict.locale;
  const t = (es: string, en: string) => (locale === "es" ? es : en);

  if (a.role === "team") {
    reasons.push(
      t(
        "Diriges un equipo de varias personas que programan",
        "You lead a team of several people who code",
      ),
    );
  } else if (a.role === "developer") {
    reasons.push(
      t("Programas o creas cosas con código", "You build or code things"),
    );
  } else if (a.role === "creator") {
    reasons.push(
      t(
        "Usas la computadora para chatear, escribir e investigar",
        "You use your computer to chat, write, and research",
      ),
    );
  }

  if (a.pain === "projects") {
    reasons.push(
      t(
        "Lo que más te dolería perder son tus carpetas de proyectos",
        "What would hurt most is losing your project folders",
      ),
    );
  } else if (a.pain === "shared") {
    reasons.push(
      t(
        "Lo que compartes con tu equipo es lo más importante",
        "What you share with your team is what matters most",
      ),
    );
  } else if (a.pain === "chats") {
    reasons.push(
      t(
        "Tus chats y notas con IA son lo más valioso",
        "Your AI chats and notes are your most valuable thing",
      ),
    );
  }

  if (a.volume === "many") {
    reasons.push(
      t(
        "Trabajas en varias computadoras o cambias seguido entre ellas",
        "You work on multiple computers or switch between them often",
      ),
    );
  } else if (a.volume === "two") {
    reasons.push(
      t(
        "Trabajas en dos o tres computadoras",
        "You work on two or three computers",
      ),
    );
  }

  return reasons;
}
