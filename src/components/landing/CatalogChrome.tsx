import Link from "next/link";
import { ArrowDown } from "lucide-react";


/**
 * Cromo del catálogo del handoff (capa visual, sin tocar data):
 * - CategoryBar: barra sticky espejo del cajón "Integraciones" del app.
 * - DragStrip: franja "Arrastra a tu sesión".
 * Se montan sobre las páginas de catálogo existentes.
 */

const CATS = [
  { key: "stacks", es: "Kits", en: "Kits" },
  { key: "connectors", es: "Conectores", en: "Connectors" },
  { key: "skills", es: "Skills", en: "Skills" },
  { key: "cli-tools", es: "Herramientas CLI", en: "CLI tools" },
] as const;

export function CategoryBar({ lang, active }: { lang: string; active: string }) {
  return (
    <div className="sticky top-14 z-20 backdrop-blur-md bg-[var(--color-bg)]/80 border-b border-[var(--color-border)]">
      <div className="mx-auto max-w-6xl px-5 md:px-6 py-2.5 flex flex-wrap items-center gap-2">
        {CATS.map((c) => {
          const on = c.key === active;
          return (
            <Link
              key={c.key}
              href={`/${lang}/${c.key}`}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
                on
                  ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/30"
                  : "text-[var(--color-fg-muted)] hover:text-[var(--color-fg-strong)] border border-transparent"
              }`}
            >
              {lang === "es" ? c.es : c.en}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function DragStrip({ lang }: { lang: string }) {
  return (
    <div className="mx-auto max-w-6xl px-5 md:px-6 pb-16">
      <div className="flex items-center justify-center gap-3 rounded-2xl border border-dashed border-[var(--color-accent)]/40 bg-[var(--color-accent)]/8 px-6 py-5 text-center text-[var(--color-accent)]">
        <ArrowDown size={18} strokeWidth={2.2} />
        <span className="text-[14px] font-semibold">
          {lang === "es"
            ? "Arrástralo a tu sesión en TerminalSync para instalarlo. Cero código."
            : "Drag it into your TerminalSync session to install it. Zero code."}
        </span>
      </div>
    </div>
  );
}
