import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { listSkills } from "@/lib/skills";
import { SkillsBrowser } from "./SkillsBrowser";

export const revalidate = 3600;

interface Props {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const isEs = lang === "es";
  const title = isEs ? "Skills · Terminal Sync" : "Skills · Terminal Sync";
  const description = isEs
    ? "Skills listas para Claude Code y Codex. Instalalas una vez y se sincronizan en todas tus máquinas."
    : "Ready-to-install skills for Claude Code and Codex. Install once, sync across every machine.";
  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
  };
}

const CATEGORY_LABELS_ES: Record<string, string> = {
  marketing: "Marketing",
  dev: "Desarrollo",
  productivity: "Productividad",
  research: "Investigación",
  design: "Diseño",
  finance: "Finanzas",
};
const CATEGORY_LABELS_EN: Record<string, string> = {
  marketing: "Marketing",
  dev: "Developer",
  productivity: "Productivity",
  research: "Research",
  design: "Design",
  finance: "Finance",
};

export default async function SkillsIndex({ params }: Props) {
  const { lang } = await params;
  const isEs = lang === "es";
  const skills = await listSkills(lang);
  const categoryLabels = isEs ? CATEGORY_LABELS_ES : CATEGORY_LABELS_EN;

  // Pre-compute the per-vendor breakdown for the stats row so the hero shows
  // tangible numbers instead of "X skills" alone.
  const vendorCount = new Set<string>();
  skills.forEach((s) => s.vendors.forEach((v) => vendorCount.add(v)));

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)]">
      {/* Hero — wrapped in subtle radial gradients for depth */}
      <section className="relative overflow-hidden border-b border-[var(--color-border)]/60">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--color-accent)/8,_transparent_50%),radial-gradient(ellipse_at_bottom_left,_var(--color-info)/6,_transparent_50%)]"
        />
        <div className="relative mx-auto max-w-5xl px-6 pt-24 pb-14">
          <Link
            href={`/${lang}/marketplace`}
            className="inline-flex items-center gap-1.5 text-[11.5px] font-mono uppercase tracking-[0.18em] text-[var(--color-fg-muted)] hover:text-[var(--color-accent)] transition-colors mb-5"
          >
            ← Marketplace
          </Link>

          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-[var(--color-accent)] mb-4">
            <Sparkles size={13} strokeWidth={2.4} />
            <span>Skills</span>
          </div>
          <h1 className="text-[44px] md:text-[60px] font-semibold tracking-tight leading-[1.02]">
            {isEs
              ? "Tu Claude y Codex,"
              : "Your Claude and Codex,"}
            <br />
            <span className="text-[var(--color-fg-muted)]">
              {isEs ? "con superpoderes específicos." : "with specific superpowers."}
            </span>
          </h1>
          <p className="mt-5 text-[16px] text-[var(--color-fg-muted)] max-w-2xl leading-relaxed">
            {isEs
              ? "Skills son recetas de prompt instaladas localmente. Instalá una y tu IA aprende a hacer una cosa muy bien — armar ads, revisar código, redactar emails. Funciona en Claude Code y Codex, sincronizado en todas tus máquinas."
              : "Skills are prompt recipes installed locally. Install one and your AI learns to do one thing very well — create ads, review code, draft emails. Works on Claude Code and Codex, synced across every machine."}
          </p>

          {/* Stats row — gives the hero density without crowding */}
          <div className="mt-8 flex flex-wrap items-center gap-2.5">
            <Stat value={skills.length} label="skills" />
            <Stat value={vendorCount.size} label="vendors" />
            <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--color-fg-dim)] ml-1">
              · {isEs ? "free + paid" : "free + paid"}
            </span>
          </div>
        </div>
      </section>

      {/* Browser */}
      <section className="mx-auto max-w-5xl px-6 pt-10 pb-14">
        <SkillsBrowser
          lang={lang}
          skills={skills}
          categoryLabels={categoryLabels}
          copy={{
            all: isEs ? "Todos" : "All",
            filterByCategory: isEs ? "Categoría" : "Category",
            filterByVendor: isEs ? "Vendor" : "Vendor",
            empty: isEs
              ? "No hay skills que matcheen estos filtros."
              : "No skills match these filters.",
            clearFilters: isEs ? "Limpiar filtros" : "Clear filters",
          }}
        />
      </section>

      {/* Publisher CTA */}
      <section className="mx-auto max-w-5xl px-6 pb-32">
        <Link
          href={`/${lang}/publishers`}
          className="group flex items-center justify-between gap-4 rounded-2xl border border-[var(--color-accent)]/25 bg-[var(--color-accent)]/5 hover:bg-[var(--color-accent)]/10 p-5 transition-colors"
        >
          <div>
            <p className="text-[13.5px] font-semibold tracking-tight text-[var(--color-fg-strong)]">
              {isEs
                ? "¿Tenés skills propias? Publicalas acá."
                : "Got your own skills? Publish them here."}
            </p>
            <p className="mt-1 text-[12.5px] text-[var(--color-fg-muted)]">
              {isEs
                ? "Cobrás el 90%. Los primeros 50 publishers no pagan comisión durante 6 meses."
                : "You keep 90%. First 50 publishers pay 0% for 6 months."}
            </p>
          </div>
          <ArrowUpRight
            size={18}
            className="text-[var(--color-accent)] shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
          />
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
