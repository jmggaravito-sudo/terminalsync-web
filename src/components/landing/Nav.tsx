"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Download, Menu, X } from "lucide-react";
import type { Dict, Locale } from "@/content";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Logo } from "@/components/Logo";

interface Props {
  dict: Dict;
  lang: Locale;
}

// Slim variant on marketplace-context routes: hides landing-only anchors
// (they 404 from non-home pages anyway) and swaps in catalog links. The
// Download CTA stays as the primary action across the site.
function isMarketplaceContext(pathname: string | null): boolean {
  if (!pathname) return false;
  return /^\/(es|en)\/(marketplace|admin|publishers|connectors|skills|cli-tools)(\/|$)/.test(pathname);
}

// Anchor items point to a section on the home page; link items are real
// routes. Anchors get the scroll-driven "active" highlight in the capsule;
// links get highlighted when the current route matches.
type NavItem =
  | { kind: "anchor"; label: string; anchor: string }
  | { kind: "link"; label: string; href: string };

export function Nav({ dict, lang }: Props) {
  const pathname = usePathname();
  const marketplace = isMarketplaceContext(pathname);
  const isHome = pathname === `/${lang}` || pathname === `/${lang}/`;
  const [open, setOpen] = useState(false);
  const [activeAnchor, setActiveAnchor] = useState("");

  // Una sola fuente de items para desktop y móvil.
  const items: NavItem[] = marketplace
    ? [
        { kind: "link", label: "Connectors", href: `/${lang}/connectors` },
        { kind: "link", label: "Skills", href: `/${lang}/skills` },
        { kind: "link", label: "CLI", href: `/${lang}/cli-tools` },
      ]
    : [
        // Nav del rediseño (handoff): 5 ítems, sin Marketplace (retirado).
        { kind: "anchor", label: lang === "es" ? "Cómo funciona" : "How it works", anchor: "how-it-works" },
        { kind: "anchor", label: lang === "es" ? "Tu equipo de IAs" : "Your AI team", anchor: "multi-ai" },
        { kind: "link", label: lang === "es" ? "Casos de uso" : "Use cases", href: `/${lang}/casos-de-uso` },
        { kind: "link", label: lang === "es" ? "Integraciones" : "Integrations", href: `/${lang}/stacks` },
        { kind: "anchor", label: dict.nav.pricing, anchor: "pricing" },
      ];

  // Detección de sección activa por scroll — solo aplica a los anchors de la
  // home. En subpáginas no hay secciones que observar.
  useEffect(() => {
    if (!isHome) {
      setActiveAnchor("");
      return;
    }
    const anchorIds = ["how-it-works", "multi-ai", "pricing"];
    const onScroll = () => {
      const line = 120; // header (56px) + un margen para marcar al entrar
      let current = "";
      for (const id of anchorIds) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      setActiveAnchor(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [isHome]);

  // Desde subpáginas los anchors navegan a /[lang]/#seccion (un bare #seccion
  // no existe fuera de la home); desde la home es scroll in-page.
  const anchorHref = (anchor: string) => (isHome ? `#${anchor}` : `/${lang}/#${anchor}`);

  const isItemActive = (it: NavItem): boolean => {
    if (it.kind === "anchor") return isHome && activeAnchor === it.anchor;
    return pathname === it.href || (!!pathname && pathname.startsWith(`${it.href}/`));
  };

  // ── Capsule (desktop) ────────────────────────────────────────────────
  const capsuleLinkClass = (active: boolean) =>
    `whitespace-nowrap rounded-full px-4 py-2 text-[13.5px] leading-none transition-colors ${
      active
        ? "bg-[var(--color-accent)] text-[#04130d] font-[680]"
        : "text-[var(--color-fg-muted)] hover:text-[var(--color-fg-strong)] font-[550]"
    }`;

  const renderCapsuleItem = (it: NavItem) => {
    const active = isItemActive(it);
    if (it.kind === "anchor") {
      return (
        <a key={it.anchor} href={anchorHref(it.anchor)} className={capsuleLinkClass(active)}>
          {it.label}
        </a>
      );
    }
    return (
      <Link key={it.href} href={it.href} className={capsuleLinkClass(active)}>
        {it.label}
      </Link>
    );
  };

  // ── Mobile menu items ────────────────────────────────────────────────
  const renderMobileItem = (it: NavItem) => {
    const cls = "hover:text-[var(--color-fg-strong)] transition-colors";
    if (it.kind === "anchor") {
      return (
        <a key={it.anchor} href={anchorHref(it.anchor)} onClick={() => setOpen(false)} className={cls}>
          {it.label}
        </a>
      );
    }
    return (
      <Link key={it.href} href={it.href} onClick={() => setOpen(false)} className={cls}>
        {it.label}
      </Link>
    );
  };

  const cta = (
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
  const mobileCta = (
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

        {/* Nav desktop — cápsula centrada (solo ≥981px) */}
        <nav className="hidden min-[981px]:flex flex-1 items-center justify-center">
          <div
            className="flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-panel)] p-[5px]"
            style={{ boxShadow: "0 8px 24px rgba(0,0,0,.07)" }}
          >
            {items.map(renderCapsuleItem)}
          </div>
        </nav>

        <div className="flex items-center gap-2 ml-auto">
          <div className="hidden sm:flex">
            <ThemeToggle labels={dict.theme} />
          </div>
          <LanguageSwitcher current={lang} />
          <div className="hidden sm:flex">{cta}</div>

          {/* Botón hamburguesa — móvil/tablet (≤980px) */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            className="min-[981px]:hidden inline-flex items-center justify-center h-9 w-9 rounded-lg text-[var(--color-fg)] hover:bg-[var(--color-panel)] transition-colors"
          >
            {open ? <X size={20} strokeWidth={2} /> : <Menu size={20} strokeWidth={2} />}
          </button>
        </div>
      </div>

      {/* Panel móvil desplegable */}
      {open ? (
        <nav className="min-[981px]:hidden border-t border-[var(--color-border)] bg-[var(--color-bg)]/95 backdrop-blur-md">
          <div className="mx-auto max-w-6xl px-5 py-3 flex flex-col gap-1 text-[15px] text-[var(--color-fg)]">
            {items.map((it) => (
              <span key={it.kind === "anchor" ? it.anchor : it.href} className="py-2">
                {renderMobileItem(it)}
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
