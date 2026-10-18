import { describe, expect, it } from "vitest";
import { isTeamFeatureEnabled } from "./teamFeature";

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
