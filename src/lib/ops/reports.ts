/**
 * Ops reports loader (server-only).
 *
 * The four analytics pipelines run as GitHub Actions crons in the
 * `terminal-sync` repo and commit an AGGREGATE-ONLY markdown snapshot to the
 * `ops/metrics` branch (docs/*.md — never PII). This loader fetches those
 * snapshots + each pipeline's latest run status via the GitHub API so the
 * `/admin/ops/reports` page can render "what's happening" without anyone
 * opening GitHub.
 *
 * Auth: a fine-grained GitHub token in `OPS_GITHUB_TOKEN` with read access to
 * `terminal-sync` (Contents: Read + Actions: Read). When the env var is unset,
 * every call returns `configured: false` and the page shows a setup notice —
 * it never throws, so the ops section keeps rendering.
 */

const OWNER = "jmggaravito-sudo";
const REPO = "terminal-sync";
const BRANCH = "ops/metrics";

export interface OpsReportDef {
  slug: string;
  emoji: string;
  titleEs: string;
  titleEn: string;
  blurbEs: string;
  blurbEn: string;
  doc: string;
  workflow: string;
}

export const REPORT_DEFS: OpsReportDef[] = [
  {
    slug: "discovery-metrics",
    emoji: "🔎",
    titleEs: "Discovery — recolección de creators",
    titleEn: "Discovery — creator harvest",
    blurbEs: "Cuántos creators se cosecharon, por nicho/idioma/plataforma. Detecta si la captura se cayó.",
    blurbEn: "How many creators were harvested, by niche/language/platform. Flags a stalled capture.",
    doc: "docs/discovery-metrics.md",
    workflow: "discovery-metrics.yml",
  },
  {
    slug: "support-gaps",
    emoji: "❓",
    titleEs: "Soporte — lo que el bot no supo",
    titleEn: "Support — bot knowledge gaps",
    blurbEs: "Los temas que dispararon “no sé” en el bot, para sumarlos a su base de conocimiento.",
    blurbEn: "Topics that triggered “I don't know” in the bot, to fold into its knowledge base.",
    doc: "docs/support-gaps.md",
    workflow: "support-gaps.yml",
  },
  {
    slug: "support-analytics",
    emoji: "📈",
    titleEs: "Soporte — deflection y escalation",
    titleEn: "Support — deflection & escalation",
    blurbEs: "Cuánto resuelve la FAQ sola vs. el LLM, tasa de escalamiento y gaps de conocimiento.",
    blurbEn: "How much the FAQ resolves alone vs. the LLM, escalation rate and knowledge gaps.",
    doc: "docs/support-analytics.md",
    workflow: "support-analytics.yml",
  },
  {
    slug: "ai-selection",
    emoji: "🤖",
    titleEs: "IA — con qué llega el cliente",
    titleEn: "AI — what the client arrives with",
    blurbEs: "Qué “sistema” de IA usa el cliente al abrir una card: la suya (BYOK), la de cortesía, o ninguna.",
    blurbEn: "Which AI “system” the client uses when opening a card: their own (BYOK), courtesy, or none.",
    doc: "docs/ai-selection-analytics.md",
    workflow: "ai-selection-analytics.yml",
  },
];

export interface OpsReportRun {
  status: string;
  conclusion: string | null;
  url: string;
  createdAt: string;
  runNumber: number;
}

export interface OpsReport {
  slug: string;
  emoji: string;
  title: string;
  blurb: string;
  markdown: string | null;
  error: string | null;
  run: OpsReportRun | null;
}

export interface OpsReportsResult {
  configured: boolean;
  reports: OpsReport[];
}

function readToken(): string | null {
  const t = process.env.OPS_GITHUB_TOKEN;
  return t && t.trim() ? t.trim() : null;
}

function baseHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "terminalsync-web-ops",
  };
}

async function fetchDoc(
  token: string,
  doc: string,
): Promise<{ markdown: string | null; error: string | null }> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${doc}?ref=${encodeURIComponent(BRANCH)}`,
      {
        headers: { ...baseHeaders(token), Accept: "application/vnd.github.raw" },
        cache: "no-store",
      },
    );
    if (res.status === 404) return { markdown: null, error: "aún no generado" };
    if (!res.ok) return { markdown: null, error: `GitHub ${res.status}` };
    return { markdown: await res.text(), error: null };
  } catch (e) {
    return { markdown: null, error: e instanceof Error ? e.message : "error de red" };
  }
}

interface GhRun {
  status: string;
  conclusion: string | null;
  html_url: string;
  created_at: string;
  run_number: number;
}
interface GhRunsResponse {
  workflow_runs?: GhRun[];
}

async function fetchLatestRun(
  token: string,
  workflow: string,
): Promise<OpsReportRun | null> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/${workflow}/runs?per_page=1`,
      {
        headers: { ...baseHeaders(token), Accept: "application/vnd.github+json" },
        cache: "no-store",
      },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as GhRunsResponse;
    const run = json.workflow_runs?.[0];
    if (!run) return null;
    return {
      status: run.status,
      conclusion: run.conclusion,
      url: run.html_url,
      createdAt: run.created_at,
      runNumber: run.run_number,
    };
  } catch {
    return null;
  }
}

/** Fetch all four report snapshots + their latest run, in parallel. Never
 *  throws — a per-report failure lands in that report's `error`/`run:null`. */
export async function fetchOpsReports(lang: string): Promise<OpsReportsResult> {
  const token = readToken();
  if (!token) return { configured: false, reports: [] };
  const isEs = lang === "es";
  const reports = await Promise.all(
    REPORT_DEFS.map(async (def): Promise<OpsReport> => {
      const [doc, run] = await Promise.all([
        fetchDoc(token, def.doc),
        fetchLatestRun(token, def.workflow),
      ]);
      return {
        slug: def.slug,
        emoji: def.emoji,
        title: isEs ? def.titleEs : def.titleEn,
        blurb: isEs ? def.blurbEs : def.blurbEn,
        markdown: doc.markdown,
        error: doc.error,
        run,
      };
    }),
  );
  return { configured: true, reports };
}
