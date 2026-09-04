import { describe, expect, it } from "vitest";
import { buildPrTitle, buildPrBody, buildCommitMessageBody, CORRECTIONS_COMMIT_MESSAGE } from "./prContent";

const BASE = {
  questionScrubbed: "¿Cómo cancelo mi suscripción?",
  badAnswerScrubbed: "No sé, contactá a soporte.",
  correctedAnswerEs: "Podés cancelar desde Configuración → Facturación.",
  correctionId: "abc-123",
};

describe("buildPrTitle", () => {
  it("includes the scrubbed question", () => {
    expect(buildPrTitle(BASE)).toContain("¿Cómo cancelo mi suscripción?");
  });

  it("truncates a very long question", () => {
    const long = "a".repeat(200);
    const title = buildPrTitle({ questionScrubbed: long });
    expect(title.length).toBeLessThan(200);
    expect(title.endsWith("…")).toBe(true);
  });
});

describe("buildCommitMessageBody", () => {
  it("starts with the fixed commit subject", () => {
    const body = buildCommitMessageBody({ correctionId: "abc-123" });
    expect(body.startsWith(CORRECTIONS_COMMIT_MESSAGE)).toBe(true);
    expect(body).toContain("abc-123");
  });
});

describe("buildPrBody", () => {
  it("contains all three required sections", () => {
    const body = buildPrBody(BASE);
    expect(body).toContain("## Resumen");
    expect(body).toContain("## Lo que el bot de soporte debe saber");
    expect(body).toContain("## Test plan");
  });

  it("puts the corrected answer verbatim (not paraphrased) under the knowledge section", () => {
    const body = buildPrBody(BASE);
    const section = body.split("## Lo que el bot de soporte debe saber")[1].split("## Test plan")[0];
    expect(section.trim().startsWith(BASE.correctedAnswerEs)).toBe(true);
  });

  it("appends the EN correction when provided", () => {
    const body = buildPrBody({ ...BASE, correctedAnswerEn: "You can cancel from Settings." });
    expect(body).toContain("EN: You can cancel from Settings.");
  });

  it("omits the EN line when no EN correction is given", () => {
    const body = buildPrBody(BASE);
    expect(body).not.toContain("EN:");
  });

  it("cites the correction id for traceability", () => {
    const body = buildPrBody(BASE);
    expect(body).toContain("abc-123");
  });

  it("includes the test plan checkboxes for the nightly cycle + 12 witnesses", () => {
    const body = buildPrBody(BASE);
    expect(body).toMatch(/- \[ \] .*ciclo nocturno/i);
    expect(body).toMatch(/- \[ \] .*12 testigos/i);
  });
});
