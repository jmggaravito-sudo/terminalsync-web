import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { productionError, readOpsOrders, updateProduction, uuidPattern, type OrderStatus } from "@/lib/voiceStudioProduction";

export const runtime = "nodejs";
const headers = { "Cache-Control": "private, no-store" };
const statuses = new Set<OrderStatus>(["queued", "in_progress", "delivered"]);
const fail = (error: string, status: number) => NextResponse.json({ error }, { status, headers });

async function guard(req: Request) {
  const bearer = req.headers.get("authorization");
  const db = getSupabaseAdmin();
  if (!bearer?.startsWith("Bearer ") || !db) return fail("Sign in to continue.", 401);
  const { data, error } = await db.auth.getUser(bearer.slice(7).trim());
  if (error || !data.user?.email_confirmed_at) return fail("Sign in to continue.", 401);
  const user = data.user;
  const allow = (process.env.VOICE_STUDIO_OPS_EMAILS ?? process.env.ADMIN_EMAILS ?? "")
    .split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
  return user.email && allow.includes(user.email.toLowerCase()) ? null : fail("You do not have production access.", 403);
}

function deliveryUrl(value: unknown) {
  if (value === null || value === "") return null;
  if (typeof value !== "string" || value.length > 2048) return undefined;
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" && !url.username && !url.password ? url.href : undefined;
  } catch { return undefined; }
}

export async function GET(req: Request) {
  const denied = await guard(req);
  if (denied) return denied;
  const url = new URL(req.url);
  const status = (url.searchParams.get("status") ?? "queued") as OrderStatus;
  const page = Number(url.searchParams.get("page") ?? 0);
  if (!statuses.has(status) || !Number.isInteger(page) || page < 0 || page > 1000) {
    return fail("Invalid queue filter.", 400);
  }
  try {
    return NextResponse.json(await readOpsOrders(status, page), { headers });
  } catch {
    return fail("Could not load the production queue.", 503);
  }
}

export async function PATCH(req: Request) {
  const denied = await guard(req);
  if (denied) return denied;
  let body: Record<string, unknown>;
  try {
    const input: unknown = await req.json();
    if (!input || typeof input !== "object" || Array.isArray(input)) return fail("Invalid request.", 400);
    body = input as Record<string, unknown>;
  } catch {
    return fail("Invalid request.", 400);
  }
  const status = body.status as OrderStatus;
  const units = body.video_units;
  const videoUrl = deliveryUrl(body.video_url);
  const shortUrl = deliveryUrl(body.short_url);
  if (typeof body.id !== "string" || !uuidPattern.test(body.id) || !statuses.has(status) ||
      typeof units !== "number" || ![1, 2, 3].includes(units) || videoUrl === undefined || shortUrl === undefined) {
    return fail("Check the status, video credits and HTTPS delivery links.", 400);
  }
  try {
    await updateProduction(body.id, status, videoUrl, shortUrl, units);
    return NextResponse.json({ ok: true }, { headers });
  } catch (error) {
    const { status: code, message } = productionError(error);
    return fail(message, code);
  }
}
