// Cobertura de fixtures: que cada skill publicada tenga con qué evaluarse, y
// que ningún fixture esté roto. Offline — lee el contenido del repo, no la red.
//
// Por qué existe: el harness solo puede aprobar una skill si tiene casos. Sin
// esto, publicar una skill sin fixture pasa desapercibido y el loop nunca
// puede darle un veredicto — queda en un limbo silencioso.
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { listFixtures, loadFixture, validateFixture } from "./run-evals.mjs";

/** Vienen con Claude Code (el endpoint las rechaza con 409 `included`). No hay
 *  SKILL.md nuestro que entregar ni evaluar. */
const NATIVE = new Set(["docx", "pdf", "pptx", "xlsx"]);

function publishedSkills() {
  const dir = path.join(process.cwd(), "content", "skills", "es");
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const slug = f.replace(/\.md$/, "");
      const { data } = matter(fs.readFileSync(path.join(dir, f), "utf8"));
      return { slug, data };
    })
    .filter(({ slug, data }) => {
      if (NATIVE.has(slug)) return false;
      // `catalogReady: false` = staged, el catálogo no la sirve todavía.
      if (data.catalogReady === false) return false;
      if (data.hidden === true) return false;
      return data.status === "available";
    })
    .map(({ slug }) => slug);
}

describe("cobertura de fixtures", () => {
  it("todos los fixtures del repo son válidos", () => {
    const broken = [];
    for (const name of listFixtures()) {
      try {
        validateFixture(loadFixture(name), name);
      } catch (e) {
        broken.push(`${name}: ${e.message}`);
      }
    }
    expect(broken, `fixtures rotos:\n  ${broken.join("\n  ")}`).toEqual([]);
  });

  it("toda skill publicada tiene fixture — sin casos, el loop no puede aprobarla", () => {
    const have = new Set(listFixtures());
    const missing = publishedSkills().filter((s) => !have.has(s));
    expect(
      missing,
      `Estas skills están publicadas pero no tienen fixture, así que el loop ` +
        `no puede darles veredicto:\n  ${missing.join("\n  ")}`,
    ).toEqual([]);
  });

  it("cada fixture cubre los tres tipos que pide RULES.md", () => {
    // validateFixture ya lo exige; esto lo deja explícito por si el umbral
    // de validate se afloja alguna vez.
    for (const name of listFixtures()) {
      const fx = loadFixture(name);
      const types = fx.cases.map((c) => c.type);
      expect(types.filter((t) => t === "normal").length, `${name}: normales`).toBeGreaterThanOrEqual(3);
      expect(types.filter((t) => t === "ambiguous").length, `${name}: ambiguo`).toBeGreaterThanOrEqual(1);
      expect(types.filter((t) => t === "refusal").length, `${name}: rechazo`).toBeGreaterThanOrEqual(1);
    }
  });
});
