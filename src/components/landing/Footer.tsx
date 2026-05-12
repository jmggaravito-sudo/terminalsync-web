import Link from "next/link";
import { Github, Instagram, Facebook } from "lucide-react";
import type { Dict } from "@/content";
import { Logo } from "@/components/Logo";

// Social handles confirmed live by JM. Add new ones here as accounts
// come online — same handles also live in StructuredData.tsx's
// `sameAs` array (keep in sync for SEO / Knowledge Graph).
const SOCIALS: Array<{
  key: string;
  href: string;
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  label: string;
}> = [
  {
    key: "instagram",
    href: "https://www.instagram.com/terminalsync_ai",
    Icon: Instagram,
    label: "Instagram",
  },
  {
    key: "facebook",
    href: "https://www.facebook.com/Terminalsyncai",
    Icon: Facebook,
    label: "Facebook",
  },
  {
    key: "github",
    href: "https://github.com/jmggaravito-sudo/terminalsync-web",
    Icon: Github,
    label: "GitHub",
  },
];

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
        { key: "download", label: dict.footer.links.download, href: "/api/download" },
        {
          key: "ai-terminal",
          label: lang === "es" ? "Terminal IA" : "AI terminal",
          href: `/${lang}/ai-terminal`,
        },
        { key: "marketplace", label: dict.footer.links.marketplace, href: `/${lang}/marketplace` },
        { key: "connectors", label: dict.footer.links.connectors, href: `/${lang}/connectors` },
        { key: "skills", label: dict.footer.links.skills, href: `/${lang}/skills` },
        {
          key: "guides",
          label: lang === "es" ? "Guías IA" : "AI guides",
          href: `/${lang}/guides/best-ai-terminal-for-mac`,
        },
      ],
    },
    {
      heading: dict.footer.company,
      links: [
        { key: "about", label: dict.footer.links.about, href: `/${lang}/about` },
        { key: "blog", label: dict.footer.links.blog, href: `/${lang}/blog` },
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
        { key: "privacy", label: dict.footer.links.privacy, href: `/${lang}/legal/privacy` },
        { key: "terms", label: dict.footer.links.terms, href: `/${lang}/legal/terms` },
        { key: "security", label: dict.footer.links.security, href: `/${lang}/legal/security` },
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
          {/* Social row — same handles emit as `sameAs` in JSON-LD. */}
          <div className="mt-5 flex items-center gap-3">
            {SOCIALS.map(({ key, href, Icon, label }) => (
              <a
                key={key}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="inline-flex items-center justify-center h-8 w-8 rounded-md text-[var(--color-fg-muted)] hover:text-[var(--color-fg-strong)] hover:bg-[var(--color-panel)] transition-colors"
              >
                <Icon size={16} strokeWidth={1.8} />
              </a>
            ))}
          </div>
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
