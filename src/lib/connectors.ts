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
import { manifestRequiresEnvSecrets } from "./marketplace/secrets";
import {
  deriveInstallFromManifest,
  mergeInstallFields,
  readInstallOverrideFromFrontmatter,
} from "./marketplace/installFields";

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
  /** True when the connector ships an MCP manifest (installable into a
   *  client config). False for affiliate-only listings whose only action
   *  is opening the upstream SaaS. Drives whether we show the "Add to
   *  Terminal Sync" deep-link CTA. */
  hasManifest: boolean;
  /** True when the manifest declares any `${SECRET:NAME}` placeholder.
   *  Catalog endpoint reads this so the panel can show a "necesita clave"
   *  badge — and so drag&drop can route to the install modal (which
   *  prompts for secrets) instead of dropping a half-installed entry.
   *
   *  False when:
   *    - The connector is affiliate-only (no manifest → no secrets).
   *    - The manifest exists but every env value is a literal.
   *    - The connector came from the Supabase marketplace (manifest lives
   *      in `connector_versions.manifest_json`, not in the row we list).
   *      Treat these as `false` until we widen the catalog scan to join
   *      versions — all hidden by migration 0017 today anyway.
   *
   *  IMPORTANT — what this flag does NOT mean:
   *  This flag is `requires-env-secrets`, NOT `requires-any-setup`. A
   *  connector whose auth runs through an OAuth browser flow (no env
   *  vars in the manifest) would read `false` here. That's correct for
   *  this flag's strict definition, but the panel must NOT treat
   *  `requiresEnvSecrets === false` as "installable one-click without
   *  friction". For that decision use `hasManifest && !requiresEnvSecrets`,
   *  and even then handle the case where the install flow needs OAuth
   *  out-of-band — see docs/browse-zone.md ("Necesita clave" indicator). */
  requiresEnvSecrets: boolean;
  /** Where this connector comes from. Drives the "By @publisher" badge. */
  source?: "first-party" | "marketplace";
  /** Original upstream author. For OSS MCPs this is the GitHub user/org
   *  that owns the repo we redistribute via `npx`. For SaaS-affiliate
   *  listings it's the vendor company. Every license we ship requires
   *  this — never publish without it. */
  originalAuthor?: string;
  originalAuthorUrl?: string;
  /** SPDX identifier ("MIT", "Apache-2.0", "GPL-3.0", "proprietary").
   *  Use "proprietary" for SaaS-affiliate listings — there's no code we
   *  redistribute, the user signs up with the vendor directly. */
  license?: string;
  /** Direct link to the LICENSE file when the upstream repo exposes one. */
  licenseUrl?: string;
  /** When true, the connector is suppressed from the public catalog.
   *  Used to retire connectors without losing their content. */
  hidden?: boolean;
  /** Marketplace-only fields. */
  pricingType?: "free" | "one_time";
  priceCents?: number | null;
  publisherDisplayName?: string;
  installCount?: number;
  ratingAvg?: number | null;
  /** Phase 2 install fields — only present when:
   *  (a) the connector ships an MCP manifest derivable to npm/local
   *      shape (auto-derive in `installFields::deriveInstallFromManifest`)
   *  (b) the curator authored explicit `installMethod`/`installSpec` in
   *      the connector frontmatter (override path)
   *
   *  Used by the desktop Lab's Phase 2 install backend (custom_mcps) to
   *  install community MCPs by slug. When both `installMethod` and
   *  `installSpec` are present, the Lab can drop-install the connector;
   *  when either is missing, the Lab falls back to a "necesita configurar"
   *  toast.
   *
   *  Marketplace-sourced (DB-only) connectors: undefined today — the
   *  catalog query doesn't join `connector_versions.manifest_json`. Path
   *  forward in terminalsync-web#74. */
  installMethod?: string;
  installSpec?: string;
  installArgs?: string[];
  installEnv?: Record<string, string>;
  /** Claude Customize parity (added 2026-06-02 per design doc D0): visible
   *  category in the desktop sidebar. Mirrors Claude's connector taxonomy:
   *  - "web" → SaaS APIs (Notion, Gmail, GitHub, Slack, etc.)
   *  - "desktop" → local/system tools (filesystem, memory, sqlite, postgres, etc.)
   *  When undefined, the desktop falls back to its own heuristic (probably
   *  bucketing by domain/transport). Required for items imported from
   *  Anthropic per PR-W2. */
  marketplaceCategory?: "web" | "desktop";
  /** Provenance tracking for the visual badge on the card. Anthropic-imported
   *  items get "anthropic"; TS-curated items get "ts-curated"; community
   *  third-party items get "community". The desktop renders a small badge
   *  with the corresponding label (PERSONALIZADO / INCLUIDO / Comunidad). */
  marketplaceSource?: "ts-curated" | "anthropic" | "community";
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
    const meta = normalizeMeta(file.replace(/\.md$/, ""), data);
    if (meta.hidden) continue; // Suppressed from the public catalog.
    metas.push(meta);
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
    const meta = normalizeMeta(slug, data);
    if (meta.hidden) return null; // Hidden connector → 404 on the detail page.
    const [simpleSrc, devSrc] = splitSimpleDev(content);
    const simpleHtml = await renderMarkdown(simpleSrc);
    const devHtml = await renderMarkdown(devSrc || simpleSrc);
    return { ...meta, simpleHtml, devHtml };
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
    .is("hidden_at", null)
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
    hasManifest: false,
    // Marketplace rows don't carry their manifest inline; the catalog
    // scan can't see secret placeholders without joining
    // connector_versions. Treat as `false` for now — all marketplace
    // rows are hidden by migration 0017 anyway.
    requiresEnvSecrets: false,
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
  const manifest = data.manifest as
    | { mcpServers?: Record<string, unknown> }
    | undefined;
  const hasManifest =
    !!manifest &&
    typeof manifest === "object" &&
    !!manifest.mcpServers &&
    Object.keys(manifest.mcpServers).length > 0;
  // Scan the manifest for `${SECRET:NAME}` placeholders. A connector
  // without a manifest can't require secrets — there's nothing to
  // install. `manifestRequiresEnvSecrets` short-circuits on first match.
  const requiresEnvSecrets = hasManifest && manifestRequiresEnvSecrets(manifest);
  // Phase 2 install fields: derive from manifest shape when possible
  // (single-server npx/-y or node /abs/path), let curator-authored
  // frontmatter overrides win. Result is undefined per-field when
  // we can't tell — the catalog endpoint passes them through and the
  // Lab decides if it can install.
  const installDerived = hasManifest
    ? deriveInstallFromManifest(manifest)
    : {};
  const installOverride = readInstallOverrideFromFrontmatter(data);
  const installFields = mergeInstallFields(installDerived, installOverride);
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
    hasManifest,
    requiresEnvSecrets,
    originalAuthor: get("originalAuthor") || undefined,
    originalAuthorUrl: get("originalAuthorUrl") || undefined,
    license: get("license") || undefined,
    licenseUrl: get("licenseUrl") || undefined,
    hidden: data.hidden === true,
    installMethod: installFields.installMethod,
    installSpec: installFields.installSpec,
    installArgs: installFields.installArgs,
    installEnv: installFields.installEnv,
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
    // Suppress every row hidden by migration 0017 (the auto-promoted
    // 525 with no author/license attribution). Re-enable per row by
    // clearing `hidden_at`.
    .is("hidden_at", null)
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
      // Marketplace listings (Supabase rows) don't ship a manifest in this
      // shape today — they're treated as external CTAs. When the marketplace
      // gains MCP manifests we'll flip this per-row.
      hasManifest: false,
      // Same constraint as `hasManifest`: the row doesn't expose the
      // manifest, so we can't scan for secrets here. Treat as false until
      // the listings query joins connector_versions.
      requiresEnvSecrets: false,
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
