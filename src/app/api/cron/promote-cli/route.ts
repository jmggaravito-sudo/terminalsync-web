/**
 * Daily cron: auto-promote discovery_cli_tools → cli_tool_listings.
 *
 * Sister route of /api/cron/promote-connectors. Same shape, stricter
 * quality bar because CLIs ship a binary into the user's $PATH — a
 * bad row costs trust, not just clutter:
 *
 *   - confidence >= MIN_CONFIDENCE_AUTO (default 0.85, vs 0.8 for connectors)
 *   - binary + install_command + homepage all present
 *   - install_command starts with a known installer prefix
 *   - binary not already published in cli_tool_listings
 *   - binary not already shipped as content/cli-tools/*.md
 *
 * No Claude fallback — if the classifier confidence is too low we
 * leave the row pending for admin review. CLI volume is small enough
 * that a hard threshold is fine.
 *
 * Schedule: 06:15 UTC (15 min after promote-connectors so they don't
 * race for the same Supabase connection budget). Defined in
 * vercel.json -> crons.
 */
import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { resolveLogo } from "@/lib/marketplace/logoResolver";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_CATEGORIES = new Set([
  "dev",
  "deploy",
  "database",
  "payments",
  "infra",
  "productivity",
]);

const KNOWN_INSTALL_PREFIXES = [
  "brew ",
  "npm ",
  "pnpm ",
  "yarn ",
  "pip ",
  "pipx ",
  "cargo ",
  "go install",
  "curl ",
  "gh extension",
];

function safeCategory(raw: string | null): string {
  return raw && ALLOWED_CATEGORIES.has(raw) ? raw : "dev";
}

function isKnownInstaller(cmd: string): boolean {
  const trimmed = cmd.trim().toLowerCase();
  return KNOWN_INSTALL_PREFIXES.some((p) => trimmed.startsWith(p));
}

interface DiscoveryRow {
  id: string;
  product_slug: string | null;
  product_name: string | null;
  raw_description: string | null;
  gemini_summary: string | null;
  classification_confidence: number;
  marketplace_category: string | null;
  repo_url: string | null;
  source_url: string | null;
  demo_url: string | null;
  cli_binary: string | null;
  install_command: string | null;
  auth_command: string | null;
  vendor: string | null;
  homepage: string | null;
}

function buildDescription(row: DiscoveryRow): string {
  const summary =
    row.gemini_summary?.trim() ?? row.raw_description?.trim() ?? "";
  const install = row.install_command
    ? `**Install:** \`${row.install_command}\``
    : null;
  const home = row.homepage ? `**Homepage:** ${row.homepage}` : null;
  const repo = row.repo_url ? `**Repo:** ${row.repo_url}` : null;
  return [summary, install, home, repo].filter(Boolean).join("\n\n");
}

function buildSetup(row: DiscoveryRow): string {
  const lines = [];
  if (row.install_command) {
    lines.push(`## Install\n\n\`\`\`\n${row.install_command}\n\`\`\``);
  }
  if (row.auth_command) {
    lines.push(`## Authenticate\n\n\`\`\`\n${row.auth_command}\n\`\`\``);
  }
  if (row.homepage) {
    lines.push(`## Docs\n\n${row.homepage}`);
  }
  return lines.join("\n\n");
}

/** Snapshot the binaries already shipped as markdown so we don't
 *  re-publish them from the discovery pipeline. */
