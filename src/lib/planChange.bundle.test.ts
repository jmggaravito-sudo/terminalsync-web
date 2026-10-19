import { describe, expect, it, vi } from "vitest";

const {
  retrieve,
  update,
  sync,
  mpAmountFor,
  updatePreapproval,
  grantIncludedAi,
  revokeIncludedAiForMercadoPagoUser,
  revokeIncludedAiForUser,
  upsertSubscription,
} = vi.hoisted(() => ({
  retrieve: vi.fn(),
  update: vi.fn(),
  sync: vi.fn(async () => true),
  mpAmountFor: vi.fn(),
  updatePreapproval: vi.fn(),
  grantIncludedAi: vi.fn(),
  revokeIncludedAiForMercadoPagoUser: vi.fn(),
  revokeIncludedAiForUser: vi.fn(),
  upsertSubscription: vi.fn(),
}));

vi.mock("./stripe", () => ({
  stripe: { subscriptions: { retrieve, update } },
  priceIdFor: (plan: string) => `price_${plan}_base`,
  bundledPriceIdFor: (plan: string) => `price_${plan}_ai`,
  includedAiPriceId: () => "price_legacy_addon",
  isSubscriptionPlanId: (plan: unknown) =>
    plan === "pro" || plan === "max" || plan === "agency",
}));
vi.mock("./mercadopago", () => ({ mpAmountFor, updatePreapproval }));
vi.mock("./subscriptionsSync", () => ({ syncSubscriptionToSupabase: sync }));
vi.mock("./subscriptionState", () => ({
  grantIncludedAi,
  revokeIncludedAiForMercadoPagoUser,
  revokeIncludedAiForUser,
  upsertSubscription,
}));

import {
  changeMercadoPagoSubscription,
  changeStripeSubscription,
} from "./planChange";

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

describe("Team base-subscription mutation guard", () => {
  it("rejects an untyped Team plan before touching Stripe", async () => {
    retrieve.mockClear();
    update.mockClear();
    sync.mockClear();

    await expect(
      changeStripeSubscription({
        userId: "user_1",
        current,
        plan: "team" as never,
        includedAi: false,
      }),
    ).rejects.toThrow("Team is a separate membership entitlement");

    expect(retrieve).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
    expect(sync).not.toHaveBeenCalled();
  });

  it("rejects an untyped Team plan before touching Mercado Pago", async () => {
    mpAmountFor.mockClear();
    updatePreapproval.mockClear();
    grantIncludedAi.mockClear();
    revokeIncludedAiForMercadoPagoUser.mockClear();
    upsertSubscription.mockClear();

    await expect(
      changeMercadoPagoSubscription({
        userId: "user_1",
        current: {
          ...current,
          provider: "mercadopago",
          provider_subscription_id: "mp_preapproval_1",
        },
        plan: "team" as never,
        includedAi: false,
      }),
    ).rejects.toThrow("Team is a separate membership entitlement");

    expect(mpAmountFor).not.toHaveBeenCalled();
    expect(updatePreapproval).not.toHaveBeenCalled();
    expect(grantIncludedAi).not.toHaveBeenCalled();
    expect(revokeIncludedAiForMercadoPagoUser).not.toHaveBeenCalled();
    expect(upsertSubscription).not.toHaveBeenCalled();
  });
});
