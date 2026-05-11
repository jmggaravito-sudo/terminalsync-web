/**
 * Daily error-review + auto-repair cron.
 *
 * Pipeline per failed n8n execution in the last 24h:
 *   1. Fetch the execution detail (?includeData=true).
 *   2. Classify the error with Claude → kind ∈ {transient, logic_bug,
 *      auth, upstream, unknown} + confidence + reasoning.
 *   3. If kind=transient and confidence ≥ MIN_AUTO_RETRY (0.7),
 *      hit POST /executions/{id}/retry on n8n. Log to ops_auto_actions.
 *   4. If kind=logic_bug and confidence ≥ MIN_PROPOSE (0.7), fetch the
 *      full workflow JSON, ask Claude for a patched version, save it
 *      to ops_auto_actions as a pending proposal (NEVER auto-apply —
 *      JM hits Apply in /admin/ops to commit).
 *   5. auth / upstream / unknown → just include in the digest email.
 *
 * Cron schedule: 07:00 UTC daily, see vercel.json.
 * Auth: Vercel-injected `Authorization: Bearer ${CRON_SECRET}`.
 *
 * Env knobs:
 *   - ANTHROPIC_API_KEY  required for classification + proposals
 *   - GEMINI_API_KEY     fallback for classification (no proposals)
 *   - RESEND_API_KEY     for the digest email
 *   - SUPABASE_URL/KEY   for ops_auto_actions persistence
 *   - OPS_REVIEW_WINDOW_HOURS  default 24
 *   - MIN_AUTO_RETRY     default 0.7
 *   - MIN_PROPOSE        default 0.7
 *   - OPS_DIGEST_EMAIL   default jmggaravito@gmail.com
 *   - OPS_DIGEST_FROM    default ops@terminalsync.ai
 */
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Single-pass review can iterate 20+ executions with multiple LLM hops
// each — comfortably above the default 10s budget. Vercel's max for
// Hobby is 60s, Pro is 300s; we ask for the cron-friendly max.
export const maxDuration = 300;

const N8N_URL = process.env.N8N_URL ?? "https://n8n.nexflowai.net";
const N8N_API_KEY = process.env.N8N_API_KEY ?? "";
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY ?? "";
const GEMINI_KEY = process.env.GEMINI_API_KEY ?? "";
const RESEND_KEY = process.env.RESEND_API_KEY ?? "";
const DIGEST_TO = process.env.OPS_DIGEST_EMAIL ?? "jmggaravito@gmail.com";
const DIGEST_FROM = process.env.OPS_DIGEST_FROM ?? "ops@terminalsync.ai";

const MIN_AUTO_RETRY = Number(process.env.MIN_AUTO_RETRY ?? "0.7");
const MIN_PROPOSE = Number(process.env.MIN_PROPOSE ?? "0.7");

interface N8nExecListItem {
  id: string;
  workflowId: string;
  status: string;
  startedAt: string;
  stoppedAt?: string;
  finished?: boolean;
}

interface FailureContext {
  executionId: string;
  workflowId: string;
  workflowName: string;
  failedNode: string | null;
  rawError: string | null;
  startedAt: string;
}

type Classification = {
  kind: "transient" | "logic_bug" | "auth" | "upstream" | "unknown";
  confidence: number;
  reasoning: string;
  rootCause: string;
  recommendation: string;
};

async function fetchExecutionContext(
  e: N8nExecListItem,
): Promise<FailureContext | null> {
  const r = await fetch(
    `${N8N_URL}/api/v1/executions/${e.id}?includeData=true`,
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
  const top = j.data?.resultData?.error;
  let failedNode: string | null = null;
  let rawError: string | null = null;
  if (top) {
    failedNode = top.node?.name ?? null;
    const desc = top.description ? ` — ${top.description}` : "";
    rawError = `${top.message ?? "error"}${desc}`;
  } else {
    const runData = j.data?.resultData?.runData ?? {};
    for (const [name, runs] of Object.entries(runData)) {
      const erroredRun = runs.find((r) => r.error);
      if (erroredRun?.error) {
        failedNode = name;
        const desc = erroredRun.error.description
          ? ` — ${erroredRun.error.description}`
          : "";
        rawError = `${erroredRun.error.message ?? "error"}${desc}`;
        break;
      }
    }
  }
  return {
    executionId: e.id,
    workflowId: e.workflowId,
    workflowName: j.workflowData?.name ?? "",
    failedNode,
    rawError,
    startedAt: e.startedAt,
  };
}

async function callClaude(
  prompt: string,
  maxTokens = 400,
): Promise<string | null> {
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
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!r.ok) return null;
  const j = (await r.json()) as { content?: Array<{ text?: string }> };
  return j.content?.[0]?.text ?? null;
}

