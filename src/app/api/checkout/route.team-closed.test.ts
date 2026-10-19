import { describe, expect, it, vi } from "vitest";

const { priceIdFor } = vi.hoisted(() => ({
  priceIdFor: vi.fn(() => "price_team_should_not_be_read"),
}));

vi.mock("@/lib/stripe", () => ({
  // Team must return its own closed-checkout response even when Stripe has
  // not been configured in an environment.
  stripe: null,
  TRIAL_DAYS: 7,
  normalizePlanId: (plan: string) => plan === "team" ? "team" : null,
  bundledPriceIdFor: vi.fn(),
  priceIdFor,
  siteUrl: () => "https://terminalsync.ai",
}));

vi.mock("@/lib/planChange", () => ({
  ExistingSubscriptionOnOtherRailError: class extends Error {},
  getCurrentSubscriptionForUser: vi.fn(),
  isChangeableSubscription: vi.fn(),
  assertSameRailForChange: vi.fn(),
  changeStripeSubscription: vi.fn(),
}));

import { POST } from "./route";

describe("Team checkout availability boundary", () => {
  it.each([1, 64])("accepts the %i-seat boundary before returning the Team-closed response", async (seats) => {
    const response = await POST(new Request("https://terminalsync.ai/api/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ plan: "team", seats }),
    }));

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: "Team checkout is not available yet. No Stripe session was created.",
    });
    expect(priceIdFor).not.toHaveBeenCalled();
  });

  it.each([undefined, 0, -1, 1.5, 65, "1"])(
    "rejects an invalid Team seat count before touching Stripe: %p",
    async (seats) => {
      const response = await POST(new Request("https://terminalsync.ai/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan: "team", seats }),
      }));

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        error: "Team seat count must be an integer from 1 through 64.",
      });
      expect(priceIdFor).not.toHaveBeenCalled();
    },
  );
});
