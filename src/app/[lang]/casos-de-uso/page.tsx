import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/content";
import { UseCasesExplorer } from "@/components/landing/UseCasesExplorer";

interface Props {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const isEs = lang === "es";
  const title = isEs
    ? "Casos de uso — TS"
    : "Use cases — TS";
  const description = isEs
    ? "28 formas concretas de usar TS para tu negocio. Filtrá por área, IA y nivel."
    : "28 concrete ways to use TS for your business. Filter by area, AI, and level.";
  return {
    title,
    description,
    alternates: {
      canonical: `https://terminalsync.ai/${lang}/casos-de-uso`,
      languages: {
        es: "https://terminalsync.ai/es/casos-de-uso",
        en: "https://terminalsync.ai/en/casos-de-uso",
      },
    },
    openGraph: { title, description },
  };
}

export async function generateStaticParams() {
  return [{ lang: "es" }, { lang: "en" }];
}

export default async function UseCasesPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return <UseCasesExplorer lang={lang} />;
}
