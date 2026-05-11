import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

/** POST /api/marketplace/admin/discovery/ingest
 *
 *  Called by the n8n discovery workflow (server-to-server). Authenticated
 *  with a shared secret in the X-API-Key header — matched against
 *  DISCOVERY_INGEST_KEY env var. NOT a user-facing endpoint.
 *
 *  Body shape:
 *    { type: "connectors" | "skills" | "cli", items: [{...}] }
 *
 *  Behavior:
 *    - Upserts on (repo_url) and falls back to (product_slug) when repo
 *      url is null. Conflicts are silently ignored — the n8n workflow
 *      pre-dedups already, this is just a safety net so a retry of the
 *      same scrape doesn't 500.
 *    - Validates known fields; ignores unknown ones.
 *    - For type="cli", `binary` and `install_command` are REQUIRED.
 *      They're the signals that distinguish a CLI tool from a connector
 *      or skill — without them we can't tell users how to install it,
 *      so the row would be useless in auto-promote.
 *    - Returns counts of inserted vs skipped items.
 */
export async function POST(req: Request) {
  const provided = req.headers.get("x-api-key");
  const expected = process.env.DISCOVERY_INGEST_KEY;
  if (!expected) {
    return NextResponse.json(
      { error: "DISCOVERY_INGEST_KEY not configured on server" },
      { status: 503 },
    );
  }
  if (!provided || provided !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = getSupabaseAdmin();
  if (!sb) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

  let body: { type?: unknown; items?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const type = body.type;
  if (type !== "connectors" && type !== "skills" && type !== "cli") {
    return NextResponse.json(
      { error: "type must be 'connectors', 'skills', or 'cli'" },
      { status: 400 },
    );
  }
  if (!Array.isArray(body.items)) {
    return NextResponse.json({ error: "items must be an array" }, { status: 400 });
  }

  const table =
    type === "connectors"
      ? "discovery_connectors"
      : type === "skills"
        ? "discovery_skills"
        : "discovery_cli_tools";
  const allowedCategoriesConn = new Set(["productivity", "database", "automation", "storage", "messaging", "dev"]);
  const allowedCategoriesSkill = new Set(["marketing", "dev", "productivity", "research", "design", "finance"]);
  const allowedCategoriesCli = new Set([
    "dev",
    "deploy",
    "database",
    "payments",
    "infra",
    "productivity",
  ]);
  const allowedPricing = new Set(["free", "paid", "freemium", "unknown"]);

  const rows: Record<string, unknown>[] = [];
  for (const raw of body.items as Record<string, unknown>[]) {
    if (!raw || typeof raw !== "object") continue;
    if (typeof raw.product_name !== "string" || !raw.product_name.trim()) continue;
    if (typeof raw.product_slug !== "string" || !raw.product_slug.trim()) continue;
    if (typeof raw.source_url !== "string") continue;
    const platform = String(raw.source_platform ?? "").toLowerCase();
    if (platform !== "youtube" && platform !== "x" && platform !== "manual") continue;

    const pricing = String(raw.pricing ?? "unknown");
    if (!allowedPricing.has(pricing)) continue;

    let category: string | null = null;
    if (typeof raw.marketplace_category === "string") {
      const cat = raw.marketplace_category.toLowerCase();
      const allowed =
        type === "connectors"
          ? allowedCategoriesConn
          : type === "skills"
            ? allowedCategoriesSkill
            : allowedCategoriesCli;
      if (allowed.has(cat)) category = cat;
    }

    const row: Record<string, unknown> = {
      source_platform: platform,
      source_url: raw.source_url,
      product_name: raw.product_name.trim().slice(0, 200),
      product_slug: raw.product_slug.toLowerCase().slice(0, 80),
      repo_url: typeof raw.repo_url === "string" ? raw.repo_url : null,
      demo_url: typeof raw.demo_url === "string" ? raw.demo_url : null,
      pricing,
      price_amount_usd: typeof raw.price_amount_usd === "number" ? raw.price_amount_usd : null,
      creator_handle: typeof raw.creator_handle === "string" ? raw.creator_handle : null,
      creator_email: typeof raw.creator_email === "string" ? raw.creator_email : null,
      creator_name: typeof raw.creator_name === "string" ? raw.creator_name : null,
      classification_confidence:
        typeof raw.classification_confidence === "number" ? raw.classification_confidence : null,
      gemini_summary: typeof raw.gemini_summary === "string" ? raw.gemini_summary : null,
      raw_title: typeof raw.raw_title === "string" ? raw.raw_title.slice(0, 500) : null,
      raw_description:
        typeof raw.raw_description === "string" ? raw.raw_description.slice(0, 2000) : null,
      marketplace_category: category,
    };
    if (type === "skills") {
      row.vendors = Array.isArray(raw.vendors)
        ? (raw.vendors as unknown[]).filter((v) => typeof v === "string")
        : [];
    }
    if (type === "cli") {
      // CLI rows MUST carry a binary + install command. Without them we
      // can't tell users how to install the tool, which means the row
      // can't auto-promote and isn't worth storing.
      const binary =
        typeof raw.binary === "string" ? raw.binary.trim() : "";
      const installCommand =
        typeof raw.install_command === "string"
          ? raw.install_command.trim()
          : "";
      if (!binary || !installCommand) continue;
      row.binary = binary.slice(0, 80);
      row.install_command = installCommand.slice(0, 300);
      row.auth_command =
        typeof raw.auth_command === "string"
          ? raw.auth_command.trim().slice(0, 300) || null
          : null;
      row.vendor =
        typeof raw.vendor === "string"
          ? raw.vendor.trim().slice(0, 120) || null
          : null;
      row.homepage =
        typeof raw.homepage === "string" ? raw.homepage : null;
    }
    rows.push(row);
  }

  if (rows.length === 0) {
    return NextResponse.json({ inserted: 0, skipped: 0, total: 0 });
  }

  // Insert ignoring duplicates on the unique constraints.
  const { data, error } = await sb
    .from(table)
    .upsert(rows, { onConflict: "product_slug", ignoreDuplicates: true })
    .select("id");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const inserted = data?.length ?? 0;
  return NextResponse.json({
    inserted,
    skipped: rows.length - inserted,
    total: rows.length,
  });
}
