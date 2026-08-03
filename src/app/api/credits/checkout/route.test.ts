import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  authenticate: vi.fn(),
  stripeCreate: vi.fn(),
  createPaymentPreference: vi.fn(),
}));

vi.mock("@/lib/marketplace/auth", () => ({ authenticate: mocks.authenticate }));
vi.mock("@/lib/stripe", () => ({
  siteUrl: () => "https://terminalsync.ai",
  stripe: { checkout: { sessions: { create: mocks.stripeCreate } } },
}));
vi.mock("@/lib/mercadopago", () => ({
  mercadoPagoConfigured: true,
  createPaymentPreference: mocks.createPaymentPreference,
}));

import { OPTIONS, POST } from "./route";

function request(body: Record<string, unknown>) {
  return new Request("https://terminalsync.ai/api/credits/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer user-token",
      Origin: "tauri://localhost",
    },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.authenticate.mockResolvedValue({ id: "user-verified", email: "buyer@example.com" });
  mocks.stripeCreate.mockResolvedValue({
    id: "cs_test_123",
    url: "https://checkout.stripe.com/test/session",
  });
  mocks.createPaymentPreference.mockResolvedValue({
    id: "mp-pref-123",
    initPoint: "https://www.mercadopago.com.co/checkout/v1/redirect",
  });
});

describe("POST /api/credits/checkout", () => {
  it("supports Tauri preflight with Authorization", async () => {
    const res = await OPTIONS(new Request("https://terminalsync.ai/api/credits/checkout", {
      method: "OPTIONS",
      headers: { Origin: "tauri://localhost" },
    }));
    expect(res.status).toBe(204);
    expect(res.headers.get("access-control-allow-origin")).toBe("tauri://localhost");
    expect(res.headers.get("access-control-allow-headers")).toContain("Authorization");
  });

  it("rejects unauthenticated checkout creation", async () => {
    mocks.authenticate.mockResolvedValue(null);
    const res = await POST(request({
      product: "credits",
      amountCents: 1000,
      rail: "stripe",
    }));
    expect(res.status).toBe(401);
    expect(await res.json()).toMatchObject({ code: "sign_in_required" });
    expect(mocks.stripeCreate).not.toHaveBeenCalled();
  });

  it("creates a fixed-price Stripe payment for the verified user", async () => {
    const res = await POST(request({
      product: "credits",
      amountCents: 1000,
      rail: "stripe",
      lang: "en",
      flavor: "lab",
      supabaseUserId: "attacker-controlled",
      successUrl: "https://attacker.example/success",
      cancelUrl: "https://attacker.example/cancel",
    }));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      rail: "stripe",
      checkoutId: "cs_test_123",
    });
    expect(mocks.stripeCreate).toHaveBeenCalledWith(expect.objectContaining({
      mode: "payment",
      line_items: [expect.objectContaining({
        price_data: expect.objectContaining({ currency: "usd", unit_amount: 1000 }),
      })],
      metadata: expect.objectContaining({
        supabase_user_id: "user-verified",
        credit_amount_micros: "10000000",
      }),
      success_url: "https://terminalsync.ai/en/credits/return?status=success&flavor=lab&session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://terminalsync.ai/en/credits/return?status=cancel&flavor=lab",
    }));
  });

  it("creates a COP Mercado Pago preference for the $10 package", async () => {
    const res = await POST(request({
      product: "credits",
      amountCents: 1000,
      rail: "mercadopago",
      country: "CO",
      currency: "COP",
      lang: "es",
      flavor: "lab",
    }));
    expect(res.status).toBe(200);
    expect(mocks.createPaymentPreference).toHaveBeenCalledWith(expect.objectContaining({
      amount: 41_000,
      currency: "COP",
      externalReference: "user-verified",
      metadata: expect.objectContaining({ rail: "mercadopago" }),
    }));
  });

  it("does not let clients invent a package amount", async () => {
    const res = await POST(request({
      product: "credits",
      amountCents: 1,
      rail: "stripe",
    }));
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ code: "invalid_amount" });
    expect(mocks.stripeCreate).not.toHaveBeenCalled();
  });
});
