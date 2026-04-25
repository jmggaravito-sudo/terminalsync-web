import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/content";
import { verifyToken } from "@/lib/signedTokens";
import { UnsubscribeForm } from "./UnsubscribeForm";

export const metadata: Metadata = {
  title: "Cancelar suscripción de emails · Terminal Sync",
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ t?: string }>;
}

/**
 * Email-marketing unsubscribe landing. Reachable from the footer of every
 * transactional email via an HMAC-signed token (so visitors can't unsub
 * other people by guessing emails).
 *
 * We don't auto-unsub on GET — Gmail / Outlook prefetch links and that
 * would cause silent unsubscribes. The page renders a confirm button
 * that POSTs to /api/unsubscribe with the same token.
 */
export default async function UnsubscribePage({ params, searchParams }: Props) {
  const { lang } = await params;
  const { t } = await searchParams;
  if (!isLocale(lang)) notFound();

  const email = verifyToken(t, "unsubscribe");

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
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <h1 className="text-[24px] md:text-[28px] font-semibold tracking-tight leading-tight text-[var(--color-fg-strong)]">
            Cancelar emails de marketing
          </h1>
          {email ? (
            <p className="mt-2 text-[13.5px] text-[var(--color-fg-muted)] leading-relaxed">
              Vas a dejar de recibir novedades, tips y promos en{" "}
              <span className="text-[var(--color-fg-strong)] font-medium">
                {email}
              </span>
              . Los emails de tu cuenta (recibos, alertas de pago) siguen
              llegando porque son necesarios.
            </p>
          ) : (
            <p className="mt-2 text-[13.5px] text-[var(--color-fg-muted)] leading-relaxed">
              Este link no es válido o expiró. Si querés cancelar tus emails,
              respondé a cualquiera de nuestros mensajes con la palabra{" "}
              <span className="font-mono text-[var(--color-fg-strong)]">
                BAJA
              </span>{" "}
              y lo hacemos a mano.
            </p>
          )}
        </div>

        {email ? <UnsubscribeForm email={email} token={t ?? ""} /> : null}

        <p className="mt-6 text-center text-[11.5px] text-[var(--color-fg-dim)]">
          Cumplimos con CAN-SPAM + RFC 8058. Tu baja se procesa al instante.
        </p>
      </section>
    </main>
  );
}
