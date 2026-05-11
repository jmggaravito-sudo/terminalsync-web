import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/ops/executions/[id]
 *
 * Returns a compact, human-readable summary of a single n8n execution.
 * The raw `?includeData=true` response from n8n is huge (full payloads
 * per node), so we walk runData once on the server, pull out:
 *   - per-node status + run count + duration
 *   - first/last node's output (with a 240-char cap on JSON)
 *   - the error message + node name when status=error
 *
 * The dashboard renders this inline when JM clicks a sparkline dot or
 * an item in the "últimas corridas" list. Keeping the trimming on the
 * server keeps the wire payload tiny and avoids surfacing customer PII
 * or webhook tokens to the browser.
 */

const N8N_URL = process.env.N8N_URL ?? "https://n8n.nexflowai.net";
const N8N_API_KEY = process.env.N8N_API_KEY ?? "";

interface N8nRunDataEntry {
  startTime?: number;
  executionTime?: number;
  source?: unknown;
  error?: { message?: string; name?: string; description?: string } | null;
  data?: {
    main?: Array<Array<{ json?: unknown }>>;
  };
}

interface N8nExecutionResp {
  id: string;
  status: string;
  finished?: boolean;
  startedAt?: string;
  stoppedAt?: string;
  workflowId?: string;
  workflowData?: { name?: string };
  data?: {
    resultData?: {
      runData?: Record<string, N8nRunDataEntry[]>;
      lastNodeExecuted?: string;
      error?: {
        message?: string;
        node?: { name?: string; type?: string };
        description?: string;
      };
    };
  };
}

interface NodeSummary {
  name: string;
  status: "ok" | "error";
  runs: number;
  itemsOut: number;
  durationMs: number | null;
  errorMessage: string | null;
  /** Truncated JSON sample of the first item of the first run, capped
   *  at MAX_SAMPLE chars so a giant payload doesn't blow up the panel. */
  sample: string | null;
}

const MAX_SAMPLE = 240;

function truncate(s: string, n: number): string {
  return s.length <= n ? s : s.slice(0, n - 1) + "…";
}

function sampleOf(entry: N8nRunDataEntry | undefined): string | null {
  const main = entry?.data?.main;
  if (!main || main.length === 0) return null;
  const first = main[0]?.[0]?.json;
  if (first === undefined || first === null) return null;
  try {
    const text =
      typeof first === "string"
        ? first
        : JSON.stringify(first, (_key, v) => {
            // Strip obvious secrets in case they ended up in the json
            if (typeof v === "string" && /^[A-Za-z0-9_-]{40,}$/.test(v)) {
              return "<redacted>";
            }
            return v;
          });
    return truncate(text, MAX_SAMPLE);
  } catch {
    return null;
  }
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!N8N_API_KEY) {
    return NextResponse.json({ error: "N8N_API_KEY not configured" }, { status: 503 });
  }
  const { id } = await ctx.params;
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "bad id" }, { status: 400 });
  }

  const r = await fetch(
    `${N8N_URL}/api/v1/executions/${id}?includeData=true`,
    { headers: { "X-N8N-API-KEY": N8N_API_KEY }, cache: "no-store" },
  );
  if (!r.ok) {
    return NextResponse.json(
      { error: `n8n ${r.status}` },
      { status: r.status >= 500 ? 502 : r.status },
    );
  }
  const j = (await r.json()) as N8nExecutionResp;

  const runData = j.data?.resultData?.runData ?? {};
  const lastNode = j.data?.resultData?.lastNodeExecuted ?? null;
  const error = j.data?.resultData?.error ?? null;

  const nodes: NodeSummary[] = Object.entries(runData).map(
    ([name, entries]) => {
      const errored = entries.find((e) => e.error);
      const total = entries.reduce(
        (acc, e) => acc + ((e.data?.main?.[0]?.length) ?? 0),
        0,
      );
      const dur = entries.reduce(
        (acc, e) => acc + (e.executionTime ?? 0),
        0,
      );
      return {
        name,
        status: errored ? "error" : "ok",
        runs: entries.length,
        itemsOut: total,
        durationMs: dur || null,
        errorMessage: errored?.error?.message ?? null,
        sample: sampleOf(entries[0]),
      };
    },
  );

  // Order: errored first, then by start time (run order is preserved
  // by Object.entries already, but the spec doesn't guarantee it).
  nodes.sort((a, b) => {
    if (a.status !== b.status) return a.status === "error" ? -1 : 1;
    return 0;
  });

  const durationMs =
    j.startedAt && j.stoppedAt
      ? new Date(j.stoppedAt).getTime() - new Date(j.startedAt).getTime()
      : null;

  return NextResponse.json({
    id: j.id,
    workflowId: j.workflowId ?? null,
    workflowName: j.workflowData?.name ?? null,
    status: j.status,
    finished: !!j.finished,
    startedAt: j.startedAt ?? null,
    stoppedAt: j.stoppedAt ?? null,
    durationMs,
    lastNode,
    error: error
      ? {
          message: error.message ?? null,
          node: error.node?.name ?? null,
          description: error.description ?? null,
        }
      : null,
    nodes,
  });
}
