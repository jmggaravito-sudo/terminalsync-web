import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  constructEvent: vi.fn(),
  grantPurchasedCredits: vi.fn(),
  allocateVideoFunding: vi.fn(),
  retrieveSession: vi.fn(),
  teamCandidate: vi.fn(() => false),
  teamCheckoutCandidate: vi.fn(() => false),
  parseTeamSubscription: vi.fn(),
  syncTeamSubscription: vi.fn(),
}));

vi.mock("@/lib/stripe", () => ({
  stripe: {
    webhooks: { constructEvent: mocks.constructEvent },
    customers: { retrieve: vi.fn() },
    checkout: { sessions: { retrieve: mocks.retrieveSession } },
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
vi.mock("@/lib/teamStripeLifecycle", () => ({
  InvalidTeamStripeEventError: class InvalidTeamStripeEventError extends Error {},
  isTeamCheckoutCandidate: mocks.teamCheckoutCandidate,
  isTeamSubscriptionCandidate: mocks.teamCandidate,
  parseTeamStripeSubscription: mocks.parseTeamSubscription,
  syncTeamStripeSubscription: mocks.syncTeamSubscription,
}));

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
        mode: "payment",
        url: "https://checkout.stripe.test/session",
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
  mocks.allocateVideoFunding.mockImplementation(async (name: string) =>
    name === "reconcile_video_exclusive_checkout"
      ? { data: true, error: null }
      : { data: { allocationId: "allocation-1" }, error: null },
  );
  mocks.retrieveSession.mockImplementation(async (id: string) => ({ ...creditEvent().data.object, id }));
  mocks.teamCandidate.mockReturnValue(false);
  mocks.teamCheckoutCandidate.mockReturnValue(false);
  mocks.parseTeamSubscription.mockReturnValue({ userId: "user-verified" });
  mocks.syncTeamSubscription.mockResolvedValue(undefined);
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

  it("honors the checkout-persisted general purpose even if video funding is enabled later", async () => {
    const event = creditEvent();
    event.data.object.metadata.credit_funding_purpose = "general";
    mocks.constructEvent.mockReturnValue(event);
    process.env.VIDEO_EXCLUSIVE_FUNDING_ENABLED = "1";

    const res = await POST(signedRequest());

    expect(res.status).toBe(200);
    expect(mocks.grantPurchasedCredits).toHaveBeenCalledOnce();
    expect(mocks.allocateVideoFunding).not.toHaveBeenCalled();
  });

  it("fails closed for an unknown checkout purpose instead of granting general credits", async () => {
    const event = creditEvent();
    event.data.object.metadata.credit_funding_purpose = "unrecognized";
    mocks.constructEvent.mockReturnValue(event);

    const res = await POST(signedRequest());

    expect(res.status).toBe(500);
    expect(mocks.grantPurchasedCredits).not.toHaveBeenCalled();
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

  it("fails closed for an exclusive purpose while the feature flag is off", async () => {
    const event = creditEvent();
    event.data.object.metadata.credit_funding_purpose = "video-exclusive";
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
    event.data.object.metadata.credit_funding_purpose = "video-exclusive";
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

  it("routes a live-signed exclusive event even when the paid session has no active Checkout URL", async () => {
    const event = creditEvent();
    event.livemode = true;
    event.data.object.metadata.credit_funding_purpose = "video-exclusive";
    event.data.object.metadata.video_funding_issuer_id = "enrolled-issuer";
    event.data.object.metadata.video_funding_destination = "ledger-prod-7";
    event.data.object.metadata.video_exclusive_checkout_quote_id = "opaque-provider-quote";
    event.data.object.metadata.video_exclusive_checkout_request_hash = "a".repeat(64);
    mocks.constructEvent.mockReturnValue(event);
    mocks.retrieveSession.mockResolvedValue({ ...event.data.object, url: null });
    process.env.VIDEO_EXCLUSIVE_FUNDING_ENABLED = "true";
    process.env.VIDEO_FUNDING_SOURCE_ISSUER = "enrolled-issuer";
    process.env.VIDEO_FUNDING_SOURCE_DESTINATION = "ledger-prod-7";

    const res = await POST(signedRequest());

    expect(res.status).toBe(200);
    expect(mocks.grantPurchasedCredits).not.toHaveBeenCalled();
    expect(mocks.allocateVideoFunding).toHaveBeenCalledWith("allocate_video_exclusive_funding_pinned", {
      p_signature_verified_live: true,
      p_event_livemode: true,
      p_source_event_id: "evt_credit_123",
      p_provider_payment_id: "pi_credit_123",
      p_account_id: "user-verified",
      p_issuer_id: "enrolled-issuer",
      p_destination: "ledger-prod-7",
      p_quote_id: "opaque-provider-quote",
      p_request_hash: "a".repeat(64),
      p_checkout_session_id: "cs_credit_123",
      p_purpose: "video-exclusive",
      p_currency: "USD",
      p_amount_micros: 10_000_000,
    });
  });

  it("fails closed if a test signing secret verifies an event claiming live mode", async () => {
    const event = creditEvent();
    event.data.object.metadata.credit_funding_purpose = "video-exclusive";
    event.data.object.metadata.video_funding_issuer_id = "enrolled-issuer";
    mocks.constructEvent.mockImplementation((_raw, _signature, secret) => {
      if (secret === "whsec_live") throw new Error("wrong secret");
      return event;
    });
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_live";
    process.env.STRIPE_TEST_WEBHOOK_SECRET = "whsec_test";
    process.env.VIDEO_EXCLUSIVE_FUNDING_ENABLED = "1";

    const res = await POST(signedRequest());

    expect(res.status).toBe(400);
    expect(mocks.grantPurchasedCredits).not.toHaveBeenCalled();
    expect(mocks.allocateVideoFunding).not.toHaveBeenCalled();
  });

  it("rejects a test-secret signature claiming live mode before general credit grant", async () => {
    const event = creditEvent();
    event.data.object.metadata.credit_funding_purpose = "general";
    mocks.constructEvent.mockImplementation((_raw, _signature, secret) => {
      if (secret === "whsec_live") throw new Error("wrong secret");
      return event;
    });
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_live";
    process.env.STRIPE_TEST_WEBHOOK_SECRET = "whsec_test";

    const res = await POST(signedRequest());

    expect(res.status).toBe(400);
    expect(mocks.grantPurchasedCredits).not.toHaveBeenCalled();
    expect(mocks.allocateVideoFunding).not.toHaveBeenCalled();
  });
});

// Keep #411's completed and delayed-payment test-mode regressions when #423
// supersedes it; no provider or database calls are made by these tests.
describe("general-credit environment boundary (#411)", () => {
  it.each(["checkout.session.completed", "checkout.session.async_payment_succeeded"])(
    "never grants general funds for a test event: %s", async type => {
      const event = creditEvent();
      event.type = type;
      event.livemode = false;
      event.data.object.livemode = false;
      mocks.constructEvent.mockReturnValue(event);
      const r = await POST(signedRequest());
      expect(r.status).toBe(200);
      expect(await r.json()).toEqual({ received: true, ignored: "test_credit_event" });
      expect(mocks.grantPurchasedCredits).not.toHaveBeenCalled();
      expect(mocks.allocateVideoFunding).not.toHaveBeenCalled();
    });
  it("refuses live general credits when live and test signing secrets are equal", async () => {
    process.env.STRIPE_WEBHOOK_SECRET = "same-private-fixture";
    process.env.STRIPE_TEST_WEBHOOK_SECRET = "same-private-fixture";
    expect((await POST(signedRequest())).status).toBe(400);
    expect(mocks.grantPurchasedCredits).not.toHaveBeenCalled();
  });
  it("refuses live general credits when only the test signing secret exists", async () => {
    delete process.env.STRIPE_WEBHOOK_SECRET;
    process.env.STRIPE_TEST_WEBHOOK_SECRET = "only-test-fixture";
    expect((await POST(signedRequest())).status).toBe(400);
    expect(mocks.grantPurchasedCredits).not.toHaveBeenCalled();
  });
});

describe("Team Stripe webhook isolation", () => {
  function teamSubscriptionEvent(livemode = true) {
    return {
      id: "evt_team_123",
      type: "customer.subscription.updated",
      livemode,
      data: { object: { id: "sub_team_123", livemode, metadata: { plan: "team" } } },
    };
  }

  it("sends recognized live Team subscriptions only through the additive Team adapter", async () => {
    const event = teamSubscriptionEvent();
    mocks.constructEvent.mockReturnValue(event);
    mocks.teamCandidate.mockReturnValue(true);

    const response = await POST(signedRequest());

    expect(response.status).toBe(200);
    expect(mocks.parseTeamSubscription).toHaveBeenCalledWith(event);
    expect(mocks.syncTeamSubscription).toHaveBeenCalledWith({ userId: "user-verified" });
    const { syncSubscriptionToSupabase, revokeSubscription } = await import("@/lib/subscriptionsSync");
    expect(syncSubscriptionToSupabase).not.toHaveBeenCalled();
    expect(revokeSubscription).not.toHaveBeenCalled();
  });

  it("ignores signed test-mode Team events without writing production entitlements", async () => {
    const event = teamSubscriptionEvent(false);
    mocks.constructEvent.mockReturnValue(event);
    mocks.teamCandidate.mockReturnValue(true);

    const response = await POST(signedRequest());

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ ignored: "test_team_event" });
    expect(mocks.parseTeamSubscription).not.toHaveBeenCalled();
    expect(mocks.syncTeamSubscription).not.toHaveBeenCalled();
  });

  it("rejects invalid Team metadata before invoking the service-role adapter", async () => {
    const event = teamSubscriptionEvent();
    mocks.constructEvent.mockReturnValue(event);
    mocks.teamCandidate.mockReturnValue(true);
    const { InvalidTeamStripeEventError } = await import("@/lib/teamStripeLifecycle");
    mocks.parseTeamSubscription.mockImplementation(() => {
      throw new InvalidTeamStripeEventError("Team Stripe metadata contract mismatch");
    });

    const response = await POST(signedRequest());

    expect(response.status).toBe(400);
    expect(mocks.syncTeamSubscription).not.toHaveBeenCalled();
    const { syncSubscriptionToSupabase, revokeSubscription } = await import("@/lib/subscriptionsSync");
    expect(syncSubscriptionToSupabase).not.toHaveBeenCalled();
    expect(revokeSubscription).not.toHaveBeenCalled();
  });

  it("returns 503 for Team-marked checkout sessions instead of sending a welcome email", async () => {
    const event = {
      id: "evt_team_checkout",
      type: "checkout.session.completed",
      livemode: true,
      data: { object: { id: "cs_team", metadata: { plan: "team" } } },
    };
    mocks.constructEvent.mockReturnValue(event);
    mocks.teamCheckoutCandidate.mockReturnValue(true);

    const response = await POST(signedRequest());

    expect(response.status).toBe(503);
    const { sendWelcomeEmail } = await import("@/lib/email");
    expect(sendWelcomeEmail).not.toHaveBeenCalled();
    expect(mocks.syncTeamSubscription).not.toHaveBeenCalled();
  });

  it("asks Stripe to retry if the Team RPC is unavailable", async () => {
    const event = teamSubscriptionEvent();
    mocks.constructEvent.mockReturnValue(event);
    mocks.teamCandidate.mockReturnValue(true);
    mocks.syncTeamSubscription.mockRejectedValueOnce(new Error("RPC missing"));

    const response = await POST(signedRequest());

    expect(response.status).toBe(500);
  });
});
