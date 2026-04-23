import Link from "next/link";
import { Download } from "lucide-react";
import type { Dict, Locale } from "@/content";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

interface Props {
  dict: Dict;
  lang: Locale;
}

export function Nav({ dict, lang }: Props) {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-[var(--color-bg)]/80 border-b border-[var(--color-border)]">
      <div className="mx-auto max-w-6xl px-5 md:px-6 h-14 flex items-center justify-between gap-4">
        <Link href={`/${lang}`} className="flex items-center gap-2 shrink-0">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-info)] flex items-center justify-center shadow-[0_0_14px_-2px_var(--color-accent-glow)]">
            <div className="h-2 w-2 rounded-full bg-white" />
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-[var(--color-fg-strong)]">
            TerminalSync
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-[13px] text-[var(--color-fg-muted)]">
          <a href="#demos" className="hover:text-[var(--color-fg-strong)] transition-colors">
            {dict.nav.demos}
          </a>
          <a href="#features" className="hover:text-[var(--color-fg-strong)] transition-colors">
            {dict.nav.features}
          </a>
          <a href="#pricing" className="hover:text-[var(--color-fg-strong)] transition-colors">
            {dict.nav.pricing}
          </a>
          <a href="#affiliates" className="hover:text-[var(--color-fg-strong)] transition-colors">
            {dict.nav.affiliates}
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex">
            <ThemeToggle labels={dict.theme} />
          </div>
          <LanguageSwitcher current={lang} />
          <a
            href="#hero"
            className="hidden sm:inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] text-white text-[12.5px] font-semibold transition-all shadow-[0_6px_20px_-8px_var(--color-accent-glow)] hover:shadow-[0_10px_26px_-8px_var(--color-accent-glow)]"
          >
            <Download size={12} strokeWidth={2.4} />
            {dict.nav.download}
          </a>
        </div>
      </div>
    </header>
  );
}
