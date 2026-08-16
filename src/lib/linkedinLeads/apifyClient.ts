import type { LinkedinSearchFilters } from "./types";

// Ported from the lead-hunter prototype's apifyClient.ts (validated
// end-to-end there with real credentials against the harvestapi actor).
// Keep the tolerant field-normalization below — the exact output schema
// couldn't be re-verified from this sandbox (network-restricted), so it
// stays permissive to multiple likely field names on purpose.

export interface RawLinkedinProfile {
  name: string;
  title: string;
  company: string;
  location: string;
  profileUrl: string;
  photoUrl: string | null;
  recentPosts: string[];
}

const APIFY_BASE = "https://api.apify.com/v2";

/**
 * Runs the configured Apify actor to search public LinkedIn profiles
 * (no login/cookies) per the given filters.
 *
 * Default actor: harvestapi~linkedin-profile-search ("No cookies or
 * account required"). The input block below covers the field names
 * documented on the actor page (searchQuery, currentJobTitles, location,
 * maxItems) PLUS generic aliases, so this keeps working if
 * APIFY_LINKEDIN_ACTOR_ID is swapped to a different actor.
 */
export async function runLinkedInSearch(filters: LinkedinSearchFilters): Promise<RawLinkedinProfile[]> {
  const token = process.env.APIFY_TOKEN;
  if (!token) {
    throw new Error("Falta APIFY_TOKEN. Configuralo en las variables de entorno de Vercel antes de buscar.");
  }
  const actorId = (process.env.APIFY_LINKEDIN_ACTOR_ID || "harvestapi~linkedin-profile-search").replace("/", "~");

  const location = [filters.city, filters.state, filters.country].filter(Boolean).join(", ");

  const input = {
    // Documented field names for harvestapi/linkedin-profile-search
    searchQuery: filters.keyword,
    currentJobTitles: filters.targetTitles,
    location,
    maxItems: filters.count,
    // Generic aliases, in case the configured actor is a different one
    keyword: filters.keyword,
    titles: filters.targetTitles,
    country: filters.country,
    state: filters.state || undefined,
    city: filters.city || undefined,
  };

  const runUrl = `${APIFY_BASE}/acts/${encodeURIComponent(actorId)}/run-sync-get-dataset-items?token=${encodeURIComponent(
    token,
  )}`;

  const res = await fetch(runUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Apify respondió ${res.status} ${res.statusText}. Verificá APIFY_LINKEDIN_ACTOR_ID y APIFY_TOKEN. Detalle: ${body.slice(
        0,
        300,
      )}`,
    );
  }

  const items = (await res.json()) as unknown[];
  return items.slice(0, filters.count).map(normalizeItem);
}

function normalizeItem(raw: unknown): RawLinkedinProfile {
  const item = (raw ?? {}) as Record<string, unknown>;
  const str = (v: unknown): string => (typeof v === "string" ? v : "");
  const nested = (v: unknown): Record<string, unknown> =>
    v && typeof v === "object" ? (v as Record<string, unknown>) : {};

  const currentPosition = nested(item.currentPosition ?? item.experience);
  const fullName =
    str(item.fullName) ||
    str(item.name) ||
    [str(item.firstName), str(item.lastName)].filter(Boolean).join(" ").trim();

  const postsSource = item.recentPosts ?? item.posts ?? item.activity;
  const posts = Array.isArray(postsSource)
    ? (postsSource as unknown[])
        .map((p) => (typeof p === "string" ? p : str(nested(p).text ?? nested(p).content)))
        .filter((p): p is string => p.length > 0)
    : [];

  return {
    name: fullName || "Sin nombre",
    title: str(item.title) || str(item.headline) || str(currentPosition.title) || "",
    company: str(item.company) || str(item.currentCompany) || str(currentPosition.companyName) || "",
    location: str(item.location) || str(item.locationName) || "",
    profileUrl: str(item.profileUrl) || str(item.url) || str(item.linkedinUrl) || "",
    photoUrl: str(item.photoUrl) || str(item.profilePicture) || str(item.photo) || null,
    recentPosts: posts,
  };
}
