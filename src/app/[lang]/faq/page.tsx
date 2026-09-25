import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/content";
import { getPublicFaq, type FaqCategory } from "@/content/faq";
import { Footer } from "@/components/landing/Footer";

interface Props {
  params: Promise<{ lang: string }>;
}

const CATEGORY_LABELS: Record<"es" | "en", Record<FaqCategory, string>> = {
  es: {
    getting_started: "Primeros pasos",
    sync: "Sincronización",
    workspaces_sync: "Espacios y continuidad",
    context: "Contexto y memoria",
    privacy: "Privacidad",
    workspaces: "Espacios de trabajo",
    catalog: "Catálogo",
    integrations: "Integraciones",
    plans_billing: "Planes y facturación",
    platforms: "Plataformas",
    support: "Ayuda y soporte",
  },
  en: {
    getting_started: "Getting started",
    sync: "Sync",
    workspaces_sync: "Workspaces and continuity",
    context: "Context and memory",
    privacy: "Privacy",
    workspaces: "Workspaces",
    catalog: "Catalog",
    integrations: "Integrations",
    plans_billing: "Plans and billing",
    platforms: "Platforms",
    support: "Help and support",
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return {
    title: lang === "es" ? "Preguntas frecuentes | TerminalSync" : "FAQ | TerminalSync",
    description:
      lang === "es"
        ? "Respuestas sobre espacios de trabajo, Contexto, sincronización, privacidad e integraciones de TerminalSync."
        : "Answers about TerminalSync workspaces, Context, sync, privacy, and integrations.",
  };
}

export default async function FaqPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = getDict(lang);
  const items = getPublicFaq(lang);
  const grouped = items.reduce<Map<FaqCategory, typeof items>>((groups, item) => {
    const current = groups.get(item.category) ?? [];
    groups.set(item.category, [...current, item]);
    return groups;
  }, new Map());
  const faqJson = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <>
      <script type="application/ld+json">{JSON.stringify(faqJson)}</script>
      <section className="mx-auto max-w-4xl px-5 md:px-6 py-16 md:py-24">
        <div className="max-w-2xl">
          <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--color-fg-muted)]">
            {lang === "es" ? "Preguntas frecuentes" : "Frequently asked"}
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--color-fg-strong)]">
            {lang === "es" ? "Respuestas claras para empezar" : "Clear answers to get started"}
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-[var(--color-fg-muted)]">
            {lang === "es"
              ? "Consulta lo esencial sobre tu trabajo, Contexto, privacidad e integraciones."
              : "Find the essentials about your work, Context, privacy, and integrations."}
          </p>
        </div>

        <div className="mt-12 space-y-12">
          {[...grouped.entries()].map(([category, categoryItems]) => (
            <section key={category} aria-labelledby={`faq-${category}`}>
              <h2
                id={`faq-${category}`}
                className="text-xl font-semibold text-[var(--color-fg-strong)]"
              >
                {CATEGORY_LABELS[lang][category]}
              </h2>
              <div className="mt-4 space-y-3">
                {categoryItems.map((item) => (
                  <details
                    key={item.id}
                    className="group rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5"
                  >
                    <summary className="cursor-pointer list-none pr-6 font-semibold text-[var(--color-fg-strong)] marker:hidden">
                      {item.question}
                    </summary>
                    <p className="mt-3 text-[14px] leading-relaxed text-[var(--color-fg-muted)]">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
      <Footer dict={dict} />
    </>
  );
}
