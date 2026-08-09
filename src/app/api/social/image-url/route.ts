import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

import { authenticate } from "@/lib/marketplace/auth";
import { corsHeaders, preflight } from "@/lib/cors";
import { hostImageForMeta, MAX_IMAGE_BYTES, validateImage } from "@/lib/socialImageHost";

/**
 * Give an image a URL Meta can fetch.
 *
 * Only Instagram needs this: its container step takes `image_url` and no bytes,
 * while Facebook accepts the file directly. Before this existed, the flow ended
 * at a text field asking the customer for "a public URL of the image".
 *
 * Authenticated on purpose — this writes to our storage, so it is not an open
 * file host.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MESSAGES: Record<string, { error: string; code: string; status: number }> = {
  unsupported_type: {
    error: "Only PNG, JPEG or WebP images can be published.",
    code: "unsupported_type",
    status: 400,
  },
  too_large: {
    error: "That image is too large to publish. Use one under 8 MB.",
    code: "too_large",
    status: 400,
  },
  empty: { error: "The image is empty.", code: "empty", status: 400 },
  storage_unavailable: {
    error: "Publishing images is temporarily unavailable.",
    code: "storage_unavailable",
    status: 503,
  },
  upload_failed: {
    error: "Publishing images is temporarily unavailable.",
    code: "upload_failed",
    status: 503,
  },
};

export async function OPTIONS(req: Request) {
  return preflight(req, "POST, OPTIONS");
}

export async function POST(req: Request) {
  const cors = corsHeaders(req.headers.get("origin"), "POST, OPTIONS");
  const json = (data: unknown, status: number) =>
    NextResponse.json(data, { status, headers: cors });

  const user = await authenticate(req);
  if (!user) {
    return json({ error: "Sign in again before publishing.", code: "sign_in_required" }, 401);
  }

  let body: { imageBase64?: string; contentType?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return json({ error: "Invalid request.", code: "invalid_request" }, 400);
  }

  const raw = (body.imageBase64 ?? "").replace(/^data:[^;]+;base64,/, "");
  if (!raw) return json(MESSAGES.empty, MESSAGES.empty!.status);

  // Decode before validating the size: a base64 string is ~4/3 of the bytes it
  // carries, so checking the string length would reject legitimate images.
  let bytes: Buffer;
  try {
    bytes = Buffer.from(raw, "base64");
  } catch {
    return json({ error: "Invalid request.", code: "invalid_request" }, 400);
  }
  if (bytes.byteLength > MAX_IMAGE_BYTES) {
    return json(MESSAGES.too_large, MESSAGES.too_large!.status);
  }

  const check = validateImage(body.contentType, bytes.byteLength);
  if (!check.ok) {
    const m = MESSAGES[check.reason]!;
    return json({ error: m.error, code: m.code }, m.status);
  }

  const hosted = await hostImageForMeta({
    userId: user.id,
    bytes,
    contentType: (body.contentType ?? "").split(";")[0]!.trim().toLowerCase(),
    ext: check.ext,
    unique: randomUUID(),
  });
  if (!hosted.ok) {
    const m = MESSAGES[hosted.reason]!;
    return json({ error: m.error, code: m.code }, m.status);
  }

  return json(hosted.result, 200);
}
