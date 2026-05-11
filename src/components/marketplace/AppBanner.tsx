import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";

// Compact app promo for the marketplace pages. Sits at the bottom (per
// JM's request "ponerlo de último") so it doesn't compete with the
// catalog hero up top.

export function MarketplaceAppBanner({ lang }: { lang: string }) {
  const isEs = lang === "es";
  return (
    <section className="mx-auto max-w-5xl px-6 pb-32">
      <div className="relative overflow-hidden rounded-3xl border border-[var(--color-accent)]/25 bg-gradient-to-br from-[var(--color-accent)]/8 via-[var(--color-panel)] to-[var(--color-claude)]/6">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.15fr] items-center">
          <div className="p-6 md:p-8">
            <h2 className="text-[20px] md:text-[24px] font-semibold tracking-tight leading-[1.15]">
              {isEs
                ? "Instalá una vez. Te sigue a todas tus máquinas."
                : "Install once. They follow you to every machine."}
            </h2>
            <p className="mt-2 text-[13.5px] text-[var(--color-fg-muted)] leading-relaxed">
              {isEs
                ? "TerminalSync mantiene tu Claude, Codex y Gemini sincronizados, encriptados y listos en cualquier Mac."
                : "TerminalSync keeps your Claude, Codex and Gemini synced, encrypted, and ready on any Mac."}
            </p>
            <div className="mt-5 flex items-center gap-2.5 flex-wrap">
              <a
                href="/api/download"
                data-cta="marketplace-banner-download"
                className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-[13px] font-semibold text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] transition-colors"
              >
                <Download size={13} strokeWidth={2.4} />
                {isEs ? "Descargar gratis" : "Download free"}
              </a>
              <Link
                href={`/${lang}`}
                className="inline-flex items-center gap-1 text-[13px] font-medium text-[var(--color-fg-muted)] hover:text-[var(--color-accent)] transition-colors"
              >
                {isEs ? "Cómo funciona" : "How it works"}
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
          <div className="relative h-full min-h-[220px] md:min-h-[260px] p-3 md:p-5 md:pl-0">
            <div className="relative h-full rounded-xl border border-[var(--color-border)] bg-[var(--color-panel-2)]/50 overflow-hidden shadow-lg">
              <Image
                src="/marketplace/app-dashboard.png"
                alt={isEs ? "TerminalSync · panel principal" : "TerminalSync dashboard"}
                fill
                className="object-cover object-left-top"
                sizes="(min-width: 768px) 50vw, 100vw"
                priority={false}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
