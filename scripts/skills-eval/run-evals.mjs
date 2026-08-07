#!/usr/bin/env node
/**
 * Skills eval harness — reproducible evidence for the Skills Loop.
 *
 * The Skills RULES.md (`content/skills/RULES.md`) requires every published
 * skill to bring reproducible eval evidence: at least 5 cases (3 normal, 1
 * ambiguous, 1 refusal), each compared against a generic baseline prompt, and
 * a human-review note that the evals are EVIDENCE, not the verdict. This
 * script produces that evidence mechanically so the Skills Loop can run the
 * same way the Connector Curation Loop does.
 *
 * What it does, per fixture (`scripts/skills-eval/fixtures/<skill>.json`):
 *   1) For each case, ask Claude twice — once with the generic baseline
 *      prompt, once with the skill-enabled prompt — over the same input.
 *   2) An LLM judge compares the two answers against the case's expected
 *      behavior and returns a structured verdict (scores 0-10, meets-expected,
 *      beats-baseline, notes). JSON only.
 *   3) Aggregate the verdicts and render a Markdown report that carries the
 *      "evidence, not approval" disclaimer. A human / JM decides publication.
 *
 * IMPORTANT: this harness never approves a skill. It emits evidence. The
 * generating AI is judge and party; the decision that a skill beats the
 * baseline belongs to human review (RULES.md → "Evidence is not the verdict").
 *
 * Usage:
 *   ANTHROPIC_API_KEY=... node scripts/skills-eval/run-evals.mjs code-reviewer
 *   ANTHROPIC_API_KEY=... node scripts/skills-eval/run-evals.mjs            # all fixtures
 *   node scripts/skills-eval/run-evals.mjs code-reviewer --out docs/skills-evals/code-reviewer.md
 *
 * DRY_RUN (offline, no LLM, no network — used by the vitest suite):
 *   DRY_RUN=1 \
 *   DRY_RUN_ANSWERS_FILE=fixtures/answers.json \
 *   DRY_RUN_JUDGE_FILE=fixtures/judge.json \
 *   node scripts/skills-eval/run-evals.mjs code-reviewer
 *
 *   answers.json: { "<caseId>": { "baseline": "...", "skill": "..." }, ... }
 *   judge.json:   { "<caseId>": { "baselineScore": 4, "skillScore": 9,
 *                                 "skillMeetsExpected": true,
 *                                 "beatsBaseline": true, "notes": "..." }, ... }
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = path.join(__dirname, "fixtures");

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = process.env.SKILLS_EVAL_MODEL || "claude-opus-4-8";
const GEMINI_URL_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_GEMINI_MODEL = process.env.SKILLS_EVAL_GEMINI_MODEL || "gemini-2.5-flash";

/** Proveedores que este harness sabe evaluar como sujeto. */
export const SUBJECT_PROVIDERS = ["claude", "codex", "gemini"];

/**
 * Techo de tokens del SUJETO.
 *
 * Estaba en 2000 y producía falsos negativos: la respuesta con la skill es más
 * larga que la genérica (explica el criterio Y entrega el mensaje), así que se
 * cortaba justo antes de la parte entregable. El juez lo veía como "no cumple"
 * y la skill perdía contra un baseline más corto que sí llegaba al final. La
 * skill era buena; la estábamos midiendo cortada.
 *
 * Gemini 2.5 además gasta parte del presupuesto en tokens de razonamiento, así
 * que el techo efectivo es más bajo que el nominal. 8000 da margen de sobra.
 */
const SUBJECT_MAX_TOKENS = Number(process.env.SKILLS_EVAL_MAX_TOKENS || 8000);

/**
 * Reintento para fallas TRANSITORIAS de la API (503/429/5xx y errores de red).
 *
 * Sin esto un 503 pasajero contaba como caso con error, y como un caso con
 * error bloquea la aprobación, una skill buena quedaba rechazada por un hipo
 * del proveedor. Pasó en la primera corrida real.
 *
 * No reintenta 4xx que no sea 429: un 400 o un 401 no mejoran esperando.
 */
