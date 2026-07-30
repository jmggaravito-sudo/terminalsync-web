import { NextResponse } from "next/server";
import { authenticate, isAdmin } from "@/lib/marketplace/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/admin/loop-runs
 *
 * Admin-only read endpoint for /admin/loop-runs. The page checks Supabase login
 * before rendering data, and this route verifies the Bearer token plus
 * ADMIN_EMAILS allowlist before reading operational history.
 */
export async function GET(req: Request) {
  const user = await authenticate(req);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(user))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const sb = getSupabaseAdmin();
  if (!sb)
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 503 },
    );

  const full = await sb
    .from("loop_runs")
    .select(
      "id, ran_at, kind, item_slugs, connectors_found, connectors_skipped, pr_url",
    )
    .order("ran_at", { ascending: false })
    .limit(100);

  if (!full.error)
    return NextResponse.json({
      runs: normalizeRuns((full.data ?? []) as unknown as LoopRunRow[]),
    });

  const fallbackColumns = isMissingKindColumn(full.error)
    ? "id, ran_at, connectors_found, connectors_skipped, pr_url"
    : isMissingItemSlugsColumn(full.error)
      ? "id, ran_at, kind, connectors_found, connectors_skipped, pr_url"
      : null;

  if (!fallbackColumns) {
    return NextResponse.json({ error: full.error.message }, { status: 500 });
  }

  const fallback = await sb
    .from("loop_runs")
    .select(fallbackColumns)
    .order("ran_at", { ascending: false })
    .limit(100);

  if (fallback.error)
    return NextResponse.json(
      { error: fallback.error.message },
      { status: 500 },
    );

  return NextResponse.json({
    schemaWarning:
      "loop_runs schema still migrating; rendering available landing links",
    runs: normalizeRuns((fallback.data ?? []) as unknown as LoopRunRow[]),
  });
}

function isMissingKindColumn(error: { message?: string; code?: string }) {
  return isMissingColumn(error, "kind");
}

function isMissingItemSlugsColumn(error: { message?: string; code?: string }) {
  return isMissingColumn(error, "item_slugs");
}

function isMissingColumn(
  error: { message?: string; code?: string },
  column: string,
) {
  return (
    error.code === "42703" &&
    new RegExp(
      `(?:loop_runs\\.)?${column} does not exist|column .*${column}.* does not exist`,
      "i",
    ).test(error.message ?? "")
  );
}

type LoopRunRow = {
  id?: string;
  ran_at?: string;
  kind?: string | null;
  item_slugs?: unknown;
  connectors_found?: number;
  connectors_skipped?: number;
  pr_url?: string | null;
};

const LEGACY_PR_ITEM_SLUGS: Record<string, string[]> = {
  "159": ["mongodb", "posthog", "pinecone"],
  "212": ["ideogram", "higgsfield", "zapier"],
};

function normalizeRuns(rows: LoopRunRow[]) {
  return rows.map((run) => {
    const itemSlugs = normalizeItemSlugs(run.item_slugs);
    return {
      ...run,
      kind: run.kind ?? "connectors",
      item_slugs:
        itemSlugs.length > 0 ? itemSlugs : legacyItemSlugs(run.pr_url),
    };
  });
}

function normalizeItemSlugs(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((slug): slug is string => isSafeSlug(slug));
}

function legacyItemSlugs(prUrl: string | null | undefined): string[] {
  if (!prUrl) return [];
  const match = prUrl.match(/\/pull\/(\d+)(?:$|[?#/])/);
  if (!match) return [];
  return LEGACY_PR_ITEM_SLUGS[match[1]] ?? [];
}

function isSafeSlug(value: unknown): value is string {
  return typeof value === "string" && /^[a-z0-9][a-z0-9-]*$/.test(value);
}
