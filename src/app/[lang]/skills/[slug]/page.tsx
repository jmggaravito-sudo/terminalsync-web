import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import { getSkill, listSkillSlugs } from "@/lib/skills";
import { SkillLogo } from "../Logo";

export const revalidate = 3600;

interface Props {
  params: Promise<{ lang: string; slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await listSkillSlugs();
  // Render both langs for each skill — matches the connectors pattern.
  return slugs.flatMap((slug) => [
    { lang: "es", slug },
    { lang: "en", slug },
  ]);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const skill = await getSkill(lang, slug);
  if (!skill) return { title: "Skill not found" };
  const title = `${skill.name} · TerminalSync Skill`;
  return {
    title,
    description: skill.description,
    openGraph: { title, description: skill.description, type: "article" },
  };
}

export default async function SkillDetail({ params }: Props) {
  const { lang, slug } = await params;
  const isEs = lang === "es";
  const skill = await getSkill(lang, slug);
  if (!skill) notFound();

  const installPayload = Buffer.from(
    JSON.stringify({
      vendors: skill.vendors,
      name: skill.slug,
      files: {
        "SKILL.md": Buffer.from(skill.rawMarkdown, "utf8").toString("base64"),
      },
    }),
    "utf8",
  ).toString("base64");
  const installDeepLink =
    `terminalsync://install?type=skill&slug=${encodeURIComponent(skill.slug)}` +
    `&payload=${encodeURIComponent(installPayload)}`;

  // Schema.org SoftwareApplication so Google rich-snippets can surface
  // the skill name + tagline + author in search results. SoftwareApplication
  // is the closest fit (vs Article) since users perceive skills as
  // installable products. Free skills get offer.price = 0.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: skill.name,
    description: skill.description,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "macOS, Windows, Linux",
    author: { "@type": "Organization", name: skill.author },
    url: `https://terminalsync.ai/${lang}/skills/${skill.slug}`,
    image: `https://terminalsync.ai/${lang}/skills/${skill.slug}/opengraph-image`,
    softwareRequirements: skill.vendors
      .map((v) => (v === "claude" ? "Claude Code" : "OpenAI Codex"))
      .join(", "),
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
          href={`/${lang}/skills`}
          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--color-fg-muted)] hover:text-[var(--color-fg-strong)] transition-colors mb-6"
        >
          <ArrowLeft size={14} />
          {isEs ? "Todos los skills" : "All skills"}
        </Link>

        <div className="flex items-start gap-5">
          <div className="h-16 w-16 rounded-2xl bg-[var(--color-panel-2)] border border-[var(--color-border)] flex items-center justify-center overflow-hidden shrink-0">
            <SkillLogo src={skill.logo} size={40} className="h-10 w-10" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-[32px] md:text-[40px] font-semibold tracking-tight leading-[1.05]">
              {skill.name}
            </h1>
            <p className="mt-2 text-[15px] text-[var(--color-fg-muted)] leading-relaxed">
              {skill.description}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-mono">
              <span className="rounded bg-[var(--color-panel)] border border-[var(--color-border)] px-2 py-0.5 text-[var(--color-fg-muted)] uppercase tracking-[0.12em]">
                {skill.category}
              </span>
              {skill.vendors.map((v) => (
                <span
                  key={v}
                  className="rounded bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/20 px-2 py-0.5 uppercase tracking-[0.12em]"
                >
                  {v}
                </span>
              ))}
              <span className="text-[var(--color-fg-dim)]">{isEs ? "por" : "by"} {skill.author}</span>
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
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--color-fg-muted)] hover:text-[var(--color-fg-strong)] transition-colors"
            data-share-skill={skill.slug}
          >
            <Share2 size={13} />
            {isEs ? "Compartir" : "Share"}
          </button>
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
          dangerouslySetInnerHTML={{ __html: skill.bodyHtml }}
        />

        <div className="mt-14 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5 text-[13px] text-[var(--color-fg-muted)] leading-relaxed">
          {isEs ? (
            <>
              <strong className="text-[var(--color-fg-strong)]">¿Cómo funciona la instalación?</strong> El botón de arriba abre TerminalSync (la app desktop) y baja el <code>SKILL.md</code> a <code>~/.claude/skills/{skill.slug}/</code>. Si tenés Codex, también lo escribe en <code>~/.codex/skills/{skill.slug}/</code>. Skills Sync lo replica en todas tus máquinas automáticamente.
            </>
          ) : (
            <>
              <strong className="text-[var(--color-fg-strong)]">How does the install work?</strong> The button above opens TerminalSync (the desktop app) and downloads <code>SKILL.md</code> into <code>~/.claude/skills/{skill.slug}/</code>. If you have Codex, it also writes to <code>~/.codex/skills/{skill.slug}/</code>. Skills Sync replicates it across every machine automatically.
            </>
          )}
        </div>
      </section>
    </main>
  );
}
