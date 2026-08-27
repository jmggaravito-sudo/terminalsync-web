"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { Logo } from "@/components/Logo";
import { buildDeepLink } from "./buildDeepLink";
import type { CallbackLang } from "./callbackLang";

interface Params {
  code?: string;
  state?: string;
  scope?: string;
  error?: string;
  error_description?: string;
}

const COPY = {
  en: {
    successTitle: "Done!",
    defaultSuccessMessage:
      "Your Google Drive is connected to Terminal Sync. Taking you back to the app.",
    openApp: "Open Terminal Sync",
    redirecting: "Redirecting automatically…",
    alreadyDispatched: "If it did not open automatically, use the button above.",
    authErrorTitle: "We could not complete sign-in",
    providerAnswered: (providerName: string) => `${providerName} responded:`,
    retryInApp: "Taking you back to the app so you can try again.",
    missingTitle: "Missing redirect parameters",
    missingBody:
      "This page should arrive with code and state in the URL. It looks like something interrupted the flow.",
    missingRetryPrefix: "Try again from the app — if the problem continues, email us at",
  },
  es: {
    successTitle: "¡Listo!",
    defaultSuccessMessage:
      "Tu Google Drive está conectado a Terminal Sync. Te llevamos de vuelta a la app.",
    openApp: "Abrir Terminal Sync",
    redirecting: "Redirigiendo automáticamente…",
    alreadyDispatched: "Si no abrió sola, usa el botón de arriba.",
    authErrorTitle: "No pudimos completar el inicio de sesión",
    providerAnswered: (providerName: string) => `${providerName} respondió:`,
    retryInApp: "Te llevamos de vuelta a la app para que puedas intentarlo de nuevo.",
    missingTitle: "Faltan parámetros en la redirección",
    missingBody:
      "Esta página debería llegar con code y state en la URL. Parece que algo interrumpió el flujo.",
    missingRetryPrefix: "Reintenta desde la app — si el problema persiste, escríbenos a",
  },
} as const;

// Auto-trigger the deep link back into the native Tauri app. Three states:
//  1. idle      → show branded card + auto-redirect countdown
//  2. dispatched → asked the browser to open terminalsync:// or terminalsync-lab:// (may prompt user)
//  3. error     → Google returned ?error=... or params are malformed
export function CallbackClient({
  params,
  providerName = "Google",
  successMessage,
  nativePath,
  lang = "es",
}: {
  params: Params;
  providerName?: string;
  successMessage?: string;
  nativePath?: string;
  lang?: CallbackLang;
}) {
  const [dispatched, setDispatched] = useState(false);
  const copy = COPY[lang];
  const resolvedSuccessMessage = successMessage ?? copy.defaultSuccessMessage;

  const isError = !!params.error;
  const isMissing = !params.state || (!params.code && !params.error);

  // Build the deep link URL exactly once per render. The helper picks
  // terminalsync-lab:// vs terminalsync:// from the state's prefix and
  // serializes `state` with a literal `:` (NOT %3A) so the native app's
  // byte-exact CSRF check passes. See buildDeepLink.ts for the contract.
  const deepLink = useMemo(
    () => buildDeepLink(params, { nativePath }),
    [params.code, params.error, params.error_description, params.state, params.scope, nativePath],
  );

  useEffect(() => {
    if (!deepLink || dispatched) return;
    // Brief delay lets the branded page render before the OS prompts.
    // Chrome / Safari will show "Open Terminal Sync?" — that's expected.
    const handle = window.setTimeout(() => {
      setDispatched(true);
      window.location.href = deepLink;
    }, 600);
    return () => window.clearTimeout(handle);
  }, [deepLink, dispatched]);

  if (isError) {
    return (
      <Layout variant="error">
        <h1 className="text-[22px] font-semibold tracking-tight text-[var(--color-fg-strong)]">
          {copy.authErrorTitle}
        </h1>
        <p className="mt-3 text-[14px] text-[var(--color-fg-muted)] leading-relaxed">
          {copy.providerAnswered(providerName)}{" "}
          <code className="font-mono text-[12.5px] bg-[var(--color-panel-2)] px-1.5 py-0.5 rounded">
            {params.error}
          </code>
          {params.error_description ? ` — ${params.error_description}` : null}
        </p>
        <p className="mt-3 text-[13px] text-[var(--color-fg-muted)]">
          {copy.retryInApp}
        </p>
      </Layout>
    );
  }

  if (isMissing) {
    return (
      <Layout variant="error">
        <h1 className="text-[22px] font-semibold tracking-tight text-[var(--color-fg-strong)]">
          {copy.missingTitle}
        </h1>
        <p className="mt-3 text-[14px] text-[var(--color-fg-muted)]">
          {copy.missingBody}
        </p>
        <p className="mt-3 text-[13px] text-[var(--color-fg-muted)]">
          {copy.missingRetryPrefix}{" "}
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

  return (
    <Layout variant="success">
      <h1 className="text-[22px] font-semibold tracking-tight text-[var(--color-fg-strong)]">
        {copy.successTitle}
      </h1>
      <p className="mt-3 text-[14px] text-[var(--color-fg-muted)] leading-relaxed">
        {resolvedSuccessMessage}
      </p>
      <a
        href={deepLink ?? "#"}
        className="mt-7 inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-[13px] font-semibold text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] transition-colors glow-accent"
      >
        {copy.openApp}
        <ArrowRight size={14} strokeWidth={2.4} />
      </a>
      <p className="mt-4 text-[11.5px] text-[var(--color-fg-dim)]">
        {dispatched ? copy.alreadyDispatched : copy.redirecting}
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
  const color =
    variant === "success" ? "var(--color-ok)" : "var(--color-err)";
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
