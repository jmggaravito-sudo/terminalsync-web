import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/content";
import { BillingPortalLauncher } from "./BillingPortalLauncher";

export const metadata: Metadata = {
  title: "Administrar suscripción · Terminal Sync",
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ lang: string }>;
}

/**
 * Landing for billing management. The user gets here from the "Administrar
 * mi suscripción" button in their email. We ask for their email, verify it
 * matches a subscription on file, and POST to /api/billing/portal which
 * mints a one-time Stripe Customer Portal session and returns its URL.
 *
 * Why ask for the email instead of using a signed URL token? See
 * /api/billing/portal/route.ts for the rationale — keeps email URLs
 * clean and avoids signing-secret rotation headaches.
 */
export default async function BillingPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)]">
      <section className="mx-auto max-w-md px-5 md:px-6 py-20 md:py-28">
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-[var(--color-accent)]/15 to-[var(--color-info)]/15 text-[var(--color-accent)] mb-4">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
          </div>
          <h1 className="text-[24px] md:text-[28px] font-semibold tracking-tight leading-tight text-[var(--color-fg-strong)]">
            Administrar tu suscripción
          </h1>
          <p className="mt-2 text-[13.5px] text-[var(--color-fg-muted)] leading-relaxed">
            Ingresá el email de tu cuenta y te llevamos al portal de Stripe
            para actualizar tu tarjeta, ver facturas o cancelar.
          </p>
        </div>

        <BillingPortalLauncher lang={lang as "es" | "en"} />

        <p className="mt-6 text-center text-[11.5px] text-[var(--color-fg-dim)]">
          Si todavía estás en plan Free, no hay nada que administrar acá —
          el portal aparece cuando upgradees a un plan pago.
        </p>
      </section>
    </main>
  );
}
