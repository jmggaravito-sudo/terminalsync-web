import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Plug, Sparkles, Zap } from "lucide-react";
import { listAllConnectors, type ConnectorMeta } from "@/lib/connectors";
import { listSkills, type SkillMeta } from "@/lib/skills";
import { ConnectorLogo } from "@/app/[lang]/connectors/Logo";
import { SkillLogo } from "@/app/[lang]/skills/Logo";
import { MarketplaceAppBanner } from "@/components/marketplace/AppBanner";

export const revalidate = 3600;

interface Props {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const isEs = lang === "es";
  const title = isEs
    ? "Marketplace · Terminal Sync"
    : "Marketplace · Terminal Sync";
  const description = isEs
    ? "Connectors y Skills para Claude Code y Codex. Una sola instalación, sincronizada en todas tus máquinas."
    : "Connectors and Skills for Claude Code and Codex. One install, synced across every machine.";
  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
  };
}

export default async function MarketplaceHub({ params }: Props) {
  const { lang } = await params;
  const isEs = lang === "es";
  const [connectors, skills] = await Promise.all([
    listAllConnectors(lang),
    listSkills(lang),
  ]);

  const featuredConnectors = connectors.slice(0, 3);
  const featuredSkills = skills.slice(0, 3);

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)]">
      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 pt-24 pb-12">
        <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--color-accent)] mb-4">
          <Sparkles size={14} />
          <span>{isEs ? "Marketplace" : "Marketplace"}</span>
        </div>
        <h1 className="text-[40px] md:text-[56px] font-semibold tracking-tight leading-[1.05]">
          {isEs
            ? "Todo lo que extiende a tu IA, en un solo lugar."
            : "Everything that extends your AI, in one place."}
        </h1>
        <p className="mt-4 text-[16px] text-[var(--color-fg-muted)] max-w-2xl leading-relaxed">
          {isEs
            ? "Connectors te dan acceso a tus apps (Notion, Webflow, Stripe). Skills le enseñan a tu IA tareas concretas (escribir ads, revisar código). Instalá una vez, viajan contigo a todas tus máquinas."
            : "Connectors give your AI access to your apps (Notion, Webflow, Stripe). Skills teach it concrete tasks (write ads, review code). Install once, they follow you to every machine."}
        </p>
        <div className="mt-7 flex flex-wrap gap-2 text-[12px] font-mono">
          <span className="rounded-md bg-[var(--color-panel)] border border-[var(--color-border)] px-2.5 py-1 text-[var(--color-fg-muted)]">
            {connectors.length} {isEs ? "connectors" : "connectors"}
          </span>
          <span className="rounded-md bg-[var(--color-panel)] border border-[var(--color-border)] px-2.5 py-1 text-[var(--color-fg-muted)]">
            {skills.length} skills
          </span>
          <span className="rounded-md bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 px-2.5 py-1 text-[var(--color-accent)]">
            Claude Code · Codex
          </span>
        </div>
      </section>

      {/* Two-up category cards */}
      <section className="mx-auto max-w-5xl px-6 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CategoryCard
            href={`/${lang}/connectors`}
            Icon={Plug}
            label={isEs ? "Connectors" : "Connectors"}
            count={connectors.length}
            description={
              isEs
                ? "Servidores MCP que dan acceso a tus apps reales: Notion, Webflow, Make, Supabase, y más."
                : "MCP servers that give access to your real apps: Notion, Webflow, Make, Supabase, and more."
            }
            cta={isEs ? "Ver todos" : "View all"}
          />
          <CategoryCard
            href={`/${lang}/skills`}
            Icon={Zap}
            label="Skills"
            count={skills.length}
            description={
              isEs
                ? "Recetas de prompt que enseñan tareas concretas a Claude y Codex: escribir ads, revisar PRs, draftear emails."
                : "Prompt recipes that teach concrete tasks to Claude and Codex: write ads, review PRs, draft emails."
            }
            cta={isEs ? "Ver todos" : "View all"}
          />
        </div>
      </section>

      {/* Featured connectors */}
      <section className="mx-auto max-w-5xl px-6 pb-12">
        <div className="flex items-end justify-between gap-4 mb-5">
          <h2 className="text-[22px] md:text-[26px] font-semibold tracking-tight">
            {isEs ? "Featured · Connectors" : "Featured · Connectors"}
          </h2>
          <Link
            href={`/${lang}/connectors`}
            className="inline-flex items-center gap-1 text-[13px] font-medium text-[var(--color-fg-muted)] hover:text-[var(--color-accent)] transition-colors"
          >
            {isEs ? "Ver todos" : "View all"} <ArrowRight size={13} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredConnectors.map((c) => (
            <FeaturedConnector key={c.slug} lang={lang} connector={c} />
          ))}
        </div>
      </section>

      {/* Featured skills */}
      <section className="mx-auto max-w-5xl px-6 pb-16">
        <div className="flex items-end justify-between gap-4 mb-5">
          <h2 className="text-[22px] md:text-[26px] font-semibold tracking-tight">
            {isEs ? "Featured · Skills" : "Featured · Skills"}
          </h2>
          <Link
            href={`/${lang}/skills`}
            className="inline-flex items-center gap-1 text-[13px] font-medium text-[var(--color-fg-muted)] hover:text-[var(--color-accent)] transition-colors"
          >
            {isEs ? "Ver todos" : "View all"} <ArrowRight size={13} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredSkills.map((s) => (
            <FeaturedSkill key={s.slug} lang={lang} skill={s} />
          ))}
        </div>
      </section>

      {/* Become a publisher CTA */}
      <section className="mx-auto max-w-5xl px-6 pb-12">
        <Link
          href={`/${lang}/publishers`}
          className="block rounded-3xl border border-[var(--color-accent)]/25 bg-gradient-to-br from-[var(--color-accent)]/8 via-[var(--color-info)]/6 to-transparent p-8 md:p-10 hover:border-[var(--color-accent)]/45 transition-colors"
        >
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex-1 min-w-[260px]">
              <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--color-accent)] font-semibold">
                {isEs ? "Para creators" : "For creators"}
              </p>
              <h2 className="mt-2 text-[22px] md:text-[26px] font-semibold tracking-tight">
                {isEs
                  ? "Construís connectors o skills? Publicalos acá."
                  : "Building connectors or skills? Publish them here."}
              </h2>
              <p className="mt-2 text-[13.5px] text-[var(--color-fg-muted)] max-w-xl leading-relaxed">
                {isEs
                  ? "90% para vos. Stripe maneja KYC y payouts. Los primeros 50 publishers entran con 0% de comisión durante 6 meses."
                  : "You keep 90%. Stripe handles KYC and payouts. The first 50 publishers join at 0% fee for 6 months."}
              </p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-[13px] font-semibold text-white bg-[var(--color-accent)] glow-accent">
              {isEs ? "Empezar onboarding" : "Start onboarding"}
              <ArrowRight size={14} strokeWidth={2.4} />
            </span>
          </div>
        </Link>
      </section>

      {/* TerminalSync app promo banner — last */}
      <MarketplaceAppBanner lang={lang} />
    </main>
  );
}

