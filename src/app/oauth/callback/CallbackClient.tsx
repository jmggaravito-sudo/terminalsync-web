"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { Logo } from "@/components/Logo";

interface Params {
  code?: string;
  state?: string;
  scope?: string;
  error?: string;
  error_description?: string;
}

// Auto-trigger the deep link back into the native Tauri app. Three states:
//  1. idle      → show branded card + auto-redirect countdown
//  2. dispatched → asked the browser to open terminalsync:// (may prompt user)
//  3. error     → Google returned ?error=... or params are malformed
export function CallbackClient({ params }: { params: Params }) {
  const [dispatched, setDispatched] = useState(false);

  const isError = !!params.error;
  const isMissing = !params.code || !params.state;

  // Build the deep link URL exactly once per render — Tauri parses code/state
  // out of the fragment/query on its side.
  const deepLink = useMemo(() => {
    if (!params.code || !params.state) return null;
    const qs = new URLSearchParams({
      code: params.code,
      state: params.state,
    });
    if (params.scope) qs.set("scope", params.scope);
    return `terminalsync://oauth/callback?${qs.toString()}`;
  }, [params.code, params.state, params.scope]);

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
          No pudimos completar el inicio de sesión
        </h1>
        <p className="mt-3 text-[14px] text-[var(--color-fg-muted)] leading-relaxed">
          Google respondió:{" "}
          <code className="font-mono text-[12.5px] bg-[var(--color-panel-2)] px-1.5 py-0.5 rounded">
            {params.error}
          </code>
          {params.error_description ? ` — ${params.error_description}` : null}
        </p>
        <p className="mt-3 text-[13px] text-[var(--color-fg-muted)]">
          Cierra esta pestaña y reintenta el inicio de sesión desde la app.
        </p>
      </Layout>
    );
  }

  if (isMissing) {
    return (
      <Layout variant="error">
        <h1 className="text-[22px] font-semibold tracking-tight text-[var(--color-fg-strong)]">
          Faltan parámetros en la redirección
        </h1>
        <p className="mt-3 text-[14px] text-[var(--color-fg-muted)]">
          Esta página debería llegar con <code>code</code> y <code>state</code>{" "}
          en la URL. Parece que algo interrumpió el flujo.
        </p>
        <p className="mt-3 text-[13px] text-[var(--color-fg-muted)]">
          Reintenta desde la app — si el problema persiste, escríbenos a{" "}
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
        ¡Listo!
      </h1>
      <p className="mt-3 text-[14px] text-[var(--color-fg-muted)] leading-relaxed">
        Tu Google Drive está conectado a Terminal Sync. Te llevamos de vuelta a
        la app.
      </p>
      <a
        href={deepLink ?? "#"}
        className="mt-7 inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-[13px] font-semibold text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] transition-colors glow-accent"
      >
        Abrir Terminal Sync
        <ArrowRight size={14} strokeWidth={2.4} />
      </a>
      <p className="mt-4 text-[11.5px] text-[var(--color-fg-dim)]">
        {dispatched
          ? "Si no abrió sola, usa el botón de arriba."
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