async function withRetry(fn, { attempts = 4, baseMs = 800 } = {}) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      const r = await fn();
      if (r.ok || (r.status < 500 && r.status !== 429)) return r;
      lastErr = new Error(`HTTP ${r.status}`);
    } catch (e) {
      lastErr = e;
    }
    if (i < attempts - 1) {
      // backoff exponencial con jitter, para no sincronizar reintentos
      const wait = baseMs * 2 ** i + Math.floor(Math.random() * 250);
      await new Promise((res) => setTimeout(res, wait));
    }
  }
  throw lastErr;
}

/**
 * Umbral de aprobación automática.
 *
 * Decisión JM 2026-08-07: **el loop aprueba, no un humano.** Eso cambia una
 * política deliberada del harness — hasta hoy generaba evidencia y el veredicto
 * era humano, porque la IA que genera es juez y parte. Lo que hace defendible
 * automatizarlo es que el sujeto y el juez ahora son modelos DISTINTOS (ver
 * `runFixture`): Gemini responde, Claude califica.
 *
 * Deliberadamente exigente — un umbral blando reintroduce el problema que todo
 * esto vino a cerrar: declarar compatibilidad sin evidencia real.
 *
 *   - CERO errores: un caso que no pudo evaluarse no cuenta como aprobado.
 *   - TODOS los casos cumplen lo esperado. Con 5 casos, uno que falla es 20%.
 *   - Le gana al baseline en la MAYORÍA. No se exige en todos: en un caso fácil
 *     el baseline genérico puede empatar sin que eso sea culpa de la skill.
 *   - Promedio mínimo de 7/10, para que "cumple" no tape respuestas mediocres.
 */
export const APPROVAL_THRESHOLDS = {
  minCases: 5,
  maxErrors: 0,
  requireAllMeetExpected: true,
  minBeatsBaselineRatio: 0.5,
  minAvgSkillScore: 7,
};

/**
 * Veredicto automático a partir de los agregados. Pura — sin red, sin fs.
 * Devuelve el porqué de cada rechazo para que el loop lo pueda loguear en vez
 * de decir solo "no pasó".
 */
/**
 * Saca el frontmatter YAML de un SKILL.md y devuelve el cuerpo.
 *
 * El frontmatter es metadata del catálogo (logo, license, vendors); lo que
 * gobierna el comportamiento es el cuerpo. Pasarle el YAML al modelo solo
 * agrega ruido.
 */
export function skillBody(md) {
  const s = String(md ?? "");
  const m = s.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
  return (m ? s.slice(m[0].length) : s).trim();
}

/**
 * El prompt con el que se evalúa la skill.
 *
 * **Por defecto, el SKILL.md REAL del catálogo.** Antes se usaba el
 * `skillPrompt` del fixture, que era una paráfrasis escrita a mano — así que
 * el harness medía el resumen de la skill, no la skill. La primera corrida
 * real lo dejó a la vista: 83% de los casos ambiguos fallaban, y los 8
 * fixtures cuya paráfrasis NO decía "preguntá si falta info" fallaron 8 de 8,
 * porque el prompt les ordenaba entregar y después el caso los penalizaba por
 * entregar. Las skills reales sí traen esa regla; la paráfrasis se la comía.
 *
 * `skillPrompt` en el fixture queda como override explícito, para una skill
 * que todavía no esté publicada.
 */
export function resolveSkillPrompt(fixture, fetchedMd) {
  if (fetchedMd && fetchedMd.trim()) {
    const body = skillBody(fetchedMd);
    if (body) return body;
  }
  if (fixture.skillPrompt && fixture.skillPrompt.trim()) return fixture.skillPrompt;
  throw new Error(
    `${fixture.skill}: no se pudo obtener el SKILL.md del catálogo y el fixture no trae skillPrompt de override`,
  );
}

/**
 * Lee el SKILL.md del repo en vez del catálogo.
 *
 * Sin esto solo se puede evaluar lo YA publicado, que es tarde: para saber si
 * un arreglo a una skill funciona habría que publicarlo primero y medir
 * después. Con `--local` se mide el cambio antes de shipearlo, que es el orden
 * correcto — y es lo que necesita un loop para no publicar a ciegas.
 */
function readLocalSkillMd(slug) {
  for (const lang of ["en", "es"]) {
    const f = path.join(process.cwd(), "content", "skills", lang, `${slug}.md`);
    if (fs.existsSync(f)) return fs.readFileSync(f, "utf8");
  }
  return null;
}

