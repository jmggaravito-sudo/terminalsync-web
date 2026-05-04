import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/Logo";
import type { Locale } from "@/content";

// Shared shell for legal-style pages (privacy, terms, security, about,
// blog). Uses the same slim header + max-w-3xl prose-style body that the
// existing affiliates legal page uses, so all "secondary" pages feel
// consistent. Content is passed in via children — pages stay lean.
export function LegalShell({
  lang,
  title,
  subtitle,
  lastUpdated,
  children,
  backHref,
  backLabel,
}: {
  lang: Locale;
  title: string;
  subtitle?: string;
  lastUpdated?: string;
  children: React.ReactNode;
  backHref?: string;
  backLabel?: string;
}) {
  const homeLabel = lang === "es" ? "Volver al inicio" : "Back to home";
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <header className="sticky top-0 z-20 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-md">
        <div className="mx-auto max-w-3xl px-5 md:px-6 h-12 flex items-center justify-between">
          <Link
            href={`/${lang}`}
            className="flex items-center gap-2 text-[13px] font-semibold text-[var(--color-fg-strong)]"
          >
            <Logo size={24} />
            TerminalSync
          </Link>
          <Link
            href={backHref ?? `/${lang}`}
            className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--color-fg-muted)] hover:text-[var(--color-fg-strong)]"
          >
            <ArrowLeft size={14} strokeWidth={2.4} />
            {backLabel ?? homeLabel}
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-5 md:px-6 py-12 md:py-16">
        <h1 className="text-[28px] md:text-[34px] font-semibold tracking-tight text-[var(--color-fg-strong)] leading-[1.1]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 text-[15.5px] text-[var(--color-fg-muted)] leading-relaxed">
            {subtitle}
          </p>
        )}
        {lastUpdated && (
          <p className="mt-4 text-[12px] uppercase tracking-[0.12em] text-[var(--color-fg-dim)] font-mono">
            {lastUpdated}
          </p>
        )}

        <div className="mt-10 prose-legal">
          {children}
        </div>
      </article>
    </div>
  );
}
