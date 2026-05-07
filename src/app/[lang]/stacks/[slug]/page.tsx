import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, Download, Package } from "lucide-react";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { BuyButton } from "./BuyButton";

export const revalidate = 60;

interface Props {
  params: Promise<{ lang: string; slug: string }>;
}

interface BundleDetail {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description_md: string;
  hero_subtitle: string | null;
  hero_image_url: string | null;
  price_cents: number;
  currency: string;
  purchase_count: number;
  listings: {
    id: string;
    slug: string;
    name: string;
    tagline: string;
    category: string;
    logo_url: string;
    description_md: string;
  }[];
}

async function fetchBundle(slug: string): Promise<BundleDetail | null> {
  const sb = getSupabaseAdmin();
  if (!sb) return null;
  const bundleRes = await sb
    .from("bundles")
    .select(
      "id, slug, name, tagline, description_md, hero_subtitle, hero_image_url, price_cents, currency, purchase_count",
    )
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();
  if (bundleRes.error || !bundleRes.data) return null;

  const linksRes = await sb
    .from("bundle_listings")
    .select(
      "sort_order, listing:connector_listings(id, slug, name, tagline, category, logo_url, description_md)",
    )
    .eq("bundle_id", bundleRes.data.id);

  type Link = {
    sort_order: number;
    listing: BundleDetail["listings"][number] | null;
  };
  const links = (linksRes.data ?? []) as unknown as Link[];
  const listings = links
    .filter((l) => l.listing !== null)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((l) => l.listing!);

  return { ...bundleRes.data, listings };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const bundle = await fetchBundle(slug);
  if (!bundle) return {};
  const isEs = lang === "es";
  const title = `${bundle.name} · TerminalSync Stack Pack`;
  const description = bundle.hero_subtitle ?? bundle.tagline;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: bundle.hero_image_url
        ? [{ url: bundle.hero_image_url, width: 1200, height: 630, alt: bundle.name }]
        : undefined,
    },
    alternates: {
      canonical: `https://terminalsync.ai/${lang}/stacks/${bundle.slug}`,
      languages: {
        es: `https://terminalsync.ai/es/stacks/${bundle.slug}`,
        en: `https://terminalsync.ai/en/stacks/${bundle.slug}`,
      },
    },
  };
}

