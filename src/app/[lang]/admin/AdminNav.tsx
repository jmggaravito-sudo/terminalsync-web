"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface AdminSection {
  slug: string;
  label: string;
}

/** The one place the admin sections are listed. Add a section here → it shows
 *  up in the top nav AND on the /admin landing, so pages stop being islands. */
export function adminSections(isEs: boolean): AdminSection[] {
  return [
    { slug: "launch-metrics", label: isEs ? "Métricas" : "Metrics" },
    { slug: "trends", label: "Trends" },
    { slug: "discovery", label: "Discovery" },
    { slug: "marketplace", label: "Marketplace" },
    { slug: "comp", label: "Comp" },
    { slug: "mercadopago", label: "Mercado Pago" },
    { slug: "ops", label: "Ops" },
  ];
}

export function AdminNav({ lang }: { lang: string }) {
  const isEs = lang === "es";
  const pathname = usePathname() || "";
  const sections = adminSections(isEs);
  const atHome = /\/admin\/?$/.test(pathname);

  const linkCls = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-[13px] whitespace-nowrap transition-colors ${
      active
        ? "bg-[var(--color-accent)]/15 text-[var(--color-accent)] font-medium"
        : "text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:bg-[var(--color-panel)]"
    }`;

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
        {sections.map((s) => (
          <Link
            key={s.slug}
            href={`/${lang}/admin/${s.slug}`}
            className={linkCls(pathname.includes(`/admin/${s.slug}`))}
          >
            {s.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
