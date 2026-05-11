import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/ops/auto-actions
 *
 * Lists rows from `ops_auto_actions` for the dashboard's Auto-Repair
 * tab. Two filtered slices in one response:
 *   - retries: last 30 (any status)
 *   - proposals: pending (sorted newest first) + last 10 applied/dismissed
 *
 * Proposals carry their original + patched workflow JSON for the
 * dashboard diff renderer — kept server-side until requested so the
 * /admin/ops page itself stays light.
 */

interface AutoActionRow {
  id: string;
  kind: "retry" | "proposal";
  workflow_id: string;
  workflow_name: string | null;
  execution_id: string | null;
  failed_node: string | null;
  raw_error: string | null;
  classification: string | null;
  confidence: number | null;
  reasoning: string | null;
  retry_execution_id: string | null;
  retry_status: string | null;
  proposed_patch: unknown;
  original_snapshot: unknown;
  proposal_summary: string | null;
  status: "pending" | "applied" | "dismissed" | "failed";
  applied_at: string | null;
  applied_by: string | null;
  apply_error: string | null;
  created_at: string;
}

export async function GET() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return NextResponse.json({ retries: [], proposals: [] });
  }
  const sb = createClient(url, key, { auth: { persistSession: false } });

  const [retriesRes, pendingRes, recentRes] = await Promise.all([
    sb
      .from("ops_auto_actions")
      .select(
        "id, workflow_id, workflow_name, execution_id, failed_node, raw_error, classification, confidence, reasoning, retry_execution_id, retry_status, status, applied_at, apply_error, created_at",
      )
      .eq("kind", "retry")
      .order("created_at", { ascending: false })
      .limit(30),
    sb
      .from("ops_auto_actions")
      .select("*")
      .eq("kind", "proposal")
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
    sb
      .from("ops_auto_actions")
      .select(
        "id, workflow_id, workflow_name, execution_id, failed_node, classification, confidence, proposal_summary, status, applied_at, applied_by, apply_error, created_at",
      )
      .eq("kind", "proposal")
      .neq("status", "pending")
      .order("applied_at", { ascending: false, nullsFirst: false })
      .limit(10),
  ]);

  return NextResponse.json({
    retries: (retriesRes.data ?? []) as Partial<AutoActionRow>[],
    proposals: {
      pending: (pendingRes.data ?? []) as Partial<AutoActionRow>[],
      recent: (recentRes.data ?? []) as Partial<AutoActionRow>[],
    },
  });
}
