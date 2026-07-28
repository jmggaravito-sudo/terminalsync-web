"use client";

import type { Locale } from "@/content";

interface Props {
  plan: "starter" | "pro" | "max" | "agency";
  lang: Locale;
  label: string;
  featured?: boolean;
  errorTitle: string;
  loadingLabel: string;
}

// Web = download only. Every plan CTA sends the visitor to the app
// download — the subscription/checkout happens INSIDE the app, where the
// user is signed into their account so the payment links to them reliably
// (no anonymous "pay from the web then can't find your plan" flow). This is
// a deliberate product decision (JM, 2026-07-22): the only thing you can do
// from the marketing site is download the app.
//
// Agency stays a contact-sales mailto (a lead, not a self-serve purchase).
//
// NOTE: the Stripe / Mercado Pago checkout API routes (/api/checkout*) are
// intentionally left in place — the DESKTOP APP still POSTs to them. Only
// the marketing-site buttons stop doing checkout here.
export function CheckoutButton({ plan, label, featured }: Props) {
  function handleClick(e: React.MouseEvent) {
    if (plan === "agency") {
      // Enterprise lead-gen: open email with a pre-filled subject.
      e.preventDefault();
      window.location.href =
        "mailto:ventas@terminalsync.ai?subject=" +
        encodeURIComponent("TerminalSync Agency — cotización");
      return;
    }
    // starter / pro / max → let the anchor navigate to /api/download,
    // which redirects to the latest app build. The paid trial then starts
    // from inside the app after sign-in.
  }

  const href = plan === "agency" ? "#" : "/api/download";

  return (
    <div className="w-full mt-6">
      <a
        href={href}
        onClick={handleClick}
        className={`w-full inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-semibold transition-all ${
          featured
            ? "bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] text-white shadow-[0_8px_24px_-10px_var(--color-accent-glow)] hover:-translate-y-px"
            : "bg-[var(--color-panel-2)] hover:bg-[var(--color-bg)] text-[var(--color-fg)] border border-[var(--color-border)]"
        }`}
      >
        {label}
      </a>
    </div>
  );
}
