import type { Metadata } from "next";
import { LEGAL_ES_PUBLIC } from "@/lib/launchFlags";
import type { Locale } from "@/content";

/** Metadatos comunes de las páginas legales para España. noindex mientras sean borrador. */
export function legalMetadata(
  lang: Locale,
  slug: string,
  title: { es: string; en: string },
  description: { es: string; en: string },
): Metadata {
  return {
    title: title[lang],
    description: description[lang],
    robots: LEGAL_ES_PUBLIC ? undefined : { index: false, follow: false },
    alternates: {
      canonical: `https://terminalsync.ai/${lang}/legal/${slug}`,
      languages: {
        es: `https://terminalsync.ai/es/legal/${slug}`,
        en: `https://terminalsync.ai/en/legal/${slug}`,
      },
    },
  };
}
