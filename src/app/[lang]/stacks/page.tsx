import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Package, ShoppingBag } from "lucide-react";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import {
  isBundleItemKind,
  resolveBundleItems,
  type BundleItemKind,
  type BundleItemRef,
  type ResolvedBundleItem,
} from "@/lib/marketplace/bundleItems";
import { initialsFrom } from "@/components/marketplace/initialsFrom";

export const revalidate = 60;

interface Props {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const isEs = lang === "es";
  const title = isEs
    ? "Stack Packs · TerminalSync"
    : "Stack Packs · TerminalSync";
  const description = isEs
    ? "Paquetes curados de conectores, skills y CLIs listos para tu negocio. Un click, una compra, todo configurado."
    : "Curated bundles of connectors, skills, and CLI tools ready for your business. One click, one purchase, all configured.";
  return { title, description, openGraph: { title, description } };
}

interface BundleCard {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  hero_image_url: string | null;
  price_cents: number;
  currency: string;
  purchase_count: number;
  items: ResolvedBundleItem[];
}

async function fetchBundles(lang: string): Promise<BundleCard[]> {
  const sb = getSupabaseAdmin();
  if (!sb) return [];
  const { data: bundles, error } = await sb
    .from("bundles")
    .select(
      "id, slug, name, tagline, hero_image_url, price_cents, currency, purchase_count, sort_order",
    )
    .eq("status", "active")
    .order("sort_order", { ascending: true });
  if (error || !bundles || bundles.length === 0) return [];

  const linksRes = await sb
    .from("bundle_listings")
    .select("bundle_id, kind, item_slug, sort_order")
    .in("bundle_id", bundles.map((b) => b.id));

  type Row = {
    bundle_id: string;
    kind: BundleItemKind;
    item_slug: string;
    sort_order: number;
  };
  const refsByBundle = new Map<string, BundleItemRef[]>();
  for (const raw of linksRes.data ?? []) {
    const row = raw as Row;
    if (!isBundleItemKind(row.kind)) continue;
    const arr = refsByBundle.get(row.bundle_id) ?? [];
    arr.push({ kind: row.kind, slug: row.item_slug, sortOrder: row.sort_order });
    refsByBundle.set(row.bundle_id, arr);
  }

  return Promise.all(
    bundles.map(async (b) => {
      const refs = refsByBundle.get(b.id) ?? [];
      const items = await resolveBundleItems(refs, lang);
      return { ...b, items };
    }),
  );
}

