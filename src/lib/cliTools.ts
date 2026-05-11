/**
 * CLI Tools content loader.
 *
 * Third pillar of the marketplace, alongside Connectors (MCP servers)
 * and Skills (prompt recipes). A CLI tool here = an official command-
 * line binary (gh, supabase, vercel, stripe, wrangler…) that the user
 * installs locally and TerminalSync auto-detects.
 *
 * Each tool lives at `content/cli-tools/<lang>/<slug>.md` with YAML
 * frontmatter mirroring the skills/connectors shape. Body markdown
 * documents the typical commands and what TerminalSync does with it
 * (auth-sync, env vault, etc.).
 *
 * The desktop app reads the same content via the Marketplace API to
 * surface install recommendations; the public landing renders it as
 * an SEO-friendly catalog.
 */

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export type CliToolCategory =
  | "dev"
  | "deploy"
  | "database"
  | "payments"
  | "infra"
  | "productivity";

export interface CliToolMeta {
  slug: string;
  name: string;
  logo: string;
  category: CliToolCategory;
  /** The shell command users actually type (e.g. `gh`, `supabase`). */
  binary: string;
  /** First-run install command shown on the card and detail page. */
  installCommand: string;
  /** Optional shell command for authenticating after install. */
  authCommand?: string;
  /** Vendor / author (e.g. "GitHub", "Vercel"). */
  vendor: string;
  /** Official homepage. */
  homepage: string;
  /** Optional source repo. */
  repo?: string;
  status: "available" | "soon";
  tagline: string;
  description: string;
}

export interface CliToolDoc extends CliToolMeta {
  bodyHtml: string;
}

const CONTENT_DIR = path.join(process.cwd(), "content", "cli-tools");

function resolveLangDir(lang: string): string {
  const dir = path.join(CONTENT_DIR, lang);
  if (fs.existsSync(dir)) return dir;
  return path.join(CONTENT_DIR, "en");
}

export async function listCliTools(lang: string): Promise<CliToolMeta[]> {
  // Markdown wins on collision — hand-curated entries are the source of
  // truth for tools we've documented carefully. DB rows fill in the long
  // tail of CLIs auto-promoted from discovery.
  const fileMetas = listCliToolsFromFiles(lang);
  const fileSlugs = new Set(fileMetas.map((m) => m.slug));

  const dbMetas = await listCliToolsFromDb(lang);
  const merged: CliToolMeta[] = [...fileMetas];
  for (const meta of dbMetas) {
    if (!fileSlugs.has(meta.slug)) merged.push(meta);
  }

  return merged.sort((a, b) => {
    if (a.status !== b.status) return a.status === "available" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

function listCliToolsFromFiles(lang: string): CliToolMeta[] {
  const dir = resolveLangDir(lang);
  if (!fs.existsSync(dir)) return [];
  const files = fs
    .readdirSync(dir)
    .filter((f: string) => f.endsWith(".md"))
    .sort();
  const metas: CliToolMeta[] = [];
  for (const file of files) {
    const raw = fs.readFileSync(path.join(dir, file), "utf8");
    const { data } = matter(raw);
    metas.push(normalizeMeta(file.replace(/\.md$/, ""), data));
  }
  return metas;
}

/** Fetch approved auto-promoted CLI listings from the DB.
 *  Returns [] when Supabase is unconfigured or the table doesn't exist
 *  yet (e.g. local dev before 0010 has been applied). Errors are
 *  swallowed on purpose so a DB hiccup never breaks the public catalog. */
export async function listCliToolsFromDb(
  _lang: string,
): Promise<CliToolMeta[]> {
  const sb = getSupabaseAdmin();
  if (!sb) return [];
  try {
    const { data, error } = await sb
      .from("cli_tool_listings")
      .select(
        "slug,name,tagline,description_md,category,logo_url,binary,install_command,auth_command,vendor,homepage,repo_url,status",
      )
      .eq("status", "approved");
    if (error || !data) return [];
    return data.map((row): CliToolMeta => {
      const category = (
        new Set([
          "dev",
          "deploy",
          "database",
          "payments",
          "infra",
          "productivity",
        ]).has(row.category as string)
          ? row.category
          : "dev"
      ) as CliToolCategory;
      const slug = String(row.slug ?? "");
      return {
        slug,
        name: String(row.name ?? slug),
        logo:
          typeof row.logo_url === "string" && row.logo_url
            ? row.logo_url
            : `/cli-tools/${slug}.svg`,
        category,
        binary: String(row.binary ?? slug),
        installCommand: String(row.install_command ?? ""),
        authCommand:
          typeof row.auth_command === "string" && row.auth_command
            ? row.auth_command
            : undefined,
        vendor: String(row.vendor ?? "Unknown"),
        homepage: String(row.homepage ?? ""),
        repo:
          typeof row.repo_url === "string" && row.repo_url
            ? row.repo_url
            : undefined,
        status: "available",
        tagline: String(row.tagline ?? ""),
        description: String(row.description_md ?? row.tagline ?? ""),
      };
    });
  } catch {
    // Table not migrated yet, network failed, RLS misconfigured —
    // anything goes wrong, fall back to file-only mode.
    return [];
  }
}

export async function getCliTool(
  lang: string,
  slug: string,
): Promise<CliToolDoc | null> {
  const dir = resolveLangDir(lang);
  const file = path.join(dir, `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf8");
  const { data, content } = matter(raw);
  const bodyHtml = String(await remark().use(html).process(content));
  return { ...normalizeMeta(slug, data), bodyHtml };
}

export async function listCliToolSlugs(): Promise<string[]> {
  const dir = resolveLangDir("en");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f: string) => f.endsWith(".md"))
    .map((f: string) => f.replace(/\.md$/, ""));
}

function normalizeMeta(slug: string, data: Record<string, unknown>): CliToolMeta {
  const get = (k: string, fallback = ""): string =>
    (typeof data[k] === "string" ? (data[k] as string) : fallback).trim();
  return {
    slug,
    name: get("name", slug),
    logo: get("logo", `/cli-tools/${slug}.svg`),
    category: (get("category", "dev") as CliToolCategory),
    binary: get("binary", slug),
    installCommand: get("installCommand"),
    authCommand: get("authCommand") || undefined,
    vendor: get("vendor", "Unknown"),
    homepage: get("homepage"),
    repo: get("repo") || undefined,
    status: (get("status", "available") as CliToolMeta["status"]),
    tagline: get("tagline"),
    description: get("description"),
  };
}
