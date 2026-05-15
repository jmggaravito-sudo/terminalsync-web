#!/usr/bin/env node
/**
 * Local one-off equivalent of the Bundle Curator. Use when you want to
 * generate a fresh batch of `bundle_proposals` without waiting for the
 * weekly Vercel cron at /api/cron/run-curator.
 *
 * Steps:
 *   1) Snapshot the featured catalog from Supabase (is_featured=true)
 *   2) For each persona, call Claude Haiku 4.5 to propose 1-2 bundles
 *   3) POST proposals to /api/marketplace/admin/proposals/ingest
 *
 * Usage:
 *   node scripts/run_curator.mjs                  # reads .env.production
 *   node scripts/run_curator.mjs /path/to/.env    # custom env file
 *   SUPABASE_URL=... ... node scripts/run_curator.mjs   # shell env only
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envFile = process.argv[2] || path.join(__dirname, "..", ".env.production");

const env = fs.existsSync(envFile)
  ? Object.fromEntries(
      fs
        .readFileSync(envFile, "utf8")
        .split("\n")
        .filter((l) => l.includes("=") && !l.startsWith("#"))
        .map((l) => {
          const i = l.indexOf("=");
          const k = l.slice(0, i).trim();
          let v = l.slice(i + 1).trim();
          if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
          return [k, v];
        }),
    )
  : {};

const SUPABASE_URL = process.env.SUPABASE_URL || env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || env.ANTHROPIC_API_KEY;
const INGEST_URL = "https://terminalsync.ai/api/marketplace/admin/proposals/ingest";
const INGEST_KEY = process.env.DISCOVERY_INGEST_KEY || env.DISCOVERY_INGEST_KEY;

console.error("DEBUG keys present:", { SUPABASE_URL: !!SUPABASE_URL, SUPABASE_KEY: !!SUPABASE_KEY, ANTHROPIC_KEY: !!ANTHROPIC_KEY, INGEST_KEY: !!INGEST_KEY });
for (const [k, v] of Object.entries({ SUPABASE_URL, SUPABASE_KEY, ANTHROPIC_KEY, INGEST_KEY })) {
  if (!v) { console.error(`missing env: ${k}`); process.exit(1); }
}

const personas = [
  { id: "founder-no-tech",
    label: "Founder no-técnico que dirige un equipo pequeño",
    pain: "Vivo entre Slack, mi CRM, Gmail y hojas de cálculo. Pierdo horas pegando información entre apps." },
  { id: "vendedor",
    label: "Vendedor que vive en CRM e inbox",
    pain: "Pierdo deals porque no respondo rápido y no recuerdo el último contacto." },
  { id: "marketer",
    label: "Marketer / Growth de startup",
    pain: "Necesito coordinar campañas, contenido, analytics y emails sin hacer copy-paste todo el día." },
  { id: "ops-manager",
    label: "Operations Manager",
    pain: "Demasiados workflows manuales. Quiero que mi IA orqueste el día a día sin escribir código." },
  { id: "real-estate",
    label: "Agente inmobiliario",
    pain: "Manejo cientos de leads entre WhatsApp, email y mi CRM. Se me caen propiedades por no responder a tiempo." },
  { id: "coach",
    label: "Coach o consultor solo",
    pain: "Vendo mi tiempo. Necesito agendar, hacer follow-up y mandar material sin perder horas en admin." },
];

async function fetchTable(table, columns, filter = "") {
  const url = SUPABASE_URL + "/rest/v1/" + table + "?select=" + columns + (filter ? "&" + filter : "");
  const r = await fetch(url, { headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + SUPABASE_KEY } });
  if (!r.ok) return [];
  return r.json();
}

console.log("[1/3] snapshotting catalog (featured-only)…");
// Curator samples ONLY from the JM-curated featured subset (~30 items)
// so Claude can't invent items that don't deliver. See migration
// 0013_featured_catalog.sql + scripts/seed_featured_catalog.sql.
const connectors = (await fetchTable("connector_listings", "slug,name,tagline", "status=eq.approved&is_featured=eq.true"))
  .map((r) => ({ kind: "connector", slug: r.slug, name: r.name, tagline: r.tagline }));
const clis = (await fetchTable("cli_tool_listings", "slug,name,tagline", "status=eq.approved&is_featured=eq.true"))
  .map((r) => ({ kind: "cli", slug: r.slug, name: r.name, tagline: r.tagline }));
const catalog = { connectors, skills: [], clis };
console.log(`  connectors=${connectors.length} clis=${clis.length} (featured-only)`);

const CATALOG_JSON = JSON.stringify(catalog, null, 2).slice(0, 12000);

function buildPrompt(p) {
  return `Eres un curador del marketplace TerminalSync. TerminalSync es una app que conecta cualquier IA (Claude, ChatGPT, Codex) con las herramientas reales del usuario (Salesforce, Gmail, Slack, GitHub, etc.).

Tu trabajo: proponer 1-2 BUNDLES (paquetes) para esta persona, mezclando items del catálogo abajo.

PERSONA:
- Rol: ${p.label}
- Dolor real: ${p.pain}

CATÁLOGO DISPONIBLE (mezclá entre los 2 tipos):
${CATALOG_JSON}

REGLA CRÍTICA: El catálogo de arriba es la lista curada de items oficiales — NO inventes items que no estén en esta lista. Solo podés usar slugs que aparezcan exactamente en el catálogo. Si para esta persona no hay match razonable, devolvé proposals: [] sin forzar. Mejor 0 bundles que un bundle con items inventados.

REGLAS:
1. Cada bundle DEBE tener entre 3 y 5 items.
2. El "name" del bundle es corto, claro, sin jerga ("Sales Stack 2.0", "Founder Operating System", etc.).
3. "tagline": una frase de máx 90 caracteres que diga el BENEFICIO, no la tecnología. NUNCA digas "MCP", "connector", "API" ni "CLI".
4. "description_md": markdown de 3-5 oraciones explicando POR QUÉ esta persona necesita esto. Empezá con el dolor. Usá lenguaje cotidiano, como si le hablaras a alguien que nunca programó. SIN jerga técnica.
5. "setup_md": instrucciones tipo receta en markdown numerado. Asumí cero conocimiento técnico. Ejemplo:
   "1. Bajá Terminal Sync desde la web.\n2. Abrila y click en 'Add Bundle'.\n3. Pegá este código de bundle: <slug>.\n4. Listo: pedile a tu IA cualquiera de los prompts de ejemplo."
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

async function callClaude(p) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2500,
      messages: [{ role: "user", content: buildPrompt(p) }],
    }),
  });
  if (!r.ok) {
    const errBody = await r.text();
    console.warn(`  ${p.id}: claude HTTP ${r.status} — ${errBody.slice(0, 200)}`);
    return [];
  }
  const j = await r.json();
  const text = j.content?.[0]?.text || "{}";
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return [];
  try {
    const parsed = JSON.parse(match[0]);
    return Array.isArray(parsed.proposals) ? parsed.proposals : [];
  } catch (err) {
    console.warn(`  ${p.id}: JSON parse error`);
    return [];
  }
}

console.log("[2/3] calling Claude × 6 personas (parallel)…");
const results = await Promise.all(personas.map(async (p) => {
  const props = await callClaude(p);
  console.log(`  ${p.id}: ${props.length} proposal(s)`);
  return props.map((prop) => ({
    ...prop,
    persona: p.id,
    persona_label: p.label,
    pain_point: p.pain,
    price_cents: prop.price_cents || 1900,
    currency: prop.currency || "usd",
  }));
}));
const allProposals = results.flat();

console.log(`[3/3] POSTing ${allProposals.length} proposals to ingest…`);
const ingestRes = await fetch(INGEST_URL, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": INGEST_KEY,
  },
  body: JSON.stringify({ proposals: allProposals }),
});
const ingestBody = await ingestRes.text();
console.log(`  HTTP ${ingestRes.status}: ${ingestBody.slice(0, 500)}`);
