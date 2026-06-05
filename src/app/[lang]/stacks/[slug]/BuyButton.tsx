"use client";

import { Download } from "lucide-react";

/**
 * Stack Pack CTA. Kits son gratis e incluidos en el plan — no hay
 * cobro per-pack. El CTA invita a descargar/abrir TerminalSync; el
 * pack aparece en el cajón Explorar del Lab listo para arrastrar a
 * una sesión.
 *
 * El nombre `BuyButton` se preserva por compatibilidad de imports
 * mientras la migración a "Gratis" rueda. Cuando todo esté limpio
 * se renombra a `GetPackButton` o similar.
 *
 * El flow Stripe Checkout previo + `/api/marketplace/bundles/<slug>/buy`
 * + states `paid` / `canceled` quedaron deprecated en este componente.
 * El endpoint sigue vivo en `src/app/api/marketplace/bundles/[slug]/buy`
 * por si en el futuro hay packs Pro que cobran — su frontend renacerá
 * en otro componente.
 */
export function BuyButton({ lang, slug: _slug }: { lang: string; slug: string }) {
  const isEs = lang === "es";

  return (
    <div className="space-y-2.5">
      <a
        href="/api/download"
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] text-white text-[14px] font-semibold px-5 py-3 transition-colors glow-accent"
      >
        <Download size={15} strokeWidth={2.4} />
        {isEs ? "Descargar TerminalSync" : "Download TerminalSync"}
      </a>
      <p className="text-[11.5px] text-[var(--color-fg-dim)] text-center leading-relaxed">
        {isEs
          ? "El pack aparece listo en el cajón Explorar de la app — arrastralo a tu sesión."
          : "The pack appears in the app's Explore drawer — drag it onto your session."}
      </p>
    </div>
  );
}
