import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/ops/proposals/[id]/apply
 *
 * Applies a pending Claude-proposed workflow fix to n8n.
 *
 * Sequence (mirrors the constraint in our CLAUDE.md notes: PUT requires
 * deactivate first and the body must be stripped to writable fields):
 *   1. Load the proposal row (status='pending').
 *   2. Deactivate the workflow.
 *   3. PUT the patched body — only {name, nodes, connections, settings}.
 *   4. Reactivate.
 *   5. Mark the proposal applied.
 *
 * On any failure we set status='failed' with the error message and
 * fire a best-effort reactivate so we never leave a workflow paused
 * by accident.
 */

const N8N_URL = process.env.N8N_URL ?? "https://n8n.nexflowai.net";
const N8N_API_KEY = process.env.N8N_API_KEY ?? "";

function sb() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

interface ProposalRow {
  id: string;
  workflow_id: string;
  proposed_patch: { name?: string; nodes?: unknown; connections?: unknown; settings?: unknown };
  original_snapshot: { active?: boolean };
  status: string;
}

async function n8nFetch(path: string, init?: RequestInit) {
  return fetch(`${N8N_URL}${path}`, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      "X-N8N-API-KEY": N8N_API_KEY,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
}

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!N8N_API_KEY) {
    return NextResponse.json({ error: "N8N_API_KEY missing" }, { status: 503 });
  }
  const supabase = sb();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 503 },
    );
  }

  const { id } = await ctx.params;
  const { data, error } = await supabase
    .from("ops_auto_actions")
    .select("*")
    .eq("id", id)
    .eq("kind", "proposal")
    .maybeSingle();
  if (error || !data) {
    return NextResponse.json(
      { error: "proposal not found" },
      { status: 404 },
    );
  }
  const row = data as ProposalRow;
  if (row.status !== "pending") {
    return NextResponse.json(
      { error: `proposal is ${row.status}, not pending` },
      { status: 400 },
    );
  }
  if (!row.proposed_patch?.nodes || !row.proposed_patch?.connections) {
    return NextResponse.json(
      { error: "proposed patch missing nodes/connections" },
      { status: 400 },
    );
  }

  const wasActive = row.original_snapshot?.active === true;

  let stage = "deactivate";
  try {
    if (wasActive) {
      const deact = await n8nFetch(
        `/api/v1/workflows/${row.workflow_id}/deactivate`,
        { method: "POST" },
      );
      if (!deact.ok && deact.status !== 200 && deact.status !== 201) {
        // n8n returns 200/201 on success; some versions 200 only.
        throw new Error(`n8n deactivate ${deact.status}`);
      }
    }

    stage = "put";
    const body = {
      name: row.proposed_patch.name,
      nodes: row.proposed_patch.nodes,
      connections: row.proposed_patch.connections,
      settings: row.proposed_patch.settings ?? {},
    };
    const put = await n8nFetch(`/api/v1/workflows/${row.workflow_id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
    if (!put.ok) {
      const txt = await put.text().catch(() => "");
      throw new Error(`n8n PUT ${put.status}: ${txt.slice(0, 200)}`);
    }

    stage = "reactivate";
    if (wasActive) {
      const react = await n8nFetch(
        `/api/v1/workflows/${row.workflow_id}/activate`,
        { method: "POST" },
      );
      if (!react.ok && react.status !== 200 && react.status !== 201) {
        throw new Error(`n8n activate ${react.status}`);
      }
    }

    await supabase
      .from("ops_auto_actions")
      .update({
        status: "applied",
        applied_at: new Date().toISOString(),
        applied_by: "admin-apply",
      })
      .eq("id", id);

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    // Best-effort reactivate so a half-applied state doesn't leave the
    // workflow paused. Errors here are intentionally swallowed.
    if (wasActive && stage !== "deactivate") {
      try {
        await n8nFetch(`/api/v1/workflows/${row.workflow_id}/activate`, {
          method: "POST",
        });
      } catch {
        /* swallow */
      }
    }
    await supabase
      .from("ops_auto_actions")
      .update({
        status: "failed",
        apply_error: `${stage}: ${msg}`,
        applied_at: new Date().toISOString(),
        applied_by: "admin-apply",
      })
      .eq("id", id);

    return NextResponse.json(
      { error: msg, stage },
      { status: 500 },
    );
  }
}
