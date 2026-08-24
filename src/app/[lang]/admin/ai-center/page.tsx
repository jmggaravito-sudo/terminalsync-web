import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/content";
import { buildAiCenterPayload } from "@/lib/adminAiCenter";
import { AiCenterClient } from "./AiCenterClient";

interface Props {
  params: Promise<{ lang: string }>;
  searchParams?: Promise<{ tab?: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: lang === "es" ? "Admin · Centro de IAs" : "Admin · AI Center",
    robots: { index: false, follow: false },
  };
}

export default async function AdminAiCenterPage({ params, searchParams }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const sp = (await searchParams) ?? {};

  return (
    <AiCenterClient
      lang={lang}
      requestedTab={sp.tab}
      initialPayload={buildAiCenterPayload({ mode: "fallback_local", source: "page_local_mirror" })}
    />
  );
}