async function callGemini(prompt: string): Promise<string | null> {
  if (!GEMINI_KEY) return null;
  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" },
      }),
    },
  );
  if (!r.ok) return null;
  const j = (await r.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  return j.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
}

function extractJson(text: string | null): unknown | null {
  if (!text) return null;
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try {
    return JSON.parse(m[0]);
  } catch {
    return null;
  }
}

async function classify(ctx: FailureContext): Promise<Classification> {
  const prompt = `You are triaging an n8n workflow failure for an internal ops dashboard.

Workflow: "${ctx.workflowName}"
Failed node: ${ctx.failedNode ?? "(unknown)"}
Error: ${ctx.rawError ?? "(no message)"}

Classify the error into ONE of:
  - transient        → network blip, 429, 5xx, timeout, intermittent — safe to auto-retry
  - logic_bug        → bad expression, missing field, null handling, mapping issue — fixable by patching the workflow JSON
  - auth             → expired token, revoked OAuth, 401/403 from an upstream API — needs human re-auth
  - upstream         → external service changed schema/endpoint, downstream API permanently broken
  - unknown          → can't tell from message alone

Respond as JSON only:
{
  "kind": "transient" | "logic_bug" | "auth" | "upstream" | "unknown",
  "confidence": 0.0,
  "reasoning": "one sentence",
  "rootCause": "one sentence root cause",
  "recommendation": "one short actionable next step"
}`;

  const text = (await callClaude(prompt)) ?? (await callGemini(prompt));
  const parsed = extractJson(text) as Partial<Classification> | null;
  if (!parsed || !parsed.kind) {
    return {
      kind: "unknown",
      confidence: 0,
      reasoning: "classifier returned no parseable JSON",
      rootCause: ctx.rawError ?? "(no message)",
      recommendation: "open the execution in n8n and inspect manually",
    };
  }
  return {
    kind: parsed.kind as Classification["kind"],
    confidence: Number(parsed.confidence ?? 0),
    reasoning: parsed.reasoning ?? "",
    rootCause: parsed.rootCause ?? "",
    recommendation: parsed.recommendation ?? "",
  };
}

async function retryExecution(
  executionId: string,
): Promise<{ ok: boolean; newId: string | null }> {
  const r = await fetch(
    `${N8N_URL}/api/v1/executions/${executionId}/retry`,
    {
      method: "POST",
      headers: { "X-N8N-API-KEY": N8N_API_KEY },
    },
  );
  if (!r.ok) return { ok: false, newId: null };
  try {
    const j = (await r.json()) as { id?: string | number };
    return { ok: true, newId: j.id !== undefined ? String(j.id) : null };
  } catch {
    return { ok: true, newId: null };
  }
}

interface N8nWorkflow {
  id: string;
  name: string;
  active?: boolean;
  nodes: unknown[];
  connections: unknown;
  settings?: unknown;
  staticData?: unknown;
}

async function fetchWorkflow(id: string): Promise<N8nWorkflow | null> {
  const r = await fetch(`${N8N_URL}/api/v1/workflows/${id}`, {
    headers: { "X-N8N-API-KEY": N8N_API_KEY },
    cache: "no-store",
  });
  if (!r.ok) return null;
  return (await r.json()) as N8nWorkflow;
}

