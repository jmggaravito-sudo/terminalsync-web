import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/content";
import { Hero } from "@/components/landing/Hero";
import { Demos } from "@/components/landing/Demos";
import { Benefits } from "@/components/landing/Benefits";
import { ToolBreakdown } from "@/components/landing/ToolBreakdown";
import { Comparison } from "@/components/landing/Comparison";
import { BeforeAfter } from "@/components/landing/BeforeAfter";
import { MidCta } from "@/components/landing/MidCta";
import { Personas } from "@/components/landing/Personas";
import { Pricing } from "@/components/landing/Pricing";
import { Trust } from "@/components/landing/Trust";
import { FAQ } from "@/components/landing/FAQ";
import { Affiliates } from "@/components/landing/Affiliates";
import { Footer } from "@/components/landing/Footer";
import { AgentWidget } from "@/components/AgentWidget";
import { CookieBanner } from "@/components/CookieBanner";
import { StickyDownloadCTA } from "@/components/StickyDownloadCTA";
import { StructuredData } from "@/components/StructuredData";

interface Props {
  params: Promise<{ lang: string }>;
}

export default async function Landing({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const d = getDict(lang);

  return (
    <>
      <StructuredData dict={d} lang={lang} />
      <Hero dict={d} />
      <Demos dict={d} />
      <Benefits dict={d} />
      <ToolBreakdown dict={d} />
      <Comparison dict={d} />
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
