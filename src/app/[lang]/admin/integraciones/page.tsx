import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/content";
import { IntegracionesClient } from "./IntegracionesClient";
import { AgregarCandidatoPanel } from "./AgregarCandidatoPanel";
import { LoopsInfoSection } from "./LoopsInfoSection";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: lang === "es" ? "Admin · Integraciones" : "Admin · Integrations",
    robots: { index: false },
  };
}

/**
 * /[lang]/admin/integraciones — Panel A + Panel B.
 *
 * Panel A ("Correr ahora"): dispara y muestra el estado del loop de
 * supervisión de paridad de connectors entre las 4 IAs (Claude/Codex/
 * Gemini/GLM) — workflow `connector-loop.yml` en el repo `terminal-sync`.
 *
 * Panel B ("Agregar candidato"): formulario para crear un candidato de
 * skill o connector como PR draft en ESTE repo (ver AgregarCandidatoPanel +
 * POST /api/admin/integraciones/candidate). Vive como componente hermano,
 * no dentro de IntegracionesClient — son features independientes que
 * comparten página.
 *
 * Debajo de los dos paneles: LoopsInfoSection, un acordeón puramente
 * informativo ("¿Qué hace cada loop?") sin fetches ni gate de auth propio —
 * explica en criollo qué hace la supervisión y qué hacen los loops de
 * curación, para que JM sepa qué dispara antes de tocar "Correr ahora".
 *
 * Thin server shell; toda la lógica de auth + fetch vive en cada client
 * component, igual que /admin/mercadopago y /admin/ops/loop-runs.
 */
export default async function IntegracionesPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return (
    <>
      <IntegracionesClient lang={lang} />
      <AgregarCandidatoPanel lang={lang} />
      <LoopsInfoSection lang={lang} />
    </>
  );
}
