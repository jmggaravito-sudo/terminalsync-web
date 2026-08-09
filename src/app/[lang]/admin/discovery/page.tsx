import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/content";

interface Props {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: lang === "es" ? "Admin · Discovery retirado" : "Admin · Retired discovery",
    robots: { index: false },
  };
}

const retiredNotesEs = [
  "Este Discovery era para encontrar conectores, skills y herramientas técnicas para el marketplace.",
  "Ese scraper/ingest fue apagado el 2026-07-24 y ya no escribe candidatos nuevos.",
  "No es el flujo correcto para el nicho actual de empresarios, agencias e influenciadores.",
];

const retiredNotesEn = [
  "This Discovery used to find connectors, skills, and technical tools for the marketplace.",
  "That scraper/ingest was disabled on 2026-07-24 and no longer writes new candidates.",
  "It is not the right workflow for the current business owners, agencies, and influencers niche.",
];

export default async function AdminDiscoveryRetired({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const isEs = lang === "es";
  const notes = isEs ? retiredNotesEs : retiredNotesEn;

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)]">
      <section className="mx-auto max-w-5xl px-5 md:px-6 py-10">
        <p className="text-[12px] uppercase tracking-[0.18em] text-[var(--color-fg-muted)]">
          {isEs ? "Sección retirada" : "Retired section"}
        </p>
        <h1 className="mt-2 text-[28px] font-semibold tracking-tight text-[var(--color-fg-strong)]">
          {isEs ? "Discovery viejo: no usar para ventas" : "Old Discovery: do not use for sales"}
        </h1>
        <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-[var(--color-fg-muted)]">
          {isEs
            ? "Esta página existe para que el Admin no caiga en 404. El flujo Discovery original era de marketplace técnico; hoy la operación útil vive en Ops, Outreach y Radar de oportunidades."
            : "This page exists so Admin does not land on a 404. The original Discovery workflow was for the technical marketplace; useful operations now live in Ops, Outreach, and the Opportunity Radar."}
        </p>

        <div className="mt-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
          <h2 className="text-[16px] font-semibold text-[var(--color-fg-strong)]">
            {isEs ? "Qué significa" : "What this means"}
          </h2>
          <ul className="mt-4 space-y-3 text-[14px] text-[var(--color-fg-muted)]">
            {notes.map((note) => (
              <li key={note} className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--color-accent)]" />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Link
            href={`/${lang}/admin/ops`}
            className="rounded-2xl border border-white bg-black p-5 text-white transition-transform hover:-translate-y-0.5"
          >
            <p className="text-[15px] font-semibold">{isEs ? "Ver flujos Ops" : "View Ops flows"}</p>
            <p className="mt-2 text-[13px] leading-relaxed text-white/75">
              {isEs
                ? "Salud, propósito y resultados de cada flujo activo o archivado."
                : "Health, purpose, and results for each active or archived workflow."}
            </p>
          </Link>
          <Link
            href={`/${lang}/admin/ops/outreach`}
            className="rounded-2xl border border-white bg-black p-5 text-white transition-transform hover:-translate-y-0.5"
          >
            <p className="text-[15px] font-semibold">{isEs ? "Cola de influencers" : "Influencer queue"}</p>
            <p className="mt-2 text-[13px] leading-relaxed text-white/75">
              {isEs
                ? "Aprobar leads, preparar mensajes y hacer seguimiento manual."
                : "Approve leads, prepare messages, and run manual follow-up."}
            </p>
          </Link>
          <Link
            href={`/${lang}/admin/trends`}
            className="rounded-2xl border border-white bg-black p-5 text-white transition-transform hover:-translate-y-0.5"
          >
            <p className="text-[15px] font-semibold">{isEs ? "Radar de oportunidades" : "Opportunity Radar"}</p>
            <p className="mt-2 text-[13px] leading-relaxed text-white/75">
              {isEs
                ? "Ideas accionables para empresarios/agencias: pains, hooks y señales."
                : "Actionable ideas for business owners/agencies: pains, hooks, and signals."}
            </p>
          </Link>
        </div>
      </section>
    </main>
  );
}