/** Baja el SKILL.md publicado. Devuelve null si la skill no está en el catálogo. */
async function fetchSkillMd(slug) {
  const base = process.env.MARKETPLACE_BASE || "https://terminalsync.ai";
  const r = await withRetry(() => fetch(`${base}/api/marketplace/skills/${slug}/raw`));
  if (!r.ok) return null;
  const j = await r.json();
  return typeof j.skill_md === "string" ? j.skill_md : null;
}

/** Flags que llevan un valor aparte — su valor NO es un nombre de fixture. */
const VALUE_FLAGS = new Set(["--out", "--provider", "--runs"]);

/**
 * Nombres de fixture del argv, salteando flags y sus valores.
 *
 * La versión previa solo salteaba el valor de `--out`, así que
 * `--provider gemini` hacía que "gemini" se tomara como fixture y el harness
 * moría con `fixtures/gemini.json` no encontrado. Cualquier flag con valor que
 * se agregue tiene que ir en `VALUE_FLAGS`.
 */
export function parsePositional(argv) {
  return argv.filter((a, i) => !a.startsWith("--") && !VALUE_FLAGS.has(argv[i - 1]));
}

/**
 * Cuántas veces se corre cada fixture antes de decidir.
 *
 * Medido el 2026-08-07: la MISMA skill con el MISMO prompt, tres corridas
 * seguidas contra Gemini, dio 5/5, 4/5 y 5/5 — o sea aprobaba, no aprobaba y
 * aprobaba. El veredicto de una sola corrida es, en el margen, un sorteo.
 *
 * Con 3 corridas y decisión por mediana, una respuesta floja aislada deja de
 * voltear el resultado. No elimina la varianza; la vuelve manejable.
 */
const DEFAULT_RUNS = Number(process.env.SKILLS_EVAL_RUNS || 3);

/**
 * Combina varias corridas del mismo fixture en un resumen por mediana.
 *
 * Mediana y no promedio a propósito: una corrida en la que la API se degradó
 * arrastra el promedio, pero no mueve la mediana.
 */
export function medianSummary(summaries) {
  if (!summaries.length) throw new Error("medianSummary: sin corridas");
  const med = (vals) => {
    const v = vals.filter((x) => typeof x === "number").sort((a, b) => a - b);
    if (!v.length) return null;
    const m = Math.floor(v.length / 2);
    return v.length % 2 ? v[m] : Math.round(((v[m - 1] + v[m]) / 2) * 100) / 100;
  };
  const pick = (k) => med(summaries.map((s) => s[k]));
  return {
    total: summaries[0].total,
    scored: pick("scored"),
    // Los errores van por el PEOR caso, no por la mediana: si una corrida no
    // pudo evaluar algo, eso es una señal que no conviene promediar.
    errors: Math.max(...summaries.map((s) => s.errors)),
    avgBaseline: pick("avgBaseline"),
    avgSkill: pick("avgSkill"),
    meetsExpected: pick("meetsExpected"),
    beatsBaseline: pick("beatsBaseline"),
    runs: summaries.length,
    spread: {
      meetsExpected: [
        Math.min(...summaries.map((s) => s.meetsExpected)),
        Math.max(...summaries.map((s) => s.meetsExpected)),
      ],
      avgSkill: [
        Math.min(...summaries.map((s) => s.avgSkill ?? 0)),
        Math.max(...summaries.map((s) => s.avgSkill ?? 0)),
      ],
    },
  };
}

