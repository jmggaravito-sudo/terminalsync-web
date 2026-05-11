import type { Metadata } from "next";
import { OpsDashboard } from "./OpsDashboard";

interface Props {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: lang === "es" ? "Admin · Ops" : "Admin · Ops",
    robots: { index: false },
  };
}

export default async function AdminOps({ params }: Props) {
  const { lang } = await params;
  const isEs = lang === "es";
  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)]">
      <section className="mx-auto max-w-5xl px-4 sm:px-6 pt-12 sm:pt-16 pb-16">
        <h1 className="text-[26px] sm:text-[32px] font-semibold tracking-tight">
          {isEs ? "Tus flujos en n8n" : "Your n8n flows"}
        </h1>
        <p className="mt-2 text-[14px] text-[var(--color-fg-muted)]">
          {isEs
            ? "Qué hace cada uno y cómo le fue hoy. Verde = trabajando bien. Rojo = revisar."
            : "What each one does and how it did today. Green = working fine. Red = needs a look."}
        </p>
        <div className="mt-6">
          <OpsDashboard lang={lang} />
        </div>
      </section>
    </main>
  );
}
