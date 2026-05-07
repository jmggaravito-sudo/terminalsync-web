"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShoppingBag, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { authedFetch, getSupabaseBrowser } from "@/lib/supabase/browser";

/**
 * Stripe Checkout launcher for a single Stack Pack. Auth-gated — if
 * the user isn't signed in, we route them to /login first with a
 * `next` param so they come back here after.
 *
 * Surfaces three post-checkout states via URL params:
 *   ?paid=1     — Stripe success_url, show "thanks, open the app"
 *   ?canceled=1 — Stripe cancel_url, show a soft "no charge yet"
 *   (none)      — render the buy button
 */
export function BuyButton({ lang, slug }: { lang: string; slug: string }) {
  const router = useRouter();
  const search = useSearchParams();
  const isEs = lang === "es";
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sb = getSupabaseBrowser();
    if (!sb) {
      setSignedIn(false);
      return;
    }
    sb.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => setSignedIn(!!session));
    return () => sub.subscription.unsubscribe();
  }, []);

  const paid = search.get("paid") === "1";
  const canceled = search.get("canceled") === "1";

  if (paid) {
    return (
      <div className="rounded-2xl border border-[var(--color-ok)]/40 bg-[var(--color-ok)]/8 p-4">
        <div className="flex items-start gap-2.5">
          <CheckCircle2 size={18} className="mt-0.5 text-[var(--color-ok)] shrink-0" strokeWidth={2.2} />
          <div>
            <p className="text-[14px] font-semibold text-[var(--color-fg-strong)]">
              {isEs ? "¡Listo! El pack es tuyo." : "All set! The pack is yours."}
            </p>
            <p className="mt-1.5 text-[12.5px] text-[var(--color-fg-muted)] leading-relaxed">
              {isEs
                ? "Abrí la app de TerminalSync — los conectores aparecen instalados en segundos."
                : "Open the TerminalSync app — the connectors will appear within seconds."}
            </p>
            <a
              href="/api/download"
              className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] text-white text-[13px] font-semibold px-4 py-2 transition-colors"
            >
              {isEs ? "Descargar TerminalSync" : "Download TerminalSync"}
            </a>
          </div>
        </div>
      </div>
    );
  }

  async function onClick() {
    setError(null);
    if (!signedIn) {
      const next = `/${lang}/stacks/${slug}`;
      router.push(`/${lang}/login?next=${encodeURIComponent(next)}`);
      return;
    }
    setSubmitting(true);
    try {
      const res = await authedFetch(`/api/marketplace/bundles/${slug}/buy`, {
        method: "POST",
        body: JSON.stringify({ lang }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === "already_owned") {
          setError(
            isEs
              ? "Ya tenés este pack. Abrí TerminalSync — está instalado."
              : "You already own this pack. Open TerminalSync — it's installed.",
          );
        } else {
          throw new Error(data.error ?? "Checkout failed");
        }
        return;
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={onClick}
        disabled={submitting || signedIn === null}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] text-white text-[14px] font-semibold px-5 py-3 disabled:opacity-50 disabled:cursor-not-allowed transition-colors glow-accent"
      >
        {submitting ? (
          <Loader2 size={15} className="animate-spin" strokeWidth={2.4} />
        ) : (
          <ShoppingBag size={15} strokeWidth={2.4} />
        )}
        {submitting
          ? isEs ? "Redirigiendo a Stripe…" : "Redirecting to Stripe…"
          : isEs ? "Comprar este pack" : "Buy this pack"}
      </button>

      {canceled && (
        <p className="text-[12px] text-[var(--color-fg-muted)] text-center">
          {isEs ? "Cancelaste — no se cobró nada." : "You canceled — nothing was charged."}
        </p>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3.5 py-2.5">
          <AlertTriangle size={13} className="mt-0.5 text-amber-400 shrink-0" strokeWidth={2.4} />
          <p className="text-[12.5px] text-amber-400">{error}</p>
        </div>
      )}

      {signedIn === false && !error && (
        <p className="text-[11.5px] text-[var(--color-fg-dim)] text-center">
          {isEs
            ? "Te vamos a pedir iniciar sesión antes del pago."
            : "We'll ask you to sign in before the payment."}
        </p>
      )}
    </div>
  );
}
