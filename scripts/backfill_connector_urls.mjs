/**
 * Backfill connector_listings.{cta_url, source_url, repo_url} from the
 * setup_md blob written by the 5 May auto-publish run (and from the
 * matching discovery_connectors row when one exists).
 *
 * Strategy per row:
 *   1. Skip rows that already have cta_url set.
 *   2. Extract first https URL from setup_md  — those rows all carry
 *      "Install via TerminalSync. Source: <github_url>".
 *   3. If we can match by product_slug → discovery_connectors, copy
 *      richer fields (source_url, repo_url, demo_url) from there.
 *   4. cta_url = repo_url || source_url (fallback).
 *
 * Idempotent: re-running is a no-op for rows that already got their
 * URLs.
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
const sb = createClient(url, key, { auth: { persistSession: false } });

const URL_RE = /https?:\/\/[^\s)]+/;

/** Best-effort match a connector_listings row to a discovery_connectors
 *  row by slug. The auto-publish script slugified the name as
 *  publisher/repo → publisher-repo, while discovery uses product_slug
 *  with its own rules — so we try both directions and pick the first
 *  one where the source/repo URL exists. */
async function lookupDiscoveryByName(name) {
  const candidates = [
    name.toLowerCase(),
    name.replace(/\//g, "-").toLowerCase(),
    name.split("/").pop()?.toLowerCase(),
  ].filter(Boolean);
  for (const slug of candidates) {
    const { data } = await sb
      .from("discovery_connectors")
      .select("source_url, repo_url, demo_url")
      .eq("product_slug", slug)
      .maybeSingle();
    if (data && (data.source_url || data.repo_url)) return data;
  }
  // Fall back to fuzzy name match (rare).
  return null;
}

async function main() {
  const { data: rows, error } = await sb
    .from("connector_listings")
    .select("id, slug, name, setup_md, cta_url, repo_url, source_url")
    .eq("status", "approved")
    .or("cta_url.is.null,repo_url.is.null");

  if (error) {
    console.error("Query failed:", error.message);
    process.exit(1);
  }
  console.log(`Found ${rows.length} listings missing URLs`);

  let patched = 0;
  let skipped = 0;
  for (const row of rows) {
    if (row.cta_url) {
      skipped++;
      continue;
    }
    const fromBlob = (row.setup_md || "").match(URL_RE)?.[0] ?? null;
    const discovery = await lookupDiscoveryByName(row.name);

    const repo_url = row.repo_url ?? discovery?.repo_url ?? fromBlob ?? null;
    const source_url = row.source_url ?? discovery?.source_url ?? null;
    const demo_url = discovery?.demo_url ?? null;
    const cta_url = repo_url || source_url || fromBlob;

    if (!cta_url) {
      console.warn(`SKIP [${row.slug}] no URL discoverable`);
      skipped++;
      continue;
    }

    const { error: upErr } = await sb
      .from("connector_listings")
      .update({ cta_url, source_url, repo_url, demo_url })
      .eq("id", row.id);

    if (upErr) {
      console.error(`ERR  [${row.slug}]`, upErr.message);
      continue;
    }
    patched++;
    if (patched % 25 === 0) console.log(`… patched ${patched}`);
  }

  console.log(`\nDone. patched=${patched}  skipped=${skipped}`);
}

await main();
