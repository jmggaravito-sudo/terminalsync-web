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
    // Always go straight to the web session on this page. Earlier
    // versions auto-dispatched `terminalsync://auth/callback#hash`
    // when the UA looked like macOS, but that ate the token before
    // the web session could parse it AND opened the desktop app
    // unexpectedly when the user was just trying to do magic-link
    // auth in Safari/Chrome. JM 2026-05-05.
    //
    // Users who actually want the desktop app's auth flow open it
    // FROM the desktop app (which uses the OAuth deep-link flow at
    // /oauth/callback, not this page).
    void completeWebSession();

    async function completeWebSession() {
      try {
        const url = new URL(window.location.href);

        // Supabase redirects errors as `?error=...&error_code=...&error_description=...`.
        // Surface them verbatim so the user knows what to do (the
        // common one is `otp_expired` when an email scanner pre-fetched
        // the token before the user clicked).
        const errCode = url.searchParams.get("error_code") || url.searchParams.get("error");
        const errDesc = url.searchParams.get("error_description");
        if (errCode) {
          const friendly =
            errCode === "otp_expired" || errCode === "access_denied"
              ? "Tu link mágico ya fue usado o expiró. Pedinos uno nuevo desde la página de login."
              : `${errCode}${errDesc ? ` — ${errDesc}` : ""}`;
          setError(friendly);
          setStage("error");
          return;
        }

        // PKCE flow: Supabase puts ?code=... in the query.
        const code = url.searchParams.get("code");
        if (code) {
          const { error: e } = await sb!.auth.exchangeCodeForSession(code);
          if (e) throw e;
          setStage("session");
          setTimeout(() => router.replace("/es/marketplace"), 800);
          return;
        }

        // Implicit hash flow: parse access_token + refresh_token from
        // the hash and call setSession explicitly. We don't rely on
        // supabase-js's `detectSessionInUrl` auto-handler because it
        // can race the React mount on iOS Safari.
        const hashStr = window.location.hash.startsWith("#")
          ? window.location.hash.slice(1)
          : window.location.hash;
        if (hashStr) {
          const hashParams = new URLSearchParams(hashStr);
          const accessToken = hashParams.get("access_token");
          const refreshToken = hashParams.get("refresh_token");
          if (accessToken && refreshToken) {
            const { error: e } = await sb!.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (e) throw e;
            setStage("session");
            setTimeout(() => router.replace("/es/marketplace"), 800);
            return;
          }
        }

        // Last-resort: poll getSession in case detectSessionInUrl is
        // still processing on a slow device.
        for (let i = 0; i < 6; i++) {
          const { data } = await sb!.auth.getSession();
          if (data.session) {
            setStage("session");
            setTimeout(() => router.replace("/es/marketplace"), 800);
            return;
          }
          await new Promise((r) => setTimeout(r, 250));
        }

        setError(
          "No encontré ni código ni token en este enlace. Suele pasar cuando tu cliente de email pre-fetchea el link (Gmail con scanning de seguridad). Pedinos un link nuevo y abrilo en una pestaña aparte sin previsualizar el correo.",
        );
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
