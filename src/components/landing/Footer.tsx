import type { Dict } from "@/content";

export function Footer({ dict }: { dict: Dict }) {
  const year = new Date().getFullYear();

  const cols: {
    heading: string;
    links: { key: string; label: string }[];
  }[] = [
    {
      heading: dict.footer.product,
      links: [
        { key: "features", label: dict.footer.links.features },
        { key: "demos", label: dict.footer.links.demos },
        { key: "pricing", label: dict.footer.links.pricing },
        { key: "download", label: dict.footer.links.download },
      ],
    },
    {
      heading: dict.footer.company,
      links: [
        { key: "about", label: dict.footer.links.about },
        { key: "blog", label: dict.footer.links.blog },
        { key: "contact", label: dict.footer.links.contact },
        { key: "affiliates", label: dict.footer.links.affiliates },
      ],
    },
    {
      heading: dict.footer.legal,
      links: [
        { key: "privacy", label: dict.footer.links.privacy },
        { key: "terms", label: dict.footer.links.terms },
        { key: "security", label: dict.footer.links.security },
      ],
    },
  ];

  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-panel-2)]/40 mt-4">
      <div className="mx-auto max-w-6xl px-5 md:px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-info)] flex items-center justify-center">
              <div className="h-1.5 w-1.5 rounded-full bg-white" />
            </div>
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
                  <a
                    className="text-[13px] text-[var(--color-fg-muted)] hover:text-[var(--color-fg-strong)] transition-colors"
                    href="#"
                  >
                    {l.label}
                  </a>
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
