/**
 * Shapes shared between the "Corregir" button/drawer (S3) and whatever
 * renders a support_conversations row (S2's `/admin/soporte` thread view,
 * or this route's own `/admin/soporte/correcciones` test page).
 *
 * Deliberately NOT importing anything from S2's territory — S2 builds
 * `[lang]/admin/soporte` in a parallel PR against the same base branch, and
 * this feature has to stand on its own so both PRs merge without either
 * blocking on the other. `ConversationForCorrection` is a narrow, local
 * subset of the `support_conversations` columns (see S2's PR) that this
 * component actually needs.
 */

export interface ConversationForCorrection {
  /** support_conversations.id (uuid) — stored as the soft reference on the
   *  correction row. Optional so the drawer can still be used ad hoc. */
  id?: string | null;
  question: string;
  answer: string;
  locale?: string | null;
}

export type CorrectionStatus = "pending" | "pr_opened" | "error";

export interface CorrectionRow {
  id: string;
  conversation_id: string | null;
  question: string;
  bad_answer: string;
  corrected_answer_es: string;
  corrected_answer_en: string | null;
  locale: string | null;
  status: CorrectionStatus;
  branch: string | null;
  pr_url: string | null;
  pr_number: number | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

/** POST body the drawer sends to /api/admin/soporte/corrections. */
export interface CorrectionRequestBody {
  conversation_id?: string | null;
  question: string;
  bad_answer: string;
  corrected_answer_es: string;
  corrected_answer_en?: string | null;
  locale?: string | null;
}

/** Success/error shape the route returns; the drawer renders straight off this. */
export interface CorrectionResponseBody {
  ok: boolean;
  id?: string;
  status?: CorrectionStatus;
  pr_url?: string | null;
  pr_number?: number | null;
  branch?: string | null;
  error?: string;
}
