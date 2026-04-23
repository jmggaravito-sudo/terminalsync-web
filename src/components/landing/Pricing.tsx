"use client";

import { useState } from "react";
import { Check, Sparkles } from "lucide-react";
import type { Dict } from "@/content";
import { CheckoutButton } from "./CheckoutButton";

type Cycle = "monthly" | "yearly";

export function Pricing({ dict }: { dict: Dict }) {
  const [cycle, setCycle] = useState<Cycle>("yearly"); // default to yearly to anchor savings

  return (
    <section id="pricing" className="mx-auto max-w-6xl px-5 md:px-6 py-20 md:py-24">
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

        {/* Monthly / Yearly toggle */}
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

      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
        {/* Starter */}
        <PlanCard
          name={dict.pricing.plans.starter.name}
          price={dict.pricing.plans.starter.price}
          priceNote={dict.pricing.plans.starter.priceNote}
          features={dict.pricing.plans.starter.features}
          cta={dict.pricing.plans.starter.cta}
          checkoutPlan="starter"
          lang={dict.locale}
          loadingLabel={dict.checkout.loading}
          errorTitle={dict.checkout.errorTitle}
        />

        {/* Pro — featured, toggles between monthly/yearly */}
        <ProCard dict={dict} cycle={cycle} />

        {/* Agency */}
        <PlanCard
          name={dict.pricing.plans.agency.name}
          price={dict.pricing.plans.agency.price}
          priceNote={dict.pricing.plans.agency.priceNote}
          features={dict.pricing.plans.agency.features}
          cta={dict.pricing.plans.agency.cta}
          checkoutPlan="agency"
          lang={dict.locale}
          loadingLabel={dict.checkout.loading}
          errorTitle={dict.checkout.errorTitle}
        />
      </div>
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

function ProCard({ dict, cycle }: { dict: Dict; cycle: Cycle }) {
  const p = dict.pricing.plans.pro;
  const price = cycle === "yearly" ? p.priceYearly : p.priceMonthly;
  const note = cycle === "yearly" ? p.priceNoteYearly : p.priceNoteMonthly;
  return (
    <article className="relative rounded-2xl p-6 flex flex-col border-2 border-[var(--color-accent)] bg-[var(--color-panel)] shadow-floating">
      <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-[var(--color-accent)] text-white text-[10px] font-bold uppercase tracking-[0.12em] px-3 py-1">
        {p.badge}
      </span>

      <h3 className="text-[15px] font-semibold text-[var(--color-fg-strong)]">
        {p.name}
      </h3>

      <div className="mt-3 flex items-baseline gap-1.5 min-h-[3rem]">
        <span
          key={price /* re-mount for subtle fade when cycle flips */}
          className="text-[38px] font-semibold tracking-tight text-[var(--color-fg-strong)]"
          style={{ animation: "fade-swap 0.2s ease-out" }}
        >
          {price}
        </span>
        <span className="text-[12px] text-[var(--color-fg-muted)]">{note}</span>
      </div>

      {cycle === "yearly" ? (
        <div className="text-[11.5px] text-[var(--color-ok)] font-medium -mt-1">
          {p.yearlyEquivalent} · {dict.pricing.cycleLabel.savingsDetail}
        </div>
      ) : (
        <div className="text-[11.5px] text-[var(--color-fg-dim)] -mt-1">
          &nbsp;
        </div>
      )}

      <ul className="mt-5 space-y-2.5 flex-1">
        {p.features.map((feat) => (
          <li
            key={feat}
            className="flex items-start gap-2 text-[13px] text-[var(--color-fg)]"
          >
            <Check
              size={14}
              className="text-[var(--color-ok)] mt-0.5 shrink-0"
              strokeWidth={2.8}
            />
            <span>{feat}</span>
          </li>
        ))}
      </ul>

      <CheckoutButton
        plan="pro"
        cycle={cycle}
        lang={dict.locale}
        label={p.cta}
        featured
        errorTitle={dict.checkout.errorTitle}
        loadingLabel={dict.checkout.loading}
      />
      <p className="mt-2 text-center text-[10.5px] text-[var(--color-fg-dim)]">
        {dict.pricing.trial.eyebrow} · sin cargo hasta el día 7
      </p>
    </article>
  );
}

function PlanCard({
  name,
  price,
  priceNote,
  features,
  cta,
  checkoutPlan,
  lang,
  loadingLabel,
  errorTitle,
}: {
  name: string;
  price: string;
  priceNote: string;
  features: string[];
  cta: string;
  checkoutPlan: "starter" | "agency";
  lang: "es" | "en";
  loadingLabel: string;
  errorTitle: string;
}) {
  return (
    <article className="lift rounded-2xl p-6 flex flex-col border border-[var(--color-border)] bg-[var(--color-panel)]">
      <h3 className="text-[15px] font-semibold text-[var(--color-fg-strong)]">
        {name}
      </h3>
      <div className="mt-3 flex items-baseline gap-1.5 min-h-[3rem]">
        <span className="text-[38px] font-semibold tracking-tight text-[var(--color-fg-strong)]">
          {price}
        </span>
        <span className="text-[12px] text-[var(--color-fg-muted)]">
          {priceNote}
        </span>
      </div>
      <div className="text-[11.5px] text-[var(--color-fg-dim)] -mt-1">
        &nbsp;
      </div>

      <ul className="mt-5 space-y-2.5 flex-1">
        {features.map((feat) => (
          <li
            key={feat}
            className="flex items-start gap-2 text-[13px] text-[var(--color-fg)]"
          >
            <Check
              size={14}
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
