import type { Metadata } from "next";
import { Suspense } from "react";
import { ProspectsReview } from "./ProspectsReview";

interface Props { params: Promise<{ lang: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: lang === "es" ? "Admin · Prospects" : "Admin · Prospects",
    robots: { index: false, follow: false },
  };
}

export default async function AdminProspectsBypass({ params }: Props) {
  const { lang } = await params;
  const isEs = lang === "es";
  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)]">
      <section className="mx-auto max-w-3xl px-4 sm:px-6 pt-16 sm:pt-20 pb-16">
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.16em] text-amber-400">
          ⚠ Bypass mode
        </div>
        <h1 className="text-[22px] sm:text-[28px] font-semibold tracking-tight">
          {isEs ? "Prospects no-dev · Revisión" : "No-dev Prospects · Review"}
        </h1>
        <p className="mt-2 text-[13px] text-[var(--color-fg-muted)]">
          {isEs
            ? "Founders y operators no-técnicos detectados por el scraper diario. Calificá los buenos para que el outreach los contacte."
            : "Non-technical founders and operators surfaced by the daily scraper. Qualify the good ones for the outreach cron."}
        </p>
        <div className="mt-6">
          <Suspense fallback={null}>
            <ProspectsReview lang={lang} />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
