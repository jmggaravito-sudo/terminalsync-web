import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

/**
 * No ofrecemos traer tu propia IA, así que no la vendemos.
 *
 * JM, 2026-10-07: "yo por ahora no quiero ofrecer eso".
 *
 * El motivo no es de marketing. La app **no permite** conectar una cuenta
 * propia de Claude, Codex o Gemini: el modo avanzado arranca apagado en la
 * build de cliente y no hay forma de prenderlo — la función que lo prende no
 * la llama nadie, y los textos del interruptor existen en las traducciones
 * pero ningún componente los renderiza. La pantalla "Opciones avanzadas de
 * IA" no está construida.
 *
 * Mientras tanto el sitio vendía dos planes enteros sobre esa promesa:
 * "Pro · traes tu IA — $19/mes" y "Max · traes tu IA — $39/mes". Un cliente
 * podía pagar por un camino que no existe.
 *
 * Este guardia cubre los DOS precios retirados y la pantalla que no existe.
 * No cubre el posicionamiento de "3 IAs en paralelo" (la sección MultiAI, la
 * grilla de demos, la Extensión Chrome): eso es una decisión de producto
 * aparte, y la extensión sí hace BYOK de verdad.
 */

/** $19 y $39 eran los planes de traer la propia cuenta. Pide el signo para
 *  no pisar un "19" de una fecha, un porcentaje o un ancho de Tailwind. */
const PRECIO_RETIRADO = /\$\s?(19|39)\b/;

/** Mandar al cliente a una pantalla que no está en su app. */
const PANTALLA_INEXISTENTE = /opciones avanzadas de ia|advanced ai options/i;

const RAIZ = process.cwd();
const EXT = /\.(tsx?|json)$/;
const SALTAR = new Set(["node_modules", ".next", "dist", "__tests__"]);

/** Las rutas de la Extensión Chrome quedan FUERA: es otro producto, con su
 *  propio BYOK real (el usuario pega sus llaves y le paga directo a cada
 *  proveedor). Lo que este guardia protege es lo que se vende de la app. */
const FUERA = [join("src", "app", "api", "extension")];

function recorrer(dir: string): string[] {
  const out: string[] = [];
  for (const nombre of readdirSync(dir)) {
    if (SALTAR.has(nombre)) continue;
    const p = join(dir, nombre);
    if (FUERA.some((f) => relative(RAIZ, p).startsWith(f))) continue;
    if (statSync(p).isDirectory()) out.push(...recorrer(p));
    else if (EXT.test(p) && !p.includes(".test.")) out.push(p);
  }
  return out;
}

function hallazgos(patron: RegExp): string[] {
  const out: string[] = [];
  for (const p of recorrer(join(RAIZ, "src"))) {
    const rel = relative(RAIZ, p);
    readFileSync(p, "utf8")
      .split("\n")
      .forEach((linea, i) => {
        // Las líneas que EXPLICAN que el plan se retiró tienen que poder
        // nombrarlo; lo que se prohíbe es cotizarlo.
        if (/no se ofrece|not offered|retir|se retiró|eran \$|eran las variantes/i.test(linea))
          return;
        const m = patron.exec(linea);
        if (m) out.push(`${rel}:${i + 1}  «${m[0]}»  ${linea.trim().slice(0, 90)}`);
      });
  }
  return out;
}

describe("no vendemos un plan de traer tu propia IA", () => {
  it("encuentra archivos que revisar (si no, el guardia no mira nada)", () => {
    expect(recorrer(join(RAIZ, "src")).length).toBeGreaterThan(50);
  });

  it("no cotiza los planes retirados de $19 ni $39", () => {
    const h = hallazgos(PRECIO_RETIRADO);
    expect(
      h,
      `Precio de un plan que ya no se vende. Los dos planes pagos son Pro $34 y Max $54, ` +
        `los dos con la IA incluida.\n${h.join("\n")}`,
    ).toEqual([]);
  });

  it("no manda al cliente a «Opciones avanzadas de IA», que no está en su app", () => {
    const h = hallazgos(PANTALLA_INEXISTENTE);
    expect(
      h,
      `Esa pantalla no existe en la build de cliente: mandarlo ahí lo deja buscando ` +
        `algo que no está.\n${h.join("\n")}`,
    ).toEqual([]);
  });

  it("los patrones no confunden un 19 cualquiera con un precio", () => {
    expect(PRECIO_RETIRADO.test("w-19 h-39")).toBe(false);
    expect(PRECIO_RETIRADO.test("2026-10-19")).toBe(false);
    expect(PRECIO_RETIRADO.test("ahorra un 39% al año")).toBe(false);
    expect(PRECIO_RETIRADO.test('price: "$19"')).toBe(true);
    expect(PRECIO_RETIRADO.test("Max ($39) es para power users")).toBe(true);
  });
});
