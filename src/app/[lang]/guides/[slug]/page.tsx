import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, HelpCircle, Sparkles } from "lucide-react";
import { getDict, isLocale, type Locale } from "@/content";
import { Footer } from "@/components/landing/Footer";
import { GEO_PAGE_SLUGS, getGeoPage, type GeoPageSlug } from "@/lib/geoPages";

const BASE = "https://terminalsync.ai";

interface Props { params: Promise<{ lang: string; slug: string }> }

export async function generateStaticParams() {
  return ["es", "en"].flatMap((lang) => GEO_PAGE_SLUGS.map((slug) => ({ lang, slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang) || !GEO_PAGE_SLUGS.includes(slug as GeoPageSlug)) return {};
  const page = getGeoPage(slug as GeoPageSlug, lang as Locale);
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `${BASE}/${lang}/guides/${slug}`, languages: { es: `${BASE}/es/guides/${slug}`, en: `${BASE}/en/guides/${slug}` } },
    openGraph: { title: page.title, description: page.description },
  };
}

export default async function GeoGuidePage({ params }: Props) {
  const { lang, slug } = await params;
  if (!isLocale(lang) || !GEO_PAGE_SLUGS.includes(slug as GeoPageSlug)) notFound();
  const d = getDict(lang);
  const page = getGeoPage(slug as GeoPageSlug, lang as Locale);
  const isEs = lang === "es";
  const faqJson = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: page.faqs.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })) };
  const articleJson = { "@context": "https://schema.org", "@type": "Article", headline: page.h1, description: page.description, author: { "@type": "Organization", name: "TerminalSync" }, mainEntityOfPage: `${BASE}/${lang}/guides/${slug}` };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJson) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJson) }} />
      <section className="mx-auto max-w-4xl px-5 md:px-6 pt-16 md:pt-24 pb-10">
        <Link href={`/${lang}/ai-terminal`} className="inline-flex items-center gap-2 rounded-full border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--color-accent)]"><Sparkles size={13} /> {page.eyebrow}</Link>
        <h1 className="mt-5 text-[clamp(2.1rem,6vw,4.25rem)] font-semibold leading-[1] tracking-tight text-[var(--color-fg-strong)]">{page.h1}</h1>
        <p className="mt-5 max-w-3xl text-[18px] leading-relaxed text-[var(--color-fg-muted)]">{page.intro}</p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <a href="/api/download" className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[var(--color-accent)]/20">{page.cta} <ArrowRight size={16} /></a>
          <Link href={`/${lang}/marketplace`} className="inline-flex items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-panel)] px-5 py-3 text-sm font-semibold text-[var(--color-fg)]">{isEs ? "Ver power-ups" : "View power-ups"}</Link>
        </div>
      </section>
      <section className="mx-auto max-w-4xl px-5 md:px-6 pb-10"><div className="grid gap-3 md:grid-cols-2">{page.bullets.map((bullet) => <div key={bullet} className="flex items-start gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4 text-sm text-[var(--color-fg)]"><CheckCircle2 className="mt-0.5 shrink-0 text-[var(--color-ok)]" size={17} /><span>{bullet}</span></div>)}</div></section>
      <section className="mx-auto max-w-4xl px-5 md:px-6 pb-10"><div className="space-y-4">{page.sections.map((section) => <article key={section.title} className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-panel)] p-6 md:p-7"><h2 className="text-xl font-semibold text-[var(--color-fg-strong)]">{section.title}</h2><p className="mt-3 text-[15px] leading-relaxed text-[var(--color-fg-muted)]">{section.body}</p></article>)}</div></section>
      <section className="mx-auto max-w-4xl px-5 md:px-6 pb-16"><h2 className="flex items-center gap-2 text-2xl font-semibold text-[var(--color-fg-strong)]"><HelpCircle className="text-[var(--color-accent)]" size={22} /> FAQ</h2><div className="mt-5 space-y-4">{page.faqs.map((item) => <div key={item.q} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5"><h3 className="font-semibold text-[var(--color-fg-strong)]">{item.q}</h3><p className="mt-2 text-sm leading-relaxed text-[var(--color-fg-muted)]">{item.a}</p></div>)}</div></section>
      <Footer dict={d} />
    </div>
  );
}
