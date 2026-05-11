import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { getConnector, listSlugs } from "@/lib/connectors";
import { ConnectorDualView } from "./DualView";
import { ConnectorLogo } from "../Logo";

export const revalidate = 3600;
// First-party slugs prerender at build; marketplace slugs render on-demand
// and are cached by the revalidate above. Default behavior already allows
// this, declared explicitly so the intent is obvious to the next reader.
export const dynamicParams = true;

interface Props {
  params: Promise<{ lang: string; slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await listSlugs();
  return slugs.flatMap((slug) =>
    ["en", "es"].map((lang) => ({ lang, slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const doc = await getConnector(lang, slug);
  if (!doc) return { title: "Connector not found" };
  const title = `${doc.name} · Terminal Sync Connectors`;
  return {
    title,
    description: doc.simpleSubtitle,
    openGraph: {
      title,
      description: doc.simpleSubtitle,
      images: [doc.logo],
    },
  };
}

export default async function ConnectorDetail({ params }: Props) {
  const { lang, slug } = await params;
  const doc = await getConnector(lang, slug);
  if (!doc) notFound();

  const t = {
    back: lang === "es" ? "Conectores" : "Connectors",
    simple: lang === "es" ? "Vista simple" : "Simple view",
    dev: lang === "es" ? "Vista dev" : "Developer view",
    ctaAffiliate:
      lang === "es" ? `Empezar con ${doc.name}` : `Get started with ${doc.name}`,
    ctaFree:
      lang === "es" ? `Abrir ${doc.name}` : `Open ${doc.name}`,
    ctaInstall:
      lang === "es" ? "Agregar a Terminal Sync" : "Add to Terminal Sync",
    ctaInstallSub:
      lang === "es"
        ? "Abrimos la app y lo dejamos listo en Claude Code y tus otras computadoras."
        : "We open the app and set it up in Claude Code (and your other Macs).",
    ctaSecondary:
      lang === "es" ? `Ver ${doc.name}` : `View ${doc.name}`,
    noApp:
      lang === "es"
        ? "¿No tenés Terminal Sync todavía?"
        : "Don't have Terminal Sync yet?",
    download: lang === "es" ? "Descargar" : "Download",
    affiliateNote:
      lang === "es"
        ? "Si te registrás por este link nos ayudás a mantener Terminal Sync sin cobrar más."
        : "Signing up through this link helps us keep Terminal Sync running without raising prices.",
    soon: lang === "es" ? "Próximamente" : "Coming soon",
    soonBody:
      lang === "es"
        ? "Este conector está en beta privada. Suscribite a la lista de espera desde el dashboard."
        : "This connector is in private beta. Join the waitlist from the dashboard.",
    howItWorks:
      lang === "es" ? "Cómo funciona con Terminal Sync" : "How it works with Terminal Sync",
    howItWorksBody:
      lang === "es"
        ? "Configurá el conector una vez en una máquina. Terminal Sync sincroniza tu claude_desktop_config.json cifrado en tu Drive, así que en cualquier otra máquina donde abras Claude Code, el conector ya está listo."
        : "Set up the connector once on one machine. Terminal Sync keeps your claude_desktop_config.json encrypted in your Drive, so on any other machine where you open Claude Code, the connector is already there.",
  };

  // Deep link into the desktop app. The app registers the `terminalsync://`
  // scheme and routes `/install/connector?slug=...` to its install modal.
  const deepLink = `terminalsync://install/connector?slug=${encodeURIComponent(
    doc.slug,
  )}`;

  // Schema.org SoftwareApplication for rich snippets in Google. Affiliate-
  // only listings still price as 0 (the user pays the upstream SaaS, not us).
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: doc.name,
    description: doc.tagline,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "macOS, Windows, Linux",
    author: { "@type": "Organization", name: "Terminal Sync" },
    url: `https://terminalsync.ai/${lang}/connectors/${doc.slug}`,
    image: `https://terminalsync.ai/${lang}/connectors/${doc.slug}/opengraph-image`,
    softwareRequirements: "Claude Code, Claude Desktop, or OpenAI Codex",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="mx-auto max-w-3xl px-6 pt-20 pb-10">
        <Link
          href={`/${lang}/connectors`}
          className="inline-flex items-center gap-1.5 text-[12.5px] text-[var(--color-fg-muted)] hover:text-[var(--color-accent)] transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          {t.back}
        </Link>

        <header className="flex items-start gap-5">
          <div className="h-16 w-16 shrink-0 rounded-2xl bg-[var(--color-panel)] border border-[var(--color-border)] flex items-center justify-center overflow-hidden">
            <ConnectorLogo src={doc.logo} size={40} className="h-10 w-10" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-[28px] md:text-[34px] font-semibold tracking-tight leading-tight">
              {doc.name}
            </h1>
            <p className="mt-1 text-[14px] text-[var(--color-fg-muted)]">
              {doc.tagline}
            </p>
          </div>
        </header>

        <ConnectorDualView
          labels={{ simple: t.simple, dev: t.dev }}
          simple={{
            title: doc.simpleTitle,
            subtitle: doc.simpleSubtitle,
            html: doc.simpleHtml,
          }}
          dev={{
            title: doc.devTitle,
            subtitle: doc.devSubtitle,
            html: doc.devHtml,
          }}
        />

        {/* CTA */}
        <div className="mt-10 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-6">
          {doc.status === "soon" ? (
            <div>
              <div className="inline-flex items-center gap-1.5 text-[10.5px] font-mono uppercase tracking-[0.15em] text-[var(--color-accent)] border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 rounded-full px-2.5 py-1">
                {t.soon}
              </div>
              <p className="mt-4 text-[14px] text-[var(--color-fg-muted)]">
                {t.soonBody}
              </p>
            </div>
          ) : doc.hasManifest ? (
            // Installable connector — primary action is the deep link into
            // the desktop app. SaaS link stays as a low-key secondary so
            // affiliate revenue still flows when relevant.
            <>
              <a
                href={deepLink}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] text-white px-5 py-3 text-[14px] font-semibold transition-colors"
              >
                {t.ctaInstall}
              </a>
              <p className="mt-2 text-[12px] text-[var(--color-fg-muted)]">
                {t.ctaInstallSub}
              </p>
              {doc.ctaUrl && (
                <div className="mt-4 flex items-center gap-4 text-[12.5px]">
                  <a
                    href={doc.ctaUrl}
                    target="_blank"
                    rel={doc.affiliate ? "sponsored noopener" : "noopener"}
                    className="text-[var(--color-fg-muted)] hover:text-[var(--color-accent)] transition-colors underline underline-offset-2"
                  >
                    {t.ctaSecondary} →
                  </a>
                </div>
              )}
              {doc.affiliate && doc.ctaUrl && (
                <p className="mt-3 text-[11.5px] text-[var(--color-fg-dim)]">
                  ↳ {t.affiliateNote}
                </p>
              )}
              <div className="mt-5 pt-4 border-t border-[var(--color-border)] flex items-center gap-2 text-[11.5px] text-[var(--color-fg-dim)]">
                <span>{t.noApp}</span>
                <Link
                  href={`/${lang}`}
                  className="text-[var(--color-accent)] hover:underline"
                >
                  {t.download} →
                </Link>
              </div>
            </>
          ) : (
            // Affiliate-only connector — no MCP server to install. Keep the
            // old behavior: single external CTA.
            <>
              <a
                href={doc.ctaUrl}
                target="_blank"
                rel={doc.affiliate ? "sponsored noopener" : "noopener"}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] text-white px-5 py-3 text-[14px] font-semibold transition-colors"
              >
                {doc.affiliate ? t.ctaAffiliate : t.ctaFree}
              </a>
              {doc.affiliate && (
                <p className="mt-3 text-[11.5px] text-[var(--color-fg-dim)]">
                  ↳ {t.affiliateNote}
                </p>
              )}
            </>
          )}
        </div>

        {/* How it works footer — explain the moat */}
        <div className="mt-6 rounded-2xl border border-[var(--color-border)]/50 bg-[var(--color-panel)]/50 p-5">
          <div className="flex items-start gap-3">
            <div className="h-7 w-7 rounded-lg bg-[var(--color-ok)]/10 text-[var(--color-ok)] flex items-center justify-center shrink-0 mt-0.5">
              <Check size={14} strokeWidth={3} />
            </div>
            <div>
              <h3 className="text-[13px] font-semibold tracking-tight">
                {t.howItWorks}
              </h3>
              <p className="mt-1 text-[12.5px] text-[var(--color-fg-muted)] leading-relaxed">
                {t.howItWorksBody}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
