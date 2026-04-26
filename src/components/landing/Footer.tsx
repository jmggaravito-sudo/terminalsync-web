import Link from "next/link";
import type { Dict } from "@/content";
import { Logo } from "@/components/Logo";

export function Footer({ dict }: { dict: Dict }) {
  const year = new Date().getFullYear();
  const lang = dict.locale;

  const cols: {
    heading: string;
    links: { key: string; label: string; href: string }[];
  }[] = [
    {
      heading: dict.footer.product,
      links: [
        { key: "features", label: dict.footer.links.features, href: `/${lang}#features` },
        { key: "demos", label: dict.footer.links.demos, href: `/${lang}#demos` },
        { key: "pricing", label: dict.footer.links.pricing, href: `/${lang}#pricing` },
        { key: "download", label: dict.footer.links.download, href: `/${lang}#hero` },
        { key: "marketplace", label: dict.footer.links.marketplace, href: `/${lang}/marketplace` },
        { key: "connectors", label: dict.footer.links.connectors, href: `/${lang}/connectors` },
        { key: "skills", label: dict.footer.links.skills, href: `/${lang}/skills` },
      ],
    },
    {
      heading: dict.footer.company,
      links: [
        { key: "about", label: dict.footer.links.about, href: "#" },
        { key: "blog", label: dict.footer.links.blog, href: "#" },
        { key: "contact", label: dict.footer.links.contact, href: "mailto:hola@terminalsync.ai" },
        { key: "affiliates", label: dict.footer.links.affiliates, href: `/${lang}#affiliates` },
        { key: "publishers", label: dict.footer.links.publishers, href: `/${lang}/publishers` },
      ],
    },
    {
      heading: dict.footer.legal,
      links: [
        {
          key: "affiliateTerms",
          label: dict.footer.links.affiliateTerms,
          href: `/${lang}/legal/affiliates`,
        },
        { key: "privacy", label: dict.footer.links.privacy, href: "#" },
        { key: "terms", label: dict.footer.links.terms, href: "#" },
        { key: "security", label: dict.footer.links.security, href: "#" },
      ],
    },
  ];

  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-panel-2)]/40 mt-4">
      <div className="mx-auto max-w-6xl px-5 md:px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2">
            <Logo size={28} />
            <span className="text-[15px] font-semibold tracking-tight text-[var(--color-fg-strong)]">
              TerminalSync
            </span>
          </div>
          <p className="mt-3 text-[12.5px] text-[var(--color-fg-muted)] max-w-[14rem] leading-relaxed">
            {dict.footer.tagline}
          </p>
        </div>
        {cols.map((col) => (
          <div key={col.heading}>
            <h4 className="text-[11px] uppercase tracking-[0.14em] text-[var(--color-fg-dim)] font-semibold">
              {col.heading}
            </h4>
            <ul className="mt-3 space-y-2">
              {col.links.map((l) => (
                <li key={l.key}>
                  <Link
                    className="text-[13px] text-[var(--color-fg-muted)] hover:text-[var(--color-fg-strong)] transition-colors"
                    href={l.href}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-[var(--color-border)] py-5 text-center text-[11.5px] text-[var(--color-fg-dim)]">
        {dict.footer.copyright.replace("{{year}}", String(year))}
      </div>
    </footer>
  );
}
