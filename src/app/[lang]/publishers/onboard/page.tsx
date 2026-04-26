import type { Metadata } from "next";
import { OnboardForm } from "./OnboardForm";

interface Props { params: Promise<{ lang: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const title =
    lang === "es"
      ? "Publicar conectores · Terminal Sync"
      : "Publish connectors · Terminal Sync";
  const description =
    lang === "es"
      ? "Vendé tus conectores MCP a la red de TerminalSync. 90% para vos. Setup en minutos via Stripe Express."
      : "Sell your MCP connectors to the TerminalSync network. 90% to you. Minutes-long setup via Stripe Express.";
  return { title, description, robots: { index: false } };
}

export default async function PublishersOnboard({ params }: Props) {
  const { lang } = await params;
  const isEs = lang === "es";
  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)]">
      <section className="mx-auto max-w-2xl px-6 pt-24 pb-16">
        <h1 className="text-[36px] md:text-[44px] font-semibold tracking-tight leading-[1.1]">
          {isEs ? "Publicá tu conector" : "Publish your connector"}
        </h1>
        <p className="mt-3 text-[15px] text-[var(--color-fg-muted)] max-w-lg leading-relaxed">
          {isEs
            ? "Cobrás el 90%. Stripe maneja KYC y payouts. Los primeros 50 publishers no pagan comisión durante 6 meses."
            : "You keep 90%. Stripe handles KYC and payouts. The first 50 publishers pay 0% for 6 months."}
        </p>
        <div className="mt-8">
          <OnboardForm lang={lang} />
        </div>
      </section>
    </main>
  );
}
