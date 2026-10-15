import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  constructEvent: vi.fn(),
  grantPurchasedCredits: vi.fn(),
  allocateVideoFunding: vi.fn(),
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

vi.mock("@/lib/supabaseAdmin", () => ({
  getSupabaseAdmin: vi.fn(() => ({ rpc: mocks.allocateVideoFunding })),
}));
vi.mock("@/lib/userLang", () => ({ resolveUserLang: vi.fn() }));
vi.mock("server-only", () => ({}));

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
    livemode: true,
    data: {
      object: {
        id: "cs_credit_123",
        livemode: true,
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
        } as Record<string, string>,
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
  delete process.env.VIDEO_EXCLUSIVE_FUNDING_ENABLED;
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
  mocks.constructEvent.mockReturnValue(creditEvent());
  mocks.grantPurchasedCredits.mockResolvedValue(undefined);
  mocks.allocateVideoFunding.mockResolvedValue({ error: null });
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

  it("honors the checkout-persisted general destination even if video funding is enabled later", async () => {
    const event = creditEvent();
    event.data.object.metadata.credit_funding_destination = "general";
    mocks.constructEvent.mockReturnValue(event);
    process.env.VIDEO_EXCLUSIVE_FUNDING_ENABLED = "1";

    const res = await POST(signedRequest());

    expect(res.status).toBe(200);
    expect(mocks.grantPurchasedCredits).toHaveBeenCalledOnce();
    expect(mocks.allocateVideoFunding).not.toHaveBeenCalled();
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

  it("fails closed for an exclusive destination while the feature flag is off", async () => {
    const event = creditEvent();
    event.data.object.metadata.credit_funding_destination = "video-exclusive";
    event.data.object.metadata.video_funding_issuer_id = "issuer-not-configured";
    mocks.constructEvent.mockReturnValue(event);
    delete process.env.VIDEO_EXCLUSIVE_FUNDING_ENABLED;

    const res = await POST(signedRequest());

    expect(res.status).toBe(500);
    expect(mocks.grantPurchasedCredits).not.toHaveBeenCalled();
    expect(mocks.allocateVideoFunding).not.toHaveBeenCalled();
  });

  it("ignores a signed test-mode exclusive event without granting either balance", async () => {
    const event = creditEvent();
    event.livemode = false;
    event.data.object.livemode = false;
    event.data.object.metadata.credit_funding_destination = "video-exclusive";
    event.data.object.metadata.video_funding_issuer_id = "issuer-not-configured";
    mocks.constructEvent.mockReturnValue(event);
    process.env.VIDEO_EXCLUSIVE_FUNDING_ENABLED = "1";

    const res = await POST(signedRequest());

    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ received: true, ignored: "test_credit_event" });
    expect(mocks.grantPurchasedCredits).not.toHaveBeenCalled();
    expect(mocks.allocateVideoFunding).not.toHaveBeenCalled();
  });

  it("rejects mismatched Stripe event and checkout livemode", async () => {
    const event = creditEvent();
    event.data.object.livemode = false;
    mocks.constructEvent.mockReturnValue(event);

    const res = await POST(signedRequest());

    expect(res.status).toBe(400);
    expect(mocks.grantPurchasedCredits).not.toHaveBeenCalled();
  });

  it("routes only a live-signed exclusive event to the transactional RPC", async () => {
    const event = creditEvent();
    event.livemode = true;
    event.data.object.metadata.credit_funding_destination = "video-exclusive";
    event.data.object.metadata.video_funding_issuer_id = "enrolled-issuer";
    mocks.constructEvent.mockReturnValue(event);
    process.env.VIDEO_EXCLUSIVE_FUNDING_ENABLED = "true";

    const res = await POST(signedRequest());

    expect(res.status).toBe(200);
    expect(mocks.grantPurchasedCredits).not.toHaveBeenCalled();
    expect(mocks.allocateVideoFunding).toHaveBeenCalledWith("allocate_video_exclusive_funding", {
      p_signature_verified_live: true,
      p_event_livemode: true,
      p_source_event_id: "evt_credit_123",
      p_provider_payment_id: "pi_credit_123",
      p_account_id: "user-verified",
      p_issuer_id: "enrolled-issuer",
      p_destination: "video-exclusive",
      p_currency: "USD",
      p_amount_micros: 10_000_000,
    });
  });

  it("fails closed if a test signing secret verifies an event claiming live mode", async () => {
    const event = creditEvent();
    event.data.object.metadata.credit_funding_destination = "video-exclusive";
    event.data.object.metadata.video_funding_issuer_id = "enrolled-issuer";
    mocks.constructEvent.mockImplementation((_raw, _signature, secret) => {
      if (secret === "whsec_live") throw new Error("wrong secret");
      return event;
    });
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_live";
    process.env.STRIPE_TEST_WEBHOOK_SECRET = "whsec_test";
    process.env.VIDEO_EXCLUSIVE_FUNDING_ENABLED = "1";

    const res = await POST(signedRequest());

    expect(res.status).toBe(500);
    expect(mocks.grantPurchasedCredits).not.toHaveBeenCalled();
    expect(mocks.allocateVideoFunding).not.toHaveBeenCalled();
  });
});
