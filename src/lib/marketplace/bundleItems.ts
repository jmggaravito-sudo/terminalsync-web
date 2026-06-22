/**
 * Polymorphic bundle-item resolver.
 *
 * Bundles can contain items from three different pillars — connectors,
 * skills, and CLI tools — each with its own storage shape:
 *   - connector → row in `connector_listings` (fallback: markdown at
 *                 `content/connectors/<lang>/<slug>.md`)
 *   - skill     → markdown at `content/skills/<lang>/<slug>.md` only
 *                 (no DB table by design)
 *   - cli       → row in `cli_tool_listings` (fallback: markdown at
 *                 `content/cli-tools/<lang>/<slug>.md`)
 *
 * Callers shouldn't care which pillar an item lives in — they hand us a
 * `(kind, slug)` pair and we return a normalized `ResolvedBundleItem`
 * the bundle detail page can render directly.
 *
 * Items that don't resolve (deleted skill markdown, missing CLI row, etc.)
 * are silently dropped from `resolveBundleItems` so the public page never
 * 500s on a stale bundle row.
 */

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { manifestRequiresEnvSecrets } from "@/lib/marketplace/secrets";
import {
  deriveInstallFromManifest,
  mergeInstallFields,
  readInstallOverrideFromFrontmatter,
} from "@/lib/marketplace/installFields";

/**
 * Map from connector slug to the raw `manifest_json` payload pulled
 * from the latest active version row in `connector_versions`. Built
 * by [`loadDbConnectorManifests`] for the slugs a bundle references,
 * then passed into [`resolveBundleItems`] so the resolver can hydrate
 * DB-only connector items with the install fields + accurate
 * `requiresEnvSecrets` flag the desktop's Phase 2 install path needs.
 *
 * Treat as read-only: the resolver never mutates entries.
 */
export type ManifestBySlug = ReadonlyMap<string, unknown>;

export type BundleItemKind = "connector" | "skill" | "cli";

export interface BundleItemRef {
  kind: BundleItemKind;
  slug: string;
  sortOrder: number;
  /** Optional per-item rationale from the curator (e.g. "para responder
   *  mensajes sin tener que copiar y pegar"). Rendered on the public
   *  detail page so non-programmers know WHY each item belongs in the
   *  bundle without reading the kind badge. */
  whyItHelps?: string;
}

export interface ResolvedBundleItem {
  kind: BundleItemKind;
  slug: string;
  name: string;
  tagline: string;
  /** Carries through from BundleItemRef so the page can render the
   *  curator's plain-language rationale per item. */
  whyItHelps?: string;
  /** https URL or /public-relative path. May be empty when nothing is set. */
  logo: string;
  /** Best CTA URL for the kind: deep-link for connector w/ manifest,
   *  homepage for SaaS connector, internal /skills page for skill,
   *  install command for CLI (consumers can switch on `kind`). */
  ctaUrl: string;
  /** Internal detail page for the item, e.g. `/es/skills/code-reviewer`. */
  href: string;
  /** CLI-only: the install command to display in a code block. */
  installCommand?: string;
  /** Connector-only: whether the listing ships an MCP manifest. Drives
   *  whether `ctaUrl` is a `terminalsync://install` deep-link or the
   *  external SaaS homepage. */
  hasManifest?: boolean;
  /** Whether this item declares any `${SECRET:NAME}` placeholder (connector
   *  with such manifest) or has an `authCommand` (CLI). False for skills
   *  (they never need env secrets). Mirrors the same flag the top-level
   *  pillars expose (`ConnectorMeta.requiresEnvSecrets`, etc.) so the
   *  desktop's Explorar UI can compute its "necesita clave" chip uniformly
   *  across pillars. See `docs/browse-zone.md` (contrato 3 — aggregation
   *  rule for bundles uses `.some(i => i.requiresEnvSecrets)`).
   *
   *  IMPORTANT — by-design absence for marketplace-sourced connectors:
   *  When a bundle item references a slug that lives only in the Supabase
   *  `connector_listings` table (not in `content/connectors/`), the row
   *  doesn't carry the manifest inline — it lives in
   *  `connector_versions.manifest_json`. The catalog query doesn't join
   *  versions today, so we can't scan for secrets. Reported as `false`
   *  with the same caveat as `listMarketplaceConnectors` /
   *  `getMarketplaceConnector` in `lib/connectors.ts`. NOT a bug — see
   *  terminalsync-web#72/#74 and the comment in `connectors.ts:354`. */
  requiresEnvSecrets: boolean;
  sortOrder: number;
  /** Phase 2 install fields — same shape and semantics as
   *  `ConnectorMeta.installMethod` etc. Present when the bundle item
   *  is a markdown-sourced first-party connector whose manifest auto-
   *  derives to an install method (or the curator authored explicit
   *  override fields). Undefined for skills and CLI tools (no install
   *  recipe path), and undefined for DB-only marketplace connectors
   *  (no manifest in the row). The desktop Lab uses these to construct
   *  an `McpInstallSpec` for the Phase 2 install path when looping
   *  through bundle items on drag-drop. */
  installMethod?: string;
  installSpec?: string;
  installArgs?: string[];
  installEnv?: Record<string, string>;
}

