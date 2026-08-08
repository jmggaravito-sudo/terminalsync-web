import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

/**
 * `content/skills/RULES.md` § Cross-provider coverage es explícito:
 * `compatibleWith` es una promesa al usuario, y una skill solo puede declarar
 * un proveedor cuando existe **entrega real** y **evidencia de evals en ese
 * proveedor**. No basta con que el camino técnico exista.
 *
 * Este test lo vuelve mecánico para Gemini. Sin él, la regla depende de que
 * alguien la recuerde — y ya vimos a dónde lleva eso: el catálogo estuvo
 * declarando cosas que la app no entregaba, y la app pidiendo skills que el
 * catálogo no servía.
 *
 * Si agregás `gemini` a una skill, corré primero:
 *   GEMINI_API_KEY=... ANTHROPIC_API_KEY=... \
 *     node scripts/skills-eval/run-evals.mjs <slug> --provider gemini \
 *       --out docs/skills-evals/<slug>.md
 */
const SKILLS_DIR = path.join(process.cwd(), "content", "skills");
const EVALS_DIR = path.join(process.cwd(), "docs", "skills-evals");

function declaresGemini(file: string): boolean {
  const { data } = matter(fs.readFileSync(file, "utf8"));
  const lists = [data.vendors, data.compatibleWith].filter(Array.isArray) as string[][];
  return lists.some((l) => l.includes("gemini"));
}

function skillsDeclaringGemini(lang: string): string[] {
  const dir = path.join(SKILLS_DIR, lang);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .filter((f) => declaresGemini(path.join(dir, f)))
    .map((f) => f.replace(/\.md$/, ""));
}

describe("declarar gemini exige evidencia", () => {
  it("toda skill que declara gemini tiene su reporte de evals", () => {
    const missing: string[] = [];
    for (const slug of skillsDeclaringGemini("es")) {
      if (!fs.existsSync(path.join(EVALS_DIR, `${slug}.md`))) missing.push(slug);
    }
    expect(
      missing,
      `Declaran gemini sin reporte en docs/skills-evals/:\n  ${missing.join("\n  ")}`,
    ).toEqual([]);
  });

  it("el reporte dice que fue evaluada EN gemini y que aprobó", () => {
    const bad: string[] = [];
    for (const slug of skillsDeclaringGemini("es")) {
      const f = path.join(EVALS_DIR, `${slug}.md`);
      if (!fs.existsSync(f)) continue;
      const txt = fs.readFileSync(f, "utf8");
      // Un reporte de otro proveedor no habilita a declarar gemini.
      if (!/sujeto\)?:\s*`gemini`/.test(txt)) bad.push(`${slug}: el reporte no es de gemini`);
      else if (!/APROBADA por el loop/.test(txt)) bad.push(`${slug}: el reporte no aprueba`);
    }
    expect(bad, `Evidencia insuficiente:\n  ${bad.join("\n  ")}`).toEqual([]);
  });

  it("ES y EN declaran lo mismo — la paridad de idiomas es estricta", () => {
    const es = new Set(skillsDeclaringGemini("es"));
    const en = new Set(skillsDeclaringGemini("en"));
    const soloEs = [...es].filter((s) => !en.has(s));
    const soloEn = [...en].filter((s) => !es.has(s));
    expect({ soloEs, soloEn }).toEqual({ soloEs: [], soloEn: [] });
  });
});
