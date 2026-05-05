import type { Metadata } from "next";
import { Suspense } from "react";
import { DiscoveryReviewBypass } from "./DiscoveryReviewBypass";

interface Props { params: Promise<{ lang: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: lang === "es" ? "Admin Bypass · Discovery" : "Admin Bypass · Discovery",
    robots: { index: false, follow: false },
  };
}

export default async function AdminDiscoveryBypass({ params }: Props) {
  const { lang } = await params;
  const isEs = lang === "es";
  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)]">
      <section className="mx-auto max-w-3xl px-4 sm:px-6 pt-16 sm:pt-20 pb-16">
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.16em] text-amber-400">
          ⚠ Bypass mode
        </div>
        <h1 className="text-[22px] sm:text-[28px] font-semibold tracking-tight">
          {isEs ? "Discovery · Revisión (bypass)" : "Discovery · Review (bypass)"}
        </h1>
        <p className="mt-2 text-[13px] text-[var(--color-fg-muted)]">
          {isEs
            ? "Acceso temporal por URL secreta mientras se restablece login. Token en la URL — no compartas este link."
            : "Temporary URL-secret access while login is being fixed. Don't share this link."}
        </p>
        <div className="mt-6">
          <Suspense fallback={null}>
            <DiscoveryReviewBypass lang={lang} />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
