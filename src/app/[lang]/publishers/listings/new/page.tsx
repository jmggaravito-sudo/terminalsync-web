import type { Metadata } from "next";
import { NewListingForm } from "./NewListingForm";

interface Props { params: Promise<{ lang: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: lang === "es" ? "Nuevo conector · Terminal Sync" : "New connector · Terminal Sync",
    robots: { index: false },
  };
}

export default async function NewListing({ params }: Props) {
  const { lang } = await params;
  const isEs = lang === "es";
  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)]">
      <section className="mx-auto max-w-3xl px-6 pt-24 pb-16">
        <h1 className="text-[32px] md:text-[40px] font-semibold tracking-tight leading-[1.1]">
          {isEs ? "Nuevo conector" : "New connector"}
        </h1>
        <p className="mt-2 text-[14px] text-[var(--color-fg-muted)]">
          {isEs
            ? "Submission entra como pendiente. Revisión manual con SLA de 48h."
            : "Submissions enter as pending. Manual review with a 48h SLA."}
        </p>
        <div className="mt-8">
          <NewListingForm lang={lang} />
        </div>
      </section>
    </main>
  );
}
