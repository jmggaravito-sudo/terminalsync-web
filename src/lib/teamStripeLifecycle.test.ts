import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const mocks = vi.hoisted(() => ({ rpc: vi.fn(), getAdmin: vi.fn() }));
vi.mock("@/lib/supabaseAdmin", () => ({ getSupabaseAdmin: mocks.getAdmin }));

import type Stripe from "stripe";
import {
  InvalidTeamStripeEventError,
  isTeamCheckoutCandidate,
  isTeamCheckoutSubscriptionCandidate,
  isTeamSubscriptionCandidate,
  parseTeamStripeSubscription,
  syncTeamStripeSubscription,
  type TeamStripeEventType,
} from "./teamStripeLifecycle";

const USER_ID = "7ef76c9c-0f81-4aef-9d41-9ed8df241bd7";
const SQL = readFileSync(
  resolve(process.cwd(), "supabase/migrations/0038_team_stripe_billing.sql"),
  "utf8",
).toLowerCase().replace(/\s+/g, " ");

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

function checkoutEvent(
  type: string,
  metadata: Record<string, string> | null = {},
): Stripe.Event {
  return {
    id: "evt_team_checkout_123",
    object: "event",
    type,
    created: 1_797_000_000,
    livemode: true,
    data: {
      object: {
        id: "cs_team_123",
        object: "checkout.session",
        livemode: true,
        metadata,
      },
    },
  } as unknown as Stripe.Event;
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.STRIPE_PRICE_TEAM = "price_team_live";
  process.env.STRIPE_PRICE_TEAM_TEST = "price_team_test";
  mocks.getAdmin.mockReturnValue({ rpc: mocks.rpc });
  mocks.rpc.mockResolvedValue({ data: "applied", error: null });
});

afterEach(() => {
  delete process.env.STRIPE_PRICE_TEAM;
  delete process.env.STRIPE_PRICE_TEAM_TEST;
});

