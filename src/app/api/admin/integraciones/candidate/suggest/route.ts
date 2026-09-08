import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { authenticate, isAdmin } from "@/lib/marketplace/auth";
import {
  buildSuggestPrompt,
  extractJsonObject,
  isCandidateType,
  normalizeSuggestion,
  resolveSuggestRuntime,
} from "@/lib/marketplace/candidateSuggest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Una investigación con búsqueda web encadena varias consultas antes de
// contestar. 300s es el mismo techo que ya usan las otras rutas de
// investigación del panel (leads-linkedin/search, cron/ops-error-review).
export const maxDuration = 300;

/**
 * Panel B de /admin/integraciones — botón "Investigar y pre-llenar con IA".
 *
 * POST body: `{ name: string, type: "connector" | "skill" | "plugin" | "kit"
 * | "cli-tool" }`. Devuelve `{ ok: true, suggestion, sources }`: la ficha
 * completa del candidato para pre-llenar el formulario, más las URLs que el
 * modelo consultó para armarla.
 *
 * **Esta ruta no escribe nada.** No abre PR, no toca GitHub, no publica. El
 * dueño revisa lo sugerido en el formulario y recién ahí aprieta "Crear
 * candidato (PR draft)", que es la ruta de al lado (`../candidate`) y sigue
 * siendo la única que valida en serio y escribe.
 *
 * Auth: mismo Bearer access_token + allowlist ADMIN_EMAILS que el resto de
 * /api/admin.
 *
 * ## Credenciales — leer antes de tocar esto
 *
 * El pedido original decía "usar ZAI_API_KEY, no ANTHROPIC_API_KEY, porque
 * el proyecto ya migró". La migración (commit 45033a6) fue de los **loops de
 * curación en GitHub Actions**, no del runtime de Next: el único otro código
 * de la app que llama a Anthropic
 * (`src/lib/linkedinLeads/messageGenerator.ts`) sigue leyendo
 * ANTHROPIC_API_KEY, y `ZAI_API_KEY` se valida en los workflows contra
 * `https://open.bigmodel.cn/api/paas/v4/models` — es una key de Z.ai/GLM,
 * no de Anthropic, aunque el comentario del workflow diga otra cosa.
 *
 * Así que la key elegida decide el endpoint (ver `resolveSuggestRuntime` en
 * `candidateSuggest.ts`, que es donde vive esa decisión y sus tests):
 *
 * - Con key de Z.ai (`ZAI_API_KEY` o `Z_AI_API_KEY` — el secret de GitHub se
 *   llama con guiones bajos y los workflows lo leen sin ellos, así que se
 *   aceptan los dos): endpoint `https://open.bigmodel.cn/api/anthropic` por
 *   defecto, `CANDIDATE_SUGGEST_MODEL` obligatoria (Z.ai sirve GLM, no
 *   Claude, y los ids cambian entre versiones), y búsqueda web apagada
 *   porque es una server tool de Anthropic que un gateway de GLM no tiene.
 * - Con `ANTHROPIC_API_KEY`: endpoint de Anthropic, modelo `claude-opus-5`,
 *   búsqueda web encendida.
 * - `CANDIDATE_SUGGEST_BASE_URL` y `CANDIDATE_SUGGEST_WEB_SEARCH` siguen
 *   existiendo para forzar cualquiera de las dos cosas.
 *
 * No se manda `temperature`: está removido en Claude Opus 5 y devuelve 400.
 * El determinismo del formato lo da el contrato de JSON del prompt más la
 * normalización de `candidateSuggest.ts`, que nunca confía en el modelo para
 * los enums.
 */

const MAX_TOOL_ROUNDS = 6;

interface ResolvedClient {
  client: Anthropic;
  model: string;
  webSearch: boolean;
}

/** La decisión de credencial/endpoint/modelo vive en `candidateSuggest.ts`
 *  (pura y con tests); acá solo se construye el cliente con lo que decidió. */
function resolveClient(): ResolvedClient | { error: string } {
  const runtime = resolveSuggestRuntime({
    ZAI_API_KEY: process.env.ZAI_API_KEY,
    Z_AI_API_KEY: process.env.Z_AI_API_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    CANDIDATE_SUGGEST_BASE_URL: process.env.CANDIDATE_SUGGEST_BASE_URL,
    CANDIDATE_SUGGEST_MODEL: process.env.CANDIDATE_SUGGEST_MODEL,
    CANDIDATE_SUGGEST_WEB_SEARCH: process.env.CANDIDATE_SUGGEST_WEB_SEARCH,
  });
  if (!runtime.ok) return { error: runtime.error };
  return {
    client: new Anthropic(
      runtime.baseURL
        ? { apiKey: runtime.apiKey, baseURL: runtime.baseURL }
        : { apiKey: runtime.apiKey },
    ),
    model: runtime.model,
    webSearch: runtime.webSearch,
  };
}

/** Junta el texto de todos los bloques `text` de la respuesta. Con búsqueda
 *  web hay varios: el modelo comenta lo que va encontrando y cierra con el
 *  JSON, así que quedarse solo con el primero pierde la ficha. */
