import { describe, expect, it, vi } from "vitest";

const {
  createPreapproval,
  mpAmountFor,
  assertSameRailForChange,
  changeMercadoPagoSubscription,
  getCurrentSubscriptionForUser,
  isChangeableSubscription,
} = vi.hoisted(() => ({
  createPreapproval: vi.fn(),
  mpAmountFor: vi.fn(),
  assertSameRailForChange: vi.fn(),
  changeMercadoPagoSubscription: vi.fn(),
  getCurrentSubscriptionForUser: vi.fn(),
  isChangeableSubscription: vi.fn(),
}));

vi.mock("@/lib/stripe", () => ({
  normalizePlanId: (plan: string) => plan === "team" ? "team" : null,
  siteUrl: () => "https://terminalsync.ai",
}));

vi.mock("@/lib/mercadopago", () => ({
  // The Team branch must win even when this payment rail is entirely absent.
  mercadoPagoConfigured: false,
  createPreapproval,
  mpAmountFor,
}));

vi.mock("@/lib/planChange", () => ({
  ExistingSubscriptionOnOtherRailError: class extends Error {},
  assertSameRailForChange,
  changeMercadoPagoSubscription,
  getCurrentSubscriptionForUser,
  isChangeableSubscription,
}));

import { POST } from "./route";

describe("Team Mercado Pago checkout boundary", () => {
  it("rejects Team before inspecting an unavailable Mercado Pago rail", async () => {
    const response = await POST(new Request("https://terminalsync.ai/api/checkout/mercadopago", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ plan: "team" }),
    }));

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: "Team checkout is not available until Team trial entitlements and subscription sync are ready.",
    });
    expect(mpAmountFor).not.toHaveBeenCalled();
    expect(getCurrentSubscriptionForUser).not.toHaveBeenCalled();
    expect(isChangeableSubscription).not.toHaveBeenCalled();
    expect(assertSameRailForChange).not.toHaveBeenCalled();
    expect(changeMercadoPagoSubscription).not.toHaveBeenCalled();
    expect(createPreapproval).not.toHaveBeenCalled();
  });
});