describe("Team Stripe lifecycle parser", () => {
  it("matches the service-role RPC contract in migration 0038", () => {
    const declaration = SQL.match(
      /create or replace function public\.apply_team_stripe_subscription_event\((.*?)\) returns text/,
    )?.[1];
    expect(declaration).toBeDefined();
    expect(declaration).toContain("p_user_id uuid");
    expect(declaration).toContain("p_stripe_customer_id text");
    expect(declaration).toContain("p_stripe_subscription_id text");
    expect(declaration).toContain("p_stripe_price_id text");
    expect(declaration).toContain("p_seat_count bigint");
    expect(declaration).toContain("p_status text");
    expect(declaration).toContain("p_current_period_start timestamptz");
    expect(declaration).toContain("p_current_period_end timestamptz");
    expect(declaration).toContain("p_cancel_at_period_end boolean");
    expect(declaration).toContain("p_event_id text");
    expect(declaration).toContain("p_event_type text");
    expect(declaration).toContain("p_event_created_at timestamptz");
    expect(declaration).toContain("p_metadata jsonb");
    for (const result of ["applied", "duplicate", "stale", "reconciliation_required"]) {
      expect(SQL).toContain(`return '${result}'`);
    }
    const rpc = SQL.match(/create or replace function public\.apply_team_stripe_subscription_event\([\s\S]*?\$\$;/)?.[0];
    expect(rpc).toBeDefined();
    expect(rpc).not.toContain("public.subscriptions");
    expect(rpc).not.toContain("public.team_memberships");
    expect(rpc).toContain("status = 'reconciliation_required'");
    expect(rpc).toContain("stripe_subscription_id = p_stripe_subscription_id");
  });

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
      eventCreatedAt: new Date(1_797_000_000 * 1000).toISOString(),
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
    ["seat count above 64", { metadata: { plan: "team", source: "terminalsync_team", team_billing_version: "1", supabase_user_id: USER_ID, team_seat_count: "65" }, items: { data: [{ quantity: 65, price: { id: "price_team_live", currency: "usd", unit_amount: 5900, recurring: { interval: "month", interval_count: 1 } } }] } }],
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

describe("Team checkout candidate boundaries", () => {
  it.each([
    ["plan", { plan: "team" }],
    ["source", { source: "terminalsync_team" }],
    ["billing version", { team_billing_version: "1" }],
  ])("recognizes the %s Team marker on each accepted Checkout success event", (_label, metadata) => {
    expect(isTeamCheckoutCandidate(checkoutEvent("checkout.session.completed", metadata))).toBe(true);
    expect(isTeamCheckoutCandidate(checkoutEvent("checkout.session.async_payment_succeeded", metadata))).toBe(true);
  });

  it.each([
    ["a Team-marked but unsupported Checkout event", "checkout.session.expired", { plan: "team" }],
    ["a Team-marked subscription event", "customer.subscription.updated", { plan: "team" }],
    ["an unrelated Pro session", "checkout.session.completed", { plan: "pro", source: "terminalsync" }],
    ["an unmarked Checkout success session", "checkout.session.async_payment_succeeded", {}],
    ["a Checkout session with no metadata", "checkout.session.completed", null],
  ])("does not classify %s as a Team checkout candidate", (_label, type, metadata) => {
    expect(isTeamCheckoutCandidate(checkoutEvent(type, metadata))).toBe(false);
  });

  it.each([
    ["intent", "team_checkout_intent_id", "intent-partial"],
    ["owner", "team_checkout_owner_user_id", ""],
    ["undefined owner", "team_checkout_owner_user_id", undefined],
    ["request", "team_checkout_request_id", "request-malformed"],
    ["price", "team_checkout_price_id", "price-malformed"],
    ["seats", "team_checkout_seats", "not-a-seat-count"],
    ["mode", "team_checkout_mode", "payment"],
    ["idempotency", "team_checkout_idempotency_key", ""],
  ])("fences a route-only %s marker even when metadata is partial or malformed", (_label, key, value) => {
    const event = subscriptionEvent({ metadata: { [key]: value } });
    expect(isTeamCheckoutSubscriptionCandidate(event)).toBe(true);
  });

  it("leaves a legacy Team subscription without route-only metadata on its existing path", () => {
    const event = subscriptionEvent();
    expect(isTeamCheckoutSubscriptionCandidate(event)).toBe(false);
    expect(isTeamSubscriptionCandidate(event)).toBe(true);
  });

  it("does not treat a route-only marker on a non-subscription event as a checkout subscription", () => {
    expect(isTeamCheckoutSubscriptionCandidate(
      checkoutEvent("checkout.session.completed", { team_checkout_intent_id: "intent-partial" }),
    )).toBe(false);
  });
});

describe("Team Stripe service-role adapter", () => {
  it("uses the atomic RPC and requires a recognized idempotent result", async () => {
    const command = parseTeamStripeSubscription(subscriptionEvent());
    await syncTeamStripeSubscription(command);
    expect(mocks.rpc).toHaveBeenCalledWith("apply_team_stripe_subscription_event", {
      p_user_id: USER_ID,
      p_stripe_customer_id: "cus_team_123",
      p_stripe_subscription_id: "sub_team_123",
      p_stripe_price_id: "price_team_live",
      p_seat_count: 4,
      p_status: "active",
      p_current_period_start: new Date(1_797_000_000 * 1000).toISOString(),
      p_current_period_end: new Date(1_799_592_000 * 1000).toISOString(),
      p_cancel_at_period_end: false,
      p_event_id: "evt_team_123",
      p_event_type: "customer.subscription.updated",
      p_event_created_at: new Date(1_797_000_000 * 1000).toISOString(),
      p_metadata: {
        billing_version: "1",
        source: "terminalsync_team",
        trial_end: null,
      },
    });

    mocks.rpc.mockResolvedValueOnce({ data: "duplicate", error: null });
    await expect(syncTeamStripeSubscription(command)).resolves.toBe("duplicate");
    mocks.rpc.mockResolvedValueOnce({ data: "stale", error: null });
    await expect(syncTeamStripeSubscription(command)).resolves.toBe("stale");
    mocks.rpc.mockResolvedValueOnce({ data: "reconciliation_required", error: null });
    await expect(syncTeamStripeSubscription(command)).resolves.toBe("reconciliation_required");
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
