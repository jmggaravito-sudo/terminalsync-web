"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { Locale } from "@/content";

// Filas del catálogo real (public/connectors/*.svg). Si algún slug falla al
// cargar, el tile se oculta (nunca se muestra un tile vacío).
const ROW_1 = [
  "gmail",
  "gdrive",
  "notion",
  "whatsapp",
  "stripe",
  "slack",
  "supabase",
  "vercel",
];
const ROW_2 = [
  "airtable",
  "github",
  "google-maps",
  "postgres",
  "sentry",
  "gitlab",
  "webflow",
  "framer",
];

// Marcas con logo negro/oscuro: en tema oscuro les damos un fondo claro para
// que se sigan viendo. En tema claro se muestran con el fondo normal del tile.
const DARK_LOGOS = new Set([
  "github",
  "notion",
  "vercel",
  "framer",
  "sentry",
]);

const COPY = {
  es: {
    title: "Automatizaciones listas para tu empresa con ",
    highlight: "agentes de IA",
    subtitle:
      "Arrastra tus herramientas de siempre a tu sesión. Sin claves, sin configurar.",
    cta: "Ver todas las integraciones →",
  },
  en: {
    title: "Ready-made automations for your business with ",
    highlight: "AI agents",
    subtitle:
      "Drag your everyday tools into your session. No keys, no setup.",
    cta: "See all integrations →",
  },
} as const;

export function IntegrationsMarquee({ lang }: { lang: Locale }) {
  const t = COPY[lang];
  return (
    <section
      aria-label={t.title + t.highlight}
      className="mt-12 md:mt-16"
    >
      <div className="text-center mb-6 md:mb-8 px-4">
        <h2
          className="font-semibold text-[var(--color-fg-strong)] leading-tight"
          style={{ fontSize: "clamp(20px, 2.6vw, 28px)", letterSpacing: "-0.02em" }}
        >
          {t.title}
          <span className="text-[var(--color-accent)]">{t.highlight}</span>
        </h2>
        <p className="mt-2 text-[14px] text-[var(--color-fg-muted)]">
          {t.subtitle}
        </p>
      </div>
      <div className="ts-marquee">
        <MarqueeRow slugs={ROW_1} direction="left" />
        <MarqueeRow
          slugs={ROW_2}
          direction="right"
          className="hidden md:block mt-3"
        />
      </div>
      <div className="text-center mt-6">
        <Link
          href={`/${lang}/stacks`}
          className="text-[14px] font-medium text-[var(--color-accent)] hover:underline underline-offset-2"
        >
          {t.cta}
        </Link>
      </div>
    </section>
  );
}

function MarqueeRow({
  slugs,
  direction,
  className,
}: {
  slugs: string[];
  direction: "left" | "right";
  className?: string;
}) {
  // Duplicamos la lista para el loop infinito sin salto: la animación
  // desplaza -50% del ancho total, exactamente el ancho de la primera copia.
  const doubled = [...slugs, ...slugs];
  return (
    <div className={`ts-marquee-row ${className ?? ""}`}>
      <div
        className={`ts-marquee-track ${
          direction === "left" ? "ts-marquee-left" : "ts-marquee-right"
        }`}
      >
        {doubled.map((slug, i) => (
          <IntegrationTile key={`${slug}-${i}`} slug={slug} />
        ))}
      </div>
    </div>
  );
}

function IntegrationTile({ slug }: { slug: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  const isDark = DARK_LOGOS.has(slug);
  return (
    <div className={`ts-integration-tile${isDark ? " ts-integration-tile--dark-logo" : ""}`}>
      <img
        src={`/connectors/${slug}.svg`}
        alt={slug}
        onError={() => setFailed(true)}
        loading="lazy"
        width={24}
        height={24}
      />
    </div>
  );
}