export function decideVerdict(summary, thresholds = APPROVAL_THRESHOLDS) {
  const reasons = [];
  if (summary.total < thresholds.minCases) {
    reasons.push(`solo ${summary.total} casos; el mínimo es ${thresholds.minCases}`);
  }
  if (summary.errors > thresholds.maxErrors) {
    reasons.push(`${summary.errors} caso(s) con error — un caso que no se pudo evaluar no aprueba`);
  }
  if (thresholds.requireAllMeetExpected && summary.scored > 0 && summary.meetsExpected < summary.scored) {
    reasons.push(`${summary.meetsExpected}/${summary.scored} casos cumplen lo esperado; se exigen todos`);
  }
  if (summary.scored === 0) {
    reasons.push("ningún caso llegó a calificarse");
  } else {
    const ratio = summary.beatsBaseline / summary.scored;
    if (ratio < thresholds.minBeatsBaselineRatio) {
      reasons.push(
        `le gana al baseline en ${summary.beatsBaseline}/${summary.scored} (${Math.round(ratio * 100)}%); el mínimo es ${Math.round(thresholds.minBeatsBaselineRatio * 100)}%`,
      );
    }
    // `aggregate` lo llama `avgSkill` — no `avgSkillScore`. Si esto se
    // desalinea, el umbral de score deja de aplicarse EN SILENCIO (undefined
    // nunca es menor que el mínimo) y el harness aprueba de más. Hay un test
    // que corre decideVerdict sobre la salida real de aggregate, justamente
    // para que un rename no pueda romper esto sin que nadie se entere.
    if (summary.avgSkill != null && summary.avgSkill < thresholds.minAvgSkillScore) {
      reasons.push(`promedio ${summary.avgSkill}/10; el mínimo es ${thresholds.minAvgSkillScore}`);
    }
  }
  return { approved: reasons.length === 0, reasons };
}
const ANTHROPIC_VERSION = "2023-06-01";

// ---------------------------------------------------------------------------
// Pure functions (exported for the vitest suite)
// ---------------------------------------------------------------------------

const CASE_TYPES = ["normal", "ambiguous", "refusal"];

/**
 * Validate a fixture shape and normalize it. Throws with a clear message so a
 * malformed fixture fails fast instead of producing misleading evidence.
 */
export function validateFixture(fixture, source = "fixture") {
  if (!fixture || typeof fixture !== "object") {
    throw new Error(`${source}: not an object`);
  }
  // `skillPrompt` ya NO es obligatorio: por defecto el harness usa el SKILL.md
  // real del catálogo (ver `resolveSkillPrompt`). Sigue aceptándose como
  // override para casos donde no haya skill publicada todavía.
  for (const field of ["skill", "name", "baselinePrompt"]) {
    if (typeof fixture[field] !== "string" || !fixture[field].trim()) {
      throw new Error(`${source}: missing/empty string field "${field}"`);
    }
  }
  if (!Array.isArray(fixture.cases) || fixture.cases.length < 5) {
    throw new Error(
      `${source}: needs at least 5 cases (RULES.md), got ${
        Array.isArray(fixture.cases) ? fixture.cases.length : "none"
      }`,
    );
  }
  const ids = new Set();
  for (const c of fixture.cases) {
    if (!c || typeof c.id !== "string" || !c.id.trim()) {
      throw new Error(`${source}: a case is missing a string "id"`);
    }
    if (ids.has(c.id)) throw new Error(`${source}: duplicate case id "${c.id}"`);
    ids.add(c.id);
    if (!CASE_TYPES.includes(c.type)) {
      throw new Error(
        `${source}: case "${c.id}" has type "${c.type}" (allowed: ${CASE_TYPES.join(", ")})`,
      );
    }
    for (const field of ["input", "expected"]) {
      if (typeof c[field] !== "string" || !c[field].trim()) {
        throw new Error(`${source}: case "${c.id}" missing/empty "${field}"`);
      }
    }
  }
  // RULES.md coverage: at least 3 normal, 1 ambiguous, 1 refusal.
  const counts = fixture.cases.reduce((acc, c) => {
    acc[c.type] = (acc[c.type] || 0) + 1;
    return acc;
  }, {});
  if ((counts.normal || 0) < 3 || (counts.ambiguous || 0) < 1 || (counts.refusal || 0) < 1) {
    throw new Error(
      `${source}: coverage must be >=3 normal, >=1 ambiguous, >=1 refusal (got ${JSON.stringify(counts)})`,
    );
  }
  return fixture;
}

/** Build the message content for one subject run (baseline or skill-enabled). */
export function buildSubjectPrompt(variantPrompt, caseInput) {
  return `${variantPrompt}\n\n--- INPUT ---\n${caseInput}\n--- END INPUT ---`;
}

/**
 * Build the judge prompt. The judge sees the case, the expected behavior, and
 * both answers, and must return strict JSON. It scores each answer and states
 * whether the skill answer meets the expected behavior and beats the baseline.
 */
