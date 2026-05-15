import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Layers, Plug, Sparkles, Terminal, Zap } from "lucide-react";
import { listAllConnectors, type ConnectorMeta } from "@/lib/connectors";
import { listSkills, type SkillMeta } from "@/lib/skills";
import { listCliTools, type CliToolMeta } from "@/lib/cliTools";
import { ConnectorLogo } from "@/app/[lang]/connectors/Logo";
import { SkillLogo } from "@/app/[lang]/skills/Logo";
import { CliToolLogo } from "@/app/[lang]/cli-tools/Logo";
import { MarketplaceAppBanner } from "@/components/marketplace/AppBanner";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const revalidate = 3600;

interface StackPackPreview {
  slug: string;
  name: string;
  tagline: string;
  price_cents: number;
  currency: string;
  listing_count: number;
}

async function listFeaturedStacks(): Promise<StackPackPreview[]> {
  const sb = getSupabaseAdmin();
  if (!sb) return [];
  const { data, error } = await sb
    .from("bundles")
    .select(
      "slug, name, tagline, price_cents, currency, bundle_listings(count)",
    )
    .eq("status", "active")
    .order("sort_order", { ascending: true })
    .limit(6);
  if (error || !data) return [];
  return data.map((b) => ({
    slug: b.slug,
    name: b.name,
    tagline: b.tagline,
    price_cents: b.price_cents,
    currency: b.currency,
    listing_count:
      Array.isArray(b.bundle_listings) && b.bundle_listings[0]
        ? (b.bundle_listings[0] as { count: number }).count
        : 0,
  }));
}

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
    ? "Connectors, CLI Tools y Skills para Claude, Codex y Gemini. Una sola instalación, sincronizada en todas tus máquinas."
    : "Connectors, CLI Tools and Skills for Claude, Codex and Gemini. One install, synced across every machine.";
  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
  };
}