function loadMarkdownBinaries(): Set<string> {
  const root = path.join(process.cwd(), "content", "cli-tools");
  const out = new Set<string>();
  if (!fs.existsSync(root)) return out;
  for (const lang of fs.readdirSync(root)) {
    const dir = path.join(root, lang);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith(".md")) continue;
      const raw = fs.readFileSync(path.join(dir, file), "utf8");
      const fmStart = raw.indexOf("---");
      if (fmStart !== 0) continue;
      const fmEnd = raw.indexOf("---", 3);
      if (fmEnd < 0) continue;
      const fm = raw.slice(3, fmEnd);
      const m = fm.match(/^binary:\s*(.+)$/m);
      if (m) out.add(m[1].trim().replace(/^["']|["']$/g, ""));
    }
  }
  return out;
}

export async function GET(req: Request) {
  const provided = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  if (!process.env.CRON_SECRET || provided !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supaUrl = process.env.SUPABASE_URL;
  const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supaUrl || !supaKey) {
    return NextResponse.json(
      { error: "Supabase env missing" },
      { status: 503 },
    );
  }
  const sb = createClient(supaUrl, supaKey, {
    auth: { persistSession: false },
  });

  const MIN_AUTO = Number(process.env.MIN_CONFIDENCE_CLI_AUTO ?? "0.85");
  const BATCH = Number(process.env.PROMOTE_CLI_BATCH ?? "100");

  const { data: pub } = await sb
    .from("publishers")
    .select("id")
    .eq("slug", "terminalsync-curated")
    .maybeSingle();
  if (!pub) {
    return NextResponse.json(
      { error: "terminalsync-curated publisher missing" },
      { status: 500 },
    );
  }
  const publisherId = pub.id as string;

  const markdownBinaries = loadMarkdownBinaries();

  const { data: pending, error } = await sb
    .from("discovery_cli_tools")
    .select("*")
    .eq("review_status", "pending")
    .gte("classification_confidence", MIN_AUTO)
    .order("classification_confidence", { ascending: false })
    .limit(BATCH);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let promoted = 0;
  let rejected = 0;
  let skipped = 0;

  for (const raw of pending ?? []) {
    const row = raw as DiscoveryRow;
    const binary = row.cli_binary?.trim() ?? "";
    const installCmd = row.install_command?.trim() ?? "";
    const homepage = row.homepage?.trim() ?? "";

    const rejectRow = async (reason: string) => {
      await sb
        .from("discovery_cli_tools")
        .update({
          review_status: "rejected",
          reviewed_by: "auto-promote",
          reviewed_at: new Date().toISOString(),
          review_notes: reason,
        })
        .eq("id", row.id);
      rejected++;
    };

    if (!row.product_slug || !row.product_name) {
      await rejectRow("missing slug/name");
      continue;
    }
    if (!binary || !installCmd || !homepage) {
      await rejectRow("missing binary/install_command/homepage");
      continue;
    }
    if (!isKnownInstaller(installCmd)) {
      await rejectRow("install_command not from a known installer");
      continue;
    }
    if (markdownBinaries.has(binary)) {
      skipped++;
      continue;
    }

    // Dedup against already-published listings (binary first, slug fallback).
    const { data: existing } = await sb
      .from("cli_tool_listings")
      .select("id")
      .or(`cli_binary.eq.${binary},slug.eq.${row.product_slug}`)
      .maybeSingle();
    if (existing) {
      skipped++;
      continue;
    }

    let logoUrl = "";
    try {
      const resolved = await resolveLogo({
        homepage,
        repoUrl: row.repo_url,
        name: row.product_name,
      });
      logoUrl = resolved.url;
    } catch (err) {
      console.warn("[promote-cli] resolveLogo failed:", err);
    }

    const listing = {
      publisher_id: publisherId,
      slug: row.product_slug,
      name: row.product_name,
      tagline:
        row.gemini_summary?.slice(0, 200) ??
        row.raw_description?.slice(0, 200) ??
        row.product_name,
      category: safeCategory(row.marketplace_category),
      logo_url: logoUrl,
      description_md: buildDescription(row),
      setup_md: buildSetup(row),
      pricing_type: "free",
      status: "approved",
      review_notes: `auto-promoted by auto-confidence (confidence ${row.classification_confidence})`,
      approved_at: new Date().toISOString(),
      cli_binary: binary,
      install_command: installCmd,
      auth_command: row.auth_command?.trim() || null,
      vendor: row.vendor?.trim() || null,
      homepage,
      repo_url: row.repo_url,
      cta_url: homepage,
      source_url: row.source_url,
    };
    const { error: insErr } = await sb
      .from("cli_tool_listings")
      .insert(listing);
    if (insErr) {
      console.warn(
        `[promote-cli] insert failed for ${row.product_slug}: ${insErr.message}`,
      );
      skipped++;
      continue;
    }
    await sb
      .from("discovery_cli_tools")
      .update({
        review_status: "approved",
        reviewed_by: "auto-confidence",
        reviewed_at: new Date().toISOString(),
        review_notes: "promoted to cli_tool_listings",
      })
      .eq("id", row.id);
    promoted++;
  }

  return NextResponse.json({
    ok: true,
    fetched: pending?.length ?? 0,
    promoted,
    rejected,
    skipped,
    threshold: MIN_AUTO,
    markdownBinaries: markdownBinaries.size,
  });
}
