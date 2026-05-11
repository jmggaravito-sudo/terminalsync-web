/**
 * Daily cron: auto-promote discovery_connectors → connector_listings.
 *
 * Schedule: every 24h at 06:00 UTC (after the discovery workflows
 * finish at 05:00 UTC). Defined in vercel.json -> crons.
 *
 * Auth: Vercel passes `Authorization: Bearer ${CRON_SECRET}` automatically
 * when the route lives under `/api/cron/*` and the secret env var is
 * present. We re-verify it server-side so a leaked URL can't trigger
 * the routine.
 *
 * The actual promotion logic lives in scripts/auto_promote_connectors.mjs
 * so it can be run by hand from a shell too — this route is just a thin
 * HTTP shim that imports the same logic, with the env vars Vercel
 * already injects.
 */
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { resolveLogo } from "@/lib/marketplace/logoResolver";

export const runtime = "nodejs";
// Keep responses fresh — never cache cron output.
export const dynamic = "force-dynamic";

const ALLOWED_CATEGORIES = new Set([
  "productivity",
  "database",
  "automation",
  "storage",
  "messaging",
  "dev",
]);

function safeCategory(raw: string | null): string {
  return raw && ALLOWED_CATEGORIES.has(raw) ? raw : "productivity";
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
}

function buildDescription(row: DiscoveryRow): string {
  const summary =
    row.gemini_summary?.trim() ?? row.raw_description?.trim() ?? "";
  const repo = row.repo_url ? `**Repo:** ${row.repo_url}` : null;
  const source =
    row.source_url && row.source_url !== row.repo_url
      ? `**Source:** ${row.source_url}`
      : null;
  return [summary, repo, source].filter(Boolean).join("\n\n");
}

function buildSetup(row: DiscoveryRow): string {
  if (!row.repo_url) return "";
  return `## Install\n\nFollow the README at ${row.repo_url}\n\n## Source\n\n${row.repo_url}`;
}

async function classifyWithClaude(
  row: DiscoveryRow,
  apiKey: string,
): Promise<{ keep: boolean; description_md?: string } | null> {
  const prompt = `You are evaluating an MCP connector for the TerminalSync marketplace. Decide if it should be listed.

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
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!r.ok) return null;
  const j = (await r.json()) as { content?: Array<{ text?: string }> };
  const text = j.content?.[0]?.text ?? "";
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
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

  const MIN_AUTO = Number(process.env.MIN_CONFIDENCE_AUTO ?? "0.8");
  const MIN_CLAUDE = Number(process.env.MIN_CONFIDENCE_CLAUDE ?? "0.5");
  const BATCH = Number(process.env.PROMOTE_BATCH ?? "100");
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  // Resolve curated publisher id
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

  // Pull a fresh batch of pending discoveries.
  const { data: pending, error } = await sb
    .from("discovery_connectors")
    .select("*")
    .eq("review_status", "pending")
    .gte("classification_confidence", MIN_CLAUDE)
    .order("classification_confidence", { ascending: false })
    .limit(BATCH);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let promoted = 0;
  let rejected = 0;
  let skipped = 0;
  let claudeCalls = 0;

  for (const raw of pending ?? []) {
    const row = raw as DiscoveryRow;

    if (!row.product_slug || !row.product_name) {
      await sb
        .from("discovery_connectors")
        .update({
          review_status: "rejected",
          reviewed_by: "auto-promote",
          reviewed_at: new Date().toISOString(),
          review_notes: "missing slug/name",
        })
        .eq("id", row.id);
      rejected++;
      continue;
    }
    if (!row.repo_url && !row.source_url && !row.demo_url) {
      await sb
        .from("discovery_connectors")
        .update({
          review_status: "rejected",
          reviewed_by: "auto-promote",
          reviewed_at: new Date().toISOString(),
          review_notes: "no URL on row",
        })
        .eq("id", row.id);
      rejected++;
      continue;
    }

    // Idempotency check on slug.
    const { data: existing } = await sb
      .from("connector_listings")
      .select("id")
      .eq("slug", row.product_slug)
      .maybeSingle();
    if (existing) {
      skipped++;
      continue;
    }

    // Auto-confidence path: high-confidence + real repo url
    const isAutoEligible =
      row.classification_confidence >= MIN_AUTO && row.repo_url;
    let decidedBy = "auto-confidence";
    let descriptionOverride: string | null = null;

    if (!isAutoEligible) {
      // Claude pass — only if we have an API key.
      if (!anthropicKey) {
        skipped++;
        continue;
      }
      claudeCalls++;
      const verdict = await classifyWithClaude(row, anthropicKey);
      if (!verdict) {
        skipped++;
        continue;
      }
      if (!verdict.keep) {
        await sb
          .from("discovery_connectors")
          .update({
            review_status: "rejected",
            reviewed_by: "auto-claude",
            reviewed_at: new Date().toISOString(),
            review_notes: "claude rejected",
          })
          .eq("id", row.id);
        rejected++;
        continue;
      }
      decidedBy = "auto-claude";
      descriptionOverride = verdict.description_md ?? null;
    }

    const ctaUrl = row.repo_url || row.source_url || row.demo_url;

    // Resolve a real logo before insert. Without this every cron-promoted
    // row lands with logo_url="" and the catalog renders a blank rounded
    // square. The resolver cascades brandfetch → github → favicon and
    // falls back to a placeholder, so it always returns something.
    let logoUrl = "";
    try {
      const resolved = await resolveLogo({
        homepage: row.demo_url || row.source_url || null,
        repoUrl: row.repo_url || null,
        name: row.product_name,
      });
      logoUrl = resolved.url;
    } catch (err) {
      // Resolver is best-effort — the frontend renders initials when the
      // image fails, so an empty string still degrades gracefully.
      console.warn("[promote-connectors] resolveLogo failed:", err);
    }

    const listing = {
      publisher_id: publisherId,
      slug: row.product_slug,
      name: row.product_name,
      tagline: row.raw_description?.slice(0, 200) ?? row.product_name,
      category: safeCategory(row.marketplace_category),
      logo_url: logoUrl,
      description_md: descriptionOverride ?? buildDescription(row),
      setup_md: buildSetup(row),
      pricing_type: "free",
      status: "approved",
      review_notes: `auto-promoted by ${decidedBy} (confidence ${row.classification_confidence})`,
      approved_at: new Date().toISOString(),
      cta_url: ctaUrl,
      source_url: row.source_url,
      repo_url: row.repo_url,
      demo_url: row.demo_url,
    };
    const { error: insErr } = await sb
      .from("connector_listings")
      .insert(listing);
    if (insErr) {
      skipped++;
      continue;
    }
    await sb
      .from("discovery_connectors")
      .update({
        review_status: "approved",
        reviewed_by: decidedBy,
        reviewed_at: new Date().toISOString(),
        review_notes: "promoted to connector_listings",
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
    claudeCalls,
    hasClaude: Boolean(anthropicKey),
  });
}
