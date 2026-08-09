import { describe, it, expect } from "vitest";
import {
  evidenciaInvalida,
  decideVerdict,
  resolveSkillPrompt,
  skillBody,
  parsePositional,
  validateFixture,
  buildSubjectPrompt,
  buildJudgePrompt,
  parseJudge,
  aggregate,
  renderMarkdown,
  runFixture,
} from "./run-evals.mjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadCodeReviewer() {
  return JSON.parse(
    fs.readFileSync(path.join(__dirname, "fixtures", "code-reviewer.json"), "utf8"),
  );
}

describe("validateFixture", () => {
  it("accepts the shipped code-reviewer fixture", () => {
    expect(() => validateFixture(loadCodeReviewer(), "code-reviewer.json")).not.toThrow();
  });

  it("rejects fewer than 5 cases", () => {
    const f = loadCodeReviewer();
    f.cases = f.cases.slice(0, 4);
    expect(() => validateFixture(f)).toThrow(/at least 5 cases/);
  });

  it("rejects missing coverage (no refusal case)", () => {
    const f = loadCodeReviewer();
    // Flip the single refusal case to normal → coverage requirement breaks.
    for (const c of f.cases) if (c.type === "refusal") c.type = "normal";
    expect(() => validateFixture(f)).toThrow(/coverage/);
  });

  it("rejects duplicate case ids", () => {
    const f = loadCodeReviewer();
    f.cases[1].id = f.cases[0].id;
    expect(() => validateFixture(f)).toThrow(/duplicate case id/);
  });

  it("rejects an unknown case type", () => {
    const f = loadCodeReviewer();
    f.cases[0].type = "weird";
    expect(() => validateFixture(f)).toThrow(/type/);
  });

  it("rejects an empty required string field", () => {
    const f = loadCodeReviewer();
    f.baselinePrompt = "   ";
    expect(() => validateFixture(f)).toThrow(/baselinePrompt/);
  });

  it("acepta un fixture SIN skillPrompt — el default es el SKILL.md del catálogo", () => {
    // Dejó de ser obligatorio a propósito: la paráfrasis escrita a mano era
    // justamente lo que hacía que el harness midiera el resumen y no la skill.
    const f = loadCodeReviewer();
    delete f.skillPrompt;
    expect(() => validateFixture(f)).not.toThrow();
  });
});

describe("buildSubjectPrompt", () => {
  it("embeds the variant prompt and the case input", () => {
    const p = buildSubjectPrompt("Use Code Reviewer.", "diff goes here");
    expect(p).toContain("Use Code Reviewer.");
    expect(p).toContain("diff goes here");
    expect(p).toContain("--- INPUT ---");
  });
});

describe("buildJudgePrompt", () => {
  it("includes both answers, the expected behavior, and demands JSON only", () => {
    const c = { id: "x", type: "refusal", input: "do bad thing", expected: "refuse it" };
    const p = buildJudgePrompt(c, "BASE_ANS", "SKILL_ANS");
    expect(p).toContain("BASE_ANS");
    expect(p).toContain("SKILL_ANS");
    expect(p).toContain("refuse it");
    expect(p).toContain("refusal");
    expect(p).toMatch(/ONLY a JSON object/i);
  });
});

