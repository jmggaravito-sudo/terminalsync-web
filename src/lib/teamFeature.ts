/**
 * Team schema and its approval-first collaboration APIs are deployed behind a
 * server-only availability gate. Keep this off until the reviewed production
 * migration chain and authenticated smoke have both completed.
 */
export function isTeamFeatureEnabled(environment: Record<string, string | undefined> = process.env): boolean {
  return environment.TEAM_FEATURE_ENABLED === "1";
}

/**
 * The controlled production smoke has exactly two designated Supabase Auth
 * users. This name intentionally has no NEXT_PUBLIC_ prefix: the list is a
 * server-only control, never a browser entitlement hint.
 */
export const TEAM_SMOKE_ALLOWLIST_USER_IDS_ENV = "TEAM_SMOKE_ALLOWLIST_USER_IDS";

const SUPABASE_USER_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function teamSmokeAllowlist(environment: Record<string, string | undefined>): ReadonlySet<string> | null {
  const raw = environment[TEAM_SMOKE_ALLOWLIST_USER_IDS_ENV];
  if (typeof raw !== "string") return null;

  const ids = raw.split(",").map((value) => value.trim().toLowerCase());
  // A controlled two-account smoke must never quietly broaden into a general
  // rollout. Reject blank, duplicate, non-UUID, or extra entries instead.
  if (ids.length !== 2 || ids.some((id) => !SUPABASE_USER_ID.test(id))) return null;

  const allowlist = new Set(ids);
  return allowlist.size === 2 ? allowlist : null;
}

/**
 * True only when the server configuration names exactly two distinct Supabase
 * Auth UUIDs. An absent or malformed configuration is deliberately deny-all.
 */
export function hasValidTeamSmokeAllowlist(environment: Record<string, string | undefined> = process.env): boolean {
  return teamSmokeAllowlist(environment) !== null;
}

/**
 * Checks a canonical identity returned by Supabase Auth, never a user id from
 * a request body, query string, or unverified header. Call this only after
 * the global Team gate is on and the bearer token has been verified.
 */
export function isTeamSmokeUserAllowed(
  userId: string,
  environment: Record<string, string | undefined> = process.env,
): boolean {
  return teamSmokeAllowlist(environment)?.has(userId.toLowerCase()) ?? false;
}

/**
 * Paid Team checkout has a second, independently default-off gate. Requiring
 * the general Team gate as well means setting this flag alone cannot make a
 * billing route touch Stripe or the Team metadata database.
 */
export function isTeamPaidCheckoutEnabled(environment: Record<string, string | undefined> = process.env): boolean {
  return isTeamFeatureEnabled(environment) && environment.TEAM_PAID_CHECKOUT_ENABLED === "1";
}
