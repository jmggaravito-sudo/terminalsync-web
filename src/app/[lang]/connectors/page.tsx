import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { listAllConnectors } from "@/lib/connectors";
import { ConnectorsExplorer } from "./Explorer";

export const revalidate = 3600; // hourly — edits to .md files picked up on next deploy

interface Props {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const title =
    lang === "es"
      ? "Connectors · Terminal Sync"
      : "Connectors · Terminal Sync";
  const description =
    lang === "es"
      ? "Dale superpoderes a tu Claude Code: conectalo a Notion, Supabase, Make, Gmail y más. Un solo setup, sincronizado en todas tus máquinas."
      : "Give your Claude Code superpowers: connect it to Notion, Supabase, Make, Gmail and more. One setup, synced across every machine.";
  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
  };
}

const CATEGORY_LABELS_ES: Record<string, string> = {
  productivity: "Productividad",
  database: "Base de datos",
  automation: "Automatización",
  storage: "Almacenamiento",
  messaging: "Mensajería",
  dev: "Desarrollo",
};
const CATEGORY_LABELS_EN: Record<string, string> = {
  productivity: "Productivity",
  database: "Database",
  automation: "Automation",
  storage: "Storage",
  messaging: "Messaging",
  dev: "Developer",
};

export default async function ConnectorsIndex({ params }: Props) {
  const { lang } = await params;
  const connectors = await listAllConnectors(lang);
  const categoryLabels = lang === "es" ? CATEGORY_LABELS_ES : CATEGORY_LABELS_EN;
  const isEs = lang === "es";

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)]">
      <section className="mx-auto max-w-5xl px-6 pt-24 pb-10">
        <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--color-accent)] mb-4">
          <Sparkles size={14} />
          <span>{lang === "es" ? "Conectores" : "Connectors"}</span>
        </div>
        <h1 className="text-[40px] md:text-[56px] font-semibold tracking-tight leading-[1.05]">
          {lang === "es"
            ? "Tu Claude Code, con acceso a tu mundo."
            : "Your Claude Code, plugged into your world."}
        </h1>
        <p className="mt-4 text-[16px] text-[var(--color-fg-muted)] max-w-2xl leading-relaxed">
          {lang === "es"
            ? "Notion, Supabase, Make, Gmail, Drive — configurá el conector una vez y viaja contigo a todas tus máquinas. Cifrado end-to-end, llaves en el Keychain del sistema."
            : "Notion, Supabase, Make, Gmail, Drive — set up the connector once and it follows you to every machine. End-to-end encrypted, keys in your system Keychain."}
        </p>
      </section>

      <ConnectorsExplorer
        lang={lang}
        connectors={connectors}
        categoryLabels={categoryLabels}
        uiText={{
          all: isEs ? "Todos" : "All",
          searchPlaceholder: isEs ? "Buscar por nombre o tag…" : "Search by name or tag…",
          noResults: isEs ? "Sin resultados." : "No results.",
          soon: isEs ? "Pronto" : "Soon",
        }}
      />

      <section className="mx-auto max-w-5xl px-6 pb-32">
        <Link
          href={`/${lang}/publishers`}
          className="group flex items-center justify-between gap-4 rounded-2xl border border-[var(--color-accent)]/25 bg-[var(--color-accent)]/5 hover:bg-[var(--color-accent)]/10 p-5 transition-colors"
        >
          <div>
            <p className="text-[13.5px] font-semibold tracking-tight text-[var(--color-fg-strong)]">
              {lang === "es"
                ? "¿Construís conectores MCP? Publicalos acá."
                : "Building MCP connectors? Publish them here."}
            </p>
            <p className="mt-1 text-[12.5px] text-[var(--color-fg-muted)]">
              {lang === "es"
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

