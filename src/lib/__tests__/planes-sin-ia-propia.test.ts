import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

/**
 * El sitio no ofrece traer tu propia IA, y en esta primera etapa tampoco
 * menciona que se trabaje con varias.
 *
 * JM, 2026-10-07: "yo por ahora no quiero ofrecer eso" y, después, "saca lo
 * de las 3 IAs también… en esta primera etapa no quiero mencionar nada de
 * eso".
 *
 * El motivo no es de marketing. La app **no permite** conectar una cuenta
 * propia de Claude, Codex o Gemini: el modo avanzado arranca apagado en la
 * build de cliente y no hay forma de prenderlo — la función que lo prende no
 * la llama nadie, y los textos del interruptor existen en las traducciones
 * pero ningún componente los renderiza. La pantalla "Opciones avanzadas de
 * IA" no está construida. Mientras tanto el sitio vendía dos planes enteros
 * sobre esa promesa, "Pro · traes tu IA — $19/mes" y "Max · traes tu IA —
 * $39/mes": un cliente podía pagar por un camino que no existe.
 *
 * Las páginas cuyo TEMA es trabajar con varias IAs no se borraron — se
 * esconden con `MULTI_AI_PUBLIC`, el mismo patrón que ya usaba la Extensión
 * Chrome. Sus archivos siguen llenos de esos nombres a propósito, para el día
 * que se vuelvan a prender.
 */

const RAIZ = process.cwd();

/** $19 y $39 eran los planes de traer la propia cuenta. Pide el signo para
 *  no pisar un "19" de una fecha, un porcentaje o un ancho de Tailwind. */
const PRECIO_RETIRADO = /\$\s?(19|39)\b/;

/** Mandar al cliente a una pantalla que no está en su app. */
const PANTALLA_INEXISTENTE = /opciones avanzadas de ia|advanced ai options/i;

/** Los asistentes que el sitio no le nombra al visitante. */
const ASISTENTE = /\b(Claude Code|Claude|Codex|Gemini CLI|Gemini)\b/;

/**
 * Superficies de copy que el visitante lee HOY. La lista es explícita a
 * propósito: barrer `src/` entero marcaba comentarios de código, páginas de
 * admin y el esquema del marketplace — un guardia que nace con cincuenta
 * excepciones no frena nada.
 */
const SUPERFICIES_VIVAS = [
  "src/content/es.ts",
  "src/content/en.ts",
  "src/content/faq.ts",
  "src/lib/supportKnowledge.ts",
  "src/lib/geoPages.ts",
  "src/lib/vsPages.ts",
  "src/components/landing-b",
  "src/components/landing/RealFolders.tsx",
  "src/components/landing/MemoryPersistent.tsx",
  "src/components/landing/MetaBusiness.tsx",
  "src/components/landing/Pricing.tsx",
  "src/components/landing/Footer.tsx",
];

/**
 * Dónde NO se aplica la regla de no nombrar al asistente, y por qué cada uno:
 *
 * - `vsPages.ts` son las comparativas con competidores. Una de ellas ES la
 *   página "TerminalSync vs Google Gemini": ahí el nombre es el tema, no una
 *   oferta. Las frases que sí ofrecían traer la cuenta ya se reescribieron.
 * - `geoPages.ts` mezcla las tres guías escondidas con las que siguen vivas.
 *   Las vivas se reescribieron; las escondidas conservan su copy a propósito.
 *
 * Las reglas de precio y de pantalla inexistente sí corren sobre los dos.
 */
const SIN_REGLA_DE_ASISTENTE = new Set(["src/lib/vsPages.ts", "src/lib/geoPages.ts"]);

/**
 * Los diccionarios tienen copy de DOS portadas: la vieja y el Landing B, que
 * es el que se pinta (`LANDING_B`). Mirar el archivo entero marcaría bloques
 * que nadie lee, como la tabla comparativa o el teaser de la extensión.
 *
 * Esta es la lista de bloques que SÍ alimentan algo vivo: el Landing B y sus
 * secciones, los precios, la FAQ, el pie, los metadatos y el widget de ayuda.
 * Si mañana el Landing B empieza a usar otro bloque, va acá.
 */
const BLOQUES_VIVOS = [
  "landingB",
  "memory",
  "pricing",
  "faq",
  "trust",
  "footer",
  "meta",
  "agent",
  "checkout",
];

const DICCIONARIOS = new Set(["src/content/es.ts", "src/content/en.ts"]);

