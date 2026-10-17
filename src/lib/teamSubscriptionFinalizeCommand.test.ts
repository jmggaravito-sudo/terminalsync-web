import { describe, expect, it } from "vitest";
import type { TeamCheckoutMetadata } from "./teamCheckoutMetadata";
import {
  buildTeamSubscriptionFinalizeCommand,
  type TeamFinalizeIntent,
  type TeamSubscriptionLifecycleProjection,
  type VerifiedTeamCheckoutSession,
} from "./teamSubscriptionFinalizeCommand";

const intent: TeamFinalizeIntent = {
  id: "7ef76c9c-0f81-4aef-9d41-9ed8df241bd7", owner_user_id: "2ef76c9c-0f81-4aef-9d41-9ed8df241bd7",
  request_id: "3ef76c9c-0f81-4aef-9d41-9ed8df241bd7", stripe_price_id: "price_Team59Monthly", seats: 8,
  mode: "subscription", idempotency_key: "team-checkout:4ef76c9c-0f81-4aef-9d41-9ed8df241bd7",
  stripe_session_id: "cs_live_Session123", state: "checkout_created",
};
const terms = { configuredPriceId: intent.stripe_price_id, mode: "subscription" as const };
const preMetadata = {
  plan: "team", source: "terminalsync_team", team_billing_version: "1", supabase_user_id: intent.owner_user_id,
  team_seat_count: "8", team_checkout_intent_id: intent.id, team_checkout_owner_user_id: intent.owner_user_id,
  team_checkout_request_id: intent.request_id, team_checkout_price_id: intent.stripe_price_id,
  team_checkout_seats: "8", team_checkout_mode: "subscription", team_checkout_idempotency_key: intent.idempotency_key,
};
const session: VerifiedTeamCheckoutSession = {
  id: "cs_live_Session123", mode: "subscription", status: "complete", paymentStatus: "paid", livemode: true,
  customerId: "cus_LiveCustomer123", subscriptionId: "sub_LiveSubscription123", metadata: preMetadata,
};
function event(overrides: Partial<TeamSubscriptionLifecycleProjection> = {}): TeamSubscriptionLifecycleProjection {
  return {
    eventId: "evt_subscription_123", eventType: "customer.subscription.created",
    eventCreatedAt: "2026-10-17T12:00:00.000Z", livemode: true,
    subscription: {
      id: "sub_LiveSubscription123", livemode: true, customerId: "cus_LiveCustomer123", status: "active",
      priceId: "price_Team59Monthly", quantity: 8, currentPeriodStart: "2026-10-17T12:00:00.000Z",
      currentPeriodEnd: "2026-11-17T12:00:00.000Z", cancelAtPeriodEnd: false, metadata: preMetadata,
    },
    ...overrides,
  };
}

describe("Team subscription finalize command builder", () => {
  it.each(["customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted"] as const)("builds migration 0051 arguments for %s", (eventType) => {
    const cmd = buildTeamSubscriptionFinalizeCommand(event({ eventType }), intent, session, terms);
    expect(cmd.kind).toBe("apply_team_checkout_billing_and_finalize");
    expect(cmd.rpc).toBe("apply_team_checkout_billing_and_finalize");
    expect(Object.keys(cmd.args).sort()).toEqual([
      "p_intent_id", "p_stripe_session_id", "p_user_id", "p_stripe_customer_id", "p_stripe_subscription_id",
      "p_stripe_price_id", "p_seat_count", "p_status", "p_current_period_start", "p_current_period_end",
      "p_cancel_at_period_end", "p_event_id", "p_event_type", "p_event_created_at", "p_metadata",
    ].sort());
    expect(cmd.args.p_metadata).toEqual({
      team_checkout_intent_id: intent.id, team_checkout_session_id: session.id,
      team_checkout_owner_user_id: intent.owner_user_id, team_checkout_request_id: intent.request_id,
      team_checkout_price_id: intent.stripe_price_id, team_checkout_seats: "8", team_checkout_mode: "subscription",
      team_checkout_idempotency_key: intent.idempotency_key, team_checkout_customer_id: session.customerId!,
      team_checkout_subscription_id: session.subscriptionId!,
    } satisfies TeamCheckoutMetadata);
    expect(JSON.stringify(cmd)).not.toContain("raw");
  });

  it("supports subscription-before-checkout only with verified session and an eligible ambiguous intent", () => {
    const ambiguous = { ...intent, state: "ambiguous" as const, stripe_session_id: null };
    expect(buildTeamSubscriptionFinalizeCommand(event(), ambiguous, session, terms).args.p_stripe_session_id).toBe(session.id);
    expect(() => buildTeamSubscriptionFinalizeCommand(event(), { ...ambiguous, state: "reserved" }, session, terms)).toThrow(/eligible/);
  });

  it("is replay stable and permits only exact already-completed bindings", () => {
    const first = buildTeamSubscriptionFinalizeCommand(event(), intent, session, terms);
    const replay = buildTeamSubscriptionFinalizeCommand(event(), { ...intent }, { ...session }, { ...terms });
    expect(replay).toEqual(first);
    expect(buildTeamSubscriptionFinalizeCommand(event({ eventType: "customer.subscription.updated" }),
      { ...intent, state: "completed", stripe_subscription_id: session.subscriptionId }, session, terms).args.p_stripe_subscription_id).toBe(session.subscriptionId);
  });

  it.each([
    ["event type", () => event({ eventType: "checkout.session.completed" as never })],
    ["event timestamp", () => event({ eventCreatedAt: "not-a-date" })],
    ["event livemode", () => event({ livemode: false })],
    ["metadata binding", () => event({ subscription: { ...event().subscription, metadata: { ...preMetadata, team_checkout_intent_id: "wrong" } } })],
    ["price", () => event({ subscription: { ...event().subscription, priceId: "price_wrong" } })],
    ["seats", () => event({ subscription: { ...event().subscription, quantity: 9 } })],
    ["status", () => event({ subscription: { ...event().subscription, status: "future_status" } })],
    ["period", () => event({ subscription: { ...event().subscription, currentPeriodEnd: "2026-10-01T00:00:00.000Z" } })],
    ["session id", () => event()],
  ])("fails closed for %s mismatch", (_label, makeEvent) => {
    const alteredSession = _label === "session id" ? { ...session, id: "cs_wrong" } : session;
    expect(() => buildTeamSubscriptionFinalizeCommand(makeEvent(), intent, alteredSession, terms)).toThrow();
  });

  it.each([
    ["session intent metadata", { ...session, metadata: { ...preMetadata, team_checkout_owner_user_id: "wrong" } }],
    ["session/subscription identity", { ...session, subscriptionId: "sub_other" }],
    ["payment state", { ...session, paymentStatus: "processing" }],
    ["mode", { ...session, mode: "payment" }],
    ["livemode", { ...session, livemode: false }],
  ])("rejects %s mismatch", (_label, changed) => {
    expect(() => buildTeamSubscriptionFinalizeCommand(event(), intent, changed, terms)).toThrow();
  });

  it("rejects completed-intent rebinding and configuration mismatch", () => {
    expect(() => buildTeamSubscriptionFinalizeCommand(event(), { ...intent, state: "completed", stripe_subscription_id: "sub_other" }, session, terms)).toThrow(/identity/);
    expect(() => buildTeamSubscriptionFinalizeCommand(event(), intent, session, { ...terms, configuredPriceId: "price_other" })).toThrow(/configured/);
  });
});