describe("parseJudge", () => {
  it("parses a clean JSON verdict", () => {
    const v = parseJudge(
      JSON.stringify({
        baselineScore: 4,
        skillScore: 9,
        skillMeetsExpected: true,
        beatsBaseline: true,
        notes: "sharper",
      }),
    );
    expect(v).toEqual({
      baselineScore: 4,
      skillScore: 9,
      skillMeetsExpected: true,
      beatsBaseline: true,
      notes: "sharper",
    });
  });

  it("tolerates surrounding prose / code fences", () => {
    const v = parseJudge('Here is my verdict:\n```json\n{"skillScore": 8, "beatsBaseline": true}\n```\nthanks');
    expect(v.skillScore).toBe(8);
    expect(v.beatsBaseline).toBe(true);
    expect(v.skillMeetsExpected).toBe(false); // defaults false when absent
  });

  it("clamps out-of-range scores to 0-10", () => {
    const v = parseJudge('{"baselineScore": -3, "skillScore": 42}');
    expect(v.baselineScore).toBe(0);
    expect(v.skillScore).toBe(10);
  });

  it("nulls non-numeric scores instead of NaN", () => {
    const v = parseJudge('{"skillScore": "n/a"}');
    expect(v.skillScore).toBeNull();
  });

  it("throws when there is no JSON object", () => {
    expect(() => parseJudge("no json here")).toThrow(/no JSON/);
  });

  it("treats only literal true as true (string 'true' is false)", () => {
    const v = parseJudge('{"beatsBaseline": "true", "skillMeetsExpected": 1}');
    expect(v.beatsBaseline).toBe(false);
    expect(v.skillMeetsExpected).toBe(false);
  });
});

describe("aggregate", () => {
  it("computes averages and counts, ignoring errored cases", () => {
    const results = [
      { id: "a", type: "normal", verdict: { baselineScore: 4, skillScore: 8, skillMeetsExpected: true, beatsBaseline: true } },
      { id: "b", type: "normal", verdict: { baselineScore: 6, skillScore: 6, skillMeetsExpected: true, beatsBaseline: false } },
      { id: "c", type: "refusal", error: "boom" },
    ];
    const s = aggregate(results);
    expect(s.total).toBe(3);
    expect(s.scored).toBe(2);
    expect(s.errors).toBe(1);
    expect(s.avgBaseline).toBe(5);
    expect(s.avgSkill).toBe(7);
    expect(s.meetsExpected).toBe(2);
    expect(s.beatsBaseline).toBe(1);
  });

  it("handles an all-errors run without dividing by zero", () => {
    const s = aggregate([{ id: "a", type: "normal", error: "x" }]);
    expect(s.scored).toBe(0);
    expect(s.avgBaseline).toBeNull();
    expect(s.avgSkill).toBeNull();
    expect(s.beatsBaseline).toBe(0);
  });
});

describe("renderMarkdown", () => {
  const fixture = { skill: "code-reviewer", name: "Code Reviewer", cases: [] };
  const results = [
    { id: "a", type: "normal", verdict: { baselineScore: 4, skillScore: 9, skillMeetsExpected: true, beatsBaseline: true, notes: "n1" } },
    { id: "b", type: "refusal", error: "HTTP 500" },
  ];
  const summary = aggregate(results);

  it("carries the evidence-not-verdict disclaimer", () => {
    const md = renderMarkdown(fixture, results, summary);
    expect(md).toMatch(/Evidence, not a verdict/i);
    expect(md).toMatch(/human review/i);
    expect(md).toContain("content/skills/RULES.md");
  });

  it("renders a row per case and surfaces errors", () => {
    const md = renderMarkdown(fixture, results, summary, { model: "claude-opus-4-8", mode: "live" });
    expect(md).toContain("| a | normal |");
    expect(md).toContain("⚠️ error");
    expect(md).toContain("HTTP 500");
    expect(md).toContain("`claude-opus-4-8`");
  });

  it("never leaks an API-key-looking token", () => {
    const md = renderMarkdown(fixture, results, summary, { model: "claude-opus-4-8", mode: "live" });
    expect(md).not.toMatch(/sk-ant-/);
  });
});

