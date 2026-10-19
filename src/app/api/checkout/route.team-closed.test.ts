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
  it("returns the Team-closed response before checking an unavailable Stripe client or Team price", async () => {
    const response = await POST(new Request("https://terminalsync.ai/api/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ plan: "team", seats: 1 }),
    }));

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: "Team checkout is not available yet. No Stripe session was created.",
    });
    expect(priceIdFor).not.toHaveBeenCalled();
  });
});
