/**
 * Connectors content loader.
 *
 * Two sources merge into the public `/connectors` catalog:
 *   1. First-party — Markdown files at `content/connectors/<lang>/<slug>.md`
 *      with YAML frontmatter. Curated by the TS team. Edit the .md files
 *      to update copy without a code change.
 *   2. Marketplace — third-party `connector_listings` rows in Supabase
 *      with status='approved'. Lives behind `listMarketplaceConnectors()`.
 *
 * Use `listAllConnectors(lang)` to get both sources merged for the index.
 */

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import { getSupabaseAdmin } from "./supabaseAdmin";

export interface ConnectorMeta {
  slug: string;
  name: string;
  logo: string; // path relative to /public, or absolute https URL for marketplace
  category:
    | "productivity"
    | "database"
    | "automation"
    | "storage"
    | "messaging"
    | "dev";
  status: "available" | "soon";
  simpleTitle: string;
  simpleSubtitle: string;
  devTitle: string;
  devSubtitle: string;
  /** Primary CTA — affiliate link when available, product page otherwise. */
  ctaUrl: string;
  /** Whether the CTA is an affiliate link (tracked via UTM). */
  affiliate: boolean;
  /** Short one-line tagline for the index card. */
  tagline: string;
  /** Where this connector comes from. Drives the "By @publisher" badge. */
  source?: "first-party" | "marketplace";
  /** Marketplace-only fields. */
  pricingType?: "free" | "one_time";
  priceCents?: number | null;
  publisherDisplayName?: string;
  installCount?: number;
  ratingAvg?: number | null;
}

export interface ConnectorDoc extends ConnectorMeta {
  /** Rendered HTML — the body below the frontmatter. */
  simpleHtml: string;
  devHtml: string;
}

const CONTENT_DIR = path.join(process.cwd(), "content", "connectors");

function resolveLangDir(lang: string): string {
  const dir = path.join(CONTENT_DIR, lang);
  if (fs.existsSync(dir)) return dir;
  return path.join(CONTENT_DIR, "en"); // fallback
}

