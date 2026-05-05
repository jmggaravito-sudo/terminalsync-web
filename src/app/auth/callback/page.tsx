"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Logo } from "@/components/Logo";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

/**
 * Universal magic-link callback. Handles Supabase OTP / magic-link
 * redirects from email. Two paths:
 *
 *   - Desktop user: the running Tauri app has the `terminalsync://`
 *     deep link; we attempt to dispatch and let the OS bring the app
 *     forward. The user's browser stays on this page as a fallback.
 *
 *   - Mobile / no-app user: supabase-js's `detectSessionInUrl: true`
 *     parses the hash on mount and creates the browser session, then
 *     we redirect into the marketplace. JM 2026-05-05 the email was
 *     pointing straight at `terminalsync://` (Supabase site_url) which
 *     iOS Safari rejected as "no app installed for this scheme".
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const [stage, setStage] = useState<"detecting" | "deeplink" | "session" | "error">(
    "detecting",
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sb = getSupabaseBrowser();
    if (!sb) {
      setError("Auth client not available.");
      setStage("error");
      return;
    }
    // Read the hash before supabase-js consumes it.
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    const isDesktop =
      typeof navigator !== "undefined" &&
      /Macintosh|Windows|Linux/.test(navigator.userAgent) &&
      !/iPhone|iPad|Android/.test(navigator.userAgent);

    // Best-effort deep link to the desktop app. Browsers that have it
    // installed will prompt and switch; browsers without it just show
    // a "no app available" toast and stay here. We don't block on it.
    if (isDesktop && hash) {
      setStage("deeplink");
      const dl = `terminalsync://auth/callback${hash}`;
      // Brief delay so the branded card renders first.
      const t = window.setTimeout(() => {
        try {
          window.location.href = dl;
        } catch {
          /* ignore — fall through to web session below */
        }
      }, 700);
      // After 2s, also try the web-session path so the user isn't
      // stranded if they don't have the app.
      const t2 = window.setTimeout(() => void completeWebSession(), 2200);
      return () => {
        window.clearTimeout(t);
        window.clearTimeout(t2);
      };
    }
    // Mobile / non-desktop browsers go straight to web session.
    void completeWebSession();

    async function completeWebSession() {
      try {
        const { data, error: e } = await sb!.auth.getSession();
        if (e) throw e;
        if (data.session) {
          setStage("session");
          // Park them on the marketplace home — most magic-link clicks
          // come from the publisher / marketplace flow.
          setTimeout(() => router.replace("/es/marketplace"), 800);
          return;
        }
        // Hash present but no session yet → supabase-js may still be
        // processing it. Give it a tick.
        const next = await sb!.auth.getSession();
        if (next.data.session) {
          setStage("session");
          setTimeout(() => router.replace("/es/marketplace"), 800);
          return;
        }
        setError("No pudimos crear la sesión.");
        setStage("error");
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        setStage("error");
      }
    }
  }, [router]);

  return (
    <main className="min-h-screen grid-bg flex items-center justify-center px-5 md:px-6 py-12">
      <div className="w-full max-w-[440px] rounded-3xl border border-[var(--color-border)] bg-[var(--color-panel)] shadow-floating p-8 text-center">
        <a
          href="https://terminalsync.ai"
          className="inline-flex items-center gap-2 font-semibold text-[14px] text-[var(--color-fg-strong)] no-underline mb-6"
        >
          <Logo size={26} />
          Terminal Sync
        </a>

        {stage !== "error" ? (
          <div
            className="mx-auto h-16 w-16 rounded-full flex items-center justify-center bg-[var(--color-ok)]/10 text-[var(--color-ok)]"
          >
            {stage === "session" ? (
              <CheckCircle2 size={30} strokeWidth={2} />
            ) : (
              <Loader2 size={28} className="animate-spin" />
            )}
          </div>
        ) : (
          <div className="mx-auto h-16 w-16 rounded-full flex items-center justify-center bg-[var(--color-err)]/10 text-[var(--color-err)]">
            <span className="text-2xl">!</span>
          </div>
        )}

        <h1 className="mt-5 text-[22px] font-semibold tracking-tight text-[var(--color-fg-strong)]">
          {stage === "deeplink" && "Abriendo Terminal Sync…"}
          {stage === "session" && "¡Listo!"}
          {stage === "detecting" && "Verificando…"}
          {stage === "error" && "Algo salió mal"}
        </h1>

        <p className="mt-3 text-[14px] text-[var(--color-fg-muted)] leading-relaxed">
          {stage === "deeplink" &&
            "Si tenés la app instalada, debería abrirse en un segundo. Si no, te llevamos al marketplace."}
          {stage === "session" && "Sesión iniciada. Te llevamos al marketplace."}
          {stage === "detecting" && "Procesando tu enlace mágico…"}
          {stage === "error" && (error || "Reintentá desde el login.")}
        </p>

        {stage === "error" && (
          <a
            href="/es/login"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-[13px] font-semibold text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]"
          >
            Volver al login
          </a>
        )}
      </div>
    </main>
  );
}
