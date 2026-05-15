/**
 * Weekly cron: ask Claude Haiku to propose mixed-pillar Stack Pack
 * bundles for ~6 personas, inserting them into `bundle_proposals` for
 * JM to publish/reject in /[lang]/admin-bypass/bundles/proposals.
 *
 * Why a Vercel cron and not n8n: the n8n public API has a known bug
 * where webhooks created via PUT/POST aren't registered in the
 * production listener until the workflow is opened+saved in the UI or
 * the container is restarted. Vercel crons don't have this problem.
 * The same logic also runs locally via `scripts/run_curator.mjs` when
 * we want to fire off-schedule.
 *
 * Schedule: Sundays 07:00 UTC (defined in vercel.json -> crons).
 * Auth: Vercel sends `Authorization: Bearer ${CRON_SECRET}` automatically.
 * We re-verify it server-side so a leaked URL can't trigger a Claude
 * fan-out on someone else's bill.
 */
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Claude × 6 personas in parallel can sit on the Vercel function for
// ~60s. Hobby tier maxes at 10s, Pro at 60s, Fluid at 300s. JM's plan
// supports the bump; if not, the script path (scripts/run_curator.mjs)
// is the manual fallback.
export const maxDuration = 300;

interface Persona {
  id: string;
  label: string;
  pain: string;
}

const PERSONAS: Persona[] = [
  {
    id: "founder-no-tech",
    label: "Founder no-técnico que dirige un equipo pequeño",
    pain: "Vivo entre Slack, mi CRM, Gmail y hojas de cálculo. Pierdo horas pegando información entre apps.",
  },
  {
    id: "vendedor",
    label: "Vendedor que vive en CRM e inbox",
    pain: "Pierdo deals porque no respondo rápido y no recuerdo el último contacto.",
  },
  {
    id: "marketer",
    label: "Marketer / Growth de startup",
    pain: "Necesito coordinar campañas, contenido, analytics y emails sin hacer copy-paste todo el día.",
  },
  {
    id: "ops-manager",
    label: "Operations Manager",
    pain: "Demasiados workflows manuales. Quiero que mi IA orqueste el día a día sin escribir código.",
  },
  {
    id: "real-estate",
    label: "Agente inmobiliario",
    pain: "Manejo cientos de leads entre WhatsApp, email y mi CRM. Se me caen propiedades por no responder a tiempo.",
  },
  {
    id: "coach",
    label: "Coach o consultor solo",
    pain: "Vendo mi tiempo. Necesito agendar, hacer follow-up y mandar material sin perder horas en admin.",
  },
];

interface CatalogItem {
  kind: "connector" | "cli";
  slug: string;
  name: string;
  tagline: string;
}

interface RawProposal {
  name?: unknown;
  slug?: unknown;
  tagline?: unknown;
  description_md?: unknown;
  setup_md?: unknown;
  sample_prompts?: unknown;
  proposed_items?: unknown;
  price_cents?: unknown;
  currency?: unknown;
}

function buildPrompt(p: Persona, catalogJson: string): string {
  return `Eres un curador del marketplace TerminalSync. TerminalSync es una app que conecta cualquier IA (Claude, ChatGPT, Codex) con las herramientas reales del usuario (Salesforce, Gmail, Slack, GitHub, etc.).

Tu trabajo: proponer 1-2 BUNDLES (paquetes) para esta persona, mezclando items del catálogo abajo.

PERSONA:
- Rol: ${p.label}
- Dolor real: ${p.pain}

CATÁLOGO DISPONIBLE (mezclá entre los 2 tipos):
${catalogJson}

REGLA CRÍTICA: El catálogo de arriba es la lista curada de items oficiales — NO inventes items que no estén en esta lista. Solo podés usar slugs que aparezcan exactamente en el catálogo. Si para esta persona no hay match razonable, devolvé proposals: [] sin forzar. Mejor 0 bundles que un bundle con items inventados.

REGLAS:
1. Cada bundle DEBE tener entre 3 y 5 items.
2. El "name" del bundle es corto, claro, sin jerga.
3. "tagline": una frase de máx 90 caracteres que diga el BENEFICIO, no la tecnología. NUNCA digas "MCP", "connector", "API" ni "CLI".
4. "description_md": markdown de 3-5 oraciones explicando POR QUÉ esta persona necesita esto. Empezá con el dolor. Usá lenguaje cotidiano. SIN jerga técnica.
5. "setup_md": instrucciones tipo receta en markdown numerado. Asumí cero conocimiento técnico.
6. "sample_prompts": exactamente 3 prompts que esta persona pueda copiar y pegar a su IA HOY para ver valor inmediato. Cada prompt es una frase concreta, no genérica.
7. "proposed_items": array de items donde cada uno tiene {kind, slug, sort_order, why_it_helps}. El "why_it_helps" es una frase corta (~80 chars) en lenguaje de la persona.

Output: JSON VÁLIDO sin markdown fences. Schema:
{
  "proposals": [
    {
      "persona": "${p.id}",
      "persona_label": "${p.label}",
      "pain_point": "${p.pain}",
      "name": "...",
      "slug": "kebab-case-name",
      "tagline": "...",
      "description_md": "...",
      "setup_md": "...",
      "sample_prompts": ["...", "...", "..."],
      "proposed_items": [
        {"kind":"connector","slug":"...","sort_order":0,"why_it_helps":"..."}
      ],
      "price_cents": 1900,
      "currency": "usd"
    }
  ]
}

Si el catálogo no tiene items razonables para esta persona, devolvé proposals: [].`;
}

