import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

/**
 * El texto de la TARJETA de cada ficha — `tagline` y `description` — es lo
 * único que el cliente lee en el explorador de Integraciones antes de
 * decidir. Este guardia cubre ese texto y nada más.
 *
 * Nace de un hallazgo del 6 de octubre de 2026: JM abrió la tarjeta de XLSX
 * y su descripción decía **"Viene nativo con Claude"**. Estaba en cuatro
 * fichas (docx, pdf, pptx, xlsx), y tenía tres problemas a la vez:
 *
 *   1. Le nombra el proveedor al cliente, que es justo lo que el producto
 *      decidió no hacer. La app no nombra modelos; el bot de soporte lo
 *      tiene prohibido en su catálogo de conocimiento y en el testigo de su
 *      deploy. El catálogo era la única superficie sin esa regla.
 *   2. **Para la mayoría era falso.** El ledger de uso dice que los turnos
 *      de chat corren sobre el modelo de la IA incluida, no sobre Claude.
 *      Solo era cierto para quien conectó su propia cuenta, que es el camino
 *      de Opciones avanzadas.
 *   3. La tarjeta se contradecía: "no hay nada que instalar" arriba y
 *      "arrastra este ítem para instalarlo" en el pie.
 *
 * El trinquete de voz (`voz-neutral-catalogo.test.ts`) ya cubre el voseo del
 * catálogo, con su deuda congelada. Este cubre otra cosa, en una superficie
 * más chica, y por eso **no necesita deuda**: al escribirlo, los 193 textos
 * de tarjeta ya estaban limpios.
 *
 * Deliberadamente NO mira el cuerpo de las fichas. Ahí quedan 59 que nombran
 * un proveedor, y eso es un barrido de copy aparte. Un guardia que nace con
 * 59 excepciones no frena nada.
 */

/** Marcas de modelo o proveedor. `vendors:` y `compatibleWith:` son
 *  metadatos de la ficha y no se miran: lo que se mira es el copy. */
const PROVEEDOR = /\b(Claude|ChatGPT|GPT-?\d|Gemini|OpenAI|Anthropic|GLM|Copilot)\b/;

/** Palabras de programador que no van en copy para un director. En español
 *  se suman las intrusiones del inglés; en inglés, "charts" o "slides" son
 *  palabras normales y no entran. */
const JERGA: Record<string, RegExp> = {
  es: /\b(workbooks?|charts?|inputs?|outputs?|deck|layouts?|templates?|speaker|slides?|headers?|endpoints?|webhooks?|shippear|parsear|deployar|hardcodead\w*)\b/i,
  en: /\b(hardcoded|endpoints?|webhooks?|SDK|stdout|regex)\b/i,
};

type Tarjeta = { archivo: string; idioma: string; campo: string; texto: string };

function tarjetas(): Tarjeta[] {
  const out: Tarjeta[] = [];
  const raiz = "content";
  if (!existsSync(raiz)) return out;
  for (const grupo of readdirSync(raiz)) {
    for (const idioma of ["es", "en"]) {
      const dir = join(raiz, grupo, idioma);
      if (!existsSync(dir)) continue;
      for (const nombre of readdirSync(dir)) {
        if (!nombre.endsWith(".md")) continue;
        const archivo = join(dir, nombre);
        const crudo = readFileSync(archivo, "utf8");
        const fm = /^---\n([\s\S]*?)\n---\n/.exec(crudo);
        if (!fm) continue;
        for (const campo of ["tagline", "description"]) {
          const v = new RegExp(`^${campo}:\\s*"(.*)"\\s*$`, "m").exec(fm[1]);
          if (v) out.push({ archivo, idioma, campo, texto: v[1] });
        }
      }
    }
  }
  return out.sort((a, b) => a.archivo.localeCompare(b.archivo));
}

const TARJETAS = tarjetas();

describe("el texto de las tarjetas del catálogo", () => {
  it("encuentra tarjetas que revisar (si no, el guardia no está mirando nada)", () => {
    expect(TARJETAS.length).toBeGreaterThan(100);
  });

  it("no le nombra ningún modelo ni proveedor de IA al cliente", () => {
    const h = TARJETAS.filter((t) => PROVEEDOR.test(t.texto)).map(
      (t) => `${t.archivo} [${t.campo}] «${PROVEEDOR.exec(t.texto)?.[0]}» — ${t.texto.slice(0, 70)}`,
    );
    expect(
      h,
      `El catálogo no nombra proveedores: el cliente con la IA incluida no está usando lo que la tarjeta dice.\n` +
        `Si la ficha necesita aclarar que no hay que instalar nada, alcanza con "Ya viene incluido".\n${h.join("\n")}`,
    ).toEqual([]);
  });

  it("no usa jerga de programador", () => {
    const h = TARJETAS.filter((t) => JERGA[t.idioma]?.test(t.texto)).map(
      (t) => `${t.archivo} [${t.campo}] «${JERGA[t.idioma].exec(t.texto)?.[0]}» — ${t.texto.slice(0, 70)}`,
    );
    expect(
      h,
      `El cliente de TS es un director que no usa terminal. "gráficos" y no "charts", ` +
        `"diapositiva" y no "slide", "datos" y no "inputs".\n${h.join("\n")}`,
    ).toEqual([]);
  });

  it("los patrones distinguen el copy de los metadatos y del inglés legítimo", () => {
    // Si estos se rompen, el guardia se volvió inservible en una de las dos
    // direcciones: o deja pasar lo que debe frenar, o frena lo que no debe.
    expect(PROVEEDOR.test("Viene nativo con Claude; no hay nada que instalar.")).toBe(true);
    expect(PROVEEDOR.test("Ya viene incluido: no hay nada que instalar.")).toBe(false);
    expect(JERGA.es.test("con gráficos y formato condicional")).toBe(false);
    expect(JERGA.es.test("con charts nativos y notas de speaker")).toBe(true);
    // En inglés "charts" y "slides" son palabras de todos los días.
    expect(JERGA.en.test("real formulas, conditional formatting, and charts")).toBe(false);
    expect(JERGA.en.test("instead of shipping hardcoded numbers")).toBe(true);
  });
});
