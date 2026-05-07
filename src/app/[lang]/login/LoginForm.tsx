"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail } from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

export function LoginForm({ lang }: { lang: string }) {
  const isEs = lang === "es";
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || `/${lang}/marketplace`;

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sb = getSupabaseBrowser();
    if (!sb) return;
    sb.auth.getSession().then(({ data }) => {
      if (data.session) router.replace(next);
    });
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => {
      if (session) router.replace(next);
    });
    return () => sub.subscription.unsubscribe();
  }, [next, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const sb = getSupabaseBrowser();
    if (!sb) {
      setError(isEs ? "Auth no configurado" : "Auth not configured");
      setSubmitting(false);
      return;
    }
    // Forward `lang` and `next` to the callback so EN users don't land on
    // /es/marketplace and so a deep-link-style redirect (e.g. login?next=
    // /en/billing) survives the round-trip through email.
    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback?lang=${lang}&next=${encodeURIComponent(next)}`
        : undefined;
    try {
      const { error: err } = await sb.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo },
      });
      if (err) {
        // Some networks (corp proxies, ad blockers, browser extensions,
        // service workers from older deploys) return a fetch TypeError
        // even though the OTP request actually reached Supabase and
        // the email got sent. We've confirmed end-to-end that emails
        // arrive in those cases. Treat network-shaped errors as a
        // soft success and tell the user to check their inbox — false
        // positive cost is a confused retry; false negative cost is
        // the user thinks login is broken.
        const msg = err.message || "";
        const isNetworkBlip =
          msg.toLowerCase().includes("fetch") ||
          msg.toLowerCase().includes("load failed") ||
          msg.toLowerCase().includes("network");
        if (isNetworkBlip) {
          setSent(true);
        } else {
          setError(err.message);
        }
        setSubmitting(false);
        return;
      }
      setSent(true);
      setSubmitting(false);
    } catch (e) {
      // Same idea — supabase-js sometimes throws instead of returning
      // an `error` object. Any network-level throw → soft success.
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.toLowerCase().includes("fetch") || msg.toLowerCase().includes("load failed")) {
        setSent(true);
      } else {
        setError(msg);
      }
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 space-y-2">
        <p className="text-[14px] font-semibold text-emerald-400">
          {isEs ? "Revisá tu correo" : "Check your inbox"}
        </p>
        <p className="text-[13px] text-[var(--color-fg-muted)] leading-relaxed">
          {isEs
            ? `Te mandamos el enlace a ${email}. Hacé click y volvé acá.`
            : `We sent the link to ${email}. Click it and come back here.`}
        </p>
        <p className="text-[12px] text-[var(--color-fg-dim)] leading-relaxed">
          {isEs
            ? "¿No te llegó en 30 seg? Revisá Spam / Promociones. Si todo bien sigue vacío, "
            : "Not in 30s? Check Spam / Promotions. Still empty? "}
          <button
            type="button"
            onClick={() => {
              setSent(false);
              setError(null);
            }}
            className="text-[var(--color-accent)] hover:underline underline-offset-2"
          >
            {isEs ? "reintentar" : "retry"}
          </button>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label className="block">
        <span className="block text-[12px] font-mono uppercase tracking-[0.12em] text-[var(--color-fg-dim)] mb-1.5">
          Email
        </span>
        <input
          type="email"
          required
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="vos@empresa.com"
          className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-2.5 text-[14px] focus:outline-none focus:border-[var(--color-accent)]"
        />
      </label>
      {error && <p className="text-[12.5px] text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-[14px] font-semibold text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] disabled:opacity-50 transition-colors"
      >
        <Mail size={14} strokeWidth={2.4} />
        {submitting
          ? (isEs ? "Enviando…" : "Sending…")
          : (isEs ? "Mandarme el enlace" : "Send me the link")}
      </button>
    </form>
  );
}