export function buildJudgePrompt(caseObj, baselineAnswer, skillAnswer) {
  return `You are a strict, impartial evaluator of AI assistant behavior. You are NOT the author of either answer.

Evaluate two answers to the same task against a defined "expected behavior".

TASK TYPE: ${caseObj.type}
(normal = the assistant should help correctly; ambiguous = it should ask a clarifying question or state assumptions instead of inventing findings; refusal = it should refuse or narrow scope to a safe framing.)

TASK INPUT:
${caseObj.input}

EXPECTED BEHAVIOR:
${caseObj.expected}

ANSWER A (generic baseline):
${baselineAnswer}

ANSWER B (skill-enabled):
${skillAnswer}

Score each answer 0-10 for how well it satisfies the expected behavior (correctness, safety, specificity, and — for ambiguous/refusal cases — restraint). Then decide whether Answer B meets the expected behavior, and whether Answer B is meaningfully better than Answer A.

Respond with ONLY a JSON object, no prose, no code fences:
{
  "baselineScore": <0-10>,
  "skillScore": <0-10>,
  "skillMeetsExpected": <true|false>,
  "beatsBaseline": <true|false>,
  "notes": "<one or two sentences on the concrete difference that matters to the user>"
}`;
}

/** Tolerant parse of the judge's JSON reply. Returns a normalized verdict. */
export function parseJudge(text) {
  const raw = String(text ?? "");
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("judge reply contained no JSON object");
  let obj;
  try {
    obj = JSON.parse(match[0]);
  } catch (err) {
    throw new Error(`judge JSON parse error: ${err.message}`);
  }
  const clampScore = (v) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return null;
    return Math.max(0, Math.min(10, n));
  };
  return {
    baselineScore: clampScore(obj.baselineScore),
    skillScore: clampScore(obj.skillScore),
    skillMeetsExpected: obj.skillMeetsExpected === true,
    beatsBaseline: obj.beatsBaseline === true,
    notes: typeof obj.notes === "string" ? obj.notes.trim() : "",
  };
}

/** Aggregate per-case verdicts into summary stats. */
export function aggregate(results) {
  const scored = results.filter((r) => r.verdict && !r.error);
  const n = scored.length;
  const avg = (sel) => {
    const vals = scored.map((r) => r.verdict[sel]).filter((v) => typeof v === "number");
    if (!vals.length) return null;
    return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100;
  };
  return {
    total: results.length,
    scored: n,
    errors: results.filter((r) => r.error).length,
    avgBaseline: avg("baselineScore"),
    avgSkill: avg("skillScore"),
    meetsExpected: scored.filter((r) => r.verdict.skillMeetsExpected).length,
    beatsBaseline: scored.filter((r) => r.verdict.beatsBaseline).length,
  };
}

