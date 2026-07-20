import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/content";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ lang: string }>;
}

/**
 * /[lang]/admin — the hub landing. One entry point that lists every admin
 * section instead of leaving them as separate URLs you have to remember.
 */
export default async function AdminHome({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const isEs = lang === "es";

  const cards: { slug: string; title: string; desc: string }[] = [
    {
      slug: "launch-metrics",
      title: isEs ? "Métricas" : "Metrics",
      desc: isEs
        ? "Signups, MRR, welcome flow, outreach y selección de IA (BYOK vs trial vs ninguna)."
        : "Signups, MRR, welcome flow, outreach and AI selection (BYOK vs trial vs none).",
    },
    {
      slug: "trends",
      title: "Trends",
      desc: isEs ? "Tendencias y señales para contenido y pauta." : "Trends and signals for content and ads.",
    },
    {
      slug: "discovery",
      title: "Discovery",
      desc: isEs ? "Creators capturados, revisión y cola de outreach." : "Captured creators, review and outreach queue.",
    },
    {
      slug: "marketplace",
      title: "Marketplace",
      desc: isEs ? "Conectores del catálogo y su estado." : "Catalog connectors and their status.",
    },
    {
      slug: "comp",
      title: "Comp",
      desc: isEs ? "Cuentas Pro/Max de cortesía para influencers." : "Comp Pro/Max accounts for influencers.",
    },
    {
      slug: "mercadopago",
      title: "Mercado Pago",
      desc: isEs ? "Planes y suscripciones de Mercado Pago (COP)." : "Mercado Pago plans and subscriptions (COP).",
    },
    {
      slug: "ops",
      title: "Ops",
      desc: isEs ? "Loops, ejecuciones y acciones automáticas." : "Loops, executions and automated actions.",
    },
  ];

  return (
    <main className="text-[var(--color-fg)]">
      <section className="mx-auto max-w-6xl px-5 md:px-6 py-10">
        <h1 className="text-[26px] font-semibold tracking-tight text-[var(--color-fg-strong)]">
          {isEs ? "Panel de administración" : "Admin dashboard"}
        </h1>
        <p className="text-[13px] text-[var(--color-fg-muted)] mt-1 mb-8">
          {isEs
            ? "Todas las secciones internas en un solo lugar."
            : "Every internal section in one place."}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((c) => (
            <Link
              key={c.slug}
              href={`/${lang}/admin/${c.slug}`}
              className="group rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)]/60 p-5 hover:border-[var(--color-accent)]/40 hover:bg-[var(--color-panel)] transition-colors"
            >
              <p className="text-[15px] font-semibold text-[var(--color-fg-strong)] group-hover:text-[var(--color-accent)] transition-colors">
                {c.title}
              </p>
              <p className="mt-1.5 text-[13px] text-[var(--color-fg-muted)] leading-relaxed">{c.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
