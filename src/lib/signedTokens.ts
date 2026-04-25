// HMAC-signed tokens for one-click email links (billing portal + unsubscribe).
//
// Why HMAC-signed instead of opaque DB tokens?
//   - No DB round-trip on click → portal page redirects to Stripe in <100ms
//   - Stateless — no row to clean up after one-time use
//   - Works fine for short-lived URLs (we encode an expiry inside the payload)
//
// The signing key is STRIPE_WEBHOOK_SECRET reused — same security boundary
// (server-only, rotates if Stripe is rotated). Could split to a dedicated
// SIGNED_URL_SECRET later if we want independent rotation.

import { createHmac, timingSafeEqual } from "node:crypto";

const SECRET = process.env.STRIPE_WEBHOOK_SECRET;

interface TokenPayload {
  /** Subject — what this token authorizes. e.g. customer_id, user email. */
  sub: string;
  /** Token kind so a billing token can't be replayed as an unsub token. */
  kind: "billing" | "unsubscribe";
  /** Expiry as unix seconds. */
  exp: number;
}

/**
 * Sign `payload` and return a URL-safe base64 token. Encoded as
 * `{base64(payload)}.{hex(hmac)}`. Compact enough to fit in any URL bar.
 */
export function signToken(
  sub: string,
  kind: TokenPayload["kind"],
  ttlSeconds: number,
): string {
  if (!SECRET) {
    throw new Error("STRIPE_WEBHOOK_SECRET missing — can't sign tokens");
  }
  const payload: TokenPayload = {
    sub,
    kind,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", SECRET).update(encoded).digest("hex");
  return `${encoded}.${sig}`;
}

/**
 * Verify + decode a token. Returns the subject string when valid, null
 * when the signature doesn't match, the kind doesn't match, or the
 * token has expired. Use timingSafeEqual to avoid leaking byte position
 * via comparison time.
 */
export function verifyToken(
  token: string | null | undefined,
  expectedKind: TokenPayload["kind"],
): string | null {
  if (!SECRET || !token) return null;
  const dot = token.lastIndexOf(".");
  if (dot < 1) return null;
  const encoded = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  const expectedSig = createHmac("sha256", SECRET).update(encoded).digest("hex");
  // timingSafeEqual requires equal-length buffers
  if (sig.length !== expectedSig.length) return null;
  const sigBuf = Buffer.from(sig, "hex");
  const expectedBuf = Buffer.from(expectedSig, "hex");
  if (sigBuf.length !== expectedBuf.length) return null;
  if (!timingSafeEqual(sigBuf, expectedBuf)) return null;

  let payload: TokenPayload;
  try {
    payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    ) as TokenPayload;
  } catch {
    return null;
  }
  if (payload.kind !== expectedKind) return null;
  if (payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload.sub;
}

// ── Convenience constructors used by the email helpers ──────────────────

export function signBillingToken(customerId: string): string {
  // 7 days — emails sit in inboxes; this should still work when the user
  // gets to it next weekend.
  return signToken(customerId, "billing", 7 * 24 * 3600);
}

export function signUnsubToken(email: string): string {
  // 90 days — RFC 8058 wants list-unsubscribe to remain valid for a
  // "reasonable" time; 3 months is what most providers use.
  return signToken(email.toLowerCase(), "unsubscribe", 90 * 24 * 3600);
}
