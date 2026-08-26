import { NextResponse } from "next/server";
import { authenticate, isAdmin } from "@/lib/marketplace/auth";
import {
  buildCandidateFile,
  isValidSlug,
  SKILL_CATEGORIES,
  CONNECTOR_CATEGORIES,
  type CandidateInput,
  type SkillCandidateInput,
  type ConnectorCandidateInput,
} from "@/lib/marketplace/candidateContent";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Panel B of /admin/integraciones — "Agregar candidato".
 *
 * POST body: a `CandidateInput` (see src/lib/marketplace/candidateContent.ts
 * for the exact shape per type). This route:
 *   1. Validates the input (type, slug, required fields per type).
 *   2. Builds the target markdown file (frontmatter + body) in the shape
 *      the real content loaders (src/lib/skills.ts / src/lib/connectors.ts)
 *      expect — verified against real .md files, not assumed.
 *   3. Opens a **draft PR in THIS repo** (jmggaravito-sudo/terminalsync-web)
 *      adding that one file on a new `candidate/<type>-<slug>` branch off
 *      `main`.
 *
 * Scope (v1, per JM): only "skill" and "connector" candidates. A first-party
 * "MCP con binario propio" candidate is explicitly OUT — that would be Rust
 * code in terminal-sync (cross-repo, needs build:lab), not a markdown PR
 * here. Not implemented; if asked for, say so instead of faking it.
 *
 * No automatic gate: this route does not run the connector-parity /
 * skill-eval supervision against the PR's Vercel preview. The candidate
 * lands as a normal reviewable draft PR (with its own preview URL); wiring
 * the supervision loop to run against `MARKETPLACE_BASE=<preview-url>` is a
 * follow-up, not part of this endpoint.
 *
 * Auth: same Bearer access_token + ADMIN_EMAILS allowlist as every other
 * /api/admin route (see src/lib/marketplace/auth.ts and Panel A's
 * run/route.ts).
 *
 * Token: INTEGRATIONS_GH_TOKEN (same var Panel A uses for terminal-sync).
 * For THIS route it needs to be a fine-grained PAT with, on top of Panel
 * A's Actions:Read+Write on jmggaravito-sudo/terminal-sync, ALSO
 * Contents:Read+Write and Pull requests:Read+Write on
 * jmggaravito-sudo/terminalsync-web (this repo) — a single fine-grained
 * token can cover both repos at once. This route only documents the
 * requirement; it does not create or rotate the token.
 */

const OWNER = "jmggaravito-sudo";
const REPO = "terminalsync-web";
const BASE_BRANCH = "main";
const LANG = "es"; // v1: Spanish only — see candidateContent.ts doc comment.

async function requireAdmin(req: Request) {
  const user = await authenticate(req);
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

function readToken(): string | null {
  const t = process.env.INTEGRATIONS_GH_TOKEN;
  return t && t.trim() ? t.trim() : null;
}

function ghHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
    Accept: "application/vnd.github+json",
    "User-Agent": "terminalsync-web-integraciones-candidate",
  };
}

async function ghJson<T>(res: Response): Promise<T> {
  const text = await res.text().catch(() => "");
  if (!res.ok) {
    throw new Error(`GitHub ${res.status}${text ? `: ${text.slice(0, 500)}` : ""}`);
  }
  return text ? (JSON.parse(text) as T) : ({} as T);
}

