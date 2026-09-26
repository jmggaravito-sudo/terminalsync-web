import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { CHROME_EXTENSION_PUBLIC } from "./launchFlags";

const src = (rel: string) =>
  readFileSync(path.resolve(__dirname, "..", rel), "utf8");

/**
 * Un interruptor apagado no sirve de nada si alguna de las dos mitades sigue
 * prendida: la sección que ofrece la extensión y el enlace del pie que lleva
 * hasta ella. Este test mira el código fuente a propósito — el proyecto corre
 * los tests en Node, sin navegador, así que no hay forma de renderizar la
 * portada acá. Lo que se puede garantizar sin navegador es que las dos mitades
 * sigan atadas al mismo interruptor, y es lo que se garantiza.
 */
describe("la extensión de Chrome está apagada en el sitio", () => {
  it("el interruptor está en falso", () => {
    expect(CHROME_EXTENSION_PUBLIC).toBe(false);
  });

  it("la portada no pinta la sección sin el interruptor", () => {
    const page = src("app/[lang]/page.tsx");
    expect(page).toContain("CHROME_EXTENSION_PUBLIC && <ChromeExtensionTeaser");
  });

  it("el pie no ofrece el enlace sin el interruptor", () => {
    const footer = src("components/landing/Footer.tsx");
    const linea = footer.indexOf('key: "chrome-extension"');
    expect(linea).toBeGreaterThan(-1);
    // El enlace tiene que vivir adentro del spread condicional, no suelto en
    // la lista: si alguien lo saca de ahí, el pie vuelve a mandar a una
    // sección que no se pinta. Se busca el spread, no el nombre del
    // interruptor, porque el nombre también aparece en el import de arriba y
    // eso pasaría aunque el enlace estuviera suelto.
    const spread = footer.indexOf("...(CHROME_EXTENSION_PUBLIC");
    expect(spread).toBeGreaterThan(-1);
    expect(spread).toBeLessThan(linea);
    // Y el enlace tiene que quedar adentro de ese bloque, no después de que
    // cierre.
    const cierre = footer.indexOf(": []),", spread);
    expect(cierre).toBeGreaterThan(linea);
  });
});
