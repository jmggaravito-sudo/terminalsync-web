/**
 * Daily error-review cron.
 *
 * Scans every n8n execution in the last 24h, picks out the failures,
 * fetches the full payload of each one, asks an LLM (Claude → Gemini
 * → no-LLM fallback) for a one-paragraph root-cause, then emails JM
 * a digest via Resend.
 *
 * Schedule: 07:00 UTC daily (after auto-promote-connectors @ 06:00).
 * Auth: Vercel-supplied `Authorization: Bearer ${CRON_SECRET}`.
 *
 * Free-tier notes:
 *   - Resend free tier: 3k emails/mo — one digest a day is fine.
 *   - Gemini free tier: plenty of headroom for the ~5-30 errors that
 *     show up on a bad day.
 *
 * To activate end-to-end, two envs need to be set in Vercel prod:
 *   - GEMINI_API_KEY      (or ANTHROPIC_API_KEY — Claude path wins)
 *   - OPS_DIGEST_EMAIL    (defaults to "jmggaravito@gmail.com")
 */
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const N8N_URL = process.env.N8N_URL ?? "https://n8n.nexflowai.net";
const N8N_API_KEY = process.env.N8N_API_KEY ?? "";
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY ?? "";
const GEMINI_KEY = process.env.GEMINI_API_KEY ?? "";
const RESEND_KEY = process.env.RESEND_API_KEY ?? "";
const DIGEST_TO =
  process.env.OPS_DIGEST_EMAIL ?? "jmggaravito@gmail.com";
const DIGEST_FROM = process.env.OPS_DIGEST_FROM ?? "ops@terminalsync.ai";

interface N8nExecListItem {
  id: string;
  workflowId: string;
  status: string;
  startedAt: string;
  stoppedAt?: string;
  finished?: boolean;
}

interface ErrorReview {
  executionId: string;
  workflowId: string;
  workflowName: string;
  status: string;
  startedAt: string;
  failedNode: string | null;
  rawError: string | null;
  rootCause: string | null;
  recommendation: string | null;
}

async function fetchExecutionDetail(id: string): Promise<{
  workflowId: string;
  workflowName: string;
  failedNode: string | null;
  rawError: string | null;
} | null> {
  const r = await fetch(
    `${N8N_URL}/api/v1/executions/${id}?includeData=true`,
    { headers: { "X-N8N-API-KEY": N8N_API_KEY }, cache: "no-store" },
  );
  if (!r.ok) return null;
  const j = (await r.json()) as {
    workflowId?: string;
    workflowData?: { name?: string };
    data?: {
      resultData?: {
        runData?: Record<
          string,
          Array<{ error?: { message?: string; description?: string } }>
        >;
        error?: {
          message?: string;
          node?: { name?: string };
          description?: string;
        };
      };
    };
  };

  const topError = j.data?.resultData?.error;
  if (topError) {
    const desc = topError.description ? ` — ${topError.description}` : "";
    return {
      workflowId: j.workflowId ?? "",
      workflowName: j.workflowData?.name ?? "",
      failedNode: topError.node?.name ?? null,
      rawError: `${topError.message ?? "error"}${desc}`,
    };
  }
  // Some n8n executions don't surface a top-level error; walk runData
  // to find the first node that errored.
  const runData = j.data?.resultData?.runData ?? {};
  for (const [name, runs] of Object.entries(runData)) {
    const erroredRun = runs.find((r) => r.error);
    if (erroredRun?.error) {
      const desc = erroredRun.error.description
        ? ` — ${erroredRun.error.description}`
        : "";
      return {
        workflowId: j.workflowId ?? "",
        workflowName: j.workflowData?.name ?? "",
        failedNode: name,
        rawError: `${erroredRun.error.message ?? "error"}${desc}`,
      };
    }
  }
  return {
    workflowId: j.workflowId ?? "",
    workflowName: j.workflowData?.name ?? "",
    failedNode: null,
    rawError: null,
  };
}

async function analyzeWithClaude(
  workflowName: string,
  failedNode: string | null,
  rawError: string | null,
): Promise<{ rootCause: string; recommendation: string } | null> {
  if (!ANTHROPIC_KEY) return null;
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 350,
      messages: [
        {
          role: "user",
          content: `n8n workflow "${workflowName}" failed at node "${failedNode ?? "(unknown)"}":
${rawError ?? "(no error message)"}

Respond as JSON only: {"rootCause": "one sentence on what likely happened", "recommendation": "one short actionable next step"}`,
        },
      ],
    }),
  });
  if (!r.ok) return null;
  const j = (await r.json()) as { content?: Array<{ text?: string }> };
  const text = j.content?.[0]?.text ?? "";
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[0]);
    return {
      rootCause: parsed.rootCause ?? "",
      recommendation: parsed.recommendation ?? "",
    };
  } catch {
    return null;
  }
}

async function analyzeWithGemini(
  workflowName: string,
  failedNode: string | null,
  rawError: string | null,
): Promise<{ rootCause: string; recommendation: string } | null> {
  if (!GEMINI_KEY) return null;
  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `n8n workflow "${workflowName}" failed at node "${failedNode ?? "(unknown)"}":\n${rawError ?? "(no error message)"}\n\nRespond as JSON only: {"rootCause": "one sentence on what likely happened", "recommendation": "one short actionable next step"}`,
              },
            ],
          },
        ],
        generationConfig: { responseMimeType: "application/json" },
      }),
    },
  );
  if (!r.ok) return null;
  const j = (await r.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = j.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  try {
    const parsed = JSON.parse(text);
    return {
      rootCause: parsed.rootCause ?? "",
      recommendation: parsed.recommendation ?? "",
    };
  } catch {
    return null;
  }
}

