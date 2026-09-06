import { NextResponse } from "next/server";
import { authenticate, isAdmin } from "@/lib/marketplace/auth";
import {
  buildCandidateFile,
  isValidSlug,
  SKILL_CATEGORIES,
  CONNECTOR_CATEGORIES,
  PLUGIN_CATEGORIES,
  KIT_CATEGORIES,
  CLI_TOOL_CATEGORIES,
  type CandidateInput,
  type SkillCandidateInput,
  type ConnectorCandidateInput,
  type PluginCandidateInput,
  type KitCandidateInput,
  type CliToolCandidateInput,
  type KitCandidateItemInput,
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
 * Scope: content candidates for the five catalog pillars JM wants managed
 * from this panel: skills, connectors, plugins, kits, and CLI tools. A
 * first-party "MCP con binario propio" candidate is still OUT — that would be
 * Rust code in terminal-sync (cross-repo, needs build:lab), not a markdown PR
 * here.
 *
 * No automatic publication: the candidate lands as a normal reviewable draft
 * PR with hidden/catalogReady/status defaults that keep it out of the public
 * catalog until a reviewer adds EN parity, assets/evals, and intentionally
 * clears the publication gate.
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
    throw new Error(
      `GitHub ${res.status}${text ? `: ${text.slice(0, 500)}` : ""}`,
    );
  }
  return text ? (JSON.parse(text) as T) : ({} as T);
}

function stringsArray(value: unknown): string[] {
  if (Array.isArray(value))
    return value.map((v) => String(v).trim()).filter(Boolean);
  if (typeof value === "string")
    return value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  return [];
}

function parseKitItems(value: unknown): KitCandidateItemInput[] {
  if (Array.isArray(value)) {
    return value
      .map((raw) => {
        if (!raw || typeof raw !== "object") return null;
        const row = raw as Record<string, unknown>;
        const kind = row.kind;
        const slug = typeof row.slug === "string" ? row.slug.trim() : "";
        const reason = typeof row.reason === "string" ? row.reason.trim() : "";
        if (
          (kind !== "connector" && kind !== "skill" && kind !== "cli-tool") ||
          !slug ||
          !reason
        )
          return null;
        return { kind, slug, reason };
      })
      .filter((item): item is KitCandidateItemInput => Boolean(item));
  }
  if (typeof value !== "string") return [];
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [kindRaw, slugRaw, ...reasonParts] = line.split("|");
      const kind = kindRaw?.trim();
      const slug = slugRaw?.trim();
      const reason = reasonParts.join("|").trim();
      if (
        (kind !== "connector" && kind !== "skill" && kind !== "cli-tool") ||
        !slug ||
        !reason
      )
        return null;
      return { kind, slug, reason };
    })
    .filter((item): item is KitCandidateItemInput => Boolean(item));
}

