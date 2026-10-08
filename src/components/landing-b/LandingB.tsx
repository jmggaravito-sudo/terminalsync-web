import type { Dict, Locale } from "@/content";
import type { PublicFaqItem } from "@/content/faq";
import dynamic from "next/dynamic";
import { AnnounceBar } from "./AnnounceBar";
import { HeaderB } from "./HeaderB";
import { HeroB } from "./HeroB";
import { SubNav } from "./SubNav";
import { DemosB } from "./DemosB";
import { FinalCta } from "./FinalCta";
import { IntegrationsMarquee } from "@/components/landing/IntegrationsMarquee";
import { MetaBusiness } from "@/components/landing/MetaBusiness";
import { RealFolders } from "@/components/landing/RealFolders";
import { MemoryPersistent } from "@/components/landing/MemoryPersistent";
import { Pricing } from "@/components/landing/Pricing";
import { WindowsEarlyAccess } from "@/components/landing/WindowsEarlyAccess";
import { StructuredData } from "@/components/StructuredData";
import { AgentWidget } from "@/components/AgentWidget";
import { StickyDownloadCTA } from "@/components/StickyDownloadCTA";
import { CookieBanner } from "@/components/CookieBanner";

// Below-the-fold — split as own JS chunks.
const FAQ = dynamic(() =>
  import("@/components/landing/FAQ").then((m) => ({ default: m.FAQ })),
);

interface Props {
  dict: Dict;
  lang: Locale;
  faq: readonly PublicFaqItem[];
}

export function LandingB({ dict, lang, faq }: Props) {
  return (
    <>
      <StructuredData dict={dict} lang={lang} />
      <AnnounceBar dict={dict} />
      <HeaderB dict={dict} lang={lang} />
      <SubNav dict={dict} />
      <HeroB dict={dict} />
      {/* Windows wait-list — hidden for Mac users; the anchor is used by /api/download */}
      <div id="windows">
        <WindowsEarlyAccess dict={dict} />
      </div>
      <DemosB dict={dict} />

      <section
        id="integrations"
        className="scroll-mt-28 py-16 md:py-20"
      >
        {dict.landingB?.integrations && (
          <div className="mx-auto max-w-6xl px-5 md:px-6 text-center mb-10">
            <span className="inline-flex items-center text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--color-fg-muted)] border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-1 rounded-full">
              {dict.landingB.integrations.eyebrow}
            </span>
            <h2
              className="mt-4 font-semibold tracking-tight text-[var(--color-fg-strong)] leading-[1.08] whitespace-pre-line"
              style={{ fontSize: "clamp(1.625rem, 4vw, 2.5rem)" }}
            >
              {dict.landingB.integrations.title}
            </h2>
            <p className="mt-3 text-[14.5px] text-[var(--color-fg-muted)] leading-relaxed">
              {dict.landingB.integrations.subtitle}
            </p>
          </div>
        )}
        <IntegrationsMarquee lang={lang} />
      </section>

      <section id="meta" className="scroll-mt-28">
        <MetaBusiness lang={lang} />
      </section>

      <section id="files" className="scroll-mt-28">
        <RealFolders lang={lang} />
        <MemoryPersistent dict={dict} />
      </section>

      <section id="pricing" className="scroll-mt-28">
        <Pricing dict={dict} />
      </section>

      <FAQ
        copy={{
          eyebrow: dict.faq.eyebrow,
          title: dict.faq.title,
          subtitle: dict.faq.subtitle,
          more: dict.faq.more,
          less: dict.faq.less,
        }}
        items={faq}
        initial={10}
      />

      <FinalCta dict={dict} />

      <AgentWidget dict={dict} />
      <StickyDownloadCTA dict={dict} />
      <CookieBanner dict={dict} />
    </>
  );
}
