import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { getDict, isLocale } from "@/content";
import { Hero } from "@/components/landing/Hero";
import { MemoryPersistent } from "@/components/landing/MemoryPersistent";
import { MultiAI } from "@/components/landing/MultiAI";
import { ChromeExtensionTeaser } from "@/components/landing/ChromeExtensionTeaser";
import { DemosGrid } from "@/components/landing/DemosGrid";
import { IntegrationsDiscovery } from "@/components/landing/IntegrationsDiscovery";
import { Comparison } from "@/components/landing/Comparison";
import { SavingsCalculator } from "@/components/landing/SavingsCalculator";
import { WhatYouCanBuild } from "@/components/landing/WhatYouCanBuild";
import { Continuity } from "@/components/landing/Continuity";
import { UseCases } from "@/components/landing/UseCases";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { BeforeAfter } from "@/components/landing/BeforeAfter";
import { MidCta } from "@/components/landing/MidCta";
import { Testimonials } from "@/components/landing/Testimonials";
import { Pricing } from "@/components/landing/Pricing";
import { Trust } from "@/components/landing/Trust";
import { Footer } from "@/components/landing/Footer";
import { AgentWidget } from "@/components/AgentWidget";
import { CookieBanner } from "@/components/CookieBanner";
import { StickyDownloadCTA } from "@/components/StickyDownloadCTA";
import { StructuredData } from "@/components/StructuredData";

// Below-the-fold sections — split as their own JS chunks so the initial
// route bundle is smaller. FAQ is a "use client" accordion (chunk size
// matters more); Affiliates is a server component that pulls a few
// extra icons. Both render server-side as usual; only the JS hydration
// for FAQ is deferred until that chunk arrives.
const FAQ = dynamic(() =>
  import("@/components/landing/FAQ").then((m) => ({ default: m.FAQ })),
);
const Affiliates = dynamic(() =>
  import("@/components/landing/Affiliates").then((m) => ({
    default: m.Affiliates,
  })),
);

interface Props {
  params: Promise<{ lang: string }>;
}

export default async function Landing({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const d = getDict(lang);

  // El header `x-vercel-ip-country` y la conversión USD→moneda local
  // (≈ $X COP) se removieron 2026-05-29 — las tasas hardcoded se
  // desfasaban y daban falsa sensación de precisión. Stripe igual cobra
  // en USD y el banco del cliente hace la conversión real.

  return (
    <>
      <StructuredData dict={d} lang={lang} />
      {/* Orden del handoff (compactado y aprobado): Hero → Demos → Cómo
          funciona → Lo que puedes resolver → Casos → Tu equipo + relay →
          Calculadora → El cambio real → Comparativo → Chrome → Precios →
          Seguridad → FAQ → Afiliados → CTA final → Footer. */}
      <Hero dict={d} />
      <DemosGrid lang={lang} />
      <IntegrationsDiscovery lang={lang} />
      <HowItWorks lang={lang} />
      <WhatYouCanBuild lang={lang} />
      <UseCases lang={lang} />
      <MultiAI dict={d} />
      <Continuity lang={lang} />
      <MemoryPersistent dict={d} />
      <SavingsCalculator dict={d} />
      <BeforeAfter dict={d} />
      <Comparison dict={d} />
      <ChromeExtensionTeaser dict={d} />
      <Testimonials lang={lang} />
      <Pricing dict={d} />
      <Trust dict={d} />
      <FAQ dict={d} />
      <Affiliates dict={d} />
      <MidCta dict={d} />
      <Footer dict={d} />
      <AgentWidget dict={d} />
      <StickyDownloadCTA dict={d} />
      <CookieBanner dict={d} />
    </>
  );
}
