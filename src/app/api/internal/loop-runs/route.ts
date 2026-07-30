import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LOOP_KINDS = ["connectors", "plugins", "kits", "skills"] as const;
type LoopKind = (typeof LOOP_KINDS)[number];

interface LoopRunsPayload {
  kind?: unknown;
  itemsFound?: unknown;
  itemsSkipped?: unknown;
  connectorsFound?: unknown;
  connectorsSkipped?: unknown;
  prUrl?: unknown;
  itemSlugs?: unknown;
  items?: unknown;
}

function bearerToken(req: Request): string | null {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.slice("Bearer ".length).trim();
}

function parseLoopKind(value: unknown): LoopKind | NextResponse {
  if (value == null) return "connectors";
  if (typeof value !== "string") {
    return NextResponse.json(
      { error: "kind must be a string when provided" },
      { status: 400 },
    );
  }
  const kind = value.trim().toLowerCase();
  if (!LOOP_KINDS.includes(kind as LoopKind)) {
    return NextResponse.json(
      { error: "kind must be one of: connectors, plugins, kits, skills" },
      { status: 400 },
    );
  }
  return kind as LoopKind;
}

function nonNegativeInteger(
  value: unknown,
  field: string,
): number | NextResponse {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    return NextResponse.json(
      { error: `${field} must be a non-negative integer` },
      { status: 400 },
    );
  }
  return value;
}

function parseItemSlugs(value: unknown): string[] | NextResponse {
  if (value == null) return [];
  const raw = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",")
      : null;
  if (!raw) {
    return NextResponse.json(
      {
        error:
          "itemSlugs/items must be a string array or comma-separated string",
      },
      { status: 400 },
    );
  }

  const slugs = raw
    .map((item) => (typeof item === "string" ? item.trim().toLowerCase() : ""))
    .filter(Boolean);

  if (slugs.some((slug) => !/^[a-z0-9][a-z0-9-]*$/.test(slug))) {
    return NextResponse.json(
      { error: "itemSlugs/items contains an invalid slug" },
      { status: 400 },
    );
  }

  return [...new Set(slugs)];
}

/** POST /api/internal/loop-runs
 *
 * Server-to-server write endpoint called by the manual connectors Loop when a
 * run finishes. Auth is a shared bearer token stored in env vars — never in
 * the browser or repo.
 */
export async function POST(req: Request) {
  const expected = process.env.LOOP_RUNS_WRITE_TOKEN;
  if (!expected) {
    return NextResponse.json(
      { error: "LOOP_RUNS_WRITE_TOKEN not configured on server" },
      { status: 503 },
    );
  }

  const provided = bearerToken(req);
  if (!provided || provided !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: LoopRunsPayload;
  try {
    body = (await req.json()) as LoopRunsPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const kind = parseLoopKind(body.kind);
  if (kind instanceof NextResponse) return kind;

  const foundValue = body.itemsFound ?? body.connectorsFound;
  const skippedValue = body.itemsSkipped ?? body.connectorsSkipped;
  const itemsFound = nonNegativeInteger(foundValue, "itemsFound");
  if (itemsFound instanceof NextResponse) return itemsFound;
  const itemsSkipped = nonNegativeInteger(skippedValue, "itemsSkipped");
  if (itemsSkipped instanceof NextResponse) return itemsSkipped;

  const itemSlugs = parseItemSlugs(body.itemSlugs ?? body.items);
  if (itemSlugs instanceof NextResponse) return itemSlugs;

  let prUrl: string | null = null;
  if (body.prUrl != null) {
    if (typeof body.prUrl !== "string") {
      return NextResponse.json(
        { error: "prUrl must be a string when provided" },
        { status: 400 },
      );
    }
    const trimmed = body.prUrl.trim();
    if (trimmed.length > 0) {
      try {
        const url = new URL(trimmed);
        if (url.protocol !== "https:") throw new Error("not https");
        prUrl = trimmed;
      } catch {
        return NextResponse.json(
          { error: "prUrl must be a valid https URL" },
          { status: 400 },
        );
      }
    }
  }

  const sb = getSupabaseAdmin();
  if (!sb)
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 503 },
    );

  const insertPayload = {
    kind,
    item_slugs: itemSlugs,
    connectors_found: itemsFound,
    connectors_skipped: itemsSkipped,
    pr_url: prUrl,
  };

  const full = await sb
    .from("loop_runs")
    .insert(insertPayload)
    .select(
      "id, ran_at, kind, item_slugs, connectors_found, connectors_skipped, pr_url",
    )
    .single();

  if (!full.error)
    return NextResponse.json({ run: full.data }, { status: 201 });

  const fallbackPayload = {
    connectors_found: itemsFound,
    connectors_skipped: itemsSkipped,
    pr_url: prUrl,
  };

  const fallback = await sb
    .from("loop_runs")
    .insert(fallbackPayload)
    .select("id, ran_at, connectors_found, connectors_skipped, pr_url")
    .single();

  if (fallback.error)
    return NextResponse.json(
      { error: fallback.error.message },
      { status: 500 },
    );

  return NextResponse.json(
    {
      schemaWarning:
        "loop_runs schema still migrating; item slugs were accepted but not persisted",
      run: { ...fallback.data, kind, item_slugs: itemSlugs },
    },
    { status: 201 },
  );
}
