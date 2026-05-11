/**
 * Auto-promote `discovery_cli_tools` rows into `cli_tool_listings`.
 *
 * Sister of `auto_promote_connectors.mjs`, with a stricter quality bar
 * because CLIs ship a binary into the user's $PATH — a bad row costs
 * the user real time. JM's rule: "toca traer solo lo bueno y lo
 * probado".
 *
 * Hard requirements for auto-promote (all must hold):
 *   - review_status = 'pending'
 *   - classification_confidence ≥ MIN_CONFIDENCE_AUTO (default 0.85)
 *   - non-empty binary, install_command, homepage
 *   - install_command starts with a known installer prefix
 *     (brew, npm, pnpm, pip, cargo, go install, curl, gh extension)
 *     to filter one-off shell scripts that aren't really packages
 *   - binary not already present in cli_tool_listings or in any
 *     content/cli-tools/*.md file
 *
 * Logo resolution is best-effort — if scripts/lib/logoResolver.mjs
 * exists (parallel PR), we use it; otherwise we fall back to an
 * empty logo_url so the catalog can still render.
 *
 * Idempotent + dry-run friendly:
 *   node scripts/auto_promote_cli.mjs --dry-run
 *   DRY_RUN=1 node scripts/auto_promote_cli.mjs
 */
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
const sb = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

const MIN_CONFIDENCE_AUTO = Number(process.env.MIN_CONFIDENCE_AUTO ?? "0.85");
const BATCH = Number(process.env.BATCH ?? "100");
const DRY_RUN =
  process.env.DRY_RUN === "1" || process.argv.includes("--dry-run");

const ALLOWED_CATEGORIES = new Set([
  "dev",
  "deploy",
  "database",
  "payments",
  "infra",
  "productivity",
]);

// Known package-manager / fetcher prefixes. Anything starting with one
// of these counts as a "real install". A row whose install_command is
// `./setup.sh` or `make install` is too bespoke to auto-publish.
const KNOWN_INSTALLER_PREFIXES = [
  "brew ",
  "npm ",
  "pnpm ",
  "yarn ",
  "pip ",
  "pip3 ",
  "pipx ",
  "cargo ",
  "go install",
  "curl ",
  "gh extension",
];

function isKnownInstaller(cmd) {
  const lower = cmd.trim().toLowerCase();
  return KNOWN_INSTALLER_PREFIXES.some((p) => lower.startsWith(p));
}

function safeCategory(raw) {
  return ALLOWED_CATEGORIES.has(raw) ? raw : "dev";
}

// ─── Logo resolver (optional, lives in a parallel PR) ──────────────────
// We try to import it dynamically so this script keeps working before
// the resolver lands in main. Failure here is silent on purpose —
// empty logo_url just renders the default card initial.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
let resolveLogo = null;
try {
  const mod = await import("./lib/logoResolver.mjs");
  if (typeof mod.resolveLogo === "function") {
    resolveLogo = mod.resolveLogo;
  }
} catch {
  // resolver not present yet — that's fine
}

// ─── Markdown-file binary index (dedup against hand-curated CLIs) ──────
// The 5 CLIs that exist as markdown (gh, supabase, vercel, stripe,
// wrangler) shouldn't get duplicated from discovery. Build the index
// once at startup; matter parsing kept tiny so we don't need gray-matter.
function loadFileBinaries() {
  const root = path.join(__dirname, "..", "content", "cli-tools");
  const out = new Set();
  if (!fs.existsSync(root)) return out;
  for (const lang of fs.readdirSync(root)) {
    const dir = path.join(root, lang);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith(".md")) continue;
      const raw = fs.readFileSync(path.join(dir, file), "utf8");
      // Cheap frontmatter binary extraction — frontmatter is YAML between
      // '---' markers. Look for a `binary:` line in the first block.
      const fmEnd = raw.indexOf("\n---", 3);
      if (fmEnd === -1) continue;
      const fm = raw.slice(0, fmEnd);
      const m = fm.match(/^binary:\s*(.+)$/m);
      if (m) {
        out.add(m[1].trim());
      }
    }
  }
  return out;
}

function buildDescription(row) {
  const summary =
    row.gemini_summary?.trim() ?? row.raw_description?.trim() ?? "";
  const homepage = row.homepage ? `**Homepage:** ${row.homepage}` : null;
  const repo = row.repo_url ? `**Repo:** ${row.repo_url}` : null;
  return [summary, homepage, repo].filter(Boolean).join("\n\n");
}

function buildSetup(row) {
  // CLIs have a real install command — surface it as a copy-paste block.
  const lines = [`## Install\n\n\`\`\`bash\n${row.install_command}\n\`\`\``];
  if (row.auth_command) {
    lines.push(
      `## Authenticate\n\n\`\`\`bash\n${row.auth_command}\n\`\`\``,
    );
  }
  if (row.homepage) {
    lines.push(`## Docs\n\n${row.homepage}`);
  }
  return lines.join("\n\n");
}

async function getCuratedPublisherId() {
  const { data, error } = await sb
    .from("publishers")
    .select("id")
    .eq("slug", "terminalsync-curated")
    .maybeSingle();
  if (error || !data) {
    throw new Error("terminalsync-curated publisher not found");
  }
  return data.id;
}

