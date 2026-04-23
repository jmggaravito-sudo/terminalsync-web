import type { MetadataRoute } from "next";

const BASE = "https://terminalsync.ai";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${BASE}/es`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/en`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    {
      url: `${BASE}/es/legal/affiliates`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${BASE}/en/legal/affiliates`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];
}
