import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * PATCH /api/admin/ops/workflows/[id]
 *
 * Renames an n8n workflow. The dashboard wants to surface the rename
 * action inline next to each workflow card so JM can clean up names
 * without opening n8n; this endpoint is the thin server-side bridge.
 *
 * Why GET-then-PUT instead of a real PATCH?
 *   n8n's public API doesn't accept PATCH on /workflows/{id} (returns
 *   "PATCH method not allowed"). It only accepts PUT, which requires
 *   the full workflow body. Worse, the request schema rejects extra
 *   keys inside `settings` that n8n itself returns on GET (e.g.
 *   `binaryMode`, `availableInMCP`), so we have to filter `settings`
 *   down to its allowed properties before round-tripping.
 *
 * Auth model: same as the GET handler — none. The dashboard is robots-
 * indexed off and the n8n API key never leaves the server. Adding a
 * write gate would re-introduce the login wall JM explicitly killed,
 * so the trade-off is: anyone who knows the unindexed URL can rename
 * a workflow. Accepted risk for now; revisit if it gets discovered.
 */

const N8N_URL = process.env.N8N_URL ?? "https://n8n.nexflowai.net";
const N8N_API_KEY = process.env.N8N_API_KEY ?? "";

/** Keys n8n's PUT schema actually accepts inside `settings`. The GET
 *  response sometimes includes extras (binaryMode, availableInMCP) that
 *  the validator rejects with "must NOT have additional properties". */
const ALLOWED_SETTINGS_KEYS = [
  "saveExecutionProgress",
  "saveManualExecutions",
  "saveDataErrorExecution",
  "saveDataSuccessExecution",
  "executionTimeout",
  "errorWorkflow",
  "timezone",
  "executionOrder",
] as const;

interface N8nWorkflowDetail {
  id: string;
  name: string;
  active: boolean;
  nodes: unknown[];
  connections: unknown;
  settings?: Record<string, unknown>;
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!N8N_API_KEY) {
    return NextResponse.json(
      { error: "N8N_API_KEY not configured" },
      { status: 503 },
    );
  }

  const { id } = await ctx.params;
  if (!/^[A-Za-z0-9]+$/.test(id)) {
    return NextResponse.json({ error: "bad id" }, { status: 400 });
  }

  let body: { name?: unknown };
  try {
    body = (await req.json()) as { name?: unknown };
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const newName = typeof body.name === "string" ? body.name.trim() : "";
  if (!newName || newName.length > 200) {
    return NextResponse.json(
      { error: "name must be a non-empty string up to 200 chars" },
      { status: 400 },
    );
  }

  const headers = {
    "X-N8N-API-KEY": N8N_API_KEY,
    "Content-Type": "application/json",
  };

  const getRes = await fetch(`${N8N_URL}/api/v1/workflows/${id}`, {
    headers,
    cache: "no-store",
  });
  if (!getRes.ok) {
    return NextResponse.json(
      { error: `n8n GET ${getRes.status}` },
      { status: getRes.status === 404 ? 404 : 502 },
    );
  }
  const wf = (await getRes.json()) as N8nWorkflowDetail;

  // Filter settings down to the keys n8n's PUT schema accepts.
  const filteredSettings: Record<string, unknown> = {};
  if (wf.settings) {
    for (const k of ALLOWED_SETTINGS_KEYS) {
      const v = wf.settings[k];
      if (v !== undefined && v !== null) filteredSettings[k] = v;
    }
  }

  const putBody = {
    name: newName,
    nodes: wf.nodes ?? [],
    connections: wf.connections ?? {},
    settings: filteredSettings,
  };

  const putRes = await fetch(`${N8N_URL}/api/v1/workflows/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(putBody),
  });
  if (!putRes.ok) {
    const text = await putRes.text().catch(() => "");
    return NextResponse.json(
      { error: `n8n PUT ${putRes.status}`, detail: text.slice(0, 300) },
      { status: 502 },
    );
  }
  const updated = (await putRes.json()) as N8nWorkflowDetail;

  return NextResponse.json({ id: updated.id, name: updated.name });
}
