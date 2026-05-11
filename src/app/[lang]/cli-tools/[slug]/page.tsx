import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";
import { getCliTool, listCliToolSlugs } from "@/lib/cliTools";
import { CliToolLogo } from "../Logo";

export const revalidate = 3600;

interface Props {
  params: Promise<{ lang: string; slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await listCliToolSlugs();
  return slugs.flatMap((slug) => [
    { lang: "es", slug },
    { lang: "en", slug },
  ]);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const tool = await getCliTool(lang, slug);
  if (!tool) return { title: "CLI tool not found" };
  const title = `${tool.name} · TerminalSync CLI Tool`;
  return {
    title,
    description: tool.description,
    openGraph: { title, description: tool.description, type: "article" },
  };
}

export default async function CliToolDetail({ params }: Props) {
  const { lang, slug } = await params;
  const isEs = lang === "es";
  const tool = await getCliTool(lang, slug);
  if (!tool) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.description,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "macOS, Windows, Linux",
    author: { "@type": "Organization", name: tool.vendor },
    url: `https://terminalsync.ai/${lang}/cli-tools/${tool.slug}`,
    image: `https://terminalsync.ai/${lang}/cli-tools/${tool.slug}/opengraph-image`,
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
      <section className="mx-auto max-w-3xl px-6 pt-24 pb-16">
        <Link
          href={`/${lang}/cli-tools`}
          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--color-fg-muted)] hover:text-[var(--color-fg-strong)] transition-colors mb-6"
        >
          <ArrowLeft size={14} />
          {isEs ? "Todos los CLIs" : "All CLIs"}
        </Link>

        <div className="flex items-start gap-5">
          <div className="h-16 w-16 rounded-2xl bg-[var(--color-panel-2)] border border-[var(--color-border)] flex items-center justify-center overflow-hidden shrink-0">
            <CliToolLogo src={tool.logo} size={40} className="h-10 w-10" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-[32px] md:text-[40px] font-semibold tracking-tight leading-[1.05]">
              {tool.name}
            </h1>
            <p className="mt-2 text-[15px] text-[var(--color-fg-muted)] leading-relaxed">
              {tool.description}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-mono">
              <span className="rounded bg-[var(--color-panel)] border border-[var(--color-border)] px-2 py-0.5 text-[var(--color-fg-muted)] uppercase tracking-[0.12em]">
                {tool.category}
              </span>
              <span className="rounded bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/20 px-2 py-0.5 uppercase tracking-[0.12em]">
                $ {tool.binary}
              </span>
              <span className="text-[var(--color-fg-dim)]">
                {isEs ? "por" : "by"} {tool.vendor}
              </span>
            </div>
          </div>
        </div>

        {/* Install + auth commands as copyable code blocks */}
        <div className="mt-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5 space-y-3">
          <div>
            <div className="text-[10.5px] font-mono uppercase tracking-[0.14em] text-[var(--color-fg-dim)] mb-1.5">
              {isEs ? "Instalar" : "Install"}
            </div>
            <code className="block rounded-md bg-[var(--color-bg)] border border-[var(--color-border)] px-3 py-2 text-[13px] font-mono text-[var(--color-fg)] overflow-x-auto">
              {tool.installCommand}
            </code>
          </div>
          {tool.authCommand && (
            <div>
              <div className="text-[10.5px] font-mono uppercase tracking-[0.14em] text-[var(--color-fg-dim)] mb-1.5">
                {isEs ? "Autenticar" : "Authenticate"}
              </div>
              <code className="block rounded-md bg-[var(--color-bg)] border border-[var(--color-border)] px-3 py-2 text-[13px] font-mono text-[var(--color-fg)] overflow-x-auto">
                {tool.authCommand}
              </code>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {tool.homepage && (
            <a
              href={tool.homepage}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-[13px] font-semibold text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] glow-accent transition-all hover:-translate-y-px"
            >
              <ExternalLink size={14} strokeWidth={2.4} />
              {isEs ? "Docs oficiales" : "Official docs"}
            </a>
          )}
          {tool.repo && (
            <a
              href={tool.repo}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--color-fg-muted)] hover:text-[var(--color-fg-strong)] transition-colors"
            >
              <Github size={13} />
              {isEs ? "Código fuente" : "Source"}
            </a>
          )}
        </div>

        <article
          className="prose prose-invert mt-12 max-w-none text-[14.5px] leading-[1.7]
            prose-headings:font-semibold prose-headings:tracking-tight
            prose-h2:text-[20px] prose-h2:mt-10 prose-h2:mb-3
            prose-h3:text-[16px] prose-h3:mt-6 prose-h3:mb-2
            prose-p:text-[var(--color-fg-muted)]
            prose-li:text-[var(--color-fg-muted)] prose-li:my-1
            prose-strong:text-[var(--color-fg-strong)]
            prose-code:text-[var(--color-accent)] prose-code:bg-[var(--color-panel)]
            prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-[12.5px]
            prose-code:before:content-none prose-code:after:content-none"
          dangerouslySetInnerHTML={{ __html: tool.bodyHtml }}
        />

        <div className="mt-14 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5 text-[13px] text-[var(--color-fg-muted)] leading-relaxed">
          {isEs ? (
            <>
              <strong className="text-[var(--color-fg-strong)]">¿Cómo funciona la sincronización?</strong>{" "}
              Hoy TerminalSync sincroniza tu sesión de GitHub CLI con un flujo dedicado
              de Auth Sync. Para los demás CLIs, esta página te da instalación,
              login y comandos recomendados; los secretos de proyecto que terminen en
              archivos <code>.env</code> pueden viajar por el vault cifrado de la carpeta.
              La sincronización automática de auth por cada CLI es una capa futura.
            </>
          ) : (
            <>
              <strong className="text-[var(--color-fg-strong)]">How does sync work?</strong>{" "}
              Today TerminalSync syncs GitHub CLI through a dedicated Auth Sync flow.
              For the other CLIs, this page gives you install, login and recommended
              commands; project secrets that land in <code>.env</code> files can travel
              through the folder's encrypted vault. Automatic per-CLI auth sync is a
              future layer.
            </>
          )}
        </div>
      </section>
    </main>
  );
}
