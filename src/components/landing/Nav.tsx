"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Download, Menu, X } from "lucide-react";
import type { Dict, Locale } from "@/content";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Logo } from "@/components/Logo";

interface Props {
  dict: Dict;
  lang: Locale;
}

// Slim variant on marketplace-context routes: hides landing-only anchors
// (they 404 from non-home pages anyway) and the Download CTA — the
// marketplace promo banner already pitches the app.
function isMarketplaceContext(pathname: string | null): boolean {
  if (!pathname) return false;
  return /^\/(es|en)\/(marketplace|admin|publishers|connectors|skills|cli-tools)(\/|$)/.test(pathname);
}

type NavItem = { href: string; label: string; external?: boolean; strong?: boolean };

export function Nav({ dict, lang }: Props) {
  const pathname = usePathname();
  const marketplace = isMarketplaceContext(pathname);
  const [open, setOpen] = useState(false);

  // Una sola fuente de items para desktop y móvil.
  const items: NavItem[] = marketplace
    ? [
        { href: `/${lang}/connectors`, label: "Connectors", external: true },
        { href: `/${lang}/skills`, label: "Skills", external: true },
        { href: `/${lang}/cli-tools`, label: "CLI", external: true },
      ]
    : [
        // Nav del rediseño (handoff): 4 ítems, sin Marketplace (retirado).
        { href: "#how-it-works", label: lang === "es" ? "Cómo funciona" : "How it works" },
        { href: "#multi-ai", label: lang === "es" ? "Tu equipo de IAs" : "Your AI team" },
        { href: `/${lang}/casos-de-uso`, label: lang === "es" ? "Casos de uso" : "Use cases", external: true },
        { href: `/${lang}/stacks`, label: lang === "es" ? "Integraciones" : "Integrations", external: true },
        { href: "#pricing", label: dict.nav.pricing },
      ];

  const linkClass = (strong?: boolean) =>
    `hover:text-[var(--color-fg-strong)] transition-colors${
      strong ? " font-medium text-[var(--color-fg-strong)]" : ""
    }`;

  const renderItem = (it: NavItem, onClick?: () => void) =>
    it.external ? (
      <Link key={it.href} href={it.href} onClick={onClick} className={linkClass(it.strong)}>
        {it.label}
      </Link>
    ) : (
      <a key={it.href} href={it.href} onClick={onClick} className={linkClass(it.strong)}>
        {it.label}
      </a>
    );

  const cta = marketplace ? (
    <Link
      href={`/${lang}/publishers/onboard`}
      data-cta="nav-onboarding"
      className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] text-white text-[12.5px] font-semibold transition-all shadow-[0_6px_20px_-8px_var(--color-accent-glow)] hover:shadow-[0_10px_26px_-8px_var(--color-accent-glow)]"
    >
      {lang === "es" ? "Empezar onboarding" : "Start onboarding"}
      <ArrowRight size={12} strokeWidth={2.4} />
    </Link>
  ) : (
    <a
      href="/api/download"
      data-cta="nav-download"
      className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] text-white text-[12.5px] font-semibold transition-all shadow-[0_6px_20px_-8px_var(--color-accent-glow)] hover:shadow-[0_10px_26px_-8px_var(--color-accent-glow)]"
    >
      <Download size={12} strokeWidth={2.4} />
      {dict.nav.download}
    </a>
  );

  // En el menú móvil aclaramos que la descarga es para la computadora
  // (la app es de escritorio, no se instala en el teléfono).
  const mobileCta = marketplace ? (
    cta
  ) : (
    <a
      href="/api/download"
      data-cta="nav-download-mobile"
      className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] text-white text-[13px] font-semibold transition-all"
    >
      <Download size={13} strokeWidth={2.4} />
      {lang === "es" ? "Descargar para tu computadora" : "Download for your computer"}
    </a>
  );

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-[var(--color-bg)]/80 border-b border-[var(--color-border)]">
      <div className="mx-auto max-w-6xl px-5 md:px-6 h-14 flex items-center justify-between gap-4">
        <Link
          href={marketplace ? `/${lang}/marketplace` : `/${lang}`}
          className="flex items-center gap-2 shrink-0"
          onClick={() => setOpen(false)}
        >
          <Logo size={28} />
          <span className="text-[15px] font-semibold tracking-tight text-[var(--color-fg-strong)]">
            TerminalSync
          </span>
        </Link>

        {/* Nav desktop — centered links */}
        <nav className="hidden md:flex flex-1 items-center justify-center gap-6 text-[13px] text-[var(--color-fg-muted)]">
          {items.map((it) => renderItem(it))}
        </nav>

        <div className="flex items-center gap-2 ml-auto">
          <div className="hidden sm:flex">
            <ThemeToggle labels={dict.theme} />
          </div>
          <LanguageSwitcher current={lang} />
          <div className="hidden sm:flex">{cta}</div>

          {/* Botón hamburguesa — solo móvil */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-lg text-[var(--color-fg)] hover:bg-[var(--color-panel)] transition-colors"
          >
            {open ? <X size={20} strokeWidth={2} /> : <Menu size={20} strokeWidth={2} />}
          </button>
        </div>
      </div>

      {/* Panel móvil desplegable */}
      {open ? (
        <nav className="md:hidden border-t border-[var(--color-border)] bg-[var(--color-bg)]/95 backdrop-blur-md">
          <div className="mx-auto max-w-6xl px-5 py-3 flex flex-col gap-1 text-[15px] text-[var(--color-fg)]">
            {items.map((it) => (
              <span key={it.href} className="py-2">
                {renderItem(it, () => setOpen(false))}
              </span>
            ))}
            <div className="mt-2 pt-3 border-t border-[var(--color-border)] flex items-center justify-between gap-3">
              <ThemeToggle labels={dict.theme} />
              <div onClick={() => setOpen(false)}>{mobileCta}</div>
            </div>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
