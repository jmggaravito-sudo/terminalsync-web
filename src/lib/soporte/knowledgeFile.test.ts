import { describe, expect, it } from "vitest";
import {
  formatDateYYYYMMDD,
  slugify,
  buildBranchName,
  buildCorrectionBullet,
  appendCorrectionBullet,
  CORRECTIONS_SECTION_HEADING,
} from "./knowledgeFile";

describe("formatDateYYYYMMDD", () => {
  it("formats a UTC date as yyyymmdd", () => {
    expect(formatDateYYYYMMDD(new Date("2026-09-04T15:40:00Z"))).toBe("20260904");
  });

  it("pads single-digit month/day", () => {
    expect(formatDateYYYYMMDD(new Date("2026-01-05T00:00:00Z"))).toBe("20260105");
  });
});

describe("slugify", () => {
  it("lowercases, strips accents, and kebab-cases", () => {
    expect(slugify("¿Cómo cancelo mi suscripción?")).toBe("como-cancelo-mi-suscripcion");
  });

  it("collapses repeated punctuation into a single dash", () => {
    expect(slugify("precio -- de -- Pro!!")).toBe("precio-de-pro");
  });

  it("truncates to maxLen without leaving a trailing dash", () => {
    const long = "esta es una pregunta MUY MUY MUY larga sobre facturacion y planes";
    const slug = slugify(long, 20);
    expect(slug.length).toBeLessThanOrEqual(20);
    expect(slug.endsWith("-")).toBe(false);
  });

  it("falls back to a stable default when the input has no alnum chars", () => {
    expect(slugify("???")).toBe("correccion");
  });
});

describe("buildBranchName", () => {
  it("builds correccion-bot/<yyyymmdd>-<slug>", () => {
    const branch = buildBranchName("¿Cómo cancelo?", new Date("2026-09-04T12:00:00Z"));
    expect(branch).toBe("correccion-bot/20260904-como-cancelo");
  });

  it("appends the retry suffix when given one", () => {
    const branch = buildBranchName("¿Cómo cancelo?", new Date("2026-09-04T12:00:00Z"), "ab12");
    expect(branch).toBe("correccion-bot/20260904-como-cancelo-ab12");
  });
});

describe("buildCorrectionBullet", () => {
  it("builds the ES-only bullet", () => {
    const bullet = buildCorrectionBullet({
      questionScrubbed: "¿Cómo cancelo?",
      correctedAnswerEs: "Podés cancelar desde Configuración → Facturación.",
    });
    expect(bullet).toBe('- Pregunta tipo: "¿Cómo cancelo?" → responder: Podés cancelar desde Configuración → Facturación.');
  });

  it("appends the EN version when provided", () => {
    const bullet = buildCorrectionBullet({
      questionScrubbed: "How do I cancel?",
      correctedAnswerEs: "Podés cancelar desde Configuración.",
      correctedAnswerEn: "You can cancel from Settings.",
    });
    expect(bullet).toContain(" / EN: You can cancel from Settings.");
  });

  it("collapses internal whitespace in the question", () => {
    const bullet = buildCorrectionBullet({
      questionScrubbed: "pregunta   con\n\nsaltos raros",
      correctedAnswerEs: "respuesta",
    });
    expect(bullet).toContain('"pregunta con saltos raros"');
  });
});

describe("appendCorrectionBullet", () => {
  it("creates the section at the end of the file when it doesn't exist yet", () => {
    const file = "## Output\n- Plain prose by default.\n";
    const out = appendCorrectionBullet(file, "- Pregunta tipo: \"x\" → responder: y");
    expect(out).toContain(CORRECTIONS_SECTION_HEADING);
    expect(out.trim().endsWith('- Pregunta tipo: "x" → responder: y')).toBe(true);
    // Section heading comes after the pre-existing content.
    expect(out.indexOf("## Output")).toBeLessThan(out.indexOf(CORRECTIONS_SECTION_HEADING));
  });

  it("appends a second bullet under an existing section at EOF", () => {
    const file = `## Output\n- x\n\n${CORRECTIONS_SECTION_HEADING}\n- Pregunta tipo: "a" → responder: b\n`;
    const out = appendCorrectionBullet(file, '- Pregunta tipo: "c" → responder: d');
    const lines = out.trim().split("\n");
    expect(lines[lines.length - 1]).toBe('- Pregunta tipo: "c" → responder: d');
    expect(lines[lines.length - 2]).toBe('- Pregunta tipo: "a" → responder: b');
  });

  it("inserts before the next heading when the section isn't last in the file", () => {
    const file = `${CORRECTIONS_SECTION_HEADING}\n- Pregunta tipo: "a" → responder: b\n\n## Otra sección\ncontenido humano agregado después\n`;
    const out = appendCorrectionBullet(file, '- Pregunta tipo: "c" → responder: d');
    expect(out.indexOf('- Pregunta tipo: "c"')).toBeLessThan(out.indexOf("## Otra sección"));
    expect(out).toContain("contenido humano agregado después");
  });

  it("never drops existing content", () => {
    const file = "## A\ntexto a\n\n## B\ntexto b\n";
    const out = appendCorrectionBullet(file, "- nueva");
    expect(out).toContain("texto a");
    expect(out).toContain("texto b");
    expect(out).toContain("- nueva");
  });
});
