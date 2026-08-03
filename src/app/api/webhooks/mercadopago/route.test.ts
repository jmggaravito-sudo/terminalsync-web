import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getPayment: vi.fn(),
  getPreapproval: vi.fn(),
  verifySignature: vi.fn(),
  grantPurchasedCredits: vi.fn(),
}));

vi.mock("@/lib/mercadopago", () => ({
  getPayment: mocks.getPayment,
  getPreapproval: mocks.getPreapproval,
  mercadoPagoConfigured: true,
  mercadoPagoWebhookSecretSet: true,
  mpIncludesAi: vi.fn(),
  mpPlanFromPreapproval: vi.fn(),
  mpStatusToSubscriptionStatus: vi.fn(),
  verifyMpWebhookSignature: mocks.verifySignature,
}));

vi.mock("@/lib/subscriptionState", () => ({
  downgradeToFree: vi.fn(),
  findUserIdByEmail: vi.fn(),
  grantIncludedAi: vi.fn(),
  revokeIncludedAiForMercadoPagoUser: vi.fn(),
  upsertSubscription: vi.fn(),
}));

vi.mock("@/lib/aiCredits", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/aiCredits")>();
  return {
    ...actual,
    grantPurchasedCredits: mocks.grantPurchasedCredits,
  };
});

import { POST } from "./route";

function paymentRequest(body: Record<string, unknown>) {
  return new Request("https://terminalsync.ai/api/webhooks/mercadopago", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-request-id": "request-123",
      "x-signature": "ts=1,v1=signed",
    },
    body: JSON.stringify(body),
  });
}

function approvedPayment(amount = 41_000) {
  return {
    id: 456,
    status: "approved",
    external_reference: "user-verified",
    transaction_amount: amount,
    currency_id: "COP",
    metadata: {
      source: "terminalsync_credits",
      supabase_user_id: "user-verified",
      credit_amount_cents: "1000",
      credit_amount_micros: "10000000",
      rail: "mercadopago",
    },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.verifySignature.mockReturnValue(true);
  mocks.getPayment.mockResolvedValue(approvedPayment());
  mocks.grantPurchasedCredits.mockResolvedValue(undefined);
});

describe("Mercado Pago credit payment webhook", () => {
  it("normalizes numeric payment IDs and grants a verified package once", async () => {
    const res = await POST(paymentRequest({
      action: "payment.created",
      data: { id: 456 },
    }));

    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ handled: true, granted: true });
    expect(mocks.verifySignature).toHaveBeenCalledWith(expect.objectContaining({
      dataId: "456",
    }));
    expect(mocks.getPayment).toHaveBeenCalledWith("456");
    expect(mocks.grantPurchasedCredits).toHaveBeenCalledWith(expect.objectContaining({
      userId: "user-verified",
      amountMicros: 10_000_000,
      idempotencyKey: "mercadopago:456",
    }));
  });

  it("rejects a provider amount that differs from the published COP package", async () => {
    mocks.getPayment.mockResolvedValue(approvedPayment(40_000));

    const res = await POST(paymentRequest({
      type: "payment",
      data: { id: "456" },
    }));

    expect(res.status).toBe(409);
    expect(mocks.grantPurchasedCredits).not.toHaveBeenCalled();
  });
});
