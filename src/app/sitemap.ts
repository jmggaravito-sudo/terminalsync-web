import type { MetadataRoute } from "next";
import { listSlugs as listConnectorSlugs } from "@/lib/connectors";
import { listSkillSlugs } from "@/lib/skills";
import { TOOL_SLUGS } from "@/lib/vsPages";
import { GEO_PAGE_SLUGS } from "@/lib/geoPages";
import { MULTI_AI_PUBLIC } from "@/lib/launchFlags";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { listSlugs as listBlogSlugs } from "@/lib/blog";

async function listBundleSlugs(): Promise<string[]> {
  try {
    const sb = getSupabaseAdmin();
    if (!sb) return [];
    const { data, error } = await sb
      .from("bundles")
      .select("slug")
      .eq("status", "active");
    if (error || !data) return [];
    return data.map((b: { slug: string }) => b.slug);
  } catch {
    return [];
  }
}

/** Las guías cuyo tema entero es sincronizar la IA de otro proveedor. */
const MULTI_AI_GUIDE_SLUGS = new Set([
  "sync-claude-code-between-macs",
  "sync-codex-between-macs",
  "sync-gemini-cli-between-macs",
]);

const BASE = "https://terminalsync.ai";
const LANGS = ["es", "en"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const lang of LANGS) {
    entries.push({
      url: `${BASE}/${lang}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    });
  }

  // JM 2026-10-07: la primera etapa no menciona que se trabaje con varias
  // IAs, así que las páginas cuyo TEMA es eso salen del sitemap junto con la
  // página. Un `true` en MULTI_AI_PUBLIC las devuelve — no se borró ninguna.
  const MULTI_AI_PATHS = ["ai-terminal", "for-developers"];

  const STATIC_PATHS = [
    ...(MULTI_AI_PUBLIC ? MULTI_AI_PATHS : []),
    "skills",
    "cli-tools",
    "connectors",
    "stacks",
    "legal/affiliates",
    "legal/privacy",
    "legal/extension-privacy",
    "legal/terms",
    "legal/security",
    "about",
    "faq",
    "blog",
  ];
  for (const lang of LANGS) {
    for (const p of STATIC_PATHS) {
      entries.push({
        url: `${BASE}/${lang}/${p}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: p === "legal/affiliates" ? 0.4 : 0.8,
      });
    }
  }

  const [skillSlugs, connectorSlugs, bundleSlugs, blogSlugs] = await Promise.all([
    listSkillSlugs(),
    listConnectorSlugs(),
    listBundleSlugs(),
    listBlogSlugs(),
  ]);

  for (const lang of LANGS) {
    for (const slug of skillSlugs) {
      entries.push({
        url: `${BASE}/${lang}/skills/${slug}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
    for (const slug of connectorSlugs) {
      entries.push({
        url: `${BASE}/${lang}/connectors/${slug}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
    for (const tool of TOOL_SLUGS) {
      entries.push({
        url: `${BASE}/${lang}/vs/${tool}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
    for (const slug of GEO_PAGE_SLUGS) {
      if (!MULTI_AI_PUBLIC && MULTI_AI_GUIDE_SLUGS.has(slug)) continue;
      entries.push({
        url: `${BASE}/${lang}/guides/${slug}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.75,
      });
    }
    for (const slug of blogSlugs) {
      entries.push({
        url: `${BASE}/${lang}/blog/${slug}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.75,
      });
    }
    for (const slug of bundleSlugs) {
      entries.push({
        url: `${BASE}/${lang}/stacks/${slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.75,
      });
    }
  }

  return entries;
}