export default async function MarketplaceHub({ params }: Props) {
  const { lang } = await params;
  const isEs = lang === "es";
  const [connectors, skills, cliTools, stacks] = await Promise.all([
    listAllConnectors(lang),
    listSkills(lang),
    listCliTools(lang),
    listFeaturedStacks(),
  ]);

  const featuredConnectors = connectors.slice(0, 3);
  const featuredSkills = skills.slice(0, 3);
  const featuredCliTools = cliTools.slice(0, 3);

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
            ? "Connectors te dan acceso a tus apps (Notion, Stripe). Skills le enseñan a tu IA tareas concretas (escribir ads, revisar código). CLI Tools reúnen los comandos oficiales para instalar, autenticar y trabajar desde la terminal correcta."
            : "Connectors give your AI access to your apps (Notion, Stripe). Skills teach it concrete tasks (write ads, review code). CLI Tools collect the official commands to install, authenticate and work from the right terminal."}
        </p>
        <div className="mt-7 flex flex-wrap gap-2 text-[12px] font-mono">
          <span className="rounded-md bg-[var(--color-panel)] border border-[var(--color-border)] px-2.5 py-1 text-[var(--color-fg-muted)]">
            {connectors.length} {isEs ? "connectors" : "connectors"}
          </span>
          <span className="rounded-md bg-[var(--color-panel)] border border-[var(--color-border)] px-2.5 py-1 text-[var(--color-fg-muted)]">
            {cliTools.length} CLI tools
          </span>
          <span className="rounded-md bg-[var(--color-panel)] border border-[var(--color-border)] px-2.5 py-1 text-[var(--color-fg-muted)]">
            {skills.length} skills
          </span>
          <span className="rounded-md bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 px-2.5 py-1 text-[var(--color-accent)]">
            Claude · Codex · Gemini
          </span>
        </div>
      </section>

      {/* Four-up category cards — Stack Packs sits across the top
          (full-width on its own row) since it bundles the other three;
          Connectors + CLI Tools + Skills are the three Power-Ups
          underneath. */}
      <section className="mx-auto max-w-5xl px-6 pb-6">
        <CategoryCard
          href={`/${lang}/stacks`}
          Icon={Layers}
          label={isEs ? "Stack Packs" : "Stack Packs"}
          count={stacks.length}
          description={
            isEs
              ? "Paquetes listos para usar. Pagás una vez y tu IA queda conectada a las apps que ya usás cada día."
              : "Ready-made packs. Pay once and your AI is wired up to the apps you already use every day."
          }
          cta={isEs ? "Ver packs" : "View packs"}
          featured
          wide
        />
      </section>

      {/* Featured Stack Packs — moved above Power-Ups so the commercial
          offering (paid bundles) lands above the free pillars. */}
      {stacks.length > 0 && (
        <section className="mx-auto max-w-5xl px-6 pb-12">
          <div className="flex items-end justify-between gap-4 mb-5">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--color-accent)] font-semibold">
                {isEs ? "Empezá rápido" : "Get going fast"}
              </p>
              <h2 className="mt-1 text-[22px] md:text-[26px] font-semibold tracking-tight">
                {isEs ? "Featured · Stack Packs" : "Featured · Stack Packs"}
              </h2>
            </div>
            <Link
              href={`/${lang}/stacks`}
              className="inline-flex items-center gap-1 text-[13px] font-medium text-[var(--color-fg-muted)] hover:text-[var(--color-accent)] transition-colors"
            >
              {isEs ? "Ver todos" : "View all"} <ArrowRight size={13} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stacks.map((s) => (
              <FeaturedStack key={s.slug} lang={lang} stack={s} isEs={isEs} />
            ))}
          </div>
        </section>
      )}

      {/* Power-Ups — the three pillars */}
      <section className="mx-auto max-w-5xl px-6 pb-12">
        <div className="mb-4 flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--color-fg-dim)]">
          <span>{isEs ? "Power-Ups" : "Power-Ups"}</span>
          <span className="h-px flex-1 bg-[var(--color-border)]" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CategoryCard
            href={`/${lang}/connectors`}
            Icon={Plug}
            label={isEs ? "Connectors" : "Connectors"}
            count={connectors.length}
            description={
              isEs
                ? "Conectá tu IA con tus apps reales: Notion, Webflow, Make, Supabase, y más. Para que lea, escriba y actúe sin copiar y pegar."
                : "Connect your AI to your real apps: Notion, Webflow, Make, Supabase, and more. So it reads, writes and acts without copy-paste."
            }
            cta={isEs ? "Ver todos" : "View all"}
          />
          <CategoryCard
            href={`/${lang}/cli-tools`}
            Icon={Terminal}
            label="CLI Tools"
            count={cliTools.length}
            description={
              isEs
                ? "Los CLIs que un dev usa todo el día — gh, vercel, supabase, stripe, wrangler. Guías, comandos útiles, GitHub Auth Sync y env vault para secretos de proyecto."
                : "The CLIs a dev uses every day — gh, vercel, supabase, stripe, wrangler. Guides, useful commands, GitHub Auth Sync and env vault for project secrets."
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
                ? "Recetas de prompt que enseñan tareas concretas a Claude, Codex y Gemini: escribir ads, revisar PRs, draftear emails."
                : "Prompt recipes that teach concrete tasks to Claude, Codex, and Gemini: write ads, review PRs, draft emails."
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

      {/* Featured CLI Tools */}
      {featuredCliTools.length > 0 && (
        <section className="mx-auto max-w-5xl px-6 pb-12">
          <div className="flex items-end justify-between gap-4 mb-5">
            <h2 className="text-[22px] md:text-[26px] font-semibold tracking-tight">
              {isEs ? "Featured · CLI Tools" : "Featured · CLI Tools"}
            </h2>
            <Link
              href={`/${lang}/cli-tools`}
              className="inline-flex items-center gap-1 text-[13px] font-medium text-[var(--color-fg-muted)] hover:text-[var(--color-accent)] transition-colors"
            >
              {isEs ? "Ver todos" : "View all"} <ArrowRight size={13} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredCliTools.map((t) => (
              <FeaturedCliTool key={t.slug} lang={lang} tool={t} />
            ))}
          </div>
        </section>
      )}

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
  featured,
  wide,
}: {
  href: string;
  Icon: typeof Plug;
  label: string;
  count: number;
  description: string;
  cta: string;
  featured?: boolean;
  /** When true, the card stretches full-width (used for the lead
   *  Stack Packs card that sits above the three Power-Ups). */
  wide?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group relative rounded-3xl border bg-[var(--color-panel)] p-7 transition-all hover:-translate-y-0.5 hover:shadow-lg ${
        wide ? "block" : ""
      } ${
        featured
          ? "border-[var(--color-accent)]/35 bg-gradient-to-br from-[var(--color-accent)]/8 via-transparent to-transparent hover:border-[var(--color-accent)]/55"
          : "border-[var(--color-border)] hover:border-[var(--color-accent)]/40"
      }`}
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
          <ConnectorLogo src={connector.logo} size={28} className="h-7 w-7" fallbackText={connector.name} />
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

function FeaturedCliTool({ lang, tool }: { lang: string; tool: CliToolMeta }) {
  return (
    <Link
      href={`/${lang}/cli-tools/${tool.slug}`}
      className="group relative rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5 transition-all hover:border-[var(--color-accent)]/40 hover:shadow-lg hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="h-11 w-11 rounded-xl bg-[var(--color-panel-2)] border border-[var(--color-border)] flex items-center justify-center overflow-hidden">
          <CliToolLogo src={tool.logo} size={28} className="h-7 w-7" fallbackText={tool.name} />
        </div>
        <ArrowUpRight
          size={14}
          className="text-[var(--color-fg-dim)] group-hover:text-[var(--color-accent)] transition-colors mt-1"
        />
      </div>
      <h3 className="mt-4 text-[15px] font-semibold tracking-tight">
        {tool.name}
      </h3>
      <p className="mt-1 text-[12.5px] text-[var(--color-fg-muted)] leading-relaxed line-clamp-2">
        {tool.tagline}
      </p>
      <div className="mt-3 inline-flex items-center gap-1 rounded bg-[var(--color-panel-2)] border border-[var(--color-border)] px-1.5 py-0.5 font-mono text-[10.5px] text-[var(--color-fg)]">
        <span className="text-[var(--color-fg-dim)]">$</span>
        <span>{tool.binary}</span>
      </div>
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
          <SkillLogo src={skill.logo} size={28} className="h-7 w-7" fallbackText={skill.name} />
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

function FeaturedStack({
  lang,
  stack,
  isEs,
}: {
  lang: string;
  stack: StackPackPreview;
  isEs: boolean;
}) {
  const price = (stack.price_cents / 100).toFixed(0);
  return (
    <Link
      href={`/${lang}/stacks/${stack.slug}`}
      className="group relative rounded-2xl border border-[var(--color-accent)]/25 bg-gradient-to-br from-[var(--color-accent)]/8 via-[var(--color-panel)] to-[var(--color-panel)] p-5 transition-all hover:border-[var(--color-accent)]/55 hover:shadow-lg hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="h-11 w-11 rounded-xl bg-[var(--color-accent)]/15 border border-[var(--color-accent)]/30 text-[var(--color-accent)] flex items-center justify-center">
          <Layers size={20} strokeWidth={2.2} />
        </div>
        <span className="text-[11px] font-mono text-[var(--color-accent)] font-semibold">
          ${price}
        </span>
      </div>
      <h3 className="mt-4 text-[15px] font-semibold tracking-tight">
        {stack.name}
      </h3>
      <p className="mt-1 text-[12.5px] text-[var(--color-fg-muted)] leading-relaxed line-clamp-2">
        {stack.tagline}
      </p>
      <div className="mt-3 flex items-center justify-between text-[11px] font-mono uppercase tracking-[0.12em] text-[var(--color-fg-dim)]">
        <span>
          {stack.listing_count} {isEs ? "connectors" : "connectors"}
        </span>
        <span className="text-[var(--color-accent)] group-hover:translate-x-0.5 transition-transform">
          {isEs ? "ver →" : "view →"}
        </span>
      </div>
    </Link>
  );
}
