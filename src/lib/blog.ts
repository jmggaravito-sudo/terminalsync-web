/**
 * Blog content loader.
 *
 * Posts live at content/blog/<lang>/<slug>.md with YAML frontmatter.
 * Adding a new .md file is all it takes to publish a post — no code change.
 * Falls back to "en" when a locale-specific file doesn't exist.
 */

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO YYYY-MM-DD
  keywords: string[];
  category?: string;
  author: string;
}

export interface BlogPost extends BlogPostMeta {
  html: string;
}

const CONTENT_DIR = path.join(process.cwd(), "content", "blog");

function resolveLangDir(lang: string): string {
  const dir = path.join(CONTENT_DIR, lang);
  if (fs.existsSync(dir)) return dir;
  return path.join(CONTENT_DIR, "en");
}

function parseMeta(slug: string, data: Record<string, unknown>): BlogPostMeta {
  const get = (k: string, fallback = ""): string =>
    (typeof data[k] === "string" ? (data[k] as string) : fallback).trim();
  return {
    slug,
    title: get("title", slug),
    description: get("description"),
    date: get("date"),
    keywords: Array.isArray(data.keywords)
      ? (data.keywords as string[])
      : [],
    category: get("category") || undefined,
    author: get("author", "TerminalSync"),
  };
}

async function renderMarkdown(src: string): Promise<string> {
  if (!src) return "";
  const result = await remark().use(html).process(src);
  return String(result);
}

export async function listPosts(lang: string): Promise<BlogPostMeta[]> {
  const dir = resolveLangDir(lang);
  if (!fs.existsSync(dir)) return [];
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .reverse(); // newest first (files named YYYY-MM-DD-slug)
  return files.map((file) => {
    const raw = fs.readFileSync(path.join(dir, file), "utf8");
    const { data } = matter(raw);
    return parseMeta(file.replace(/\.md$/, ""), data);
  });
}

export async function getPost(
  lang: string,
  slug: string,
): Promise<BlogPost | null> {
  const dir = resolveLangDir(lang);
  const file = path.join(dir, `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf8");
  const { data, content } = matter(raw);
  const meta = parseMeta(slug, data);
  const postHtml = await renderMarkdown(content);
  return { ...meta, html: postHtml };
}

export async function listSlugs(): Promise<string[]> {
  const dir = resolveLangDir("en");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}
