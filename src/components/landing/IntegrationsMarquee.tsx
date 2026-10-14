"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { Locale } from "@/content";
import {
  liveSearchRows,
  liveSearchSourceLabel,
  VISIBLE_LIVE_SEARCH_SOURCES,
  type LiveSearchSource,
} from "@/lib/liveSearchSources";

// Filas del catálogo real (public/connectors/*.svg). Si algún slug falla al
// cargar, el tile se oculta (nunca se muestra un tile vacío).
const ROW_1 = [
  "gmail",
  "gdrive",
  "google-sheets",
  "google-calendar",
  "notion",
  "whatsapp",
  "telegram",
  "shopify",
  "stripe",
];
const ROW_2 = [
  "hubspot",
  "airtable",
  "monday",
  "clickup",
  "github",
  "dropbox",
  "intercom",
  "google-maps",
  "postgres",
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
    liveSearchTitle: "La IA de TS busca en vivo en…",
    liveSearchNote:
      "Las marcas pertenecen a sus respectivos dueños. TS consulta información pública; no implica afiliación.",
  },
  en: {
    title: "Ready-made automations for your business with ",
    highlight: "AI agents",
    subtitle:
      "Drag your everyday tools into your session. No keys, no setup.",
    cta: "See all integrations →",
    liveSearchTitle: "TS AI searches live on…",
    liveSearchNote:
      "Brands belong to their respective owners. TS looks up public information; no affiliation implied.",
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
      <LiveSearchSources
        lang={lang}
        title={t.liveSearchTitle}
        note={t.liveSearchNote}
        sources={VISIBLE_LIVE_SEARCH_SOURCES}
      />
    </section>
  );
}

/**
 * Tercera fila, separada de las integraciones: fuentes públicas que la IA de
 * TS consulta en vivo (no son cuentas que el cliente conecta). Usa el mismo
 * cuadro que las integraciones (`ts-integration-tile`, vía `LogoTile`): solo el
 * logo, con el nombre en `alt` y en `title`. Filas estáticas y centradas de
 * `LIVE_SEARCH_ROW_SIZE` (hoy 7 + 7) en vez de marquee, para que coincida con
 * la portada estática. Lista, logos e interruptor del lote 3 en
 * `liveSearchSources.ts`.
 */
export function LiveSearchSources({
  lang,
  title,
  note,
  sources,
}: {
  lang: Locale;
  title: string;
  note: string;
  sources: readonly LiveSearchSource[];
}) {
  if (sources.length === 0) return null;
  return (
    <div className="ts-live-sources">
      <h3 className="ts-live-sources-title">{title}</h3>
      <div className="ts-live-sources-rows" role="list" aria-label={title}>
        {liveSearchRows(sources).map((row, i) => (
          <div key={i} className="ts-live-sources-row" role="none">
            {row.map((source) => {
              const label = liveSearchSourceLabel(source, lang);
              return (
                <LogoTile
                  key={source.name}
                  src={`/sources/${source.logo}.svg`}
                  alt={label}
                  title={label}
                  darkLogo={Boolean(source.darkLogo)}
                  role="listitem"
                />
              );
            })}
          </div>
        ))}
      </div>
      <p className="ts-live-sources-note">{note}</p>
    </div>
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
  return (
    <LogoTile
      src={`/connectors/${slug}.svg`}
      alt={slug}
      darkLogo={DARK_LOGOS.has(slug)}
    />
  );
}

/**
 * El cuadro de logo de la portada: lo usan las integraciones y la fila de
 * Búsqueda en vivo. Si el logo falla al cargar, el cuadro se oculta (nunca se
 * muestra un cuadro vacío). Logo oscuro → fondo claro en tema oscuro.
 */
function LogoTile({
  src,
  alt,
  title,
  darkLogo,
  role,
}: {
  src: string;
  alt: string;
  title?: string;
  darkLogo: boolean;
  role?: "listitem";
}) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <div
      className={`ts-integration-tile${darkLogo ? " ts-integration-tile--dark-logo" : ""}`}
      title={title}
      role={role}
    >
      <img
        src={src}
        alt={alt}
        onError={() => setFailed(true)}
        loading="lazy"
        width={24}
        height={24}
      />
    </div>
  );
}
