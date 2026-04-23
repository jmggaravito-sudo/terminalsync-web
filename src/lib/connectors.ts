/**
 * Connectors content loader.
 *
 * Each connector is a Markdown file at `content/connectors/<lang>/<slug>.md`
 * with YAML frontmatter. The `<Connectors>` index and the detail page both
 * read from here — edit the .md files to update copy without a code change.
 */

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

export interface ConnectorMeta {
  slug: string;
  name: string;
  logo: string; // path relative to /public
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
  const dir = resolveLangDir(lang);
  const file = path.join(dir, `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf8");
  const { data, content } = matter(raw);

  // Split body by `--- dev ---` marker to produce Simple vs Dev sections.
  const [simpleSrc, devSrc] = splitSimpleDev(content);
  const simpleHtml = await renderMarkdown(simpleSrc);
  const devHtml = await renderMarkdown(devSrc || simpleSrc);

  return { ...normalizeMeta(slug, data), simpleHtml, devHtml };
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
