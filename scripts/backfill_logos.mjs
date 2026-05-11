/**
 * Backfill resolved logos onto existing marketplace listings.
 *
 * Why: rows promoted before logoResolver landed shipped with logo_url=""
 * or a /logos/<slug>.svg placeholder that doesn't exist on disk. The
 * catalog renders blank squares for each one. This script walks every
 * row in connector_listings that needs help and patches logo_url with
 * the best logo the resolver can find (Brandfetch → GitHub → Google
 * favicon → placeholder).
 *
 * The resolver is shared with the live auto-promote pass via
 * scripts/lib/logoResolver.mjs so this backfill always produces the
 * same answer the live pipeline would.
 *
 * Usage:
 *   node scripts/backfill_logos.mjs              # live (default)
 *   node scripts/backfill_logos.mjs --dry-run    # log only, no writes
 *
 * Env:
 *   SUPABASE_URL                — required
 *   SUPABASE_SERVICE_ROLE_KEY   — required (service role; bypasses RLS)
 *   BATCH=200                   — page size (default 500)
 */

import { createClient } from "@supabase/supabase-js";
import { resolveLogo } from "./lib/logoResolver.mjs";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const DRY_RUN = process.argv.includes("--dry-run");
const BATCH = Number(process.env.BATCH ?? "500");

const sb = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

// Tables we try to backfill. cli_tool_listings doesn't exist today; we
// check at runtime and silently skip it so this script keeps working when
// the table eventually lands.
const TARGET_TABLES = ["connector_listings", "skill_listings", "cli_tool_listings"];

const SOURCE_TAG = {
  brandfetch: "bf",
  github: "gh",
  favicon: "fa",
  placeholder: "--",
};

async function tableExists(name) {
  // A HEAD select(*) with limit 0 — if the relation is missing, supabase
  // returns a PostgREST error with code 42P01.
  const { error } = await sb.from(name).select("id", { count: "exact", head: true }).limit(0);
  if (!error) return true;
  if (error.code === "42P01" || /does not exist/i.test(error.message)) return false;
  // Any other error: assume the table is there but we hit RLS / a missing
  // column. Let the main loop surface it.
  return true;
}

/**
 * Build the resolver input from whatever columns the row exposes. Tables
 * across the marketplace family don't share a perfectly consistent shape:
 * connector_listings has repo_url + demo_url + source_url; future skill
 * tables may use homepage_url. We try several aliases.
 */
function buildResolverInput(row) {
  const homepage =
    row.homepage_url ??
    row.homepage ??
    row.demo_url ??
    row.source_url ??
    null;
  const repoUrl = row.repo_url ?? null;
  const name = row.name ?? row.slug ?? "unknown";
  return { homepage, repoUrl, name };
}

function needsBackfill(logoUrl) {
  if (logoUrl == null) return true;
  const v = String(logoUrl).trim();
  if (v === "") return true;
  if (v.includes("placeholder")) return true;
  // Synthetic paths the loader assigns when there's no real logo on disk.
  if (v.startsWith("/logos/")) return true;
  if (v.startsWith("/connectors/") || v.startsWith("/skills/") || v.startsWith("/cli-tools/")) {
    // These are the file-based defaults — only treat as needing backfill
    // when the row is a marketplace insert (publisher_id present and
    // points at the curated auto-promote account). We can't easily check
    // that from here, so be conservative: include them. The resolver
    // returns the same path back when it can't do better, so worst case
    // is a no-op UPDATE.
    return true;
  }
  return false;
}

async function backfillTable(table) {
  console.log(`\n→ ${table}`);
  const exists = await tableExists(table);
  if (!exists) {
    console.log(`  (table not found, skipping)`);
    return { scanned: 0, updated: 0, placeholder: 0 };
  }

  // Pull every row that might need help. PostgREST `.or()` builds a
  // single WHERE clause; we accept a slightly broader net (any non-http
  // URL) and let the in-process filter trim it.
  const { data, error } = await sb
    .from(table)
    .select("id, slug, name, logo_url, homepage_url, homepage, repo_url, demo_url, source_url")
    .or("logo_url.is.null,logo_url.eq.,logo_url.like.%placeholder%,logo_url.like./logos/%,logo_url.like./connectors/%,logo_url.like./skills/%,logo_url.like./cli-tools/%")
    .limit(BATCH);

  if (error) {
    // Many of the columns above only exist on connector_listings; PostgREST
    // returns a 400 for missing columns. Retry with a minimal projection.
    const retry = await sb
      .from(table)
      .select("id, slug, name, logo_url, repo_url")
      .or("logo_url.is.null,logo_url.eq.,logo_url.like.%placeholder%,logo_url.like./logos/%,logo_url.like./connectors/%,logo_url.like./skills/%,logo_url.like./cli-tools/%")
      .limit(BATCH);
    if (retry.error) {
      console.error(`  query failed: ${retry.error.message}`);
      return { scanned: 0, updated: 0, placeholder: 0 };
    }
    return await processRows(table, retry.data ?? []);
  }
  return await processRows(table, data ?? []);
}

async function processRows(table, rows) {
  let scanned = 0;
  let updated = 0;
  let placeholder = 0;

  for (const row of rows) {
    scanned++;
    if (!needsBackfill(row.logo_url)) continue;

    const input = buildResolverInput(row);
    let result;
    try {
      result = await resolveLogo(input);
    } catch (err) {
      console.warn(`  [!!] ${row.slug}: ${err?.message ?? err}`);
      continue;
    }

    const tag = SOURCE_TAG[result.source] ?? "??";
    console.log(`  [${tag}] ${row.slug} → ${result.url}`);

    if (result.source === "placeholder") {
      placeholder++;
      // Don't write the placeholder URL — the frontend already falls back
      // to initials when the image can't load, and writing a path that
      // doesn't exist on disk doesn't improve anything.
      continue;
    }

    if (DRY_RUN) {
      updated++;
      continue;
    }

    const { error } = await sb
      .from(table)
      .update({ logo_url: result.url })
      .eq("id", row.id);
    if (error) {
      console.warn(`  [!!] update failed for ${row.slug}: ${error.message}`);
      continue;
    }
    updated++;
  }

  return { scanned, updated, placeholder };
}

async function main() {
  console.log(
    `mode=${DRY_RUN ? "DRY_RUN" : "LIVE"} batch=${BATCH} tables=${TARGET_TABLES.join(",")}`,
  );

  let totalScanned = 0;
  let totalUpdated = 0;
  let totalPlaceholder = 0;

  for (const table of TARGET_TABLES) {
    const r = await backfillTable(table);
    totalScanned += r.scanned;
    totalUpdated += r.updated;
    totalPlaceholder += r.placeholder;
  }

  console.log(
    `\ndone. scanned=${totalScanned} updated=${totalUpdated} placeholder=${totalPlaceholder}`,
  );
}

await main();