function validate(body: unknown): { ok: true; input: CandidateInput } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Body vacío o inválido." };
  const b = body as Record<string, unknown>;

  const type = b.type;
  if (type !== "skill" && type !== "connector") {
    return { ok: false, error: 'Falta "type": debe ser "skill" o "connector".' };
  }

  const slug = typeof b.slug === "string" ? b.slug.trim().toLowerCase() : "";
  if (!isValidSlug(slug)) {
    return {
      ok: false,
      error:
        'Slug inválido. Usá kebab-case (minúsculas, números, guiones), 2-60 caracteres, ej: "mi-conector".',
    };
  }

  const name = typeof b.name === "string" ? b.name.trim() : "";
  const category = typeof b.category === "string" ? b.category : "";
  const tagline = typeof b.tagline === "string" ? b.tagline.trim() : "";
  if (!name) return { ok: false, error: 'Falta "name".' };
  if (!tagline) return { ok: false, error: 'Falta "tagline".' };

  if (type === "skill") {
    if (!SKILL_CATEGORIES.includes(category as (typeof SKILL_CATEGORIES)[number])) {
      return { ok: false, error: `"category" inválida para skill. Opciones: ${SKILL_CATEGORIES.join(", ")}.` };
    }
    const description = typeof b.description === "string" ? b.description.trim() : "";
    const whenToUse = typeof b.whenToUse === "string" ? b.whenToUse.trim() : "";
    const whatItDoes = typeof b.whatItDoes === "string" ? b.whatItDoes.trim() : "";
    const howToUse = typeof b.howToUse === "string" ? b.howToUse.trim() : "";
    if (!description) return { ok: false, error: 'Falta "description".' };
    if (!whenToUse) return { ok: false, error: 'Falta "whenToUse" (sección "Cuándo usarlo").' };
    if (!whatItDoes) return { ok: false, error: 'Falta "whatItDoes" (sección "Qué hace").' };
    if (!howToUse) return { ok: false, error: 'Falta "howToUse" (sección "Cómo usarlo").' };
    const status = b.status === "soon" ? "soon" : "available";

    const input: SkillCandidateInput = {
      type: "skill",
      slug,
      name,
      category: category as SkillCandidateInput["category"],
      tagline,
      description,
      whenToUse,
      whatItDoes,
      howToUse,
      author: typeof b.author === "string" ? b.author : undefined,
      status,
      license: typeof b.license === "string" ? b.license : undefined,
    };
    return { ok: true, input };
  }

  // connector
  if (!CONNECTOR_CATEGORIES.includes(category as (typeof CONNECTOR_CATEGORIES)[number])) {
    return { ok: false, error: `"category" inválida para connector. Opciones: ${CONNECTOR_CATEGORIES.join(", ")}.` };
  }
  const simpleSubtitle = typeof b.simpleSubtitle === "string" ? b.simpleSubtitle.trim() : "";
  const simpleBody = typeof b.simpleBody === "string" ? b.simpleBody.trim() : "";
  const ctaUrl = typeof b.ctaUrl === "string" ? b.ctaUrl.trim() : "";
  if (!simpleSubtitle) return { ok: false, error: 'Falta "simpleSubtitle".' };
  if (!simpleBody) return { ok: false, error: 'Falta "simpleBody" (descripción para el negocio).' };
  if (!ctaUrl) return { ok: false, error: 'Falta "ctaUrl".' };
  try {
    new URL(ctaUrl);
  } catch {
    return { ok: false, error: '"ctaUrl" no es una URL válida.' };
  }
  const affiliate = b.affiliate === true;
  if (!affiliate) {
    const npmPackage = typeof b.npmPackage === "string" ? b.npmPackage.trim() : "";
    if (!npmPackage) {
      return {
        ok: false,
        error:
          'Falta "npmPackage" (paquete npm a correr vía "npx -y <paquete>"). Si es afiliado-solo (sin instalar), marcá "affiliate".',
      };
    }
  }
  const status = b.status === "available" ? "available" : "soon";

  const input: ConnectorCandidateInput = {
    type: "connector",
    slug,
    name,
    category: category as ConnectorCandidateInput["category"],
    tagline,
    simpleSubtitle,
    simpleBody,
    devBody: typeof b.devBody === "string" ? b.devBody : undefined,
    ctaUrl,
    affiliate,
    status,
    npmPackage: typeof b.npmPackage === "string" ? b.npmPackage : undefined,
    envKeys: Array.isArray(b.envKeys)
      ? b.envKeys.filter((k): k is string => typeof k === "string")
      : undefined,
    tokenHelpUrl: typeof b.tokenHelpUrl === "string" ? b.tokenHelpUrl : undefined,
    originalAuthor: typeof b.originalAuthor === "string" ? b.originalAuthor : undefined,
    license: typeof b.license === "string" ? b.license : undefined,
  };
  return { ok: true, input };
}

export async function POST(req: Request) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  const token = readToken();
  if (!token) {
    return NextResponse.json(
      {
        error:
          "Falta INTEGRATIONS_GH_TOKEN en el servidor. Necesita Contents:Read+Write y Pull requests:Read+Write sobre jmggaravito-sudo/terminalsync-web — ver la nota del PR.",
      },
      { status: 500 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body no es JSON válido." }, { status: 400 });
  }

  const result = validate(body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  const input = result.input;

  const file = buildCandidateFile(input, LANG);
  const branch = `candidate/${input.type}-${input.slug}`;

  try {
    // 1. SHA of main.
    const refRes = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/git/ref/heads/${BASE_BRANCH}`,
      { headers: ghHeaders(token), cache: "no-store" },
    );
    const refJson = await ghJson<{ object: { sha: string } }>(refRes);
    const baseSha = refJson.object.sha;

    // 2. Create the candidate branch.
    const createRefRes = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/git/refs`, {
      method: "POST",
      headers: { ...ghHeaders(token), "Content-Type": "application/json" },
      body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: baseSha }),
    });
    if (createRefRes.status === 422) {
      // Branch already exists (a previous attempt for this same slug).
      const text = await createRefRes.text().catch(() => "");
      return NextResponse.json(
        {
          error: `Ya existe una rama "${branch}" (probablemente de un intento anterior para este slug). Elegí otro slug o borrá la rama en GitHub.${text ? ` (${text.slice(0, 200)})` : ""}`,
        },
        { status: 409 },
      );
    }
    await ghJson(createRefRes);

    // 3. Create the file on that branch.
    const putRes = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${file.path}`,
      {
        method: "PUT",
        headers: { ...ghHeaders(token), "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `feat(candidate): add ${input.type} candidate "${input.slug}"`,
          content: Buffer.from(file.content, "utf8").toString("base64"),
          branch,
        }),
      },
    );
    await ghJson(putRes);

    // 4. Open the draft PR.
    const title = `Candidato: ${input.type} ${input.slug}`;
    const prBody = buildPrBody(input, file.path);
    const prRes = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/pulls`, {
      method: "POST",
      headers: { ...ghHeaders(token), "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        head: branch,
        base: BASE_BRANCH,
        body: prBody,
        draft: true,
      }),
    });
    const pr = await ghJson<{ html_url: string; number: number }>(prRes);

    return NextResponse.json({ ok: true, pr_url: pr.html_url, pr_number: pr.number, branch, path: file.path });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error desconocido" },
      { status: 502 },
    );
  }
}

