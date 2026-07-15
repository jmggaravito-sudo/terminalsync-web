import { describe, it, expect } from "vitest";
import {
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
    f.skillPrompt = "   ";
    expect(() => validateFixture(f)).toThrow(/skillPrompt/);
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
