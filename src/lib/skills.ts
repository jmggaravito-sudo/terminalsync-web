/**
 * Skills content loader.
 *
 * Mirrors the connectors loader (src/lib/connectors.ts) but for "skills" —
 * markdown prompt-recipes that get installed into ~/.claude/skills/<name>/
 * by the desktop client. A skill is conceptually different from a connector:
 *   - Connector  = MCP server config (Claude gets tools for an external API).
 *   - Skill      = SKILL.md prompt instructions (Claude gets behavior).
 *
 * Each skill lives at content/skills/<lang>/<slug>.md with YAML frontmatter
 * including `vendors: ["claude", "codex"]` so the same skill can target
 * multiple AI vendors.
 */

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

export type SkillVendor = "claude" | "codex";
export type SkillCategory =
  | "marketing"
  | "dev"
  | "productivity"
  | "research"
  | "design"
  | "finance";

export interface SkillMeta {
  slug: string;
  name: string;
  logo: string;
  category: SkillCategory;
  vendors: SkillVendor[];
  author: string;
  /** SPDX identifier ("MIT", "Apache-2.0", "proprietary"). First-party
   *  skills authored by TerminalSync ship as "proprietary"; third-party
   *  marketplace skills carry whatever license their author declared. */
  license?: string;
  /** Direct link to the LICENSE file when the author exposes one. */
  licenseUrl?: string;
  /** When true, the skill is suppressed from the public catalog without
   *  losing its content. */
  hidden?: boolean;
  /** When explicitly false, the skill is pending evaluation: excluded from
   *  the public catalog like `hidden`, but semantically distinct — it is
   *  not retired, just not cleared for launch yet. */
  catalogReady?: boolean;
  /** Always `false` for skills. They're prompt recipes (SKILL.md), not
   *  tools that need API keys or env vars — the install path is a file
   *  copy. Catalog includes this so the desktop panel can treat the four
   *  categories uniformly when reading the `requiresEnvSecrets` flag.
   *
   *  The flag is strict about env vars: if a skill ever needs setup of a
   *  different shape (an MCP it pairs with, a tool to be installed
   *  alongside), THAT setup is the connector/tool's `requiresEnvSecrets`,
   *  not the skill's. See docs/browse-zone.md. */
  requiresEnvSecrets: false;
  status: "available" | "soon";
  tagline: string;
  description: string;
  /** Claude Customize parity (added 2026-06-02 per design doc § 5.5
   *  multi-IA rule): list of AI runtimes the skill works on after passing
   *  through the TS adaptation script. ALL skills in the marketplace must
   *  support the 3 AIs that TS targets (Claude + Codex + Gemini) — items
   *  that can only run on one are filtered out at import time and never
   *  reach this endpoint. The field is exposed so the desktop can show
   *  "Compatible with Claude / Codex / Gemini" without re-deriving. */
  compatibleWith?: ("claude" | "codex" | "gemini")[];
  /** Provenance tracking for the visual badge. See ConnectorMeta. */
  marketplaceSource?: "terminalsync" | "ts-curated" | "anthropic" | "community";
}

export interface SkillDoc extends SkillMeta {
  /** Rendered HTML for the body (Cuándo usar / Cómo usar / Mejor para). */
  bodyHtml: string;
}

export interface SkillInstallPayload {
  vendor: "claude";
  name: string;
  files: Record<string, string>;
}

export async function getSkillInstallPayload(
  slug: string,
): Promise<SkillInstallPayload | null> {
  const dir = resolveLangDir("en");
  const file = path.join(dir, `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf8");
  const { content } = matter(raw);
  const skillMd = content.trimStart();
  return {
    vendor: "claude",
    name: slug,
    files: {
      "SKILL.md": Buffer.from(skillMd, "utf8").toString("base64"),
    },
  };
}

const CONTENT_DIR = path.join(process.cwd(), "content", "skills");

function resolveLangDir(lang: string): string {
  const dir = path.join(CONTENT_DIR, lang);
  if (fs.existsSync(dir)) return dir;
  return path.join(CONTENT_DIR, "en");
}

export async function listSkills(lang: string): Promise<SkillMeta[]> {
  const dir = resolveLangDir(lang);
  if (!fs.existsSync(dir)) return [];
  const files = fs
    .readdirSync(dir)
    .filter((f: string) => f.endsWith(".md"))
    .sort();
  const metas: SkillMeta[] = [];
  for (const file of files) {
    const raw = fs.readFileSync(path.join(dir, file), "utf8");
    const { data } = matter(raw);
    const meta = normalizeMeta(file.replace(/\.md$/, ""), data);
    if (meta.hidden) continue; // Suppressed from the public catalog.
    if (meta.catalogReady === false) continue; // Pending evaluation.
    metas.push(meta);
  }
  return metas.sort((a, b) => {
    if (a.status !== b.status) return a.status === "available" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

export async function getSkill(
  lang: string,
  slug: string,
): Promise<SkillDoc | null> {
  const dir = resolveLangDir(lang);
  const file = path.join(dir, `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf8");
  const { data, content } = matter(raw);
  const meta = normalizeMeta(slug, data);
  if (meta.hidden) return null;
  if (meta.catalogReady === false) return null;
  const bodyHtml = String(await remark().use(html).process(content));
  return { ...meta, bodyHtml };
}

export async function listSkillSlugs(): Promise<string[]> {
  const skills = await listSkills("en");
  return skills.map((skill) => skill.slug);
}

function normalizeMeta(slug: string, data: Record<string, unknown>): SkillMeta {
  const get = (k: string, fallback = ""): string =>
    (typeof data[k] === "string" ? (data[k] as string) : fallback).trim();
  const vendorsRaw = Array.isArray(data.vendors) ? data.vendors : [];
  const vendors = vendorsRaw.filter(
    (v): v is SkillVendor => v === "claude" || v === "codex",
  );
  const compatibleWithRaw = Array.isArray(data.compatibleWith)
    ? data.compatibleWith
    : [];
  const compatibleWith = compatibleWithRaw.filter(
    (v): v is "claude" | "codex" | "gemini" =>
      v === "claude" || v === "codex" || v === "gemini",
  );
  const marketplaceSourceRaw = get("marketplaceSource");
  const marketplaceSource = [
    "terminalsync",
    "ts-curated",
    "anthropic",
    "community",
  ].includes(marketplaceSourceRaw)
    ? (marketplaceSourceRaw as SkillMeta["marketplaceSource"])
    : undefined;
  return {
    slug,
    name: get("name", slug),
    logo: get("logo", `/skills/${slug}.svg`),
    category: (get("category", "productivity") as SkillCategory),
    vendors: vendors.length > 0 ? vendors : ["claude"],
    author: get("author", "TerminalSync"),
    license: get("license") || undefined,
    licenseUrl: get("licenseUrl") || undefined,
    hidden: data.hidden === true,
    catalogReady: data.catalogReady === false ? false : undefined,
    // Always false — see SkillMeta.requiresEnvSecrets doc.
    requiresEnvSecrets: false,
    status: (get("status", "available") as SkillMeta["status"]),
    tagline: get("tagline"),
    description: get("description"),
    compatibleWith: compatibleWith.length > 0 ? compatibleWith : undefined,
    marketplaceSource,
  };
}
