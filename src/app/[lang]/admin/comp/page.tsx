import { notFound } from "next/navigation";
import { isLocale } from "@/content";
import { CompClient } from "./CompClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ lang: string }>;
}

/**
 * /[lang]/admin/comp — grant free Pro/Max ("comp") accounts to influencers.
 * Thin shell; the Client component calls /api/admin/comp with the user's
 * Bearer token, so the auth gate lives in the API route (ADMIN_EMAILS),
 * consistent with the rest of /admin.
 */
export default async function CompPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <CompClient lang={lang} />;
}
