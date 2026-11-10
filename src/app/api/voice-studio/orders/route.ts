import { NextResponse } from "next/server";
import { Resend } from "resend";
import { emailFromClientRequest } from "@/lib/voiceStudioAuth";
import { licenseUrl } from "@/lib/voiceStudioLicense";
import { listClientOrders } from "@/lib/voiceStudioCrm";
import {
  parseOrder, productionError, readProduction, submitProduction, uuidPattern,
  type ProductionOrder,
} from "@/lib/voiceStudioProduction";

export const runtime = "nodejs";
const headers = { "Cache-Control": "private, no-store" };

function failure(error: string, status: number) {
  return NextResponse.json({ error }, { status, headers });
}

async function notifyProduction(orders: ProductionOrder[]) {
  if (!orders.length) return;
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("[voice-studio] order alert unavailable: RESEND_API_KEY not set");
    return;
  }
  try {
    const { error } = await new Resend(key).emails.send({
      from: "Voice Studio <hola@terminalsync.ai>",
      to: process.env.VOICE_STUDIO_ORDERS_NOTIFY_EMAIL?.trim() || "hola@terminalsync.ai",
      subject: `Voice Studio: ${orders.length} new production ${orders.length === 1 ? "request" : "requests"}`,
      text: "A new request was added to the production queue. Sign in to see the client, plan and instructions: https://terminalsync.ai/admin/voice-studio/production",
    }, { idempotencyKey: `voice-studio-order/${orders[0].id}` });
    if (error) console.error("[voice-studio] order alert failed", error.name);
  } catch {
    console.error("[voice-studio] order alert failed");
  }
}

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("t");
  const email = (await emailFromClientRequest(req, token))?.trim().toLowerCase();
  if (!email) return failure("Sign in or use a valid dashboard link.", 401);

  try {
    const [production, legacyOrders] = await Promise.all([readProduction(email), listClientOrders(email)]);
    return NextResponse.json({
      ok: true, email, ...production, legacyOrders: legacyOrders ?? [],
      legacyOrdersAvailable: legacyOrders !== null, licenseUrl: licenseUrl(email),
    }, { headers });
  } catch {
    return failure("Voice Studio is temporarily unavailable. Please try again.", 503);
  }
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    const input: unknown = await req.json();
    if (!input || typeof input !== "object" || Array.isArray(input)) return failure("Invalid request.", 400);
    body = input as Record<string, unknown>;
  } catch {
    return failure("Invalid request.", 400);
  }
  const email = (await emailFromClientRequest(req, typeof body.token === "string" ? body.token : null))?.trim().toLowerCase();
  if (!email) return failure("Sign in or use a valid dashboard link.", 401);
  const { requestId, entitlementId } = body;
  if (typeof requestId !== "string" || !uuidPattern.test(requestId) ||
      typeof entitlementId !== "string" || !uuidPattern.test(entitlementId) ||
      !Array.isArray(body.orders) || body.orders.length < 1 || body.orders.length > 8) {
    return failure("Select a plan and submit between 1 and 8 videos.", 400);
  }
  const orders = body.orders.map(parseOrder);
  if (orders.some((order) => order === null)) {
    return failure("Check the YouTube links, notes and Short/Reel timestamps.", 400);
  }
  if (new Set(orders.map((order) => order?.source_url)).size !== orders.length) {
    return failure("Submit each YouTube video only once in this request.", 400);
  }
  try {
    const saved = await submitProduction(email, entitlementId, requestId, orders.filter((order) => order !== null));
    // The order is durable before email. Resend deduplicates immediate retries;
    // the ops queue remains authoritative if notification is unavailable.
    if (saved.length && Date.now() - Date.parse(saved[0].created_at) < 10 * 60 * 1000) {
      await notifyProduction(saved);
    }
    return NextResponse.json({ ok: true, orders: saved }, { headers });
  } catch (error) {
    const { status, message } = productionError(error);
    return failure(message, status);
  }
}
