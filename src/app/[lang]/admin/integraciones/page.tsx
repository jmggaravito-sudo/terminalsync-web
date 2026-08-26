import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/content";
import { IntegracionesClient } from "./IntegracionesClient";

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
 * /[lang]/admin/integraciones — Panel A: "Correr loops". Dispara y muestra
 * el estado del loop de supervisión de paridad de connectors entre las 4 IAs
 * (Claude/Codex/Gemini/GLM) — workflow `connector-loop.yml` en el repo
 * `terminal-sync` (creado en paralelo por otro agente; esta página solo lo
 * referencia por nombre).
 *
 * Panel B (formulario de candidatos de connectors) es un pase aparte — no
 * vive en este archivo.
 *
 * Thin server shell; toda la lógica de auth + fetch vive en el client
 * component, igual que /admin/mercadopago y /admin/ops/loop-runs.
 */
export default async function IntegracionesPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <IntegracionesClient lang={lang} />;
}
