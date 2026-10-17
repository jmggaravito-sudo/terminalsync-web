import { describe, expect, it } from "vitest";
import type { TeamCheckoutIntentIdentity } from "./teamCheckoutMetadata";
import { buildTeamCheckoutWebhookCommand, type TeamCheckoutWebhookEventProjection } from "./teamCheckoutWebhookCommand";

const intent: TeamCheckoutIntentIdentity = {
  id: "7ef76c9c-0f81-4aef-9d41-9ed8df241bd7", owner_user_id: "2ef76c9c-0f81-4aef-9d41-9ed8df241bd7",
  request_id: "3ef76c9c-0f81-4aef-9d41-9ed8df241bd7", stripe_price_id: "price_Team59Monthly", seats: 8,
  mode: "subscription", idempotency_key: "team-checkout:4ef76c9c-0f81-4aef-9d41-9ed8df241bd7",
  stripe_session_id: "cs_live_Session123",
};
const terms = { configuredPriceId: intent.stripe_price_id, mode: "subscription" as const };
const metadata = {
  plan: "team", source: "terminalsync_team", team_billing_version: "1", supabase_user_id: intent.owner_user_id,
  team_seat_count: "8", team_checkout_intent_id: intent.id, team_checkout_owner_user_id: intent.owner_user_id,
  team_checkout_request_id: intent.request_id, team_checkout_price_id: intent.stripe_price_id,
  team_checkout_seats: "8", team_checkout_mode: "subscription", team_checkout_idempotency_key: intent.idempotency_key,
};
function event(overrides: Partial<TeamCheckoutWebhookEventProjection> = {}): TeamCheckoutWebhookEventProjection {
  return {
    eventId: "evt_checkout_123", eventType: "checkout.session.async_payment_succeeded",
    eventCreatedAt: "2026-10-17T12:00:00.000Z", livemode: true,
    session: { id: "cs_live_Session123", mode: "subscription", status: "complete", paymentStatus: "paid",
      livemode: true, customerId: "cus_LiveCustomer123", subscriptionId: "sub_LiveSubscription123", metadata },
    ...overrides,
  };
}

describe("Team checkout webhook command builder", () => {
  it("keeps async success pending and does not emit a billing/finalize command", () => {
    const command = buildTeamCheckoutWebhookCommand(event(), intent, terms);
    expect(command).toEqual({ kind: "mark_session_pending", rpc: "mark_team_checkout_session_pending",
      args: { p_intent_id: intent.id, p_stripe_session_id: "cs_live_Session123" } });
    expect(JSON.stringify(command)).not.toContain("apply_team_checkout_billing_and_finalize");
  });

  it.each([
    ["completed", "checkout.session.completed", "complete", "paid", "mark_session_pending", "mark_team_checkout_session_pending"],
    ["async succeeded", "checkout.session.async_payment_succeeded", "complete", "paid", "mark_session_pending", "mark_team_checkout_session_pending"],
    ["expired", "checkout.session.expired", "expired", "unpaid", "release_expired_session", "release_team_checkout_expired_session"],
    ["async failed", "checkout.session.async_payment_failed", "complete", "unpaid", "mark_async_failed", "mark_team_checkout_async_failed"],
  ] as const)("returns the safe marker for %s", (_label, eventType, status, paymentStatus, kind, rpc) => {
    const command = buildTeamCheckoutWebhookCommand(event({ eventType, session: { ...event().session, status, paymentStatus } }), intent, terms);
    expect(command).toEqual({ kind, rpc, args: { p_intent_id: intent.id, p_stripe_session_id: "cs_live_Session123" } });
  });

  it("is independent of metadata key ordering and replay-stable", () => {
    const first = buildTeamCheckoutWebhookCommand(event(), intent, terms);
    const reordered = buildTeamCheckoutWebhookCommand(event({
      session: { ...event().session, metadata: Object.fromEntries(Object.entries(metadata).reverse()) },
    }), { ...intent }, { ...terms });
    expect(reordered).toEqual(first);
  });

  it.each([
    ["owner", { session: { ...event().session, metadata: { ...metadata, team_checkout_owner_user_id: "wrong" } } }],
    ["price", { session: { ...event().session, metadata: { ...metadata, team_checkout_price_id: "price_wrong" } } }],
    ["seat", { session: { ...event().session, metadata: { ...metadata, team_checkout_seats: "9" } } }],
    ["mode", { session: { ...event().session, mode: "payment" } }],
    ["intent", { session: { ...event().session, metadata: { ...metadata, team_checkout_intent_id: "wrong" } } }],
    ["session", { session: { ...event().session, id: "cs_live_other" } }],
    ["customer", { session: { ...event().session, customerId: "invalid" } }],
    ["subscription", { session: { ...event().session, subscriptionId: "invalid" } }],
    ["status", { session: { ...event().session, paymentStatus: "processing" } }],
    ["timestamp", { eventCreatedAt: "not-a-time" }],
    ["mode binding", { livemode: false }],
  ])("rejects %s mismatch", (_label, overrides) => {
    expect(() => buildTeamCheckoutWebhookCommand(event(overrides), intent, terms)).toThrow();
  });

  it("rejects a forged intent session binding and invalid configured terms", () => {
    expect(() => buildTeamCheckoutWebhookCommand(event(), { ...intent, stripe_session_id: "cs_other" }, terms)).toThrow(/session/);
    expect(() => buildTeamCheckoutWebhookCommand(event(), intent, { ...terms, configuredPriceId: "price_other" })).toThrow(/terms/);
  });
});
