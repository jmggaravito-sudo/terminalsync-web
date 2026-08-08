/**
 * Hosting an image just long enough for Instagram to fetch it.
 *
 * Facebook takes the bytes directly; Instagram's container step accepts only
 * `image_url` and fetches the picture itself. That single asymmetry is what
 * used to end the flow at a text field asking a salon owner for "a public URL
 * of the image" — something they have no way to produce.
 *
 * So the picture is parked in Supabase Storage and handed back as a signed URL
 * that Meta can read for an hour. Signed rather than public: an ad that has not
 * been published yet should not be world-readable forever because it once
 * passed through here.
 */
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const SOCIAL_IMAGE_BUCKET = "social-images";

/** Instagram rejects anything larger; failing here beats failing at Meta. */
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

/** Meta fetches within seconds; an hour is generous and still expires. */
export const SIGNED_URL_TTL_SECONDS = 60 * 60;

const ALLOWED: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

export type HostFailure =
  | "unsupported_type"
  | "too_large"
  | "empty"
  | "storage_unavailable"
  | "upload_failed";

export interface HostResult {
  url: string;
  expiresInSeconds: number;
}

/** What the endpoint accepts, checked before a byte is stored. */
export function validateImage(
  contentType: string | undefined,
  byteLength: number,
): { ok: true; ext: string } | { ok: false; reason: HostFailure } {
  const normalized = (contentType ?? "").split(";")[0]!.trim().toLowerCase();
  const ext = ALLOWED[normalized];
  if (!ext) return { ok: false, reason: "unsupported_type" };
  if (byteLength <= 0) return { ok: false, reason: "empty" };
  if (byteLength > MAX_IMAGE_BYTES) return { ok: false, reason: "too_large" };
  return { ok: true, ext };
}

/**
 * Where a user's image lives. Namespaced by user so one account can never
 * overwrite or guess another's object.
 */
export function storagePath(userId: string, ext: string, unique: string): string {
  const safeUser = userId.replace(/[^a-zA-Z0-9_-]/g, "");
  const safeUnique = unique.replace(/[^a-zA-Z0-9_-]/g, "");
  return `${safeUser}/${safeUnique}.${ext}`;
}

export async function hostImageForMeta(input: {
  userId: string;
  bytes: Uint8Array;
  contentType: string;
  ext: string;
  unique: string;
}): Promise<{ ok: true; result: HostResult } | { ok: false; reason: HostFailure }> {
  const sb = getSupabaseAdmin();
  if (!sb) return { ok: false, reason: "storage_unavailable" };

  const path = storagePath(input.userId, input.ext, input.unique);
  const upload = await sb.storage
    .from(SOCIAL_IMAGE_BUCKET)
    .upload(path, input.bytes, { contentType: input.contentType, upsert: false });
  if (upload.error) return { ok: false, reason: "upload_failed" };

  const signed = await sb.storage
    .from(SOCIAL_IMAGE_BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
  if (signed.error || !signed.data?.signedUrl) return { ok: false, reason: "upload_failed" };

  return {
    ok: true,
    result: { url: signed.data.signedUrl, expiresInSeconds: SIGNED_URL_TTL_SECONDS },
  };
}
