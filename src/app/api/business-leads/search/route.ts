import { NextResponse } from "next/server";
import { authenticate, isAdmin } from "@/lib/marketplace/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120; // Apify's Google Maps run can take a while

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY ?? "";
const N8N_URL = process.env.N8N_URL ?? "https://n8n.nexflowai.net";

const NICHES = ["salud", "educacion", "ongs", "negocios_locales", "gestion_empresarial"] as const;

type ParsedQuery = {
  niche: string;
  keyword: string;
  city: string;
  country: string;
  maxResults: number;
};

/**
 * POST /api/business-leads/search
 *
 * Free-text prospecting from the admin dashboard — the web equivalent of
 * asking Claude Code "Prospector: dame clínicas dentales en Bogotá".
 * Claude extracts the structured fields, then this route calls the same
 * n8n webhook the `prospector-empresas` skill calls
 * (TS - Business Leads / Google Maps, workflow IVAnrA74MxyRaWmy).
 *
 * Kept server-side (not called from the browser) so the n8n webhook URL —
 * which has no auth of its own and spends real Apify budget per call —
 * never reaches client code.
 */
export async function POST(req: Request) {
  const user = await authenticate(req);
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { query?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }
  const query = typeof body.query === "string" ? body.query.trim() : "";
  if (!query) return NextResponse.json({ error: "missing query" }, { status: 400 });

  const parsed = await parseQuery(query);
  if (!parsed) {
    return NextResponse.json(
      { error: "No pude entender el pedido. Probá algo como: \"clínicas dentales en Bogotá, Colombia\"." },
      { status: 422 },
    );
  }

  let ingest: unknown;
  try {
    const res = await fetch(`${N8N_URL}/webhook/ts-business-leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed),
      signal: AbortSignal.timeout(110_000),
    });
    ingest = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
  } catch (e) {
    return NextResponse.json(
      { error: `No se pudo contactar el workflow de n8n: ${e instanceof Error ? e.message : "unknown error"}` },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, parsed, ingest });
}

async function parseQuery(query: string): Promise<ParsedQuery | null> {
  if (!ANTHROPIC_KEY) return null;

  const prompt = `Extraé de este pedido de búsqueda de negocios los campos para una búsqueda en Google Maps. Respondé ÚNICAMENTE con JSON puro, sin markdown, sin explicación, con exactamente esta forma:
{"niche":"...","keyword":"...","city":"...","country":"...","maxResults":60}

- "niche": uno de estos valores exactos, el que mejor aplique: ${NICHES.join(", ")}.
- "keyword": el rubro de negocio tal cual se buscaría en Google Maps (ej "clínica dental", "colegio privado"), en español.
- "city": la ciudad mencionada.
- "country": el país. Si no se menciona explícitamente, inferilo de la ciudad.
- "maxResults": la cantidad de resultados pedida. Si no se especifica, usá 60. Nunca superes 120.

Si el pedido no menciona ni rubro ni ciudad reconocibles, respondé exactamente: null

Pedido: "${query}"`;

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!r.ok) return null;

  const j = (await r.json()) as { content?: Array<{ text?: string }> };
  const raw = j.content?.[0]?.text?.trim();
  if (!raw || raw === "null") return null;

  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  let candidate: Record<string, unknown>;
  try {
    candidate = JSON.parse(cleaned);
  } catch {
    return null;
  }

  const keyword = typeof candidate.keyword === "string" ? candidate.keyword.trim() : "";
  const city = typeof candidate.city === "string" ? candidate.city.trim() : "";
  if (!keyword || !city) return null;

  const niche = typeof candidate.niche === "string" && (NICHES as readonly string[]).includes(candidate.niche)
    ? candidate.niche
    : "negocios_locales";
  const country = typeof candidate.country === "string" ? candidate.country.trim() : "";
  const rawMax = Number(candidate.maxResults);
  const maxResults = Number.isFinite(rawMax) && rawMax > 0 ? Math.min(Math.trunc(rawMax), 120) : 60;

  return { niche, keyword, city, country, maxResults };
}
