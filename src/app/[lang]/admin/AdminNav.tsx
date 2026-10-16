"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export interface AdminSection {
  slug: string;
  label: string;
}

type AdminNavItem =
  | { kind: "link"; slug: string; label: string }
  | { kind: "group"; label: string; items: AdminSection[] };

/** The one place the admin nav is listed — a flat link per section, or a
 *  "group" that collapses a few related sections under one dropdown so the
 *  nav doesn't grow one pill per lead source. */
export function adminNavItems(isEs: boolean): AdminNavItem[] {
  return [
    { kind: "link", slug: "launch-metrics", label: isEs ? "Métricas" : "Metrics" },
    { kind: "link", slug: "trends", label: "Trends" },
    { kind: "link", slug: "marketplace", label: "Marketplace" },
    { kind: "link", slug: "comp", label: "Comp" },
    { kind: "link", slug: "mercadopago", label: "Mercado Pago" },
    {
      kind: "group",
      label: "Leads",
      items: [
        { slug: "ops", label: "Ops" },
        { slug: "business-leads", label: isEs ? "Leads B2B" : "B2B Leads" },
        { slug: "leads-linkedin", label: isEs ? "Leads LinkedIn" : "LinkedIn Leads" },
      ],
    },
    {
      kind: "group",
      label: isEs ? "Integraciones" : "Integrations",
      items: [
        { slug: "integraciones", label: isEs ? "Supervisión y loops" : "Supervision & loops" },
        { slug: "integraciones/por-pais", label: isEs ? "Por país" : "By country" },
      ],
    },
    { kind: "link", slug: "ai-center", label: isEs ? "Centro de IAs" : "AI Center" },
    { kind: "link", slug: "soporte", label: isEs ? "Soporte" : "Support" },
  ];
}

const pillCls = (active: boolean) =>
  `px-3 py-1.5 rounded-full text-[13px] whitespace-nowrap transition-colors ${
    active
      ? "bg-[var(--color-accent)]/15 text-[var(--color-accent)] font-medium"
      : "text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:bg-[var(--color-panel)]"
  }`;

export function AdminNav({ lang }: { lang: string }) {
  const isEs = lang === "es";
  const pathname = usePathname() || "";
  const items = adminNavItems(isEs);
  const atHome = /\/admin\/?$/.test(pathname);
  // The most specific nav slug wins, so /admin/integraciones/por-pais lights
  // "Por país" and not also its prefix "integraciones".
  const allSlugs = items.flatMap((i) => (i.kind === "link" ? [i.slug] : i.items.map((s) => s.slug)));
  const isActive = (slug: string) =>
    pathname.includes(`/admin/${slug}`) &&
    !allSlugs.some((o) => o.length > slug.length && pathname.includes(`/admin/${o}`));

  return (
    <nav className="sticky top-0 z-20 border-b border-[var(--color-border)] bg-[var(--color-bg)]/85 backdrop-blur">
      <div className="mx-auto max-w-6xl px-5 md:px-6 py-2.5 flex items-center gap-2 overflow-x-auto">
        <Link
          href={`/${lang}/admin`}
          className={`mr-1 font-semibold text-[14px] tracking-tight ${
            atHome ? "text-[var(--color-fg-strong)]" : "text-[var(--color-fg)] hover:text-[var(--color-fg-strong)]"
          }`}
        >
          Admin
        </Link>
        <span className="text-[var(--color-border)]">/</span>
        {items.map((item) =>
          item.kind === "link" ? (
            <Link key={item.slug} href={`/${lang}/admin/${item.slug}`} className={pillCls(isActive(item.slug))}>
              {item.label}
            </Link>
          ) : (
            <NavGroup key={item.label} lang={lang} label={item.label} items={item.items} isActive={isActive} />
          ),
        )}
      </div>
    </nav>
  );
}

/** Dropdown for a group of related sections (e.g. "Leads" → Ops, Leads B2B,
 *  Leads LinkedIn). Opens on click for both pointer and touch, and stays
 *  open while the pointer travels to the portaled menu. Closes on outside
 *  click, Escape, route change, or selection. The trigger pill lights up when any of its sub-routes is active,
 *  same as a regular nav link.
 *
 *  The menu is rendered in a portal to document.body instead of as a normal
 *  absolutely-positioned child: the nav row scrolls horizontally
 *  (overflow-x-auto), and per the CSS overflow spec a non-"visible"
 *  overflow-x forces overflow-y to compute to "auto" too — so a dropdown
 *  positioned relative to the row would get clipped by that same vertical
 *  overflow instead of floating above the page. Portal + fixed positioning
 *  from the trigger's own getBoundingClientRect sidesteps the clipping. */
function NavGroup({
  lang,
  label,
  items,
  isActive,
}: {
  lang: string;
  label: string;
  items: AdminSection[];
  isActive: (slug: string) => boolean;
}) {
  const pathname = usePathname() || "";
  // The menu lives in a portal, not inside the trigger. Mouseleave on the
  // trigger therefore fires before the pointer can reach a menu item.
  // Click owns the open state; crossing that gap must never dismiss it.
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const groupActive = items.some((s) => isActive(s.slug));

  useEffect(() => setMounted(true), []);

  const closeAll = () => {
    setOpen(false);
  };

  useEffect(() => {
    closeAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const updatePosition = () => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      // Clamp so scrolling the horizontal nav row near either edge (or a
      // narrow mobile viewport) can't push the menu partly off-screen —
      // matches the min-w the menu itself renders at.
      const MENU_WIDTH = 160;
      const EDGE_GAP = 8;
      const left = Math.min(
        Math.max(rect.left, EDGE_GAP),
        window.innerWidth - MENU_WIDTH - EDGE_GAP,
      );
      setPos({ top: rect.bottom + 4, left });
    };
    updatePosition();
    // Keep the fixed portal anchored when the page or nav row scrolls;
    // trackpad movement must not dismiss a menu the user just opened.
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      closeAll();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAll();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <div ref={triggerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`inline-flex items-center gap-1 ${pillCls(groupActive)}`}
      >
        {label}
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
          className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08Z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {open && mounted &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{ position: "fixed", top: pos.top, left: pos.left }}
            className="z-30 min-w-[10rem] overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] py-1 shadow-lg"
          >
            {items.map((s) => (
              <Link
                key={s.slug}
                href={`/${lang}/admin/${s.slug}`}
                role="menuitem"
                onClick={closeAll}
                className={`block px-3 py-1.5 text-[13px] whitespace-nowrap transition-colors ${
                  isActive(s.slug)
                    ? "bg-[var(--color-accent)]/15 text-[var(--color-accent)] font-medium"
                    : "text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:bg-[var(--color-panel)]"
                }`}
              >
                {s.label}
              </Link>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}
