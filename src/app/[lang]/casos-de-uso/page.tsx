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
    ? "Casos de uso: mercado y competencia — TerminalSync"
    : "Use cases: market and competitors — TerminalSync";
  const description = isEs
    ? "Siete casos prácticos de búsqueda en vivo para entender tu negocio, tus competidores y tu mercado."
    : "Seven practical live-search use cases to understand your business, competitors, and market.";
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