function validate(
  body: unknown,
): { ok: true; input: CandidateInput } | { ok: false; error: string } {
  if (!body || typeof body !== "object")
    return { ok: false, error: "Body vacío o inválido." };
  const b = body as Record<string, unknown>;

  const type = b.type;
  if (
    !["skill", "connector", "plugin", "kit", "cli-tool"].includes(String(type))
  ) {
    return {
      ok: false,
      error:
        'Falta "type": debe ser "skill", "connector", "plugin", "kit" o "cli-tool".',
    };
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
    if (
      !SKILL_CATEGORIES.includes(category as (typeof SKILL_CATEGORIES)[number])
    ) {
      return {
        ok: false,
        error: `"category" inválida para skill. Opciones: ${SKILL_CATEGORIES.join(", ")}.`,
      };
    }
    const description =
      typeof b.description === "string" ? b.description.trim() : "";
    const whenToUse = typeof b.whenToUse === "string" ? b.whenToUse.trim() : "";
    const whatItDoes =
      typeof b.whatItDoes === "string" ? b.whatItDoes.trim() : "";
    const howToUse = typeof b.howToUse === "string" ? b.howToUse.trim() : "";
    if (!description) return { ok: false, error: 'Falta "description".' };
    if (!whenToUse)
      return {
        ok: false,
        error: 'Falta "whenToUse" (sección "Cuándo usarlo").',
      };
    if (!whatItDoes)
      return { ok: false, error: 'Falta "whatItDoes" (sección "Qué hace").' };
    if (!howToUse)
      return { ok: false, error: 'Falta "howToUse" (sección "Cómo usarlo").' };
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

  if (type === "plugin") {
    if (
      !PLUGIN_CATEGORIES.includes(
        category as (typeof PLUGIN_CATEGORIES)[number],
      )
    ) {
      return {
        ok: false,
        error: `"category" inválida para plugin. Opciones: ${PLUGIN_CATEGORIES.join(", ")}.`,
      };
    }
    const description =
      typeof b.description === "string" ? b.description.trim() : "";
    const whenToUse = typeof b.whenToUse === "string" ? b.whenToUse.trim() : "";
    const whatItDoes =
      typeof b.whatItDoes === "string" ? b.whatItDoes.trim() : "";
    const howToUse = typeof b.howToUse === "string" ? b.howToUse.trim() : "";
    const connectorSlug =
      typeof b.connectorSlug === "string" ? b.connectorSlug.trim() : "";
    const skillSlugs = stringsArray(b.skillSlugs);
    if (!description) return { ok: false, error: 'Falta "description".' };
    if (!connectorSlug && skillSlugs.length === 0)
      return {
        ok: false,
        error: "Un plugin necesita connectorSlug o al menos un skillSlug.",
      };
    if (!whenToUse || !whatItDoes || !howToUse)
      return {
        ok: false,
        error: "Completá cuándo usarlo, qué hace y cómo usarlo.",
      };
    const input: PluginCandidateInput = {
      type: "plugin",
      slug,
      name,
      category: category as PluginCandidateInput["category"],
      tagline,
      description,
      connectorSlug: connectorSlug || undefined,
      skillSlugs,
      whenToUse,
      whatItDoes,
      howToUse,
      author: typeof b.author === "string" ? b.author : undefined,
      status: b.status === "soon" ? "soon" : "available",
      license: typeof b.license === "string" ? b.license : undefined,
    };
    return { ok: true, input };
  }

  if (type === "kit") {
    if (!KIT_CATEGORIES.includes(category as (typeof KIT_CATEGORIES)[number])) {
      return {
        ok: false,
        error: `"category" inválida para kit. Opciones: ${KIT_CATEGORIES.join(", ")}.`,
      };
    }
    const description =
      typeof b.description === "string" ? b.description.trim() : "";
    const audience = typeof b.audience === "string" ? b.audience.trim() : "";
    const whatItDoes =
      typeof b.whatItDoes === "string" ? b.whatItDoes.trim() : "";
    const howToUse = typeof b.howToUse === "string" ? b.howToUse.trim() : "";
    const limits = typeof b.limits === "string" ? b.limits.trim() : "";
    const items = parseKitItems(b.items ?? b.itemsRaw);
    if (!description || !audience || !whatItDoes || !howToUse || !limits)
      return {
        ok: false,
        error:
          "Completá descripción, audiencia, qué hace, cómo usarlo y límites.",
      };
    if (items.length === 0)
      return {
        ok: false,
        error: 'Agregá items del kit como líneas "connector|github|Razón".',
      };
    const input: KitCandidateInput = {
      type: "kit",
      slug,
      name,
      category: category as KitCandidateInput["category"],
      tagline,
      description,
      items,
      audience,
      whatItDoes,
      howToUse,
      limits,
      status: "soon",
      license: typeof b.license === "string" ? b.license : undefined,
    };
    return { ok: true, input };
  }

  if (type === "cli-tool") {
    if (
      !CLI_TOOL_CATEGORIES.includes(
        category as (typeof CLI_TOOL_CATEGORIES)[number],
      )
    ) {
      return {
        ok: false,
        error: `"category" inválida para herramienta CLI. Opciones: ${CLI_TOOL_CATEGORIES.join(", ")}.`,
      };
    }
    const description =
      typeof b.description === "string" ? b.description.trim() : "";
    const binary = typeof b.binary === "string" ? b.binary.trim() : "";
    const installCommand =
      typeof b.installCommand === "string" ? b.installCommand.trim() : "";
    const vendor = typeof b.vendor === "string" ? b.vendor.trim() : "";
    const homepage = typeof b.homepage === "string" ? b.homepage.trim() : "";
    const whatItDoes =
      typeof b.whatItDoes === "string" ? b.whatItDoes.trim() : "";
    const terminalSyncAdds =
      typeof b.terminalSyncAdds === "string" ? b.terminalSyncAdds.trim() : "";
    const commonCommands =
      typeof b.commonCommands === "string" ? b.commonCommands.trim() : "";
    if (
      !description ||
      !binary ||
      !installCommand ||
      !vendor ||
      !homepage ||
      !whatItDoes ||
      !terminalSyncAdds ||
      !commonCommands
    ) {
      return {
        ok: false,
        error:
          "Completá descripción, binary, installCommand, vendor, homepage y secciones CLI.",
      };
    }
    try {
      new URL(homepage);
    } catch {
      return { ok: false, error: '"homepage" no es una URL válida.' };
    }
    const repo = typeof b.repo === "string" ? b.repo.trim() : "";
    if (repo) {
      try {
        new URL(repo);
      } catch {
        return { ok: false, error: '"repo" no es una URL válida.' };
      }
    }
    const input: CliToolCandidateInput = {
      type: "cli-tool",
      slug,
      name,
      category: category as CliToolCandidateInput["category"],
      tagline,
      description,
      binary,
      installCommand,
      authCommand:
        typeof b.authCommand === "string" ? b.authCommand : undefined,
      vendor,
      homepage,
      repo: repo || undefined,
      whatItDoes,
      terminalSyncAdds,
      commonCommands,
      status: "soon",
      license: typeof b.license === "string" ? b.license : undefined,
    };
    return { ok: true, input };
  }

  // connector
  if (
    !CONNECTOR_CATEGORIES.includes(
      category as (typeof CONNECTOR_CATEGORIES)[number],
    )
  ) {
    return {
      ok: false,
      error: `"category" inválida para connector. Opciones: ${CONNECTOR_CATEGORIES.join(", ")}.`,
    };
  }
  const simpleSubtitle =
    typeof b.simpleSubtitle === "string" ? b.simpleSubtitle.trim() : "";
  const simpleBody =
    typeof b.simpleBody === "string" ? b.simpleBody.trim() : "";
  const ctaUrl = typeof b.ctaUrl === "string" ? b.ctaUrl.trim() : "";
  if (!simpleSubtitle) return { ok: false, error: 'Falta "simpleSubtitle".' };
  if (!simpleBody)
    return {
      ok: false,
      error: 'Falta "simpleBody" (descripción para el negocio).',
    };
  if (!ctaUrl) return { ok: false, error: 'Falta "ctaUrl".' };
  try {
    new URL(ctaUrl);
  } catch {
    return { ok: false, error: '"ctaUrl" no es una URL válida.' };
  }
  const affiliate = b.affiliate === true;
  if (!affiliate) {
    const npmPackage =
      typeof b.npmPackage === "string" ? b.npmPackage.trim() : "";
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
    tokenHelpUrl:
      typeof b.tokenHelpUrl === "string" ? b.tokenHelpUrl : undefined,
    originalAuthor:
      typeof b.originalAuthor === "string" ? b.originalAuthor : undefined,
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
    return NextResponse.json(
      { error: "Body no es JSON válido." },
      { status: 400 },
    );
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
    const createRefRes = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/git/refs`,
      {
        method: "POST",
        headers: { ...ghHeaders(token), "Content-Type": "application/json" },
        body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: baseSha }),
      },
    );
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
    const prRes = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/pulls`,
      {
        method: "POST",
        headers: { ...ghHeaders(token), "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          head: branch,
          base: BASE_BRANCH,
          body: prBody,
          draft: true,
        }),
      },
    );
    const pr = await ghJson<{ html_url: string; number: number }>(prRes);

    return NextResponse.json({
      ok: true,
      pr_url: pr.html_url,
      pr_number: pr.number,
      branch,
      path: file.path,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error desconocido" },
      { status: 502 },
    );
  }
}

