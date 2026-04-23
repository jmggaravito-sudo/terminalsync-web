"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/content";

const LANGS: { code: Locale; label: string; flag: string }[] = [
  { code: "es", label: "ES", flag: "🇪🇸" },
  { code: "en", label: "EN", flag: "🇬🇧" },
];

export function LanguageSwitcher({ current }: { current: Locale }) {
  const pathname = usePathname() ?? "/";

  return (
    <div className="inline-flex items-center gap-0.5 rounded-full border border-[var(--color-border)] bg-[var(--color-panel)] p-0.5">
      {LANGS.map((l) => {
        const active = current === l.code;
        // Swap the leading locale segment in the current path.
        const newPath = pathname.replace(/^\/(es|en)/, `/${l.code}`);
        return (
          <Link
            key={l.code}
            href={newPath}
            className={`inline-flex items-center gap-1 h-7 px-2.5 rounded-full text-[11px] font-semibold transition-colors ${
              active
                ? "bg-[var(--color-accent)]/12 text-[var(--color-accent)]"
                : "text-[var(--color-fg-muted)] hover:text-[var(--color-fg-strong)]"
            }`}
          >
            <span aria-hidden>{l.flag}</span>
            {l.label}
          </Link>
        );
      })}
    </div>
  );
}
