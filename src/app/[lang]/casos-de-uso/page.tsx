import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/content";
import { LiveSearchCasesPage } from "@/components/landing/LiveSearchCasesPage";

interface Props {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const isEs = lang === "es";
  const title = isEs
    ? "Casos de uso para tu negocio — TerminalSync"
    : "Business use cases — TerminalSync";
  const description = isEs
    ? "Explora 36 casos prácticos en 12 categorías de negocio, incluida la nueva categoría de Mercado y competencia."
    : "Explore 36 practical use cases across 12 business categories, including the new Market & competitors category.";
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

  return <LiveSearchCasesPage lang={lang} />;
}
