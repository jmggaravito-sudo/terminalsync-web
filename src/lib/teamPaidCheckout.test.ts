import { describe, expect, it } from "vitest";
import {
  TEAM_PRICE_CENTS,
  configuredTeamCheckoutTerms,
  isConfiguredTeamStripePrice,
  isResumableTeamCheckoutSession,
  metadataForTeamCheckoutIntent,
  parseTeamCheckoutIntent,
  parseTeamPaidCheckoutRequest,
} from "./teamPaidCheckout";

const terms = { configuredPriceId: "price_team123", mode: "subscription" as const, livemode: false };
const intent = {
  id: "11111111-1111-4111-8111-111111111111",
  owner_user_id: "22222222-2222-4222-8222-222222222222",
  request_id: "33333333-3333-4333-8333-333333333333",
  stripe_price_id: "price_team123",
  seats: 64,
  mode: "subscription",
  idempotency_key: "team-checkout:44444444-4444-4444-8444-444444444444",
  state: "checkout_created",
  stripe_session_id: "cs_team_1",
};

describe("Team paid checkout source contract", () => {
  it("accepts only request id, 1-64 seats, and a supported language", () => {
    expect(parseTeamPaidCheckoutRequest({ requestId: intent.request_id, seats: 1 })).toEqual({
      requestId: intent.request_id, seats: 1, lang: "es",
    });
    expect(parseTeamPaidCheckoutRequest({ requestId: intent.request_id, seats: 64, lang: "en" })).toEqual({
      requestId: intent.request_id, seats: 64, lang: "en",
    });
  });

  it.each([
    {},
    { requestId: "not-a-uuid", seats: 1 },
    { requestId: intent.request_id, seats: 0 },
    { requestId: intent.request_id, seats: 65 },
    { requestId: intent.request_id, seats: 1.5 },
    { requestId: intent.request_id, seats: 1, lang: "pt" },
    { requestId: intent.request_id, seats: 1, userId: "attacker" },
    { requestId: intent.request_id, seats: 1, supabaseUserId: intent.owner_user_id },
  ])("rejects untrusted or malformed request fields: %o", (body) => {
    expect(() => parseTeamPaidCheckoutRequest(body)).toThrow();
  });

  it("uses separate live/test Team Price variables and fails closed for unknown key modes", () => {
    expect(configuredTeamCheckoutTerms({
      STRIPE_SECRET_KEY: "sk_test_example",
      STRIPE_PRICE_TEAM_TEST: "price_test123",
      STRIPE_PRICE_TEAM: "price_live123",
    })).toEqual({ configuredPriceId: "price_test123", mode: "subscription", livemode: false });
    expect(configuredTeamCheckoutTerms({
      STRIPE_SECRET_KEY: "sk_live_example",
      STRIPE_PRICE_TEAM: "price_live123",
      STRIPE_PRICE_TEAM_TEST: "price_test123",
    })).toEqual({ configuredPriceId: "price_live123", mode: "subscription", livemode: true });
    expect(configuredTeamCheckoutTerms({ STRIPE_SECRET_KEY: "rk_live_example", STRIPE_PRICE_TEAM: "price_live123" })).toBeNull();
    expect(configuredTeamCheckoutTerms({ STRIPE_SECRET_KEY: "sk_test_example", STRIPE_PRICE_TEAM_TEST: "bad price" })).toBeNull();
  });

  it("requires an active matching $59 USD monthly Price in the matching Stripe mode", () => {
    const price = {
      id: terms.configuredPriceId,
      active: true,
      livemode: false,
      currency: "usd",
      unit_amount: TEAM_PRICE_CENTS,
      recurring: { interval: "month", interval_count: 1 },
    };
    expect(isConfiguredTeamStripePrice(price, terms)).toBe(true);
    for (const changed of [
      { unit_amount: 5901 },
      { currency: "cop" },
      { recurring: { interval: "year", interval_count: 1 } },
      { recurring: { interval: "month", interval_count: 2 } },
      { livemode: true },
      { active: false },
      { deleted: true },
    ]) {
      expect(isConfiguredTeamStripePrice({ ...price, ...changed }, terms)).toBe(false);
    }
  });

  it("allows resumption only for the exact, bound, open session metadata", () => {
    const parsed = parseTeamCheckoutIntent(intent, terms);
    const metadata = metadataForTeamCheckoutIntent(parsed, terms);
    const session = {
      id: "cs_team_1",
      url: "https://checkout.stripe.test/c/pay/cs_team_1",
      mode: "subscription",
      status: "open",
      livemode: false,
      metadata,
    };
    expect(isResumableTeamCheckoutSession(session, parsed, terms, metadata)).toBe(true);
    expect(isResumableTeamCheckoutSession({ ...session, id: "cs_other" }, parsed, terms, metadata)).toBe(false);
    expect(isResumableTeamCheckoutSession({ ...session, status: "complete" }, parsed, terms, metadata)).toBe(false);
    expect(isResumableTeamCheckoutSession({ ...session, metadata: { ...metadata, team_checkout_seats: "1" } }, parsed, terms, metadata)).toBe(false);
  });
});
