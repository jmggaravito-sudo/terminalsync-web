import { describe, expect, it, vi } from "vitest";

const { createSession, teamPrice, priceIdFor } = vi.hoisted(() => {
  const teamPrice = { value: "price_team_monthly" as string | null };
  return {
    createSession: vi.fn(async (_params: Record<string, unknown>) => ({
      url: "https://checkout.stripe.test/session",
    })),
    teamPrice,
    priceIdFor: vi.fn((plan: string) => plan === "team" ? teamPrice.value : `price_${plan}_legacy`),
  };
});

vi.mock("@/lib/stripe", () => ({
  stripe: { checkout: { sessions: { create: createSession } } },
  TRIAL_DAYS: 7,
  normalizePlanId: (plan: string) => plan,
  bundledPriceIdFor: (plan: string) => `price_${plan}_ai`,
  priceIdFor,
  siteUrl: () => "https://terminalsync.ai",
}));

vi.mock("@/lib/planChange", () => ({
  ExistingSubscriptionOnOtherRailError: class extends Error {},
  getCurrentSubscriptionForUser: async () => null,
  isChangeableSubscription: () => false,
  assertSameRailForChange: () => null,
  changeStripeSubscription: vi.fn(),
}));

import { POST } from "./route";

describe("checkout Pro/Max with included AI", () => {
  for (const plan of ["pro", "max"]) {
    it(`uses exactly one bundled Stripe item for ${plan}, even from an old client`, async () => {
      createSession.mockClear();
      const response = await POST(new Request("https://terminalsync.ai/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan, includedAi: false, addOns: [] }),
      }));
      expect(response.status).toBe(200);
      expect(createSession).toHaveBeenCalledOnce();
      const params = createSession.mock.calls[0][0] as {
        line_items: unknown[];
        metadata: Record<string, string>;
      };
      expect(params.line_items).toEqual([{ price: `price_${plan}_ai`, quantity: 1 }]);
      expect(params.metadata.included_ai).toBe("1");
    });
  }
});

describe("Team checkout fail-closed foundation", () => {
  it("rejects invalid or missing Team seat quantities", async () => {
    createSession.mockClear();
    for (const seats of [undefined, 0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1, "2"]) {
      const response = await POST(new Request("https://terminalsync.ai/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan: "team", seats }),
      }));
      expect(response.status).toBe(400);
    }
    expect(createSession).not.toHaveBeenCalled();
  });

  it("accepts the 64-seat boundary but still keeps paid Team checkout disabled", async () => {
    createSession.mockClear();
    const response = await POST(new Request("https://terminalsync.ai/api/checkout", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ plan: "team", seats: 64 }),
    }));
    expect(response.status).toBe(503);
    expect((await response.json()).error).toContain("No Stripe session was created");
    expect(createSession).not.toHaveBeenCalled();
  });

  it("rejects 65 Team seats before the disabled-checkout response", async () => {
    createSession.mockClear();
    const response = await POST(new Request("https://terminalsync.ai/api/checkout", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ plan: "team", seats: 65 }),
    }));
    expect(response.status).toBe(400);
    expect(createSession).not.toHaveBeenCalled();
  });

  it("stays closed before inspecting the Team Stripe price", async () => {
    createSession.mockClear();
    priceIdFor.mockClear();
    teamPrice.value = null;
    const response = await POST(new Request("https://terminalsync.ai/api/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ plan: "team", seats: 3 }),
    }));
    expect(response.status).toBe(503);
    expect((await response.json()).error).toContain("No Stripe session was created");
    expect(priceIdFor).not.toHaveBeenCalled();
    expect(createSession).not.toHaveBeenCalled();
    teamPrice.value = "price_team_monthly";
  });

  it("does not create a Stripe session even with a configured price while Team checkout is disabled", async () => {
    createSession.mockClear();
    teamPrice.value = "price_team_monthly";
    const response = await POST(new Request("https://terminalsync.ai/api/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ plan: "team", seats: 3 }),
    }));
    expect(response.status).toBe(503);
    expect((await response.json()).error).toContain("No Stripe session was created");
    expect(createSession).not.toHaveBeenCalled();
  });
});
