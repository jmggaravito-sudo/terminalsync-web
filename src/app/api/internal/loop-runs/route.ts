import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface LoopRunsPayload {
  connectorsFound?: unknown;
  connectorsSkipped?: unknown;
  prUrl?: unknown;
}

function bearerToken(req: Request): string | null {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.slice("Bearer ".length).trim();
}

function nonNegativeInteger(value: unknown, field: string): number | NextResponse {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    return NextResponse.json({ error: `${field} must be a non-negative integer` }, { status: 400 });
  }
  return value;
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

  const connectorsFound = nonNegativeInteger(body.connectorsFound, "connectorsFound");
  if (connectorsFound instanceof NextResponse) return connectorsFound;
  const connectorsSkipped = nonNegativeInteger(body.connectorsSkipped, "connectorsSkipped");
  if (connectorsSkipped instanceof NextResponse) return connectorsSkipped;

  let prUrl: string | null = null;
  if (body.prUrl != null) {
    if (typeof body.prUrl !== "string") {
      return NextResponse.json({ error: "prUrl must be a string when provided" }, { status: 400 });
    }
    const trimmed = body.prUrl.trim();
    if (trimmed.length > 0) {
      try {
        const url = new URL(trimmed);
        if (url.protocol !== "https:") throw new Error("not https");
        prUrl = trimmed;
      } catch {
        return NextResponse.json({ error: "prUrl must be a valid https URL" }, { status: 400 });
      }
    }
  }

  const sb = getSupabaseAdmin();
  if (!sb) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

  const { data, error } = await sb
    .from("loop_runs")
    .insert({
      connectors_found: connectorsFound,
      connectors_skipped: connectorsSkipped,
      pr_url: prUrl,
    })
    .select("id, ran_at, connectors_found, connectors_skipped, pr_url")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ run: data }, { status: 201 });
}
