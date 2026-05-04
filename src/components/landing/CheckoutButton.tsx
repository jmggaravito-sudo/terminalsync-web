"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import type { Locale } from "@/content";

interface Props {
  plan: "starter" | "pro" | "dev" | "agency";
  cycle?: "monthly" | "yearly";
  lang: Locale;
  label: string;
  featured?: boolean;
  errorTitle: string;
  loadingLabel: string;
}

// Starter → direct download link (no checkout needed).
// Pro     → POST /api/checkout, redirect to Stripe (carries billing cycle).
// Dev     → POST /api/checkout. Backend returns 503 "Missing Stripe price"
//           until STRIPE_PRICE_DEV_{MONTHLY,YEARLY} are set in Vercel — we
//           show that error inline (fail-loud) instead of silently charging
//           the Pro priceId.
// Agency  → mailto sales team (lead-gen, not self-serve for now).
export function CheckoutButton({
  plan,
  cycle,
  lang,
  label,
  featured,
  errorTitle,
  loadingLabel,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick(e: React.MouseEvent) {
    if (plan === "starter") return; // let the anchor just do its thing
    if (plan === "agency") {
      // Lead-gen route: open email with a pre-filled subject.
      e.preventDefault();
      window.location.href =
        "mailto:ventas@terminalsync.ai?subject=" +
        encodeURIComponent("TerminalSync Agency — cotización");
      return;
    }

    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Rewardful injects `window.Rewardful.referral` (UUID) when the visitor
      // arrived via a tracked affiliate link. We forward it so the Stripe
      // checkout can credit the affiliate via `client_reference_id`.
      const referral =
        typeof window !== "undefined"
          ? (window as unknown as { Rewardful?: { referral?: string } })
              .Rewardful?.referral
          : undefined;
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, cycle: cycle ?? "monthly", lang, referral }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Unknown error");
      }
      window.location.href = data.url;
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  }

  // starter (Free) → direct DMG download via the /api/download route
  //                   (which redirects to the latest version on R2).
  // agency          → mailto: opens with a pre-filled subject.
  // pro / dev       → fall through to handleClick which POSTs /api/checkout.
  const href =
    plan === "starter" ? "/api/download" : plan === "agency" ? "#" : "#pricing";

  return (
    <div className="w-full mt-6">
      <a
        href={href}
        onClick={handleClick}
        aria-busy={loading}
        className={`w-full inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-semibold transition-all ${
          featured
            ? "bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] text-white shadow-[0_8px_24px_-10px_var(--color-accent-glow)] hover:-translate-y-px"
            : "bg-[var(--color-panel-2)] hover:bg-[var(--color-bg)] text-[var(--color-fg)] border border-[var(--color-border)]"
        } ${loading ? "opacity-75 cursor-wait" : ""}`}
      >
        {loading ? (
          <>
            <Loader2 size={13} className="sync-spin" strokeWidth={2.2} />
            {loadingLabel}
          </>
        ) : (
          label
        )}
      </a>
      {error && (
        <div className="mt-2 rounded-md border border-[var(--color-err)]/30 bg-[var(--color-err)]/5 px-3 py-2 text-[11.5px] text-[var(--color-err)]">
          <div className="font-semibold">{errorTitle}</div>
          <div className="mt-0.5 font-mono text-[10.5px] opacity-80">
            {error}
          </div>
        </div>
      )}
    </div>
  );
}
