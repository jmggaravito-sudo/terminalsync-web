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
          {isEs ? "Dashboard de flujos" : "Flows dashboard"}
        </h1>
        <p className="mt-2 text-[14px] text-[var(--color-fg-muted)]">
          {isEs
            ? "Resultados reales de cada flujo: qué produjo, cuándo, qué cambió. Todo visible sin login ni clicks."
            : "Real results from each flow: what it produced, when, what changed. All visible without login or clicks."}
        </p>
        <nav className="mt-4 flex flex-wrap gap-2">
          <a
            href={`/${lang}/admin/ops/outreach`}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-panel)] px-3.5 py-1.5 text-[13px] font-medium text-[var(--color-fg)] hover:bg-[var(--color-panel-2)] transition-colors"
          >
            📇 {isEs ? "Cola de outreach" : "Outreach queue"}
          </a>
          <a
            href={`/${lang}/admin/ops/loop-runs`}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-panel)] px-3.5 py-1.5 text-[13px] font-medium text-[var(--color-fg)] hover:bg-[var(--color-panel-2)] transition-colors"
          >
            🔁 {isEs ? "Corridas del Loop" : "Loop runs"}
          </a>
        </nav>
        <div className="mt-6">
          <OpsDashboard lang={lang} />
        </div>
      </section>
    </main>
  );
}
