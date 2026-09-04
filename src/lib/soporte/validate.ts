import { detectSecretLike } from "./scrub";
import type { CorrectionRequestBody } from "./types";

export const MAX_TEXT_LENGTH = 4000;

export interface ValidatedCorrection {
  conversationId: string | null;
  question: string;
  badAnswer: string;
  correctedAnswerEs: string;
  correctedAnswerEn: string | null;
  locale: string | null;
}

export type ValidationResult = { ok: true; value: ValidatedCorrection } | { ok: false; error: string };

function asString(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function asOptionalString(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  return trimmed ? trimmed : null;
}

/**
 * Validates + secret-checks a raw POST body. Two different failure modes,
 * both surfaced as `{ ok: false, error }` (the route turns that into a 400
 * without persisting anything):
 *
 *   - Missing/oversized fields — plain shape validation.
 *   - `detectSecretLike` hits on the question or either corrected answer —
 *     refuses outright rather than trying to redact a credential. Checked
 *     on the corrected answers AND the question per the spec ("si la
 *     corrección o la pregunta contienen algo con pinta de API key/token");
 *     also checked on `bad_answer` defensively even though the spec doesn't
 *     name it, since it's quoted into the PR the same way the question is.
 *
 * Does NOT scrub — that happens separately (scrubQuotedText) right before
 * building the GitHub bullet, once validation has already passed. Keeping
 * the two passes separate means a test can assert "this input is rejected"
 * independently of "this input, once accepted, gets redacted like this".
 */
export function validateCorrectionRequest(body: unknown): ValidationResult {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Body vacío o inválido." };
  }
  const b = body as Record<string, unknown>;

  const question = asString(b.question);
  const badAnswer = asString(b.bad_answer);
  const correctedAnswerEs = asString(b.corrected_answer_es).trim();
  const correctedAnswerEnRaw = asOptionalString(b.corrected_answer_en);
  const conversationId = asOptionalString(b.conversation_id);
  const locale = asOptionalString(b.locale);

  if (!correctedAnswerEs) {
    return { ok: false, error: 'Falta "corrected_answer_es" (cómo debía contestar).' };
  }

  const sizedFields: Array<[string, string]> = [
    ["question", question],
    ["bad_answer", badAnswer],
    ["corrected_answer_es", correctedAnswerEs],
    ["corrected_answer_en", correctedAnswerEnRaw ?? ""],
  ];
  for (const [name, value] of sizedFields) {
    if (value.length > MAX_TEXT_LENGTH) {
      return { ok: false, error: `"${name}" supera el máximo de ${MAX_TEXT_LENGTH} caracteres.` };
    }
  }

  const secretCheckFields: Array<[string, string]> = [
    ["question", question],
    ["bad_answer", badAnswer],
    ["corrected_answer_es", correctedAnswerEs],
    ["corrected_answer_en", correctedAnswerEnRaw ?? ""],
  ];
  for (const [, value] of secretCheckFields) {
    const secret = detectSecretLike(value);
    if (secret) {
      return {
        ok: false,
        error: `El texto parece contener ${secret.label}. Removelo antes de enviar la corrección — nunca pegues claves o tokens reales acá.`,
      };
    }
  }

  return {
    ok: true,
    value: {
      conversationId,
      question,
      badAnswer,
      correctedAnswerEs,
      correctedAnswerEn: correctedAnswerEnRaw,
      locale,
    },
  };
}

/** Narrow type guard so route handlers can accept `unknown` JSON bodies
 *  without a cast. Exported mainly for tests. */
export function isCorrectionRequestBody(v: unknown): v is CorrectionRequestBody {
  return Boolean(v && typeof v === "object" && "corrected_answer_es" in (v as Record<string, unknown>));
}
