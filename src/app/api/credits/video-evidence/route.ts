/** Private orchestrator -> evidence, never a client-reported failure endpoint.
 * Deployment requires an independent n8n credential and Vercel secret.
 *
 * `reserve` is also the funds gate: it debits (or confirms the app's debit of)
 * the server-side price for the quote's model and duration, atomically, before
 * the orchestrator may call the provider. The amount never comes from the wire.
 */
import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { authenticate } from "@/lib/marketplace/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { videoPriceMicros } from "@/lib/videoPricing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const reply = (error: string, status: number) => NextResponse.json({ error }, { status });
const JOB = /^vj_[a-f0-9]{32}$/;
const DEBIT = /^design-video:vq_[a-f0-9]{32}$/;
const PREDICTION = /^[A-Za-z0-9_-]{1,200}$/;
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;

export async function POST(req: Request) {
  const secret = process.env.VIDEO_REFUND_EVIDENCE_SECRET;
  if (!secret || secret.length < 32) return reply("evidence_not_configured", 503);
  const supplied = Buffer.from(req.headers.get("x-ts-video-evidence") ?? "");
  const expected = Buffer.from(secret);
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
    return reply("unauthorized", 401);
  }

  const sb = getSupabaseAdmin();
  if (!sb) return reply("evidence_not_configured", 503);
  let body: Record<string, unknown>;
  try {
    const text = await req.text();
    if (Buffer.byteLength(text) > 4096) return reply("invalid_evidence", 400);
    body = JSON.parse(text);
  } catch {
    return reply("invalid_evidence", 400);
  }
  if (!body || typeof body !== "object" || Array.isArray(body) ||
      !["reserve", "submitted", "terminal"].includes(String(body.event)) ||
      typeof body.accountId !== "string" || !UUID.test(body.accountId) ||
      typeof body.jobId !== "string" || !JOB.test(body.jobId) ||
      typeof body.originalIdempotencyKey !== "string" || !DEBIT.test(body.originalIdempotencyKey)) {
    return reply("invalid_evidence", 400);
  }
  if (body.event === "reserve") {
    // A private writer cannot bind a caller's arbitrary accountId. Require the
    // actual initiating user's verified JWT before permitting provider submit.
    const user = await authenticate(req);
    if (!user || user.id !== body.accountId) return reply("account_binding_required", 401);
    // The price is decided here from the quote's model and duration (recorded
    // by the orchestrator), never from an amount supplied in the request.
    const price = videoPriceMicros(body.modelId, body.durationSeconds);
    if (price === null) return reply("video_not_priced", 400);
    const reserved = await sb.rpc("reserve_ai_video_funds", {
      p_user_id: body.accountId,
      p_key: body.originalIdempotencyKey,
      p_job_id: body.jobId,
      p_price_micros: price,
    });
    if (reserved.error) {
      const detail = String(reserved.error.message ?? "");
      if (detail.includes("insufficient video funds")) return reply("insufficient_funds", 402);
      if (detail.includes("video debit mismatch")) return reply("video_debit_mismatch", 409);
      return reply("evidence_conflict", 409);
    }
    const row = Array.isArray(reserved.data) ? reserved.data[0] : reserved.data;
    return NextResponse.json({ ok: true, applied: true, debited: row?.out_debited === true });
  } else if (typeof body.predictionId !== "string" || !PREDICTION.test(body.predictionId) ||
      (body.event === "terminal" && !["failed", "completed"].includes(String(body.status)))) {
    return reply("invalid_evidence", 400);
  }

  const { data, error } = await sb.rpc("record_ai_video_evidence", {
    p_event: body.event,
    p_user_id: body.accountId,
    p_key: body.originalIdempotencyKey,
    p_job_id: body.jobId,
    p_prediction_id: body.event === "reserve" ? null : body.predictionId,
    p_status: body.event === "terminal" ? body.status : null,
  });
  if (error) return reply("evidence_conflict", 409);
  return NextResponse.json({ ok: true, applied: data === true });
}
