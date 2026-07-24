"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import type { Locale } from "@/content";

interface Props {
  plan: "starter" | "pro" | "max" | "agency";
  lang: Locale;
  label: string;
  featured?: boolean;
  errorTitle: string;
  loadingLabel: string;
}

// Starter → direct download link (no checkout needed).
// Pro     → POST /api/checkout, redirect to Stripe (monthly only desde 2026-05-29).
// Max     → POST /api/checkout. Backend returns 503 "Missing Stripe price"
//           until STRIPE_PRICE_MAX_MONTHLY is set in Vercel — we
//           show that error inline (fail-loud) instead of silently charging
//           the Pro priceId.
// Agency  → mailto sales team (lead-gen, not self-serve for now).
export function CheckoutButton({
  plan,
  lang,
  label,
  featured,
  errorTitle,
  loadingLabel,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [country, setCountry] = useState<string | null>(null);
  // Mercado Pago linking: we MUST capture the buyer's Terminal Sync email before
  // redirecting to MP, or the webhook can't link the payment to their account and
  // they'd "pay but stay Free" (MP attaches the payer's MP-account email, which
  // may differ from their signup email). Two-step: click → email field → pay.
  const [mpAsking, setMpAsking] = useState(false);
  const [mpEmail, setMpEmail] = useState("");

  // Mercado Pago is a PARALLEL payment rail for Colombia: MP charges in local
  // currency (COP) via local cards / PSE / account balance, which Stripe (USD)
  // doesn't cover well for Colombian buyers. Two gates, both required:
  //   1. NEXT_PUBLIC_MERCADOPAGO_ENABLED === "1" — global kill switch, so the
  //      button can't appear until the MP plans + token are configured.
  //   2. the visitor is in Colombia (x-vercel-ip-country === "CO"), resolved
  //      server-side via /api/geo. Everyone else only sees Stripe.
  const mpConfigured =
    process.env.NEXT_PUBLIC_MERCADOPAGO_ENABLED === "1" &&
    (plan === "pro" || plan === "max");

  useEffect(() => {
    if (!mpConfigured) return;
    let alive = true;
    fetch("/api/geo")
      .then((r) => r.json())
      .then((d: { country?: string | null }) => {
        if (alive) setCountry(d.country ?? null);
      })
      .catch(() => {
        // On any failure, leave country null → MP button stays hidden (safe).
      });
    return () => {
      alive = false;
    };
  }, [mpConfigured]);

  const mpEnabled = mpConfigured && country === "CO";

  async function startCheckout(
    endpoint: string,
    extra?: { email?: string },
  ) {
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
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, lang, referral, ...extra }),
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
    await startCheckout("/api/checkout");
  }

  function handleMercadoPago(e: React.MouseEvent) {
    e.preventDefault();
    // Step 1: reveal the email field so we can link the payment to their account.
    if (!mpAsking) {
      setMpAsking(true);
      setError(null);
      return;
    }
    // Step 2: validate and pay. The email becomes the MP external_reference so
    // the webhook links the plan to their Terminal Sync account.
    const email = mpEmail.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(
        lang === "es"
          ? "Ingresá un email válido (el de tu cuenta de Terminal Sync)."
          : "Enter a valid email (your Terminal Sync account email).",
      );
      return;
    }
    void startCheckout("/api/checkout/mercadopago", { email });
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
      {mpEnabled && (
        <>
          {mpAsking && (
            <div className="mt-2">
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                value={mpEmail}
                onChange={(e) => setMpEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleMercadoPago(e as unknown as React.MouseEvent);
                }}
                placeholder={
                  lang === "es"
                    ? "Email de tu cuenta de Terminal Sync"
                    : "Your Terminal Sync account email"
                }
                autoFocus
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-panel-2)] px-3 py-2.5 text-[13px] text-[var(--color-fg)] focus:outline-none focus:border-[var(--color-accent)]"
              />
              <p className="mt-1 text-[10.5px] text-[var(--color-fg-muted)] leading-relaxed">
                {lang === "es"
                  ? "Usá el mismo email con el que entrás a Terminal Sync — así el pago queda vinculado a tu cuenta."
                  : "Use the same email you sign into Terminal Sync with — so the payment links to your account."}
              </p>
            </div>
          )}
          <a
            href="#pricing"
            onClick={handleMercadoPago}
            aria-busy={loading}
            className={`mt-2 w-full inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-semibold transition-all bg-[var(--color-panel-2)] hover:bg-[var(--color-bg)] text-[var(--color-fg)] border border-[var(--color-border)] ${
              loading ? "opacity-75 cursor-wait" : ""
            }`}
          >
            {loading ? (
              <>
                <Loader2 size={13} className="sync-spin" strokeWidth={2.2} />
                {loadingLabel}
              </>
            ) : mpAsking ? (
              lang === "es" ? (
                "Continuar con Mercado Pago"
              ) : (
                "Continue with Mercado Pago"
              )
            ) : lang === "es" ? (
              "Pagar con Mercado Pago"
            ) : (
              "Pay with Mercado Pago"
            )}
          </a>
        </>
      )}
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
