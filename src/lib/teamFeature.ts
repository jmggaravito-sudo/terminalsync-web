/**
 * Team schema and its approval-first collaboration APIs are deployed behind a
 * server-only availability gate. Keep this off until the reviewed production
 * migration chain and authenticated smoke have both completed.
 */
export function isTeamFeatureEnabled(environment: Record<string, string | undefined> = process.env): boolean {
  return environment.TEAM_FEATURE_ENABLED === "1";
}

/**
 * Paid Team checkout has a second, independently default-off gate. Requiring
 * the general Team gate as well means setting this flag alone cannot make a
 * billing route touch Stripe or the Team metadata database.
 */
export function isTeamPaidCheckoutEnabled(environment: Record<string, string | undefined> = process.env): boolean {
  return isTeamFeatureEnabled(environment) && environment.TEAM_PAID_CHECKOUT_ENABLED === "1";
}
