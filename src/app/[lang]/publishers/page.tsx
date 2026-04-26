import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, ArrowRight, HandCoins, Globe2, ShieldCheck, Zap } from "lucide-react";

interface Props { params: Promise<{ lang: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const isEs = lang === "es";
  const title = isEs
    ? "Publicá tu conector MCP · Terminal Sync"
    : "Publish your MCP connector · Terminal Sync";
  const description = isEs
    ? "Vendé conectores MCP a la red de TerminalSync. 90% para vos. Stripe Express maneja KYC y payouts. Los primeros 50 publishers no pagan comisión durante 6 meses."
    : "Sell MCP connectors to the TerminalSync network. You keep 90%. Stripe Express handles KYC and payouts. The first 50 publishers pay 0% for 6 months.";
  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    alternates: {
      languages: {
        es: "/es/publishers",
        en: "/en/publishers",
        "x-default": "/en/publishers",
      },
    },
  };
}

export default async function PublishersLanding({ params }: Props) {
  const { lang } = await params;
  const isEs = lang === "es";

  const perks = [
    {
      Icon: HandCoins,
      title: isEs ? "Cobrás el 90%" : "You keep 90%",
      body: isEs
        ? "Comisión TS del 10%. Los primeros 50 publishers entran con 0% durante 6 meses."
        : "TS fee is 10%. First 50 publishers join at 0% for 6 months.",
    },
    {
      Icon: Globe2,
      title: isEs ? "Sync multi-máquina" : "Multi-machine sync",
      body: isEs
        ? "Tu conector se instala una vez y aparece en todas las máquinas del usuario. Diferencial real de TerminalSync."
        : "Your connector installs once and appears on every machine the user owns. TerminalSync's real moat.",
    },
    {
      Icon: ShieldCheck,
      title: isEs ? "Stripe Express, sin KYC tuyo" : "Stripe Express, no KYC on you",
      body: isEs
        ? "Onboarding hosteado. Stripe verifica identidad, emite 1099s y paga directo a tu cuenta."
        : "Hosted onboarding. Stripe handles ID verification, 1099s, and pays you directly.",
    },
    {
      Icon: Zap,
      title: isEs ? "Distribución desde día 1" : "Distribution from day 1",
      body: isEs
        ? "Tu listing aparece en /connectors apenas lo aprobamos (SLA 48h)."
        : "Your listing appears in /connectors as soon as we approve it (48h SLA).",
    },
  ];

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)]">
      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 pt-24 pb-12">
        <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--color-accent)] mb-4">
          <Sparkles size={14} />
          <span>{isEs ? "Para creators" : "For creators"}</span>
        </div>
        <h1 className="text-[40px] md:text-[56px] font-semibold tracking-tight leading-[1.05]">
          {isEs ? "Tu conector MCP, distribuido en TerminalSync." : "Your MCP connector, distributed on TerminalSync."}
        </h1>
        <p className="mt-4 text-[16px] text-[var(--color-fg-muted)] max-w-2xl leading-relaxed">
          {isEs
            ? "Construyes algo útil para Claude Code, Codex o cualquier cliente MCP. Lo subís acá. Lo cobrás. Nosotros nos encargamos del resto: KYC, payouts, sync multi-máquina y manejo de secrets en el Keychain del usuario."
            : "You build something useful for Claude Code, Codex, or any MCP client. You ship it here. You charge for it. We handle the rest: KYC, payouts, multi-machine sync, and secret management in the user's Keychain."}
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Link
            href={`/${lang}/publishers/onboard`}
            className="inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-[13px] font-semibold text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] glow-accent transition-all hover:-translate-y-px"
          >
            {isEs ? "Empezar onboarding" : "Start onboarding"}
            <ArrowRight size={14} strokeWidth={2.4} />
          </Link>
          <a
            href="mailto:partners@terminalsync.ai?subject=Publisher%20question"
            className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--color-fg-muted)] hover:text-[var(--color-fg-strong)] transition-colors"
          >
            {isEs ? "Tengo preguntas" : "I have questions"}
          </a>
        </div>
      </section>

      {/* Founding-publishers banner */}
      <section className="mx-auto max-w-5xl px-6 pb-12">
        <div className="rounded-2xl border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 p-5 md:p-6">
          <div className="flex items-start gap-3">
            <Sparkles size={18} className="text-[var(--color-accent)] mt-0.5 shrink-0" />
            <div>
              <p className="text-[13px] font-semibold tracking-tight text-[var(--color-fg-strong)]">
                {isEs ? "Founding publishers — 0% comisión durante 6 meses" : "Founding publishers — 0% fee for 6 months"}
              </p>
              <p className="mt-1 text-[12.5px] text-[var(--color-fg-muted)] leading-relaxed">
                {isEs
                  ? "Los primeros 50 publishers aprobados se quedan con el 100% de cada venta los primeros 6 meses desde su aprobación. Después pasa al 10% estándar."
                  : "The first 50 approved publishers keep 100% of every sale for 6 months from approval. After that, the standard 10% fee kicks in."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Perks grid */}
      <section className="mx-auto max-w-5xl px-6 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {perks.map(({ Icon, title, body }) => (
            <div
              key={title}
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5"
            >
              <div className="h-9 w-9 rounded-xl bg-[var(--color-accent)]/10 text-[var(--color-accent)] flex items-center justify-center">
                <Icon size={18} strokeWidth={2.2} />
              </div>
              <h3 className="mt-3 text-[15px] font-semibold tracking-tight text-[var(--color-fg-strong)]">
                {title}
              </h3>
              <p className="mt-1.5 text-[13px] text-[var(--color-fg-muted)] leading-relaxed">
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-5xl px-6 pb-16">
        <h2 className="text-[24px] md:text-[28px] font-semibold tracking-tight">
          {isEs ? "Cómo funciona" : "How it works"}
        </h2>
        <ol className="mt-6 space-y-4">
          {[
            isEs ? "Hacés onboarding (incluye Stripe Express, ~5 min)." : "You onboard (includes Stripe Express, ~5 min).",
            isEs ? "Subís tu conector: nombre, descripción, manifest MCP, precio (gratis o $5–$29)." : "Submit your connector: name, description, MCP manifest, price (free or $5–$29).",
            isEs ? "Lo revisamos en ≤48h. Si aprobamos, va al catálogo de /connectors." : "We review in ≤48h. If approved, it lands in the /connectors catalog.",
            isEs ? "Cuando alguien lo compra, Stripe te transfiere directo (menos comisión)." : "When someone buys it, Stripe transfers funds straight to you (minus fee).",
            isEs ? "El cliente Tauri sincroniza el conector en todas sus máquinas automáticamente." : "The Tauri client syncs the connector across all their machines automatically.",
          ].map((step, i) => (
            <li
              key={i}
              className="flex gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4"
            >
              <span className="text-[12px] font-mono text-[var(--color-accent)] font-semibold shrink-0 w-6">{(i + 1).toString().padStart(2, "0")}</span>
              <span className="text-[13.5px] text-[var(--color-fg-muted)] leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-5xl px-6 pb-32">
        <div className="rounded-3xl border border-[var(--color-accent)]/25 bg-gradient-to-br from-[var(--color-accent)]/8 via-[var(--color-info)]/6 to-transparent p-8 md:p-10 text-center">
          <h2 className="text-[24px] md:text-[28px] font-semibold tracking-tight">
            {isEs ? "Listo para publicar?" : "Ready to publish?"}
          </h2>
          <p className="mt-2 text-[14px] text-[var(--color-fg-muted)] max-w-xl mx-auto">
            {isEs
              ? "Onboarding hoy, primer venta esta semana."
              : "Onboard today, first sale this week."}
          </p>
          <div className="mt-5 flex justify-center">
            <Link
              href={`/${lang}/publishers/onboard`}
              className="inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-[13px] font-semibold text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] glow-accent transition-all hover:-translate-y-px"
            >
              {isEs ? "Empezar onboarding" : "Start onboarding"}
              <ArrowRight size={14} strokeWidth={2.4} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
