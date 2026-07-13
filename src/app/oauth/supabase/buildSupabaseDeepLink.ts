/**
 * Pure helper for the Supabase-auth callback deep link. Kept separate from
 * `buildDeepLink.ts` (the Drive OAuth helper) because the two flows use
 * different URL schemes and different query contracts, and mixing them
 * historically caused round-trips to break in subtle ways.
 *
 * Contract:
 *   - Input:  the querystring `params` from the Next.js server component +
 *             the URL fragment (implicit-flow tokens).
 *   - Output: a `terminalsync[-lab]://auth/callback?...#...` URL that the
 *             native Tauri app's `handleAuthCallback` will pick up (see
 *             src/lib/account.ts in the desktop repo).
 *
 * Scheme selection is DRIVEN BY QUERY, not state. Supabase's magic-link
 * flow does not surface a state param, so we ask the caller (the app) to
 * pass `?flavor=lab` on the redirect URL. When absent, we default to prod.
 */

export interface SupabaseCallbackParams {
  code?: string;
  state?: string;
  flavor?: string;
  error?: string;
  error_code?: string;
  error_description?: string;
}

/**
 * Assemble the deep link. Returns `null` when neither the query `code` nor
 * a hash `access_token` is present — the caller renders the malformed
 * card instead of dispatching.
 */
export function buildSupabaseDeepLink(
  params: SupabaseCallbackParams,
  hashFragment: string,
): string | null {
  const hasCode = !!params.code;
  const hasHashToken = hashFragment.includes("access_token=");
  if (!hasCode && !hasHashToken) return null;

  const scheme = params.flavor === "lab" ? "terminalsync-lab" : "terminalsync";

  const search: string[] = [];
  if (params.code) search.push(`code=${encodeURIComponent(params.code)}`);
  if (params.state) search.push(`state=${encodeURIComponent(params.state)}`);
  const searchStr = search.length ? `?${search.join("&")}` : "";
  const hashStr = hashFragment ? `#${hashFragment}` : "";

  return `${scheme}://auth/callback${searchStr}${hashStr}`;
}
