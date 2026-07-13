"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, AlertTriangle, ArrowRight, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { buildSupabaseDeepLink, type SupabaseCallbackParams } from "./buildSupabaseDeepLink";

// Landing page for Supabase Auth flows. Supabase can send the tokens either
//  - in the query string as `?code=...&state=...` (PKCE — what our app uses),
//  - or in the URL fragment as `#access_token=...&refresh_token=...` (implicit).
// We forward BOTH to the native app so any future config change still lands.
// The auto-dispatch fires after a short delay so the branded card gets a
// paint tick before the OS prompt appears.
export function SupabaseCallbackClient({
  params,
}: {
  params: SupabaseCallbackParams;
}) {
  const [dispatched, setDispatched] = useState(false);
  const [hashFragment, setHashFragment] = useState<string>("");

  useEffect(() => {
    // The fragment (implicit flow) is not part of the server searchParams —
    // read it from window on mount. Empty string when Supabase sent PKCE.
    if (typeof window !== "undefined") {
      setHashFragment(window.location.hash.replace(/^#/, ""));
    }
  }, []);

  const isError = !!params.error || !!params.error_code;
  // At least one signal from Supabase — query code OR hash access_token — must
  // arrive. Otherwise the browser landed here without a real Auth response.
  const hasSignal =
    !!params.code || hashFragment.includes("access_token=");

  const deepLink = useMemo(
    () => buildSupabaseDeepLink(params, hashFragment),
    [params, hashFragment],
  );

  useEffect(() => {
    if (!deepLink || dispatched || isError || !hasSignal) return;
    const handle = window.setTimeout(() => {
      setDispatched(true);
      window.location.href = deepLink;
    }, 600);
    return () => window.clearTimeout(handle);
  }, [deepLink, dispatched, isError, hasSignal]);

  if (isError) {
    const label = params.error_description ?? params.error ?? params.error_code;
    return (
      <Layout variant="error">
        <h1 className="text-[22px] font-semibold tracking-tight text-[var(--color-fg-strong)]">
          No pudimos completar el inicio de sesión
        </h1>
        <p className="mt-3 text-[14px] text-[var(--color-fg-muted)] leading-relaxed">
          Supabase respondió:{" "}
          <code className="font-mono text-[12.5px] bg-[var(--color-panel-2)] px-1.5 py-0.5 rounded">
            {decodeURIComponent(String(label ?? ""))}
          </code>
        </p>
        <p className="mt-3 text-[13px] text-[var(--color-fg-muted)]">
          Volvé a la app y reintenta el inicio de sesión. Si el problema persiste, escribinos a{" "}
          <a
            href="mailto:support@terminalsync.ai"
            className="text-[var(--color-accent)] hover:underline"
          >
            support@terminalsync.ai
          </a>
          .
        </p>
      </Layout>
    );
  }

  if (!hasSignal) {
    return (
      <Layout variant="error">
        <h1 className="text-[22px] font-semibold tracking-tight text-[var(--color-fg-strong)]">
          Faltan parámetros en la redirección
        </h1>
        <p className="mt-3 text-[14px] text-[var(--color-fg-muted)]">
          Esta página debería recibir el resultado del inicio de sesión en la
          URL. Parece que algo interrumpió el flujo — reintenta desde la app.
        </p>
      </Layout>
    );
  }

  return (
    <Layout variant="success">
      <h1 className="text-[22px] font-semibold tracking-tight text-[var(--color-fg-strong)]">
        ¡Listo!
      </h1>
      <p className="mt-3 text-[14px] text-[var(--color-fg-muted)] leading-relaxed">
        Ya estás dentro de Terminal Sync. Podés cerrar esta pestaña.
      </p>
      <div className="mt-7 flex flex-wrap gap-2 justify-center">
        <a
          href={deepLink ?? "#"}
          className="inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-[13px] font-semibold text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] transition-colors glow-accent"
        >
          Abrir Terminal Sync
          <ArrowRight size={14} strokeWidth={2.4} />
        </a>
        {/* Attempts to close the tab. Modern browsers only honour window.close
           on tabs opened by scripts, so this may be a no-op — that's why the
           copy explicitly tells the user "podés cerrarla" as a fallback. */}
        <button
          type="button"
          onClick={() => {
            try {
              window.close();
            } catch {
              /* browser refused; the copy already covers this case */
            }
          }}
          className="inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-[13px] font-semibold text-[var(--color-fg-strong)] border border-[var(--color-border)] hover:bg-[var(--color-panel-2)] transition-colors"
        >
          Cerrar esta ventana
          <X size={14} strokeWidth={2.4} />
        </button>
      </div>
      <p className="mt-4 text-[11.5px] text-[var(--color-fg-dim)]">
        {dispatched
          ? "Si la app no se abrió sola, usá el botón de arriba."
          : "Redirigiendo automáticamente…"}
      </p>
    </Layout>
  );
}

function Layout({
  variant,
  children,
}: {
  variant: "success" | "error";
  children: React.ReactNode;
}) {
  const color = variant === "success" ? "var(--color-ok)" : "var(--color-err)";
  const Icon = variant === "success" ? CheckCircle2 : AlertTriangle;
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
        <div
          className="mx-auto h-16 w-16 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: `color-mix(in oklch, ${color} 12%, transparent)`,
            color,
          }}
        >
          <Icon size={30} strokeWidth={2} />
        </div>
        <div className="mt-5">{children}</div>
        <div className="mt-8 text-[11px] text-[var(--color-fg-dim)]">
          terminalsync.ai
        </div>
      </div>
    </main>
  );
}
