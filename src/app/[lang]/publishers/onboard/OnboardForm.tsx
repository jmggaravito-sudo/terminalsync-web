"use client";

import { useState } from "react";

// Minimal form — POSTs to /api/marketplace/publishers and redirects the user
// to the Stripe-hosted onboarding link returned by the server. The auth
// handshake (Bearer token from Supabase) is wired in by whichever component
// owns the auth header — see src/lib/marketplace/auth.ts.

export function OnboardForm({ lang }: { lang: string }) {
  const isEs = lang === "es";
  const [displayName, setDisplayName] = useState("");
  const [slug, setSlug] = useState("");
  const [website, setWebsite] = useState("");
  const [bio, setBio] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/marketplace/publishers?lang=${lang}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // TODO: attach Authorization: Bearer <supabase-jwt> via the shared
        // auth helper that owns the session on the client side.
        body: JSON.stringify({ displayName, slug, website: website || undefined, bio: bio || undefined }),
      });
      const data = await res.json();
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
      {error && (
        <p className="text-[13px] text-red-500">{error}</p>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-[13px] font-semibold text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] glow-accent transition-all hover:-translate-y-px disabled:opacity-50"
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