async function proposeFix(
  ctx: FailureContext,
  cls: Classification,
  workflow: N8nWorkflow,
): Promise<{ patched: N8nWorkflow; summary: string } | null> {
  // We send the full workflow + the error. Claude returns the full
  // patched workflow body (same shape as PUT requires), plus a
  // one-line summary of what changed. Full-body is safer than diff —
  // less ambiguity about what to apply.
  const prompt = `You are fixing an n8n workflow that just failed in production.

Failed node: "${ctx.failedNode ?? "(unknown)"}"
Error: ${ctx.rawError ?? "(no message)"}
Classifier reasoning: ${cls.reasoning}
Recommended next step: ${cls.recommendation}

Here is the current workflow JSON:
\`\`\`json
${JSON.stringify(
  { name: workflow.name, nodes: workflow.nodes, connections: workflow.connections, settings: workflow.settings ?? {} },
  null,
  2,
)}
\`\`\`

Return ONLY the patched workflow as JSON in this exact shape:
{
  "summary": "one-line plain-English description of what you changed",
  "workflow": { "name": "...", "nodes": [...], "connections": {...}, "settings": {...} }
}

Rules:
- Preserve every node id, name and position unless renaming is the fix.
- Only modify what's needed to address the error.
- Don't invent new credentials, secrets, or webhooks.
- If the fix needs human judgment (auth, schema change), return summary "skip" and copy the workflow unchanged.`;

  const text = await callClaude(prompt, 8000);
  if (!text) return null;
  const parsed = extractJson(text) as {
    summary?: string;
    workflow?: N8nWorkflow;
  } | null;
  if (
    !parsed ||
    !parsed.workflow ||
    !Array.isArray(parsed.workflow.nodes) ||
    parsed.summary === "skip"
  ) {
    return null;
  }
  return { patched: parsed.workflow, summary: parsed.summary ?? "" };
}

function sb() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

