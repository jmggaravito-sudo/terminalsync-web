import { describe, expect, it } from "vitest";
import { validateCorrectionRequest, MAX_TEXT_LENGTH } from "./validate";

function baseBody(overrides: Record<string, unknown> = {}) {
  return {
    conversation_id: "conv-1",
    question: "¿Cómo cancelo mi suscripción?",
    bad_answer: "No sé, contactá a soporte.",
    corrected_answer_es: "Podés cancelar desde Configuración → Facturación.",
    corrected_answer_en: "You can cancel from Settings → Billing.",
    locale: "es",
    ...overrides,
  };
}

describe("validateCorrectionRequest", () => {
  it("accepts a well-formed request", () => {
    const result = validateCorrectionRequest(baseBody());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.correctedAnswerEs).toBe("Podés cancelar desde Configuración → Facturación.");
      expect(result.value.correctedAnswerEn).toBe("You can cancel from Settings → Billing.");
      expect(result.value.conversationId).toBe("conv-1");
    }
  });

  it("accepts a request with no EN correction", () => {
    const result = validateCorrectionRequest(baseBody({ corrected_answer_en: undefined }));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.correctedAnswerEn).toBeNull();
  });

  it("rejects a non-object body", () => {
    expect(validateCorrectionRequest(null).ok).toBe(false);
    expect(validateCorrectionRequest("hola").ok).toBe(false);
    expect(validateCorrectionRequest(undefined).ok).toBe(false);
  });

  it("rejects an empty corrected_answer_es", () => {
    const result = validateCorrectionRequest(baseBody({ corrected_answer_es: "   " }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/corrected_answer_es/);
  });

  it("rejects when any bounded field exceeds MAX_TEXT_LENGTH", () => {
    const tooLong = "a".repeat(MAX_TEXT_LENGTH + 1);
    for (const field of ["question", "bad_answer", "corrected_answer_es", "corrected_answer_en"]) {
      const result = validateCorrectionRequest(baseBody({ [field]: tooLong }));
      expect(result.ok, `${field} should fail over the limit`).toBe(false);
    }
  });

  it("accepts a field at exactly MAX_TEXT_LENGTH", () => {
    // Spaced-out filler (not "a".repeat(...)) so it doesn't accidentally
    // read as a contiguous base64-looking blob to detectSecretLike.
    const exact = "palabra ".repeat(Math.ceil(MAX_TEXT_LENGTH / 8)).slice(0, MAX_TEXT_LENGTH);
    expect(exact.length).toBe(MAX_TEXT_LENGTH);
    const result = validateCorrectionRequest(baseBody({ corrected_answer_es: exact }));
    expect(result.ok).toBe(true);
  });

  it("rejects when the corrected answer contains something that looks like a secret", () => {
    const result = validateCorrectionRequest(
      baseBody({ corrected_answer_es: "Usá esta clave: sk-proj-aaaaaaaaaaaaaaaaaaaaaaaa1234567890" }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/sk-/);
  });

  it("rejects when the question contains something that looks like a secret", () => {
    const result = validateCorrectionRequest(
      baseBody({ question: "por que mi token ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 no funciona" }),
    );
    expect(result.ok).toBe(false);
  });

  it("rejects when the bad_answer (quoted verbatim otherwise) contains a secret-like string", () => {
    const result = validateCorrectionRequest(
      baseBody({ bad_answer: "-----BEGIN PRIVATE KEY-----\nMIIB...\n-----END PRIVATE KEY-----" }),
    );
    expect(result.ok).toBe(false);
  });

  it("does not flag ordinary pricing/plan copy as a secret", () => {
    const result = validateCorrectionRequest(
      baseBody({ corrected_answer_es: "El plan Pro cuesta 19 dólares por mes, con 10 workspaces." }),
    );
    expect(result.ok).toBe(true);
  });

  it("treats missing question/bad_answer as empty strings rather than throwing", () => {
    const result = validateCorrectionRequest({ corrected_answer_es: "respuesta correcta" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.question).toBe("");
      expect(result.value.badAnswer).toBe("");
    }
  });
});