const CONTENT_ROOT = path.join(process.cwd(), "content");

function resolveLangDir(pillarDir: string, lang: string): string {
  const dir = path.join(CONTENT_ROOT, pillarDir, lang);
  if (fs.existsSync(dir)) return dir;
  return path.join(CONTENT_ROOT, pillarDir, "en");
}

function readMarkdownFrontmatter(
  pillarDir: string,
  lang: string,
  slug: string,
): Record<string, unknown> | null {
  const dir = resolveLangDir(pillarDir, lang);
  const file = path.join(dir, `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  try {
    const raw = fs.readFileSync(file, "utf8");
    const { data } = matter(raw);
    return data as Record<string, unknown>;
  } catch {
    return null;
  }
}

function stringField(
  data: Record<string, unknown> | null,
  key: string,
): string {
  if (!data) return "";
  const v = data[key];
  return typeof v === "string" ? v.trim() : "";
}

async function resolveConnector(
  slug: string,
  lang: string,
  manifestBySlug?: ManifestBySlug,
): Promise<ResolvedBundleItem | null> {
  // Connectors live in the DB (`connector_listings`) but for first-party
  // ones the markdown file under `content/connectors/<lang>/<slug>.md` is
  // the source of truth (matches `getConnector()` lookup precedence).
  const fm = readMarkdownFrontmatter("connectors", lang, slug);
  if (fm) {
    const manifest = fm.manifest as
      | { mcpServers?: Record<string, unknown> }
      | undefined;
    const hasManifest =
      !!manifest &&
      typeof manifest === "object" &&
      !!manifest.mcpServers &&
      Object.keys(manifest.mcpServers).length > 0;
    // Same scan as `normalizeMeta` in `lib/connectors.ts` — short-circuits
    // on the first `${SECRET:NAME}` it finds. A connector without a
    // manifest can't require secrets.
    const requiresEnvSecrets =
      hasManifest && manifestRequiresEnvSecrets(manifest);
    const name = stringField(fm, "name") || slug;
    const tagline =
      stringField(fm, "tagline") || stringField(fm, "simpleSubtitle");
    const logo = stringField(fm, "logo") || `/connectors/${slug}.svg`;
    const cta = hasManifest
      ? `terminalsync://install/connector?slug=${encodeURIComponent(slug)}`
      : stringField(fm, "ctaUrl");
    const installDerived = hasManifest ? deriveInstallFromManifest(manifest) : {};
    const installOverride = readInstallOverrideFromFrontmatter(fm);
    const installFields = mergeInstallFields(installDerived, installOverride);
    return {
      kind: "connector",
      slug,
      name,
      tagline,
      logo,
      ctaUrl: cta,
      hasManifest,
      requiresEnvSecrets,
      href: `/${lang}/connectors/${slug}`,
      sortOrder: 0,
      installMethod: installFields.installMethod,
      installSpec: installFields.installSpec,
      installArgs: installFields.installArgs,
      installEnv: installFields.installEnv,
    };
  }

  const sb = getSupabaseAdmin();
  if (!sb) return null;
  try {
    const { data, error } = await sb
      .from("connector_listings")
      .select("slug, name, tagline, logo_url, cta_url, repo_url, source_url")
      .eq("slug", slug)
      .eq("status", "approved")
      .maybeSingle();
    if (error || !data) return null;
    const row = data as {
      slug: string;
      name: string;
      tagline: string;
      logo_url: string | null;
      cta_url: string | null;
      repo_url: string | null;
      source_url: string | null;
    };

    // Optional manifest pre-fetched in a single batch by the caller
    // (catalog route). When present, lift the install fields and
    // secret flag from it — same code path as the markdown branch
    // above, just sourced from `connector_versions.manifest_json`
    // instead of frontmatter. When absent (caller didn't pre-fetch,
    // version row missing, query failed), we fall back to the legacy
    // hardcoded `false` — terminalsync-web#74's documented gap.
    //
    // The bundle never breaks on absence: the item is still shown
    // with `hasManifest:false`, exactly as it does today.
    const manifest = manifestBySlug?.get(slug);
    const hasManifest =
      !!manifest &&
      typeof manifest === "object" &&
      !!(manifest as { mcpServers?: unknown }).mcpServers &&
      typeof (manifest as { mcpServers?: unknown }).mcpServers === "object" &&
      Object.keys(
        (manifest as { mcpServers: Record<string, unknown> }).mcpServers,
      ).length > 0;
    const requiresEnvSecrets =
      hasManifest && manifestRequiresEnvSecrets(manifest);
    const installFields = hasManifest
      ? deriveInstallFromManifest(manifest)
      : {};
    // When we have a manifest, prefer the deep-link CTA the desktop
    // recognizes for installable connectors — matches the markdown
    // branch's behavior. Otherwise fall back to whatever URL the row
    // carries (still surfaces affiliate / source links).
    const fallbackCta = row.cta_url ?? row.repo_url ?? row.source_url ?? "";
    const cta = hasManifest
      ? `terminalsync://install/connector?slug=${encodeURIComponent(row.slug)}`
      : fallbackCta;

    return {
      kind: "connector",
      slug: row.slug,
      name: row.name,
      tagline: row.tagline,
      logo: row.logo_url ?? `/connectors/${row.slug}.svg`,
      ctaUrl: cta,
      hasManifest,
      requiresEnvSecrets,
      href: `/${lang}/connectors/${row.slug}`,
      sortOrder: 0,
      installMethod: installFields.installMethod,
      installSpec: installFields.installSpec,
      installArgs: installFields.installArgs,
      installEnv: installFields.installEnv,
    };
  } catch {
    return null;
  }
}

