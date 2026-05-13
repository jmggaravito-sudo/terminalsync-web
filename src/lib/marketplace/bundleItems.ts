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
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

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
  sortOrder: number;
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
    const name = stringField(fm, "name") || slug;
    const tagline =
      stringField(fm, "tagline") || stringField(fm, "simpleSubtitle");
    const logo = stringField(fm, "logo") || `/connectors/${slug}.svg`;
    const cta = hasManifest
      ? `terminalsync://install/connector?slug=${encodeURIComponent(slug)}`
      : stringField(fm, "ctaUrl");
    return {
      kind: "connector",
      slug,
      name,
      tagline,
      logo,
      ctaUrl: cta,
      hasManifest,
      href: `/${lang}/connectors/${slug}`,
      sortOrder: 0,
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
    const cta = row.cta_url ?? row.repo_url ?? row.source_url ?? "";
    return {
      kind: "connector",
      slug: row.slug,
      name: row.name,
      tagline: row.tagline,
      logo: row.logo_url ?? `/connectors/${row.slug}.svg`,
      ctaUrl: cta,
      hasManifest: false,
      href: `/${lang}/connectors/${row.slug}`,
      sortOrder: 0,
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
    return {
      kind: "cli",
      slug,
      name,
      tagline,
      logo,
      ctaUrl: install,
      installCommand: install,
      href: `/${lang}/cli-tools/${slug}`,
      sortOrder: 0,
    };
  }

  const sb = getSupabaseAdmin();
  if (!sb) return null;
  try {
    const { data, error } = await sb
      .from("cli_tool_listings")
      .select("slug, name, tagline, logo_url, install_command")
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
    };
    return {
      kind: "cli",
      slug: row.slug,
      name: row.name,
      tagline: row.tagline,
      logo: row.logo_url ?? `/cli-tools/${row.slug}.svg`,
      ctaUrl: row.install_command ?? "",
      installCommand: row.install_command ?? undefined,
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
): Promise<ResolvedBundleItem | null> {
  switch (kind) {
    case "connector":
      return resolveConnector(slug, lang);
    case "skill":
      return resolveSkill(slug, lang);
    case "cli":
      return resolveCliTool(slug, lang);
    default:
      return null;
  }
}

/** Resolve a list of bundle item refs in parallel. Items that don't
 *  resolve (deleted markdown, dropped DB row, etc.) are silently
 *  dropped from the result — the bundle page treats a missing item as
 *  "render one fewer card", never as an error. */
export async function resolveBundleItems(
  items: BundleItemRef[],
  lang: string,
): Promise<ResolvedBundleItem[]> {
  const resolved = await Promise.all(
    items.map(async (it): Promise<ResolvedBundleItem | null> => {
      const r = await resolveBundleItem(it.kind, it.slug, lang);
      if (!r) return null;
      return { ...r, sortOrder: it.sortOrder, whyItHelps: it.whyItHelps };
    }),
  );
  return resolved
    .filter((r): r is ResolvedBundleItem => r !== null)
    .sort((a, b) => a.sortOrder - b.sortOrder);
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
