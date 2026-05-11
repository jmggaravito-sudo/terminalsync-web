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
    ? "Los CLIs oficiales que un dev usa todo el día — gh, supabase, vercel, stripe, wrangler. Instalá una vez, autenticación y env vault sincronizados en todas tus máquinas."
    : "The official CLIs a dev uses every day — gh, supabase, vercel, stripe, wrangler. Install once, auth and env vault synced across every machine.";
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
            ? "Los CLIs que usás todos los días — autenticados en todas tus Macs."
            : "The CLIs you use every day — authed on every Mac."}
        </h1>
        <p className="mt-4 text-[16px] text-[var(--color-fg-muted)] max-w-2xl leading-relaxed">
          {isEs
            ? "gh, supabase, vercel, stripe, wrangler. Instalá una vez, hacé login una vez, y TerminalSync replica el auth + secretos en todas tus máquinas. Tu Mac nueva deploya en segundos."
            : "gh, supabase, vercel, stripe, wrangler. Install once, log in once, and TerminalSync replicates auth + secrets across every machine. Your new Mac ships in seconds."}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-2 text-[12px] font-mono">
          <span className="rounded-md bg-[var(--color-panel)] border border-[var(--color-border)] px-2 py-1 text-[var(--color-fg-muted)]">
            {tools.length} {isEs ? "tools" : "tools"}
          </span>
          <span className="rounded-md bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 px-2 py-1 text-[var(--color-accent)]">
            {isEs ? "auth + env vault sync" : "auth + env vault sync"}
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
