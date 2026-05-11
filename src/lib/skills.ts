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
  status: "available" | "soon";
  tagline: string;
  description: string;
}

export interface SkillDoc extends SkillMeta {
  /** Rendered HTML for the body (Cuándo usar / Cómo usar / Mejor para). */
  bodyHtml: string;
  /** Original Markdown, including frontmatter, used for desktop install payloads. */
  rawMarkdown: string;
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
    metas.push(normalizeMeta(file.replace(/\.md$/, ""), data));
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
  const bodyHtml = String(await remark().use(html).process(content));
  return { ...normalizeMeta(slug, data), bodyHtml, rawMarkdown: raw };
}

export async function listSkillSlugs(): Promise<string[]> {
  const dir = resolveLangDir("en");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f: string) => f.endsWith(".md"))
    .map((f: string) => f.replace(/\.md$/, ""));
}

function normalizeMeta(slug: string, data: Record<string, unknown>): SkillMeta {
  const get = (k: string, fallback = ""): string =>
    (typeof data[k] === "string" ? (data[k] as string) : fallback).trim();
  const vendorsRaw = Array.isArray(data.vendors) ? data.vendors : [];
  const vendors = vendorsRaw.filter(
    (v): v is SkillVendor => v === "claude" || v === "codex",
  );
  return {
    slug,
    name: get("name", slug),
    logo: get("logo", `/skills/${slug}.svg`),
    category: (get("category", "productivity") as SkillCategory),
    vendors: vendors.length > 0 ? vendors : ["claude"],
    author: get("author", "TerminalSync"),
    status: (get("status", "available") as SkillMeta["status"]),
    tagline: get("tagline"),
    description: get("description"),
  };
}
