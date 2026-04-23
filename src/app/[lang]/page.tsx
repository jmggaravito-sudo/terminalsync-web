import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/content";
import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { Demos } from "@/components/landing/Demos";
import { Benefits } from "@/components/landing/Benefits";
import { Personas } from "@/components/landing/Personas";
import { Pricing } from "@/components/landing/Pricing";
import { Trust } from "@/components/landing/Trust";
import { Affiliates } from "@/components/landing/Affiliates";
import { Footer } from "@/components/landing/Footer";
import { AgentWidget } from "@/components/AgentWidget";
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
      <Nav dict={d} lang={lang} />
      <Hero dict={d} />
      <Demos dict={d} />
      <Benefits dict={d} />
      <Personas dict={d} />
      <Pricing dict={d} />
      <Trust dict={d} />
      <Affiliates dict={d} />
      <Footer dict={d} />
      <AgentWidget dict={d} />
    </>
  );
}
