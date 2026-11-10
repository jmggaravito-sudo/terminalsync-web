"use client";

import { useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

// Voice Studio client login options: Google (primary — the admin login's
// most reliable path) plus an email magic link as the fallback. Both are
// Supabase OAuth/OTP flows that land on /auth/callback and get bounced to
// the dashboard via `next`. Kept as a shared component because it renders
// both on the standalone /voice-studio/login page and inline in the
// dashboard gate.
export function VsLoginButtons({
  destination = "/voice-studio/orders",
}: { destination?: "/voice-studio/orders" | "/admin/voice-studio/production" } = {}) {
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [linkSent, setLinkSent] = useState(false);
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function callbackUrl(): string | undefined {
    if (typeof window === "undefined") return undefined;
    return `${window.location.origin}/auth/callback?next=${encodeURIComponent(
      destination,
    )}`;
  }

  async function onGoogle() {
    setGoogleSubmitting(true);
    setError(null);
    const sb = getSupabaseBrowser();
    if (!sb) {
      setError("Sign-in is not configured. Please try again later.");
      setGoogleSubmitting(false);
      return;
    }
    const { error: err } = await sb.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl() },
    });
    // On success the browser navigates to Google; we only reach here on error.
    if (err) {
      setError(err.message);
      setGoogleSubmitting(false);
    }
  }

  async function onEmailLink(e: React.FormEvent) {
    e.preventDefault();
    setEmailSubmitting(true);
    setError(null);
    const sb = getSupabaseBrowser();
    if (!sb) {
      setError("Sign-in is not configured. Please try again later.");
      setEmailSubmitting(false);
      return;
    }
    const { error: err } = await sb.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: callbackUrl() },
    });
    setEmailSubmitting(false);
    if (err) setError(err.message);
    else setLinkSent(true);
  }

  if (linkSent) {
    return (
      <div className="rounded-xl border border-emerald-500/40 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
        Check your inbox — we sent a sign-in link to{" "}
        <strong>{email}</strong>. Open it on this device and you&apos;ll land
        straight on your dashboard.
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm space-y-4">
      <button
        type="button"
        onClick={onGoogle}
        disabled={googleSubmitting}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold text-zinc-800 shadow-sm transition-colors hover:bg-zinc-50 disabled:opacity-60"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.57 5.57 0 0 1-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82Z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A11.99 11.99 0 0 0 12 24Z"
          />
          <path
            fill="#FBBC05"
            d="M5.27 14.29A7.2 7.2 0 0 1 4.89 12c0-.8.14-1.57.38-2.29V6.62H1.29a12 12 0 0 0 0 10.76l3.98-3.09Z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75Z"
          />
        </svg>
        {googleSubmitting ? "Redirecting…" : "Continue with Google"}
      </button>

      <div className="flex items-center gap-3 text-xs text-zinc-400">
        <span className="h-px flex-1 bg-zinc-200" />
        or
        <span className="h-px flex-1 bg-zinc-200" />
      </div>

      <form onSubmit={onEmailLink} className="space-y-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@yourdomain.com"
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-amber-500"
        />
        <button
          type="submit"
          disabled={emailSubmitting}
          className="w-full rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:opacity-60"
        >
          {emailSubmitting ? "Sending…" : "Email me a sign-in link"}
        </button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
