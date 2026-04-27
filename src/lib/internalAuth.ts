// Shared auth for /api/internal/* endpoints. The n8n outreach pipeline
// authenticates with a single shared-secret bearer token (INTERNAL_LEADS_TOKEN).
// Token comparison is constant-time so length / prefix don't leak.

export type InternalAuthResult =
  | { ok: true }
  | { ok: false; status: number; error: string };

export function authenticateInternal(req: Request): InternalAuthResult {
  const expected = process.env.INTERNAL_LEADS_TOKEN;
  if (!expected) {
    return {
      ok: false,
      status: 503,
      error: "Internal endpoint not configured (INTERNAL_LEADS_TOKEN missing)",
    };
  }
  const auth = req.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token || !timingSafeEqual(token, expected)) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }
  return { ok: true };
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}