function renderDigest(
  reviews: Array<{
    ctx: FailureContext;
    cls: Classification;
    action: "retried" | "proposed" | "manual";
    retryNewId?: string | null;
    retryOk?: boolean;
    proposalSummary?: string;
  }>,
  windowHours: number,
): string {
  const head = `<h2 style="font-family:ui-sans-serif,system-ui;margin:0 0 8px">n8n digest · last ${windowHours}h</h2>
<p style="font-family:ui-sans-serif,system-ui;color:#64748b;margin:0 0 16px">${reviews.length} execution${reviews.length === 1 ? "" : "s"} failed.</p>`;
  if (reviews.length === 0) {
    return `${head}<p style="font-family:ui-sans-serif,system-ui">All workflows clean. 🟢</p>`;
  }
  const body = reviews
    .map((r) => {
      const link = `${N8N_URL}/workflow/${r.ctx.workflowId}/executions/${r.ctx.executionId}`;
      const badge =
        r.action === "retried"
          ? `<span style="background:#dcfce7;color:#166534;padding:2px 8px;border-radius:4px;font-size:11px;font-family:ui-monospace,Menlo,monospace">auto-retried${r.retryOk ? "" : " (failed)"}</span>`
          : r.action === "proposed"
            ? `<span style="background:#dbeafe;color:#1e40af;padding:2px 8px;border-radius:4px;font-size:11px;font-family:ui-monospace,Menlo,monospace">fix proposed · review in /admin/ops</span>`
            : `<span style="background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:4px;font-size:11px;font-family:ui-monospace,Menlo,monospace">needs human review</span>`;
      return `<div style="font-family:ui-sans-serif,system-ui;border:1px solid #e2e8f0;border-radius:12px;padding:14px;margin-bottom:10px">
  <div style="display:flex;justify-content:space-between;gap:8px;font-size:13px;align-items:center;flex-wrap:wrap">
    <strong>${r.ctx.workflowName || r.ctx.workflowId}</strong>
    ${badge}
    <a href="${link}" style="color:#475569;text-decoration:none;font-family:ui-monospace,Menlo,monospace;font-size:11px">open in n8n →</a>
  </div>
  <div style="font-size:11px;color:#94a3b8;font-family:ui-monospace,Menlo,monospace;margin-top:2px">
    ${new Date(r.ctx.startedAt).toUTCString()} · node: ${r.ctx.failedNode ?? "(unknown)"} · class: ${r.cls.kind} (${r.cls.confidence.toFixed(2)})
  </div>
  ${r.ctx.rawError ? `<pre style="margin:8px 0 0;padding:8px;background:#fef2f2;color:#b91c1c;border-radius:6px;font-size:11px;white-space:pre-wrap;word-break:break-word">${escapeHtml(r.ctx.rawError)}</pre>` : ""}
  ${r.cls.rootCause ? `<p style="margin:8px 0 4px;font-size:13px"><strong>Causa:</strong> ${escapeHtml(r.cls.rootCause)}</p>` : ""}
  ${r.cls.recommendation ? `<p style="margin:0;font-size:13px;color:#065f46"><strong>Próximo paso:</strong> ${escapeHtml(r.cls.recommendation)}</p>` : ""}
  ${r.proposalSummary ? `<p style="margin:6px 0 0;font-size:12.5px;color:#1e40af"><strong>Fix propuesto:</strong> ${escapeHtml(r.proposalSummary)}</p>` : ""}
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

  const r = await fetch(
    `${N8N_URL}/api/v1/executions?status=error&limit=250`,
    { headers: { "X-N8N-API-KEY": N8N_API_KEY }, cache: "no-store" },
  );
  if (!r.ok) {
    return NextResponse.json({ error: `n8n ${r.status}` }, { status: 502 });
  }
  const j = (await r.json()) as { data: N8nExecListItem[] };
  const failed = (j.data ?? []).filter((e) => e.startedAt >= since);

  const supabase = sb();
  const reviews: Array<{
    ctx: FailureContext;
    cls: Classification;
    action: "retried" | "proposed" | "manual";
    retryNewId?: string | null;
    retryOk?: boolean;
    proposalSummary?: string;
  }> = [];

  let retries = 0;
  let proposals = 0;

  for (const exec of failed) {
    const ctx = await fetchExecutionContext(exec);
    if (!ctx) continue;
    const cls = await classify(ctx);

    // ── Auto-retry transient errors ───────────────────────────────────
    if (cls.kind === "transient" && cls.confidence >= MIN_AUTO_RETRY) {
      // Idempotency: ON CONFLICT on (execution_id) WHERE kind='retry'
      const { data: existing } = supabase
        ? await supabase
            .from("ops_auto_actions")
            .select("id")
            .eq("kind", "retry")
            .eq("execution_id", exec.id)
            .maybeSingle()
        : { data: null };
      if (!existing) {
        const retry = await retryExecution(exec.id);
        retries++;
        if (supabase) {
          await supabase.from("ops_auto_actions").insert({
            kind: "retry",
            workflow_id: ctx.workflowId,
            workflow_name: ctx.workflowName,
            execution_id: ctx.executionId,
            failed_node: ctx.failedNode,
            raw_error: ctx.rawError,
            classification: cls.kind,
            confidence: cls.confidence,
            reasoning: cls.reasoning,
            retry_execution_id: retry.newId,
            retry_status: retry.ok ? "running" : "failed-to-trigger",
            status: retry.ok ? "applied" : "failed",
            applied_at: new Date().toISOString(),
            applied_by: "cron-auto-retry",
            apply_error: retry.ok ? null : "n8n retry endpoint rejected",
          });
        }
        reviews.push({
          ctx,
          cls,
          action: "retried",
          retryNewId: retry.newId,
          retryOk: retry.ok,
        });
        continue;
      }
    }

    // ── Propose a fix for logic bugs ──────────────────────────────────
    if (cls.kind === "logic_bug" && cls.confidence >= MIN_PROPOSE) {
      // Skip if there's already a pending proposal for this workflow.
      const { data: existing } = supabase
        ? await supabase
            .from("ops_auto_actions")
            .select("id")
            .eq("kind", "proposal")
            .eq("workflow_id", ctx.workflowId)
            .eq("status", "pending")
            .maybeSingle()
        : { data: null };
      if (!existing) {
        const wf = await fetchWorkflow(ctx.workflowId);
        if (wf) {
          const proposal = await proposeFix(ctx, cls, wf);
          if (proposal) {
            proposals++;
            if (supabase) {
              await supabase.from("ops_auto_actions").insert({
                kind: "proposal",
                workflow_id: ctx.workflowId,
                workflow_name: ctx.workflowName,
                execution_id: ctx.executionId,
                failed_node: ctx.failedNode,
                raw_error: ctx.rawError,
                classification: cls.kind,
                confidence: cls.confidence,
                reasoning: cls.reasoning,
                proposed_patch: proposal.patched,
                original_snapshot: wf,
                proposal_summary: proposal.summary,
                status: "pending",
              });
            }
            reviews.push({
              ctx,
              cls,
              action: "proposed",
              proposalSummary: proposal.summary,
            });
            continue;
          }
        }
      }
    }

    // ── Everything else just goes into the digest ─────────────────────
    reviews.push({ ctx, cls, action: "manual" });
  }

  const html = renderDigest(reviews, WINDOW_H);
  const emailSent = await sendDigest(html, reviews.length);

  return NextResponse.json({
    ok: true,
    windowHours: WINDOW_H,
    errorsFound: reviews.length,
    retries,
    proposals,
    aiUsed: ANTHROPIC_KEY ? "claude" : GEMINI_KEY ? "gemini" : "none",
    emailSent,
  });
}