export async function listConnectors(lang: string): Promise<ConnectorMeta[]> {
  const dir = resolveLangDir(lang);
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .sort();
  const metas: ConnectorMeta[] = [];
  for (const file of files) {
    const raw = fs.readFileSync(path.join(dir, file), "utf8");
    const { data } = matter(raw);
    metas.push(normalizeMeta(file.replace(/\.md$/, ""), data));
  }
  // Stable ordering: available first, then by frontmatter `order` if present, else name
  return metas.sort((a, b) => {
    if (a.status !== b.status) return a.status === "available" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

export async function getConnector(
  lang: string,
  slug: string,
): Promise<ConnectorDoc | null> {
  // Try first-party markdown first (curated content wins on collision).
  const dir = resolveLangDir(lang);
  const file = path.join(dir, `${slug}.md`);
  if (fs.existsSync(file)) {
    const raw = fs.readFileSync(file, "utf8");
    const { data, content } = matter(raw);
    const [simpleSrc, devSrc] = splitSimpleDev(content);
    const simpleHtml = await renderMarkdown(simpleSrc);
    const devHtml = await renderMarkdown(devSrc || simpleSrc);
    return { ...normalizeMeta(slug, data), simpleHtml, devHtml };
  }

  // Fallback to Supabase marketplace listing.
  return getMarketplaceConnector(slug);
}

async function getMarketplaceConnector(
  slug: string,
): Promise<ConnectorDoc | null> {
  const sb = getSupabaseAdmin();
  if (!sb) return null;
  const { data, error } = await sb
    .from("connector_listings")
    .select(`
      id, slug, name, tagline, category, logo_url,
      description_md, setup_md, cta_url, source_url, repo_url, demo_url,
      pricing_type, price_cents, install_count, rating_avg,
      publisher:publishers ( display_name )
    `)
    .eq("slug", slug)
    .eq("status", "approved")
    .maybeSingle();
  if (error || !data) return null;

  type Row = {
    id: string;
    slug: string;
    name: string;
    tagline: string;
    category: string;
    logo_url: string;
    description_md: string | null;
    setup_md: string | null;
    cta_url: string | null;
    source_url: string | null;
    repo_url: string | null;
    demo_url: string | null;
    pricing_type: string;
    price_cents: number | null;
    install_count: number;
    rating_avg: number | null;
    publisher: { display_name: string } | { display_name: string }[] | null;
  };
  const row = data as Row;
  const pub = Array.isArray(row.publisher) ? row.publisher[0] : row.publisher;
  const cta = row.cta_url ?? row.repo_url ?? row.source_url ?? "";

  // Simple view = tagline + description body. Dev view = setup_md when
  // present (install command + auth), else falls back to description.
  const simpleSrc = row.description_md ?? row.tagline ?? "";
  const devSrc = row.setup_md ?? simpleSrc;
  const [simpleHtml, devHtml] = await Promise.all([
    renderMarkdown(simpleSrc),
    renderMarkdown(devSrc),
  ]);

  return {
    slug: row.slug,
    name: row.name,
    logo: row.logo_url || `/connectors/${row.slug}.svg`,
    category: row.category as ConnectorMeta["category"],
    status: "available",
    simpleTitle: row.name,
    simpleSubtitle: row.tagline,
    devTitle: row.name,
    devSubtitle: row.tagline,
    ctaUrl: cta,
    affiliate: false,
    tagline: row.tagline,
    source: "marketplace",
    pricingType: row.pricing_type as "free" | "one_time",
    priceCents: row.price_cents,
    publisherDisplayName: pub?.display_name,
    installCount: row.install_count,
    ratingAvg: row.rating_avg,
    simpleHtml,
    devHtml,
  };
}

function splitSimpleDev(body: string): [string, string] {
  const idx = body.indexOf("\n--- dev ---");
  if (idx === -1) return [body.trim(), ""];
  return [body.slice(0, idx).trim(), body.slice(idx + "\n--- dev ---".length).trim()];
}

async function renderMarkdown(src: string): Promise<string> {
  if (!src) return "";
  const result = await remark().use(html).process(src);
  return String(result);
}

function normalizeMeta(slug: string, data: Record<string, unknown>): ConnectorMeta {
  const get = (k: string, fallback = ""): string =>
    (typeof data[k] === "string" ? (data[k] as string) : fallback).trim();
  return {
    slug,
    name: get("name", slug),
    logo: get("logo", `/connectors/${slug}.svg`),
    category: (get("category", "productivity") as ConnectorMeta["category"]),
    status: (get("status", "available") as ConnectorMeta["status"]),
    simpleTitle: get("simpleTitle"),
    simpleSubtitle: get("simpleSubtitle"),
    devTitle: get("devTitle"),
    devSubtitle: get("devSubtitle"),
    ctaUrl: get("ctaUrl"),
    affiliate: data.affiliate === true,
    tagline: get("tagline"),
  };
}

export async function listSlugs(): Promise<string[]> {
  // Prefer EN as canonical list of slugs.
  const dir = resolveLangDir("en");
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

/** Marketplace-sourced connectors (Supabase). Returns an empty array when
 *  the admin client isn't configured (local dev sandboxes) so the index
 *  page still renders the first-party catalog. */
export async function listMarketplaceConnectors(): Promise<ConnectorMeta[]> {
  const sb = getSupabaseAdmin();
  if (!sb) return [];
  const { data, error } = await sb
    .from("connector_listings")
    .select(`
      id, slug, name, tagline, category, logo_url,
      cta_url, source_url, repo_url, demo_url,
      pricing_type, price_cents, install_count, rating_avg,
      publisher:publishers ( display_name )
    `)
    .eq("status", "approved")
    // Hide marketplace items that never got a CTA URL — those are
    // garbage rows the auto-publish pass let through, no point
    // showing a card that links nowhere.
    .not("cta_url", "is", null)
    .order("install_count", { ascending: false });
  if (error || !data) return [];
  type Row = {
    id: string;
    slug: string;
    name: string;
    tagline: string;
    category: string;
    logo_url: string;
    cta_url: string | null;
    source_url: string | null;
    repo_url: string | null;
    demo_url: string | null;
    pricing_type: string;
    price_cents: number | null;
    install_count: number;
    rating_avg: number | null;
    publisher: { display_name: string } | { display_name: string }[] | null;
  };
  return (data as Row[]).map((row) => {
    const pub = Array.isArray(row.publisher) ? row.publisher[0] : row.publisher;
    const meta: ConnectorMeta = {
      slug: row.slug,
      name: row.name,
      logo: row.logo_url || `/connectors/${row.slug}.svg`,
      category: row.category as ConnectorMeta["category"],
      status: "available",
      simpleTitle: row.name,
      simpleSubtitle: row.tagline,
      devTitle: row.name,
      devSubtitle: row.tagline,
      ctaUrl: row.cta_url ?? row.repo_url ?? row.source_url ?? "",
      affiliate: false,
      tagline: row.tagline,
      source: "marketplace",
      pricingType: row.pricing_type as "free" | "one_time",
      priceCents: row.price_cents,
      publisherDisplayName: pub?.display_name,
      installCount: row.install_count,
      ratingAvg: row.rating_avg,
    };
    return meta;
  });
}

/** Merged catalog for the public /connectors index. Marketplace listings
 *  appear after first-party in the default ordering; the index page can
 *  re-sort by rating, recency, etc. First-party slugs win on collision. */
export async function listAllConnectors(lang: string): Promise<ConnectorMeta[]> {
  const [firstParty, marketplace] = await Promise.all([
    listConnectors(lang).then((items) => items.map((m) => ({ ...m, source: "first-party" as const }))),
    listMarketplaceConnectors(),
  ]);
  const seen = new Set(firstParty.map((m) => m.slug));
  const merged = [...firstParty, ...marketplace.filter((m) => !seen.has(m.slug))];
  return merged;
}
