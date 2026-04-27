import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSkill, listSkillSlugs } from "@/lib/skills";
import { SkillLogo } from "../Logo";
import { InstallOptions } from "@/components/marketplace/InstallOptions";

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

  // Skills install into ~/.claude/skills/<slug>/SKILL.md (and the codex twin).
  // The InstallOptions component handles both the recommended (TerminalSync
  // deep-link) and manual (download SKILL.md) paths.
  const skillInstallPath = `~/.claude/skills/${skill.slug}/SKILL.md`;

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)]">
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
              <span className="text-[var(--color-fg-dim)]">
                {isEs ? "por" : "by"} {skill.author}
              </span>
            </div>
          </div>
        </div>

        <article
          className="prose prose-invert mt-10 max-w-none text-[14.5px] leading-[1.7]
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

        <InstallOptions
          lang={lang}
          kind="skill"
          slug={skill.slug}
          name={skill.name}
          installPath={skillInstallPath}
        />
      </section>
    </main>
  );
}
