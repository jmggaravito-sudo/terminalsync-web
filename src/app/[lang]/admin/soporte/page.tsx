import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/content";
import { SoporteClient } from "./SoporteClient";

interface Props {
  params: Promise<{ lang: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: lang === "es" ? "Admin · Soporte" : "Admin · Support",
    robots: { index: false, follow: false },
  };
}

export default async function AdminSoportePage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return <SoporteClient lang={lang} />;
}
