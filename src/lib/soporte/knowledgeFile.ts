/**
 * Builds the `docs/sync-bot-knowledge.md` edit + PR content for the
 * "Corregir" loop (S3). Pure text transforms only — no fetch/fs here, so
 * the GitHub Contents API round trip in the route handler is the only
 * place that touches the network. See src/lib/soporte/scrub.ts for the
 * PII/secret handling that runs BEFORE any of these builders.
 */

export const CORRECTIONS_SECTION_HEADING = "## Correcciones del equipo";

const MAX_SLUG_LEN = 40;

/** yyyymmdd in UTC — stable regardless of server timezone. */
export function formatDateYYYYMMDD(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

/** kebab-case, ASCII-only, short — for the branch name. Strips accents
 *  first so "cómo cancelo" doesn't turn into a run of dashes. */
export function slugify(text: string, maxLen: number = MAX_SLUG_LEN): string {
  const ascii = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // strip combining diacritics (NFD decomposition of accented letters)
  const slug = ascii
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLen)
    .replace(/-+$/g, "");
  return slug || "correccion";
}

/** `correccion-bot/<yyyymmdd>-<slug-corto>`. `suffix` (optional) is used
 *  when the route needs to retry after a 422 "branch already exists". */
export function buildBranchName(question: string, date: Date = new Date(), suffix?: string): string {
  const day = formatDateYYYYMMDD(date);
  const slug = slugify(question, suffix ? MAX_SLUG_LEN - suffix.length - 1 : MAX_SLUG_LEN);
  return suffix ? `correccion-bot/${day}-${slug}-${suffix}` : `correccion-bot/${day}-${slug}`;
}

export interface BulletInput {
  /** Already scrubbed (see scrubQuotedText) — this function does not scrub. */
  questionScrubbed: string;
  correctedAnswerEs: string;
  correctedAnswerEn?: string | null;
}

/** `- Pregunta tipo: "<pregunta scrubbed>" → responder: <corrected_es>[ / EN: <corrected_en>]` */
export function buildCorrectionBullet({ questionScrubbed, correctedAnswerEs, correctedAnswerEn }: BulletInput): string {
  const question = questionScrubbed.trim().replace(/\s+/g, " ");
  const es = correctedAnswerEs.trim();
  const en = correctedAnswerEn?.trim();
  const base = `- Pregunta tipo: "${question}" → responder: ${es}`;
  return en ? `${base} / EN: ${en}` : base;
}

/**
 * Appends `bullet` under `## Correcciones del equipo`, creating the section
 * at the end of the file if it isn't there yet. If the section already
 * exists but isn't the last one in the file (a human added something
 * after it later), the bullet is inserted right before the next `## `
 * heading rather than blindly at EOF, so it always lands inside its own
 * section.
 */
export function appendCorrectionBullet(fileContent: string, bullet: string): string {
  const content = fileContent.replace(/\s+$/, ""); // trim trailing whitespace, re-add exactly one \n below
  const headingIdx = content.indexOf(CORRECTIONS_SECTION_HEADING);

  if (headingIdx === -1) {
    // Section doesn't exist yet — create it at the end of the file.
    return `${content}\n\n${CORRECTIONS_SECTION_HEADING}\n${bullet}\n`;
  }

  const afterHeading = headingIdx + CORRECTIONS_SECTION_HEADING.length;
  const nextHeadingRelIdx = content.slice(afterHeading).search(/\n## /);
  if (nextHeadingRelIdx === -1) {
    // Section is the last one in the file — append at the very end.
    return `${content}\n${bullet}\n`;
  }

  // Section has content after it — insert just before the next `## `.
  const insertAt = afterHeading + nextHeadingRelIdx + 1; // +1 to land after the \n, before "## "
  return `${content.slice(0, insertAt)}${bullet}\n${content.slice(insertAt)}`;
}
