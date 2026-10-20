import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getAdmin: vi.fn(),
  from: vi.fn(),
  select: vi.fn(),
  eq: vi.fn(),
  maybeSingle: vi.fn(),
  rpc: vi.fn(),
  retrieveSession: vi.fn(),
  retrieveSubscription: vi.fn(),
}));

vi.mock("@/lib/supabaseAdmin", () => ({ getSupabaseAdmin: mocks.getAdmin }));
vi.mock("@/lib/stripe", () => ({
  stripe: {
    checkout: { sessions: { retrieve: mocks.retrieveSession } },
    subscriptions: { retrieve: mocks.retrieveSubscription },
  },
  envId: (...names: string[]) => {
    for (const name of names) {
      const value = process.env[name]?.trim();
      if (value) return value;
    }
    return null;
  },
}));

import {
  dispatchTeamCheckoutWebhook,
  InvalidTeamCheckoutWebhookEventError,
  RetryableTeamCheckoutWebhookError,
} from "./teamCheckoutWebhookDispatcher";

const owner = "11111111-1111-4111-8111-111111111111";
const requestId = "22222222-2222-4222-8222-222222222222";
const intentId = "33333333-3333-4333-8333-333333333333";
const idempotencyKey = "team-checkout:44444444-4444-4444-8444-444444444444";
const sessionId = "cs_team_123";
const customerId = "cus_team_123";
const subscriptionId = "sub_team_123";
const priceId = "price_teamlive";

function metadata() {
  return {
    plan: "team",
    source: "terminalsync_team",
    team_billing_version: "1",
    supabase_user_id: owner,
    team_seat_count: "3",
    team_checkout_intent_id: intentId,
    team_checkout_owner_user_id: owner,
    team_checkout_request_id: requestId,
    team_checkout_price_id: priceId,
    team_checkout_seats: "3",
    team_checkout_mode: "subscription",
    team_checkout_idempotency_key: idempotencyKey,
  };
}

function intent(state = "checkout_created", overrides: Record<string, unknown> = {}) {
  return {
    id: intentId,
    owner_user_id: owner,
    request_id: requestId,
    stripe_price_id: priceId,
    seats: 3,
    mode: "subscription",
    idempotency_key: idempotencyKey,
    state,
    stripe_session_id: state === "creating" ? null : sessionId,
    stripe_subscription_id: state === "completed" ? subscriptionId : null,
    billing_sync_status: state === "completed" ? "applied" : "pending",
    ...overrides,
  };
}

function session(overrides: Record<string, unknown> = {}) {
  return {
    id: sessionId,
    object: "checkout.session",
    mode: "subscription",
    status: "complete",
    payment_status: "paid",
    livemode: true,
    customer: customerId,
    subscription: subscriptionId,
    metadata: metadata(),
    ...overrides,
  };
}

function checkoutEvent(type: string, overrides: Record<string, unknown> = {}) {
  return {
    id: "evt_checkout_123",
    object: "event",
    type,
    created: 1_792_000_000,
    livemode: true,
    data: { object: session(overrides) },
  } as any;
}

function subscriptionEvent(
  type: "customer.subscription.created" | "customer.subscription.updated" | "customer.subscription.deleted" = "customer.subscription.updated",
  overrides: Record<string, unknown> = {},
) {
  return {
    id: `evt_${type.replaceAll(".", "_")}`,
    object: "event",
    type,
    created: 1_792_000_000,
    livemode: true,
    data: {
      object: {
        id: subscriptionId,
        object: "subscription",
        livemode: true,
        customer: customerId,
        status: type === "customer.subscription.deleted" ? "canceled" : "past_due",
        cancel_at_period_end: type !== "customer.subscription.created",
        trial_end: null,
        metadata: metadata(),
        items: {
          data: [{
            quantity: 3,
            current_period_start: 1_792_000_000,
            current_period_end: 1_794_592_000,
            price: {
              id: priceId,
              currency: "usd",
              unit_amount: 5900,
              recurring: { interval: "month", interval_count: 1 },
            },
          }],
        },
        ...overrides,
      },
    },
  } as any;
}

function configuredClient() {
  mocks.from.mockReturnValue({ select: mocks.select });
  mocks.select.mockReturnValue({ eq: mocks.eq });
  mocks.eq.mockReturnValue({ maybeSingle: mocks.maybeSingle });
  mocks.getAdmin.mockReturnValue({ from: mocks.from, rpc: mocks.rpc });
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.STRIPE_SECRET_KEY = "sk_live_source_only";
  process.env.STRIPE_PRICE_TEAM = priceId;
  configuredClient();
  mocks.maybeSingle.mockResolvedValue({ data: intent(), error: null });
  mocks.retrieveSession.mockResolvedValue(session());
  mocks.rpc.mockImplementation(async (name: string) => ({
    data: name === "mark_team_checkout_session_pending" ? "pending_billing_sync" : "completed",
    error: null,
  }));
});

afterEach(() => {
  delete process.env.STRIPE_SECRET_KEY;
  delete process.env.STRIPE_PRICE_TEAM;
});

