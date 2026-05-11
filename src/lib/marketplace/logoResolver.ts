/**
 * Logo resolver for marketplace listings.
 *
 * The auto-promote pipeline (n8n → Supabase → scripts/auto_promote_connectors.mjs)
 * inserts `connector_listings` rows without a real logo — they end up with
 * empty strings or `/connectors/<slug>.svg` placeholders that don't exist on
 * disk. The result is a blank rounded square in every catalog card.
 *
 * This resolver runs server-side: given whatever the discovery pipeline
 * captured (homepage, repo URL, name), it returns the best logo URL it can
 * find by trying a cascade of free sources:
 *
 *   1. Brandfetch CDN — high-quality vendor logo for any domain (uses the
 *      public client id documented for the free CDN tier).
 *   2. GitHub avatar — owner avatar at 256px, when the row points to a repo.
 *   3. Google favicon — always returns something for any domain (16x16
 *      stretched to 128). Last network attempt before giving up.
 *   4. Placeholder — `/logos/placeholder.svg`. The frontend renders initials
 *      when the image fails to load, so we don't actually need the file to
 *      exist on disk.
 *
 * Each candidate is HEAD-checked with a 4s timeout so a slow CDN doesn't
 * block a backfill of 500 rows. Results are memoized per-process by input
 * tuple so the backfill doesn't re-hit the same URL across rows.
 */

export type LogoSource = "brandfetch" | "github" | "favicon" | "placeholder";

export interface LogoResolveInput {
  homepage?: string | null;
  repoUrl?: string | null;
  name: string;
}

export interface LogoResolveResult {
  source: LogoSource;
  url: string;
}

const BRANDFETCH_CLIENT_ID = "1idV7VfdJ_5wKnIeShI";
const HEAD_TIMEOUT_MS = 4000;
const PLACEHOLDER_RESULT: LogoResolveResult = {
  source: "placeholder",
  url: "/logos/placeholder.svg",
};

const cache = new Map<string, LogoResolveResult>();

function cacheKey(input: LogoResolveInput): string {
  return `${input.homepage ?? ""}|${input.repoUrl ?? ""}|${input.name ?? ""}`;
}

function safeHostname(raw: string | null | undefined): string | null {
  if (!raw) return null;
  try {
    const u = new URL(raw);
    if (!u.hostname) return null;
    // Strip leading "www." so brandfetch lookups normalize.
    return u.hostname.replace(/^www\./i, "");
  } catch {
    return null;
  }
}

function parseGithubOwner(repoUrl: string | null | undefined): string | null {
  if (!repoUrl) return null;
  // Tolerate trailing slashes, .git suffixes, deep paths, etc.
  const m = repoUrl.match(/github\.com[/:]+([^/\s?#]+)\/([^/\s?#]+)/i);
  if (!m) return null;
  const owner = m[1];
  if (!owner || owner.toLowerCase() === "orgs") return null;
  return owner;
}

async function headOk(url: string): Promise<boolean> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), HEAD_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "HEAD",
      signal: ctrl.signal,
      redirect: "follow",
    });
    if (!res.ok) return false;
    const ct = res.headers.get("content-type") ?? "";
    // Brandfetch returns transparent 1x1 image/webp for misses on some
    // domains, but those still serve with image/* — we accept anything in
    // the image family. Anything else (text/html error pages) is a miss.
    return ct.toLowerCase().startsWith("image/");
  } catch {
    return false;
  } finally {
    clearTimeout(t);
  }
}

/**
 * Resolve a logo URL for a marketplace listing.
 * Always returns a result — falls back to a placeholder when every network
 * candidate fails.
 */
export async function resolveLogo(
  input: LogoResolveInput,
): Promise<LogoResolveResult> {
  const key = cacheKey(input);
  const hit = cache.get(key);
  if (hit) return hit;

  // 1. Brandfetch CDN — high-quality vendor logo when we have a homepage.
  const host = safeHostname(input.homepage);
  if (host) {
    const url = `https://cdn.brandfetch.io/${host}/w/256/h/256?c=${BRANDFETCH_CLIENT_ID}`;
    if (await headOk(url)) {
      const result: LogoResolveResult = { source: "brandfetch", url };
      cache.set(key, result);
      return result;
    }
  }

  // 2. GitHub avatar — works for any repo URL pointing at github.com.
  const owner = parseGithubOwner(input.repoUrl);
  if (owner) {
    const url = `https://github.com/${owner}.png?size=256`;
    if (await headOk(url)) {
      const result: LogoResolveResult = { source: "github", url };
      cache.set(key, result);
      return result;
    }
  }

  // 3. Google favicon — last-ditch network attempt. Prefer the homepage
  // host; fall back to the repo host (rare but covers vendor pages hosted
  // on github.io etc.).
  const faviconHost = host ?? safeHostname(input.repoUrl);
  if (faviconHost) {
    const url = `https://www.google.com/s2/favicons?domain=${faviconHost}&sz=128`;
    if (await headOk(url)) {
      const result: LogoResolveResult = { source: "favicon", url };
      cache.set(key, result);
      return result;
    }
  }

  cache.set(key, PLACEHOLDER_RESULT);
  return PLACEHOLDER_RESULT;
}

/** Test-only: clear the per-process memoization cache. */
export function _resetLogoResolverCache(): void {
  cache.clear();
}
