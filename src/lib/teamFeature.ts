/**
 * Team schema and its approval-first collaboration APIs are deployed behind a
 * server-only availability gate. Keep this off until the reviewed production
 * migration chain and authenticated smoke have both completed.
 */
export function isTeamFeatureEnabled(environment: Record<string, string | undefined> = process.env): boolean {
  return environment.TEAM_FEATURE_ENABLED === "1";
}
