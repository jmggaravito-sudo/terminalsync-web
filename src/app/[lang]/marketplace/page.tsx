import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Plug, Sparkles, Zap } from "lucide-react";
import { listConnectors, type ConnectorMeta } from "@/lib/connectors";
import { listSkills, type SkillMeta } from "@/lib/skills";
import { ConnectorLogo } from "@/app/[lang]/connectors/Logo";
import { SkillLogo } from "@/app/[lang]/skills/Logo";

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
    listConnectors(lang),
    listSkills(lang),
  ]);

  // Pick the most fleshed-out items as Featured: connectors with manifests
  // first (they show off the dual-install UX); skills sorted by name as a
  // stable proxy until install_count comes online.
  const featuredConnectors = [...connectors]
    .sort((a, b) => Number(Boolean(b.manifest)) - Number(Boolean(a.manifest)))
    .slice(0, 3);
  const featuredSkills = skills.slice(0, 3);
  const installable = connectors.filter((c) => c.manifest).length;

  const vendorSet = new Set<string>();
  skills.forEach((s) => s.vendors.forEach((v) => vendorSet.add(v)));

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)]">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[var(--color-border)]/60">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--color-accent)/10,_transparent_55%),radial-gradient(ellipse_at_bottom_left,_var(--color-info)/8,_transparent_55%)]"
        />
        <div className="relative mx-auto max-w-5xl px-6 pt-24 pb-16">
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-[var(--color-accent)] mb-4">
            <Sparkles size={13} strokeWidth={2.4} />
            <span>Marketplace</span>
          </div>
          <h1 className="text-[44px] md:text-[64px] font-semibold tracking-tight leading-[1.0]">
            {isEs
              ? "Todo lo que extiende a tu IA,"
              : "Everything that extends your AI,"}
            <br />
            <span className="text-[var(--color-fg-muted)]">
              {isEs ? "en un solo lugar." : "in one place."}
            </span>
          </h1>
          <p className="mt-6 text-[16.5px] text-[var(--color-fg-muted)] max-w-2xl leading-relaxed">
            {isEs
              ? "Connectors te dan acceso a tus apps (Notion, Stripe, GitHub). Skills le enseñan a tu IA tareas concretas (escribir ads, revisar código). Instalá una vez, viajan contigo a todas tus máquinas."
              : "Connectors give your AI access to your apps (Notion, Stripe, GitHub). Skills teach it concrete tasks (write ads, review code). Install once, they follow you to every machine."}
          </p>

          {/* Stats row */}
          <div className="mt-8 flex flex-wrap items-center gap-2.5">
            <Stat value={connectors.length} label={isEs ? "connectors" : "connectors"} />
            <Stat value={skills.length} label="skills" />
            <Stat value={installable} label={isEs ? "1-click install" : "1-click install"} />
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 px-3 py-1.5 text-[10.5px] font-mono uppercase tracking-[0.18em] text-[var(--color-accent)] font-semibold">
              Claude · Codex
            </span>
          </div>
        </div>
      </section>

      {/* Two-up category cards */}
      <section className="mx-auto max-w-5xl px-6 pt-12 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CategoryCard
            href={`/${lang}/connectors`}
            Icon={Plug}
            label={isEs ? "Connectors" : "Connectors"}
            count={connectors.length}
            description={
              isEs
                ? "Servidores MCP que dan acceso a tus apps reales: Notion, Stripe, GitHub, Webflow, Supabase, y más."
                : "MCP servers that give access to your real apps: Notion, Stripe, GitHub, Webflow, Supabase, and more."
            }
            cta={isEs ? "Ver todos" : "View all"}
            metric={
              installable > 0
                ? `${installable} ${isEs ? "con 1-click install" : "with 1-click install"}`
                : undefined
            }
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
            metric={`${vendorSet.size} ${isEs ? "vendors" : "vendors"} · claude · codex`}
          />
        </div>
      </section>

      {/* Featured connectors */}
      <section className="mx-auto max-w-5xl px-6 pb-12">
        <SectionHeader
          eyebrow={isEs ? "Destacados" : "Featured"}
          title="Connectors"
          ctaLabel={isEs ? "Ver todos" : "View all"}
          ctaHref={`/${lang}/connectors`}
        />
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredConnectors.map((c) => (
            <FeaturedConnector key={c.slug} lang={lang} connector={c} isEs={isEs} />
          ))}
        </div>
      </section>

      {/* Featured skills */}
      <section className="mx-auto max-w-5xl px-6 pb-16">
        <SectionHeader
          eyebrow={isEs ? "Destacados" : "Featured"}
          title="Skills"
          ctaLabel={isEs ? "Ver todos" : "View all"}
          ctaHref={`/${lang}/skills`}
        />
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredSkills.map((s) => (
            <FeaturedSkill key={s.slug} lang={lang} skill={s} />
          ))}
        </div>
      </section>

      {/* Become a publisher CTA */}
      <section className="mx-auto max-w-5xl px-6 pb-32">
        <Link
          href={`/${lang}/publishers`}
          className="block rounded-3xl border border-[var(--color-accent)]/25 bg-gradient-to-br from-[var(--color-accent)]/8 via-[var(--color-info)]/6 to-transparent p-8 md:p-12 hover:border-[var(--color-accent)]/45 hover:-translate-y-0.5 transition-all"
        >
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex-1 min-w-[260px]">
              <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-[var(--color-accent)] font-semibold">
                {isEs ? "Para creators" : "For creators"}
              </p>
              <h2 className="mt-3 text-[24px] md:text-[30px] font-semibold tracking-tight leading-[1.1]">
                {isEs
                  ? "Construís connectors o skills?"
                  : "Building connectors or skills?"}
                <br />
                <span className="text-[var(--color-fg-muted)]">
                  {isEs ? "Publicalos acá." : "Publish them here."}
                </span>
              </h2>
              <p className="mt-3 text-[14px] text-[var(--color-fg-muted)] max-w-xl leading-relaxed">
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
    </main>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="inline-flex items-baseline gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-1.5">
      <span className="text-[14px] font-semibold tracking-tight text-[var(--color-fg-strong)] tabular-nums">
        {value}
      </span>
      <span className="text-[10.5px] font-mono uppercase tracking-[0.18em] text-[var(--color-fg-muted)]">
        {label}
      </span>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  ctaLabel,
  ctaHref,
}: {
  eyebrow: string;
  title: string;
  ctaLabel: string;
  ctaHref: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4 border-b border-[var(--color-border)]/60 pb-3">
      <div>
        <p className="text-[10.5px] font-mono uppercase tracking-[0.2em] text-[var(--color-fg-dim)]">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-[24px] md:text-[28px] font-semibold tracking-tight">
          {title}
        </h2>
      </div>
      <Link
        href={ctaHref}
        className="inline-flex items-center gap-1 text-[12.5px] font-medium text-[var(--color-fg-muted)] hover:text-[var(--color-accent)] transition-colors"
      >
        {ctaLabel} <ArrowRight size={13} />
      </Link>
    </div>
  );
}

