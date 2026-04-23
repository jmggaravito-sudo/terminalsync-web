import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ScrollText } from "lucide-react";
import { getDict, isLocale } from "@/content";

interface Props {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const d = getDict(lang);
  return {
    title: d.legal.affiliates.pageTitle,
    description: d.legal.affiliates.subtitle,
    alternates: {
      canonical: `https://terminalsync.ai/${lang}/legal/affiliates`,
      languages: {
        es: "https://terminalsync.ai/es/legal/affiliates",
        en: "https://terminalsync.ai/en/legal/affiliates",
      },
    },
  };
}

export async function generateStaticParams() {
  return [{ lang: "es" }, { lang: "en" }];
}

export default async function AffiliatesLegal({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const d = getDict(lang);
  const a = d.legal.affiliates;

  const sections = [
    { key: "commissions" as const, data: a.sections.commissions },
    { key: "attribution" as const, data: a.sections.attribution },
    { key: "material" as const, data: a.sections.material },
    { key: "responsibilities" as const, data: a.sections.responsibilities },
    { key: "changes" as const, data: a.sections.changes },
  ];

  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      {/* Slim header */}
      <header className="sticky top-0 z-20 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-md">
        <div className="mx-auto max-w-3xl px-5 md:px-6 h-12 flex items-center justify-between">
          <Link
            href={`/${lang}`}
            className="flex items-center gap-2 text-[13px] font-semibold text-[var(--color-fg-strong)]"
          >
            <div className="h-6 w-6 rounded-md bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-info)] flex items-center justify-center">
              <div className="h-1.5 w-1.5 rounded-full bg-white" />
            </div>
            TerminalSync
          </Link>
          <Link
            href={`/${lang}#affiliates`}
            className="inline-flex items-center gap-1.5 text-[12px] text-[var(--color-fg-muted)] hover:text-[var(--color-fg-strong)] transition-colors"
          >
            <ArrowLeft size={12} />
            {a.back}
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-5 md:px-6 py-12 md:py-16">
        <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--color-accent)] font-semibold">
          <ScrollText size={12} strokeWidth={2.2} />
          Legal
        </div>
        <h1
          className="mt-3 font-semibold tracking-tight text-[var(--color-fg-strong)] leading-[1.08]"
          style={{ fontSize: "clamp(1.875rem, 4.2vw, 2.75rem)" }}
        >
          {a.title}
        </h1>
        <p className="mt-3 text-[14px] md:text-[15px] text-[var(--color-fg-muted)] leading-relaxed">
          {a.subtitle}
        </p>
        <p className="mt-2 text-[11.5px] font-mono text-[var(--color-fg-dim)]">
          {a.updated}
        </p>

        <p className="mt-10 text-[14.5px] text-[var(--color-fg)] leading-relaxed">
          {a.intro}
        </p>

        <div className="mt-12 space-y-14">
          {sections.map(({ key, data }) => (
            <section key={key}>
              <h2 className="text-[20px] md:text-[22px] font-semibold tracking-tight text-[var(--color-fg-strong)]">
                {data.heading}
              </h2>
              <dl className="mt-5 space-y-4">
                {Object.entries(data.items).map(([k, item]) => {
                  const entry = item as { label: string; body: string };
                  return (
                    <div
                      key={k}
                      className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] px-5 py-4 lift"
                    >
                      <dt className="text-[13px] font-semibold text-[var(--color-fg-strong)]">
                        {entry.label}
                      </dt>
                      <dd className="mt-1.5 text-[13.5px] text-[var(--color-fg-muted)] leading-relaxed">
                        {entry.body}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </section>
          ))}
        </div>

        <div className="mt-16 rounded-2xl border border-[var(--color-accent)]/25 bg-[var(--color-accent)]/5 p-6 md:p-7">
          <p className="text-[13.5px] text-[var(--color-fg)] leading-relaxed">
            {a.acceptance}
          </p>
          <p className="mt-3 text-[12px] text-[var(--color-fg-muted)]">
            partners@terminalsync.ai
          </p>
        </div>

        <nav className="mt-12 flex items-center justify-between text-[12.5px]">
          <Link
            href={`/${lang}#affiliates`}
            className="inline-flex items-center gap-1.5 text-[var(--color-accent)] hover:underline"
          >
            <ArrowLeft size={12} />
            {a.back}
          </Link>
          <Link
            href={`/${lang === "es" ? "en" : "es"}/legal/affiliates`}
            className="text-[var(--color-fg-muted)] hover:text-[var(--color-fg-strong)] transition-colors"
          >
            {lang === "es" ? "English" : "Español"}
          </Link>
        </nav>
      </article>
    </main>
  );
}
