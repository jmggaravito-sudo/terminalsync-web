import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/content";
import { getUseCaseJobs, getUseCases } from "@/lib/useCases";
import { LiveSearchCasesPage, type LandingCasesData } from "@/components/landing/LiveSearchCasesPage";

interface Props {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const isEs = lang === "es";
  const catalog = getUseCases(lang);
  const title = isEs
    ? "Casos de uso para tu negocio — TerminalSync"
    : "Business use cases — TerminalSync";
  const description = isEs
    ? `Explora ${catalog.cases.length} casos prácticos en ${catalog.categories.length} categorías de negocio de TerminalSync.`
    : `Explore ${catalog.cases.length} practical TerminalSync use cases across ${catalog.categories.length} business categories.`;
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

  const catalog = getUseCases(lang);
  const jobs = getUseCaseJobs(lang);
  // Only what the page renders travels to the client component.
  const data: LandingCasesData = {
    categories: catalog.categories.map(({ id, title }) => ({ id, title })),
    cases: catalog.cases.map(({ id, categoryId, title, outcome, prompt }) => ({
      id,
      categoryId,
      title,
      outcome,
      prompt,
    })),
    jobCategories: jobs.categories,
    jobs: jobs.jobs.map(({ id, cat, t, d, cad, rep, steps }) => ({ id, cat, t, d, cad, rep, steps })),
  };

  return <LiveSearchCasesPage lang={lang} data={data} />;
}