function formatPrice(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

export default async function BundleDetailPage({ params }: Props) {
  const { lang, slug } = await params;
  const bundle = await fetchBundle(slug);
  if (!bundle) notFound();
  const isEs = lang === "es";
  const price = formatPrice(bundle.price_cents, bundle.currency);

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)]">
      {/* Hero */}
      <section className="relative mx-auto max-w-5xl px-6 pt-16 sm:pt-20 pb-12">
        <Link
          href={`/${lang}/stacks`}
          className="text-[12px] font-mono uppercase tracking-[0.14em] text-[var(--color-fg-dim)] hover:text-[var(--color-accent)] transition-colors"
        >
          ← Stack Packs
        </Link>
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-8 items-start">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--color-accent)] border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 px-2.5 py-1 rounded-full">
              <Package size={10} strokeWidth={2.4} />
              Stack Pack
            </span>
            <h1
              className="mt-4 font-semibold tracking-tight leading-[1.05]"
              style={{ fontSize: "clamp(1.875rem, 5vw, 3rem)" }}
            >
              {bundle.name}
            </h1>
            <p className="mt-4 text-[16px] text-[var(--color-fg-muted)] leading-relaxed">
              {bundle.hero_subtitle ?? bundle.tagline}
            </p>
            {bundle.purchase_count > 0 && (
              <p className="mt-3 text-[12px] font-mono text-[var(--color-fg-dim)]">
                {bundle.purchase_count}{" "}
                {isEs ? "personas ya tienen este pack" : "people already own this pack"}
              </p>
            )}
          </div>

          {/* Price card */}
          <aside className="rounded-3xl border border-[var(--color-accent)]/30 bg-gradient-to-br from-[var(--color-accent)]/8 via-[var(--color-panel)] to-[var(--color-claude)]/5 p-6 lg:p-7">
            <div className="flex items-baseline gap-2">
              <span className="text-[32px] font-semibold text-[var(--color-fg-strong)]">
                {price}
              </span>
              <span className="text-[12px] text-[var(--color-fg-dim)]">
                {isEs ? "pago único" : "one-time"}
              </span>
            </div>
            <p className="mt-2 text-[12.5px] text-[var(--color-fg-muted)]">
              {isEs
                ? `Incluye ${bundle.listings.length} conectores configurados.`
                : `Includes ${bundle.listings.length} configured connectors.`}
            </p>
            <div className="mt-5">
              <Suspense fallback={null}>
                <BuyButton lang={lang} slug={bundle.slug} />
              </Suspense>
            </div>
            <ul className="mt-5 space-y-2 text-[12.5px] text-[var(--color-fg-muted)]">
              <li className="flex gap-2 items-start">
                <CheckCircle2 size={13} className="mt-0.5 text-[var(--color-ok)] shrink-0" strokeWidth={2.4} />
                <span>{isEs ? "Instalación automática en TerminalSync" : "Automatic install in TerminalSync"}</span>
              </li>
              <li className="flex gap-2 items-start">
                <CheckCircle2 size={13} className="mt-0.5 text-[var(--color-ok)] shrink-0" strokeWidth={2.4} />
                <span>{isEs ? "Garantía 14 días, devolución total" : "14-day guarantee, full refund"}</span>
              </li>
              <li className="flex gap-2 items-start">
                <ShieldCheck size={13} className="mt-0.5 text-[var(--color-ok)] shrink-0" strokeWidth={2.4} />
                <span>
                  {isEs ? "Pago seguro vía Stripe" : "Secure payment via Stripe"}
                </span>
              </li>
            </ul>
          </aside>
        </div>
      </section>

      {/* What's included */}
      <section className="mx-auto max-w-5xl px-6 pb-12">
        <h2 className="text-[14px] font-mono uppercase tracking-[0.16em] text-[var(--color-fg-muted)] mb-5">
          {isEs ? "Qué incluye" : "What's included"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {bundle.listings.map((l) => (
            <article
              key={l.id}
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5"
            >
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-[var(--color-panel-2)] border border-[var(--color-border)] flex items-center justify-center overflow-hidden shrink-0">
                  {l.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={l.logo_url} alt={l.name} className="h-6 w-6 object-contain" />
                  ) : (
                    <span className="text-[11px] font-mono text-[var(--color-fg-dim)]">
                      {l.name.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="text-[14px] font-semibold tracking-tight">{l.name}</h3>
                  <p className="mt-1 text-[12.5px] text-[var(--color-fg-muted)] leading-relaxed line-clamp-2">
                    {l.tagline}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Description (markdown rendered as plain text for now) */}
      {bundle.description_md && (
        <section className="mx-auto max-w-3xl px-6 pb-12">
          <h2 className="text-[14px] font-mono uppercase tracking-[0.16em] text-[var(--color-fg-muted)] mb-4">
            {isEs ? "Por qué este pack" : "Why this pack"}
          </h2>
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-6">
            <pre className="whitespace-pre-wrap font-sans text-[14px] text-[var(--color-fg)] leading-relaxed">
              {bundle.description_md}
            </pre>
          </div>
        </section>
      )}

      {/* Trust + how it works */}
      <section className="mx-auto max-w-3xl px-6 pb-24">
        <div className="rounded-3xl border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/5 p-7">
          <div className="flex items-start gap-3">
            <Download size={20} className="text-[var(--color-accent)] shrink-0 mt-1" strokeWidth={2.2} />
            <div>
              <h3 className="text-[15px] font-semibold tracking-tight">
                {isEs ? "Necesitás TerminalSync para usarlo" : "You need TerminalSync to use it"}
              </h3>
              <p className="mt-2 text-[13px] text-[var(--color-fg-muted)] leading-relaxed">
                {isEs
                  ? "Los conectores se instalan automáticamente en la app de TerminalSync (gratis para descargar). Si todavía no la tenés, te llevamos al download después de la compra."
                  : "Connectors install automatically in the TerminalSync app (free download). If you don't have it yet, we'll point you to the download after purchase."}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
