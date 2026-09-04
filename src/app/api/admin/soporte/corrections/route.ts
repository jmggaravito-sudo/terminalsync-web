import { NextResponse } from "next/server";
import { authenticate, isAdmin } from "@/lib/marketplace/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { scrubQuotedText } from "@/lib/soporte/scrub";
import { validateCorrectionRequest } from "@/lib/soporte/validate";
import { buildBranchName, buildCorrectionBullet, appendCorrectionBullet } from "@/lib/soporte/knowledgeFile";
import { buildPrTitle, buildPrBody, buildCommitMessageBody } from "@/lib/soporte/prContent";
import { openCorrectionPr, BranchExistsError } from "@/lib/soporte/githubPr";
import type { CorrectionRow, CorrectionStatus } from "@/lib/soporte/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * POST → the "Corregir" loop (S3): JM (or any admin) submits how the bot
 *   SHOULD have answered a real conversation; this route scrubs PII/rejects
 *   secrets, records the correction in Supabase, and opens a draft PR
 *   against `jmggaravito-sudo/terminal-sync` teaching the bot the right
 *   answer (see src/lib/soporte/githubPr.ts for the exact repo/branch).
 * GET  → lists recent corrections + their status, for the
 *   `/admin/soporte/correcciones` page.
 *
 * Auth: same Bearer access_token + ADMIN_EMAILS allowlist as every other
 * /api/admin route — see src/app/api/admin/ai-center/route.ts.
 *
 * Token: TS_CORRECTIONS_GITHUB_TOKEN (server-side only, never sent to the
 * client). Needs, on `jmggaravito-sudo/terminal-sync`: Contents:Read+Write
 * (branch + file edit) and Pull requests:Read+Write (open the draft PR).
 * See the PR description for the exact scope this route needs.
 */

const TABLE = "support_corrections";

async function requireAdmin(req: Request) {
  const user = await authenticate(req);
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  if (!isAdmin(user)) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  return null;
}

function readGithubToken(): string | null {
  const t = process.env.TS_CORRECTIONS_GITHUB_TOKEN;
  return t && t.trim() ? t.trim() : null;
}

interface UpdateFields {
  status: CorrectionStatus;
  branch?: string;
  pr_url?: string;
  pr_number?: number;
  error_message?: string | null;
}

async function updateCorrectionRow(id: string, fields: UpdateFields): Promise<void> {
  const sb = getSupabaseAdmin();
  if (!sb) return; // best-effort — insert already happened or never will have
  await sb
    .from(TABLE)
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id);
}

export async function POST(req: Request) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Body no es JSON válido." }, { status: 400 });
  }

  const result = validateCorrectionRequest(rawBody);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }
  const input = result.value;

  const sb = getSupabaseAdmin();
  if (!sb) {
    return NextResponse.json(
      { ok: false, error: "Supabase no está configurado en el servidor (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)." },
      { status: 503 },
    );
  }

  // 1. Insert the row FIRST (status "pending") — every outcome from this
  //    point on updates this row instead of losing the submission.
  const { data: inserted, error: insertError } = await sb
    .from(TABLE)
    .insert({
      conversation_id: input.conversationId,
      question: input.question,
      bad_answer: input.badAnswer,
      corrected_answer_es: input.correctedAnswerEs,
      corrected_answer_en: input.correctedAnswerEn,
      locale: input.locale,
      status: "pending" satisfies CorrectionStatus,
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    return NextResponse.json(
      { ok: false, error: `No se pudo guardar la corrección: ${insertError?.message ?? "unknown error"}` },
      { status: 502 },
    );
  }
  const correctionId = (inserted as { id: string }).id;

  // 2. GitHub token gate — row already exists, so a missing token is
  //    recorded as an error on the row rather than silently dropped.
  const token = readGithubToken();
  if (!token) {
    const message = "Falta configurar TS_CORRECTIONS_GITHUB_TOKEN en el servidor.";
    await updateCorrectionRow(correctionId, { status: "error", error_message: message });
    return NextResponse.json({ ok: false, id: correctionId, status: "error", error: message }, { status: 503 });
  }

  // 3. Scrub what gets quoted verbatim into the GitHub PR (question + the
  //    bad answer) — the corrected answers already passed the stricter
  //    secret-reject check in validateCorrectionRequest and are used as-is
  //    (they're JM's own client-safe copy, not customer-submitted text).
  const questionScrubbed = scrubQuotedText(input.question);
  const badAnswerScrubbed = scrubQuotedText(input.badAnswer);

  const bullet = buildCorrectionBullet({
    questionScrubbed,
    correctedAnswerEs: input.correctedAnswerEs,
    correctedAnswerEn: input.correctedAnswerEn,
  });
  const prTitle = buildPrTitle({ questionScrubbed });
  const prBody = buildPrBody({
    questionScrubbed,
    badAnswerScrubbed,
    correctedAnswerEs: input.correctedAnswerEs,
    correctedAnswerEn: input.correctedAnswerEn,
    correctionId,
  });
  const commitMessage = buildCommitMessageBody({ correctionId });

  let branch = buildBranchName(input.question);

  try {
    let pr;
    try {
      pr = await openCorrectionPr({
        token,
        branch,
        commitMessage,
        bullet,
        appendBullet: appendCorrectionBullet,
        prTitle,
        prBody,
      });
    } catch (err) {
      if (err instanceof BranchExistsError) {
        // Extremely unlikely (same day + same question slug) — retry once
        // with a short random suffix instead of failing the whole request.
        branch = buildBranchName(input.question, new Date(), Math.random().toString(36).slice(2, 6));
        pr = await openCorrectionPr({
          token,
          branch,
          commitMessage,
          bullet,
          appendBullet: appendCorrectionBullet,
          prTitle,
          prBody,
        });
      } else {
        throw err;
      }
    }

    await updateCorrectionRow(correctionId, {
      status: "pr_opened",
      branch: pr.branch,
      pr_url: pr.prUrl,
      pr_number: pr.prNumber,
      error_message: null,
    });

    return NextResponse.json({
      ok: true,
      id: correctionId,
      status: "pr_opened" satisfies CorrectionStatus,
      pr_url: pr.prUrl,
      pr_number: pr.prNumber,
      branch: pr.branch,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido al abrir el PR en GitHub.";
    await updateCorrectionRow(correctionId, { status: "error", error_message: message });
    return NextResponse.json({ ok: false, id: correctionId, status: "error", error: message }, { status: 502 });
  }
}

export async function GET(req: Request) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  const sb = getSupabaseAdmin();
  if (!sb) {
    return NextResponse.json({ items: [], setupNeeded: true, message: "Supabase no está configurado." });
  }

  const { data, error } = await sb
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 502 });
  }

  return NextResponse.json({ items: (data ?? []) as CorrectionRow[] });
}
