import type { Metadata } from "next";
import Link from "next/link";
import { Plus, ArrowUpRight } from "lucide-react";
import { ListingsClient } from "./ListingsClient";

interface Props { params: Promise<{ lang: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const title =
    lang === "es" ? "Mis conectores · Terminal Sync" : "My connectors · Terminal Sync";
  return { title, robots: { index: false } };
}

export default async function PublisherDashboard({ params }: Props) {
  const { lang } = await params;
  const isEs = lang === "es";
  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)]">
      <section className="mx-auto max-w-5xl px-6 pt-24 pb-16">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-[32px] md:text-[40px] font-semibold tracking-tight leading-[1.1]">
              {isEs ? "Mis conectores" : "My connectors"}
            </h1>
            <p className="mt-2 text-[14px] text-[var(--color-fg-muted)]">
              {isEs
                ? "Drafts, pendientes y publicados. Las ediciones de listings aprobados van por nuevas versiones."
                : "Drafts, pending and published. Edits to approved listings go through new versions."}
            </p>
          </div>
          <Link
            href={`/${lang}/publishers/listings/new`}
            className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-[13px] font-semibold text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] glow-accent transition-all"
          >
            <Plus size={14} strokeWidth={2.4} />
            {isEs ? "Nuevo conector" : "New connector"}
          </Link>
        </div>
        <div className="mt-8">
          <ListingsClient lang={lang} />
        </div>
        <div className="mt-12 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5 text-[13px] text-[var(--color-fg-muted)]">
          {isEs
            ? "Los pagos se transfieren automáticamente a tu cuenta Stripe Connect en cada venta. Comisión TS: 10% (o 0% si sos uno de los primeros 50 publishers, durante 6 meses)."
            : "Payouts transfer automatically to your Stripe Connect account on each sale. TS fee: 10% (or 0% if you're one of the first 50 publishers, for 6 months)."}{" "}
          <Link href={`/${lang}/publishers/onboard?refresh=1`} className="inline-flex items-center gap-1 text-[var(--color-accent)] hover:underline">
            {isEs ? "Refrescar estado de Stripe" : "Refresh Stripe state"} <ArrowUpRight size={12} />
          </Link>
        </div>
      </section>
    </main>
  );
}
