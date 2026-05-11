/**
 * Auto-promote `discovery_connectors` rows into `connector_listings`.
 *
 * The discovery pipeline (n8n: `TSync · Connectors & Skills Discovery`,
 * `Thunderbit Discovery`) already calls Gemini for each scraped item
 * and stores the classification + a one-paragraph summary. That work
 * is good enough to auto-approve without a second LLM pass — we just
 * need to enforce a quality bar and copy the row into the public
 * catalog with all URL fields preserved.
 *
 * Quality bar (all must hold):
 *   - review_status = 'pending'
 *   - classification_confidence ≥ MIN_CONFIDENCE (default 0.8)
 *   - product_name present
 *   - at least one of repo_url / source_url / demo_url
 *
 * For each qualifying row:
 *   - Insert into `connector_listings` (status='approved') under the
 *     `terminalsync-curated` publisher with all URL fields populated
 *     and a clean description_md.
 *   - Mark the discovery row as review_status='approved'.
 *
 * Lower-confidence rows (0.5 ≤ x < 0.8) get the optional Claude pass
 * if ANTHROPIC_API_KEY is set — Claude reads the raw description and
 * source URL, decides keep/skip, and writes a richer description_md.
 * If no key, those rows just stay pending for human review.
 *
 * Rows under 0.5 are silently rejected by the next discovery sync;
 * we don't touch them here.
 *
 * Idempotent: skips slugs that already exist in connector_listings.
 *
 * Trigger: run from n8n cron (daily) or one-off:
 *   node scripts/auto_promote_connectors.mjs
 */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
const sb = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

const MIN_CONFIDENCE_AUTO = Number(process.env.MIN_CONFIDENCE_AUTO ?? "0.8");
const MIN_CONFIDENCE_CLAUDE = Number(process.env.MIN_CONFIDENCE_CLAUDE ?? "0.5");
const BATCH = Number(process.env.BATCH ?? "100");
const DRY_RUN = process.env.DRY_RUN === "1";

const ALLOWED_CATEGORIES = new Set([
  "productivity",
  "database",
  "automation",
  "storage",
  "messaging",
  "dev",
]);

function safeCategory(raw) {
  return ALLOWED_CATEGORIES.has(raw) ? raw : "productivity";
}

function buildDescription(row) {
  const summary = row.gemini_summary?.trim() ?? row.raw_description?.trim() ?? "";
  const repo = row.repo_url ? `**Repo:** ${row.repo_url}` : null;
  const source = row.source_url && row.source_url !== row.repo_url
    ? `**Source:** ${row.source_url}`
    : null;
  return [summary, repo, source].filter(Boolean).join("\n\n");
}

function buildSetup(row) {
  // We don't have install commands at discovery time. Surface the repo
  // so the visitor lands on the README.
  if (!row.repo_url) return null;
  return `## Install\n\nFollow the README at ${row.repo_url}\n\n## Source\n\n${row.repo_url}`;
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

async function alreadyPublished(slug, repoUrl) {
  const orParts = [`slug.eq.${slug}`];
  if (repoUrl) orParts.push(`repo_url.eq.${repoUrl}`);
  const { data } = await sb
    .from("connector_listings")
    .select("id")
    .or(orParts.join(","))
    .limit(1)
    .maybeSingle();
  return Boolean(data);
}

async function classifyWithClaude(row) {
  // Returns { keep: bool, description_md: string } or null if API absent.
  if (!ANTHROPIC_KEY) return null;
  const prompt = `You are evaluating an MCP connector for the public TerminalSync marketplace. Decide if it should be listed.

Item:
- name: ${row.product_name}
- category (claimed): ${row.marketplace_category}
- repo: ${row.repo_url ?? "—"}
- source: ${row.source_url ?? "—"}
- summary: ${row.gemini_summary ?? row.raw_description ?? "—"}

Listing rules:
- KEEP if it's a working MCP server / connector / skill with a real install path
- SKIP if it's a tweet/screenshot/blog post, a personal experiment with no README, off-topic, NSFW, or spam

Respond as JSON only: {"keep": true|false, "reason": "short", "description_md": "one paragraph plain prose, no markdown headers, <= 400 chars"}`;

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!r.ok) {
    console.warn("Claude API error", r.status, await r.text().catch(() => ""));
    return null;
  }
  const j = await r.json();
  const text = j.content?.[0]?.text ?? "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    return null;
  }
}

