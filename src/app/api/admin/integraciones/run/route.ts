import { NextResponse } from "next/server";
import { authenticate, isAdmin } from "@/lib/marketplace/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Panel A of /admin/integraciones — "Correr loops".
 *
 * POST → dispatches the `connector-loop.yml` GitHub Actions workflow in the
 *        `terminal-sync` repo (the multi-AI connector-parity supervisor:
 *        Claude/Codex/Gemini/GLM — see project memory
 *        "Connectors multi-IA gap"). GitHub answers 204 with no body on
 *        success; we normalize that to { ok: true }.
 * GET  → reads the workflow's latest run (status/conclusion/url/created_at)
 *        so the client can poll without hitting GitHub directly, plus the
 *        most recent `loop_runs` row (if Supabase is configured) as a
 *        secondary reinforcement signal. Both come back best-effort; a
 *        Supabase hiccup never breaks the GitHub Actions status.
 *
 * Auth: same Bearer access_token + ADMIN_EMAILS allowlist as every other
 * /api/admin route (see src/lib/marketplace/auth.ts).
 *
 * Token: INTEGRATIONS_GH_TOKEN if set, else OPS_GITHUB_TOKEN as a fallback
 * (same var src/lib/ops/reports.ts uses for the read-only /admin/ops/reports
 * page). IMPORTANT: OPS_GITHUB_TOKEN today is scoped Contents:Read +
 * Actions:Read only against jmggaravito-sudo/terminal-sync — enough for the
 * GET here, NOT enough for the POST dispatch below, which needs
 * Actions:Read+Write. Until JM either upgrades OPS_GITHUB_TOKEN's scope or
 * creates a dedicated INTEGRATIONS_GH_TOKEN with that scope, "Correr ahora"
 * will fail with a GitHub 403/404. See the PR description for the exact env
 * change needed — this route only documents it, it doesn't create the token.
 */

const OWNER = "jmggaravito-sudo";
const REPO = "terminal-sync";
const WORKFLOW = "connector-loop.yml";
const DISPATCH_REF = "release/v0.2.18-lab";

async function requireAdmin(req: Request) {
  const user = await authenticate(req);
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

function readToken(): string | null {
  const t = process.env.INTEGRATIONS_GH_TOKEN || process.env.OPS_GITHUB_TOKEN;
  return t && t.trim() ? t.trim() : null;
}

function baseHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "terminalsync-web-integraciones",
  };
}

interface GhRun {
  status: string;
  conclusion: string | null;
  html_url: string;
  created_at: string;
}
interface GhRunsResponse {
  workflow_runs?: GhRun[];
}

export interface IntegracionesRunStatus {
  status: string;
  conclusion: string | null;
  html_url: string;
  created_at: string;
}

/** Thrown only when GitHub answers 404 for the workflow-runs lookup — i.e.
 *  `connector-loop.yml` doesn't exist yet on `DISPATCH_REF` (PR #1603 not
 *  merged into release yet). The GET handler treats this as "no runs yet",
 *  not as an error. Any other non-2xx keeps throwing a plain Error, which
 *  the GET handler still turns into a 502. */
class WorkflowNotFoundError extends Error {}

async function fetchLatestRun(token: string): Promise<IntegracionesRunStatus | null> {
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/${WORKFLOW}/runs?per_page=1`,
    {
      headers: { ...baseHeaders(token), Accept: "application/vnd.github+json" },
      cache: "no-store",
    },
  );
  if (res.status === 404) {
    throw new WorkflowNotFoundError(
      `GitHub 404: workflow ${WORKFLOW} not found on ${OWNER}/${REPO} yet`,
    );
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GitHub ${res.status}${text ? `: ${text.slice(0, 300)}` : ""}`);
  }
  const json = (await res.json()) as GhRunsResponse;
  const run = json.workflow_runs?.[0];
  if (!run) return null;
  return {
    status: run.status,
    conclusion: run.conclusion,
    html_url: run.html_url,
    created_at: run.created_at,
  };
}

export interface LastLoopRun {
  id: string;
  ran_at: string;
  kind: string | null;
  pr_url: string | null;
}

/** Best-effort: the connector-loop.yml result may not land in `loop_runs`
 *  at all (that table today tracks the marketplace item-discovery loops +
 *  the landing↔app supervision loop — see supabase/migrations/0022-0026).
 *  We surface whatever the most recent row is as a reinforcement hint, not
 *  as ground truth for this specific workflow. Never throws. */
async function fetchLatestLoopRun(): Promise<LastLoopRun | null> {
  const sb = getSupabaseAdmin();
  if (!sb) return null;
  try {
    const { data, error } = await sb
      .from("loop_runs")
      .select("id, ran_at, kind, pr_url")
      .order("ran_at", { ascending: false })
      .limit(1);
    if (error || !data || data.length === 0) return null;
    return data[0] as LastLoopRun;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  const token = readToken();
  if (!token) {
    return NextResponse.json(
      {
        error:
          "Falta INTEGRATIONS_GH_TOKEN (o OPS_GITHUB_TOKEN) en el servidor.",
      },
      { status: 500 },
    );
  }

  // Kick off both lookups concurrently; fetchLatestLoopRun() never throws
  // (best-effort, see its own doc comment) so it's safe to await from
  // either branch below without a second try/catch.
  const lastLoopRunPromise = fetchLatestLoopRun();

  try {
    const run = await fetchLatestRun(token);
    const lastLoopRun = await lastLoopRunPromise;
    return NextResponse.json({ run, lastLoopRun });
  } catch (err) {
    if (err instanceof WorkflowNotFoundError) {
      // connector-loop.yml isn't on release yet (PR #1603 unmerged) — this
      // is "no runs yet", not a failure. 200, not 502, so the client panel
      // renders normally instead of showing a load error.
      const lastLoopRun = await lastLoopRunPromise;
      return NextResponse.json({ run: null, lastLoopRun, workflowMissing: true });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error desconocido" },
      { status: 502 },
    );
  }
}

export async function POST(req: Request) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  const token = readToken();
  if (!token) {
    return NextResponse.json(
      {
        error:
          "Falta INTEGRATIONS_GH_TOKEN (o OPS_GITHUB_TOKEN) en el servidor. Ese token necesita scope Actions: Read+Write sobre jmggaravito-sudo/terminal-sync — ver la nota del PR.",
      },
      { status: 500 },
    );
  }

  try {
    const res = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/${WORKFLOW}/dispatches`,
      {
        method: "POST",
        headers: {
          ...baseHeaders(token),
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ref: DISPATCH_REF }),
      },
    );

    // GitHub answers 204 with no body on a successful dispatch.
    if (res.status === 204) {
      return NextResponse.json({ ok: true });
    }

    const text = await res.text().catch(() => "");
    return NextResponse.json(
      { error: `GitHub ${res.status}${text ? `: ${text.slice(0, 500)}` : ""}` },
      { status: 502 },
    );
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error desconocido" },
      { status: 500 },
    );
  }
}