async function alreadyPublished(slug, binary, repoUrl) {
  const orParts = [`slug.eq.${slug}`];
  if (binary) orParts.push(`binary.eq.${binary}`);
  if (repoUrl) orParts.push(`repo_url.eq.${repoUrl}`);
  const { data } = await sb
    .from("cli_tool_listings")
    .select("id")
    .or(orParts.join(","))
    .limit(1)
    .maybeSingle();
  return Boolean(data);
}

async function promote(row, publisherId, fileBinaries) {
  // Hard requirements — drop anything missing the essentials.
  if (!row.binary || !row.install_command || !row.homepage) {
    return { ok: false, reason: "missing binary/install_command/homepage" };
  }
  if (!isKnownInstaller(row.install_command)) {
    return { ok: false, reason: "install_command not a known installer" };
  }
  if (fileBinaries.has(row.binary)) {
    return { ok: false, reason: "binary already shipped as markdown" };
  }
  if (await alreadyPublished(row.product_slug, row.binary, row.repo_url)) {
    return { ok: false, reason: "already published" };
  }

  const cta_url = row.homepage || row.repo_url || row.source_url;

  let logo_url = "";
  if (resolveLogo) {
    try {
      const resolved = await resolveLogo({
        name: row.product_name,
        homepage: row.homepage,
        repo: row.repo_url,
      });
      if (typeof resolved === "string") logo_url = resolved;
      else if (resolved && typeof resolved.url === "string") logo_url = resolved.url;
    } catch (err) {
      // graceful fallback — don't fail the whole row over a logo
      console.warn(
        `logo resolver threw for ${row.product_slug}: ${err?.message ?? err}`,
      );
    }
  }

  const listing = {
    publisher_id: publisherId,
    slug: row.product_slug,
    name: row.product_name,
    tagline:
      row.raw_description?.slice(0, 200) ??
      row.gemini_summary?.slice(0, 200) ??
      row.product_name,
    category: safeCategory(row.marketplace_category),
    logo_url,
    description_md: buildDescription(row),
    setup_md: buildSetup(row),
    pricing_type: "free",
    status: "approved",
    review_notes: `auto-promoted by auto-confidence (confidence ${row.classification_confidence})`,
    approved_at: new Date().toISOString(),
    binary: row.binary,
    install_command: row.install_command,
    auth_command: row.auth_command,
    vendor: row.vendor,
    homepage: row.homepage,
    repo_url: row.repo_url,
    cta_url,
    source_url: row.source_url,
  };

  if (DRY_RUN) {
    console.log(
      `DRY [${row.product_slug}] would insert: ${row.binary} (${row.install_command})`,
    );
    return { ok: true, dry: true };
  }

  const { error: insErr } = await sb.from("cli_tool_listings").insert(listing);
  if (insErr) return { ok: false, reason: insErr.message };

  await sb
    .from("discovery_cli_tools")
    .update({
      review_status: "approved",
      reviewed_at: new Date().toISOString(),
      review_notes: `promoted to cli_tool_listings via auto-promote`,
    })
    .eq("id", row.id);

  return { ok: true };
}

async function reject(row, reason) {
  if (DRY_RUN) {
    console.log(`DRY [${row.product_slug}] would reject: ${reason}`);
    return;
  }
  await sb
    .from("discovery_cli_tools")
    .update({
      review_status: "rejected",
      reviewed_at: new Date().toISOString(),
      review_notes: reason,
    })
    .eq("id", row.id);
}

async function main() {
  const publisherId = await getCuratedPublisherId();
  const fileBinaries = loadFileBinaries();
  console.log(`curated publisher: ${publisherId}`);
  console.log(
    `mode=${DRY_RUN ? "DRY_RUN" : "LIVE"} min_auto=${MIN_CONFIDENCE_AUTO} file_binaries=${fileBinaries.size} logo_resolver=${resolveLogo ? "yes" : "no"}`,
  );

  const { data: pending, error } = await sb
    .from("discovery_cli_tools")
    .select("*")
    .eq("review_status", "pending")
    .gte("classification_confidence", MIN_CONFIDENCE_AUTO)
    .order("classification_confidence", { ascending: false })
    .limit(BATCH);

  if (error) {
    console.error("Query failed:", error.message);
    process.exit(1);
  }
  console.log(`pending fetched: ${pending.length}`);

  let promoted = 0;
  let rejected = 0;
  let skipped = 0;

  for (const row of pending) {
    if (!row.product_slug || !row.product_name) {
      await reject(row, "missing product_slug/name");
      rejected++;
      continue;
    }
    const res = await promote(row, publisherId, fileBinaries);
    if (res.ok) {
      promoted++;
    } else if (
      res.reason === "already published" ||
      res.reason === "binary already shipped as markdown"
    ) {
      // Soft-skip: don't reject (the row may be useful later for a
      // different surface) — just leave it pending so an admin can see.
      skipped++;
    } else {
      console.warn(`SKIP [${row.product_slug}] ${res.reason}`);
      await reject(row, res.reason);
      rejected++;
    }
  }

  console.log(
    `done. promoted=${promoted} rejected=${rejected} skipped=${skipped}`,
  );
}

await main();