function formatPrice(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function inclusionLine(items: ResolvedBundleItem[], isEs: boolean): string {
  const counts = { connector: 0, skill: 0, cli: 0 };
  for (const it of items) counts[it.kind]++;
  const parts: string[] = [];
  if (counts.connector > 0)
    parts.push(`${counts.connector} ${isEs ? "conectores" : "connectors"}`);
  if (counts.skill > 0)
    parts.push(`${counts.skill} ${isEs ? "skills" : "skills"}`);
  if (counts.cli > 0)
    parts.push(`${counts.cli} CLI`);
  return parts.join(" · ");
}

export default async function StacksIndex({ params }: Props) {
  const { lang } = await params;
  const isEs = lang === "es";
  const bundles = await fetchBundles(lang);

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)]">
      <section className="mx-auto max-w-5xl px-6 pt-20 pb-10 text-center">
        <span className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--color-accent)] border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 px-3 py-1 rounded-full">
          <Package size={12} strokeWidth={2.4} />
          {isEs ? "Stack Packs" : "Stack Packs"}
        </span>
        <h1
          className="mt-5 font-semibold tracking-tight leading-[1.05]"
          style={{ fontSize: "clamp(2rem, 5.5vw, 3.5rem)" }}
        >
          {isEs
            ? "Paquetes listos para tu trabajo."
            : "Bundles ready for your work."}
        </h1>
        <p className="mt-5 text-[15.5px] text-[var(--color-fg-muted)] max-w-2xl mx-auto leading-relaxed">
          {isEs
            ? "Conectores, skills y CLIs curados para casos de uso reales. Un solo pago, instalación automática en TerminalSync, garantía de 14 días."
            : "Connectors, skills, and CLI tools curated for real use cases. One-time payment, automatic install in TerminalSync, 14-day guarantee."}
        </p>
      </section>

      {bundles.length === 0 ? (
        <section className="mx-auto max-w-3xl px-6 pb-32">
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-8 text-center">
            <ShoppingBag size={32} className="mx-auto text-[var(--color-fg-dim)]" />
            <p className="mt-4 text-[14px] text-[var(--color-fg-muted)]">
              {isEs
                ? "Estamos preparando los primeros Stack Packs. Vuelvé pronto."
                : "We're preparing the first Stack Packs. Check back soon."}
            </p>
          </div>
        </section>
      ) : (
        <section className="mx-auto max-w-5xl px-6 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {bundles.map((b) => (
              <BundleCardItem key={b.id} bundle={b} lang={lang} />
            ))}
          </div>
        </section>
      )}

      {/* Trust footer — guarantee + how it works */}
      <section className="mx-auto max-w-3xl px-6 pb-24">
        <div className="rounded-3xl border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/5 p-7 text-center">
          <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--color-accent)] mb-3">
            {isEs ? "Cómo funciona" : "How it works"}
          </p>
          <ol className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-[13.5px] text-[var(--color-fg)] text-left max-w-2xl mx-auto">
            <li className="flex gap-3">
              <span className="shrink-0 h-7 w-7 rounded-full bg-[var(--color-accent)] text-white flex items-center justify-center text-[12px] font-bold">
                1
              </span>
              <span>
                {isEs ? "Comprás el pack que más se ajusta a tu negocio." : "Buy the pack that fits your business."}
              </span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 h-7 w-7 rounded-full bg-[var(--color-accent)] text-white flex items-center justify-center text-[12px] font-bold">
                2
              </span>
              <span>
                {isEs
                  ? "Abrís TerminalSync y todo aparece instalado."
                  : "Open TerminalSync and everything is already installed."}
              </span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 h-7 w-7 rounded-full bg-[var(--color-accent)] text-white flex items-center justify-center text-[12px] font-bold">
                3
              </span>
              <span>
                {isEs
                  ? "Tu IA empieza a usar tus apps reales en 5 minutos."
                  : "Your AI starts using your real apps within 5 minutes."}
              </span>
            </li>
          </ol>
          <p className="mt-6 text-[12px] text-[var(--color-fg-muted)]">
            {isEs
              ? "Garantía 14 días. Si no te sirve, te devolvemos el dinero — sin preguntas."
              : "14-day guarantee. If it doesn't fit, full refund — no questions."}
          </p>
        </div>
      </section>
    </main>
  );
}

function BundleCardItem({ bundle, lang }: { bundle: BundleCard; lang: string }) {
  const isEs = lang === "es";
  const price = formatPrice(bundle.price_cents, bundle.currency);
  const summary = inclusionLine(bundle.items, isEs);
  return (
    <Link
      href={`/${lang}/stacks/${bundle.slug}`}
      className="group relative rounded-3xl border border-[var(--color-border)] bg-[var(--color-panel)] p-6 transition-all hover:border-[var(--color-accent)]/40 hover:shadow-lg hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[20px] font-semibold tracking-tight">
            {bundle.name}
          </h3>
          <p className="mt-1.5 text-[13.5px] text-[var(--color-fg-muted)] leading-relaxed">
            {bundle.tagline}
          </p>
        </div>
        <span className="inline-flex shrink-0 items-baseline rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] px-3 py-1.5 text-[14px] font-semibold">
          {price}
        </span>
      </div>

      {/* Mixed-pillar logos preview (no kind chips here — just visual mix). */}
      <div className="mt-5 flex items-center gap-2">
        {bundle.items.slice(0, 6).map((it) => (
          <div
            key={`${it.kind}:${it.slug}`}
            className="h-8 w-8 rounded-lg bg-[var(--color-panel-2)] border border-[var(--color-border)] flex items-center justify-center overflow-hidden"
            title={`${it.name} (${it.kind})`}
          >
            {it.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={it.logo} alt={it.name} className="h-5 w-5 object-contain" />
            ) : (
              <span className="text-[10px] font-mono text-[var(--color-fg-dim)]">
                {initialsFrom(it.name)}
              </span>
            )}
          </div>
        ))}
        {bundle.items.length > 6 && (
          <span className="text-[11px] font-mono text-[var(--color-fg-dim)]">
            +{bundle.items.length - 6}
          </span>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <span className="text-[12px] text-[var(--color-fg-dim)]">
          {summary || `${bundle.items.length} ${isEs ? "ítems" : "items"}`}
          {bundle.purchase_count > 0 && (
            <> · {bundle.purchase_count} {isEs ? "compras" : "buyers"}</>
          )}
        </span>
        <span className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-[var(--color-accent)] group-hover:translate-x-0.5 transition-transform">
          {isEs ? "Ver detalle" : "See details"} <ArrowRight size={13} />
        </span>
      </div>
    </Link>
  );
}
