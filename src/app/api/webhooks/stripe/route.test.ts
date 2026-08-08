import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  constructEvent: vi.fn(),
  grantPurchasedCredits: vi.fn(),
}));

vi.mock("@/lib/stripe", () => ({
  stripe: {
    webhooks: { constructEvent: mocks.constructEvent },
    customers: { retrieve: vi.fn() },
  },
}));

vi.mock("@/lib/email", () => ({
  sendWelcomeEmail: vi.fn(),
  sendTrialEndingEmail: vi.fn(),
  sendPaymentFailedEmail: vi.fn(),
  sendCancellationEmail: vi.fn(),
}));

vi.mock("@/lib/subscriptionsSync", () => ({
  syncSubscriptionToSupabase: vi.fn(),
  revokeSubscription: vi.fn(),
}));

vi.mock("@/lib/supabaseAdmin", () => ({ getSupabaseAdmin: vi.fn() }));
vi.mock("@/lib/userLang", () => ({ resolveUserLang: vi.fn() }));

vi.mock("@/lib/aiCredits", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/aiCredits")>();
  return {
    ...actual,
    grantPurchasedCredits: mocks.grantPurchasedCredits,
  };
});

import { POST } from "./route";

function creditEvent() {
  return {
    id: "evt_credit_123",
    type: "checkout.session.completed",
    data: {
      object: {
        id: "cs_credit_123",
        amount_total: 1000,
        currency: "usd",
        payment_status: "paid",
        payment_intent: "pi_credit_123",
        metadata: {
          source: "terminalsync_credits",
          supabase_user_id: "user-verified",
          credit_amount_cents: "1000",
          credit_amount_micros: "10000000",
          rail: "stripe",
        },
      },
    },
  };
}

function signedRequest() {
  return new Request("https://terminalsync.ai/api/webhooks/stripe", {
    method: "POST",
    headers: { "stripe-signature": "signed" },
    body: "raw-body",
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
  mocks.constructEvent.mockReturnValue(creditEvent());
  mocks.grantPurchasedCredits.mockResolvedValue(undefined);
});

afterEach(() => {
  delete process.env.STRIPE_WEBHOOK_SECRET;
  delete process.env.STRIPE_TEST_WEBHOOK_SECRET;
});

describe("Stripe credit payment webhook", () => {
  it("grants only a paid package with verified amount and metadata", async () => {
    const res = await POST(signedRequest());

    expect(res.status).toBe(200);
    expect(mocks.grantPurchasedCredits).toHaveBeenCalledWith(expect.objectContaining({
      userId: "user-verified",
      amountMicros: 10_000_000,
      providerPaymentId: "pi_credit_123",
      idempotencyKey: "stripe:cs_credit_123",
    }));
  });

  it("returns 500 so Stripe retries when the paid balance cannot be granted", async () => {
    mocks.grantPurchasedCredits.mockRejectedValueOnce(new Error("database unavailable"));

    const res = await POST(signedRequest());

    expect(res.status).toBe(500);
    expect(await res.json()).toMatchObject({ received: false });
  });

  it("rejects metadata that names the Mercado Pago rail", async () => {
    const event = creditEvent();
    event.data.object.metadata.rail = "mercadopago";
    mocks.constructEvent.mockReturnValue(event);

    const res = await POST(signedRequest());

    expect(res.status).toBe(500);
    expect(mocks.grantPurchasedCredits).not.toHaveBeenCalled();
  });
});
