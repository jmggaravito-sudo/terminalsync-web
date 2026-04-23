import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { listConnectors, type ConnectorMeta } from "@/lib/connectors";
import { ConnectorLogo } from "./Logo";

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
  const connectors = await listConnectors(lang);
  const categoryLabels = lang === "es" ? CATEGORY_LABELS_ES : CATEGORY_LABELS_EN;

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

      <section className="mx-auto max-w-5xl px-6 pb-32">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {connectors.map((c) => (
            <ConnectorCard
              key={c.slug}
              lang={lang}
              connector={c}
              categoryLabel={categoryLabels[c.category] || c.category}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

function ConnectorCard({
  lang,
  connector,
  categoryLabel,
}: {
  lang: string;
  connector: ConnectorMeta;
  categoryLabel: string;
}) {
  const soon = connector.status === "soon";
  return (
    <Link
      href={`/${lang}/connectors/${connector.slug}`}
      className={`group relative rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5 transition-all hover:border-[var(--color-accent)]/40 hover:shadow-lg hover:-translate-y-0.5 ${
        soon ? "opacity-70" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="h-11 w-11 rounded-xl bg-[var(--color-panel-2)] border border-[var(--color-border)] flex items-center justify-center overflow-hidden">
          <ConnectorLogo src={connector.logo} size={28} className="h-7 w-7" />
        </div>
        <ArrowUpRight
          size={16}
          className="text-[var(--color-fg-dim)] group-hover:text-[var(--color-accent)] transition-colors shrink-0 mt-1"
        />
      </div>

      <div className="mt-4 flex items-center gap-2">
        <h3 className="text-[16px] font-semibold tracking-tight">
          {connector.name}
        </h3>
        {soon && (
          <span className="text-[10px] font-mono uppercase tracking-[0.12em] border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 text-[var(--color-accent)] rounded px-1.5 py-0.5">
            {lang === "es" ? "Pronto" : "Soon"}
          </span>
        )}
      </div>
      <p className="mt-1 text-[13px] text-[var(--color-fg-muted)] leading-relaxed">
        {connector.tagline}
      </p>

      <div className="mt-4 pt-3 border-t border-[var(--color-border)]/50 text-[11px] text-[var(--color-fg-dim)] font-mono uppercase tracking-[0.1em]">
        {categoryLabel}
      </div>
    </Link>
  );
}
