import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  constructEvent: vi.fn(),
  retrieveCustomer: vi.fn(),
  retrieveSession: vi.fn(),
  getAdmin: vi.fn(),
  from: vi.fn(),
  select: vi.fn(),
  eq: vi.fn(),
  maybeSingle: vi.fn(),
  rpc: vi.fn(),
  syncTeamSubscription: vi.fn(),
  syncSubscription: vi.fn(),
  revokeSubscription: vi.fn(),
  sendWelcomeEmail: vi.fn(),
  grantPurchasedCredits: vi.fn(),
  allocateVideoFunding: vi.fn(),
}));

vi.mock("@/lib/stripe", () => ({
  stripe: {
    webhooks: { constructEvent: mocks.constructEvent },
    customers: { retrieve: mocks.retrieveCustomer },
    checkout: { sessions: { retrieve: mocks.retrieveSession } },
  },
  envId: (...names: string[]) => {
    for (const name of names) {
      const value = process.env[name]?.trim();
      if (value) return value;
    }
    return null;
  },
}));
vi.mock("@/lib/supabaseAdmin", () => ({ getSupabaseAdmin: mocks.getAdmin }));
vi.mock("@/lib/email", () => ({
  sendWelcomeEmail: mocks.sendWelcomeEmail,
  sendTrialEndingEmail: vi.fn(),
  sendPaymentFailedEmail: vi.fn(),
  sendCancellationEmail: vi.fn(),
}));
vi.mock("@/lib/subscriptionsSync", () => ({
  syncSubscriptionToSupabase: mocks.syncSubscription,
  revokeSubscription: mocks.revokeSubscription,
}));
vi.mock("@/lib/userLang", () => ({ resolveUserLang: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/teamStripeLifecycle", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/lib/teamStripeLifecycle")>(),
  syncTeamStripeSubscription: mocks.syncTeamSubscription,
}));
vi.mock("@/lib/aiCredits", () => ({
  CREDIT_CHECKOUT_SOURCE: "terminalsync_credits",
  grantPurchasedCredits: mocks.grantPurchasedCredits,
  parseCreditPaymentMetadata: vi.fn(),
}));
vi.mock("@/lib/videoExclusiveFunding", () => ({
  CREDIT_FUNDING_PURPOSE_METADATA: "credit_funding_purpose",
  VIDEO_EXCLUSIVE_PURPOSE: "video_exclusive",
  allocateVideoExclusiveFunding: mocks.allocateVideoFunding,
}));

import { POST } from "./route";

const owner = "11111111-1111-4111-8111-111111111111";
const requestId = "22222222-2222-4222-8222-222222222222";
const intentId = "33333333-3333-4333-8333-333333333333";
const idempotencyKey = "team-checkout:44444444-4444-4444-8444-444444444444";

function liveTeamEvent() {
  return {
    id: "evt_team_terms_retry",
    object: "event",
    type: "checkout.session.completed",
    created: 1_792_000_000,
    livemode: true,
    data: {
      object: {
        id: "cs_team_123",
        object: "checkout.session",
        mode: "subscription",
        status: "complete",
        payment_status: "paid",
        livemode: true,
        customer: "cus_team_123",
        subscription: "sub_team_123",
        metadata: {
          plan: "team",
          source: "terminalsync_team",
          team_billing_version: "1",
          supabase_user_id: owner,
          team_seat_count: "3",
          team_checkout_intent_id: intentId,
          team_checkout_owner_user_id: owner,
          team_checkout_request_id: requestId,
          team_checkout_price_id: "price_teamlive",
          team_checkout_seats: "3",
          team_checkout_mode: "subscription",
          team_checkout_idempotency_key: idempotencyKey,
        },
      },
    },
  };
}

function liveTeamSubscriptionEvent() {
  return {
    id: "evt_team_stale_price_subscription",
    object: "event",
    type: "customer.subscription.updated",
    created: 1_792_000_000,
    livemode: true,
    data: {
      object: {
        id: "sub_team_123",
        object: "subscription",
        livemode: true,
        customer: "cus_team_123",
        status: "past_due",
        cancel_at_period_end: true,
        trial_end: null,
        metadata: {
          plan: "team",
          source: "terminalsync_team",
          team_billing_version: "1",
          supabase_user_id: owner,
          team_seat_count: "3",
          team_checkout_intent_id: intentId,
          team_checkout_owner_user_id: owner,
          team_checkout_request_id: requestId,
          team_checkout_price_id: "price_teamlive",
          team_checkout_seats: "3",
          team_checkout_mode: "subscription",
          team_checkout_idempotency_key: idempotencyKey,
        },
        items: {
          data: [{
            quantity: 3,
            current_period_start: 1_792_000_000,
            current_period_end: 1_794_592_000,
            price: {
              id: "price_teamlive",
              currency: "usd",
              unit_amount: 5900,
              recurring: { interval: "month", interval_count: 1 },
            },
          }],
        },
      },
    },
  };
}

function durableIntent() {
  return {
    id: intentId,
    owner_user_id: owner,
    request_id: requestId,
    stripe_price_id: "price_teamlive",
    seats: 3,
    mode: "subscription",
    idempotency_key: idempotencyKey,
    state: "checkout_created",
    stripe_session_id: "cs_team_123",
    stripe_subscription_id: null,
    billing_sync_status: "pending",
  };
}