function collectText(content: Anthropic.ContentBlock[]): string {
  return content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n");
}

/** URLs que la búsqueda web devolvió, para que el revisor pueda comprobar de
 *  dónde salió cada dato en vez de confiar. */
function collectSources(content: Anthropic.ContentBlock[]): string[] {
  const urls: string[] = [];
  for (const block of content) {
    if (block.type !== "web_search_tool_result") continue;
    // En error, `content` es un objeto `{ error_code }` en vez de una lista.
    const results = (block as { content?: unknown }).content;
    if (!Array.isArray(results)) continue;
    for (const result of results) {
      const url = (result as { url?: unknown }).url;
      if (typeof url === "string" && !urls.includes(url)) urls.push(url);
    }
  }
  return urls;
}

/** True cuando el endpoint rechazó la herramienta de búsqueda (un gateway
 *  compatible con Anthropic que no implementa server tools). Ese caso se
 *  reintenta sin herramientas en vez de fallar. */
function isToolRejection(err: unknown): boolean {
  if (!(err instanceof Anthropic.BadRequestError)) return false;
  return /web_search|tools?\b/i.test(err.message);
}

interface RunResult {
  text: string;
  sources: string[];
}

async function runResearch(
  resolved: ResolvedClient,
  system: string,
  user: string,
  useWebSearch: boolean,
): Promise<RunResult> {
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: user }];
  const allContent: Anthropic.ContentBlock[] = [];

  for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
    const response = await resolved.client.messages.create({
      model: resolved.model,
      max_tokens: 16000,
      system,
      messages,
      ...(useWebSearch
        ? {
            tools: [
              {
                type: "web_search_20260209" as const,
                name: "web_search" as const,
                max_uses: 8,
              },
            ],
          }
        : {}),
    });

    allContent.push(...response.content);

    if (response.stop_reason === "refusal") {
      throw new Error(
        "El modelo declinó investigar este nombre. Prueba con el nombre oficial del producto o carga la ficha a mano.",
      );
    }

    // `pause_turn` = la búsqueda web se pausó y hay que continuar el mismo
    // turno devolviéndole lo que lleva generado.
    if (response.stop_reason === "pause_turn") {
      messages.push({ role: "assistant", content: response.content });
      continue;
    }

    return { text: collectText(allContent), sources: collectSources(allContent) };
  }

  return { text: collectText(allContent), sources: collectSources(allContent) };
}

export async function POST(req: Request) {
  const user = await authenticate(req);
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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

  const b = (body ?? {}) as Record<string, unknown>;
  const name = typeof b.name === "string" ? b.name.trim() : "";
  if (!name) {
    return NextResponse.json(
      { error: 'Falta "name": escribe el nombre de la herramienta a investigar.' },
      { status: 400 },
    );
  }
  if (name.length > 120) {
    return NextResponse.json(
      { error: '"name" es demasiado largo: escribe solo el nombre, ej: "Dapta".' },
      { status: 400 },
    );
  }
  if (!isCandidateType(b.type)) {
    return NextResponse.json(
      {
        error:
          'Falta "type": debe ser "connector", "skill", "plugin", "kit" o "cli-tool".',
      },
      { status: 400 },
    );
  }
  const type = b.type;

  const resolved = resolveClient();
  if ("error" in resolved) {
    return NextResponse.json({ error: resolved.error }, { status: 500 });
  }

  const { system, user: userPrompt } = buildSuggestPrompt(type, name);

  let run: RunResult;
  try {
    run = await runResearch(resolved, system, userPrompt, resolved.webSearch);
  } catch (err) {
    if (resolved.webSearch && isToolRejection(err)) {
      try {
        run = await runResearch(resolved, system, userPrompt, false);
      } catch (retryErr) {
        return NextResponse.json(
          { error: describeError(retryErr) },
          { status: 502 },
        );
      }
    } else {
      return NextResponse.json({ error: describeError(err) }, { status: 502 });
    }
  }

  let suggestion;
  try {
    suggestion = normalizeSuggestion(type, extractJsonObject(run.text), name);
  } catch (err) {
    return NextResponse.json(
      {
        error: `El modelo respondió, pero no en el JSON esperado: ${
          err instanceof Error ? err.message : String(err)
        }`,
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, suggestion, sources: run.sources });
}

function describeError(err: unknown): string {
  if (err instanceof Anthropic.AuthenticationError) {
    return "La API key configurada fue rechazada por el endpoint. Si es una key de Z.ai, revisá que CANDIDATE_SUGGEST_BASE_URL apunte a su endpoint compatible con Anthropic (por defecto https://open.bigmodel.cn/api/anthropic) y que la key sea de ese mismo servicio.";
  }
  if (err instanceof Anthropic.RateLimitError) {
    return "El modelo está limitando las llamadas ahora mismo. Espera un momento y prueba de nuevo.";
  }
  if (err instanceof Anthropic.APIError) {
    return `Error de la API del modelo (${err.status}): ${err.message}`;
  }
  return err instanceof Error ? err.message : "Error desconocido";
}
