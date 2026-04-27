import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { getConnector, listSlugs } from "@/lib/connectors";
import { ConnectorDualView } from "./DualView";
import { ConnectorLogo } from "../Logo";
import { InstallOptions } from "@/components/marketplace/InstallOptions";
import { connectorJsonLd } from "@/lib/jsonld";

export const revalidate = 3600;

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

  const ldJson = connectorJsonLd(doc, lang);

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
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

        {/* Dual-install — only renders when the connector ships a manifest.
            Affiliate-only landings (no hosted MCP) skip this and fall straight
            through to the legacy CTA below. */}
        {doc.manifest && doc.status === "available" && (
          <InstallOptions
            lang={lang}
            kind="connector"
            slug={doc.slug}
            name={doc.name}
            installPath="~/Library/Application Support/Claude/claude_desktop_config.json"
            manifest={doc.manifest}
            hasSecrets={hasSecretPlaceholders(doc.manifest)}
          />
        )}

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
          ) : (
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

/** Returns true if the manifest's env contains any ${SECRET:...} placeholder.
 *  Drives the "API key in plaintext" warning in the manual install UI — only
 *  shown when there's actually a sensitive value the user has to substitute. */
function hasSecretPlaceholders(manifest: Record<string, unknown>): boolean {
  const env = manifest.env;
  if (!env || typeof env !== "object" || Array.isArray(env)) return false;
  return Object.values(env as Record<string, unknown>).some(
    (v) => typeof v === "string" && /\$\{SECRET:/.test(v),
  );
}
