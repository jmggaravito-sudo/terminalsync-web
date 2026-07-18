import type { Metadata } from "next";
import { CategoryBar, DragStrip } from "@/components/landing/CatalogChrome";
import { Plug } from "lucide-react";
import { listPlugins } from "@/lib/plugins";
import { PluginsExplorer } from "./Explorer";

export const revalidate = 3600;

interface Props {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const isEs = lang === "es";
  const title = "Plugins · Terminal Sync";
  const description = isEs
    ? "Plugins: el conector de un producto + la skill para usarlo bien, en un solo install. Se sincronizan en todas tus máquinas."
    : "Plugins: a product's connector + the skill to use it well, in one install. Synced across every machine.";
  return { title, description, openGraph: { title, description, type: "website" } };
}

const CATEGORY_LABELS_ES: Record<string, string> = {
  marketing: "Marketing",
  sales: "Ventas",
  productivity: "Productividad",
  communication: "Comunicación",
  operations: "Operaciones",
  ecommerce: "E-commerce",
  dev: "Desarrollo",
};
const CATEGORY_LABELS_EN: Record<string, string> = {
  marketing: "Marketing",
  sales: "Sales",
  productivity: "Productivity",
  communication: "Communication",
  operations: "Operations",
  ecommerce: "E-commerce",
  dev: "Developer",
};

export default async function PluginsIndex({ params }: Props) {
  const { lang } = await params;
  const isEs = lang === "es";
  const plugins = await listPlugins(lang);
  const categoryLabels = isEs ? CATEGORY_LABELS_ES : CATEGORY_LABELS_EN;

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)]">
      <CategoryBar lang={lang} active="plugins" />
      <section className="mx-auto max-w-5xl px-6 pt-24 pb-10">
        <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--color-accent)] mb-4">
          <Plug size={14} />
          <span>Plugins</span>
        </div>
        <h1 className="text-[40px] md:text-[56px] font-semibold tracking-tight leading-[1.05]">
          {isEs
            ? "Un producto, listo para usar — sin armar las piezas."
            : "One product, ready to use — no assembling the pieces."}
        </h1>
        <p className="mt-4 text-[16px] text-[var(--color-fg-muted)] max-w-2xl leading-relaxed">
          {isEs
            ? "Un Plugin junta el conector de un producto (las herramientas) con la skill que le enseña a tu IA a usarlo bien. Un solo install, en vez de saber que necesitás las dos y conectarlas vos. ¿Querés las piezas sueltas? Están en Conectores y Asistentes."
            : "A Plugin bundles a product's connector (the tools) with the skill that teaches your AI to use it well. One install, instead of knowing you need both and wiring them yourself. Want the raw pieces? They're under Connectors and Assistants."}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-2 text-[12px] font-mono">
          <span className="rounded-md bg-[var(--color-panel)] border border-[var(--color-border)] px-2 py-1 text-[var(--color-fg-muted)]">
            {plugins.length} {plugins.length === 1 ? "plugin" : "plugins"}
          </span>
          <span className="rounded-md bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 px-2 py-1 text-[var(--color-accent)]">
            {isEs ? "Conector + Skill" : "Connector + Skill"}
          </span>
        </div>
      </section>

      <PluginsExplorer
        lang={lang}
        plugins={plugins}
        categoryLabels={categoryLabels}
        uiText={{
          all: isEs ? "Todos" : "All",
          searchPlaceholder: isEs ? "Buscar plugins…" : "Search plugins…",
          noResults: isEs ? "Sin resultados." : "No results.",
        }}
      />

      <DragStrip lang={lang} />
    </main>
  );
}
