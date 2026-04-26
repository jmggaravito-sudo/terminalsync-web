import type { MetadataRoute } from "next";
import { listSlugs as listConnectorSlugs } from "@/lib/connectors";
import { listSkillSlugs } from "@/lib/skills";

const BASE = "https://terminalsync.ai";
const LANGS = ["es", "en"] as const;

// Sitemap is dynamic: every connector + skill page gets indexed by search
// engines, in both locales. That's the SEO compound effect we want — each
// listing becomes a separate entry point that ranks for its own niche
// keywords ("claude meta ads skill", "codex copywriter skill", etc.).
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

  const STATIC_PATHS = [
    "marketplace",
    "skills",
    "connectors",
    "publishers",
    "legal/affiliates",
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

  const [skillSlugs, connectorSlugs] = await Promise.all([
    listSkillSlugs(),
    listConnectorSlugs(),
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
  }

  return entries;
}