function configuredIntentRead() {
  mocks.from.mockReturnValue({ select: mocks.select });
  mocks.select.mockReturnValue({ eq: mocks.eq });
  mocks.eq.mockReturnValue({ maybeSingle: mocks.maybeSingle });
  mocks.getAdmin.mockReturnValue({ from: mocks.from, rpc: mocks.rpc });
  mocks.maybeSingle.mockResolvedValue({ data: durableIntent(), error: null });
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
  process.env.TEAM_FEATURE_ENABLED = "1";
  process.env.TEAM_PAID_CHECKOUT_ENABLED = "1";
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_live";
  mocks.constructEvent.mockReturnValue(liveTeamEvent());
});

afterEach(() => {
  delete process.env.TEAM_FEATURE_ENABLED;
  delete process.env.TEAM_PAID_CHECKOUT_ENABLED;
  delete process.env.STRIPE_WEBHOOK_SECRET;
  delete process.env.STRIPE_TEST_WEBHOOK_SECRET;
  delete process.env.STRIPE_SECRET_KEY;
  delete process.env.STRIPE_PRICE_TEAM;
  delete process.env.STRIPE_PRICE_TEAM_TEST;
});

describe("signed Team Checkout terms retry contract", () => {
  it.each([
    ["live terms are unavailable", () => {
      process.env.STRIPE_SECRET_KEY = "sk_live_source_only";
    }],
    ["configured terms have the wrong mode", () => {
      process.env.STRIPE_SECRET_KEY = "sk_test_source_only";
      process.env.STRIPE_PRICE_TEAM_TEST = "price_teamtest";
    }],
  ])("returns 500 without any fulfillment side effect when %s", async (_label, configureTerms) => {
    configureTerms();

    const response = await POST(signedRequest());

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      received: false,
      error: "Team checkout fulfillment requires retry",
    });
    expect(mocks.getAdmin).not.toHaveBeenCalled();
    expect(mocks.retrieveCustomer).not.toHaveBeenCalled();
    expect(mocks.retrieveSession).not.toHaveBeenCalled();
    expect(mocks.syncTeamSubscription).not.toHaveBeenCalled();
    expect(mocks.syncSubscription).not.toHaveBeenCalled();
    expect(mocks.revokeSubscription).not.toHaveBeenCalled();
    expect(mocks.sendWelcomeEmail).not.toHaveBeenCalled();
    expect(mocks.grantPurchasedCredits).not.toHaveBeenCalled();
    expect(mocks.allocateVideoFunding).not.toHaveBeenCalled();
  });

  it.each([
    ["Checkout Session", liveTeamEvent],
    ["subscription", liveTeamSubscriptionEvent],
  ] as const)("returns 500 before provider, ledger, or legacy side effects for a stale configured Team Price on a signed %s", async (_kind, event) => {
    process.env.STRIPE_SECRET_KEY = "sk_live_source_only";
    process.env.STRIPE_PRICE_TEAM = "price_teamstale";
    configuredIntentRead();
    mocks.constructEvent.mockReturnValue(event());

    const response = await POST(signedRequest());

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      received: false,
      error: "Team checkout fulfillment requires retry",
    });
    // A read is necessary to prove this is durable/config drift; no mutation
    // or provider retrieval may precede the retry response.
    expect(mocks.maybeSingle).toHaveBeenCalledTimes(1);
    expect(mocks.rpc).not.toHaveBeenCalled();
    expect(mocks.retrieveCustomer).not.toHaveBeenCalled();
    expect(mocks.retrieveSession).not.toHaveBeenCalled();
    expect(mocks.syncTeamSubscription).not.toHaveBeenCalled();
    expect(mocks.syncSubscription).not.toHaveBeenCalled();
    expect(mocks.revokeSubscription).not.toHaveBeenCalled();
    expect(mocks.sendWelcomeEmail).not.toHaveBeenCalled();
    expect(mocks.grantPurchasedCredits).not.toHaveBeenCalled();
    expect(mocks.allocateVideoFunding).not.toHaveBeenCalled();
  });

  it.each([
    ["Checkout Session", () => {
      const event = liveTeamEvent();
      event.data.object.metadata.team_checkout_price_id = "price_other";
      return event;
    }],
    ["subscription", () => {
      const event = liveTeamSubscriptionEvent();
      event.data.object.items.data[0].price.id = "price_other";
      return event;
    }],
    ["subscription route metadata", () => {
      const event = liveTeamSubscriptionEvent();
      event.data.object.metadata.team_checkout_price_id = "price_other";
      return event;
    }],
  ] as const)("keeps a signed %s Price mismatch with the durable intent at 400 even when local terms are stale", async (_kind, event) => {
    process.env.STRIPE_SECRET_KEY = "sk_live_source_only";
    process.env.STRIPE_PRICE_TEAM = "price_teamstale";
    configuredIntentRead();
    mocks.constructEvent.mockReturnValue(event());

    const response = await POST(signedRequest());

    expect(response.status).toBe(400);
    expect(mocks.from).toHaveBeenCalledWith("team_checkout_intents");
    expect(mocks.maybeSingle).toHaveBeenCalledTimes(1);
    expect(mocks.rpc).not.toHaveBeenCalled();
    expect(mocks.retrieveSession).not.toHaveBeenCalled();
    expect(mocks.syncTeamSubscription).not.toHaveBeenCalled();
    expect(mocks.syncSubscription).not.toHaveBeenCalled();
    expect(mocks.revokeSubscription).not.toHaveBeenCalled();
  });
});
