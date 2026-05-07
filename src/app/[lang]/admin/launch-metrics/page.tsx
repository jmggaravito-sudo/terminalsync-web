import { notFound } from "next/navigation";
import { isLocale } from "@/content";
import { LaunchMetricsClient } from "./LaunchMetricsClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ lang: string }>;
}

/**
 * /[lang]/admin/launch-metrics — single dashboard with the launch plan §6
 * KPIs. The page is a thin shell; the Client component fetches /api/admin/
 * launch-metrics with the user's Bearer token (so the auth gate lives in
 * the API route, consistent with the rest of /admin).
 */
export default async function LaunchMetricsPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <LaunchMetricsClient lang={lang} />;
}
