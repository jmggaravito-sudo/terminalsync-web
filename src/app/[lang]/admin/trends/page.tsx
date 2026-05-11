import type { Metadata } from "next";
import { TrendsReview } from "./TrendsReview";

interface Props {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: lang === "es" ? "Admin · Trends" : "Admin · Trends",
    robots: { index: false },
  };
}

export default async function AdminTrends({ params }: Props) {
  const { lang } = await params;
  const isEs = lang === "es";
  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)]">
      <section className="mx-auto max-w-5xl px-4 sm:px-6 pt-16 sm:pt-20 pb-16">
        <h1 className="text-[22px] sm:text-[28px] font-semibold tracking-tight">
          {isEs ? "Trends · Radar" : "Trends · Radar"}
        </h1>
        <p className="mt-2 text-[13px] text-[var(--color-fg-muted)]">
          {isEs
            ? "Señales del día capturadas por el cron 6am COL desde GitHub, HackerNews y Reddit. Si una señal aparece en 2+ fuentes, salta como momento real."
            : "Daily signals captured by the 6am COL cron from GitHub, HackerNews, and Reddit. Signals appearing in 2+ sources surface as real momentum."}
        </p>
        <div className="mt-6">
          <TrendsReview lang={lang} />
        </div>
      </section>
    </main>
  );
}