describe("runFixture (DRY_RUN, offline)", () => {
  it("produces one verdict per case from fixture answers + judge maps", async () => {
    const fixture = validateFixture(loadCodeReviewer());
    const answers = {};
    const judged = {};
    for (const c of fixture.cases) {
      answers[c.id] = { baseline: "weak generic answer", skill: "sharp skill answer" };
      judged[c.id] = {
        baselineScore: 4,
        skillScore: 9,
        skillMeetsExpected: true,
        beatsBaseline: true,
        notes: `ok ${c.id}`,
      };
    }
    const results = await runFixture(fixture, { dryRun: true, answers, judged });
    expect(results).toHaveLength(fixture.cases.length);
    for (const r of results) {
      expect(r.error).toBeUndefined();
      expect(r.verdict.skillScore).toBe(9);
    }
    const s = aggregate(results);
    expect(s.beatsBaseline).toBe(fixture.cases.length);
  });

  it("records a per-case error when a DRY_RUN answer is missing", async () => {
    const fixture = validateFixture(loadCodeReviewer());
    const results = await runFixture(fixture, { dryRun: true, answers: {}, judged: {} });
    expect(results.every((r) => typeof r.error === "string")).toBe(true);
    // A missing-answer run must not crash aggregate/render.
    const s = aggregate(results);
    expect(s.scored).toBe(0);
    expect(s.errors).toBe(fixture.cases.length);
  });
});

// ── Veredicto automático (decisión JM 2026-08-07: aprueba el loop) ──────────

describe("decideVerdict", () => {
  const ok = {
    total: 5,
    scored: 5,
    errors: 0,
    avgBaseline: 5,
    avgSkill: 8.4,
    meetsExpected: 5,
    beatsBaseline: 4,
  };

  it("aprueba cuando cumple todo el umbral", () => {
    expect(decideVerdict(ok)).toEqual({ approved: true, reasons: [] });
  });

  it("rechaza si algún caso no pudo evaluarse", () => {
    // Un error no es "neutro": es un caso sin evidencia, y sin evidencia no
    // se aprueba.
    const v = decideVerdict({ ...ok, errors: 1 });
    expect(v.approved).toBe(false);
    expect(v.reasons.join(" ")).toMatch(/error/i);
  });

  it("rechaza si un solo caso no cumple lo esperado", () => {
    const v = decideVerdict({ ...ok, meetsExpected: 4 });
    expect(v.approved).toBe(false);
    expect(v.reasons.join(" ")).toMatch(/4\/5/);
  });

  it("rechaza si no le gana al baseline en la mayoría", () => {
    const v = decideVerdict({ ...ok, beatsBaseline: 2 });
    expect(v.approved).toBe(false);
    expect(v.reasons.join(" ")).toMatch(/baseline/i);
  });

  it("rechaza si cumple pero con respuestas mediocres", () => {
    // "Cumple lo esperado" no puede tapar un 6/10 — por eso el piso de score
    // es un criterio aparte.
    const v = decideVerdict({ ...ok, avgSkill: 6.2 });
    expect(v.approved).toBe(false);
    expect(v.reasons.join(" ")).toMatch(/promedio/i);
  });

  it("rechaza con menos casos que el mínimo", () => {
    const v = decideVerdict({ ...ok, total: 3, scored: 3, meetsExpected: 3, beatsBaseline: 3 });
    expect(v.approved).toBe(false);
    expect(v.reasons.join(" ")).toMatch(/casos/i);
  });

  it("rechaza cuando nada llegó a calificarse", () => {
    const v = decideVerdict({ total: 5, scored: 0, errors: 5, avgBaseline: null, avgSkill: null, meetsExpected: 0, beatsBaseline: 0 });
    expect(v.approved).toBe(false);
  });

  it("acumula todos los motivos, no solo el primero", () => {
    const v = decideVerdict({ ...ok, meetsExpected: 3, beatsBaseline: 1, avgSkill: 4 });
    expect(v.reasons.length).toBeGreaterThanOrEqual(3);
  });

  it("consume la salida REAL de aggregate — un rename no puede desactivar el umbral en silencio", () => {
    // El umbral de score lee `summary.avgSkill`. Si aggregate lo renombra,
    // `undefined < 7` es false y la comprobación se apaga sola: el harness
    // empezaría a aprobar de más sin que falle nada. Este test ata las dos
    // funciones para que eso no pueda pasar sin ponerse rojo.
    const mediocre = Array.from({ length: 5 }, (_, i) => ({
      id: `c${i}`,
      verdict: { baselineScore: 5, skillScore: 5, skillMeetsExpected: true, beatsBaseline: true },
    }));
    const summary = aggregate(mediocre);
    expect(summary.avgSkill).toBe(5);
    const v = decideVerdict(summary);
    expect(v.approved, "un promedio de 5/10 no puede aprobar").toBe(false);
    expect(v.reasons.join(" ")).toMatch(/promedio/i);
  });
});