function resolveSkill(slug: string, lang: string): ResolvedBundleItem | null {
  const fm = readMarkdownFrontmatter("skills", lang, slug);
  if (!fm) return null;
  const name = stringField(fm, "name") || slug;
  const tagline =
    stringField(fm, "tagline") || stringField(fm, "description");
  const logo = stringField(fm, "logo") || `/skills/${slug}.svg`;
  return {
    kind: "skill",
    slug,
    name,
    tagline,
    logo,
    // Skills are markdown-installed via the desktop app — the public
    // CTA is just a deep link to the skill's detail page.
    ctaUrl: `/${lang}/skills/${slug}`,
    href: `/${lang}/skills/${slug}`,
    // Skills never declare env secrets — see `SkillMeta.requiresEnvSecrets`
    // doc in `lib/skills.ts`. Any auth a skill needs comes from a sibling
    // connector/CLI, not from the skill itself.
    requiresEnvSecrets: false,
    sortOrder: 0,
  };
}

async function resolveCliTool(
  slug: string,
  lang: string,
): Promise<ResolvedBundleItem | null> {
  // CLI tools live in both shapes — markdown for hand-curated entries,
  // DB rows for auto-promoted ones. Markdown wins on collision (mirrors
  // `listCliTools()` precedence in src/lib/cliTools.ts).
  const fm = readMarkdownFrontmatter("cli-tools", lang, slug);
  if (fm) {
    const name = stringField(fm, "name") || slug;
    const tagline =
      stringField(fm, "tagline") || stringField(fm, "description");
    const logo = stringField(fm, "logo") || `/cli-tools/${slug}.svg`;
    const install = stringField(fm, "installCommand");
    const authCommand = stringField(fm, "authCommand");
    return {
      kind: "cli",
      slug,
      name,
      tagline,
      logo,
      ctaUrl: install,
      installCommand: install,
      // Same heuristic as `listCliTools` in `lib/cliTools.ts:219`: a CLI
      // tool needs setup iff it declares an `authCommand` (the explicit
      // login step the user must run after install).
      requiresEnvSecrets: Boolean(authCommand),
      href: `/${lang}/cli-tools/${slug}`,
      sortOrder: 0,
    };
  }

  const sb = getSupabaseAdmin();
  if (!sb) return null;
  try {
    const { data, error } = await sb
      .from("cli_tool_listings")
      .select("slug, name, tagline, logo_url, install_command, auth_command")
      .eq("slug", slug)
      .eq("status", "approved")
      .maybeSingle();
    if (error || !data) return null;
    const row = data as {
      slug: string;
      name: string;
      tagline: string;
      logo_url: string | null;
      install_command: string | null;
      auth_command: string | null;
    };
    return {
      kind: "cli",
      slug: row.slug,
      name: row.name,
      tagline: row.tagline,
      logo: row.logo_url ?? `/cli-tools/${row.slug}.svg`,
      ctaUrl: row.install_command ?? "",
      installCommand: row.install_command ?? undefined,
      // Same heuristic as `listCliTools` (DB branch) in `lib/cliTools.ts:162`:
      // `requiresEnvSecrets` iff an `auth_command` is present in the row.
      requiresEnvSecrets: Boolean(row.auth_command),
      href: `/${lang}/cli-tools/${row.slug}`,
      sortOrder: 0,
    };
  } catch {
    return null;
  }
}

