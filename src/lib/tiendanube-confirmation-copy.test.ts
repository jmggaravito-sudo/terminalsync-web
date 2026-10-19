import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("Tiendanube approval disclosure", () => {
  for (const kind of ["connectors", "plugins"]) {
    for (const lang of ["en", "es"]) {
      it(`${kind}/${lang} requires specific approval without inventing a server gate`, () => {
        const text = readFileSync(path.join(process.cwd(), "content", kind, lang, "tiendanube.md"), "utf8");
        expect(text).toContain("https://nuvemshop.dev/en-US/ai-agents/mcps");
        if (lang === "en") {
          expect(text).toContain("explicitly approve");
          expect(text).toContain("does not establish a server-enforced confirmation screen");
          expect(text).not.toMatch(/go through a confirmation step|requires your approval through the connector's confirmation step/);
        } else {
          expect(text).toContain("aprueba expresamente");
          expect(text).toContain("no acredita una pantalla de confirmación obligatoria del servidor");
          expect(text).not.toMatch(/pasan por un paso de confirmación|requiere tu aprobación por el paso de confirmación del conector/);
        }
      });
    }
  }
});
