import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ rpc: vi.fn(), getAdmin: vi.fn() }));
vi.mock("@/lib/supabaseAdmin", () => ({ getSupabaseAdmin: mocks.getAdmin }));

import type Stripe from "stripe";
import {
  InvalidTeamStripeEventError,
  isTeamSubscriptionCandidate,
  parseTeamStripeSubscription,
  syncTeamStripeSubscription,
  type TeamStripeEventType,
} from "./teamStripeLifecycle";

const USER_ID = "7ef76c9c-0f81-4aef-9d41-9ed8df241bd7";

function subscriptionEvent(overrides: Record<string, unknown> = {}) {
  const subscription = {
    id: "sub_team_123",
    object: "subscription",
    livemode: true,
    customer: "cus_team_123",
    status: "active",
    cancel_at_period_end: false,
    trial_end: null,
    metadata: {
      plan: "team",
      source: "terminalsync_team",
      team_billing_version: "1",
      supabase_user_id: USER_ID,
      team_seat_count: "4",
    },
    items: {
      data: [{
        quantity: 4,
        current_period_start: 1_797_000_000,
        current_period_end: 1_799_592_000,
        price: {
          id: "price_team_live",
          currency: "usd",
          unit_amount: 5900,
          recurring: { interval: "month", interval_count: 1 },
        },
      }],
    },
    ...overrides,
  };
  return {
    id: "evt_team_123",
    object: "event",
    type: "customer.subscription.updated" as TeamStripeEventType,
    created: 1_797_000_000,
    livemode: true,
    data: { object: subscription },
  } as unknown as Stripe.Event & { type: TeamStripeEventType; data: { object: Stripe.Subscription } };
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.STRIPE_PRICE_TEAM = "price_team_live";
  process.env.STRIPE_PRICE_TEAM_TEST = "price_team_test";
  mocks.getAdmin.mockReturnValue({ rpc: mocks.rpc });
  mocks.rpc.mockResolvedValue({ data: "ok", error: null });
});

afterEach(() => {
  delete process.env.STRIPE_PRICE_TEAM;
  delete process.env.STRIPE_PRICE_TEAM_TEST;
});