/** Resolve a single (kind, slug) into a renderable bundle item. */
export async function resolveBundleItem(
  kind: BundleItemKind,
  slug: string,
  lang: string,
  manifestBySlug?: ManifestBySlug,
): Promise<ResolvedBundleItem | null> {
  switch (kind) {
    case "connector":
      return resolveConnector(slug, lang, manifestBySlug);
    case "skill":
      return resolveSkill(slug, lang);
    case "cli":
      return resolveCliTool(slug, lang);
    default:
      return null;
  }
}

/** Options for [`resolveBundleItems`]. Backward-compatible: every field
 *  is optional. Callers that don't care about install-field hydration
 *  for DB-only connector items can call `resolveBundleItems(refs, lang)`
 *  exactly as before. */
export interface ResolveBundleItemsOptions {
  /**
   * Pre-fetched manifests keyed by connector slug (see [`ManifestBySlug`]).
   * The catalog endpoint builds this map in a single batch query before
   * resolving items, so the resolver doesn't have to issue one query
   * per item to derive install fields for marketplace connectors.
   *
   * When omitted, DB-only connector items fall back to the legacy
   * behavior (`hasManifest:false`, no install fields) — same as the
   * pre-fix world. The bundle still renders all items; only the
   * install-field hydration is degraded.
   */
  manifestBySlug?: ManifestBySlug;
}

/** Resolve a list of bundle item refs in parallel. Items that don't
 *  resolve (deleted markdown, dropped DB row, etc.) are silently
 *  dropped from the result — the bundle page treats a missing item as
 *  "render one fewer card", never as an error. */