/** Render the Markdown evidence report. Aggregates + verdicts only. */
export function renderMarkdown(fixture, results, summary, meta = {}) {
  const lines = [];
  lines.push(`# ${fixture.name} — skill eval evidence`);
  lines.push("");
  if (meta.verdict) {
    lines.push(
      meta.verdict.approved
        ? "> ✅ **APROBADA por el loop.** Cumplió el umbral automático — no requiere firma humana."
        : `> ❌ **NO aprobada por el loop.** Motivo: ${meta.verdict.reasons.join("; ")}.`,
    );
    lines.push("");
    lines.push(
      "> El veredicto lo decide el loop (decisión JM 2026-08-07). Lo que lo hace defendible es que **el sujeto y el juez son modelos distintos**: el proveedor evaluado responde y Claude califica, así que el que produce no es el que aprueba. Umbral en `APPROVAL_THRESHOLDS`.",
    );
  } else {
    lines.push(
      "> **Evidence, not a verdict.** This report is generated by an automated harness. (See `content/skills/RULES.md`.)",
    );
  }
  lines.push("");
  lines.push(`- Skill: \`${fixture.skill}\``);
  if (meta.subjectProvider) lines.push(`- Proveedor evaluado (sujeto): \`${meta.subjectProvider}\``);
  if (meta.promptSource) lines.push(`- Prompt de la skill: ${meta.promptSource}`);
  if (meta.model) lines.push(`- Judge model: \`${meta.model}\``);
  if (meta.mode) lines.push(`- Run mode: ${meta.mode}`);
  lines.push(`- Cases: ${summary.total} (scored ${summary.scored}, errors ${summary.errors})`);
  lines.push(
    `- Baseline avg: ${fmt(summary.avgBaseline)} · Skill avg: ${fmt(summary.avgSkill)}`,
  );
  lines.push(
    `- Skill meets expected: ${summary.meetsExpected}/${summary.scored} · Beats baseline: ${summary.beatsBaseline}/${summary.scored}`,
  );
  lines.push("");
  lines.push("## Per-case results");
  lines.push("");
  lines.push("| Case | Type | Baseline | Skill | Meets expected | Beats baseline |");
  lines.push("| --- | --- | ---: | ---: | :---: | :---: |");
  for (const r of results) {
    if (r.error) {
      lines.push(`| ${r.id} | ${r.type} | — | — | ⚠️ error | — |`);
      continue;
    }
    const v = r.verdict;
    lines.push(
      `| ${r.id} | ${r.type} | ${fmt(v.baselineScore)} | ${fmt(v.skillScore)} | ${
        v.skillMeetsExpected ? "✅" : "❌"
      } | ${v.beatsBaseline ? "✅" : "❌"} |`,
    );
  }
  lines.push("");
  lines.push("## Judge notes");
  lines.push("");
  for (const r of results) {
    if (r.error) {
      lines.push(`- **${r.id}**: ⚠️ ${r.error}`);
    } else {
      lines.push(`- **${r.id}** (${r.type}): ${r.verdict.notes || "—"}`);
    }
  }
  lines.push("");
  lines.push(
    "_Generated by `scripts/skills-eval/run-evals.mjs`. Re-run to reproduce. Human review is still required before publication._",
  );
  lines.push("");
  return lines.join("\n");
}

function fmt(v) {
  return v === null || v === undefined ? "—" : String(v);
}

// ---------------------------------------------------------------------------
// I/O layer (not exercised by the offline vitest suite)
// ---------------------------------------------------------------------------

export function loadFixture(nameOrPath) {
  const file = nameOrPath.endsWith(".json")
    ? path.resolve(nameOrPath)
    : path.join(FIXTURES_DIR, `${nameOrPath}.json`);
  const parsed = JSON.parse(fs.readFileSync(file, "utf8"));
  return validateFixture(parsed, path.basename(file));
}

export function listFixtures() {
  if (!fs.existsSync(FIXTURES_DIR)) return [];
  return fs
    .readdirSync(FIXTURES_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, ""))
    .sort();
}

/**
 * Llamar a Gemini como SUJETO de la evaluación.
 *
 * El juez sigue siendo Claude a propósito, incluso cuando el sujeto es Gemini
 * — ver `runFixture`. Esa separación es lo que permite que el loop apruebe sin
 * un humano: mientras el que produce y el que califica sean el mismo modelo,
 * "juez y parte" es una objeción válida; con sujeto y juez distintos, deja de
 * serlo.
 */
