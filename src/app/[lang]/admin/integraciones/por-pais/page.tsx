import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/content";
import { PorPaisClient } from "./PorPaisClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: lang === "es" ? "Admin · Integraciones por país" : "Admin · Integrations by country",
    robots: { index: false },
  };
}

/**
 * /[lang]/admin/integraciones/por-pais — shell delgado; la auth y el fetch
 * viven en el client component (igual que /admin/integraciones), y el gate
 * real está en GET /api/admin/integraciones/por-pais (ADMIN_EMAILS).
 */
export default async function PorPaisPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <PorPaisClient lang={lang} />;
}
