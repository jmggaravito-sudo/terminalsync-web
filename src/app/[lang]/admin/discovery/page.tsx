import type { Metadata } from "next";
import { DiscoveryReview } from "./DiscoveryReview";

interface Props { params: Promise<{ lang: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: lang === "es" ? "Admin · Discovery" : "Admin · Discovery",
    robots: { index: false },
  };
}

export default async function AdminDiscovery({ params }: Props) {
  const { lang } = await params;
  const isEs = lang === "es";
  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)]">
      <section className="mx-auto max-w-3xl px-4 sm:px-6 pt-16 sm:pt-20 pb-16">
        <h1 className="text-[22px] sm:text-[28px] font-semibold tracking-tight">
          {isEs ? "Discovery · Revisión" : "Discovery · Review queue"}
        </h1>
        <p className="mt-2 text-[13px] text-[var(--color-fg-muted)]">
          {isEs
            ? "Connectors y skills detectados por el scraper diario YT + X. Aprobá los que valgan la pena para listarlos en el marketplace."
            : "Connectors and skills picked up by the daily YT + X scraper. Approve the ones worth listing in the marketplace."}
        </p>
        <div className="mt-6">
          <DiscoveryReview lang={lang} />
        </div>
      </section>
    </main>
  );
}
