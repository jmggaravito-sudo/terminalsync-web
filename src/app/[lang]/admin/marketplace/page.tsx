import type { Metadata } from "next";
import { AdminReview } from "./AdminReview";

interface Props { params: Promise<{ lang: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: lang === "es" ? "Admin · Marketplace" : "Admin · Marketplace",
    robots: { index: false },
  };
}

export default async function AdminMarketplace({ params }: Props) {
  const { lang } = await params;
  const isEs = lang === "es";
  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)]">
      <section className="mx-auto max-w-6xl px-6 pt-24 pb-16">
        <h1 className="text-[28px] md:text-[32px] font-semibold tracking-tight">
          {isEs ? "Marketplace · Revisión" : "Marketplace · Review queue"}
        </h1>
        <p className="mt-2 text-[14px] text-[var(--color-fg-muted)]">
          {isEs
            ? "Listings pendientes. SLA público: 48h. Aprobá solo lo que probaste localmente."
            : "Pending listings. Public SLA: 48h. Approve only what you've tested locally."}
        </p>
        <div className="mt-8">
          <AdminReview lang={lang} />
        </div>
      </section>
    </main>
  );
}
