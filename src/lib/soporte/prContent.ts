/**
 * PR title/body/commit-message builders for the "Corregir" loop (S3). Pure
 * string builders — the route handler is the only place that actually
 * calls the GitHub API. Mirrors the three-section shape
 * `.github/pull_request_template.md` requires in `terminal-sync` (Resumen /
 * Lo que el bot de soporte debe saber / Test plan) — see that repo's
 * `bot-knowledge-pr-check` workflow, which blocks merge without it.
 */

export const CORRECTIONS_COMMIT_MESSAGE = "fix(bot): corrección de respuesta desde el admin";

export interface PrContentInput {
  /** Already scrubbed — see scrubQuotedText. Quoted verbatim in the PR. */
  questionScrubbed: string;
  badAnswerScrubbed: string;
  correctedAnswerEs: string;
  correctedAnswerEn?: string | null;
  /** support_corrections row id, for traceability back to the admin panel. */
  correctionId: string;
}

export function buildPrTitle(input: Pick<PrContentInput, "questionScrubbed">): string {
  const short = input.questionScrubbed.trim().replace(/\s+/g, " ").slice(0, 72);
  return `Corrección del bot de soporte: ${short}${input.questionScrubbed.length > 72 ? "…" : ""}`;
}

export function buildCommitMessageBody(input: Pick<PrContentInput, "correctionId">): string {
  return `${CORRECTIONS_COMMIT_MESSAGE}\n\nEnviado desde el panel admin (/admin/soporte/correcciones), corrección ${input.correctionId}.`;
}

export function buildPrBody(input: PrContentInput): string {
  const en = input.correctedAnswerEn?.trim();
  // "el texto corregido tal cual" — verbatim client copy, no extra framing
  // sentences added here (those could reintroduce jargon the bot-knowledge
  // jargon check would flag; the corrected text is trusted as-is because
  // it's what JM typed as the answer a customer should get).
  const lo_que_debe_saber = en ? `${input.correctedAnswerEs.trim()}\n\nEN: ${en}` : input.correctedAnswerEs.trim();

  return [
    "## Resumen",
    "",
    `Corrección de una respuesta del bot de soporte, enviada desde el panel admin (\`/admin/soporte/correcciones\`, corrección \`${input.correctionId}\`). El bot le había contestado mal a un cliente sobre este tema (tipo de pregunta: "${input.questionScrubbed.trim()}"); este PR agrega la respuesta correcta a la base de conocimiento del bot para que deje de repetir el error.`,
    "",
    `Respuesta anterior (la que estaba mal): "${input.badAnswerScrubbed.trim()}"`,
    "",
    "## Lo que el bot de soporte debe saber",
    "",
    lo_que_debe_saber,
    "",
    "## Test plan",
    "",
    "- [ ] Pasa el ciclo nocturno del bot de soporte",
    "- [ ] Se validó con los 12 testigos (regression set)",
    "",
    "---",
    "_Generado automáticamente por `/api/admin/soporte/corrections` (terminalsync-web). Draft — un humano revisa y aprueba antes de mergear; entra en vigencia con el deploy nocturno del bot tras aprobarse._",
  ].join("\n");
}
