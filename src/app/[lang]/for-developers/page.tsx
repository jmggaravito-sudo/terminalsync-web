import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { ArrowRight, BookOpen, Download } from "lucide-react";
import { getDict, isLocale } from "@/content";
import { currencyForCountry } from "@/lib/geoCurrency";
import { Pricing } from "@/components/landing/Pricing";
import { Footer } from "@/components/landing/Footer";
import { DevHero } from "@/components/dev-landing/DevHero";
import { DevFeatures } from "@/components/dev-landing/DevFeatures";
import { DevAffiliates } from "@/components/dev-landing/DevAffiliates";
import { DevFAQ } from "@/components/dev-landing/DevFAQ";
import { getDevCopy } from "@/components/dev-landing/copy";

export const revalidate = 3600;

interface Props {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const copy = getDevCopy(lang);
  return {
    title: copy.meta.title,
    description: copy.meta.description,
    openGraph: {
      title: copy.meta.title,
      description: copy.meta.description,
      type: "website",
    },
  };
}

/**
 * /[lang]/for-developers — landing dedicated to the dev audience.
 *
 * Reuses the consumer Pricing + Footer so plan changes ripple
 * automatically. Everything else is dev-specific copy/components
 * because the voice and proof points differ enough that mixing
 * them into the main dict would force every translation pass to
 * juggle two audiences.
 *
 * The /api/download CTA still points at the desktop installer —
 * the dev landing is positioning, not a separate product. The
 * differentiator is the Dev plan ($39/mo) which gets natural
 * spotlight via the Pricing card flow.
 */
export default async function DevLanding({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDict(lang);
  const copy = getDevCopy(lang);

  const h = await headers();
  const country = h.get("x-vercel-ip-country");
  const currencyHint = currencyForCountry(country);

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)]">
      <DevHero copy={copy} />
      <DevFeatures copy={copy} />
      <DevAffiliates copy={copy} />

      {/* Pricing reused — Dev plan is the natural conversion target on
          this page. Anchored at #pricing so #pricing links from the
          consumer landing still resolve when crossed over. */}
      <div id="pricing">
        <Pricing dict={dict} currencyHint={currencyHint} />
      </div>

      <DevFAQ copy={copy} />

      {/* Final CTA — short, dev-flavored, no chrome. */}
      <section className="mx-auto max-w-3xl px-5 md:px-6 pb-20">
        <div className="rounded-3xl border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 p-8 md:p-10 text-center">
          <h2 className="text-[22px] md:text-[26px] font-semibold tracking-tight text-[var(--color-fg-strong)]">
            {copy.cta.title}
          </h2>
          <p className="mt-3 text-[14px] text-[var(--color-fg-muted)] max-w-xl mx-auto leading-relaxed">
            {copy.cta.body}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href="/api/download"
              data-cta="dev-final"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] text-white text-[13.5px] font-semibold px-6 py-3 shadow-[0_8px_24px_-10px_var(--color-accent-glow)] transition-all"
            >
              <Download size={14} strokeWidth={2.4} />
              {copy.cta.primary}
            </a>
            <a
              href="https://github.com/jmggaravito-sudo/terminalsync#readme"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-panel)] border border-[var(--color-border)] text-[var(--color-fg)] text-[13.5px] font-semibold px-6 py-3 lift"
            >
              <BookOpen size={14} strokeWidth={2.2} />
              {copy.cta.secondary}
              <ArrowRight size={12} strokeWidth={2.4} />
            </a>
          </div>
        </div>
      </section>

      <Footer dict={dict} />
    </main>
  );
}