async function callClaude(
  apiKey: string,
  persona: Persona,
  catalogJson: string,
): Promise<RawProposal[]> {
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 2500,
        messages: [{ role: "user", content: buildPrompt(persona, catalogJson) }],
      }),
    });
    if (!r.ok) return [];
    const j = (await r.json()) as { content?: Array<{ text?: string }> };
    const text = j.content?.[0]?.text ?? "{}";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return [];
    const parsed = JSON.parse(match[0]) as { proposals?: RawProposal[] };
    return Array.isArray(parsed.proposals) ? parsed.proposals : [];
  } catch {
    return [];
  }
}

function strField(v: unknown, max: number): string {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, max);
}

function normalizeProposal(
  raw: RawProposal,
  persona: Persona,
  featuredSlugs: Set<string>,
): Record<string, unknown> | null {
  const name = strField(raw.name, 120);
  const slug = strField(raw.slug, 120);
  const tagline = strField(raw.tagline, 200);
  if (!name || !slug || !tagline) return null;

  const items = Array.isArray(raw.proposed_items) ? raw.proposed_items : [];
  // Drop any item the curator hallucinated despite the CRITICAL rule —
  // featuredSlugs is the only valid set.
  const cleanItems = (items as unknown[])
    .map((it, i): {
      kind: string;
      slug: string;
      sort_order: number;
      why_it_helps: string | null;
    } | null => {
      if (!it || typeof it !== "object") return null;
      const o = it as Record<string, unknown>;
      const kind = typeof o.kind === "string" ? o.kind : "";
      const itemSlug = typeof o.slug === "string" ? o.slug.trim() : "";
      if (!["connector", "skill", "cli"].includes(kind)) return null;
      if (!itemSlug) return null;
      if (!featuredSlugs.has(itemSlug)) return null;
      return {
        kind,
        slug: itemSlug,
        sort_order: typeof o.sort_order === "number" ? o.sort_order : i,
        why_it_helps:
          typeof o.why_it_helps === "string" ? o.why_it_helps.slice(0, 200) : null,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  if (cleanItems.length < 2) return null;

  const samplePrompts = Array.isArray(raw.sample_prompts)
    ? (raw.sample_prompts as unknown[])
        .filter((s): s is string => typeof s === "string")
        .map((s) => s.slice(0, 500))
        .slice(0, 5)
    : [];

  return {
    persona: persona.id,
    persona_label: persona.label,
    pain_point: persona.pain,
    name,
    slug,
    tagline,
    description_md: strField(raw.description_md, 4000),
    setup_md: strField(raw.setup_md, 4000),
    sample_prompts: samplePrompts,
    proposed_items: cleanItems,
    price_cents: typeof raw.price_cents === "number" ? raw.price_cents : 1900,
    currency:
      typeof raw.currency === "string" && raw.currency.length === 3
        ? raw.currency
        : "usd",
    status: "pending",
    proposed_by: "claude",
  };
}

export async function GET(req: Request) {
  const provided = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  if (!process.env.CRON_SECRET || provided !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supaUrl = process.env.SUPABASE_URL;
  const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!supaUrl || !supaKey || !anthropicKey) {
    return NextResponse.json(
      { error: "Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / ANTHROPIC_API_KEY" },
      { status: 503 },
    );
  }
  const sb = createClient(supaUrl, supaKey, { auth: { persistSession: false } });

  // 1. Snapshot the featured catalog.
  const [connRes, cliRes] = await Promise.all([
    sb
      .from("connector_listings")
      .select("slug, name, tagline")
      .eq("status", "approved")
      .eq("is_featured", true),
    sb
      .from("cli_tool_listings")
      .select("slug, name, tagline")
      .eq("status", "approved")
      .eq("is_featured", true),
  ]);
  if (connRes.error) {
    return NextResponse.json({ error: `connectors: ${connRes.error.message}` }, { status: 500 });
  }
  const connectors: CatalogItem[] = (connRes.data ?? []).map((r) => ({
    kind: "connector",
    slug: r.slug as string,
    name: r.name as string,
    tagline: r.tagline as string,
  }));
  const clis: CatalogItem[] = (cliRes.data ?? []).map((r) => ({
    kind: "cli",
    slug: r.slug as string,
    name: r.name as string,
    tagline: r.tagline as string,
  }));
  const featuredSlugs = new Set<string>([
    ...connectors.map((c) => c.slug),
    ...clis.map((c) => c.slug),
  ]);
  if (featuredSlugs.size === 0) {
    return NextResponse.json({
      ok: true,
      message: "no featured items — nothing to curate",
      curated: 0,
    });
  }

  const catalogJson = JSON.stringify(
    { connectors, skills: [], clis },
    null,
    2,
  ).slice(0, 12000);

  // 2. Fan out to Claude in parallel.
  const proposalsByPersona = await Promise.all(
    PERSONAS.map(async (p) => {
      const raw = await callClaude(anthropicKey, p, catalogJson);
      const normalized = raw
        .map((r) => normalizeProposal(r, p, featuredSlugs))
        .filter((x): x is Record<string, unknown> => x !== null);
      return { persona: p.id, count: normalized.length, rows: normalized };
    }),
  );

  const allRows = proposalsByPersona.flatMap((p) => p.rows);

  // 3. Insert all in one batch. RLS is satisfied by service role.
  if (allRows.length === 0) {
    return NextResponse.json({
      ok: true,
      proposed: 0,
      inserted: 0,
      featuredCatalog: featuredSlugs.size,
      perPersona: proposalsByPersona.map((p) => ({ persona: p.persona, count: p.count })),
    });
  }
  const ins = await sb.from("bundle_proposals").insert(allRows);
  if (ins.error) {
    return NextResponse.json({ error: ins.error.message, attempted: allRows.length }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    proposed: allRows.length,
    inserted: allRows.length,
    featuredCatalog: featuredSlugs.size,
    perPersona: proposalsByPersona.map((p) => ({ persona: p.persona, count: p.count })),
  });
}
