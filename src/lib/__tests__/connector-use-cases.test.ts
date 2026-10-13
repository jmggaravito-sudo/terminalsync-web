import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Every connector ficha carries its use cases: the "What you can ask" /
 * "Qué le puedes pedir" section is what the landing and the app show as the
 * connector's use cases. The integration pipeline requires it (build.md/review.md);
 * this test keeps it true for every ficha so the pipeline cannot ship without it.
 */
const ROOT = path.resolve(__dirname, "../../..");
const HEADINGS: Record<string, RegExp> = {
  en: /^### What you can ask( it)?\s*$/m,
  es: /^### Qué (le )?puedes (pedir|preguntar)\s*$/m,
};
// Fichas that predate the rule. Remove an entry when its section is added; never add one.
const LEGACY_WITHOUT_USE_CASES = new Set(["gdrive", "kit", "sqlite", "vercel", "whatsapp"]);

function useCases(body: string, heading: RegExp): string[] {
  const match = heading.exec(body);
  if (!match) return [];
  const rest = body.slice(match.index + match[0].length);
  const end = rest.search(/^### /m);
  const section = end === -1 ? rest : rest.slice(0, end);
  return section.split("\n").filter((l) => /^[-*]\s+\S/.test(l));
}

describe("connector use cases", () => {
  for (const lang of ["en", "es"] as const) {
    const dir = path.join(ROOT, "content/connectors", lang);
    for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".md"))) {
      const slug = file.slice(0, -3);
      if (LEGACY_WITHOUT_USE_CASES.has(slug)) continue;
      it(`${lang}/${slug} lists 3 to 8 use cases`, () => {
        const cases = useCases(fs.readFileSync(path.join(dir, file), "utf8"), HEADINGS[lang]);
        expect(cases.length, `${lang}/${slug} needs a use-cases section`).toBeGreaterThanOrEqual(3);
        expect(cases.length).toBeLessThanOrEqual(8);
      });
    }
  }
});
