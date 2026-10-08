import { describe, expect, it, vi } from "vitest";

const { createSession } = vi.hoisted(() => ({
  createSession: vi.fn(async (_params: Record<string, unknown>) => ({
    url: "https://checkout.stripe.test/session",
  })),
}));

vi.mock("@/lib/stripe", () => ({
  stripe: { checkout: { sessions: { create: createSession } } },
  TRIAL_DAYS: 7,
  normalizePlanId: (plan: string) => plan,
  bundledPriceIdFor: (plan: string) => `price_${plan}_ai`,
  priceIdFor: (plan: string) => `price_${plan}_legacy`,
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
