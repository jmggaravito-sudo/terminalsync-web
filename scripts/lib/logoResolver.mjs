/**
 * Logo resolver — runtime-agnostic ESM mirror of
 * src/lib/marketplace/logoResolver.ts.
 *
 * Kept as a separate file so Node-only scripts (auto_promote_connectors,
 * backfill_logos) can import it without a TypeScript loader. The two files
 * must stay behaviorally identical — if you change the cascade in the
 * TypeScript module, mirror the change here.
 */

const BRANDFETCH_CLIENT_ID = "1idV7VfdJ_5wKnIeShI";
const HEAD_TIMEOUT_MS = 4000;
const PLACEHOLDER_RESULT = Object.freeze({
  source: "placeholder",
  url: "/logos/placeholder.svg",
});

const cache = new Map();

function cacheKey(input) {
  return `${input.homepage ?? ""}|${input.repoUrl ?? ""}|${input.name ?? ""}`;
}

function safeHostname(raw) {
  if (!raw) return null;
  try {
    const u = new URL(raw);
    if (!u.hostname) return null;
    return u.hostname.replace(/^www\./i, "");
  } catch {
    return null;
  }
}

function parseGithubOwner(repoUrl) {
  if (!repoUrl) return null;
  const m = repoUrl.match(/github\.com[/:]+([^/\s?#]+)\/([^/\s?#]+)/i);
  if (!m) return null;
  const owner = m[1];
  if (!owner || owner.toLowerCase() === "orgs") return null;
  return owner;
}

async function headOk(url) {
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
    return ct.toLowerCase().startsWith("image/");
  } catch {
    return false;
  } finally {
    clearTimeout(t);
  }
}

/**
 * @param {{ homepage?: string|null, repoUrl?: string|null, name: string }} input
 * @returns {Promise<{ source: "brandfetch"|"github"|"favicon"|"placeholder", url: string }>}
 */
export async function resolveLogo(input) {
  const key = cacheKey(input);
  const hit = cache.get(key);
  if (hit) return hit;

  const host = safeHostname(input.homepage);
  if (host) {
    const url = `https://cdn.brandfetch.io/${host}/w/256/h/256?c=${BRANDFETCH_CLIENT_ID}`;
    if (await headOk(url)) {
      const result = { source: "brandfetch", url };
      cache.set(key, result);
      return result;
    }
  }

  const owner = parseGithubOwner(input.repoUrl);
  if (owner) {
    const url = `https://github.com/${owner}.png?size=256`;
    if (await headOk(url)) {
      const result = { source: "github", url };
      cache.set(key, result);
      return result;
    }
  }

  const faviconHost = host ?? safeHostname(input.repoUrl);
  if (faviconHost) {
    const url = `https://www.google.com/s2/favicons?domain=${faviconHost}&sz=128`;
    if (await headOk(url)) {
      const result = { source: "favicon", url };
      cache.set(key, result);
      return result;
    }
  }

  cache.set(key, PLACEHOLDER_RESULT);
  return PLACEHOLDER_RESULT;
}

/** Test-only: clear the per-process memoization cache. */
export function _resetLogoResolverCache() {
  cache.clear();
}