describe("signed Team Checkout dispatcher", () => {
  it.each([
    ["checkout.session.completed", "complete", "paid", "mark_team_checkout_session_pending", "pending_billing_sync"],
    ["checkout.session.async_payment_succeeded", "complete", "paid", "mark_team_checkout_session_pending", "pending_billing_sync"],
    ["checkout.session.expired", "expired", "unpaid", "release_team_checkout_expired_session", "expired"],
    ["checkout.session.async_payment_failed", "complete", "unpaid", "mark_team_checkout_async_failed", "pending_billing_sync"],
  ] as const)("dispatches %s only to its exact marker RPC", async (type, status, paymentStatus, rpc, result) => {
    mocks.rpc.mockResolvedValueOnce({ data: result, error: null });

    await expect(dispatchTeamCheckoutWebhook(checkoutEvent(type, {
      status,
      payment_status: paymentStatus,
    }))).resolves.toBe(result);

    expect(mocks.rpc).toHaveBeenCalledWith(rpc, {
      p_intent_id: intentId,
      p_stripe_session_id: sessionId,
    });
    expect(mocks.retrieveSession).not.toHaveBeenCalled();
    expect(mocks.rpc).not.toHaveBeenCalledWith("apply_team_stripe_subscription_event", expect.anything());
  });

  it("binds a signed exact Session before marking a creating recovery intent", async () => {
    mocks.maybeSingle
      .mockResolvedValueOnce({ data: intent("creating"), error: null })
      .mockResolvedValueOnce({ data: intent("checkout_created"), error: null });
    mocks.rpc
      .mockResolvedValueOnce({ data: "checkout_created", error: null })
      .mockResolvedValueOnce({ data: "pending_billing_sync", error: null });

    await expect(dispatchTeamCheckoutWebhook(checkoutEvent("checkout.session.completed"))).resolves.toBe("pending_billing_sync");

    expect(mocks.rpc).toHaveBeenNthCalledWith(1, "bind_team_checkout_session", {
      p_intent_id: intentId,
      p_idempotency_key: idempotencyKey,
      p_stripe_session_id: sessionId,
    });
    expect(mocks.rpc).toHaveBeenNthCalledWith(2, "mark_team_checkout_session_pending", {
      p_intent_id: intentId,
      p_stripe_session_id: sessionId,
    });
    expect(mocks.retrieveSession).not.toHaveBeenCalled();
  });

  it.each(["customer.subscription.updated", "customer.subscription.deleted"] as const)(
    "finalizes later %s only through the canonical 0051 wrapper",
    async (type) => {
      mocks.maybeSingle.mockResolvedValue({ data: intent("completed"), error: null });
      mocks.rpc.mockResolvedValueOnce({ data: "completed", error: null });
      const event = subscriptionEvent(type);

      await expect(dispatchTeamCheckoutWebhook(event)).resolves.toBe("completed");

      expect(mocks.retrieveSession).toHaveBeenCalledWith(sessionId);
      expect(mocks.retrieveSubscription).not.toHaveBeenCalled();
      expect(mocks.rpc).toHaveBeenCalledWith("apply_team_checkout_billing_and_finalize", expect.objectContaining({
        p_intent_id: intentId,
        p_stripe_session_id: sessionId,
        p_user_id: owner,
        p_stripe_customer_id: customerId,
        p_stripe_subscription_id: subscriptionId,
        p_stripe_price_id: priceId,
        p_seat_count: 3,
        p_event_type: type,
        p_metadata: {
          team_checkout_intent_id: intentId,
          team_checkout_session_id: sessionId,
          team_checkout_owner_user_id: owner,
          team_checkout_request_id: requestId,
          team_checkout_price_id: priceId,
          team_checkout_seats: "3",
          team_checkout_mode: "subscription",
          team_checkout_idempotency_key: idempotencyKey,
          team_checkout_customer_id: customerId,
          team_checkout_subscription_id: subscriptionId,
        },
      }));
      expect(mocks.rpc).not.toHaveBeenCalledWith("apply_team_stripe_subscription_event", expect.anything());
    },
  );

  it("waits for a signed Checkout Session event when a subscription arrives before an unbound creating intent", async () => {
    mocks.maybeSingle.mockResolvedValueOnce({ data: intent("creating"), error: null });

    await expect(dispatchTeamCheckoutWebhook(subscriptionEvent())).rejects.toBeInstanceOf(
      RetryableTeamCheckoutWebhookError,
    );

    expect(mocks.retrieveSession).not.toHaveBeenCalled();
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it("fails malformed route metadata before a marker or ledger RPC", async () => {
    const malformed = checkoutEvent("checkout.session.completed", {
      metadata: { ...metadata(), team_checkout_owner_user_id: "" },
    });

    await expect(dispatchTeamCheckoutWebhook(malformed)).rejects.toBeInstanceOf(
      InvalidTeamCheckoutWebhookEventError,
    );

    expect(mocks.rpc).not.toHaveBeenCalled();
    expect(mocks.retrieveSession).not.toHaveBeenCalled();
  });

  it("keeps an exact terminal intent out of marker fallthrough", async () => {
    mocks.maybeSingle.mockResolvedValueOnce({ data: intent("completed"), error: null });

    await expect(dispatchTeamCheckoutWebhook(checkoutEvent("checkout.session.expired", {
      status: "expired",
      payment_status: "unpaid",
    }))).resolves.toBe("terminal_noop");

    expect(mocks.rpc).not.toHaveBeenCalled();
    expect(mocks.retrieveSession).not.toHaveBeenCalled();
  });
});
