"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/content";

// Flags removed: 🇪🇸/🇬🇧 read inconsistently across screen readers (NVDA
// announces "Spain flag" verbatim, VoiceOver iOS reads the long name) AND
// flags ≠ languages (a Mexican Spanish speaker shouldn't have to identify
// with 🇪🇸). Plain text is universal and a11y-correct.
const LANGS: { code: Locale; label: string; ariaLabel: { es: string; en: string } }[] = [
  {
    code: "es",
    label: "ES",
    ariaLabel: { es: "Cambiar idioma a español", en: "Switch language to Spanish" },
  },
  {
    code: "en",
    label: "EN",
    ariaLabel: { es: "Cambiar idioma a inglés", en: "Switch language to English" },
  },
];

export function LanguageSwitcher({ current }: { current: Locale }) {
  const pathname = usePathname() ?? "/";

  return (
    <div
      className="inline-flex items-center gap-0.5 rounded-full border border-[var(--color-border)] bg-[var(--color-panel)] p-0.5"
      role="group"
      aria-label={current === "es" ? "Selector de idioma" : "Language switcher"}
    >
      {LANGS.map((l) => {
        const active = current === l.code;
        // Swap the leading locale segment in the current path.
        const newPath = pathname.replace(/^\/(es|en)/, `/${l.code}`);
        return (
          <Link
            key={l.code}
            href={newPath}
            aria-label={l.ariaLabel[current]}
            aria-current={active ? "true" : undefined}
            className={`inline-flex items-center h-7 px-2.5 rounded-full text-[11px] font-semibold transition-colors ${
              active
                ? "bg-[var(--color-accent)]/12 text-[var(--color-accent)]"
                : "text-[var(--color-fg-muted)] hover:text-[var(--color-fg-strong)]"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </div>
  );
}
