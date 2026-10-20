import { describe, expect, it } from "vitest";
import { isTeamFeatureEnabled, isTeamPaidCheckoutEnabled } from "./teamFeature";

describe("isTeamFeatureEnabled", () => {
  it("fails closed unless the exact server flag is enabled", () => {
    expect(isTeamFeatureEnabled({})).toBe(false);
    expect(isTeamFeatureEnabled({ TEAM_FEATURE_ENABLED: "true" })).toBe(false);
    expect(isTeamFeatureEnabled({ TEAM_FEATURE_ENABLED: "0" })).toBe(false);
  });

  it("enables Team only for the exact explicit value", () => {
    expect(isTeamFeatureEnabled({ TEAM_FEATURE_ENABLED: "1" })).toBe(true);
  });
});

describe("isTeamPaidCheckoutEnabled", () => {
  it("is default-off and requires both explicit server gates", () => {
    expect(isTeamPaidCheckoutEnabled({})).toBe(false);
    expect(isTeamPaidCheckoutEnabled({ TEAM_PAID_CHECKOUT_ENABLED: "1" })).toBe(false);
    expect(isTeamPaidCheckoutEnabled({ TEAM_FEATURE_ENABLED: "1" })).toBe(false);
    expect(isTeamPaidCheckoutEnabled({ TEAM_FEATURE_ENABLED: "1", TEAM_PAID_CHECKOUT_ENABLED: "true" })).toBe(false);
    expect(isTeamPaidCheckoutEnabled({ TEAM_FEATURE_ENABLED: "1", TEAM_PAID_CHECKOUT_ENABLED: "1" })).toBe(true);
  });
});
