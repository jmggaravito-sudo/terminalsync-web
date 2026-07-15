import type { Metadata } from "next";
import { CategoryBar, DragStrip } from "@/components/landing/CatalogChrome";
import { Sparkles } from "lucide-react";
import { listSkills } from "@/lib/skills";
import { SkillsExplorer } from "./Explorer";

export const revalidate = 3600;

interface Props {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const isEs = lang === "es";
  const title = isEs
    ? "Skills · Terminal Sync"
    : "Skills · Terminal Sync";
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

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)]">
      <CategoryBar lang={lang} active="skills" />
      <section className="mx-auto max-w-5xl px-6 pt-24 pb-10">
        <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--color-accent)] mb-4">
          <Sparkles size={14} />
          <span>{isEs ? "Skills" : "Skills"}</span>
        </div>
        <h1 className="text-[40px] md:text-[56px] font-semibold tracking-tight leading-[1.05]">
          {isEs
            ? "Tu Claude y Codex, con superpoderes específicos."
            : "Your Claude and Codex, with specific superpowers."}
        </h1>
        <p className="mt-4 text-[16px] text-[var(--color-fg-muted)] max-w-2xl leading-relaxed">
          {isEs
            ? "Skills son recetas de prompt instaladas localmente. Instalá una y tu IA aprende a hacer una cosa muy bien — armar ads, revisar código, redactar emails. Funciona en Claude Code y Codex, sincronizado en todas tus máquinas."
            : "Skills are prompt recipes installed locally. Install one and your AI learns to do one thing very well — create ads, review code, draft emails. Works on Claude Code and Codex, synced across every machine."}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-2 text-[12px] font-mono">
          <span className="rounded-md bg-[var(--color-panel)] border border-[var(--color-border)] px-2 py-1 text-[var(--color-fg-muted)]">
            {skills.length} skills
          </span>
          <span className="rounded-md bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 px-2 py-1 text-[var(--color-accent)]">
            Claude · Codex
          </span>
        </div>
      </section>

      <SkillsExplorer
        lang={lang}
        skills={skills}
        categoryLabels={categoryLabels}
        uiText={{
          all: isEs ? "Todos" : "All",
          searchPlaceholder: isEs ? "Buscar skills…" : "Search skills…",
          noResults: isEs ? "Sin resultados." : "No results.",
        }}
      />

      <DragStrip lang={lang} />
    </main>
  );
}