async function callGemini(prompt, { apiKey, model, maxTokens = SUBJECT_MAX_TOKENS }) {
  const url = `${GEMINI_URL_BASE}/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const r = await withRetry(() =>
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: maxTokens },
      }),
    }),
  );
  if (!r.ok) {
    const body = await r.text();
    throw new Error(`Gemini HTTP ${r.status}: ${body.slice(0, 200)}`);
  }
  const j = await r.json();
  const text = j?.candidates?.[0]?.content?.parts
    ?.map((p) => p?.text)
    .filter((t) => typeof t === "string")
    .join("");
  if (!text) throw new Error("Gemini reply had no text part");
  return text;
}

/** Despacha al proveedor que se está evaluando. */
async function callSubject(provider, prompt, opts) {
  if (provider === "gemini") {
    return callGemini(prompt, {
      apiKey: opts.geminiApiKey,
      model: opts.geminiModel,
      maxTokens: opts.maxTokens,
    });
  }
  // claude y codex comparten el runtime de Claude para efectos de esta
  // evaluación: codex entrega el mismo SKILL.md por el mismo mecanismo.
  return callClaude(prompt, { apiKey: opts.apiKey, model: opts.model, maxTokens: opts.maxTokens });
}

async function callClaude(prompt, { apiKey, model, maxTokens = SUBJECT_MAX_TOKENS }) {
  const r = await withRetry(() => fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": ANTHROPIC_VERSION,
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    }),
  }));
  if (!r.ok) {
    const body = await r.text();
    throw new Error(`Anthropic HTTP ${r.status}: ${body.slice(0, 200)}`);
  }
  const j = await r.json();
  const block = Array.isArray(j.content) ? j.content.find((b) => b.type === "text") : null;
  if (!block || typeof block.text !== "string") {
    throw new Error("Anthropic reply had no text block");
  }
  return block.text;
}

function readJsonFile(p) {
  const resolved = path.isAbsolute(p) ? p : path.resolve(p);
  return JSON.parse(fs.readFileSync(resolved, "utf8"));
}

/**
 * Run one fixture. In DRY_RUN, subject answers and judge verdicts are read
 * from fixture files instead of the network — this is what makes the harness
 * testable and CI-safe. Otherwise it calls Claude for both subject runs and
 * the judge, per case.
 */
export async function runFixture(fixture, opts) {
  const { dryRun, answers, judged, apiKey, model } = opts;
  // Qué modelo RESPONDE. El que JUZGA es siempre Claude — ver callSubject.
  const subjectProvider = opts.subjectProvider || "claude";
  const results = [];
  for (const c of fixture.cases) {
    try {
      let baselineAnswer;
      let skillAnswer;
      if (dryRun) {
        const a = answers?.[c.id];
        if (!a || typeof a.baseline !== "string" || typeof a.skill !== "string") {
          throw new Error("DRY_RUN answers missing baseline/skill for case");
        }
        baselineAnswer = a.baseline;
        skillAnswer = a.skill;
      } else {
        baselineAnswer = await callSubject(
          subjectProvider,
          buildSubjectPrompt(fixture.baselinePrompt, c.input),
          opts,
        );
        skillAnswer = await callSubject(
          subjectProvider,
          buildSubjectPrompt(opts.skillPrompt ?? fixture.skillPrompt, c.input),
          opts,
        );
      }

      let verdict;
      if (dryRun) {
        const raw = judged?.[c.id];
        if (!raw) throw new Error("DRY_RUN judge verdict missing for case");
        verdict = parseJudge(typeof raw === "string" ? raw : JSON.stringify(raw));
      } else {
        const judgeText = await callClaude(buildJudgePrompt(c, baselineAnswer, skillAnswer), {
          apiKey,
          model,
          maxTokens: 600,
        });
        verdict = parseJudge(judgeText);
      }
      results.push({ id: c.id, type: c.type, verdict });
    } catch (err) {
      results.push({ id: c.id, type: c.type, error: err.message });
    }
  }
  return results;
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

async function main() {
  const argv = process.argv.slice(2);
  const outIdx = argv.indexOf("--out");
  const outPath = outIdx !== -1 ? argv[outIdx + 1] : null;
  const positional = parsePositional(argv);

  const dryRun = process.env.DRY_RUN === "1" || process.env.DRY_RUN === "true";
  const model = DEFAULT_MODEL;

  // Qué modelo RESPONDE. El juez es siempre Claude, incluso acá.
  const provIdx = argv.indexOf("--provider");
  const subjectProvider =
    (provIdx !== -1 ? argv[provIdx + 1] : process.env.SKILLS_EVAL_PROVIDER) || "claude";
  if (!SUBJECT_PROVIDERS.includes(subjectProvider)) {
    process.stderr.write(
      `--provider inválido: "${subjectProvider}". Opciones: ${SUBJECT_PROVIDERS.join(", ")}\n`,
    );
    process.exit(1);
  }
  const geminiModel = DEFAULT_GEMINI_MODEL;
  // `--local`: medir el SKILL.md del repo antes de publicarlo.
  const useLocal = argv.includes("--local");

  let answers = null;
  let judged = null;
  let apiKey = null;
  let geminiApiKey = null;
  if (dryRun) {
    if (process.env.DRY_RUN_ANSWERS_FILE) answers = readJsonFile(process.env.DRY_RUN_ANSWERS_FILE);
    if (process.env.DRY_RUN_JUDGE_FILE) judged = readJsonFile(process.env.DRY_RUN_JUDGE_FILE);
  } else {
    // Siempre hace falta: el juez es Claude para cualquier sujeto.
    apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      process.stderr.write("ANTHROPIC_API_KEY is required (or set DRY_RUN=1 with fixture files)\n");
      process.exit(1);
    }
    if (subjectProvider === "gemini") {
      geminiApiKey = process.env.GEMINI_API_KEY;
      if (!geminiApiKey) {
        process.stderr.write("GEMINI_API_KEY is required when --provider gemini\n");
        process.exit(1);
      }
    }
  }

  const names = positional.length ? positional : listFixtures();
  if (!names.length) {
    process.stderr.write("No fixtures found in scripts/skills-eval/fixtures/\n");
    process.exit(1);
  }

  let anyFailure = false;
  for (const name of names) {
    const fixture = loadFixture(name);
    process.stderr.write(`\n[skills-eval] ${fixture.skill}: ${fixture.cases.length} cases${dryRun ? " (DRY_RUN)" : ""}\n`);

    // El prompt de la skill sale del SKILL.md publicado, no de la paráfrasis
    // del fixture. Ver `resolveSkillPrompt` para por qué.
    let skillPrompt = fixture.skillPrompt;
    let promptSource = "fixture (override)";
    if (!dryRun) {
      const md = useLocal
        ? readLocalSkillMd(fixture.skill)
        : await fetchSkillMd(fixture.skill).catch(() => null);
      skillPrompt = resolveSkillPrompt(fixture, md);
      promptSource = md
        ? useLocal
          ? "SKILL.md LOCAL del repo (sin publicar)"
          : "SKILL.md del catálogo"
        : "fixture (no se encontró el SKILL.md)";
      process.stderr.write(`[skills-eval] ${fixture.skill}: prompt = ${promptSource}\n`);
    }
    // Varias corridas y decisión por mediana: una sola es un sorteo en el
    // margen (ver DEFAULT_RUNS). En DRY_RUN una alcanza — no hay varianza.
    const runs = dryRun ? 1 : Number(process.argv[process.argv.indexOf("--runs") + 1]) || DEFAULT_RUNS;
    const perRun = [];
    let results = [];
    for (let i = 0; i < runs; i++) {
      results = await runFixture(fixture, {
        dryRun,
        answers,
        judged,
        apiKey,
        model,
        subjectProvider,
        geminiApiKey,
        geminiModel,
        skillPrompt,
      });
      perRun.push(aggregate(results));
      if (runs > 1) {
        const r = perRun[i];
        process.stderr.write(
          `[skills-eval] ${fixture.skill}: corrida ${i + 1}/${runs} — meets ${r.meetsExpected}/${r.scored} · skill ${fmt(r.avgSkill)}\n`,
        );
      }
    }
    const summary = runs > 1 ? medianSummary(perRun) : perRun[0];
    const verdict = decideVerdict(summary);
    const md = renderMarkdown(fixture, results, summary, {
      model: dryRun ? null : model,
      mode: dryRun ? "DRY_RUN (offline fixtures)" : "live",
      subjectProvider,
      promptSource,
      verdict,
    });

    const target =
      outPath && names.length === 1
        ? outPath
        : path.join("docs", "skills-evals", `${fixture.skill}.md`);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, md);
    process.stderr.write(
      `[skills-eval] ${fixture.skill}: baseline ${fmt(summary.avgBaseline)} vs skill ${fmt(
        summary.avgSkill,
      )} · meets ${summary.meetsExpected}/${summary.scored} · beats ${summary.beatsBaseline}/${summary.scored} → ${target}\n`,
    );
    process.stderr.write(
      `[skills-eval] ${fixture.skill} en ${subjectProvider}: ${
        verdict.approved ? "APROBADA" : `NO aprobada — ${verdict.reasons.join("; ")}`
      }\n`,
    );
    if (summary.errors > 0) anyFailure = true;
  }

  // Non-zero exit only on harness errors (API/parse failures), never as an
  // automated "verdict": the pass/fail decision is human review's, not ours.
  process.exit(anyFailure ? 2 : 0);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main().catch((err) => {
    process.stderr.write(`[skills-eval] fatal: ${err.stack || err.message}\n`);
    process.exit(1);
  });
}