function CategoryCard({
  href,
  Icon,
  label,
  count,
  description,
  cta,
}: {
  href: string;
  Icon: typeof Plug;
  label: string;
  count: number;
  description: string;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className="group relative rounded-3xl border border-[var(--color-border)] bg-[var(--color-panel)] p-7 transition-all hover:border-[var(--color-accent)]/40 hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="h-12 w-12 rounded-xl bg-[var(--color-accent)]/10 text-[var(--color-accent)] flex items-center justify-center">
          <Icon size={20} strokeWidth={2.2} />
        </div>
        <span className="text-[11px] font-mono text-[var(--color-fg-dim)] uppercase tracking-[0.12em]">
          {count}
        </span>
      </div>
      <h3 className="mt-5 text-[20px] font-semibold tracking-tight">{label}</h3>
      <p className="mt-2 text-[13.5px] text-[var(--color-fg-muted)] leading-relaxed">
        {description}
      </p>
      <span className="mt-5 inline-flex items-center gap-1 text-[12.5px] font-semibold text-[var(--color-accent)] group-hover:translate-x-0.5 transition-transform">
        {cta} <ArrowRight size={13} />
      </span>
    </Link>
  );
}

function FeaturedConnector({ lang, connector }: { lang: string; connector: ConnectorMeta }) {
  return (
    <Link
      href={`/${lang}/connectors/${connector.slug}`}
      className="group relative rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5 transition-all hover:border-[var(--color-accent)]/40 hover:shadow-lg hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="h-11 w-11 rounded-xl bg-[var(--color-panel-2)] border border-[var(--color-border)] flex items-center justify-center overflow-hidden">
          <ConnectorLogo src={connector.logo} size={28} className="h-7 w-7" />
        </div>
        <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--color-fg-dim)]">
          {connector.category}
        </span>
      </div>
      <h3 className="mt-4 text-[15px] font-semibold tracking-tight">
        {connector.name}
      </h3>
      <p className="mt-1 text-[12.5px] text-[var(--color-fg-muted)] leading-relaxed line-clamp-2">
        {connector.tagline}
      </p>
    </Link>
  );
}

function FeaturedSkill({ lang, skill }: { lang: string; skill: SkillMeta }) {
  return (
    <Link
      href={`/${lang}/skills/${skill.slug}`}
      className="group relative rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5 transition-all hover:border-[var(--color-accent)]/40 hover:shadow-lg hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="h-11 w-11 rounded-xl bg-[var(--color-panel-2)] border border-[var(--color-border)] flex items-center justify-center overflow-hidden">
          <SkillLogo src={skill.logo} size={28} className="h-7 w-7" />
        </div>
        <ArrowUpRight
          size={14}
          className="text-[var(--color-fg-dim)] group-hover:text-[var(--color-accent)] transition-colors mt-1"
        />
      </div>
      <h3 className="mt-4 text-[15px] font-semibold tracking-tight">
        {skill.name}
      </h3>
      <p className="mt-1 text-[12.5px] text-[var(--color-fg-muted)] leading-relaxed line-clamp-2">
        {skill.tagline}
      </p>
      <div className="mt-3 flex gap-1 text-[10px] font-mono">
        {skill.vendors.map((v) => (
          <span
            key={v}
            className="rounded bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/20 px-1.5 py-0.5 uppercase tracking-[0.12em]"
          >
            {v}
          </span>
        ))}
      </div>
    </Link>
  );
}
