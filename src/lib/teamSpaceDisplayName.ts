/**
 * Team space names are recipient-visible metadata. They intentionally allow
 * ordinary Spanish display names (for example, "Proyecto de Alex") but never
 * act as a channel for URLs, paths, descriptions, or arbitrary content.
 */
const TEAM_SPACE_DISPLAY_NAME = /^[A-Za-z\u00c1\u00c9\u00cd\u00d3\u00da\u00dc\u00d1\u00e1\u00e9\u00ed\u00f3\u00fa\u00fc\u00f10-9 -]+$/u;

/**
 * Accept only the persisted, canonical display-name form. SQL applies the
 * same policy after legacy rows are normalized by migration 0055.
 */
export function isSafeTeamSpaceDisplayName(value: unknown): value is string {
  return typeof value === "string"
    && value.length >= 1
    && value.length <= 120
    && value === value.trim()
    && !value.includes("\n")
    && !value.includes("\r")
    && TEAM_SPACE_DISPLAY_NAME.test(value);
}

/**
 * Normalize only ordinary leading/trailing ASCII-space input before a create.
 * Tabs, newlines, URLs, paths, punctuation, and all other non-display
 * characters remain invalid instead of being silently transformed.
 */
export function normalizeTeamSpaceDisplayName(value: unknown): string | null {
  if (typeof value !== "string" || value.length === 0 || value.length > 120) return null;
  if (value.includes("\n") || value.includes("\r") || !TEAM_SPACE_DISPLAY_NAME.test(value)) return null;
  const normalized = value.trim();
  return isSafeTeamSpaceDisplayName(normalized) ? normalized : null;
}
