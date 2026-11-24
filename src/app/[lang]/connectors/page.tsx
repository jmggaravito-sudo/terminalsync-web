import type { Metadata } from "next";
import Image from "next/image";
import { CategoryBar, DragStrip } from "@/components/landing/CatalogChrome";
import { LandingBFooter } from "@/components/landing-b/LandingBFooter";
import { Sparkles } from "lucide-react";
import { listAllConnectors } from "@/lib/connectors";
import { ConnectorsExplorer } from "./Explorer";
import { ApCatalogExplorer } from "./ApCatalogExplorer";

export const revalidate = 3600; // hourly — edits to .md files picked up on next deploy

interface Props {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const title =
    lang === "es"
      ? "Connectors · TS"
      : "Connectors · TS";
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
    <div className="landing-b-theme min-h-screen">
      <CategoryBar lang={lang} active="connectors" />
      <section className="mx-auto max-w-6xl px-5 pb-8 pt-10 md:px-8 md:pt-14">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:gap-12">
          <div>
            <div className="mb-4 flex items-center gap-2 text-[11px] font-mono font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)]">
              <Sparkles size={14} />
              <span>{lang === "es" ? "Conectores" : "Connectors"}</span>
            </div>
            <h1 className="max-w-[17ch] text-[38px] font-semibold leading-[1.04] tracking-[-0.04em] md:text-[54px]">
              {lang === "es"
                ? "Tu Claude Code, con acceso a tu mundo."
                : "Your Claude Code, plugged into your world."}
            </h1>
            <p className="mt-4 max-w-2xl text-[15.5px] leading-relaxed text-[var(--color-fg-muted)] md:text-[17px]">
              {lang === "es"
                ? "Notion, Supabase, Make, Gmail, Drive — configurá el conector una vez y viaja contigo a todas tus máquinas. Cifrado end-to-end, llaves en el Keychain del sistema."
                : "Notion, Supabase, Make, Gmail, Drive — set up the connector once and it follows you to every machine. End-to-end encrypted, keys in your system Keychain."}
            </p>
            <p className="mt-5 inline-flex items-center rounded-full border border-[#ded7fb] bg-white px-3.5 py-2 text-[12px] font-semibold text-[#5a37d6] shadow-[0_6px_18px_-14px_rgba(106,72,232,0.4)]">
              {connectors.length} {lang === "es" ? "conectores del catálogo principal" : "connectors in the main catalog"}
            </p>
            <p className="mt-2 max-w-md text-[12px] leading-relaxed text-[var(--color-fg-muted)]">
              {lang === "es"
                ? "El catálogo ampliado de integraciones está más abajo."
                : "The expanded integrations catalog is below."}
            </p>
          </div>

          <div className="overflow-hidden rounded-[26px] border border-[#e2e4e9] bg-white p-1.5 shadow-[0_24px_60px_-36px_rgba(34,24,78,0.38)]">
            <Image
              src={isEs ? "/landing-b/assets/ts-corporate-poster-es.jpg" : "/landing-b/assets/ts-corporate-poster-en.jpg"}
              alt={isEs
                ? "TerminalSync en una computadora, mostrando espacios de trabajo separados por proyecto, cliente y área."
                : "TerminalSync on a computer, showing workspaces separated by project, client and team."}
              width={1920}
              height={1080}
              priority
              sizes="(max-width: 1024px) 100vw, 48vw"
              className="aspect-video w-full rounded-[20px] object-cover"
            />
          </div>
        </div>
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

      <ApCatalogExplorer lang={lang} />

      <DragStrip lang={lang} />
      <LandingBFooter lang={lang} />
    </div>
  );
}
