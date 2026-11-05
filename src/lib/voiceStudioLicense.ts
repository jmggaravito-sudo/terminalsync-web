import { signToken, verifyToken } from "./signedTokens";

// Voice Studio voice-license signing links (standalone dubbing business).
// The token authorizes exactly one subject: the lead's email address.
// TTL is generous (14 days) because the lead decides when to sign, but the
// link still expires — JM re-mints from the ops view if it lapses.
//
// Acceptance is the hard gate of the business rule: no voice clone is ever
// produced before this link has been used to accept the license (recorded
// with timestamp, IP and UA in /api/voice-studio/license/accept).

export const LICENSE_VERSION = "2026-11-05-v1";
const LICENSE_TTL_SECONDS = 14 * 24 * 60 * 60;

export function licenseSub(email: string): string {
  return `vs-license:${email.trim().toLowerCase()}`;
}

export function mintLicenseToken(email: string): string {
  return signToken(licenseSub(email), "vs-license", LICENSE_TTL_SECONDS);
}

export function licenseUrl(email: string): string {
  return `https://terminalsync.ai/voice-studio/license?t=${mintLicenseToken(email)}`;
}

/** Returns the licensed email when the token is valid, else null. */
export function emailFromLicenseToken(
  token: string | null | undefined,
): string | null {
  const sub = verifyToken(token, "vs-license");
  if (!sub?.startsWith("vs-license:")) return null;
  return sub.slice("vs-license:".length);
}
