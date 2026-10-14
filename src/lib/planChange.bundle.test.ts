import { describe, expect, it, vi } from "vitest";

const { retrieve, update, sync } = vi.hoisted(() => ({
  retrieve: vi.fn(),
  update: vi.fn(),
  sync: vi.fn(async () => true),
}));

vi.mock("./stripe", () => ({
  stripe: { subscriptions: { retrieve, update } },
  priceIdFor: (plan: string) => `price_${plan}_base`,
  bundledPriceIdFor: (plan: string) => `price_${plan}_ai`,
  includedAiPriceId: () => "price_legacy_addon",
}));
vi.mock("./subscriptionsSync", () => ({ syncSubscriptionToSupabase: sync }));
vi.mock("./subscriptionState", () => ({ revokeIncludedAiForUser: vi.fn() }));

import { changeStripeSubscription } from "./planChange";

const current = {
  provider: "stripe" as const,
  provider_subscription_id: "sub_legacy",
  provider_customer_id: "cus_1",
  stripe_subscription_id: "sub_legacy",
  stripe_customer_id: "cus_1",
  status: "active",
  plan: "pro",
};

describe("Stripe legacy plan change", () => {
  it("replaces base + add-on with one bundled item", async () => {
    retrieve.mockResolvedValueOnce({
      metadata: { included_ai: "1" },
      items: { data: [
        { id: "si_base", price: { id: "price_pro_base" } },
        { id: "si_addon", price: { id: "price_legacy_addon" } },
      ] },
    });
    update.mockResolvedValueOnce({ id: "sub_legacy", items: { data: [] } });
    await changeStripeSubscription({ userId: "user_1", current, plan: "max", includedAi: false });
    expect(update).toHaveBeenCalledWith("sub_legacy", expect.objectContaining({
      items: [
        { id: "si_base", price: "price_max_ai", quantity: 1 },
        { id: "si_addon", deleted: true },
      ],
      proration_behavior: "none",
    }));
    expect(sync).toHaveBeenCalledOnce();
  });

  it("refuses an unknown extra item rather than silently billing twice", async () => {
    retrieve.mockResolvedValueOnce({
      metadata: {},
      items: { data: [
        { id: "si_base", price: { id: "price_pro_base" } },
        { id: "si_unknown", price: { id: "price_other" } },
      ] },
    });
    update.mockClear();
    await expect(changeStripeSubscription({ userId: "user_1", current, plan: "max", includedAi: true }))
      .rejects.toThrow("unknown items");
    expect(update).not.toHaveBeenCalled();
  });
});
