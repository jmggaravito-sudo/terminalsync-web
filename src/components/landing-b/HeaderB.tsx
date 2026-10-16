"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import type { Dict, Locale } from "@/content";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Logo } from "@/components/Logo";

interface Props {
  dict: Dict;
  lang: Locale;
}

export function HeaderB({ dict, lang, standalone = false }: Props & { standalone?: boolean }) {
  const c = dict.landingB?.header;
  const standaloneTheme = standalone
    ? ({
        "--color-bg": "#ffffff",
        "--color-panel": "#ffffff",
        "--color-panel-2": "#f8f7fc",
        "--color-border": "#e2e4e9",
        "--color-fg": "#16181d",
        "--color-fg-strong": "#16181d",
        "--color-fg-muted": "#565b64",
        "--color-accent": "#6a48e8",
        "--color-accent-soft": "#5a37d6",
        "--color-accent-glow": "rgba(106,72,232,0.16)",
      } as CSSProperties)
    : undefined;

  return (
    <header
      className={standalone
        ? "sticky top-0 z-30 border-b border-[#e2e4e9] bg-white/90 backdrop-blur-md"
        : "sticky top-0 z-30 backdrop-blur-md bg-[var(--color-bg)]/80 border-b border-[var(--color-border)]"}
      style={standaloneTheme}
    >
      <div className="mx-auto max-w-6xl px-5 md:px-6 h-14 flex items-center justify-between gap-4">
        <Link href={`/${lang}`} className="flex items-center gap-2 shrink-0">
          <Logo size={28} />
          <span className="text-[15px] font-semibold tracking-tight text-[var(--color-fg-strong)]">
            TS
          </span>
        </Link>

        <div className="flex items-center gap-3 ml-auto">
          {!standalone && <ThemeToggle labels={dict.theme} />}
          <LanguageSwitcher current={lang} />
          <a
            href="mailto:hola@terminalsync.ai"
            className="hidden sm:inline-flex items-center h-8 px-3.5 rounded-full border border-[var(--color-border)] text-[13px] text-[var(--color-fg-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-fg-strong)] transition-colors"
          >
            {c?.talk ?? "Hablar con nosotros"}
          </a>
          <a
            href="/api/download"
            data-cta="header-b-download"
            className="inline-flex items-center h-8 px-3.5 rounded-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-[12.5px] font-semibold transition-all shadow-[0_6px_20px_-8px_rgba(124,58,237,0.45)]"
          >
            {c?.download ?? "Descargar"}
          </a>
        </div>
      </div>
    </header>
  );
}