describe("parsePositional", () => {
  it("no toma el valor de --provider como nombre de fixture", () => {
    // Bug real: con la versión previa, `--provider gemini` hacía que el
    // harness buscara `fixtures/gemini.json` y muriera.
    expect(parsePositional(["code-reviewer", "--provider", "gemini"])).toEqual(["code-reviewer"]);
  });

  it("sigue salteando el valor de --out", () => {
    expect(parsePositional(["code-reviewer", "--out", "r.md"])).toEqual(["code-reviewer"]);
  });

  it("saltea ambos a la vez", () => {
    expect(
      parsePositional(["a", "--provider", "gemini", "b", "--out", "r.md"]),
    ).toEqual(["a", "b"]);
  });

  it("sin flags devuelve todos los nombres", () => {
    expect(parsePositional(["a", "b"])).toEqual(["a", "b"]);
  });
});

describe("resolveSkillPrompt / skillBody", () => {
  const md = `---
name: Ask for Reviews
vendors: ["claude", "codex"]
---
## When to use

Pedile la reseña a quien tuvo una buena experiencia.`;

  it("saca el frontmatter y deja el cuerpo", () => {
    expect(skillBody(md)).toMatch(/^## When to use/);
    expect(skillBody(md)).not.toMatch(/vendors/);
  });

  it("un md sin frontmatter pasa entero", () => {
    expect(skillBody("solo cuerpo")).toBe("solo cuerpo");
  });

  it("prefiere el SKILL.md real sobre la paráfrasis del fixture", () => {
    // Este es el arreglo de fondo: el harness medía la paráfrasis, no la skill.
    const fx = { skill: "s", skillPrompt: "mi paráfrasis" };
    expect(resolveSkillPrompt(fx, md)).toMatch(/^## When to use/);
  });

  it("cae al override del fixture si el catálogo no la sirve", () => {
    const fx = { skill: "s", skillPrompt: "mi paráfrasis" };
    expect(resolveSkillPrompt(fx, null)).toBe("mi paráfrasis");
  });

  it("falla claro si no hay ni SKILL.md ni override — nunca evalúa con prompt vacío", () => {
    expect(() => resolveSkillPrompt({ skill: "s" }, null)).toThrow(/no se pudo obtener/);
    expect(() => resolveSkillPrompt({ skill: "s", skillPrompt: "  " }, "   ")).toThrow();
  });
});

describe("evidenciaInvalida", () => {
  it("frena cuando no hay SKILL.md: se estaría midiendo la paráfrasis del fixture", () => {
    // El caso real: `cotizaciones` sin --local cayó al fixture y aun así
    // imprimió veredicto ("NO aprobada") y escribió el reporte. Un veredicto
    // sobre el prompt equivocado es indistinguible de uno real.
    expect(evidenciaInvalida(null, ["--provider", "gemini"])).toBe(true);
    expect(evidenciaInvalida("", [])).toBe(true);
  });

  it("no frena cuando hay SKILL.md", () => {
    expect(evidenciaInvalida("---\nname: X\n---\ncuerpo", [])).toBe(false);
  });

  it("deja medir el fixture si se pide a propósito", () => {
    expect(evidenciaInvalida(null, ["--allow-fixture-prompt"])).toBe(false);
  });
});