function buildPrBody(input: CandidateInput, path: string): string {
  const parityNote =
    input.type === "skill"
      ? `- **Paridad ES/EN:** este candidato solo trae \`${path}\` (es). El catálogo hoy exige paridad estricta es/en (ver \`content/skills/RULES.md\`) — antes de sacar \`catalogReady: false\`, sumá el \`.md\` en \`content/skills/en/${input.slug}.md\`.\n- **Gate de la 4 IAs:** \`vendors\`/\`compatibleWith\` ya vienen con \`["claude","codex","gemini"]\` por default (glm hereda de claude) para cumplir la decisión JM 2026-08-07. No los achiques sin evidencia de entrega+eval en cada proveedor.\n- **catalogReady: false a propósito:** \`src/lib/skills.test.ts\` tiene un allow-list exacto de slugs públicos ("keeps only the launch-ready skills..."). Este archivo queda invisible en el catálogo hasta que alguien lo revise y ponga \`catalogReady: true\` — en ese mismo PR de revisión hay que sumar \`"${input.slug}"\` a ese allow-list o el test se rompe en CI.`
      : `- **Paridad ES/EN:** este candidato solo trae \`${path}\` (es). El catálogo hoy mantiene paridad 1:1 es/en para connectors — sumá \`content/connectors/en/${input.slug}.md\` antes de sacar \`hidden: true\`.\n- **hidden: true a propósito:** así el connector no aparece en \`/connectors\` hasta que alguien lo revise (logo real, manifest correcto, categoría) y saque la línea \`hidden: true\`.\n- **Logo:** referencia \`/connectors/${input.slug}.svg\` — el asset todavía no existe en \`public/connectors/\`; agregalo como parte de la revisión.`;

  return [
    `Candidato de **${input.type === "skill" ? "skill" : "connector"}** creado desde el panel admin **Integraciones → Agregar candidato** (\`/admin/integraciones\`, Panel B).`,
    "",
    `Este PR es un **dato**, no código: agrega un único \`.md\` (\`${path}\`) con el frontmatter + cuerpo que espera el loader real (\`src/lib/skills.ts\` / \`src/lib/connectors.ts\`).`,
    "",
    "## Qué NO hace este flujo (alcance v1)",
    "",
    '- **No corre la supervisión automática** (paridad 4 IAs / evals) contra el preview de Vercel de este PR. Queda como un PR draft normal, revisable a mano, con su propio preview URL. Correr esa supervisión contra `MARKETPLACE_BASE=<preview-url>` de este PR es una mejora posterior, no algo que este endpoint implemente.',
    '- **No soporta candidatos de "MCP de primera parte con binario propio"** — eso es código Rust en `terminal-sync` (cross-repo, necesita `build:lab`), fuera del alcance de un PR de contenido en este repo. Si hace falta ese tipo de candidato, es un flujo aparte.',
    "",
    "## Notas de esta forma de frontmatter",
    "",
    parityNote,
    "",
    "## Token requerido (`INTEGRATIONS_GH_TOKEN`)",
    "",
    "El mismo token que usa el Panel A (\"Correr ahora\") para `jmggaravito-sudo/terminal-sync` necesita, ADEMÁS, estos scopes fine-grained sobre `jmggaravito-sudo/terminalsync-web` (este repo) para que este endpoint pueda abrir PRs de candidatos:",
    "",
    "- **Contents: Read and write** (crear rama + archivo).",
    "- **Pull requests: Read and write** (abrir el PR draft).",
    "",
    "Un solo Personal Access Token fine-grained puede cubrir ambos repos (`terminal-sync` para Panel A + `terminalsync-web` para Panel B) si se le dan los scopes de ambos al crearlo. Este PR solo documenta el requisito — no crea ni rota el token.",
    "",
    "---",
    "_Generado automáticamente por `/api/admin/integraciones/candidate`. La supervisión editorial es responsabilidad de quien revisa este PR antes de mergearlo._",
  ].join("\n");
}
