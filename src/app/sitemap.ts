import type { MetadataRoute } from "next";
import { listSlugs } from "@/lib/connectors";
import { listSkillSlugs } from "@/lib/skills";

const BASE = "https://terminalsync.ai";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const [connectorSlugs, skillSlugs] = await Promise.all([
    listSlugs(),
    listSkillSlugs(),
  ]);

  const langs: Array<"es" | "en"> = ["es", "en"];

  const staticPages: MetadataRoute.Sitemap = langs.flatMap((lang) => [
    {
      url: `${BASE}/${lang}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 1,
    },
    {
      url: `${BASE}/${lang}/marketplace`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${BASE}/${lang}/connectors`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${BASE}/${lang}/skills`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${BASE}/${lang}/publishers`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    {
      url: `${BASE}/${lang}/legal/affiliates`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.4,
    },
  ]);

  // One entry per (lang, slug) so Google indexes the bilingual pair. Keeping
  // priority slightly below the index pages but above legal — the long-tail
  // landings are the real SEO play.
  const connectorPages: MetadataRoute.Sitemap = langs.flatMap((lang) =>
    connectorSlugs.map((slug) => ({
      url: `${BASE}/${lang}/connectors/${slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  );

  const skillPages: MetadataRoute.Sitemap = langs.flatMap((lang) =>
    skillSlugs.map((slug) => ({
      url: `${BASE}/${lang}/skills/${slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  );

  return [...staticPages, ...connectorPages, ...skillPages];
}
