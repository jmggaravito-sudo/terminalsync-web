/**
 * Browser-side mirror of the Team safe display-name contract. It is a short
 * human label, not a channel for URLs, paths, descriptions, or content.
 * Keep this in lockstep with the server's 0055 display-name predicate.
 */
const SAFE_TEAM_DISPLAY_NAME = /^[A-Za-z\u00c1\u00c9\u00cd\u00d3\u00da\u00dc\u00d1\u00e1\u00e9\u00ed\u00f3\u00fa\u00fc\u00f10-9 -]+$/u;

/** Accept only a canonical persisted/displayed Team space name. */
export function safeTeamDisplayName(value: unknown): string | null {
  return typeof value === "string"
    && value.length >= 1
    && value.length <= 120
    && value === value.trim()
    && !value.includes("\n")
    && !value.includes("\r")
    && SAFE_TEAM_DISPLAY_NAME.test(value)
    ? value
    : null;
}

/**
 * Normalize only ordinary outer spaces before a new space is submitted.
 * Tabs, line breaks, URLs, paths, punctuation, and all other unsafe input
 * remain invalid rather than being silently converted into a display name.
 */
export function normalizeTeamDisplayName(value: unknown): string | null {
  if (typeof value !== "string" || value.length === 0 || value.length > 120) return null;
  if (value.includes("\n") || value.includes("\r") || !SAFE_TEAM_DISPLAY_NAME.test(value)) return null;
  const normalized = value.trim();
  return safeTeamDisplayName(normalized);
}