/** Rangos de línea (1-indexado, inclusivo) de los bloques vivos. */
function rangosVivos(texto: string): Array<[number, number]> {
  const lineas = texto.split("\n");
  const out: Array<[number, number]> = [];
  let dentro: string | null = null;
  let desde = 0;
  lineas.forEach((l, i) => {
    const abre = /^  ([a-zA-Z]+): \{\s*$/.exec(l);
    if (!dentro && abre) {
      if (BLOQUES_VIVOS.includes(abre[1])) {
        dentro = abre[1];
        desde = i + 1;
      }
      return;
    }
    if (dentro && /^  \},?\s*$/.test(l)) {
      out.push([desde, i + 1]);
      dentro = null;
    }
  });
  return out;
}

/** Solo literales de texto: un comentario que EXPLICA la regla no la viola. */
const LITERAL = /"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`/g;

function archivosDe(entrada: string): string[] {
  const p = join(RAIZ, entrada);
  if (!existsSync(p)) return [];
  if (!statSync(p).isDirectory()) return [p];
  const out: string[] = [];
  for (const nombre of readdirSync(p)) {
    if (nombre === "__tests__" || nombre.includes(".test.")) continue;
    out.push(...archivosDe(join(entrada, nombre)));
  }
  return out;
}

function hallazgos(patron: RegExp, saltar?: Set<string>): string[] {
  const out: string[] = [];
  for (const entrada of SUPERFICIES_VIVAS) {
    for (const p of archivosDe(entrada)) {
      const rel = relative(RAIZ, p).split("\\").join("/");
      if (saltar?.has(rel)) continue;
      const texto = readFileSync(p, "utf8");
      const rangos = DICCIONARIOS.has(rel) ? rangosVivos(texto) : null;
      texto
        .split("\n")
        .forEach((linea, i) => {
          if (rangos && !rangos.some(([a, b]) => i + 1 >= a && i + 1 <= b)) return;
          // Las líneas que EXPLICAN que algo se retiró tienen que poder
          // nombrarlo; lo que se prohíbe es ofrecerlo o cotizarlo.
          // Las líneas que EXPLICAN que algo se retiró tienen que poder
          // nombrarlo. Y la de GEO nombra a los motores que nos tienen que
          // recomendar (Google, ChatGPT, Perplexity), no una IA que
          // ofrecemos: ahí el nombre es el destinatario, no la oferta.
          if (
            /NO se ofrece|no se ofrece|not offered|retir|ya no|JM 2026-10-07/i.test(linea) ||
            /Generative Engine Optimization/i.test(linea)
          )
            return;
          for (const lit of linea.match(LITERAL) ?? []) {
            const m = patron.exec(lit);
            if (m) {
              out.push(`${rel}:${i + 1}  «${m[0]}»  ${linea.trim().slice(0, 90)}`);
              break;
            }
          }
        });
    }
  }
  return out;
}

describe("el sitio no ofrece traer tu propia IA ni menciona varias", () => {
  it("encuentra archivos que revisar (si no, el guardia no mira nada)", () => {
    const todos = SUPERFICIES_VIVAS.flatMap(archivosDe);
    expect(todos.length).toBeGreaterThan(10);
  });

  it("no cotiza los planes retirados de $19 ni $39", () => {
    const h = hallazgos(PRECIO_RETIRADO);
    expect(
      h,
      `Precio de un plan que ya no se vende. Los dos planes pagos son Pro $34 y ` +
        `Max $54, los dos con la IA incluida.\n${h.join("\n")}`,
    ).toEqual([]);
  });

  it("no manda al cliente a «Opciones avanzadas de IA», que no está en su app", () => {
    const h = hallazgos(PANTALLA_INEXISTENTE);
    expect(
      h,
      `Esa pantalla no existe en la build de cliente: mandarlo ahí lo deja ` +
        `buscando algo que no está.\n${h.join("\n")}`,
    ).toEqual([]);
  });

  it("no le nombra Claude, Codex ni Gemini al visitante", () => {
    const h = hallazgos(ASISTENTE, SIN_REGLA_DE_ASISTENTE);
    expect(
      h,
      `La primera etapa no menciona que se trabaje con varias IAs: el cliente ` +
        `no elige, la IA de TerminalSync viene incluida.\nSi la página entera ` +
        `trata de eso, escóndela con MULTI_AI_PUBLIC en vez de reescribirla a ` +
        `medias.\n${h.join("\n")}`,
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
