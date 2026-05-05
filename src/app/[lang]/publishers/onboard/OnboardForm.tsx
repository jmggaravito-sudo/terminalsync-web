"use client";

import { useEffect, useState } from "react";
import { authedFetch, getSupabaseBrowser } from "@/lib/supabase/browser";

// Form POSTs to /api/marketplace/publishers and redirects to Stripe-hosted
// onboarding. Auth via authedFetch which attaches the Supabase JWT.

export function OnboardForm({ lang }: { lang: string }) {
  const isEs = lang === "es";
  const [displayName, setDisplayName] = useState("");
  const [slug, setSlug] = useState("");
  const [website, setWebsite] = useState("");
  const [bio, setBio] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const sb = getSupabaseBrowser();
    if (!sb) { setSignedIn(false); return; }
    sb.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => setSignedIn(!!session));
    return () => sub.subscription.unsubscribe();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await authedFetch(`/api/marketplace/publishers?lang=${lang}`, {
        method: "POST",
        body: JSON.stringify({ displayName, slug, website: website || undefined, bio: bio || undefined }),
      });
      const data = await res.json();
      if (res.status === 401) {
        throw new Error(
          isEs
            ? "Iniciá sesión con tu cuenta antes de registrarte como publisher."
            : "Sign in with your account before registering as a publisher.",
        );
      }
      if (!res.ok) throw new Error(data.error ?? "Onboarding failed");
      window.location.href = data.onboardingUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label={isEs ? "Nombre público" : "Display name"} hint={isEs ? "Lo que verán los compradores." : "What buyers see."}>
        <input
          required
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          minLength={2}
          maxLength={60}
          className={inputCls}
        />
      </Field>
      <Field label="Slug" hint={isEs ? "URL única — solo a–z, 0–9, guiones." : "URL-safe — lowercase, digits, hyphens."}>
        <input
          required
          value={slug}
          onChange={(e) => setSlug(e.target.value.toLowerCase())}
          pattern="[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])?"
          className={inputCls}
        />
      </Field>
      <Field label="Website" optional>
        <input
          type="url"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="https://"
          className={inputCls}
        />
      </Field>
      <Field label="Bio" optional hint={isEs ? "Hasta 280 caracteres." : "Up to 280 characters."}>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={280}
          rows={3}
          className={inputCls}
        />
      </Field>
      {signedIn === false && (
        <a
          href={`/${lang}/login?next=${encodeURIComponent(`/${lang}/publishers/onboard`)}`}
          className="block rounded-xl border border-amber-500/40 bg-amber-500/10 px-3.5 py-2.5 text-[12.5px] text-amber-400 hover:bg-amber-500/15 transition-colors"
        >
          {isEs
            ? "Necesitás iniciar sesión antes de continuar. Click acá para entrar →"
            : "Sign in with your account first. Click here to log in →"}
        </a>
      )}
      {error && (
        <p className="text-[13px] text-red-500">{error}</p>
      )}
      <button
        type="submit"
        disabled={submitting || signedIn === false}
        className="inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-[13px] font-semibold text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] glow-accent transition-all hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? (isEs ? "Conectando con Stripe…" : "Connecting to Stripe…") : (isEs ? "Continuar a Stripe" : "Continue to Stripe")}
      </button>
    </form>
  );
}

const inputCls =
  "w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-2 text-[14px] focus:outline-none focus:border-[var(--color-accent)]";

function Field({
  label,
  hint,
  optional,
  children,
}: {
  label: string;
  hint?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[12px] font-mono uppercase tracking-[0.12em] text-[var(--color-fg-muted)]">
        {label}{optional && <span className="ml-1 opacity-60">(opt)</span>}
      </span>
      <div className="mt-1.5">{children}</div>
      {hint && <p className="mt-1 text-[11.5px] text-[var(--color-fg-dim)]">{hint}</p>}
    </label>
  );
}
