import type { Metadata } from "next";
import { AiSelectionClient } from "./AiSelectionClient";

interface Props {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await params;
  return {
    title: "Admin · AI Selection",
    robots: { index: false },
  };
}

export default async function AdminAiSelection({ params }: Props) {
  const { lang } = await params;
  const isEs = lang === "es";
  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)]">
      <section className="mx-auto max-w-4xl px-4 sm:px-6 pt-16 sm:pt-20 pb-16">
        <h1 className="text-[22px] sm:text-[28px] font-semibold tracking-tight">
          {isEs ? "IA elegida · Medidor" : "AI selection · Meter"}
        </h1>
        <p className="mt-2 text-[13px] text-[var(--color-fg-muted)]">
          {isEs
            ? "Qué IA usa la gente al abrir una terminal: la suya propia (BYOK), la de cortesía, o ninguna. La métrica principal es cuántos llegan sin ninguna IA conectada — eso decide si vale la pena ofrecer 3 horas de cortesía. Sin datos personales, solo conteos."
            : "Which AI people use when opening a terminal: their own (BYOK), the courtesy one, or none. The headline metric is how many arrive with no AI connected — that decides whether the 3-hour courtesy trial is worth it. No personal data, counts only."}
        </p>
        <div className="mt-6">
          <AiSelectionClient isEs={isEs} />
        </div>
      </section>
    </main>
  );
}
