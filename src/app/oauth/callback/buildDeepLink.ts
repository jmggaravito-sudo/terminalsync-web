/**
 * Pure helper for the OAuth callback deep-link.
 *
 * Pulled out of `CallbackClient.tsx` so the contract is unit-testable
 * (vitest is configured `environment: "node"` with `*.test.ts` only,
 * so the React client can't be tested in-place).
 *
 * Two responsibilities:
 *
 *  1. **Pick the right URL scheme.** A Lab build (`Terminal Sync Lab.app`)
 *     registers `terminalsync-lab://` as its OS handler; production
 *     (`Terminal Sync.app`) registers `terminalsync://`. We tell them
 *     apart by the prefix the app put into the OAuth state when starting
 *     the flow: `tslab:<random>` → Lab; anything else → prod. Without
 *     this split, Lab callbacks open the prod app (or nothing, if prod
 *     isn't installed) and the Lab login hangs at the spinner until it
 *     times out ~5 min later.
 *
 *  2. **Keep `state` byte-exact across the round-trip.** The native
 *     handler validates the returned state against the value it generated
 *     before opening the OAuth flow (CSRF anti-replay). `URLSearchParams`
 *     percent-encodes `:` → `%3A` on serialize. If the receiver doesn't
 *     URL-decode (which has been the failure mode here), `tslab:abc`
 *     becomes `tslab%3Aabc` on the wire and validation aborts with
 *     "CSRF state mismatch". We percent-encode `state` for transport
 *     safety (spaces, `&`, `=`, …) and then put `:` back to literal so
 *     the prefix that drove the scheme choice still reads byte-for-byte
 *     the same on the other side.
 *
 *  3. **Leave `terminalsync-picker://` alone.** That's a separate scheme
 *     for the Drive folder picker, not OAuth. This helper never touches
 *     it.
 */

export const LAB_STATE_PREFIX = "tslab:";
// Defensive: if some upstream re-encoded the state (Google sometimes
// preserves URL-encoding when state is bounced back), we still need to
// recognise it as Lab. Same prefix, percent-encoded form.
const LAB_STATE_PREFIX_ENCODED = "tslab%3A";

export interface CallbackQueryParams {
  code?: string;
  state?: string;
  scope?: string;
}

/**
 * Build the `<scheme>://oauth/callback?...` deep link for the native app
 * to pick up. Returns `null` when either `code` or `state` is missing —
 * the caller renders the malformed-params card instead of dispatching.
 *
 * Production keeps the historical contract: `terminalsync://oauth/callback`,
 * with `state` percent-encoded by URLSearchParams. The "leave `:` literal"
 * rule below is a no-op for prod state (which has no `:` to begin with);
 * the same code path covers both schemes so a future-prod state with `:`
 * inside would round-trip safely too.
 */
export function buildDeepLink(params: CallbackQueryParams): string | null {
  if (!params.code || !params.state) return null;

  const isLab =
    params.state.startsWith(LAB_STATE_PREFIX) ||
    params.state.startsWith(LAB_STATE_PREFIX_ENCODED);
  const scheme = isLab ? "terminalsync-lab" : "terminalsync";

  const stateLiteral = encodeStateWithLiteralColon(params.state);

  const parts: string[] = [
    `code=${encodeURIComponent(params.code)}`,
    `state=${stateLiteral}`,
  ];
  if (params.scope) parts.push(`scope=${encodeURIComponent(params.scope)}`);

  return `${scheme}://oauth/callback?${parts.join("&")}`;
}

/**
 * Percent-encode `state` for URL transport BUT keep `:` literal. The
 * native handler does a byte-exact equality check against the state it
 * generated; the app generates `tslab:<random>` with a literal `:`, so
 * any `%3A` on the wire breaks the match.
 *
 * Exported only so the test file can assert the transform directly. The
 * one caller is `buildDeepLink` above.
 */
export function encodeStateWithLiteralColon(state: string): string {
  return encodeURIComponent(state).replace(/%3A/g, ":");
}
