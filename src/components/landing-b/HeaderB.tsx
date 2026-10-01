"use client";

import Link from "next/link";
import type { Dict, Locale } from "@/content";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Logo } from "@/components/Logo";

interface Props {
  dict: Dict;
  lang: Locale;
}

export function HeaderB({ dict, lang }: Props) {
  const c = dict.landingB?.header;

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-[var(--color-bg)]/80 border-b border-[var(--color-border)]">
      <div className="mx-auto max-w-6xl px-5 md:px-6 h-14 flex items-center justify-between gap-4">
        <Link href={`/${lang}`} className="flex items-center gap-2 shrink-0">
          <Logo size={28} />
          <span className="text-[15px] font-semibold tracking-tight text-[var(--color-fg-strong)]">
            TerminalSync
          </span>
        </Link>

        <div className="flex items-center gap-3 ml-auto">
          <ThemeToggle labels={dict.theme} />
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
            className="inline-flex items-center h-8 px-3.5 rounded-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] text-white text-[12.5px] font-semibold transition-all shadow-[0_6px_20px_-8px_var(--color-accent-glow)]"
          >
            {c?.download ?? "Descargar"}
          </a>
        </div>
      </div>
    </header>
  );
}