function buildPrBody(input: CandidateInput, path: string): string {
  const contentDir =
    input.type === "cli-tool"
      ? "cli-tools"
      : input.type === "kit"
        ? "kits"
        : `${input.type}s`;
  const hiddenField =
    input.type === "skill"
      ? "catalogReady: false"
      : input.type === "kit"
        ? "status: soon"
        : "hidden: true / catalogReady: false";
  const parityNote = `- **Paridad ES/EN:** este candidato solo trae \`${path}\` (es). Sumá \`content/${contentDir}/en/${input.slug}.md\` antes de publicarlo.
- **No publica solo:** queda con \`${hiddenField}\` para que no aparezca en el catálogo hasta revisión.
- **Assets:** revisá/agregá el logo referenciado si aplica antes de aprobar.`;

  return [
    `Candidato de **${input.type}** creado desde el panel admin **Integraciones → Agregar candidato** (\`/admin/integraciones\`, Panel B).`,
    "",
    `Este PR es un **dato**, no código: agrega un único \`.md\` (\`${path}\`) con el frontmatter + cuerpo que espera el loader real.`,
    "",
    "## Qué NO hace este flujo",
    "",
    "- **No publica directo en el catálogo/app.** Queda como PR draft con defaults ocultos hasta revisión.",
    "- **No corre la supervisión automática** contra el preview de Vercel de este PR; eso se corre desde el panel de loops o desde CI al preparar la publicación.",
    "- **No crea binarios ni código Rust** en `terminal-sync`; esto agrega contenido de catálogo en `terminalsync-web`.",
    "",
    "## Notas de esta forma de frontmatter",
    "",
    parityNote,
    "",
    "## Token requerido (`INTEGRATIONS_GH_TOKEN`)",
    "",
    "El token del servidor necesita Contents: Read and write y Pull requests: Read and write sobre `jmggaravito-sudo/terminalsync-web` para abrir este PR draft.",
    "",
    "---",
    "_Generado automáticamente por `/api/admin/integraciones/candidate`._",
  ].join("\n");
}
