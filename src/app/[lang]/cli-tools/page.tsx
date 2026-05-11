import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { listCliTools } from "@/lib/cliTools";
import { CliToolsExplorer } from "./Explorer";

export const revalidate = 3600;

interface Props {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const isEs = lang === "es";
  const title = isEs
    ? "CLI Tools · Terminal Sync"
    : "CLI Tools · Terminal Sync";
  const description = isEs
    ? "Los CLIs oficiales que un dev usa todo el día — gh, supabase, vercel, stripe, wrangler. Guías de instalación, comandos útiles y secretos de proyecto protegidos por TerminalSync."
    : "The official CLIs a dev uses every day — gh, supabase, vercel, stripe, wrangler. Install guides, useful commands and project secrets protected by TerminalSync.";
  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
  };
}

const CATEGORY_LABELS_ES: Record<string, string> = {
  dev: "Desarrollo",
  deploy: "Deploy",
  database: "Base de datos",
  payments: "Pagos",
  infra: "Infraestructura",
  productivity: "Productividad",
};
const CATEGORY_LABELS_EN: Record<string, string> = {
  dev: "Developer",
  deploy: "Deploy",
  database: "Database",
  payments: "Payments",
  infra: "Infrastructure",
  productivity: "Productivity",
};

export default async function CliToolsIndex({ params }: Props) {
  const { lang } = await params;
  const isEs = lang === "es";
  const tools = await listCliTools(lang);
  const categoryLabels = isEs ? CATEGORY_LABELS_ES : CATEGORY_LABELS_EN;

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)]">
      <section className="mx-auto max-w-5xl px-6 pt-24 pb-10">
        <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--color-accent)] mb-4">
          <Sparkles size={14} />
          <span>{isEs ? "CLI Tools" : "CLI Tools"}</span>
        </div>
        <h1 className="text-[40px] md:text-[56px] font-semibold tracking-tight leading-[1.05]">
          {isEs
            ? "Los CLIs que usás todos los días, listos para trabajar dentro de TerminalSync."
            : "The CLIs you use every day, ready to work inside TerminalSync."}
        </h1>
        <p className="mt-4 text-[16px] text-[var(--color-fg-muted)] max-w-2xl leading-relaxed">
          {isEs
            ? "gh, supabase, vercel, stripe, wrangler. Instalá desde la terminal correcta, guardá secretos de proyecto en el vault cifrado y mantené el contexto de trabajo entre tus Macs. GitHub CLI ya tiene Auth Sync dedicado; los demás CLIs quedan como guías y workflows listos."
            : "gh, supabase, vercel, stripe, wrangler. Install from the right terminal, keep project secrets in the encrypted vault, and carry workflow context across Macs. GitHub CLI has dedicated Auth Sync today; the other CLIs are ready-to-use guides and workflows."}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-2 text-[12px] font-mono">
          <span className="rounded-md bg-[var(--color-panel)] border border-[var(--color-border)] px-2 py-1 text-[var(--color-fg-muted)]">
            {tools.length} {isEs ? "tools" : "tools"}
          </span>
          <span className="rounded-md bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 px-2 py-1 text-[var(--color-accent)]">
            {isEs ? "gh auth sync + env vault" : "gh auth sync + env vault"}
          </span>
        </div>
      </section>

      <CliToolsExplorer
        lang={lang}
        tools={tools}
        categoryLabels={categoryLabels}
        uiText={{
          all: isEs ? "Todos" : "All",
          searchPlaceholder: isEs ? "Buscar CLI…" : "Search CLIs…",
          noResults: isEs ? "Sin resultados." : "No results.",
        }}
      />

      <section className="mx-auto max-w-5xl px-6 pb-32">
        <Link
          href={`/${lang}/marketplace`}
          className="group flex items-center justify-between gap-4 rounded-2xl border border-[var(--color-accent)]/25 bg-[var(--color-accent)]/5 hover:bg-[var(--color-accent)]/10 p-5 transition-colors"
        >
          <div>
            <p className="text-[13.5px] font-semibold tracking-tight text-[var(--color-fg-strong)]">
              {isEs
                ? "Mirá también Connectors y Skills"
                : "Also check Connectors and Skills"}
            </p>
            <p className="mt-1 text-[12.5px] text-[var(--color-fg-muted)]">
              {isEs
                ? "MCP servers para tus apps + recetas de prompt para tu IA. Sincronizado igual."
                : "MCP servers for your apps + prompt recipes for your AI. Synced the same way."}
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
