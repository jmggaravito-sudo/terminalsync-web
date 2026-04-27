import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { listConnectors } from "@/lib/connectors";
import { ConnectorsBrowser } from "./ConnectorsBrowser";

export const revalidate = 3600; // hourly — edits to .md files picked up on next deploy

interface Props {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const isEs = lang === "es";
  const title = isEs
    ? "Connectors · Terminal Sync"
    : "Connectors · Terminal Sync";
  const description = isEs
    ? "Dale superpoderes a tu Claude Code: conectalo a Notion, Stripe, GitHub, Webflow y más. Un solo setup, sincronizado en todas tus máquinas."
    : "Give your Claude Code superpowers: connect it to Notion, Stripe, GitHub, Webflow and more. One setup, synced across every machine.";
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
  const isEs = lang === "es";
  const connectors = await listConnectors(lang);
  const categoryLabels = isEs ? CATEGORY_LABELS_ES : CATEGORY_LABELS_EN;

  const installable = connectors.filter((c) => c.manifest).length;

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)]">
      {/* Hero */}
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
            <span>{isEs ? "Conectores" : "Connectors"}</span>
          </div>
          <h1 className="text-[44px] md:text-[60px] font-semibold tracking-tight leading-[1.02]">
            {isEs ? "Tu Claude Code," : "Your Claude Code,"}
            <br />
            <span className="text-[var(--color-fg-muted)]">
              {isEs ? "con acceso a tu mundo." : "plugged into your world."}
            </span>
          </h1>
          <p className="mt-5 text-[16px] text-[var(--color-fg-muted)] max-w-2xl leading-relaxed">
            {isEs
              ? "Notion, Stripe, GitHub, Webflow, Supabase — configurá el conector una vez y viaja contigo a todas tus máquinas. Cifrado end-to-end, llaves en el Keychain del sistema."
              : "Notion, Stripe, GitHub, Webflow, Supabase — set up the connector once and it follows you to every machine. End-to-end encrypted, keys in your system Keychain."}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-2.5">
            <Stat value={connectors.length} label={isEs ? "conectores" : "connectors"} />
            <Stat value={installable} label={isEs ? "1-click install" : "1-click install"} />
            <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--color-fg-dim)] ml-1">
              · MCP standard
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pt-10 pb-14">
        <ConnectorsBrowser
          lang={lang}
          connectors={connectors}
          categoryLabels={categoryLabels}
          copy={{
            all: isEs ? "Todos" : "All",
            filterByCategory: isEs ? "Categoría" : "Category",
            oneClickInstall: isEs ? "1-click install" : "1-click install",
            empty: isEs
              ? "No hay conectores que matcheen estos filtros."
              : "No connectors match these filters.",
            clearFilters: isEs ? "Limpiar filtros" : "Clear filters",
            soon: isEs ? "Pronto" : "Soon",
          }}
        />
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-32">
        <Link
          href={`/${lang}/publishers`}
          className="group flex items-center justify-between gap-4 rounded-2xl border border-[var(--color-accent)]/25 bg-[var(--color-accent)]/5 hover:bg-[var(--color-accent)]/10 p-5 transition-colors"
        >
          <div>
            <p className="text-[13.5px] font-semibold tracking-tight text-[var(--color-fg-strong)]">
              {isEs
                ? "¿Construís conectores MCP? Publicalos acá."
                : "Building MCP connectors? Publish them here."}
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