function CategoryCard({
  href,
  Icon,
  label,
  count,
  description,
  cta,
  metric,
}: {
  href: string;
  Icon: typeof Plug;
  label: string;
  count: number;
  description: string;
  cta: string;
  metric?: string;
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-panel)] p-7 transition-all hover:border-[var(--color-accent)]/40 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.45)]"
    >
      {/* Subtle accent gradient that intensifies on hover */}
      <div
        aria-hidden
        className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[var(--color-accent)]/8 blur-3xl opacity-60 group-hover:opacity-100 transition-opacity"
      />

      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div className="h-12 w-12 rounded-xl bg-[var(--color-accent)]/10 text-[var(--color-accent)] flex items-center justify-center">
            <Icon size={20} strokeWidth={2.2} />
          </div>
          <span className="text-[11px] font-mono text-[var(--color-fg-dim)] uppercase tracking-[0.16em] tabular-nums">
            {count.toString().padStart(2, "0")}
          </span>
        </div>
        <h3 className="mt-5 text-[22px] font-semibold tracking-tight">{label}</h3>
        <p className="mt-2 text-[13.5px] text-[var(--color-fg-muted)] leading-relaxed">
          {description}
        </p>
        {metric && (
          <p className="mt-4 text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--color-fg-dim)]">
            {metric}
          </p>
        )}
        <span className="mt-5 inline-flex items-center gap-1 text-[12.5px] font-semibold text-[var(--color-accent)] group-hover:translate-x-0.5 transition-transform">
          {cta} <ArrowRight size={13} />
        </span>
      </div>
    </Link>
  );
}

function FeaturedConnector({
  lang,
  connector,
  isEs,
}: {
  lang: string;
  connector: ConnectorMeta;
  isEs: boolean;
}) {
  return (
    <Link
      href={`/${lang}/connectors/${connector.slug}`}
      className="group relative rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5 transition-all hover:border-[var(--color-accent)]/40 hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.4)] hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="h-11 w-11 rounded-xl bg-[var(--color-panel-2)] border border-[var(--color-border)] flex items-center justify-center overflow-hidden">
          <ConnectorLogo src={connector.logo} size={28} className="h-7 w-7" />
        </div>
        <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--color-fg-dim)]">
          {connector.category}
        </span>
      </div>
      <h3 className="mt-4 text-[15px] font-semibold tracking-tight">{connector.name}</h3>
      <p className="mt-1 text-[12.5px] text-[var(--color-fg-muted)] leading-relaxed line-clamp-2">
        {connector.tagline}
      </p>
      {connector.manifest && (
        <div className="mt-3 inline-flex items-center gap-1 text-[10.5px] font-mono uppercase tracking-[0.12em] text-[var(--color-accent)]">
          <Zap size={10} strokeWidth={2.4} />
          {isEs ? "1-click install" : "1-click install"}
        </div>
      )}
    </Link>
  );
}

function FeaturedSkill({ lang, skill }: { lang: string; skill: SkillMeta }) {
  return (
    <Link
      href={`/${lang}/skills/${skill.slug}`}
      className="group relative rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5 transition-all hover:border-[var(--color-accent)]/40 hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.4)] hover:-translate-y-0.5"
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
      <h3 className="mt-4 text-[15px] font-semibold tracking-tight">{skill.name}</h3>
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
