"use client";

import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";

interface Props {
  lang: "es" | "en";
}

// Asks the user for the email tied to their subscription, then POSTs to
// /api/billing/portal which mints a Stripe Customer Portal session and
// returns its URL. We just window.location to it so they land in Stripe.
export function BillingPortalLauncher({ lang }: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/billing/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), lang }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setErrorMsg(data.error ?? "No pudimos abrir el portal. Reintenta.");
        setStatus("error");
        return;
      }
      // Hard redirect — Stripe portal is a separate domain and we want
      // the back-button to land here, not in some intermediate state.
      window.location.href = data.url;
    } catch {
      setErrorMsg("Error de red. Verificá tu conexión y reintenta.");
      setStatus("error");
    }
  }

  const disabled = status === "loading" || !email.trim();

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label className="block">
        <span className="block text-[12.5px] text-[var(--color-fg-muted)] mb-1.5">
          Email de tu cuenta
        </span>
        <input
          type="email"
          required
          autoFocus
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="vos@ejemplo.com"
          className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-panel-2)] px-3.5 py-2.5 text-[14px] text-[var(--color-fg-strong)] placeholder:text-[var(--color-fg-dim)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]/40 transition-colors"
        />
      </label>

      <button
        type="submit"
        disabled={disabled}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[13.5px] font-semibold text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors glow-accent"
      >
        {status === "loading" ? (
          <>
            <Loader2 size={14} className="animate-spin" strokeWidth={2.4} />
            Abriendo portal…
          </>
        ) : (
          <>
            Abrir portal de Stripe
            <ArrowRight size={14} strokeWidth={2.4} />
          </>
        )}
      </button>

      {status === "error" ? (
        <p className="text-[12.5px] text-[var(--color-err)] mt-2 leading-relaxed">
          {errorMsg}
        </p>
      ) : null}
    </form>
  );
}
