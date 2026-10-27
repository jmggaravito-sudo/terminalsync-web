import { describe, expect, it } from "vitest";
import {
  hasTeamUserAccessGate,
  hasValidTeamSmokeAllowlist,
  isTeamFeatureEnabled,
  isTeamGeneralAvailabilityEnabled,
  isTeamPaidCheckoutEnabled,
  isTeamSmokeUserAllowed,
  isTeamUserAllowed,
} from "./teamFeature";

const smokeUserA = "00000000-0000-4000-8000-000000000001";
const smokeUserB = "00000000-0000-4000-8000-000000000002";

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

describe("Team controlled-smoke allowlist", () => {
  it("requires exactly two distinct Supabase Auth UUIDs", () => {
    expect(hasValidTeamSmokeAllowlist({})).toBe(false);
    expect(hasValidTeamSmokeAllowlist({ TEAM_SMOKE_ALLOWLIST_USER_IDS: "" })).toBe(false);
    expect(hasValidTeamSmokeAllowlist({ TEAM_SMOKE_ALLOWLIST_USER_IDS: smokeUserA })).toBe(false);
    expect(hasValidTeamSmokeAllowlist({ TEAM_SMOKE_ALLOWLIST_USER_IDS: `${smokeUserA},${smokeUserA}` })).toBe(false);
    expect(hasValidTeamSmokeAllowlist({ TEAM_SMOKE_ALLOWLIST_USER_IDS: `${smokeUserA},not-a-supabase-user-id` })).toBe(false);
    expect(hasValidTeamSmokeAllowlist({ TEAM_SMOKE_ALLOWLIST_USER_IDS: `${smokeUserA},${smokeUserB},00000000-0000-4000-8000-000000000003` })).toBe(false);
    expect(hasValidTeamSmokeAllowlist({ TEAM_SMOKE_ALLOWLIST_USER_IDS: ` ${smokeUserA} , ${smokeUserB} ` })).toBe(true);
  });

  it("allows only an exact verified allowlisted user id", () => {
    const environment = { TEAM_SMOKE_ALLOWLIST_USER_IDS: `${smokeUserA},${smokeUserB}` };
    expect(isTeamSmokeUserAllowed(smokeUserA, environment)).toBe(true);
    expect(isTeamSmokeUserAllowed(smokeUserA.toUpperCase(), environment)).toBe(true);
    expect(isTeamSmokeUserAllowed("00000000-0000-4000-8000-000000000003", environment)).toBe(false);
    expect(isTeamSmokeUserAllowed(`${smokeUserA}-suffix`, environment)).toBe(false);
    expect(isTeamSmokeUserAllowed(smokeUserA, {})).toBe(false);
  });
});

describe("Team general availability", () => {
  it("requires the feature gate and a distinct exact general-availability flag", () => {
    expect(isTeamGeneralAvailabilityEnabled({})).toBe(false);
    expect(isTeamGeneralAvailabilityEnabled({ TEAM_FEATURE_ENABLED: "1" })).toBe(false);
    expect(isTeamGeneralAvailabilityEnabled({ TEAM_GENERAL_AVAILABILITY_ENABLED: "1" })).toBe(false);
    expect(isTeamGeneralAvailabilityEnabled({ TEAM_FEATURE_ENABLED: "1", TEAM_GENERAL_AVAILABILITY_ENABLED: "true" })).toBe(false);
    expect(isTeamGeneralAvailabilityEnabled({ TEAM_FEATURE_ENABLED: "1", TEAM_GENERAL_AVAILABILITY_ENABLED: "1" })).toBe(true);
  });

  it("keeps access deny-all without either rollout gate and permits all verified users only with the explicit general gate", () => {
    expect(hasTeamUserAccessGate({ TEAM_FEATURE_ENABLED: "1" })).toBe(false);
    expect(isTeamUserAllowed(smokeUserA, { TEAM_FEATURE_ENABLED: "1" })).toBe(false);
    const general = { TEAM_FEATURE_ENABLED: "1", TEAM_GENERAL_AVAILABILITY_ENABLED: "1" };
    expect(hasTeamUserAccessGate(general)).toBe(true);
    expect(isTeamUserAllowed(smokeUserA, general)).toBe(true);
    expect(isTeamUserAllowed("00000000-0000-4000-8000-000000000003", general)).toBe(true);
  });
});