describe("Team Stripe lifecycle parser", () => {
  it("recognizes Team from explicit metadata or its configured price", () => {
    const event = subscriptionEvent();
    expect(isTeamSubscriptionCandidate(event)).toBe(true);

    const withoutMetadata = subscriptionEvent({ metadata: {} });
    expect(isTeamSubscriptionCandidate(withoutMetadata)).toBe(true);
  });

  it("parses a correctly bound $59 monthly subscription and preserves its additive fields", () => {
    const command = parseTeamStripeSubscription(subscriptionEvent());
    expect(command).toMatchObject({
      eventId: "evt_team_123",
      eventType: "customer.subscription.updated",
      livemode: true,
      userId: USER_ID,
      customerId: "cus_team_123",
      subscriptionId: "sub_team_123",
      priceId: "price_team_live",
      seatCount: 4,
      status: "active",
      cancelAtPeriodEnd: false,
    });
    expect(command.currentPeriodStart).toBe(new Date(1_797_000_000 * 1000).toISOString());
    expect(command.currentPeriodEnd).toBe(new Date(1_799_592_000 * 1000).toISOString());
    expect(command.trialEnd).toBeNull();
  });

  it.each([
    ["missing user binding", { metadata: { plan: "team", source: "terminalsync_team", team_billing_version: "1", team_seat_count: "4" } }],
    ["invalid user binding", { metadata: { plan: "team", source: "terminalsync_team", team_billing_version: "1", supabase_user_id: "not-a-uuid", team_seat_count: "4" } }],
    ["wrong source", { metadata: { plan: "team", source: "other", team_billing_version: "1", supabase_user_id: USER_ID, team_seat_count: "4" } }],
    ["unknown metadata version", { metadata: { plan: "team", source: "terminalsync_team", team_billing_version: "2", supabase_user_id: USER_ID, team_seat_count: "4" } }],
    ["non-canonical seat count", { metadata: { plan: "team", source: "terminalsync_team", team_billing_version: "1", supabase_user_id: USER_ID, team_seat_count: "04" } }],
    ["seat mismatch", { items: { data: [{ quantity: 3, price: { id: "price_team_live", currency: "usd", unit_amount: 5900, recurring: { interval: "month", interval_count: 1 } } }] } }],
    ["wrong price", { items: { data: [{ quantity: 4, price: { id: "price_other", currency: "usd", unit_amount: 5900, recurring: { interval: "month", interval_count: 1 } } }] } }],
    ["non-USD price", { items: { data: [{ quantity: 4, price: { id: "price_team_live", currency: "eur", unit_amount: 5900, recurring: { interval: "month", interval_count: 1 } } }] } }],
    ["wrong amount", { items: { data: [{ quantity: 4, price: { id: "price_team_live", currency: "usd", unit_amount: 4900, recurring: { interval: "month", interval_count: 1 } } }] } }],
    ["wrong recurrence", { items: { data: [{ quantity: 4, price: { id: "price_team_live", currency: "usd", unit_amount: 5900, recurring: { interval: "year", interval_count: 1 } } }] } }],
    ["multiple items", { items: { data: [
      { quantity: 4, price: { id: "price_team_live", currency: "usd", unit_amount: 5900, recurring: { interval: "month", interval_count: 1 } } },
      { quantity: 1, price: { id: "price_addon", currency: "usd", unit_amount: 1000, recurring: { interval: "month", interval_count: 1 } } },
    ] } }],
  ])("fails closed for %s", (_description, overrides) => {
    expect(() => parseTeamStripeSubscription(subscriptionEvent(overrides))).toThrow(InvalidTeamStripeEventError);
  });

  it("matches test mode only to the test Team price", () => {
    const event = subscriptionEvent();
    event.livemode = false;
    event.data.object.livemode = false;
    event.data.object.items.data[0].price.id = "price_team_test";
    expect(parseTeamStripeSubscription(event).livemode).toBe(false);
    event.data.object.items.data[0].price.id = "price_team_live";
    expect(() => parseTeamStripeSubscription(event)).toThrow("configured mode");
  });

  it("does not infer a Team price from subscription metadata or price labels", () => {
    delete process.env.STRIPE_PRICE_TEAM;
    const event = subscriptionEvent();
    expect(() => parseTeamStripeSubscription(event)).toThrow("configured mode");
  });
});

describe("Team Stripe service-role adapter", () => {
  it("uses the atomic RPC and requires a recognized idempotent result", async () => {
    const command = parseTeamStripeSubscription(subscriptionEvent());
    await syncTeamStripeSubscription(command);
    expect(mocks.rpc).toHaveBeenCalledWith("sync_team_subscription_event", {
      p_event_id: "evt_team_123",
      p_event_type: "customer.subscription.updated",
      p_livemode: true,
      p_user_id: USER_ID,
      p_stripe_customer_id: "cus_team_123",
      p_stripe_subscription_id: "sub_team_123",
      p_stripe_price_id: "price_team_live",
      p_seat_count: 4,
      p_status: "active",
      p_current_period_start: new Date(1_797_000_000 * 1000).toISOString(),
      p_current_period_end: new Date(1_799_592_000 * 1000).toISOString(),
      p_trial_end: null,
      p_cancel_at_period_end: false,
    });

    mocks.rpc.mockResolvedValueOnce({ data: "duplicate", error: null });
    await expect(syncTeamStripeSubscription(command)).resolves.toBeUndefined();
    mocks.rpc.mockResolvedValueOnce({ data: "unexpected", error: null });
    await expect(syncTeamStripeSubscription(command)).rejects.toThrow("unknown result");
  });

  it("does not treat a missing service client or RPC as successful fulfillment", async () => {
    const command = parseTeamStripeSubscription(subscriptionEvent());
    mocks.getAdmin.mockReturnValueOnce(null);
    await expect(syncTeamStripeSubscription(command)).rejects.toThrow("service-role database client");
    mocks.rpc.mockResolvedValueOnce({ data: null, error: { message: "function missing" } });
    await expect(syncTeamStripeSubscription(command)).rejects.toThrow("function missing");
  });
});
