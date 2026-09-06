import { NextResponse } from "next/server";
import { authenticate, isAdmin } from "@/lib/marketplace/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WEB_REPO = "terminalsync-web";
const APP_REPO = "terminal-sync";
const OWNER = "jmggaravito-sudo";
const DEFAULT_LOOP_ID = "app-connector-parity";

interface GithubToken {
  value: string;
  source: "INTEGRATIONS_GH_TOKEN" | "OPS_GITHUB_TOKEN";
}

interface LoopConfig {
  id: string;
  kind: string;
  title: { es: string; en: string };
  description: { es: string; en: string };
  repo: string;
  workflow: string | null;
  ref: string;
  acceptsFocus?: boolean;
  acceptsDryRun?: boolean;
  disabledReason?: { es: string; en: string };
}

const LOOP_CONFIGS: LoopConfig[] = [
  {
    id: "app-connector-parity",
    kind: "supervision",
    title: {
      es: "Supervisión app: Conectores 4 IAs",
      en: "App supervision: 4-AI connectors",
    },
    description: {
      es: "Corre connector-loop.yml en terminal-sync y verifica paridad Claude/Codex/Gemini/GLM dentro de la app.",
      en: "Runs connector-loop.yml in terminal-sync and verifies Claude/Codex/Gemini/GLM parity in the app.",
    },
    repo: APP_REPO,
    workflow: "connector-loop.yml",
    ref: "release/v0.2.18-lab",
  },
  {
    id: "marketplace-supervision",
    kind: "supervision",
    title: {
      es: "Supervisión marketplace → app",
      en: "Marketplace → app supervision",
    },
    description: {
      es: "Corre integration-supervision-loop.yml: catálogo servido, paridad EN/ES y consumo desde la app.",
      en: "Runs integration-supervision-loop.yml: served catalog, EN/ES parity and app consumption.",
    },
    repo: WEB_REPO,
    workflow: "integration-supervision-loop.yml",
    ref: "main",
  },
  {
    id: "connectors-curation",
    kind: "connectors",
    title: { es: "Curación de Conectores", en: "Connector curation" },
    description: {
      es: "Busca candidatos de Conectores, crea PR draft y registra el resultado en loop_runs.",
      en: "Finds connector candidates, opens a draft PR and records the result in loop_runs.",
    },
    repo: WEB_REPO,
    workflow: "connector-curation-loop.yml",
    ref: "main",
    acceptsFocus: true,
    acceptsDryRun: true,
  },
  {
    id: "plugins-curation",
    kind: "plugins",
    title: { es: "Curación de Plugins", en: "Plugin curation" },
    description: {
      es: "Arma Plugins como paquete Conector + Skill(s), crea PR draft y deja evidencia.",
      en: "Builds plugins as connector + skill(s) packages, opens a draft PR and leaves evidence.",
    },
    repo: WEB_REPO,
    workflow: "plugin-curation-loop.yml",
    ref: "main",
    acceptsFocus: true,
    acceptsDryRun: true,
  },
  {
    id: "skills-curation",
    kind: "skills",
    title: { es: "Curación de Skills", en: "Skill curation" },
    description: {
      es: "Moldea/evalúa Skills, crea PR draft y registra slugs publicados o diferidos.",
      en: "Shapes/evaluates skills, opens a draft PR and records shipped or deferred slugs.",
    },
    repo: WEB_REPO,
    workflow: "skill-curation-loop.yml",
    ref: "main",
    acceptsFocus: true,
    acceptsDryRun: true,
  },
  {
    id: "kits-curation",
    kind: "kits",
    title: { es: "Curación de Kits", en: "Kit curation" },
    description: {
      es: "Crea Kits que combinan Conectores, Skills y Herramientas CLI para un flujo real de negocio.",
      en: "Creates kits that combine connectors, skills and CLI tools for a real business workflow.",
    },
    repo: WEB_REPO,
    workflow: "kit-curation-loop.yml",
    ref: "main",
    acceptsFocus: true,
    acceptsDryRun: true,
  },
  {
    id: "cli-curation",
    kind: "cli-tools",
    title: { es: "Curación de Herramientas CLI", en: "CLI tools curation" },
    description: {
      es: "Pendiente: todavía no hay workflow activo cli-curation-loop.yml; sí se pueden agregar candidatos de Herramientas CLI por formulario.",
      en: "Pending: there is no active cli-curation-loop.yml workflow yet; CLI candidates can still be added through the form.",
    },
    repo: WEB_REPO,
    workflow: null,
    ref: "main",
    disabledReason: {
      es: "No existe un workflow activo de curación CLI. El cron viejo promote-cli está deshabilitado.",
      en: "No active CLI curation workflow exists. The old promote-cli cron is disabled.",
    },
  },
];