function renderDigest(reviews: ErrorReview[], windowHours: number): string {
  const head = `<h2 style="font-family:ui-sans-serif,system-ui;margin:0 0 8px">n8n digest · errors last ${windowHours}h</h2>
<p style="font-family:ui-sans-serif,system-ui;color:#64748b;margin:0 0 16px">${reviews.length} execution${reviews.length === 1 ? "" : "s"} failed.</p>`;
  if (reviews.length === 0) {
    return `${head}<p style="font-family:ui-sans-serif,system-ui">All workflows clean. 🟢</p>`;
  }
  const body = reviews
    .map((r) => {
      const link = `${N8N_URL}/workflow/${r.workflowId}/executions/${r.executionId}`;
      return `<div style="font-family:ui-sans-serif,system-ui;border:1px solid #e2e8f0;border-radius:12px;padding:14px;margin-bottom:10px">
  <div style="display:flex;justify-content:space-between;gap:8px;font-size:13px">
    <strong>${r.workflowName || r.workflowId}</strong>
    <a href="${link}" style="color:#475569;text-decoration:none;font-family:ui-monospace,Menlo,monospace;font-size:11px">open in n8n →</a>
  </div>
  <div style="font-size:11px;color:#94a3b8;font-family:ui-monospace,Menlo,monospace;margin-top:2px">
    ${new Date(r.startedAt).toUTCString()} · node: ${r.failedNode ?? "(unknown)"}
  </div>
  ${r.rawError ? `<pre style="margin:8px 0 0;padding:8px;background:#fef2f2;color:#b91c1c;border-radius:6px;font-size:11px;white-space:pre-wrap;word-break:break-word">${escapeHtml(r.rawError)}</pre>` : ""}
  ${r.rootCause ? `<p style="margin:8px 0 4px;font-size:13px"><strong>Causa:</strong> ${escapeHtml(r.rootCause)}</p>` : ""}
  ${r.recommendation ? `<p style="margin:0;font-size:13px;color:#065f46"><strong>Próximo paso:</strong> ${escapeHtml(r.recommendation)}</p>` : ""}
</div>`;
    })
    .join("");
  return head + body;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function sendDigest(html: string, count: number): Promise<boolean> {
  if (!RESEND_KEY) return false;
  const subject =
    count === 0
      ? "n8n digest · 0 errors (all clean)"
      : `n8n digest · ${count} error${count === 1 ? "" : "s"} in last 24h`;
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_KEY}`,
    },
    body: JSON.stringify({
      from: DIGEST_FROM,
      to: [DIGEST_TO],
      subject,
      html,
    }),
  });
  return r.ok;
}

export async function GET(req: Request) {
  const provided = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  if (!process.env.CRON_SECRET || provided !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!N8N_API_KEY) {
    return NextResponse.json({ error: "N8N_API_KEY missing" }, { status: 503 });
  }

  const WINDOW_H = Number(process.env.OPS_REVIEW_WINDOW_HOURS ?? "24");
  const since = new Date(Date.now() - WINDOW_H * 3600 * 1000).toISOString();

  // n8n executions API doesn't take a time filter, so we pull a fat page
  // (last 500) and filter client-side. JM's average day is well under
  // 500 executions across every workflow.
  const r = await fetch(
    `${N8N_URL}/api/v1/executions?status=error&limit=500`,
    { headers: { "X-N8N-API-KEY": N8N_API_KEY }, cache: "no-store" },
  );
  if (!r.ok) {
    return NextResponse.json({ error: `n8n ${r.status}` }, { status: 502 });
  }
  const j = (await r.json()) as { data: N8nExecListItem[] };
  const failed = (j.data ?? []).filter((e) => e.startedAt >= since);

  const reviews: ErrorReview[] = [];
  for (const exec of failed) {
    const detail = await fetchExecutionDetail(exec.id);
    if (!detail) continue;
    const analysis =
      (await analyzeWithClaude(
        detail.workflowName,
        detail.failedNode,
        detail.rawError,
      )) ??
      (await analyzeWithGemini(
        detail.workflowName,
        detail.failedNode,
        detail.rawError,
      ));
    reviews.push({
      executionId: exec.id,
      workflowId: exec.workflowId,
      workflowName: detail.workflowName,
      status: exec.status,
      startedAt: exec.startedAt,
      failedNode: detail.failedNode,
      rawError: detail.rawError,
      rootCause: analysis?.rootCause ?? null,
      recommendation: analysis?.recommendation ?? null,
    });
  }

  const html = renderDigest(reviews, WINDOW_H);
  const emailSent = await sendDigest(html, reviews.length);

  return NextResponse.json({
    ok: true,
    windowHours: WINDOW_H,
    errorsFound: reviews.length,
    aiUsed: ANTHROPIC_KEY ? "claude" : GEMINI_KEY ? "gemini" : "none",
    emailSent,
    digestPreview: html.slice(0, 800),
  });
}