export async function resolveBundleItems(
  items: BundleItemRef[],
  lang: string,
  options?: ResolveBundleItemsOptions,
): Promise<ResolvedBundleItem[]> {
  const manifestBySlug = options?.manifestBySlug;
  const resolved = await Promise.all(
    items.map(async (it): Promise<ResolvedBundleItem | null> => {
      const r = await resolveBundleItem(it.kind, it.slug, lang, manifestBySlug);
      if (!r) return null;
      return { ...r, sortOrder: it.sortOrder, whyItHelps: it.whyItHelps };
    }),
  );
  return resolved
    .filter((r): r is ResolvedBundleItem => r !== null)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Batch-fetch the latest `manifest_json` for each connector slug a
 * bundle references, in a SINGLE Supabase query.
 *
 * Returns a `Map<slug, manifest_json>`. Slugs without an approved
 * listing — or whose listing has no version rows yet — are simply
 * absent from the map; the caller falls back to the legacy
 * `hasManifest:false` resolver branch for those.
 *
 * **Why batch + client-side dedupe (vs Supabase nested `.order().limit(1)`):**
 * The embedded-resource syntax for ordering + limiting a nested table
 * is fragile and easy to break on schema changes. Three lines of JS
 * `sort + [0]` per row is clearer, easier to test, and indifferent to
 * how PostgREST renames embedded selections.
 *
 * **Failure modes (all safe):**
 * - `slugs` empty → returns empty map without hitting the DB.
 * - PostgREST error → returns empty map (caller renders items with no
 *   install fields; bundle stays intact).
 * - Slug present but `connector_versions` empty array → slug is NOT
 *   in the map (resolver treats it as no-manifest).
 *
 * Exported because `loadBundles` in the catalog route uses it directly,
 * and so tests can exercise it without going through the route.
 */
export async function loadDbConnectorManifests(
  sb: SupabaseClient,
  slugs: readonly string[],
): Promise<Map<string, unknown>> {
  const out = new Map<string, unknown>();
  if (slugs.length === 0) return out;

  // De-dupe slugs to keep the IN-list compact (slugs come from
  // bundle_listings, which can legitimately reference the same
  // connector across multiple bundles).
  const unique = Array.from(new Set(slugs));

  try {
    const { data, error } = await sb
      .from("connector_listings")
      .select("slug, connector_versions(manifest_json, created_at)")
      .in("slug", unique)
      .eq("status", "approved");
    if (error || !data) return out;

    type VersionRow = {
      manifest_json: unknown;
      created_at: string;
    };
    type ListingRow = {
      slug: string;
      connector_versions: VersionRow[] | null;
    };

    for (const raw of data as ListingRow[]) {
      const versions = (raw.connector_versions ?? []).filter(
        (v): v is VersionRow =>
          !!v && v.manifest_json !== null && v.manifest_json !== undefined,
      );
      if (versions.length === 0) continue;
      // Pick newest version by created_at. Stable across PostgREST
      // version changes (we don't depend on the embedded result's
      // implicit order).
      versions.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
      out.set(raw.slug, versions[0].manifest_json);
    }
  } catch {
    // Defensive: any network / serialization error returns the empty
    // map. Caller renders bundle items with no install fields — the
    // bundle itself never crashes because of this fetch.
    return out;
  }
  return out;
}

/** Synchronous existence check used by the admin API to soft-validate
 *  that a (kind, slug) pair points at something real before inserting
 *  the bundle_listings row. Returns true even for misses — see comment
 *  in the API route. The caller can use this to emit warnings without
 *  blocking the insert. */
export async function bundleItemExists(
  kind: BundleItemKind,
  slug: string,
): Promise<boolean> {
  switch (kind) {
    case "connector": {
      const dir = resolveLangDir("connectors", "en");
      if (fs.existsSync(path.join(dir, `${slug}.md`))) return true;
      const sb = getSupabaseAdmin();
      if (!sb) return false;
      try {
        const { data } = await sb
          .from("connector_listings")
          .select("slug")
          .eq("slug", slug)
          .maybeSingle();
        return !!data;
      } catch {
        return false;
      }
    }
    case "skill": {
      const dir = resolveLangDir("skills", "en");
      return fs.existsSync(path.join(dir, `${slug}.md`));
    }
    case "cli": {
      const dir = resolveLangDir("cli-tools", "en");
      if (fs.existsSync(path.join(dir, `${slug}.md`))) return true;
      const sb = getSupabaseAdmin();
      if (!sb) return false;
      try {
        const { data } = await sb
          .from("cli_tool_listings")
          .select("slug")
          .eq("slug", slug)
          .maybeSingle();
        return !!data;
      } catch {
        return false;
      }
    }
    default:
      return false;
  }
}

export const BUNDLE_ITEM_KINDS: readonly BundleItemKind[] = [
  "connector",
  "skill",
  "cli",
] as const;

export function isBundleItemKind(value: unknown): value is BundleItemKind {
  return (
    typeof value === "string" &&
    (BUNDLE_ITEM_KINDS as readonly string[]).includes(value)
  );
}
