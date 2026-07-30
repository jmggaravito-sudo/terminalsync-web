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

  const { data, error } = await sb
    .from("loop_runs")
    .select("id, ran_at, kind, connectors_found, connectors_skipped, pr_url")
    .order("ran_at", { ascending: false })
    .limit(100);

  if (error && isMissingKindColumn(error)) {
    const fallback = await sb
      .from("loop_runs")
      .select("id, ran_at, connectors_found, connectors_skipped, pr_url")
      .order("ran_at", { ascending: false })
      .limit(100);

    if (fallback.error)
      return NextResponse.json(
        { error: fallback.error.message },
        { status: 500 },
      );

    return NextResponse.json({
      schemaWarning: "loop_runs.kind missing; defaulting rows to connectors",
      runs: (fallback.data ?? []).map((run) => ({
        ...run,
        kind: "connectors",
      })),
    });
  }

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ runs: data ?? [] });
}

function isMissingKindColumn(error: { message?: string; code?: string }) {
  return (
    error.code === "42703" ||
    /loop_runs\.kind does not exist|column .*kind.* does not exist/i.test(
      error.message ?? "",
    )
  );
}
