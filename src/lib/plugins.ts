/**
 * Plugins content loader.
 *
 * A Plugin is a "product pack": it BUNDLES a connector (the tools layer) with
 * the skill(s) that teach the agent to use it well (the know-how layer) — one
 * install, one card that "just works". See content/plugins/RULES.md.
 *
 * The key idea is COMPOSITION: a plugin file references existing connector and
 * skill slugs and the loader resolves them by slug. A plugin never duplicates
 * connector/skill content — it is glue, not a copy. This mirrors the native
 * Claude Code plugin (skills/ + .mcp.json), so the desktop can install a
 * TerminalSync Plugin as a standard Claude Code plugin.
 *
 * Fase 0 (this file): the contract + loader. Public pilot plugins land in
 * Fase 1 once we have connector+skill pairs (or short usage-skills) to bundle.
 */

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import { getConnector, type ConnectorMeta } from "./connectors";
import { getSkill, type SkillMeta } from "./skills";

export type PluginCategory =
  | "marketing"
  | "sales"
  | "productivity"
  | "communication"
  | "operations"
  | "ecommerce"
  | "dev";

export interface PluginMeta {
  slug: string;
  name: string;
  logo: string;
  category: PluginCategory;
  status: "available" | "soon";
  tagline: string;
  description: string;
  author: string;
  marketplaceSource?: "terminalsync" | "ts-curated" | "anthropic" | "community";
  /** Slug of the connector this plugin bundles (its tools layer). Optional: a
   *  plugin may be skill-only, but its value is highest when it bundles both. */
  connectorSlug?: string;
  /** Slugs of the skills this plugin bundles (its know-how layer). */
  skillSlugs: string[];
  /** Ships natively with the app, not installable — mirrors SkillMeta.included. */
  included?: boolean;
  /** Suppressed from the public catalog without losing content. */
  hidden?: boolean;
  /** Pending evaluation: excluded like `hidden` but semantically distinct. */
  catalogReady?: boolean;
}

export interface PluginDoc extends PluginMeta {
  bodyHtml: string;
  /** Resolved pieces, composed by slug (never duplicated in the plugin file). */
  connector: ConnectorMeta | null;
  skills: SkillMeta[];
}

const CONTENT_DIR = path.join(process.cwd(), "content", "plugins");

function resolveLangDir(lang: string): string {
  const dir = path.join(CONTENT_DIR, lang);
  if (fs.existsSync(dir)) return dir;
  return path.join(CONTENT_DIR, "en");
}

/** A plugin must reference at least one real piece (a connector or a skill). */
export function isValidPlugin(meta: Pick<PluginMeta, "connectorSlug" | "skillSlugs">): boolean {
  return Boolean(meta.connectorSlug) || meta.skillSlugs.length > 0;
}

/** Pure composer: merges a plugin's metadata with its resolved pieces. Kept
 *  pure (no IO) so the composition contract is unit-testable. */
export function composePlugin(
  meta: PluginMeta,
  connector: ConnectorMeta | null,
  skills: SkillMeta[],
  bodyHtml: string,
): PluginDoc {
  return { ...meta, connector, skills, bodyHtml };
}

export function normalizeMeta(slug: string, data: Record<string, unknown>): PluginMeta {
  const get = (k: string, fallback = ""): string =>
    (typeof data[k] === "string" ? (data[k] as string) : fallback).trim();
  const skillSlugs = Array.isArray(data.skillSlugs)
    ? data.skillSlugs.map((s) => String(s).trim()).filter(Boolean)
    : [];
  const connectorSlug = get("connectorSlug") || undefined;
  const marketplaceSourceRaw = get("marketplaceSource");
  const marketplaceSource = [
    "terminalsync",
    "ts-curated",
    "anthropic",
    "community",
  ].includes(marketplaceSourceRaw)
    ? (marketplaceSourceRaw as PluginMeta["marketplaceSource"])
    : undefined;
  return {
    slug,
    name: get("name", slug),
    logo: get("logo", `/plugins/${slug}.svg`),
    category: (get("category", "productivity") as PluginCategory),
    status: (get("status", "available") as PluginMeta["status"]),
    tagline: get("tagline"),
    description: get("description"),
    author: get("author", "TerminalSync"),
    marketplaceSource,
    connectorSlug,
    skillSlugs,
    included: data.included === true,
    hidden: data.hidden === true,
    catalogReady: data.catalogReady === false ? false : undefined,
  };
}

/** Publicly listable = not hidden, not pending evaluation, and structurally
 *  valid (references at least one real piece). */
function isPublic(meta: PluginMeta): boolean {
  if (meta.hidden) return false;
  if (meta.catalogReady === false) return false;
  return isValidPlugin(meta);
}

export async function listPlugins(lang: string): Promise<PluginMeta[]> {
  const dir = resolveLangDir(lang);
  if (!fs.existsSync(dir)) return [];
  const files = fs
    .readdirSync(dir)
    .filter((f: string) => f.endsWith(".md"))
    .sort();
  const metas: PluginMeta[] = [];
  for (const file of files) {
    const raw = fs.readFileSync(path.join(dir, file), "utf8");
    const { data } = matter(raw);
    const meta = normalizeMeta(file.replace(/\.md$/, ""), data);
    if (!isPublic(meta)) continue;
    metas.push(meta);
  }
  return metas.sort((a, b) => {
    if (a.status !== b.status) return a.status === "available" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

export async function getPlugin(lang: string, slug: string): Promise<PluginDoc | null> {
  const dir = resolveLangDir(lang);
  const file = path.join(dir, `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf8");
  const { data, content } = matter(raw);
  const meta = normalizeMeta(slug, data);
  if (!isPublic(meta)) return null;

  // Compose: resolve the referenced pieces by slug. Missing pieces resolve to
  // null/absent rather than throwing — a content error shouldn't 500 the page.
  const connector = meta.connectorSlug
    ? ((await getConnector(lang, meta.connectorSlug)) as ConnectorMeta | null)
    : null;
  const skills: SkillMeta[] = [];
  for (const skillSlug of meta.skillSlugs) {
    const skill = await getSkill(lang, skillSlug);
    if (skill) skills.push(skill);
  }

  const bodyHtml = String(await remark().use(html).process(content));
  return composePlugin(meta, connector, skills, bodyHtml);
}

export async function listPluginSlugs(): Promise<string[]> {
  const plugins = await listPlugins("en");
  return plugins.map((p) => p.slug);
}

/** Public plugins that bundle a given connector — for cross-linking from the
 *  connector's own page ("part of the X Plugin"), so the pieces surface the
 *  product they belong to. */
export async function pluginsUsingConnector(
  lang: string,
  connectorSlug: string,
): Promise<PluginMeta[]> {
  const all = await listPlugins(lang);
  return all.filter((p) => p.connectorSlug === connectorSlug);
}

/** Public plugins that bundle a given skill. */
export async function pluginsUsingSkill(
  lang: string,
  skillSlug: string,
): Promise<PluginMeta[]> {
  const all = await listPlugins(lang);
  return all.filter((p) => p.skillSlugs.includes(skillSlug));
}
