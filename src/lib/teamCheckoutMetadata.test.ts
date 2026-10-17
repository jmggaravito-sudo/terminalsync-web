import { describe, expect, it } from "vitest";
import {
  buildTeamCheckoutMetadata,
  buildVerifiedTeamCheckoutLedgerMetadata,
  type TeamCheckoutIntentIdentity,
} from "./teamCheckoutMetadata";

const intent: TeamCheckoutIntentIdentity = {
  id: "7ef76c9c-0f81-4aef-9d41-9ed8df241bd7",
  owner_user_id: "2ef76c9c-0f81-4aef-9d41-9ed8df241bd7",
  request_id: "3ef76c9c-0f81-4aef-9d41-9ed8df241bd7",
  stripe_price_id: "price_Team59Monthly",
  seats: 8,
  mode: "subscription",
  idempotency_key: "team-checkout:4ef76c9c-0f81-4aef-9d41-9ed8df241bd7",
};
const terms = { configuredPriceId: "price_Team59Monthly", mode: "subscription" as const };

describe("Team checkout metadata contract", () => {
  it("builds pre-create Session/Subscription metadata only from trusted intent terms", () => {
    const metadata = buildTeamCheckoutMetadata(intent, terms);
    expect(metadata).toMatchObject({
      plan: "team",
      source: "terminalsync_team",
      team_billing_version: "1",
      supabase_user_id: intent.owner_user_id,
      team_seat_count: "8",
      team_checkout_intent_id: intent.id,
      team_checkout_idempotency_key: intent.idempotency_key,
    });
    expect(metadata).not.toHaveProperty("team_checkout_session_id");
    expect(metadata).not.toHaveProperty("team_checkout_customer_id");
    expect(metadata).not.toHaveProperty("team_checkout_subscription_id");
    expect(metadata).not.toHaveProperty("email");
  });

  it("returns the exact migration 0051 enrichment envelope from a trusted intent and verified IDs", () => {
    const metadata = buildVerifiedTeamCheckoutLedgerMetadata(intent, terms, {
      sessionId: "cs_live_Session123",
      customerId: "cus_LiveCustomer123",
      subscriptionId: "sub_LiveSubscription123",
    });
    expect(Object.keys(metadata).sort()).toEqual([
      "team_checkout_customer_id", "team_checkout_idempotency_key", "team_checkout_intent_id",
      "team_checkout_mode", "team_checkout_owner_user_id", "team_checkout_price_id",
      "team_checkout_request_id", "team_checkout_seats", "team_checkout_session_id",
      "team_checkout_subscription_id",
    ].sort());
    expect(metadata.team_checkout_session_id).toBe("cs_live_Session123");
    expect(metadata.team_checkout_customer_id).toBe("cus_LiveCustomer123");
    expect(metadata.team_checkout_subscription_id).toBe("sub_LiveSubscription123");
  });

  it("rejects malformed identity, configured-term mismatches, and mismatched bound sessions", () => {
    expect(() => buildTeamCheckoutMetadata({ ...intent, owner_user_id: "not-a-uuid" }, terms)).toThrow(/owner ID/);
    expect(() => buildTeamCheckoutMetadata(intent, { ...terms, configuredPriceId: "price_other" })).toThrow(/price/);
    expect(() => buildTeamCheckoutMetadata({ ...intent, seats: Number.MAX_SAFE_INTEGER + 1 }, terms)).toThrow(/seat/);
    expect(() => buildTeamCheckoutMetadata({ ...intent, mode: "payment" }, terms)).toThrow(/mode/);
    expect(() => buildVerifiedTeamCheckoutLedgerMetadata(intent, terms, {
      sessionId: "cs_live_Session123", customerId: "cus_LiveCustomer123", subscriptionId: "sub_LiveSubscription123",
    })).not.toThrow();
    expect(() => buildVerifiedTeamCheckoutLedgerMetadata(intent, terms, {
      sessionId: "cs_bad!", customerId: "cus_LiveCustomer123", subscriptionId: "sub_LiveSubscription123",
    })).toThrow(/session ID/);
    expect(() => buildVerifiedTeamCheckoutLedgerMetadata({ ...intent, stripe_session_id: "cs_live_Other" }, terms, {
      sessionId: "cs_live_Session123", customerId: "cus_LiveCustomer123", subscriptionId: "sub_LiveSubscription123",
    })).toThrow(/session/);
  });
});
