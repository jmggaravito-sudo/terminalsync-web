/**
 * Single source of truth for marketplace logo initials.
 *
 * Each of the three pillar Logo components (ConnectorLogo, SkillLogo,
 * CliToolLogo) previously inlined its own copy of this helper. They drifted:
 * the connector copy gained an initials fallback in PR #42, the skill/CLI
 * copies didn't, and the catalog rendered an empty `<div>` whenever the
 * image 404'd. Consolidating here keeps the initials math identical across
 * pillars and means future tweaks (locale-aware uppercasing, emoji
 * stripping, etc.) happen in one place.
 */
export function initialsFrom(input: string): string {
  // Strip path/extension, split on common separators, take first letters.
  const base = input.replace(/^.*\//, "").replace(/\.[a-z0-9]+$/i, "");
  const parts = base.split(/[\s_\-.]+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
