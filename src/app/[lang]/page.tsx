import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { getDict, isLocale } from "@/content";
import { Hero } from "@/components/landing/Hero";
import { MemoryPersistent } from "@/components/landing/MemoryPersistent";
import { MultiAI } from "@/components/landing/MultiAI";
import { ChromeExtensionTeaser } from "@/components/landing/ChromeExtensionTeaser";
import { Demos } from "@/components/landing/Demos";
import { Benefits } from "@/components/landing/Benefits";
import { ToolBreakdown } from "@/components/landing/ToolBreakdown";
import { Comparison } from "@/components/landing/Comparison";
import { SavingsCalculator } from "@/components/landing/SavingsCalculator";
import { CapacityCalculator } from "@/components/landing/CapacityCalculator";
import { WhatYouCanBuild } from "@/components/landing/WhatYouCanBuild";
import { BeforeAfter } from "@/components/landing/BeforeAfter";
import { MidCta } from "@/components/landing/MidCta";
import { Personas } from "@/components/landing/Personas";
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
      <Hero dict={d} />
      {/* §04 "Lo que puedes resolver" — bloque ★crítico del rediseño, en la
          zona UNDERSTAND. ES estrena; reordenamiento completo del wireframe
          viene después. */}
      {lang === "es" ? <WhatYouCanBuild /> : null}
      {/* Order JM 2026-05-07:
          Hero → Demos → Comparison → SavingsCalculator → moat
          deep-dives. The calculator follows the comparison so the
          visitor sees "no one else does this" then immediately
          "this is what you'd save". */}
      <Demos dict={d} />
      <Comparison dict={d} />
      {/* §10 Capacity Calculator — rediseño 2026-06. ES estrena el bloque
          nuevo (capacidad/horas/plata); EN sigue con el de costos hasta la
          paridad i18n. */}
      {lang === "es" ? <CapacityCalculator /> : <SavingsCalculator dict={d} />}
      <MultiAI dict={d} />
      <ChromeExtensionTeaser dict={d} />
      <MemoryPersistent dict={d} />
      <Benefits dict={d} />
      <ToolBreakdown dict={d} />
      <BeforeAfter dict={d} />
      <MidCta dict={d} />
      <Personas dict={d} />
      <Pricing dict={d} />
      <Trust dict={d} />
      <FAQ dict={d} />
      <Affiliates dict={d} />
      <Footer dict={d} />
      <AgentWidget dict={d} />
      <StickyDownloadCTA dict={d} />
      <CookieBanner dict={d} />
    </>
  );
}
