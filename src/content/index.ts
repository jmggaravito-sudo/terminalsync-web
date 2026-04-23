import es from "./es";
import en from "./en";
import type { Dict, Locale } from "./types";

export const locales: Locale[] = ["es", "en"];
export const defaultLocale: Locale = "es";

const dicts: Record<Locale, Dict> = { es, en };

export function getDict(locale: Locale): Dict {
  return dicts[locale] ?? dicts[defaultLocale];
}

export function isLocale(value: string): value is Locale {
  return (locales as string[]).includes(value);
}

export type { Dict, Locale };