async function requireAdmin(req: Request) {
  const user = await authenticate(req);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(user))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return null;
}

function readToken(): GithubToken | null {
  const integrationsToken = process.env.INTEGRATIONS_GH_TOKEN?.trim();
  if (integrationsToken)
    return { value: integrationsToken, source: "INTEGRATIONS_GH_TOKEN" };
  const opsToken = process.env.OPS_GITHUB_TOKEN?.trim();
  if (opsToken) return { value: opsToken, source: "OPS_GITHUB_TOKEN" };
  return null;
}

function baseHeaders(token: GithubToken | string): Record<string, string> {
  const value = typeof token === "string" ? token : token.value;
  return {
    Authorization: `Bearer ${value}`,
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

interface WorkflowUnavailableDetails {
  code: "github_workflow_unavailable";
  message: string;
  tokenSource: GithubToken["source"];
  workflow: string;
  repo: string;
  ref: string;
}

class WorkflowUnavailableError extends Error {
  details: WorkflowUnavailableDetails;

  constructor(loop: LoopConfig, token: GithubToken, causeText?: string) {
    const repo = `${OWNER}/${loop.repo}`;
    const workflow = loop.workflow ?? "(sin workflow)";
    const message =
      `GitHub no deja ver/despachar ${workflow} en ${repo}. ` +
      `En producción se está usando ${token.source}; para correr este loop ` +
      `ese token debe tener permiso Actions: Read and write sobre ${repo} ` +
      `y el workflow debe existir en ${loop.ref}.`;
    super(causeText ? `${message} (${causeText.slice(0, 240)})` : message);
    this.details = {
      code: "github_workflow_unavailable",
      message,
      tokenSource: token.source,
      workflow,
      repo,
      ref: loop.ref,
    };
  }
}

interface GithubWorkflowMetadata {
  id: number;
  name: string;
  path: string;
  state: string;
}

async function fetchWorkflowMetadata(
  loop: LoopConfig,
  token: GithubToken,
): Promise<GithubWorkflowMetadata> {
  if (!loop.workflow)
    throw new WorkflowUnavailableError(loop, token, "workflow_not_configured");
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${loop.repo}/actions/workflows/${loop.workflow}`,
    {
      headers: { ...baseHeaders(token), Accept: "application/vnd.github+json" },
      cache: "no-store",
    },
  );
  if (res.ok) return (await res.json()) as GithubWorkflowMetadata;
  const text = await res.text().catch(() => "");
  if (res.status === 404) throw new WorkflowUnavailableError(loop, token, text);
  throw new Error(
    `GitHub ${res.status}${text ? `: ${text.slice(0, 300)}` : ""}`,
  );
}

async function fetchLatestRun(
  loop: LoopConfig,
  token: GithubToken,
): Promise<IntegracionesRunStatus | null> {
  if (!loop.workflow) return null;
  const workflow = await fetchWorkflowMetadata(loop, token);
  const params = new URLSearchParams({ per_page: "1", branch: loop.ref });
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${loop.repo}/actions/workflows/${workflow.id}/runs?${params}`,
    {
      headers: { ...baseHeaders(token), Accept: "application/vnd.github+json" },
      cache: "no-store",
    },
  );
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    if (res.status === 404)
      throw new WorkflowUnavailableError(loop, token, text);
    throw new Error(
      `GitHub ${res.status}${text ? `: ${text.slice(0, 300)}` : ""}`,
    );
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

async function fetchLatestLoopRun(kind?: string): Promise<LastLoopRun | null> {
  const sb = getSupabaseAdmin();
  if (!sb) return null;
  try {
    let query = sb
      .from("loop_runs")
      .select("id, ran_at, kind, pr_url")
      .order("ran_at", { ascending: false })
      .limit(1);
    if (kind && kind !== "supervision") query = query.eq("kind", kind);
    const { data, error } = await query;
    if (error || !data || data.length === 0) return null;
    return data[0] as LastLoopRun;
  } catch {
    return null;
  }
}

interface LoopStatus extends LoopConfig {
  run: IntegracionesRunStatus | null;
  lastLoopRun: LastLoopRun | null;
  workflowMissing?: boolean;
  setupError?: WorkflowUnavailableDetails;
}

async function buildLoopStatus(
  loop: LoopConfig,
  token: GithubToken,
): Promise<LoopStatus> {
  const lastLoopRunPromise = fetchLatestLoopRun(loop.kind);
  try {
    const run = await fetchLatestRun(loop, token);
    const lastLoopRun = await lastLoopRunPromise;
    return { ...loop, run, lastLoopRun };
  } catch (err) {
    const lastLoopRun = await lastLoopRunPromise;
    if (err instanceof WorkflowUnavailableError) {
      return {
        ...loop,
        run: null,
        lastLoopRun,
        workflowMissing: true,
        setupError: err.details,
      };
    }
    throw err;
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

  try {
    const loops = await Promise.all(
      LOOP_CONFIGS.map((loop) => buildLoopStatus(loop, token)),
    );
    const primary =
      loops.find((loop) => loop.id === DEFAULT_LOOP_ID) ?? loops[0];
    return NextResponse.json({
      loops,
      run: primary.run,
      lastLoopRun: primary.lastLoopRun,
      workflowMissing: primary.workflowMissing,
      setupError: primary.setupError,
    });
  } catch (err) {
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
          "Falta INTEGRATIONS_GH_TOKEN (o OPS_GITHUB_TOKEN) en el servidor. Ese token necesita scope Actions: Read+Write sobre los repos de los loops.",
      },
      { status: 500 },
    );
  }

  let body: unknown = null;
  try {
    body = await req.json();
  } catch {
    body = null;
  }
  const raw =
    body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const loopId = typeof raw.loopId === "string" ? raw.loopId : DEFAULT_LOOP_ID;
  const loop = LOOP_CONFIGS.find((candidate) => candidate.id === loopId);
  if (!loop)
    return NextResponse.json(
      { error: `Loop desconocido: ${loopId}` },
      { status: 400 },
    );
  if (!loop.workflow || loop.disabledReason) {
    return NextResponse.json(
      { error: loop.disabledReason?.es ?? "Loop no configurado.", loop },
      { status: 409 },
    );
  }

  try {
    const workflow = await fetchWorkflowMetadata(loop, token);
    const inputs: Record<string, string | boolean> = {};
    if (loop.acceptsFocus && typeof raw.focus === "string" && raw.focus.trim())
      inputs.focus = raw.focus.trim();
    if (loop.acceptsDryRun) inputs.dry_run = raw.dryRun === true;

    const res = await fetch(
      `https://api.github.com/repos/${OWNER}/${loop.repo}/actions/workflows/${workflow.id}/dispatches`,
      {
        method: "POST",
        headers: {
          ...baseHeaders(token),
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ref: loop.ref,
          ...(Object.keys(inputs).length ? { inputs } : {}),
        }),
      },
    );

    if (res.ok) {
      const text = await res.text().catch(() => "");
      let payload: unknown = null;
      if (text) {
        try {
          payload = JSON.parse(text);
        } catch {
          payload = null;
        }
      }
      return NextResponse.json({
        ok: true,
        loopId: loop.id,
        workflowId: workflow.id,
        dispatch: payload,
      });
    }

    const text = await res.text().catch(() => "");
    if (res.status === 404)
      throw new WorkflowUnavailableError(loop, token, text);
    return NextResponse.json(
      { error: `GitHub ${res.status}${text ? `: ${text.slice(0, 500)}` : ""}` },
      { status: 502 },
    );
  } catch (err) {
    if (err instanceof WorkflowUnavailableError) {
      return NextResponse.json(
        { error: err.details.message, setupError: err.details },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error desconocido" },
      { status: 500 },
    );
  }
}
