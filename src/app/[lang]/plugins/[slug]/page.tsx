import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Download, Plug, Sparkles } from "lucide-react";
import { getPlugin, listPluginSlugs } from "@/lib/plugins";
import { PluginLogo } from "../Logo";

export const revalidate = 3600;

interface Props {
  params: Promise<{ lang: string; slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await listPluginSlugs();
  return slugs.flatMap((slug) => [
    { lang: "es", slug },
    { lang: "en", slug },
  ]);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const plugin = await getPlugin(lang, slug);
  if (!plugin) return { title: "Plugin not found" };
  const title = `${plugin.name} · TerminalSync Plugin`;
  return {
    title,
    description: plugin.description,
    openGraph: { title, description: plugin.description, type: "article" },
  };
}

export default async function PluginDetail({ params }: Props) {
  const { lang, slug } = await params;
  const isEs = lang === "es";
  const plugin = await getPlugin(lang, slug);
  if (!plugin) notFound();

  const installDeepLink = `terminalsync://install-plugin?id=${plugin.slug}`;

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)]">
      <section className="mx-auto max-w-3xl px-6 pt-24 pb-16">
        <Link
          href={`/${lang}/plugins`}
          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--color-fg-muted)] hover:text-[var(--color-fg-strong)] transition-colors mb-6"
        >
          <ArrowLeft size={14} />
          {isEs ? "Todos los plugins" : "All plugins"}
        </Link>

        <div className="flex items-start gap-5">
          <div className="h-16 w-16 rounded-2xl bg-[var(--color-panel-2)] border border-[var(--color-border)] flex items-center justify-center overflow-hidden shrink-0">
            <PluginLogo src={plugin.logo} size={40} className="h-10 w-10" fallbackText={plugin.name} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-[32px] md:text-[40px] font-semibold tracking-tight leading-[1.05]">
              {plugin.name}
            </h1>
            <p className="mt-2 text-[15px] text-[var(--color-fg-muted)] leading-relaxed">
              {plugin.description}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-mono">
              <span className="rounded bg-[var(--color-panel)] border border-[var(--color-border)] px-2 py-0.5 text-[var(--color-fg-muted)] uppercase tracking-[0.12em]">
                {plugin.category}
              </span>
              <span className="text-[var(--color-fg-dim)]">{isEs ? "por" : "by"} {plugin.author}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href={installDeepLink}
            className="inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-[13px] font-semibold text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] glow-accent transition-all hover:-translate-y-px"
          >
            <Download size={14} strokeWidth={2.4} />
            {isEs ? "Instalar en TerminalSync" : "Install in TerminalSync"}
          </a>
        </div>

        {/* Qué incluye — the composed pieces, the whole point of a Plugin. */}
        <div className="mt-10">
          <h2 className="text-[13px] font-mono uppercase tracking-[0.14em] text-[var(--color-fg-dim)] mb-3">
            {isEs ? "Qué incluye" : "What's inside"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {plugin.connector && (
              <PieceCard
                lang={lang}
                href={`/${lang}/connectors/${plugin.connector.slug}`}
                logo={plugin.connector.logo}
                name={plugin.connector.name}
                kind={isEs ? "Conector" : "Connector"}
                icon="connector"
              />
            )}
            {plugin.skills.map((s) => (
              <PieceCard
                key={s.slug}
                lang={lang}
                href={`/${lang}/skills/${s.slug}`}
                logo={s.logo}
                name={s.name}
                kind={isEs ? "Skill" : "Skill"}
                icon="skill"
              />
            ))}
          </div>
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
          dangerouslySetInnerHTML={{ __html: plugin.bodyHtml }}
        />
      </section>
    </main>
  );
}

function PieceCard({
  lang,
  href,
  logo,
  name,
  kind,
  icon,
}: {
  lang: string;
  href: string;
  logo: string;
  name: string;
  kind: string;
  icon: "connector" | "skill";
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4 transition-all hover:border-[var(--color-accent)]/40"
    >
      <div className="h-10 w-10 rounded-xl bg-[var(--color-panel-2)] border border-[var(--color-border)] flex items-center justify-center overflow-hidden shrink-0">
        <PluginLogo src={logo} size={24} className="h-6 w-6" fallbackText={name} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--color-fg-dim)]">
          {icon === "connector" ? <Plug size={10} /> : <Sparkles size={10} />}
          {kind}
        </div>
        <div className="text-[14px] font-semibold tracking-tight truncate">{name}</div>
      </div>
      <ArrowUpRight size={15} className="text-[var(--color-fg-dim)] group-hover:text-[var(--color-accent)] transition-colors shrink-0" />
    </Link>
  );
}