async function promote(row, publisherId, { decidedBy, descriptionOverride }) {
  const cta_url = row.repo_url || row.source_url || row.demo_url;
  if (!cta_url) return { ok: false, reason: "no URL" };

  const slug = row.product_slug;
  if (await alreadyPublished(slug, row.repo_url)) {
    return { ok: false, reason: "already published" };
  }

  const listing = {
    publisher_id: publisherId,
    slug,
    name: row.product_name,
    tagline: row.raw_description?.slice(0, 200) ?? row.product_name,
    category: safeCategory(row.marketplace_category),
    logo_url: "",
    description_md: descriptionOverride ?? buildDescription(row),
    setup_md: buildSetup(row) ?? "",
    pricing_type: "free",
    status: "approved",
    review_notes: `auto-promoted by ${decidedBy} (confidence ${row.classification_confidence})`,
    approved_at: new Date().toISOString(),
    cta_url,
    source_url: row.source_url,
    repo_url: row.repo_url,
    demo_url: row.demo_url,
  };

  if (DRY_RUN) {
    console.log(`DRY [${slug}] would insert from ${decidedBy}`);
    return { ok: true, dry: true };
  }

  const { error: insErr } = await sb.from("connector_listings").insert(listing);
  if (insErr) return { ok: false, reason: insErr.message };

  await sb
    .from("discovery_connectors")
    .update({
      review_status: "approved",
      reviewed_by: decidedBy,
      reviewed_at: new Date().toISOString(),
      review_notes: `promoted to connector_listings via auto-promote`,
    })
    .eq("id", row.id);

  return { ok: true };
}

async function reject(row, decidedBy, reason) {
  if (DRY_RUN) {
    console.log(`DRY [${row.product_slug}] would reject: ${reason}`);
    return;
  }
  await sb
    .from("discovery_connectors")
    .update({
      review_status: "rejected",
      reviewed_by: decidedBy,
      reviewed_at: new Date().toISOString(),
      review_notes: reason,
    })
    .eq("id", row.id);
}

async function main() {
  const publisherId = await getCuratedPublisherId();
  console.log(`curated publisher: ${publisherId}`);
  console.log(
    `mode=${DRY_RUN ? "DRY_RUN" : "LIVE"} min_auto=${MIN_CONFIDENCE_AUTO} min_claude=${MIN_CONFIDENCE_CLAUDE} claude=${
      ANTHROPIC_KEY ? "yes" : "no"
    }`,
  );

  const { data: pending, error } = await sb
    .from("discovery_connectors")
    .select("*")
    .eq("review_status", "pending")
    .gte("classification_confidence", MIN_CONFIDENCE_CLAUDE)
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
      await reject(row, "auto-promote", "missing product_slug/name");
      rejected++;
      continue;
    }
    if (!row.repo_url && !row.source_url && !row.demo_url) {
      await reject(row, "auto-promote", "no URL on row");
      rejected++;
      continue;
    }

    // Auto-confidence path requires a real repo URL — listings that
    // would only link to a tweet have to go through the Claude pass so
    // we don't ship cards that lead to social media noise.
    if (row.classification_confidence >= MIN_CONFIDENCE_AUTO && row.repo_url) {
      const res = await promote(row, publisherId, { decidedBy: "auto-confidence" });
      if (res.ok) promoted++;
      else if (res.reason === "already published") skipped++;
      else {
        console.warn(`SKIP [${row.product_slug}] ${res.reason}`);
        skipped++;
      }
      continue;
    }

    // Claude tier
    const verdict = await classifyWithClaude(row);
    if (!verdict) {
      skipped++;
      continue;
    }
    if (!verdict.keep) {
      await reject(row, "auto-claude", verdict.reason ?? "claude rejected");
      rejected++;
      continue;
    }
    const res = await promote(row, publisherId, {
      decidedBy: "auto-claude",
      descriptionOverride: verdict.description_md ?? null,
    });
    if (res.ok) promoted++;
    else skipped++;
  }

  console.log(
    `done. promoted=${promoted} rejected=${rejected} skipped=${skipped}`,
  );
}

await main();
