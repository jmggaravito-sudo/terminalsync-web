import { describe, expect, it } from "vitest";
import { shouldApplyCheckoutTrial } from "./route";

describe("checkout trial eligibility", () => {
  it("keeps the 7-day trial for public Pro and Max signups", () => {
    expect(shouldApplyCheckoutTrial("pro")).toBe(true);
    expect(shouldApplyCheckoutTrial("max")).toBe(true);
  });

  it("does not restart a trial for signed-in app users", () => {
    expect(shouldApplyCheckoutTrial("pro", "user_123")).toBe(false);
    expect(shouldApplyCheckoutTrial("max", "user_123")).toBe(false);
  });

  it("does not apply a trial to agency", () => {
    expect(shouldApplyCheckoutTrial("agency")).toBe(false);
  });
});
