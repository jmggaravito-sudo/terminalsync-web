"use client";

import { useState } from "react";
import { Check, Sparkles, ArrowRight, Zap } from "lucide-react";
import type { Dict } from "@/content";
import { CheckoutButton } from "./CheckoutButton";
import { PlanQuiz } from "./PlanQuiz";

type Cycle = "monthly" | "yearly";
type PlanKey = "starter" | "pro" | "dev";

export function Pricing({ dict }: { dict: Dict }) {
  const [cycle, setCycle] = useState<Cycle>("yearly");
  const [quizOpen, setQuizOpen] = useState(false);
  const [highlighted, setHighlighted] = useState<PlanKey | null>(null);

  function handleQuizCommit(plan: PlanKey) {
    setQuizOpen(false);
    setHighlighted(plan);
    // Smooth scroll to the matching card, then remove highlight after 3s.
    if (typeof window !== "undefined") {
      const el = document.getElementById(`plan-${plan}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    setTimeout(() => setHighlighted(null), 3000);
  }

  return (
    <section
      id="pricing"
      className="mx-auto max-w-6xl px-5 md:px-6 py-20 md:py-24"
    >
      <div className="text-center max-w-2xl mx-auto">
        <h2
          className="font-semibold tracking-tight text-[var(--color-fg-strong)] leading-[1.08]"
          style={{ fontSize: "clamp(1.625rem, 4vw, 2.5rem)" }}
        >
          {dict.pricing.title}
        </h2>
        <p className="mt-3 text-[15px] text-[var(--color-fg-muted)]">
          {dict.pricing.subtitle}
        </p>

        {/* Trial reassurance pill */}
        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[var(--color-ok)]/30 bg-[var(--color-ok)]/8 px-3.5 py-1.5 text-[12px] text-[var(--color-ok)] font-medium">
          <Sparkles size={12} strokeWidth={2.4} />
          {dict.pricing.trial.eyebrow} · {dict.pricing.trial.explainer}
        </div>
      </div>

      {/* ── Quiz CTA — hero card. Placed OUTSIDE the centered text block so
          it's full-width on mobile and draws the eye. Animated glow + pulse
          make it obvious. ─────────────────────────────────────────────── */}
      <button
        onClick={() => setQuizOpen(true)}
        className="quiz-hero-cta group relative mx-auto mt-8 block w-full max-w-xl rounded-2xl border-2 border-[var(--color-accent)]/50 bg-gradient-to-br from-[var(--color-accent)]/15 via-[var(--color-panel)] to-[var(--color-accent)]/8 px-5 py-4 md:px-6 md:py-5 text-left transition-all hover:scale-[1.02] hover:border-[var(--color-accent)] shadow-[0_10px_40px_-12px_var(--color-accent-glow)] hover:shadow-[0_14px_50px_-10px_var(--color-accent-glow)]"
      >
        {/* Animated ambient glow behind the card */}
        <div className="pointer-events-none absolute -inset-1 rounded-2xl bg-[var(--color-accent)]/20 blur-2xl opacity-40 group-hover:opacity-60 transition-opacity -z-10" />

        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-2xl bg-[var(--color-accent)]/40 animate-ping" />
            <div className="relative h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-[var(--color-accent)] text-white flex items-center justify-center shadow-[0_6px_20px_-6px_var(--color-accent-glow)]">
              <Zap size={22} strokeWidth={2.4} fill="currentColor" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-1.5 text-[10px] md:text-[10.5px] font-mono uppercase tracking-[0.16em] text-[var(--color-accent)] mb-1">
              <Sparkles size={11} strokeWidth={2.4} />
              {dict.locale === "es" ? "30 segundos" : "30 seconds"}
            </div>
            <div className="text-[16px] md:text-[19px] font-semibold text-[var(--color-fg-strong)] leading-tight">
              {dict.pricing.quiz.cta}
            </div>
            <div className="text-[12px] md:text-[13px] text-[var(--color-fg-muted)] mt-0.5 leading-snug">
              {dict.pricing.quiz.subtitle}
            </div>
          </div>

          <ArrowRight
            size={20}
            className="shrink-0 text-[var(--color-accent)] group-hover:translate-x-1 transition-transform"
            strokeWidth={2.4}
          />
        </div>
      </button>

      <div className="text-center max-w-2xl mx-auto">
        {/* Monthly / Yearly toggle — only applies to Pro + Dev */}
        <div
          className="mt-7 inline-flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-panel)] p-0.5 relative"
          role="radiogroup"
          aria-label="Billing cycle"
        >
          <ToggleButton
            active={cycle === "monthly"}
            onClick={() => setCycle("monthly")}
            label={dict.pricing.cycleLabel.monthly}
          />
          <ToggleButton
            active={cycle === "yearly"}
            onClick={() => setCycle("yearly")}
            label={dict.pricing.cycleLabel.yearly}
            savingsBadge={dict.pricing.cycleLabel.savingsBadge}
          />
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
        <PlanCard
          id="plan-starter"
          name={dict.pricing.plans.starter.name}
          price={dict.pricing.plans.starter.price}
          priceNote={dict.pricing.plans.starter.priceNote}
          features={dict.pricing.plans.starter.features}
          cta={dict.pricing.plans.starter.cta}
          checkoutPlan="starter"
          lang={dict.locale}
          loadingLabel={dict.checkout.loading}
          errorTitle={dict.checkout.errorTitle}
          highlighted={highlighted === "starter"}
        />

        <CycleCard
          id="plan-pro"
          plan="pro"
          copy={dict.pricing.plans.pro}
          cycle={cycle}
          dict={dict}
          featured
          highlighted={highlighted === "pro"}
        />

        <CycleCard
          id="plan-dev"
          plan="dev"
          copy={dict.pricing.plans.dev}
          cycle={cycle}
          dict={dict}
          highlighted={highlighted === "dev"}
        />
      </div>

      <PlanQuiz
        dict={dict}
        open={quizOpen}
        onClose={() => setQuizOpen(false)}
        onCommit={handleQuizCommit}
      />
    </section>
  );
}

function ToggleButton({
  active,
  onClick,
  label,
  savingsBadge,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  savingsBadge?: string;
}) {
  return (
    <button
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={`relative inline-flex items-center gap-2 h-9 px-4 rounded-full text-[13px] font-semibold transition-colors ${
        active
          ? "bg-[var(--color-accent)] text-white shadow-[0_6px_18px_-6px_var(--color-accent-glow)]"
          : "text-[var(--color-fg-muted)] hover:text-[var(--color-fg-strong)]"
      }`}
    >
      {label}
      {savingsBadge && (
        <span
          className={`text-[9.5px] font-bold uppercase tracking-[0.12em] px-1.5 py-0.5 rounded-full ${
            active
              ? "bg-white/20 text-white"
              : "bg-[var(--color-ok)]/15 text-[var(--color-ok)]"
          }`}
        >
          {savingsBadge}
        </span>
      )}
    </button>
  );
}

function CycleCard({
  id,
  plan,
  copy,
  cycle,
  dict,
  featured,
  highlighted,
}: {
  id: string;
  plan: "pro" | "dev";
  copy: Dict["pricing"]["plans"]["pro"];
  cycle: Cycle;
  dict: Dict;
  featured?: boolean;
  highlighted?: boolean;
}) {
  const price = cycle === "yearly" ? copy.priceYearly : copy.priceMonthly;
  const note =
    cycle === "yearly" ? copy.priceNoteYearly : copy.priceNoteMonthly;
  return (
    <article
      id={id}
      className={`relative rounded-2xl p-6 flex flex-col bg-[var(--color-panel)] transition-all ${
        highlighted
          ? "border-2 border-[var(--color-accent)] shadow-[0_0_0_4px_var(--color-accent-glow)]"
          : featured
            ? "border-2 border-[var(--color-accent)] shadow-floating"
            : "border border-[var(--color-border)] lift"
      }`}
    >
      {copy.badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-[var(--color-accent)] text-white text-[10px] font-bold uppercase tracking-[0.12em] px-3 py-1">
          {copy.badge}
        </span>
      )}

      <h3 className="text-[15px] font-semibold text-[var(--color-fg-strong)]">
        {copy.name}
      </h3>

      <div className="mt-3 flex items-baseline gap-1.5 min-h-[3rem]">
        <span
          key={price}
          className="text-[34px] font-semibold tracking-tight text-[var(--color-fg-strong)]"
          style={{ animation: "fade-swap 0.2s ease-out" }}
        >
          {price}
        </span>
        <span className="text-[12px] text-[var(--color-fg-muted)]">{note}</span>
      </div>

      {cycle === "yearly" ? (
        <div className="text-[11.5px] text-[var(--color-ok)] font-medium -mt-1">
          {copy.yearlyEquivalent}
        </div>
      ) : (
        <div className="text-[11.5px] text-[var(--color-fg-dim)] -mt-1">
          &nbsp;
        </div>
      )}

      <ul className="mt-5 space-y-2 flex-1">
        {copy.features.map((feat) => (
          <li
            key={feat}
            className="flex items-start gap-2 text-[12.5px] text-[var(--color-fg)]"
          >
            <Check
              size={13}
              className="text-[var(--color-ok)] mt-0.5 shrink-0"
              strokeWidth={2.8}
            />
            <span>{feat}</span>
          </li>
        ))}
      </ul>

      <CheckoutButton
        plan={plan}
        cycle={cycle}
        lang={dict.locale}
        label={copy.cta}
        featured={featured}
        errorTitle={dict.checkout.errorTitle}
        loadingLabel={dict.checkout.loading}
      />
      <p className="mt-2 text-center text-[10.5px] text-[var(--color-fg-dim)]">
        {dict.pricing.trial.eyebrow}
      </p>
    </article>
  );
}

function PlanCard({
  id,
  name,
  price,
  priceNote,
  features,
  cta,
  checkoutPlan,
  lang,
  loadingLabel,
  errorTitle,
  highlighted,
}: {
  id: string;
  name: string;
  price: string;
  priceNote: string;
  features: string[];
  cta: string;
  checkoutPlan: "starter" | "agency";
  lang: "es" | "en";
  loadingLabel: string;
  errorTitle: string;
  highlighted?: boolean;
}) {
  return (
    <article
      id={id}
      className={`rounded-2xl p-6 flex flex-col bg-[var(--color-panel)] transition-all ${
        highlighted
          ? "border-2 border-[var(--color-accent)] shadow-[0_0_0_4px_var(--color-accent-glow)]"
          : "lift border border-[var(--color-border)]"
      }`}
    >
      <h3 className="text-[15px] font-semibold text-[var(--color-fg-strong)]">
        {name}
      </h3>
      <div className="mt-3 flex items-baseline gap-1.5 min-h-[3rem]">
        <span className="text-[34px] font-semibold tracking-tight text-[var(--color-fg-strong)]">
          {price}
        </span>
        <span className="text-[12px] text-[var(--color-fg-muted)]">
          {priceNote}
        </span>
      </div>
      <div className="text-[11.5px] text-[var(--color-fg-dim)] -mt-1">
        &nbsp;
      </div>

      <ul className="mt-5 space-y-2 flex-1">
        {features.map((feat) => (
          <li
            key={feat}
            className="flex items-start gap-2 text-[12.5px] text-[var(--color-fg)]"
          >
            <Check
              size={13}
              className="text-[var(--color-ok)] mt-0.5 shrink-0"
              strokeWidth={2.8}
            />
            <span>{feat}</span>
          </li>
        ))}
      </ul>

      <CheckoutButton
        plan={checkoutPlan}
        lang={lang}
        label={cta}
        errorTitle={errorTitle}
        loadingLabel={loadingLabel}
      />
    </article>
  );
}
